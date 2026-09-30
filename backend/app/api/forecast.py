"""PranaMap AI - Forecast Endpoints.

Provides 72-hour calibrated air quality forecasts, peak window identification,
and transparent feature contribution influences for any Indian city or ward.
"""

from typing import Optional
from fastapi import APIRouter, Path, Query
from app.services.forecast_service import forecast_service

router = APIRouter()


@router.get("/forecast/{city_id}")
async def get_city_forecast(
    city_id: str = Path(..., description="City ID"),
    ward_id: Optional[str] = Query(None, description="Optional ward identifier"),
):
    """Retrieve 72-hour forecast with confidence bands and feature contributions for a city."""
    return forecast_service.get_forecast(city_id=city_id, ward_id=ward_id)


@router.get("/forecast/{city_id}/{ward_id}")
async def get_city_ward_forecast(
    city_id: str = Path(..., description="City ID"),
    ward_id: str = Path(..., description="Ward identifier"),
):
    """Retrieve hyperlocal 72-hour forecast for a specific city ward/station."""
    return forecast_service.get_forecast(city_id=city_id, ward_id=ward_id)


@router.get("/forecast")
async def get_forecast_default(ward: Optional[str] = Query("delhi-ncr")):
    """Backward-compatible endpoint for forecast retrieval."""
    city_id = "delhi-ncr"
    ward_id = None
    if ward and "anand" in ward.lower():
        ward_id = "anand-vihar"
    elif ward and "dwarka" in ward.lower():
        ward_id = "dwarka"
    return forecast_service.get_forecast(city_id=city_id, ward_id=ward_id)


@router.get("/forecast/demo")
async def get_forecast_demo(ward: Optional[str] = Query("Dwarka Ward 34")):
    """Backward-compatible demo forecast endpoint."""
    return forecast_service.get_forecast(city_id="delhi-ncr", ward_id="dwarka")
