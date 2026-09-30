from typing import Optional
from fastapi import APIRouter, Query, Path

from app.schemas.forecast import WeatherData
from app.schemas.intelligence import EnvironmentalOutlookOutput
from app.services.grounding_service import grounding_service
from app.services.gemini_service import gemini_service

router = APIRouter()


@router.get("/weather/current", response_model=WeatherData)
async def get_current_weather():
    """Get current weather data relevant to air quality."""
    return WeatherData(
        temperature=0.0,
        humidity=0.0,
        wind_speed=0.0,
        wind_direction=0,
        pressure=0.0,
        visibility=0.0,
    )


@router.get("/weather/outlook", response_model=EnvironmentalOutlookOutput)
@router.get("/outlook", response_model=EnvironmentalOutlookOutput)
async def get_environmental_outlook(
    location: Optional[str] = Query("delhi-ncr", description="Location name or slug, e.g. raniwara, anand-vihar, delhi-ncr"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    lang: Optional[str] = Query("en", description="Target language: en, hi, mr"),
):
    """Generate validated, structured Environmental Outlook connecting real PranaMap data to Gemini."""
    grounded_ctx = await grounding_service.build_grounded_input(
        location_name_or_id=location,
        lat=lat,
        lon=lon,
    )
    return await gemini_service.generate_environmental_outlook(
        context=grounded_ctx,
        language=lang or "en",
    )


@router.get("/outlook/{location_id}", response_model=EnvironmentalOutlookOutput)
async def get_environmental_outlook_by_id(
    location_id: str = Path(..., description="Location slug or station ID"),
    lang: Optional[str] = Query("en", description="Target language: en, hi, mr"),
):
    """Generate Environmental Outlook for a specific location identifier."""
    grounded_ctx = await grounding_service.build_grounded_input(
        location_name_or_id=location_id,
    )
    return await gemini_service.generate_environmental_outlook(
        context=grounded_ctx,
        language=lang or "en",
    )

