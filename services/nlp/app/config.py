"""Configuration settings for NLP Service."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    SERVICE_NAME: str = "emirsign-nlp"
    PORT: int = 8002
    DEBUG: bool = True

    # Translation settings
    DEFAULT_SOURCE_LANG: str = "esl"
    DEFAULT_TARGET_LANG: str = "ar"

    # Model settings
    MODEL_DIR: str = "./models"

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
