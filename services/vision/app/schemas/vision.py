"""Vision schemas."""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Landmark3D(BaseModel):
    """3D landmark point."""
    x: float
    y: float
    z: float
    visibility: Optional[float] = None


class HandLandmarks(BaseModel):
    """Hand landmark data."""
    handedness: str = Field(..., description="Left or Right")
    landmarks: list[Landmark3D]


class FaceLandmarks(BaseModel):
    """Face landmark data."""
    landmarks: list[Landmark3D]
    bounding_box: dict


class PoseLandmarks(BaseModel):
    """Pose landmark data."""
    landmarks: list[Landmark3D]


class LandmarkData(BaseModel):
    """Complete landmark detection result."""
    hands: list[HandLandmarks] = []
    face: Optional[FaceLandmarks] = None
    pose: Optional[PoseLandmarks] = None
    timestamp: float = 0
    confidence: float = 0


class DetectionRequest(BaseModel):
    """Request for landmark detection."""
    image: str = Field(..., description="Base64 encoded image")
    timestamp: Optional[float] = None


class DetectionResponse(BaseModel):
    """Response from landmark detection."""
    success: bool
    data: Optional[LandmarkData] = None
    error: Optional[str] = None


class GesturePrediction(BaseModel):
    """Gesture classification prediction."""
    gesture_id: str
    gesture_name: str
    confidence: float
    timestamp: float
