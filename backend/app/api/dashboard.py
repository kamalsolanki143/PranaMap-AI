from fastapi import APIRouter

from app.schemas.dashboard import DashboardSummary

router = APIRouter()


@router.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary():
    """Get city-wide dashboard summary with key metrics."""
    return DashboardSummary(
        city_aqi=0,
        total_wards=0,
        hazardous_wards=0,
        active_enforcements=0,
        latest_updated=None,
    )
