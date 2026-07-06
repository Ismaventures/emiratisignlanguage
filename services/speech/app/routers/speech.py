"""Speech router - transcription and synthesis."""

from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse, StreamingResponse
import io

from app.services.whisper_service import WhisperService
from app.services.tts_service import TTSService
from app.schemas.speech import (
    TranscriptionResponse,
    TTSRequest,
)

router = APIRouter()

whisper_service = WhisperService()
tts_service = TTSService()


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe audio file to text."""
    try:
        audio_data = await file.read()
        result = whisper_service.transcribe(audio_data, file.filename)
        return result
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)},
        )


@router.post("/synthesize")
async def synthesize_speech(request: TTSRequest):
    """Convert text to speech audio."""
    try:
        audio_data = tts_service.synthesize(
            text=request.text,
            language=request.language,
            voice=request.voice,
            speed=request.speed,
        )

        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/wav",
            headers={"Content-Disposition": "attachment; filename=speech.wav"},
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)},
        )


@router.get("/voices")
async def list_voices():
    """List available voices for TTS."""
    return {
        "voices": [
            {"id": "ar_SA-Ahmed", "language": "ar", "name": "Ahmed", "gender": "male"},
            {"id": "ar_SA-Laila", "language": "ar", "name": "Laila", "gender": "female"},
            {"id": "en_US-Emma", "language": "en", "name": "Emma", "gender": "female"},
            {"id": "en_US-John", "language": "en", "name": "John", "gender": "male"},
        ]
    }
