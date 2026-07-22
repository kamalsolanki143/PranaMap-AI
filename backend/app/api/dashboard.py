from fastapi import APIRouter
from app.api.demo import command_center

router = APIRouter()


@router.get("/dashboard/summary")
async def get_dashboard_summary():
    """Get city-wide dashboard summary with key metrics."""
    return await command_center()

