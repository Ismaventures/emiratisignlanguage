"""Whisper ASR service for speech recognition."""

import io
import tempfile
import os
from typing import Optional

from app.config import settings
from app.schemas.speech import TranscriptionResponse


class WhisperService:
    """Service for speech recognition using OpenAI Whisper."""

    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        """Load the Whisper model."""
        try:
            import whisper
            self.model = whisper.load_model(settings.WHISPER_MODEL_SIZE)
            print(f"Loaded Whisper model: {settings.WHISPER_MODEL_SIZE}")
        except Exception as e:
            print(f"Failed to load Whisper model: {e}")
            print("Speech recognition will be unavailable")

    def transcribe(self, audio_data: bytes, filename: str = "audio.wav") -> TranscriptionResponse:
        """Transcribe audio data to text."""
        if not self.model:
            return TranscriptionResponse(
                success=False,
                error="Whisper model not loaded",
            )

        try:
            # Save audio to temporary file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp.write(audio_data)
                tmp_path = tmp.name

            try:
                # Transcribe
                result = self.model.transcribe(
                    tmp_path,
                    language=settings.WHISPER_LANGUAGE,
                )

                # Extract segments
                segments = []
                for segment in result.get("segments", []):
                    segments.append({
                        "start": segment["start"],
                        "end": segment["end"],
                        "text": segment["text"],
                    })

                return TranscriptionResponse(
                    success=True,
                    text=result["text"].strip(),
                    language=result.get("language", "unknown"),
                    confidence=0.9,  # Whisper doesn't provide confidence directly
                    segments=segments,
                )

            finally:
                os.unlink(tmp_path)

        except Exception as e:
            return TranscriptionResponse(
                success=False,
                error=str(e),
            )
