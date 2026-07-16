"""Load weather data from OpenWeatherMap API."""

from __future__ import annotations

import logging
from typing import Any

import requests

logger = logging.getLogger(__name__)

OPENWEATHER_CURRENT = "https://api.openweathermap.org/data/2.5/weather"
OPENWEATHER_FORECAST = "https://api.openweathermap.org/data/2.5/forecast"


class WeatherLoader:
    """Fetch current and forecast weather from OpenWeatherMap.

    Attributes:
        api_key: OpenWeatherMap API key.
        units: Temperature units (metric, imperial, standard).
        lang: Response language code.
    """

    def __init__(
        self,
        api_key: str | None = None,
        units: str = "metric",
        lang: str = "en",
    ) -> None:
        self.api_key = api_key
        self.units = units
        self.lang = lang

    def load(self, region: str, timestamp: str) -> dict[str, Any]:
        """Load current weather + forecast for a region.

        Args:
            region: City name or lat,lon pair.
            timestamp: ISO-8601 timestamp (used for forecast filtering).

        Returns:
            Dict with keys 'current' and 'forecast'.
        """
        current = self._fetch_current(region)
        forecast = self._fetch_forecast(region)
        return {"current": current, "forecast": forecast}

    def _fetch_current(self, region: str) -> dict[str, Any]:
        """Fetch current weather conditions.

        Args:
            region: City name or coordinates.

        Returns:
            Normalized current weather dict.

        Raises:
            ValueError: If API key is missing.
            requests.HTTPError: On HTTP errors.
        """
        if not self.api_key:
            logger.warning("OpenWeatherMap API key not set; returning empty weather data.")
            return self._empty_current()

        resp = requests.get(
            OPENWEATHER_CURRENT,
            params={
                "q": region,
                "appid": self.api_key,
                "units": self.units,
                "lang": self.lang,
            },
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()

        main = data.get("main", {})
        wind = data.get("wind", {})
        return {
            "temperature_c": main.get("temp"),
            "humidity_pct": main.get("humidity"),
            "pressure_hpa": main.get("pressure"),
            "wind_speed_ms": wind.get("speed"),
            "wind_deg": wind.get("deg"),
            "description": data.get("weather", [{}])[0].get("description", ""),
        }

    def _fetch_forecast(self, region: str) -> list[dict[str, Any]]:
        """Fetch 5-day / 3-hour forecast.

        Args:
            region: City name or coordinates.

        Returns:
            List of forecast entries.
        """
        if not self.api_key:
            return []

        resp = requests.get(
            OPENWEATHER_FORECAST,
            params={
                "q": region,
                "appid": self.api_key,
                "units": self.units,
                "lang": self.lang,
            },
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()

        entries: list[dict[str, Any]] = []
        for item in data.get("list", []):
            main = item.get("main", {})
            wind = item.get("wind", {})
            entries.append({
                "dt_txt": item.get("dt_txt"),
                "temperature_c": main.get("temp"),
                "humidity_pct": main.get("humidity"),
                "wind_speed_ms": wind.get("speed"),
                "wind_deg": wind.get("deg"),
            })
        return entries

    @staticmethod
    def _empty_current() -> dict[str, Any]:
        """Return an empty current-weather structure."""
        return {
            "temperature_c": None,
            "humidity_pct": None,
            "pressure_hpa": None,
            "wind_speed_ms": None,
            "wind_deg": None,
            "description": "",
        }
