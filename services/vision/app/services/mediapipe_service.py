"""MediaPipe service for landmark detection."""

import mediapipe as mp
import cv2
import numpy as np
from typing import Optional

from app.config import settings


class MediaPipeService:
    """Service for MediaPipe holistic landmark detection."""

    def __init__(self):
        self.mp_holistic = mp.solutions.holistic
        self.mp_hands = mp.solutions.hands
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_pose = mp.solutions.pose

        self.holistic = self.mp_holistic.Holistic(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            enable_segmentation=False,
            smooth_segmentation=False,
            refine_face_landmarks=True,
            min_detection_confidence=settings.MEDIPAPE_MIN_DETECTION_CONFIDENCE,
            min_tracking_confidence=settings.MEDIPAPE_MIN_TRACKING_CONFIDENCE,
        )

    def process_frame(self, frame: np.ndarray) -> dict:
        """Process a video frame and extract landmarks."""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.holistic.process(rgb_frame)

        landmarks = {
            "hands": [],
            "face": None,
            "pose": None,
            "timestamp": 0,
            "confidence": 0,
        }

        # Extract hand landmarks
        if results.left_hand_landmarks:
            landmarks["hands"].append({
                "handedness": "Left",
                "landmarks": self._extract_landmarks(results.left_hand_landmarks),
            })

        if results.right_hand_landmarks:
            landmarks["hands"].append({
                "handedness": "Right",
                "landmarks": self._extract_landmarks(results.right_hand_landmarks),
            })

        # Extract face landmarks
        if results.face_landmarks:
            face_landmarks = self._extract_landmarks(results.face_landmarks)
            h, w = frame.shape[:2]
            landmarks["face"] = {
                "landmarks": face_landmarks,
                "bounding_box": {
                    "x": 0,
                    "y": 0,
                    "width": w,
                    "height": h,
                },
            }

        # Extract pose landmarks
        if results.pose_landmarks:
            landmarks["pose"] = {
                "landmarks": self._extract_landmarks(results.pose_landmarks),
            }

        # Calculate confidence
        if results.left_hand_landmarks or results.right_hand_landmarks:
            landmarks["confidence"] = 0.9

        return landmarks

    def _extract_landmarks(self, landmarks) -> list[dict]:
        """Extract landmark coordinates."""
        return [
            {
                "x": lm.x,
                "y": lm.y,
                "z": lm.z,
                "visibility": getattr(lm, "visibility", None),
            }
            for lm in landmarks.landmark
        ]

    def __del__(self):
        """Cleanup MediaPipe resources."""
        if hasattr(self, "holistic"):
            self.holistic.close()
