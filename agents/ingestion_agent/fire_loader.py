"""Load active fire data from NASA FIRMS API."""

from __future__ import annotations

import logging
from typing import Any

import requests

logger = logging.getLogger(__name__)

FIRMS_API_URL = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"


class FireLoader:
    """Fetch active fire hotspots from NASA FIRMS.

    Uses the FIRMS area API to get fire radiative power (FRP)
    and hotspot locations within a bounding box.

    Attributes:
        api_key: NASA FIRMS API key.
    """

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key

    def load(self, region: str, timestamp: str) -> dict[str, Any]:
        """Load fire hotspot data for a region.

        Args:
            region: Bounding box string (west,south,east,north) or city name.
            timestamp: Date for fire data retrieval.

        Returns:
            Dict with fire count, total FRP, and hotspot list.
        """
        hotspots = self._fetch_hotspots(region)
        return {
            "fire_count": len(hotspots),
            "total_frp": sum(h.get("frp", 0) for h in hotspots),
            "hotspots": hotspots,
            "region": region,
            "timestamp": timestamp,
        }

    def _fetch_hotspots(self, region: str) -> list[dict[str, Any]]:
        """Query the FIRMS CSV API for active fires.

        Args:
            region: Bounding box or region identifier.

        Returns:
            List of fire hotspot records.
        """
        if not self.api_key:
            logger.warning("FIRMS API key not configured; returning empty fire data.")
            return []

        try:
            resp = requests.get(
                FIRMS_API_URL,
                params={
                    "MAP_KEY": self.api_key,
                    "AREA": region,
                    "SOURCE": "VIIRS_SNPP_NRT",
                    "Days": 1,
                },
                timeout=30,
            )
            resp.raise_for_status()
            return self._parse_csv_response(resp.text)
        except requests.RequestException as exc:
            logger.error("FIRMS API request failed: %s", exc)
            return []

    @staticmethod
    def _parse_csv_response(csv_text: str) -> list[dict[str, Any]]:
        """Parse FIRMS CSV response into dicts.

        Args:
            csv_text: Raw CSV string from FIRMS API.

        Returns:
            List of hotspot dictionaries.
        """
        import csv
        import io

        reader = csv.DictReader(io.StringIO(csv_text))
        hotspots: list[dict[str, Any]] = []
        for row in reader:
            hotspots.append({
                "latitude": float(row.get("latitude", 0)),
                "longitude": float(row.get("longitude", 0)),
                "frp": float(row.get("frp", 0)),
                "confidence": row.get("confidence", ""),
                "satellite": row.get("satellite", ""),
                "acq_date": row.get("acq_date", ""),
                "brightness": float(row.get("bright_ti4", 0)),
            })
        return hotspots
