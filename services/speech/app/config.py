"""Configuration settings for Speech Service."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    SERVICE_NAME: str = "emirsign-speech"
    PORT: int = 8003
    DEBUG: bool = True

    # Whisper settings
    WHISPER_MODEL_SIZE: str = "base"
    WHISPER_LANGUAGE: str = None

    # Piper TTS settings
    PIPER_VOICE_PATH: str = "./voices/ar_SA-Ahmed-medium.onnx"

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
