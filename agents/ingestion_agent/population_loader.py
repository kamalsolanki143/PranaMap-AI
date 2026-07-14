"""Load population density data from WorldPop or census sources."""

from __future__ import annotations

import csv
import logging
from pathlib import Path
from typing import Any

import requests

logger = logging.getLogger(__name__)

WORLDPOP_API = "https://api.worldpop.org/v1/services/stats"


class PopulationLoader:
    """Load gridded population density estimates.

    Uses WorldPop API or falls back to local census CSV files.

    Attributes:
        cache_dir: Directory for downloaded raster metadata.
    """

    def __init__(self, cache_dir: Path | None = None) -> None:
        self.cache_dir = cache_dir or Path(".cache/population")
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def load(self, region: str, timestamp: str) -> dict[str, Any]:
        """Load population density for a region.

        Args:
            region: Region name or bounding box.
            timestamp: Year or date for population data.

        Returns:
            Dict with population density stats and demographics.
        """
        api_data = self._fetch_from_api(region)
        if api_data.get("total_population", 0) > 0:
            return api_data

        return self._load_from_local(region)

    def _fetch_from_api(self, region: str) -> dict[str, Any]:
        """Fetch population stats from WorldPop API.

        Args:
            region: Region identifier.

        Returns:
            Population statistics dict.
        """
        try:
            resp = requests.get(
                WORLDPOP_API,
                params={
                    "dataset": "ppp_2020_1km_Aggregated",
                    "iso3": region,
                    "ver": "2.0",
                },
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()

            return {
                "total_population": data.get("data", {}).get("total", 0),
                "mean_density": data.get("data", {}).get("mean", 0),
                "max_density": data.get("data", {}).get("max", 0),
                "area_sq_km": data.get("data", {}).get("area", 0),
                "source": "worldpop_api",
            }
        except requests.RequestException as exc:
            logger.warning("WorldPop API failed: %s", exc)
            return {"total_population": 0, "source": "api_failed"}

    def _load_from_local(self, region: str) -> dict[str, Any]:
        """Load population data from local CSV.

        Args:
            region: Region name to match in CSV.

        Returns:
            Population stats from local data.
        """
        csv_path = self.cache_dir / "population_density.csv"
        if not csv_path.exists():
            logger.warning("No local population CSV at %s", csv_path)
            return {
                "total_population": 0,
                "mean_density": 0,
                "max_density": 0,
                "area_sq_km": 0,
                "source": "none",
            }

        with open(csv_path, newline="", encoding="utf-8") as fh:
            reader = csv.DictReader(fh)
            for row in reader:
                if row.get("region", "").lower() == region.lower():
                    return {
                        "total_population": int(row.get("population", 0)),
                        "mean_density": float(row.get("density_per_sq_km", 0)),
                        "max_density": float(row.get("max_density", 0)),
                        "area_sq_km": float(row.get("area_sq_km", 0)),
                        "source": "local_csv",
                    }

        return {"total_population": 0, "source": "not_found"}
