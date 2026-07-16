from fastapi import APIRouter

from app.schemas.forecast import WeatherData

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
