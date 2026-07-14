"""Load road network and POI data from OpenStreetMap via Overpass API."""

from __future__ import annotations

import logging
from typing import Any

import requests

logger = logging.getLogger(__name__)

OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"


class OSMLoader:
    """Fetch road and point-of-interest data from OpenStreetMap.

    Uses the Overpass API to query road density, traffic features,
    and industrial/commercial POIs within a bounding box.

    Attributes:
        overpass_url: Overpass API endpoint.
    """

    def __init__(self, overpass_url: str | None = None) -> None:
        self.overpass_url = overpass_url or OVERPASS_API_URL

    def load(self, region: str, timestamp: str) -> dict[str, Any]:
        """Load OSM data for a region.

        Args:
            region: Bounding box string or region name.
            timestamp: Timestamp for data freshness checks.

        Returns:
            Dict with road network stats and POI classifications.
        """
        roads = self._fetch_roads(region)
        pois = self._fetch_pois(region)
        return {
            "road_length_km": roads.get("total_length_km", 0),
            "road_density_km_per_sq_km": roads.get("density", 0),
            "major_road_count": roads.get("major_count", 0),
            "poi_counts": pois,
            "region": region,
        }

    def _fetch_roads(self, region: str) -> dict[str, Any]:
        """Query Overpass for road network statistics.

        Args:
            region: Bounding box (south,west,north,east).

        Returns:
            Dict with total road length and density.
        """
        query = f"""
        [out:json][timeout:25];
        (
          way["highway"~"motorway|trunk|primary|secondary|tertiary"]({region});
        );
        out body;
        """
        try:
            resp = requests.post(
                self.overpass_url,
                data={"data": query},
                timeout=30,
            )
            resp.raise_for_status()
            elements = resp.json().get("elements", [])

            total_length_m = 0.0
            major_count = 0
            for elem in elements:
                tags = elem.get("tags", {})
                highway = tags.get("highway", "")
                if highway in ("motorway", "trunk"):
                    major_count += 1
                if "length" in elem:
                    total_length_m += elem["length"]

            return {
                "total_length_km": round(total_length_m / 1000, 2),
                "major_count": major_count,
                "density": 0.0,
                "segment_count": len(elements),
            }
        except requests.RequestException as exc:
            logger.error("Overpass road query failed: %s", exc)
            return {"total_length_km": 0, "major_count": 0, "density": 0, "segment_count": 0}

    def _fetch_pois(self, region: str) -> dict[str, int]:
        """Fetch point-of-interest counts by category.

        Args:
            region: Bounding box or area query.

        Returns:
            Dict mapping POI category to count.
        """
        categories = {
            "industrial": '"landuse"="industrial"',
            "commercial": '"landuse"="commercial"',
            "construction": '"landuse"="construction"',
            "power_station": '"power"="plant"',
        }
        counts: dict[str, int] = {}
        for name, tag_filter in categories.items():
            query = f"""
            [out:json][timeout:15];
            (
              node[{tag_filter}]({region});
              way[{tag_filter}]({region});
            );
            out count;
            """
            try:
                resp = requests.post(self.overpass_url, data={"data": query}, timeout=20)
                resp.raise_for_status()
                data = resp.json()
                elements = data.get("elements", [])
                count = elements[0].get("tags", {}).get("total", 0) if elements else 0
                counts[name] = count
            except requests.RequestException:
                counts[name] = 0

        return counts
