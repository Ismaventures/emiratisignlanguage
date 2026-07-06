"""Translation service for ESL to text conversion."""

from typing import Optional

from app.schemas.translation import TranslationResponse


class TranslationService:
    """Service for translating between ESL notation and spoken languages."""

    def __init__(self):
        # Simple dictionary-based translation for demo
        # In production, this would use a trained translation model
        self.esl_to_arabic = {
            "مرحبا": "مرحبا",
            "شكرا": "شكرا",
            "نعم": "نعم",
            "لا": "لا",
            "اسمي": "اسمي",
            "كيف حالك": "كيف حالك",
            "أنا بخير": "أنا بخير",
        }

        self.esl_to_english = {
            "hello": "hello",
            "thank": "thank you",
            "yes": "yes",
            "no": "no",
            "name": "my name",
            "how are you": "how are you",
            "i am fine": "i am fine",
        }

    def translate(
        self,
        input_text: str,
        source_lang: str,
        target_lang: str,
    ) -> TranslationResponse:
        """Translate text between languages."""
        translated = ""

        if source_lang == "esl" and target_lang == "ar":
            translated = self.esl_to_arabic.get(input_text, input_text)
        elif source_lang == "esl" and target_lang == "en":
            translated = self.esl_to_english.get(input_text, input_text)
        elif source_lang in ("ar", "en") and target_lang == "esl":
            # Reverse lookup
            if source_lang == "ar":
                for k, v in self.esl_to_arabic.items():
                    if v == input_text:
                        translated = k
                        break
            else:
                for k, v in self.esl_to_english.items():
                    if v == input_text:
                        translated = k
                        break
        else:
            translated = input_text

        return TranslationResponse(
            success=True,
            translated_text=translated or input_text,
            source_language=source_lang,
            target_language=target_lang,
            confidence=0.85 if translated else 0.0,
        )
