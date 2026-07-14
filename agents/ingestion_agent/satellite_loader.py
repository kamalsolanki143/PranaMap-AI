"""Load satellite / NDVI data from GEE or Copernicus."""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


class SatelliteLoader:
    """Load satellite imagery indices (NDVI, aerosol optical depth).

    Supports Google Earth Engine (GEE) and Copernicus Open Access Hub.
    Currently stubbed for integration.

    Attributes:
        gee_project: GEE project identifier.
        copernicus_user: Copernicus API username.
    """

    def __init__(
        self,
        gee_project: str | None = None,
        copernicus_user: str | None = None,
    ) -> None:
        self.gee_project = gee_project
        self.copernicus_user = copernicus_user

    def load(self, region: str, timestamp: str) -> dict[str, Any]:
        """Load satellite-derived metrics for a region.

        Args:
            region: Bounding box or region name.
            timestamp: Target date for image acquisition.

        Returns:
            Dict containing NDVI, AOD, and metadata.
        """
        ndvi = self._fetch_ndvi(region, timestamp)
        aod = self._fetch_aod(region, timestamp)

        return {
            "ndvi": ndvi,
            "aod": aod,
            "region": region,
            "timestamp": timestamp,
        }

    def _fetch_ndvi(self, region: str, timestamp: str) -> dict[str, Any]:
        """Fetch Normalized Difference Vegetation Index.

        Args:
            region: Bounding box [west, south, east, north].
            timestamp: Target date (ISO-8601).

        Returns:
            NDVI statistics dict with mean, min, max.
        """
        logger.info("NDVI fetch stubbed for region=%s date=%s", region, timestamp)
        return {
            "mean_ndvi": 0.45,
            "min_ndvi": 0.12,
            "max_ndvi": 0.78,
            "pixel_count": 0,
            "source": "gee_stub",
        }

    def _fetch_aod(self, region: str, timestamp: str) -> dict[str, Any]:
        """Fetch Aerosol Optical Depth from satellite data.

        Args:
            region: Bounding box or region name.
            timestamp: Target date.

        Returns:
            AOD statistics dict.
        """
        logger.info("AOD fetch stubbed for region=%s date=%s", region, timestamp)
        return {
            "mean_aod": 0.35,
            "max_aod": 0.92,
            "source": "copernicus_stub",
        }
