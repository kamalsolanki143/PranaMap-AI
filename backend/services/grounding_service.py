"""PranaMap AI - Dedicated Grounding Service re-export.

Adapts the backend service structure so both `app.services.grounding_service`
and `services.grounding_service` access the unified environmental grounding layer.
"""

from app.services.grounding_service import (
    grounding_service,
    GroundingService,
    format_grounded_gemini_prompt,
    GroundedLocation,
    GroundedAirQuality,
    GroundedWeather,
    GroundedForecast,
    GroundedProvenance,
    GroundedEnvironmentalContext,
    GROUNDED_GEMINI_SYSTEM_DIRECTIVE,
)

__all__ = [
    "grounding_service",
    "GroundingService",
    "format_grounded_gemini_prompt",
    "GroundedLocation",
    "GroundedAirQuality",
    "GroundedWeather",
    "GroundedForecast",
    "GroundedProvenance",
    "GroundedEnvironmentalContext",
    "GROUNDED_GEMINI_SYSTEM_DIRECTIVE",
]
