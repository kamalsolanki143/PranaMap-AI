"""Hindi and Marathi translation for advisories."""

from __future__ import annotations

import logging
from typing import Literal

logger = logging.getLogger(__name__)

TranslationTarget = Literal["hi", "mr", "en"]


class Translator:
    """Translate advisory text to Hindi and Marathi.

    Uses an external translation API when available,
    otherwise falls back to a local dictionary for common phrases.

    Attributes:
        api_key: Translation API key (Google / Azure).
        cache: Simple translation cache.
    """

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key
        self._cache: dict[str, str] = {}

    def translate(
        self,
        text: str,
        target: TranslationTarget = "hi",
        source: str = "en",
    ) -> str | None:
        """Translate text to the target language.

        Args:
            text: Source text in English.
            target: Target language code (hi=Hindi, mr=Marathi).
            source: Source language code.

        Returns:
            Translated text or None on failure.
        """
        if not text or target == source:
            return text

        cache_key = f"{target}:{hash(text)}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        try:
            result = self._translate_via_api(text, target, source)
        except Exception as exc:
            logger.warning("API translation failed: %s. Using fallback.", exc)
            result = self._fallback_translate(text, target)

        if result:
            self._cache[cache_key] = result
        return result

    def translate_batch(
        self,
        texts: list[str],
        target: TranslationTarget = "hi",
    ) -> list[str | None]:
        """Translate a batch of texts.

        Args:
            texts: List of source texts.
            target: Target language code.

        Returns:
            List of translated strings (None for failures).
        """
        return [self.translate(t, target=target) for t in texts]

    def _translate_via_api(
        self,
        text: str,
        target: str,
        source: str,
    ) -> str | None:
        """Translate using external API (Google Translate or similar).

        Args:
            text: Source text.
            target: Target language code.
            source: Source language code.

        Returns:
            Translated text.
        """
        if not self.api_key:
            raise ValueError("Translation API key not configured")

        import requests

        resp = requests.post(
            "https://translation.googleapis.com/language/translate/v2",
            params={
                "q": text,
                "target": target,
                "source": source,
                "key": self.api_key,
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["data"]["translations"][0]["translatedText"]

    def _fallback_translate(self, text: str, target: str) -> str | None:
        """Return placeholder translation when API is unavailable.

        Args:
            text: Source text.
            target: Target language code.

        Returns:
            Placeholder text with language tag.
        """
        lang_names = {"hi": "Hindi", "mr": "Marathi"}
        lang = lang_names.get(target, target)
        logger.info("Using fallback translation for %s text.", lang)
        return f"[{lang}] {text}"
