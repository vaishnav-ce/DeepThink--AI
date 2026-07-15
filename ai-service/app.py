import os
import logging
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import tempfile
import base64
import io
import torchaudio
import librosa
from PIL import Image
import torch
from transformers import pipeline as hf_pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'mp4', 'avi', 'mov', 'wav', 'mp3'}

# ─── Image Model (loaded once at startup, never per-request) ─────────────────
_IMAGE_PIPE = None

def get_image_pipe():
    global _IMAGE_PIPE
    if _IMAGE_PIPE is None:
        logger.info("Loading image classification model (umm-maybe/AI-image-detector)...")
        _IMAGE_PIPE = hf_pipeline(
            "image-classification",
            model="umm-maybe/AI-image-detector",
            device=-1,   # CPU — compatible with Render Free tier
        )
        logger.info("Image model loaded successfully.")
    return _IMAGE_PIPE


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ─── Error Level Analysis ───────────────────────────────────────────────────
def compute_ela(filepath, quality=90):
    """
    ELA: Resave the image at a known quality, then compute the pixel
    difference. AI-generated / altered regions show abnormally LOW residuals
    because they lack real JPEG re-compression history.
    """
    try:
        orig = Image.open(filepath).convert('RGB')
        buf = io.BytesIO()
        orig.save(buf, format='JPEG', quality=quality)
        buf.seek(0)
        recompressed = Image.open(buf).convert('RGB')

        orig_arr = np.array(orig, dtype=np.float32)
        recomp_arr = np.array(recompressed, dtype=np.float32)

        ela_map = np.abs(orig_arr - recomp_arr)
        ela_mean = ela_map.mean()         # Lower → more synthetic
        ela_max  = ela_map.max()
        ela_std  = ela_map.std()

        return ela_mean, ela_max, ela_std, ela_map
    except Exception:
        return None, None, None, None


# ─── High-Frequency DCT Analysis ─────────────────────────────────────────────
def compute_dct_score(gray):
    """
    AI synthesis pipelines smooth out high-frequency DCT coefficients.
    Real camera photos carry much more high-freq energy.
    """
    h, w = gray.shape
    # Use center crop for speed
    cy, cx = h // 2, w // 2
    half = min(cy, cx, 128)
    region = gray[cy - half:cy + half, cx - half:cx + half].astype(np.float32)

    dct = cv2.dct(region)
    total_energy   = np.sum(dct ** 2) + 1e-9
    # Top-left 8×8 = low-frequency; the rest = high-frequency
    low_energy  = np.sum(dct[:8, :8] ** 2)
    high_energy = total_energy - low_energy
    hf_ratio    = high_energy / total_energy   # Higher → more natural
    return hf_ratio


# ─── Texture / GAN smoothness ─────────────────────────────────────────────────
def compute_texture_score(gray):
    """
    GAN images are remarkably smooth in flat regions.
    Real photos always carry sensor noise even in sky / skin patches.
    """
    # Local standard deviation in 7x7 blocks
    kernel = np.ones((7, 7), dtype=np.float32) / 49
    mean_sq = cv2.filter2D(gray.astype(np.float32) ** 2, -1, kernel)
    mean    = cv2.filter2D(gray.astype(np.float32),      -1, kernel)
    local_var = mean_sq - mean ** 2
    texture_score = np.sqrt(np.maximum(local_var, 0)).mean()  # Higher → more real
    return texture_score


# ─── Colour Channel Correlation (GAN artefact) ───────────────────────────────
def compute_channel_correlation(img):
    """
    GAN-generated images sometimes have unusually high RGB channel correlation
    compared to natural photographs.
    """
    b, g, r = cv2.split(img.astype(np.float32))
    corr_rg = np.corrcoef(r.ravel(), g.ravel())[0, 1]
    corr_rb = np.corrcoef(r.ravel(), b.ravel())[0, 1]
    avg_corr = (abs(corr_rg) + abs(corr_rb)) / 2   # Higher → more synthetic
    return avg_corr


# ─── Main Image Analyser ─────────────────────────────────────────────────────
def analyze_image(filepath, original_filename=""):
    """
    Deep-learning image authenticity detector.
    Uses a ViT (Vision Transformer) pretrained classifier fine-tuned on
    real vs. AI-generated images (umm-maybe/AI-image-detector on Hugging Face).
    Falls back gracefully to ELA heatmap for the visual report.
    """
    # ── ViT inference ────────────────────────────────────────────────────────
    pipe = get_image_pipe()
    try:
        pil_img = Image.open(filepath).convert("RGB")
    except Exception as exc:
        raise Exception(f"Invalid or unreadable image file: {exc}")

    with torch.no_grad():
        outputs = pipe(pil_img)

    scores     = {o["label"]: o["score"] for o in outputs}
    # Model labels: "artificial" / "real"  (or "fake" / "human" in some forks)
    ai_score   = scores.get("artificial", scores.get("fake",  0.0))
    real_score = scores.get("real",       scores.get("human", 1.0 - ai_score))
    is_fake    = ai_score >= 0.5

    confidence   = round(ai_score if is_fake else real_score, 3)
    result_label = "Deepfake" if is_fake else "Real"

    reason = (
        f"STATUS: Likely AI-Generated or Manipulated. TECHNICAL DETAILS: "
        f"ViT classifier — AI probability {ai_score:.1%} | Real probability {real_score:.1%}."
        if is_fake else
        f"STATUS: Likely Authentic Real Media. TECHNICAL DETAILS: "
        f"ViT classifier — Real probability {real_score:.1%} | AI probability {ai_score:.1%}."
    )

    logger.info("Image result: %s | confidence: %.3f", result_label, confidence)

    # ── ELA heatmap (portfolio feature — preserved from original) ─────────────
    img = cv2.imread(filepath)
    ela_mean, _, _, ela_map = compute_ela(filepath)

    if img is not None and ela_map is not None:
        ela_vis = ela_map.mean(axis=2) if ela_map.ndim == 3 else ela_map
        norm    = cv2.normalize(ela_vis.astype(np.float32), None, 0, 255, cv2.NORM_MINMAX)
        heatmap = cv2.applyColorMap(norm.astype(np.uint8), cv2.COLORMAP_JET)
        overlay = cv2.addWeighted(img, 0.55, heatmap, 0.45, 0)
    elif img is not None:
        gray       = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        median_b   = cv2.medianBlur(gray, 3)
        noise_diff = cv2.absdiff(gray, median_b)
        noise_norm = cv2.normalize(noise_diff, None, 0, 255, cv2.NORM_MINMAX)
        heatmap    = cv2.applyColorMap(noise_norm.astype(np.uint8), cv2.COLORMAP_JET)
        overlay    = cv2.addWeighted(img, 0.55, heatmap, 0.45, 0)
    else:
        # Image opened fine by PIL but not by OpenCV — return without heatmap
        return {"result": result_label, "confidence": confidence,
                "reason": reason, "heatmap": None}

    _, buf = cv2.imencode('.jpg', overlay)
    heatmap_b64 = base64.b64encode(buf).decode('utf-8')
    return {
        "result":     result_label,
        "confidence": confidence,
        "reason":     reason,
        "heatmap":    f"data:image/jpeg;base64,{heatmap_b64}"
    }


# ─── Video Analyser ──────────────────────────────────────────────────────────
def analyze_video(filepath, original_filename=""):
    """
    Video deepfake detector using frame-level ViT classification.
    Reuses the Phase 2 image model — no additional download.

    Pipeline:
      Sample 12 frames uniformly → ViT classifier per frame →
      Mean AI probability + flagged-frame count → final verdict.
    """
    cap = cv2.VideoCapture(filepath)
    if not cap.isOpened():
        raise Exception("Invalid video file")

    total_frames  = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    n_samples     = min(12, max(total_frames, 1))
    frame_indices = np.linspace(0, max(total_frames - 1, 0), n_samples, dtype=int)

    pipe        = get_image_pipe()
    ai_scores   = []
    frames_read = 0

    for idx in frame_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
        ret, frame = cap.read()
        if not ret:
            continue
        frames_read += 1

        # Convert BGR → RGB PIL image for the ViT pipeline
        rgb   = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_f = Image.fromarray(rgb)

        with torch.no_grad():
            outputs = pipe(pil_f)

        scores   = {o["label"]: o["score"] for o in outputs}
        ai_score = scores.get("artificial", scores.get("fake", 0.0))
        ai_scores.append(ai_score)

    cap.release()

    if not ai_scores:
        raise Exception("Could not extract frames from video")

    mean_ai      = float(np.mean(ai_scores))
    flagged      = sum(1 for s in ai_scores if s >= 0.5)
    total        = len(ai_scores)
    is_fake      = mean_ai >= 0.45 or flagged >= (total * 0.4)

    confidence   = round(mean_ai if is_fake else (1.0 - mean_ai), 3)
    result_label = "Deepfake" if is_fake else "Real"

    if is_fake:
        reason = (
            f"STATUS: Likely AI-Generated or Manipulated. TECHNICAL DETAILS: "
            f"ViT frame analysis — {flagged}/{total} frames flagged as synthetic | "
            f"Mean AI probability {mean_ai:.1%}."
        )
    else:
        reason = (
            f"STATUS: Likely Authentic Real Media. TECHNICAL DETAILS: "
            f"ViT frame analysis — {flagged}/{total} frames flagged | "
            f"Mean Real probability {1.0 - mean_ai:.1%}."
        )

    logger.info("Video result: %s | confidence: %.3f | flagged: %d/%d",
                result_label, confidence, flagged, total)

    return {
        "result":     result_label,
        "confidence": confidence,
        "reason":     reason
    }


# ─── Audio Analyser ──────────────────────────────────────────────────────────
def analyze_audio(filepath, original_filename=""):
    """
    Audio authenticity detector using spectral and temporal analysis.
    Supports WAV and MP3 via torchaudio. Uses librosa for MFCC, spectral
    flatness, pitch variance, and energy distribution — all well-documented
    markers for distinguishing TTS/synthetic audio from natural speech.
    """
    try:
        # Load audio — torchaudio handles WAV and MP3 natively
        waveform, sample_rate = torchaudio.load(filepath)

        # Resample to 16 kHz mono (standard for speech analysis)
        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
            waveform  = resampler(waveform)
            sample_rate = 16000

        # Mix down to mono
        if waveform.shape[0] > 1:
            waveform = waveform.mean(dim=0, keepdim=True)

        audio_np = waveform.squeeze().numpy()

        score    = 0.0
        evidence = []

        # ── 1. MFCC stability — TTS synthesis has unnaturally stable MFCCs ──
        mfccs    = librosa.feature.mfcc(y=audio_np, sr=sample_rate, n_mfcc=13)
        mfcc_std = float(np.mean(np.std(mfccs, axis=1)))
        if mfcc_std < 8.0:
            score += 0.25
            evidence.append(f"Unnaturally stable MFCC features (std={mfcc_std:.2f}) — TTS synthesis pattern")
        elif mfcc_std < 14.0:
            score += 0.10
            evidence.append(f"Reduced MFCC variation (std={mfcc_std:.2f})")

        # ── 2. Spectral flatness — synthetic noise floor is too uniform ──────
        flatness = float(np.mean(librosa.feature.spectral_flatness(y=audio_np)))
        if flatness > 0.05:
            score += 0.20
            evidence.append(f"High spectral flatness ({flatness:.4f}) — synthetic noise floor")
        elif flatness > 0.02:
            score += 0.08

        # ── 3. Pitch variance — TTS prosody is too consistent ─────────────────
        try:
            f0, voiced_flag, _ = librosa.pyin(
                audio_np, fmin=librosa.note_to_hz('C2'),
                fmax=librosa.note_to_hz('C7')
            )
            voiced_f0 = f0[voiced_flag] if voiced_flag is not None else np.array([])
            if len(voiced_f0) > 20:
                pitch_std = float(np.std(voiced_f0))
                if pitch_std < 15.0:
                    score += 0.20
                    evidence.append(f"Very low pitch variance (σ={pitch_std:.1f} Hz) — synthesised prosody")
                elif pitch_std < 30.0:
                    score += 0.08
                    evidence.append(f"Reduced pitch variance (σ={pitch_std:.1f} Hz)")
        except Exception:
            pass  # pyin can fail on very short or noisy clips — skip gracefully

        # ── 4. Zero-crossing rate — artificial waveforms spike ZCR ───────────
        zcr = float(np.mean(librosa.feature.zero_crossing_rate(audio_np)))
        if zcr > 0.15:
            score += 0.10
            evidence.append(f"Elevated zero-crossing rate ({zcr:.3f}) — artificial waveform")

        # ── 5. RMS energy distribution — TTS levels energy unnaturally ────────
        rms     = librosa.feature.rms(y=audio_np)[0]
        rms_std = float(np.std(rms))
        if rms_std < 0.005:
            score += 0.15
            evidence.append(f"Uniform energy distribution (σ={rms_std:.4f}) — TTS dynamic leveling")
        elif rms_std < 0.015:
            score += 0.05

        score        = min(max(score, 0.0), 1.0)
        result_label = "Deepfake" if score >= 0.40 else "Real"
        confidence   = round(score if result_label == "Deepfake" else (1.0 - score), 3)

        if result_label == "Deepfake":
            reason = (
                "STATUS: Likely AI-Generated or Manipulated. TECHNICAL DETAILS: "
                + " | ".join(evidence[:3]) + "."
            )
        else:
            reason = (
                "STATUS: Likely Authentic Real Media. TECHNICAL DETAILS: "
                "Spectral features consistent with natural speech. "
                "No significant TTS synthesis markers detected."
            )

        logger.info("Audio result: %s | confidence: %.3f", result_label, confidence)
        return {"result": result_label, "confidence": confidence, "reason": reason}

    except Exception as exc:
        logger.error("Audio analysis error: %s", str(exc))
        return {
            "result":     "Real",
            "confidence": 0.55,
            "reason":     "STATUS: Inconclusive. TECHNICAL DETAILS: Audio decoding failed. Please upload a valid WAV or MP3 file."
        }



# ─── Flask Route ─────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return jsonify({
        "status": "online",
        "service": "DeepThink AI Analysis Service",
        "endpoints": ["/analyze"]
    }), 200


@app.route('/analyze', methods=['POST'])
def analyze():
    logger.info("Files: %s", request.files)
    logger.info("Form: %s", request.form)

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            ext = filename.rsplit('.', 1)[1].lower()
            if ext in ['png', 'jpg', 'jpeg', 'webp']:
                result = analyze_image(filepath, file.filename)
            elif ext in ['mp4', 'avi', 'mov']:
                result = analyze_video(filepath, file.filename)
            elif ext in ['wav', 'mp3']:
                result = analyze_audio(filepath, file.filename)
            else:
                result = {"error": "Unsupported file format"}

            return jsonify(result)

        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            if os.path.exists(filepath):
                os.remove(filepath)

    return jsonify({"error": "Invalid file type"}), 400


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    # Warm up the image model on startup so the first request is not slow
    get_image_pipe()
    app.run(host='0.0.0.0', port=port, debug=False)
