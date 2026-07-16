from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ForecastPoint(BaseModel):
    hour: int
    predicted_aqi: float
    predicted_category: str
    confidence: float


class ForecastSummary(BaseModel):
    ward_id: int
    ward_name: str
    current_aqi: float
    forecast_aqi: float
    trend: str


class ForecastResponse(BaseModel):
    ward_id: int
    forecasts: list[ForecastPoint]


class WeatherData(BaseModel):
    temperature: float
    humidity: float
    wind_speed: float
    wind_direction: int
    pressure: float
    visibility: float


class SatelliteData(BaseModel):
    aod_value: Optional[float] = None
    source: str = "MODIS"
    timestamp: Optional[datetime] = None
    coverage_area: Optional[str] = None
