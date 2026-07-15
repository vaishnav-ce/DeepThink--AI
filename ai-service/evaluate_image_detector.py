import os
import sys
import glob
import argparse
import csv
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

# Add current directory to path to import app module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app import analyze_image

# Set stdout/stderr to UTF-8 encoding for Windows console compatibility
if sys.platform.startswith('win'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

SUPPORTED_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp')

def create_confusion_matrix_image(tp, fp, tn, fn, accuracy, precision, recall, f1, output_path):
    """
    Renders a high-resolution dark-themed Confusion Matrix PNG image
    using OpenCV and PIL (zero extra heavy dependencies required).
    """
    width, height = 700, 600
    # Background: dark sleek aesthetic (#0F172A)
    img_arr = np.zeros((height, width, 3), dtype=np.uint8)
    img_arr[:] = (15, 23, 42)  # BGR

    pil_img = Image.fromarray(cv2.cvtColor(img_arr, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_img)

    # Fonts (default fallback)
    try:
        title_font = ImageFont.truetype("arial.ttf", 22)
        label_font = ImageFont.truetype("arial.ttf", 16)
        stat_font  = ImageFont.truetype("arial.ttf", 14)
    except IOError:
        title_font = label_font = stat_font = ImageFont.load_default()

    # Draw Title
    draw.text((20, 20), "DEEPTHINK AI — Image Detector Confusion Matrix", fill=(0, 229, 255), font=title_font)

    # Matrix Grid Dimensions
    start_x, start_y = 150, 110
    cell_w, cell_h   = 220, 150

    # Labels
    draw.text((start_x + 60, start_y - 30), "Pred: REAL", fill=(200, 200, 200), font=label_font)
    draw.text((start_x + cell_w + 50, start_y - 30), "Pred: DEEPFAKE", fill=(200, 200, 200), font=label_font)
    
    draw.text((start_x - 120, start_y + 60), "Actual: REAL", fill=(200, 200, 200), font=label_font)
    draw.text((start_x - 135, start_y + cell_h + 60), "Actual: DEEPFAKE", fill=(200, 200, 200), font=label_font)

    # 4 Quadrants:
    # Top-Left: TN (Actual Real, Pred Real) - Authentic Green border/glow
    # Top-Right: FP (Actual Real, Pred Deepfake) - Error Red
    # Bottom-Left: FN (Actual Deepfake, Pred Real) - Warning Yellow
    # Bottom-Right: TP (Actual Deepfake, Pred Deepfake) - Authentic Cyan/Red

    matrix_data = [
        [("TN (True Negative)", tn, (34, 197, 94)),   ("FP (False Positive)", fp, (239, 68, 68))],
        [("FN (False Negative)", fn, (234, 179, 8)), ("TP (True Positive)",  tp, (6, 182, 212))]
    ]

    for row_idx in range(2):
        for col_idx in range(2):
            cell_label, count, color = matrix_data[row_idx][col_idx]
            x1 = start_x + col_idx * cell_w
            y1 = start_y + row_idx * cell_h
            x2 = x1 + cell_w - 10
            y2 = y1 + cell_h - 10

            # Cell box fill + border
            draw.rectangle([x1, y1, x2, y2], fill=(30, 41, 59), outline=color, width=2)
            draw.text((x1 + 15, y1 + 25), cell_label, fill=(180, 180, 180), font=stat_font)
            draw.text((x1 + 65, y1 + 65), str(count), fill=color, font=title_font)

    # Summary Performance Metrics Footer
    footer_y = start_y + 2 * cell_h + 30
    draw.rectangle([20, footer_y, width - 20, footer_y + 70], fill=(24, 32, 47), outline=(51, 65, 85), width=1)
    
    metrics_str = f"Accuracy: {accuracy:.1%}   |   Precision: {precision:.1%}   |   Recall: {recall:.1%}   |   F1-Score: {f1:.1%}"
    draw.text((35, footer_y + 25), metrics_str, fill=(0, 255, 200), font=label_font)

    # Save PNG
    out_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    cv2.imwrite(output_path, out_bgr)
    print(f"✅ Confusion matrix image saved to: {output_path}")


def evaluate(real_dir, ai_dir, output_csv, output_cm):
    """
    Runs evaluation over real/ and ai/ image directories.
    Computes Accuracy, Precision, Recall, F1-score, Confusion Matrix.
    Saves CSV report and Confusion Matrix visual image.
    """
    print("=" * 70)
    print(" 👁️ DEEPTHINK AI — Image Detector Benchmark Utility")
    print("=" * 70)

    # Verify or create default folders
    for folder in [real_dir, ai_dir]:
        if not os.path.exists(folder):
            os.makedirs(folder, exist_ok=True)

    real_images = [f for f in os.listdir(real_dir) if f.lower().endswith(SUPPORTED_EXTENSIONS)]
    ai_images   = [f for f in os.listdir(ai_dir) if f.lower().endswith(SUPPORTED_EXTENSIONS)]

    total_real = len(real_images)
    total_ai   = len(ai_images)
    total_imgs = total_real + total_ai

    if total_imgs == 0:
        print(f"⚠️  No images found in evaluation directories!")
        print(f"   • Real directory: {os.path.abspath(real_dir)} ({total_real} images)")
        print(f"   • AI directory:   {os.path.abspath(ai_dir)} ({total_ai} images)")
        print(f"\nPlease place test images in these folders and run the script again.\n")
        return

    print(f"\n📂 Dataset Breakdown:")
    print(f"   • Real Images (Ground Truth = Real):     {total_real}")
    print(f"   • AI Images   (Ground Truth = Deepfake): {total_ai}")
    print(f"   • Total Images to Evaluate:             {total_imgs}\n")

    results = []
    tp, fp, tn, fn = 0, 0, 0, 0

    print("🚀 Running Inference Pipeline...")
    print("-" * 70)

    # Process Real Images
    for filename in real_images:
        filepath = os.path.join(real_dir, filename)
        try:
            res = analyze_image(filepath, filename)
            pred = res.get("result", "Unknown")
            conf = res.get("confidence", 0.0)
            reason = res.get("reason", "")
            
            is_correct = (pred == "Real")
            if is_correct:
                tn += 1
            else:
                fp += 1

            results.append({
                "Filename": filename,
                "GroundTruth": "Real",
                "Prediction": pred,
                "Confidence": conf,
                "Status": "PASS" if is_correct else "FAIL",
                "Reason": reason
            })
            print(f"  [Real] {filename:<30} → Pred: {pred:<9} ({conf:.1%}) [{ '✓ PASS' if is_correct else '✗ FAIL' }]")
        except Exception as e:
            print(f"  [Real] {filename:<30} → ERROR: {e}")

    # Process AI Images
    for filename in ai_images:
        filepath = os.path.join(ai_dir, filename)
        try:
            res = analyze_image(filepath, filename)
            pred = res.get("result", "Unknown")
            conf = res.get("confidence", 0.0)
            reason = res.get("reason", "")

            is_correct = (pred == "Deepfake")
            if is_correct:
                tp += 1
            else:
                fn += 1

            results.append({
                "Filename": filename,
                "GroundTruth": "Deepfake",
                "Prediction": pred,
                "Confidence": conf,
                "Status": "PASS" if is_correct else "FAIL",
                "Reason": reason
            })
            print(f"  [AI]   {filename:<30} → Pred: {pred:<9} ({conf:.1%}) [{ '✓ PASS' if is_correct else '✗ FAIL' }]")
        except Exception as e:
            print(f"  [AI]   {filename:<30} → ERROR: {e}")

    # Compute Statistics
    processed_total = tp + fp + tn + fn
    accuracy  = (tp + tn) / processed_total if processed_total > 0 else 0.0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall    = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1        = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    print("-" * 70)
    print("\n📊 EVALUATION SUMMARY STATISTICS")
    print("=" * 70)
    print(f"  • Total Evaluated Images:  {processed_total}")
    print(f"  • True Positives (TP):     {tp}")
    print(f"  • True Negatives (TN):     {tn}")
    print(f"  • False Positives (FP):    {fp}")
    print(f"  • False Negatives (FN):    {fn}")
    print(f"  " + "-" * 40)
    print(f"  🎯 ACCURACY:               {accuracy:.2%}")
    print(f"  🎯 PRECISION:              {precision:.2%}")
    print(f"  🎯 RECALL:                 {recall:.2%}")
    print(f"  🎯 F1-SCORE:               {f1:.2%}")
    print("=" * 70)

    # Export CSV Report
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["Filename", "GroundTruth", "Prediction", "Confidence", "Status", "Reason"])
        writer.writeheader()
        writer.writerows(results)

        # Write summary block at bottom of CSV
        f.write("\n")
        f.write("METRIC,VALUE\n")
        f.write(f"Accuracy,{accuracy:.4f}\n")
        f.write(f"Precision,{precision:.4f}\n")
        f.write(f"Recall,{recall:.4f}\n")
        f.write(f"F1-Score,{f1:.4f}\n")
        f.write(f"True Positives,{tp}\n")
        f.write(f"True Negatives,{tn}\n")
        f.write(f"False Positives,{fp}\n")
        f.write(f"False Negatives,{fn}\n")

    print(f"\n✅ Evaluation report saved to: {os.path.abspath(output_csv)}")

    # Generate Confusion Matrix Image
    create_confusion_matrix_image(tp, fp, tn, fn, accuracy, precision, recall, f1, output_cm)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="DeepThink AI Image Detector Evaluation Script")
    parser.add_argument('--real_dir',   default='./data/real', help='Path to directory containing real authentic images')
    parser.add_argument('--ai_dir',     default='./data/ai',   help='Path to directory containing AI-generated images')
    parser.add_argument('--output_csv', default='evaluation_report.csv', help='Output CSV report path')
    parser.add_argument('--output_cm',  default='confusion_matrix.png',  help='Output confusion matrix PNG image path')

    args = parser.parse_args()
    evaluate(args.real_dir, args.ai_dir, args.output_csv, args.output_cm)
