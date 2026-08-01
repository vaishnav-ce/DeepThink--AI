import os
import csv
import torch
from PIL import Image
from transformers import pipeline as hf_pipeline

MODELS_TO_TEST = [
    "umm-maybe/AI-image-detector",
    "capcheck/ai-image-detection",
    "dima806/ai_vs_real_image_detection"
]

def normalize_label(label_str):
    label_str = label_str.lower()
    if any(word in label_str for word in ["real", "human", "authentic", "nature", "original"]):
        return "Real"
    return "Deepfake"

def evaluate_single_model(model_name, categories, base_dir):
    print(f"\nLoading model: {model_name}...")
    pipe = hf_pipeline("image-classification", model=model_name, device=-1)
    
    tp, tn, fp, fn = 0, 0, 0, 0
    total_images = 0
    
    for folder, actual_label in categories.items():
        folder_path = os.path.join(base_dir, folder)
        if not os.path.exists(folder_path):
            continue
            
        for filename in os.listdir(folder_path):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                filepath = os.path.join(folder_path, filename)
                try:
                    pil_img = Image.open(filepath).convert("RGB")
                    with torch.no_grad():
                        outputs = pipe(pil_img)
                    
                    # Get the top prediction
                    top_pred = max(outputs, key=lambda x: x['score'])
                    predicted_label = normalize_label(top_pred['label'])
                    
                    if actual_label == "Deepfake" and predicted_label == "Deepfake":
                        tp += 1
                    elif actual_label == "Real" and predicted_label == "Real":
                        tn += 1
                    elif actual_label == "Real" and predicted_label == "Deepfake":
                        fp += 1
                    elif actual_label == "Deepfake" and predicted_label == "Real":
                        fn += 1
                        
                    total_images += 1
                except Exception as e:
                    pass
                    
    correct_predictions = tp + tn
    accuracy = (correct_predictions / total_images * 100) if total_images > 0 else 0
    
    real_images_count = tn + fp
    ai_images_count = tp + fn
    
    real_accuracy = (tn / real_images_count * 100) if real_images_count > 0 else 0
    ai_accuracy = (tp / ai_images_count * 100) if ai_images_count > 0 else 0
    
    return {
        "Model": model_name,
        "Overall Accuracy": accuracy,
        "Real Accuracy": real_accuracy,
        "AI Accuracy": ai_accuracy,
        "TP": tp, "TN": tn, "FP": fp, "FN": fn
    }

def benchmark():
    base_dir = os.path.join(os.path.dirname(__file__), "..", "test-dataset")
    categories = {"real": "Real", "ai": "Deepfake"}
    
    results = []
    
    for model_name in MODELS_TO_TEST:
        try:
            metrics = evaluate_single_model(model_name, categories, base_dir)
            results.append(metrics)
        except Exception as e:
            print(f"Failed to evaluate {model_name}: {e}")
            
    if not results:
        print("No results generated.")
        return
        
    print("\n" + "="*95)
    print(f"{'Model':<40} | {'Overall':<7} | {'Real Acc':<8} | {'AI Acc':<7} | {'TP':<3} | {'TN':<3} | {'FP':<3} | {'FN':<3}")
    print("-" * 95)
    
    best_model = None
    best_acc = -1
    
    for r in results:
        if r["Overall Accuracy"] > best_acc:
            best_acc = r["Overall Accuracy"]
            best_model = r["Model"]
            
        print(f"{r['Model']:<40} | {r['Overall Accuracy']:>6.2f}% | {r['Real Accuracy']:>7.2f}% | {r['AI Accuracy']:>6.2f}% | {r['TP']:<3} | {r['TN']:<3} | {r['FP']:<3} | {r['FN']:<3}")
    print("="*95)
    
    print(f"\nRecommended Model: {best_model} with {best_acc:.2f}% overall accuracy.")

if __name__ == "__main__":
    benchmark()
