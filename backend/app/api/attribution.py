"""PranaMap AI - Source Attribution Endpoints.

Provides transparent source contribution breakdowns (Traffic, Construction, Biomass, Industrial)
and multi-modal physical evidence points.
"""

from typing import Optional
from fastapi import APIRouter, Path, Query
from app.services.attribution_service import attribution_service

router = APIRouter()


@router.get("/attribution/{city_id}/{ward_id}")
async def get_city_ward_attribution(
    city_id: str = Path(..., description="City ID"),
    ward_id: str = Path(..., description="Ward/Station identifier"),
):
    """Get source attribution breakdown and physical evidence for a specific ward."""
    return attribution_service.get_attribution(city_id=city_id, ward_id=ward_id)


@router.get("/attribution/demo")
async def get_attribution_demo(station: Optional[str] = Query("DL-422")):
    """Backward-compatible attribution demo endpoint."""
    return attribution_service.get_attribution(city_id="delhi-ncr", ward_id="anand-vihar")


@router.get("/attribution/{station_id}")
async def get_attribution_by_station(station_id: str):
    """Backward-compatible station-based attribution endpoint."""
    return attribution_service.get_attribution(city_id="delhi-ncr", ward_id=station_id)
