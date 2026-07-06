"""Vision router - landmark detection and gesture classification."""

from fastapi import APIRouter, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import base64
import json

from app.services.mediapipe_service import MediaPipeService
from app.services.gesture_service import GestureService
from app.schemas.vision import (
    DetectionRequest,
    DetectionResponse,
    LandmarkData,
    GesturePrediction,
)

router = APIRouter()

mediapipe_service = MediaPipeService()
gesture_service = GestureService()


@router.post("/detect", response_model=DetectionResponse)
async def detect_landmarks(request: DetectionRequest):
    """Detect hand, face, and pose landmarks from an image."""
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image)
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Invalid image data"},
            )

        # Process with MediaPipe
        landmarks = mediapipe_service.process_frame(image)

        return DetectionResponse(
            success=True,
            data=landmarks,
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)},
        )


@router.post("/classify", response_model=GesturePrediction)
async def classify_gesture(landmarks: LandmarkData):
    """Classify a gesture from landmark data."""
    try:
        prediction = gesture_service.classify(landmarks)
        return prediction

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)},
        )


@router.websocket("/stream")
async def websocket_stream(websocket: WebSocket):
    """WebSocket endpoint for real-time landmark detection."""
    await websocket.accept()

    try:
        while True:
            # Receive frame data
            data = await websocket.receive_text()
            frame_data = json.loads(data)

            # Decode image
            image_data = base64.b64decode(frame_data["image"])
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if image is None:
                await websocket.send_json({"error": "Invalid image"})
                continue

            # Process with MediaPipe
            landmarks = mediapipe_service.process_frame(image)

            # Classify gesture if landmarks detected
            gesture = None
            if landmarks.get("hands"):
                gesture = gesture_service.classify(landmarks)

            # Send response
            await websocket.send_json({
                "landmarks": landmarks,
                "gesture": gesture,
                "timestamp": frame_data.get("timestamp", 0),
            })

    except WebSocketDisconnect:
        print("Client disconnected")
