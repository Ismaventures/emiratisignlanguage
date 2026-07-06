"""Speech schemas."""

from pydantic import BaseModel, Field
from typing import Optional


class TranscriptionResponse(BaseModel):
    """Response from audio transcription."""
    success: bool
    text: Optional[str] = None
    language: Optional[str] = None
    confidence: float = 0.0
    segments: list[dict] = []
    error: Optional[str] = None


class TTSRequest(BaseModel):
    """Request for text-to-speech."""
    text: str = Field(..., description="Text to synthesize")
    language: str = Field("ar", description="Language code (ar or en)")
    voice: Optional[str] = Field(None, description="Voice ID")
    speed: Optional[float] = Field(1.0, description="Speech speed multiplier")
