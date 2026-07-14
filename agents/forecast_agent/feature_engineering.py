"""Feature engineering: lag features, rolling stats, wind components."""

from __future__ import annotations

import logging
from typing import Any

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class FeatureEngineer:
    """Create predictive features from merged environmental data.

    Generates temporal lag features, rolling window statistics,
    wind decomposition, interaction terms, and cyclical encodings.

    Attributes:
        lag_periods: List of lag hours to create.
        rolling_windows: List of rolling window sizes.
    """

    def __init__(
        self,
        lag_periods: list[int] | None = None,
        rolling_windows: list[int] | None = None,
    ) -> None:
        self.lag_periods = lag_periods or [1, 3, 6, 12, 24]
        self.rolling_windows = rolling_windows or [3, 6, 12, 24]

    def build_features(self, records: list[dict[str, Any]]) -> pd.DataFrame:
        """Build feature matrix from merged records.

        Args:
            records: List of merged data records.

        Returns:
            DataFrame with engineered features ready for model input.
        """
        if not records:
            return pd.DataFrame()

        df = pd.DataFrame(records)
        df = self._ensure_datetime(df)
        df = self._add_lag_features(df)
        df = self._add_rolling_features(df)
        df = self._add_wind_components(df)
        df = self._add_cyclical_time(df)
        df = self._add_interaction_features(df)
        df = self._add_aqi_bins(df)

        df = df.dropna()
        return df

    def _ensure_datetime(self, df: pd.DataFrame) -> pd.DataFrame:
        """Ensure timestamp column is datetime type.

        Args:
            df: Input DataFrame.

        Returns:
            DataFrame with parsed timestamp.
        """
        if "timestamp" in df.columns:
            df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
            df["hour"] = df["timestamp"].dt.hour
            df["day_of_week"] = df["timestamp"].dt.dayofweek
            df["month"] = df["timestamp"].dt.month
        return df

    def _add_lag_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create lagged AQI and weather features.

        Args:
            df: Input DataFrame sorted by time.

        Returns:
            DataFrame with lag columns added.
        """
        if "aqi_value" not in df.columns:
            return df

        for lag in self.lag_periods:
            df[f"aqi_lag_{lag}h"] = df["aqi_value"].shift(lag)
            if "temperature_c" in df.columns:
                df[f"temp_lag_{lag}h"] = df["temperature_c"].shift(lag)
            if "wind_speed_ms" in df.columns:
                df[f"wind_lag_{lag}h"] = df["wind_speed_ms"].shift(lag)

        return df

    def _add_rolling_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create rolling window statistics.

        Args:
            df: Input DataFrame.

        Returns:
            DataFrame with rolling mean, std, min, max columns.
        """
        if "aqi_value" not in df.columns:
            return df

        for window in self.rolling_windows:
            rolling = df["aqi_value"].rolling(window=window, min_periods=1)
            df[f"aqi_roll_mean_{window}h"] = rolling.mean()
            df[f"aqi_roll_std_{window}h"] = rolling.std()
            df[f"aqi_roll_min_{window}h"] = rolling.min()
            df[f"aqi_roll_max_{window}h"] = rolling.max()

        return df

    def _add_wind_components(self, df: pd.DataFrame) -> pd.DataFrame:
        """Decompose wind into u (east-west) and v (north-south) components.

        Args:
            df: Input DataFrame with wind_speed_ms and wind_deg.

        Returns:
            DataFrame with wind_u and wind_v columns.
        """
        if "wind_speed_ms" in df.columns and "wind_deg" in df.columns:
            rad = np.radians(df["wind_deg"].fillna(0))
            df["wind_u"] = df["wind_speed_ms"] * np.sin(rad)
            df["wind_v"] = df["wind_speed_ms"] * np.cos(rad)
        return df

    def _add_cyclical_time(self, df: pd.DataFrame) -> pd.DataFrame:
        """Encode cyclical time features using sin/cos transforms.

        Args:
            df: Input DataFrame with hour column.

        Returns:
            DataFrame with sin/cos hour features.
        """
        if "hour" in df.columns:
            df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
            df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)
        if "month" in df.columns:
            df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
            df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)
        return df

    def _add_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create interaction features between key variables.

        Args:
            df: Input DataFrame.

        Returns:
            DataFrame with interaction columns.
        """
        if "temperature_c" in df.columns and "humidity_pct" in df.columns:
            df["temp_humidity_interaction"] = df["temperature_c"] * df["humidity_pct"]

        if "fire_count" in df.columns and "wind_speed_ms" in df.columns:
            df["fire_wind_interaction"] = df["fire_count"] * df["wind_speed_ms"].fillna(0)

        if "road_density" in df.columns and "population_density" in df.columns:
            df["traffic_pop_interaction"] = df["road_density"] * df["population_density"]

        return df

    def _add_aqi_bins(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add categorical AQI severity bin.

        Args:
            df: Input DataFrame with aqi_value.

        Returns:
            DataFrame with aqi_bin column.
        """
        if "aqi_value" in df.columns:
            bins = [0, 50, 100, 150, 200, 300, 500]
            labels = [0, 1, 2, 3, 4, 5]
            df["aqi_bin"] = pd.cut(df["aqi_value"], bins=bins, labels=labels, include_lowest=True)
        return df
