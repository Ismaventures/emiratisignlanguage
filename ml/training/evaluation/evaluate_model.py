# Model Evaluation Script
# Evaluates gesture and sequence models on test datasets

import json
import numpy as np
import torch
import onnxruntime as ort
from pathlib import Path
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)
import time
import argparse


class ModelEvaluator:
    """Evaluate gesture classification and sequence models."""
    
    def __init__(self, model_path: str, model_type: str = "onnx"):
        self.model_type = model_type
        self.model_path = Path(model_path)
        self.session = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        self.load_model()
    
    def load_model(self):
        """Load the model based on type."""
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model not found: {self.model_path}")
        
        if self.model_type == "onnx":
            self.session = ort.InferenceSession(str(self.model_path))
            self.input_name = self.session.get_inputs()[0].name
            print(f"Loaded ONNX model: {self.model_path}")
        elif self.model_type == "pytorch":
            self.model = torch.jit.load(str(self.model_path), map_location=self.device)
            self.model.eval()
            print(f"Loaded PyTorch model: {self.model_path}")
    
    def evaluate_gesture_model(
        self,
        test_data_path: str,
        batch_size: int = 32,
    ) -> dict:
        """Evaluate gesture classification model."""
        with open(test_data_path, "r") as f:
            data = json.load(f)
        
        landmarks = np.array(data["landmarks"], dtype=np.float32)
        labels = np.array(data["labels"], dtype=np.int64)
        
        print(f"Test samples: {len(landmarks)}")
        print(f"Feature dim: {landmarks.shape[1]}")
        print(f"Classes: {data['num_classes']}")
        
        predictions = []
        latencies = []
        
        # Batch inference
        for i in range(0, len(landmarks), batch_size):
            batch = landmarks[i:i + batch_size]
            
            if self.session:
                start = time.perf_counter()
                outputs = self.session.run(None, {self.input_name: batch})
                latencies.append(time.perf_counter() - start)
                
                batch_preds = np.argmax(outputs[0], axis=1)
            else:
                tensor = torch.FloatTensor(batch).to(self.device)
                start = time.perf_counter()
                with torch.no_grad():
                    outputs = self.model(tensor)
                latencies.append(time.perf_counter() - start)
                
                batch_preds = outputs.argmax(dim=1).cpu().numpy()
            
            predictions.extend(batch_preds.tolist())
        
        # Metrics
        accuracy = accuracy_score(labels, predictions)
        precision = precision_score(labels, predictions, average="weighted", zero_division=0)
        recall = recall_score(labels, predictions, average="weighted", zero_division=0)
        f1 = f1_score(labels, predictions, average="weighted", zero_division=0)
        
        avg_latency = np.mean(latencies) * 1000  # ms
        throughput = len(landmarks) / np.sum(latencies)
        
        results = {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "avg_latency_ms": float(avg_latency),
            "throughput_fps": float(throughput),
            "confusion_matrix": confusion_matrix(labels, predictions).tolist(),
            "classification_report": classification_report(
                labels, predictions,
                target_names=list(data.get("label_map", {}).values()),
                output_dict=True,
                zero_division=0,
            ),
        }
        
        print(f"\nAccuracy: {accuracy:.4f}")
        print(f"Precision: {precision:.4f}")
        print(f"Recall: {recall:.4f}")
        print(f"F1 Score: {f1:.4f}")
        print(f"Avg Latency: {avg_latency:.2f}ms")
        print(f"Throughput: {throughput:.1f} fps")
        
        return results
    
    def evaluate_latency_profile(
        self,
        test_data_path: str,
        num_warmup: int = 10,
        num_runs: int = 100,
    ) -> dict:
        """Detailed latency profiling."""
        with open(test_data_path, "r") as f:
            data = json.load(f)
        
        sample = np.array([data["landmarks"][0]], dtype=np.float32)
        
        # Warmup
        for _ in range(num_warmup):
            if self.session:
                self.session.run(None, {self.input_name: sample})
            else:
                with torch.no_grad():
                    self.model(torch.FloatTensor(sample).to(self.device))
        
        # Benchmark
        latencies = []
        for _ in range(num_runs):
            start = time.perf_counter()
            
            if self.session:
                self.session.run(None, {self.input_name: sample})
            else:
                with torch.no_grad():
                    self.model(torch.FloatTensor(sample).to(self.device))
            
            latencies.append((time.perf_counter() - start) * 1000)
        
        latencies_ms = np.array(latencies)
        
        results = {
            "mean_ms": float(latencies_ms.mean()),
            "median_ms": float(np.median(latencies_ms)),
            "std_ms": float(latencies_ms.std()),
            "p50_ms": float(np.percentile(latencies_ms, 50)),
            "p90_ms": float(np.percentile(latencies_ms, 90)),
            "p95_ms": float(np.percentile(latencies_ms, 95)),
            "p99_ms": float(np.percentile(latencies_ms, 99)),
            "min_ms": float(latencies_ms.min()),
            "max_ms": float(latencies_ms.max()),
        }
        
        print(f"\nLatency Profile ({num_runs} runs):")
        print(f"  Mean: {results['mean_ms']:.2f}ms")
        print(f"  P50:  {results['p50_ms']:.2f}ms")
        print(f"  P90:  {results['p90_ms']:.2f}ms")
        print(f"  P99:  {results['p99_ms']:.2f}ms")
        
        return results
    
    def compare_models(
        self,
        test_data_path: str,
        model_paths: list[str],
    ) -> dict:
        """Compare multiple models on the same test set."""
        results = {}
        
        for model_path in model_paths:
            print(f"\n{'='*50}")
            print(f"Evaluating: {model_path}")
            print('='*50)
            
            evaluator = ModelEvaluator(model_path)
            metrics = evaluator.evaluate_gesture_model(test_data_path)
            latency = evaluator.evaluate_latency_profile(test_data_path)
            
            results[Path(model_path).stem] = {
                "metrics": metrics,
                "latency": latency,
            }
        
        return results


def run_evaluation():
    """Run evaluation pipeline."""
    parser = argparse.ArgumentParser(description="Model evaluation")
    parser.add_argument("--model", type=str, required=True, help="Path to model file")
    parser.add_argument("--data", type=str, required=True, help="Path to test data (JSON)")
    parser.add_argument("--type", type=str, default="onnx", choices=["onnx", "pytorch"])
    parser.add_argument("--latency", action="store_true", help="Run latency profiling")
    parser.add_argument("--output", type=str, help="Save results to JSON")
    
    args = parser.parse_args()
    
    evaluator = ModelEvaluator(args.model, args.type)
    
    # Main evaluation
    results = evaluator.evaluate_gesture_model(args.data)
    
    # Latency profiling
    if args.latency:
        latency_results = evaluator.evaluate_latency_profile(args.data)
        results["latency"] = latency_results
    
    # Save results
    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        print(f"\nResults saved to {output_path}")
    
    return results


if __name__ == "__main__":
    run_evaluation()
