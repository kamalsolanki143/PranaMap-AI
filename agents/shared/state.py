"""Shared state definitions used across agent modules."""

from __future__ import annotations

from enum import Enum
from typing import Any, Literal
from typing_extensions import TypedDict


class SeverityLevel(str, Enum):
    """Enumeration of AQI severity levels."""
    GOOD = "good"
    MODERATE = "moderate"
    UNHEALTHY_FOR_SENSITIVE = "unhealthy_for_sensitive"
    UNHEALTHY = "unhealthy"
    VERY_UNHEALTHY = "very_unhealthy"
    HAZARDOUS = "hazardous"


class DataSource(str, Enum):
    """Enumeration of supported data sources."""
    AQI = "aqi"
    WEATHER = "weather"
    SATELLITE = "satellite"
    FIRE = "fire"
    OSM = "osm"
    POPULATION = "population"


class InterventionType(str, Enum):
    """Enumeration of enforcement intervention types."""
    TRAFFIC_RESTRICTIONS = "traffic_restrictions"
    EMISSION_CONTROLS = "emission_controls"
    FIRE_SUPPRESSION = "fire_suppression"
    DUST_CONTROL = "dust_control"
    PUBLIC_TRANSIT_BOOST = "public_transit_boost"
    GREEN_BARRIER = "green_barrier"
    MONITORING = "monitoring"


class NotificationChannel(str, Enum):
    """Enumeration of notification delivery channels."""
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"


class StationRecord(TypedDict):
    """Normalized station-level data record."""
    station_id: str
    city: str
    latitude: float
    longitude: float
    aqi_value: int
    pollutant: str
    timestamp: str
    temperature_c: float | None
    humidity_pct: float | None
    wind_speed_ms: float | None
    wind_deg: float | None
    mean_ndvi: float | None
    mean_aod: float | None
    fire_count: int
    total_frp: float
    road_density: float
    industrial_poi_count: int
    population_density: float


class ModelConfig(TypedDict):
    """Configuration for ML models."""
    model_type: Literal["xgboost", "lightgbm"]
    model_path: str
    horizon_hours: int
    batch_size: int
    confidence_threshold: float


class RegionConfig(TypedDict):
    """Configuration for a geographic region."""
    region_id: str
    name: str
    bounding_box: tuple[float, float, float, float]
    station_ids: list[str]
    notification_contacts: dict[str, list[str]]


class PipelineRunMetadata(TypedDict):
    """Metadata for a single pipeline run."""
    run_id: str
    region: str
    started_at: str
    completed_at: str | None
    status: Literal["pending", "running", "completed", "failed"]
    error_count: int
    forecast_count: int
    attribution_count: int
    advisory_count: int
