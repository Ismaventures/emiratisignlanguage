"""Gesture classification service."""

import numpy as np
from typing import Optional
import os

from app.config import settings
from app.schemas.vision import LandmarkData, GesturePrediction


class GestureService:
    """Service for gesture classification using ONNX Runtime."""

    def __init__(self):
        self.model = None
        self.label_map = {}
        self._load_model()

    def _load_model(self):
        """Load the gesture classification model."""
        model_path = settings.GESTURE_MODEL_PATH

        if os.path.exists(model_path):
            try:
                import onnxruntime as ort
                self.model = ort.InferenceSession(model_path)
                print(f"Loaded gesture model from {model_path}")
            except Exception as e:
                print(f"Failed to load gesture model: {e}")
                print("Using fallback rule-based classification")
        else:
            print("No gesture model found, using rule-based classification")

    def classify(self, landmarks: LandmarkData) -> Optional[GesturePrediction]:
        """Classify a gesture from landmark data."""
        if self.model:
            return self._classify_with_model(landmarks)
        else:
            return self._classify_rule_based(landmarks)

    def _classify_with_model(self, landmarks: LandmarkData) -> Optional[GesturePrediction]:
        """Classify using ONNX model."""
        try:
            # Convert landmarks to numpy array
            features = self._landmarks_to_features(landmarks)

            # Run inference
            input_name = self.model.get_inputs()[0].name
            result = self.model.run(None, {input_name: features})

            # Get prediction
            probabilities = result[0][0]
            predicted_class = np.argmax(probabilities)
            confidence = float(probabilities[predicted_class])

            # Get gesture name
            gesture_name = self.label_map.get(str(predicted_class), f"gesture_{predicted_class}")

            return GesturePrediction(
                gesture_id=str(predicted_class),
                gesture_name=gesture_name,
                confidence=confidence,
                timestamp=landmarks.timestamp,
            )

        except Exception as e:
            print(f"Model classification failed: {e}")
            return None

    def _classify_rule_based(self, landmarks: LandmarkData) -> Optional[GesturePrediction]:
        """Simple rule-based classification for demo purposes."""
        if not landmarks.hands:
            return None

        hand = landmarks.hands[0]
        landmarks_list = hand.landmarks

        if len(landmarks_list) < 21:
            return None

        # Simple heuristics for demo
        # Check if hand is open (fingers extended)
        fingers_extended = self._count_extended_fingers(landmarks_list)

        if fingers_extended >= 4:
            return GesturePrediction(
                gesture_id="open_hand",
                gesture_name="Open Hand",
                confidence=0.8,
                timestamp=landmarks.timestamp,
            )
        elif fingers_extended == 1:
            return GesturePrediction(
                gesture_id="pointing",
                gesture_name="Pointing",
                confidence=0.7,
                timestamp=landmarks.timestamp,
            )
        elif fingers_extended == 0:
            return GesturePrediction(
                gesture_id="fist",
                gesture_name="Fist",
                confidence=0.75,
                timestamp=landmarks.timestamp,
            )

        return None

    def _count_extended_fingers(self, landmarks: list[dict]) -> int:
        """Count the number of extended fingers."""
        if len(landmarks) < 21:
            return 0

        count = 0

        # Thumb
        if landmarks[4]["x"] < landmarks[3]["x"]:
            count += 1

        # Index finger
        if landmarks[8]["y"] < landmarks[6]["y"]:
            count += 1

        # Middle finger
        if landmarks[12]["y"] < landmarks[10]["y"]:
            count += 1

        # Ring finger
        if landmarks[16]["y"] < landmarks[14]["y"]:
            count += 1

        # Pinky
        if landmarks[20]["y"] < landmarks[18]["y"]:
            count += 1

        return count

    def _landmarks_to_features(self, landmarks: LandmarkData) -> np.ndarray:
        """Convert landmarks to feature vector for model input."""
        features = []

        # Add hand landmarks
        for hand in landmarks.hands:
            for lm in hand.landmarks:
                features.extend([lm.x, lm.y, lm.z])

        # Pad if needed
        while len(features) < 126:  # 21 landmarks * 3 coords * 2 hands
            features.append(0.0)

        return np.array(features[:126], dtype=np.float32).reshape(1, -1)
