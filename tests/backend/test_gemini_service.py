"""PranaMap AI - Gemini Service Tests

Automated tests for Google GenAI SDK client connection, error handling,
credential security, and runtime verification.
"""

import os
import sys
from pathlib import Path
from unittest.mock import MagicMock
import pytest

# Ensure backend directory is in python path
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.gemini_service import GeminiService, gemini_service
from services.gemini_service import GeminiService as ReexportedGeminiService


@pytest.fixture
def anyio_backend():
    return "asyncio"


class TestGeminiServiceImports:
    """Verify clean imports and architecture compliance."""

    def test_imports_succeed(self):
        from app.services.gemini_service import GeminiService as DirectService
        from services.gemini_service import GeminiService as AliasService
        assert DirectService is AliasService

    def test_singleton_instance_exists(self):
        assert gemini_service is not None
        assert isinstance(gemini_service, GeminiService)


class TestGeminiServiceMissingKey:
    """Verify behavior when GEMINI_API_KEY is not configured."""

    def test_unconfigured_service_state(self):
        # Create an instance with explicit None key to guarantee missing key test
        service = GeminiService(api_key=None, model_name="gemini-2.5-flash")
        # In absence of environment key, it must not be available
        if not os.environ.get("GEMINI_API_KEY"):
            assert service.is_available() is False
            assert service._client is None

    def test_generate_text_returns_none_without_faking(self):
        service = GeminiService(api_key=None, model_name="gemini-2.5-flash")
        if not os.environ.get("GEMINI_API_KEY"):
            result = service.generate_text("Respond with exactly: PRANAMAP_GEMINI_OK")
            # Must NOT fake a successful request
            assert result is None

    @pytest.mark.anyio
    async def test_generate_text_async_returns_none_without_faking(self):
        service = GeminiService(api_key=None, model_name="gemini-2.5-flash")
        if not os.environ.get("GEMINI_API_KEY"):
            result = await service.generate_text_async("Respond with exactly: PRANAMAP_GEMINI_OK")
            # Must NOT fake a successful request
            assert result is None


class TestGeminiCredentialSecurity:
    """Verify that credentials are never exposed in error logs."""

    def test_sanitize_error_redacts_api_key(self):
        fake_key = "AIzaSySecretFakeApiKey123456789"
        service = GeminiService(api_key=fake_key)
        # Service should sanitize errors containing the key
        raw_error = Exception(f"Failed to connect to Google API using key {fake_key} - unauthorized")
        sanitized = service._sanitize_error(raw_error)

        assert fake_key not in sanitized
        assert "[REDACTED_API_KEY]" in sanitized

    def test_api_error_handling_returns_none(self):
        service = GeminiService(api_key="fake-test-key")
        # Mock client to simulate an API exception
        mock_client = MagicMock()
        mock_client.models.generate_content.side_effect = Exception("Simulated quota or network failure")
        service._client = mock_client

        # Call generate_text - must catch error and return None safely
        res = service.generate_text("Respond with exactly: PRANAMAP_GEMINI_OK")
        assert res is None


class TestGeminiLiveConnection:
    """Runtime test against real Gemini API if credentials are provided."""

    def test_real_gemini_request_if_key_available(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            pytest.skip("GEMINI_API_KEY is not configured in environment. Skipping live Gemini API call.")

        service = GeminiService(api_key=api_key, model_name="gemini-2.5-flash")
        assert service.is_available() is True

        response = service.generate_text("Respond with exactly: PRANAMAP_GEMINI_OK")
        assert response is not None
        assert "PRANAMAP_GEMINI_OK" in response.strip()
