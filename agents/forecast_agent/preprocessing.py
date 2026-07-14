"""Data cleaning, imputation, and source merging."""

from __future__ import annotations

import logging
from typing import Any

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class DataPreprocessor:
    """Clean, validate, and merge multi-source environmental data.

    Handles missing value imputation, outlier detection, unit normalization,
    and spatial joining of data from disparate sources.
    """

    def __init__(self, outlier_zscore_threshold: float = 3.5) -> None:
        self.outlier_zscore_threshold = outlier_zscore_threshold

    def merge_sources(
        self,
        aqi: list[dict[str, Any]],
        weather: dict[str, Any],
        satellite: dict[str, Any],
        fire: dict[str, Any],
        osm: dict[str, Any],
        population: dict[str, Any],
    ) -> list[dict[str, Any]]:
        """Merge all data sources into a unified record list.

        Args:
            aqi: Raw AQI records.
            weather: Weather data dict.
            satellite: Satellite index data.
            fire: Fire hotspot data.
            osm: Road/POI data.
            population: Population density data.

        Returns:
            List of merged records, one per AQI station.
        """
        if not aqi:
            logger.warning("No AQI records to merge; returning empty list.")
            return []

        current_weather = weather.get("current", {})
        merged: list[dict[str, Any]] = []

        for record in aqi:
            row: dict[str, Any] = {
                "station_id": record.get("station_id", ""),
                "city": record.get("city", ""),
                "latitude": record.get("latitude", 0),
                "longitude": record.get("longitude", 0),
                "aqi_value": record.get("aqi_value", 0),
                "pollutant": record.get("pollutant", ""),
                "timestamp": record.get("timestamp", ""),
            }

            row["temperature_c"] = current_weather.get("temperature_c")
            row["humidity_pct"] = current_weather.get("humidity_pct")
            row["wind_speed_ms"] = current_weather.get("wind_speed_ms")
            row["wind_deg"] = current_weather.get("wind_deg")

            row["mean_ndvi"] = satellite.get("ndvi", {}).get("mean_ndvi")
            row["mean_aod"] = satellite.get("aod", {}).get("mean_aod")

            row["fire_count"] = fire.get("fire_count", 0)
            row["total_frp"] = fire.get("total_frp", 0)

            row["road_density"] = osm.get("road_density_km_per_sq_km", 0)
            row["industrial_poi_count"] = osm.get("poi_counts", {}).get("industrial", 0)

            row["population_density"] = population.get("mean_density", 0)

            merged.append(row)

        merged = self.clean_dataframe(merged)
        return merged

    def clean_dataframe(self, records: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Clean and validate a list of records.

        Applies outlier capping and missing-value imputation.

        Args:
            records: Raw merged records.

        Returns:
            Cleaned records list.
        """
        if not records:
            return []

        df = pd.DataFrame(records)

        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        for col in numeric_cols:
            df[col] = self._impute_series(df[col])

        df = self._cap_outliers(df)

        return df.to_dict(orient="records")

    def _impute_series(self, series: pd.Series) -> pd.Series:
        """Impute missing values using forward-fill then median.

        Args:
            series: Input numeric series.

        Returns:
            Series with no missing values.
        """
        if series.isna().all():
            return series.fillna(0)
        filled = series.ffill()
        if filled.isna().any():
            filled = filled.fillna(filled.median())
        return filled

    def _cap_outliers(self, df: pd.DataFrame) -> pd.DataFrame:
        """Cap outliers beyond z-score threshold.

        Args:
            df: Input DataFrame.

        Returns:
            DataFrame with capped outlier values.
        """
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            mean = df[col].mean()
            std = df[col].std()
            if std == 0 or pd.isna(std):
                continue
            lower = mean - self.outlier_zscore_threshold * std
            upper = mean + self.outlier_zscore_threshold * std
            df[col] = df[col].clip(lower, upper)
        return df
