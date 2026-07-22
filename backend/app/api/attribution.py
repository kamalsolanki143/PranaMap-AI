from fastapi import APIRouter
from app.api.demo import attribution_demo

router = APIRouter()


@router.get("/attribution/{station_id}")
async def get_attribution(station_id: str):
    """Get source attribution breakdown for a specific station/ward."""
    return await attribution_demo(station=station_id)

