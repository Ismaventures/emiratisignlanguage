"""Translation schemas."""

from pydantic import BaseModel, Field
from typing import Optional


class TranslationRequest(BaseModel):
    """Request for translation."""
    input_text: str = Field(..., description="Text to translate")
    source_lang: Optional[str] = Field(None, description="Source language code")
    target_lang: Optional[str] = Field(None, description="Target language code")


class TranslationResponse(BaseModel):
    """Response from translation."""
    success: bool
    translated_text: Optional[str] = None
    source_language: str
    target_language: str
    confidence: float = 0.0
    alternatives: list[str] = []
    error: Optional[str] = None
