from fastapi import APIRouter, Query
from typing import Optional

from app.schemas.forecast import ForecastResponse, ForecastSummary

router = APIRouter()


@router.get("/forecast", response_model=list[ForecastSummary])
async def get_forecasts(
    limit: int = Query(10, ge=1, le=50),
    hours_ahead: int = Query(24, ge=1, le=72),
):
    """Get AQI forecasts for all wards."""
    return []


@router.get("/forecast/{ward_id}", response_model=ForecastResponse)
async def get_forecast_by_ward(
    ward_id: int,
    hours_ahead: int = Query(24, ge=1, le=72),
):
    """Get detailed AQI forecast for a specific ward."""
    return ForecastResponse(ward_id=ward_id, forecasts=[])
