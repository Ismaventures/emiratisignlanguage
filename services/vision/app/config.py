"""Configuration settings for Vision Service."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    SERVICE_NAME: str = "emirsign-vision"
    PORT: int = 8001
    DEBUG: bool = True

    # MediaPipe settings
    MEDIPAPE_CONFIDENCE: float = 0.7
    MEDIPAPE_MAX_HANDS: int = 2
    MEDIPAPE_MIN_DETECTION_CONFIDENCE: float = 0.7
    MEDIPAPE_MIN_TRACKING_CONFIDENCE: float = 0.5

    # Model settings
    MODEL_DIR: str = "./models"
    GESTURE_MODEL_PATH: str = "./models/gesture_classifier.onnx"

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
