from fastapi import APIRouter, Query
from app.api.demo import forecast_demo

router = APIRouter()


@router.get("/forecast")
async def get_forecasts(
    ward: str = Query("Dwarka Ward 34"),
):
    """Get AQI forecasts for all wards or specified ward."""
    return await forecast_demo(ward=ward)


@router.get("/forecast/{ward_id}")
async def get_forecast_by_ward(
    ward_id: str,
):
    """Get detailed AQI forecast for a specific ward."""
    return await forecast_demo(ward=ward_id)

