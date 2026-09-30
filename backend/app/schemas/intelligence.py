"""PranaMap AI - Environmental Intelligence Structured Schemas.

Defines Pydantic schemas and enums for structured Gemini responses, validation,
and application responses. Enforces strict schema validation, prevents numeric
measurement hallucination, and preserves data provenance.
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from app.services.grounding_service import (
    GroundedLocation,
    GroundedAirQuality,
    GroundedWeather,
    GroundedForecast,
    GroundedProvenance,
)


class RiskLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    SEVERE = "SEVERE"
    UNKNOWN = "UNKNOWN"

    @classmethod
    def _missing_(cls, value):
        # Case-insensitive normalization only for actual enum members
        if isinstance(value, str):
            val_upper = value.strip().upper()
            for member in cls:
                if member.value == val_upper:
                    return member
        # Invalid enum values return None, triggering strict Pydantic ValidationError
        return None


class DataStatus(str, Enum):
    OBSERVED = "OBSERVED"
    MODELLED = "MODELLED"
    CACHED = "CACHED"
    LIVE = "LIVE"
    SIMULATION = "SIMULATION"

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            val_upper = value.strip().upper()
            for member in cls:
                if member.value == val_upper:
                    return member
        return None


def map_aqi_to_risk_level(aqi: Optional[int]) -> RiskLevel:
    """Ground risk level in verified numeric AQI without allowing AI hallucination."""
    if aqi is None:
        return RiskLevel.UNKNOWN
    if aqi > 300:
        return RiskLevel.SEVERE
    if aqi > 200:
        return RiskLevel.HIGH
    if aqi > 100:
        return RiskLevel.MODERATE
    return RiskLevel.LOW


class StructuredGeminiResponse(BaseModel):
    """Structured response schema returned by Google Gemini for environmental interpretation.

    IMPORTANT: Does NOT contain numeric measurements (AQI, PM2.5, PM10, etc.)
    to guarantee Gemini cannot hallucinate or override ground truth data.
    """
    summary: str = Field(min_length=5, description="Concise environmental situation synopsis")
    risk_level: RiskLevel = Field(description="Risk category: LOW | MODERATE | HIGH | SEVERE | UNKNOWN")
    key_drivers: List[str] = Field(min_length=1, description="Identified meteorological or emission drivers")
    recommended_actions: List[str] = Field(min_length=1, description="Recommended citizen or municipal interventions")
    evidence_notes: List[str] = Field(default_factory=list, description="Evidence references grounded in supplied telemetry")
    data_status: DataStatus = Field(description="Data provenance: OBSERVED | MODELLED | CACHED | LIVE | SIMULATION")
    generated_by: str = Field(default="Gemini", description="Origin of intelligence synthesis")
    provenance: str = Field(default="AI-GENERATED", description="Provenance classification (AI-GENERATED or CALIBRATED-FALLBACK)")
    limitations: List[str] = Field(default_factory=list, description="Model boundary conditions and uncertainties")

    @field_validator("key_drivers", "recommended_actions")
    @classmethod
    def check_non_empty_strings(cls, v: List[str]) -> List[str]:
        cleaned = [item.strip() for item in v if isinstance(item, str) and item.strip()]
        if not cleaned:
            raise ValueError("Must contain at least one non-empty string item")
        return cleaned


class ValidatedEnvironmentalResponse(BaseModel):
    """Complete application response combining verified physical data with validated AI intelligence."""
    location: GroundedLocation
    air_quality: Optional[GroundedAirQuality] = None
    weather: Optional[GroundedWeather] = None
    forecast: Optional[GroundedForecast] = None
    provenance: GroundedProvenance
    intelligence: StructuredGeminiResponse


class EnvironmentalOutlookFactor(BaseModel):
    """Meteorological/environmental condition factor for UI visualization."""
    label: str = Field(description="Factor name e.g. Surface Wind or Relative Humidity")
    value: str = Field(description="Value string e.g. 7.2 km/h (NW)")
    impact: str = Field(default="neutral", description="risk-increasing | neutral | risk-reducing")


class GeminiOutlookSchema(BaseModel):
    """Structured schema for Gemini Environmental Outlook synthesis."""
    summary: str = Field(min_length=5, description="Concise environmental situation synopsis using qualified language")
    hindi_headline: str = Field(description="Localized concise headline in Hindi")
    marathi_headline: str = Field(description="Localized concise headline in Marathi")
    ventilation_index: str = Field(description="Atmospheric dispersion: High Dispersion | Moderate Ventilation | Severe Stagnation")
    risk_trend: str = Field(description="Trend: improving | stable | deteriorating")
    major_contributing_conditions: List[str] = Field(min_length=1, description="Major contributing meteorological or atmospheric conditions")
    possible_near_term_changes: List[str] = Field(min_length=1, description="Possible near-term changes expressed with qualified language")
    monitoring_and_action_focus: List[str] = Field(min_length=1, description="Practical monitoring or action focus")
    limitations: List[str] = Field(default_factory=list, description="Model boundary conditions and uncertainties")


class EnvironmentalOutlookOutput(BaseModel):
    """Full application response for Environmental Outlook endpoint and UI."""
    summary: str = Field(description="Concise environmental summary")
    hindi_headline: Optional[str] = Field(default=None, description="Localized headline in Hindi")
    marathi_headline: Optional[str] = Field(default=None, description="Localized headline in Marathi")
    ventilation_index: str = Field(description="Dispersion evaluation e.g. High Dispersion | Moderate Ventilation | Severe Stagnation")
    risk_trend: str = Field(description="Direction of risk: improving | stable | deteriorating")
    major_contributing_conditions: List[str] = Field(min_length=1, description="Major contributing meteorological or atmospheric conditions")
    possible_near_term_changes: List[str] = Field(min_length=1, description="Possible near-term changes expressed with appropriately qualified language")
    monitoring_and_action_focus: List[str] = Field(min_length=1, description="Practical monitoring or action focus")
    limitations: List[str] = Field(default_factory=list, description="Model boundary conditions and uncertainties")
    data_status: DataStatus = Field(description="Data provenance: OBSERVED | MODELLED | CACHED | LIVE | SIMULATION")
    provenance_label: str = Field(default="AI-generated from modelled environmental data", description="Human-readable provenance badge")
    generated_by: str = Field(default="Gemini", description="Synthesis engine name")
    ai_status: str = Field(default="AI-GENERATED", description="Status of AI narrative generation")

    # Frontend UI compatibility fields
    factors: List[EnvironmentalOutlookFactor] = Field(default_factory=list, description="Structured UI factors list")
    title: Optional[str] = None
    hindiHeadline: Optional[str] = None
    currentSummary: Optional[str] = None
    next24Hours: Optional[str] = None
    potentialImpact: Optional[str] = None
    ventilationIndex: Optional[str] = None

    # Underlying grounded context
    location: GroundedLocation
    air_quality: Optional[GroundedAirQuality] = None
    weather: Optional[GroundedWeather] = None
    forecast: Optional[GroundedForecast] = None
    provenance: Optional[GroundedProvenance] = None

