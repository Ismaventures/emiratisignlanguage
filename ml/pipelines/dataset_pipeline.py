# Dataset Processing Pipeline
# Extracts landmarks from videos/images and creates training-ready datasets

import os
import json
import cv2
import mediapipe as mp
import numpy as np
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm
import argparse


class DatasetPipeline:
    """Process raw videos/images into annotated landmark datasets."""
    
    def __init__(self, config: dict):
        self.config = config
        self.mp_holistic = mp.solutions.holistic
        self.holistic = self.mp_holistic.Holistic(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5,
        )
        
    def extract_landmarks_from_video(self, video_path: str) -> list[dict]:
        """Extract landmarks from each frame of a video."""
        cap = cv2.VideoCapture(video_path)
        frames = []
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process every Nth frame
            if len(frames) % self.config.get("frame_skip", 2) == 0:
                landmarks = self.extract_landmarks_from_frame(frame)
                if landmarks["hands"]:
                    frames.append(landmarks)
                    
        cap.release()
        return frames
    
    def extract_landmarks_from_frame(self, frame: np.ndarray) -> dict:
        """Extract landmarks from a single frame."""
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.holistic.process(rgb)
        
        landmarks = {"hands": [], "face": None, "pose": None}
        
        # Left hand
        if results.left_hand_landmarks:
            landmarks["hands"].append({
                "handedness": "Left",
                "landmarks": [
                    {"x": lm.x, "y": lm.y, "z": lm.z}
                    for lm in results.left_hand_landmarks.landmark
                ],
            })
        
        # Right hand
        if results.right_hand_landmarks:
            landmarks["hands"].append({
                "handedness": "Right",
                "landmarks": [
                    {"x": lm.x, "y": lm.y, "z": lm.z}
                    for lm in results.right_hand_landmarks.landmark
                ],
            })
        
        # Face
        if results.face_landmarks:
            landmarks["face"] = {
                "landmarks": [
                    {"x": lm.x, "y": lm.y, "z": lm.z}
                    for lm in results.face_landmarks.landmark
                ],
            }
        
        # Pose
        if results.pose_landmarks:
            landmarks["pose"] = {
                "landmarks": [
                    {"x": lm.x, "y": lm.y, "z": lm.z}
                    for lm in results.pose_landmarks.landmark
                ],
            }
        
        return landmarks
    
    def process_dataset(
        self,
        input_dir: str,
        output_dir: str,
        label_map: dict[str, int],
    ):
        """Process entire dataset directory."""
        input_path = Path(input_dir)
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        all_landmarks = []
        all_labels = []
        
        # Process each gesture class folder
        for gesture_name, gesture_id in label_map.items():
            gesture_dir = input_path / gesture_name
            if not gesture_dir.exists():
                continue
            
            video_files = list(gesture_dir.glob("*.mp4")) + list(gesture_dir.glob("*.avi"))
            video_files += list(gesture_dir.glob("*.mov")) + list(gesture_dir.glob("*.webm"))
            
            for video_path in tqdm(video_files, desc=f"Processing {gesture_name}"):
                try:
                    frames = self.extract_landmarks_from_video(str(video_path))
                    
                    for frame_data in frames:
                        # Flatten landmarks into feature vector
                        features = self.flatten_landmarks(frame_data)
                        if features is not None:
                            all_landmarks.append(features)
                            all_labels.append(gesture_id)
                            
                except Exception as e:
                    print(f"Error processing {video_path}: {e}")
        
        # Save processed data
        output_data = {
            "landmarks": all_landmarks,
            "labels": all_labels,
            "label_map": {v: k for k, v in label_map.items()},
            "num_classes": len(label_map),
            "feature_dim": len(all_landmarks[0]) if all_landmarks else 0,
        }
        
        output_file = output_path / "landmarks.json"
        with open(output_file, "w") as f:
            json.dump(output_data, f)
        
        print(f"Saved {len(all_landmarks)} samples to {output_file}")
        print(f"Feature dimension: {output_data['feature_dim']}")
        print(f"Number of classes: {output_data['num_classes']}")
        
        return output_data
    
    def flatten_landmarks(self, landmarks: dict) -> list | None:
        """Flatten landmarks into a single feature vector."""
        features = []
        
        # Hand landmarks (up to 2 hands × 21 landmarks × 3 coords)
        for hand in landmarks.get("hands", [])[:2]:
            for lm in hand["landmarks"]:
                features.extend([lm["x"], lm["y"], lm["z"]])
        
        # Pad if fewer than 2 hands
        expected_hand_features = 2 * 21 * 3
        while len(features) < expected_hand_features:
            features.extend([0.0, 0.0, 0.0])
        
        if not features:
            return None
            
        return features


def preprocess_image(image_path: str, target_size: tuple = (224, 224)) -> np.ndarray:
    """Preprocess image for model input."""
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Cannot read image: {image_path}")
    
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, target_size)
    img = img.astype(np.float32) / 255.0
    img = (img - np.array([0.485, 0.456, 0.406])) / np.array([0.229, 0.224, 0.225])
    
    return img


def augment_landmarks(landmarks: list, noise_std: float = 0.01) -> list:
    """Apply data augmentation to landmarks."""
    augmented = []
    for lm in landmarks:
        noisy = {
            "x": lm["x"] + np.random.normal(0, noise_std),
            "y": lm["y"] + np.random.normal(0, noise_std),
            "z": lm["z"] + np.random.normal(0, noise_std),
        }
        augmented.append(noisy)
    return augmented


def create_synthetic_dataset(output_dir: str, num_samples: int = 1000):
    """Create a synthetic landmark dataset for testing."""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    np.random.seed(42)
    
    gestures = {
        "hello": 0,
        "thank_you": 1,
        "yes": 2,
        "no": 3,
        "please": 4,
        "sorry": 5,
        "help": 6,
        "good": 7,
        "bad": 8,
        "name": 9,
    }
    
    all_landmarks = []
    all_labels = []
    
    for gesture_name, gesture_id in gestures.items():
        for _ in range(num_samples // len(gestures)):
            # Generate synthetic hand landmarks
            hand_landmarks = []
            for i in range(21):
                lm = {
                    "x": np.random.uniform(0, 1),
                    "y": np.random.uniform(0, 1),
                    "z": np.random.uniform(-0.5, 0.5),
                }
                hand_landmarks.append(lm)
            
            landmarks = {
                "hands": [{"handedness": "Right", "landmarks": hand_landmarks}],
                "face": None,
                "pose": None,
            }
            
            pipeline = DatasetPipeline({})
            features = pipeline.flatten_landmarks(landmarks)
            if features:
                all_landmarks.append(features)
                all_labels.append(gesture_id)
    
    output_data = {
        "landmarks": all_landmarks,
        "labels": all_labels,
        "label_map": {v: k for k, v in gestures.items()},
        "num_classes": len(gestures),
        "feature_dim": len(all_landmarks[0]),
    }
    
    output_file = output_path / "synthetic_landmarks.json"
    with open(output_file, "w") as f:
        json.dump(output_data, f)
    
    print(f"Created synthetic dataset with {len(all_landmarks)} samples")
    print(f"Saved to {output_file}")
    
    return output_data


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Dataset processing pipeline")
    parser.add_argument("--input", type=str, help="Input directory")
    parser.add_argument("--output", type=str, default="../datasets/processed", help="Output directory")
    parser.add_argument("--synthetic", action="store_true", help="Create synthetic dataset for testing")
    parser.add_argument("--samples", type=int, default=1000, help="Number of synthetic samples")
    
    args = parser.parse_args()
    
    if args.synthetic:
        create_synthetic_dataset(args.output, args.samples)
    elif args.input:
        # Example label map
        label_map = {
            "hello": 0,
            "thank_you": 1,
            "yes": 2,
            "no": 3,
            "please": 4,
        }
        
        pipeline = DatasetPipeline({})
        pipeline.process_dataset(args.input, args.output, label_map)
    else:
        print("Specify --input or --synthetic")
