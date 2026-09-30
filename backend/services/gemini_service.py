"""PranaMap AI - Dedicated Gemini Service re-export.

Adapts the backend service structure so both `app.services.gemini_service`
and `services.gemini_service` access the same unified client.
"""

from app.services.gemini_service import (
    GeminiService,
    gemini_service,
    GeminiAdvisoryOutput,
    GeminiExplanationOutput,
    StructuredGeminiResponse,
    ValidatedEnvironmentalResponse,
    RiskLevel,
    DataStatus,
)

__all__ = [
    "GeminiService",
    "gemini_service",
    "GeminiAdvisoryOutput",
    "GeminiExplanationOutput",
    "StructuredGeminiResponse",
    "ValidatedEnvironmentalResponse",
    "RiskLevel",
    "DataStatus",
]
