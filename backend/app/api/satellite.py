from fastapi import APIRouter

from app.schemas.forecast import SatelliteData

router = APIRouter()


@router.get("/satellite/latest", response_model=SatelliteData)
async def get_latest_satellite_data():
    """Get latest satellite-derived aerosol optical depth data."""
    return SatelliteData(
        aod_value=None,
        source="MODIS",
        timestamp=None,
        coverage_area=None,
    )
