"""Translation router."""

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.services.translation_service import TranslationService
from app.schemas.translation import (
    TranslationRequest,
    TranslationResponse,
)

router = APIRouter()

translation_service = TranslationService()


@router.post("/esl-to-arabic", response_model=TranslationResponse)
async def translate_esl_to_arabic(request: TranslationRequest):
    """Translate ESL notation to Arabic text."""
    try:
        result = translation_service.translate(
            input_text=request.input_text,
            source_lang="esl",
            target_lang="ar",
        )
        return result
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)},
        )


@router.post("/esl-to-english", response_model=TranslationResponse)
async def translate_esl_to_english(request: TranslationRequest):
    """Translate ESL notation to English text."""
    try:
        result = translation_service.translate(
            input_text=request.input_text,
            source_lang="esl",
            target_lang="en",
        )
        return result
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)},
        )


@router.post("/text-to-esl", response_model=TranslationResponse)
async def translate_text_to_esl(request: TranslationRequest):
    """Translate text to ESL notation."""
    try:
        result = translation_service.translate(
            input_text=request.input_text,
            source_lang=request.source_lang or "ar",
            target_lang="esl",
        )
        return result
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)},
        )
