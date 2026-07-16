"""Load AQI data from CPCB APIs, WAQI, or CSV files."""

from __future__ import annotations

import csv
import logging
from pathlib import Path
from typing import Any

import requests

from agents.langgraph.state import AQIRecord

logger = logging.getLogger(__name__)

AQI_API_ENDPOINTS = {
    "waqi": "https://api.waqi.info/feed/{city}/",
    "cpcb": "https://app.cpcbccr.com/caaqms/caaqms_viewdata_v2",
}


class AQILoader:
    """Load air quality index data from multiple sources.

    Supports WAQI (World Air Quality Index) API and CPCB CSV files.
    Falls back gracefully when API keys are missing.

    Attributes:
        api_key: WAQI API key.
        cache_dir: Directory for cached CSV responses.
    """

    def __init__(
        self,
        api_key: str | None = None,
        cache_dir: Path | None = None,
    ) -> None:
        self.api_key = api_key
        self.cache_dir = cache_dir or Path(".cache/aqi")
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def load(self, region: str, timestamp: str) -> list[AQIRecord]:
        """Load AQI records for a region.

        Tries API first, then falls back to cached CSV data.

        Args:
            region: Region name or city identifier.
            timestamp: ISO-8601 timestamp for the query window.

        Returns:
            List of AQIRecord dicts.
        """
        try:
            return self._load_from_api(region)
        except Exception as exc:
            logger.warning("API load failed for %s: %s. Trying CSV fallback.", region, exc)
            return self._load_from_csv(region)

    def _load_from_api(self, region: str) -> list[AQIRecord]:
        """Fetch AQI data from the WAQI REST API.

        Args:
            region: City or region name.

        Returns:
            Parsed AQI records.

        Raises:
            ValueError: If API key is not configured.
            requests.HTTPError: On non-200 response.
        """
        if not self.api_key:
            raise ValueError("WAQI API key not configured")

        url = AQI_API_ENDPOINTS["waqi"].format(city=region)
        response = requests.get(url, params={"token": self.api_key}, timeout=30)
        response.raise_for_status()
        payload = response.json()

        records: list[AQIRecord] = []
        data = payload.get("data", {})
        if isinstance(data, dict):
            records.append(
                AQIRecord(
                    station_id=data.get("idx", "unknown"),
                    city=data.get("city", {}).get("name", region),
                    latitude=data.get("city", {}).get("geo", [0, 0])[0],
                    longitude=data.get("city", {}).get("geo", [0, 0])[1],
                    aqi_value=int(data.get("aqi", 0)),
                    pollutant=data.get("dominentpol", "pm25"),
                    timestamp=data.get("time", {}).get("iso", ""),
                )
            )
        return records

    def _load_from_csv(self, region: str) -> list[AQIRecord]:
        """Load AQI records from a cached CSV file.

        Args:
            region: Region name used to locate the CSV file.

        Returns:
            List of parsed AQIRecord entries.
        """
        csv_path = self.cache_dir / f"{region.lower().replace(' ', '_')}_aqi.csv"
        if not csv_path.exists():
            logger.warning("No CSV cache found at %s", csv_path)
            return []

        records: list[AQIRecord] = []
        with open(csv_path, newline="", encoding="utf-8") as fh:
            reader = csv.DictReader(fh)
            for row in reader:
                records.append(
                    AQIRecord(
                        station_id=row.get("station_id", ""),
                        city=row.get("city", region),
                        latitude=float(row.get("latitude", 0)),
                        longitude=float(row.get("longitude", 0)),
                        aqi_value=int(row.get("aqi_value", 0)),
                        pollutant=row.get("pollutant", "pm25"),
                        timestamp=row.get("timestamp", ""),
                    )
                )
        return records
