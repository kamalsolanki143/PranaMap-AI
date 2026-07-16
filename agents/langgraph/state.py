"""TypedDict state definition for the LangGraph pipeline."""

from __future__ import annotations

from typing import Annotated, Any, Literal
from typing_extensions import TypedDict
from datetime import datetime


class AQIRecord(TypedDict):
    station_id: str
    city: str
    latitude: float
    longitude: float
    aqi_value: int
    pollutant: str
    timestamp: str


class ForecastResult(TypedDict):
    station_id: str
    pollutant: str
    predicted_aqi: float
    confidence: float
    horizon_hours: int


class AttributionResult(TypedDict):
    station_id: str
    dominant_source: str
    source_breakdown: dict[str, float]
    confidence: float
    evidence: list[str]


class EnforcementAction(TypedDict):
    priority_rank: int
    location: str
    intervention_type: str
    expected_impact_pct: float
    resource_requirement: Literal["low", "medium", "high"]


class AdvisoryOutput(TypedDict):
    region: str
    message_en: str
    message_hi: str | None
    message_mr: str | None
    severity: Literal["good", "moderate", "unhealthy", "very_unhealthy", "hazardous"]
    target_groups: list[str]


class PipelineState(TypedDict):
    """Central state shared across all nodes in the graph."""

    run_id: str
    timestamp: str
    region: str

    raw_aqi: list[AQIRecord]
    raw_weather: dict[str, Any]
    raw_satellite: dict[str, Any]
    raw_fire: dict[str, Any]
    raw_osm: dict[str, Any]
    raw_population: dict[str, Any]

    processed_data: Annotated[list[dict[str, Any]], "cleaned & merged"]

    forecast_results: list[ForecastResult]
    attribution_results: list[AttributionResult]
    enforcement_actions: list[EnforcementAction]
    advisories: list[AdvisoryOutput]

    errors: Annotated[list[str], "accumulated error messages"]
    status: Literal["pending", "running", "completed", "failed"]
