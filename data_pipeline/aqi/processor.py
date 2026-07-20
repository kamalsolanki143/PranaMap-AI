"""AQI data processor: normalize, fill gaps, and interpolate."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import pandas as pd

logger = logging.getLogger(__name__)

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_SYNTHETIC_CSV = _PROJECT_ROOT / "ml" / "datasets" / "pune_aqi_train.csv"

AQI_COLUMNS = [
    "recorded_at",
    "ward_name",
    "ward_id",
    "station_id",
    "latitude",
    "longitude",
    "aqi_value",
    "pm25",
    "pm10",
    "no2",
    "so2",
    "co",
    "o3",
]


def load(source: str = "synthetic", **kwargs: Any) -> pd.DataFrame:
    """Load and clean AQI data.

    Args:
        source: Data source — 'synthetic' or 'api'.
        **kwargs: Optional filters (ward_name, ward_id).

    Returns:
        Cleaned DataFrame with standardized AQI columns.

    Raises:
        FileNotFoundError: If synthetic CSV is missing.
        ValueError: If source type is unsupported.
    """
    if source == "synthetic":
        df = _load_synthetic(**kwargs)
    elif source == "api":
        df = _load_from_api(**kwargs)
    else:
        raise ValueError(f"Unsupported source: {source!r}. Use 'synthetic' or 'api'.")

    df = _normalize(df)
    df = _fill_gaps(df)
    logger.info("AQI processor loaded %d records.", len(df))
    return df


def _load_synthetic(**kwargs: Any) -> pd.DataFrame:
    """Load synthetic AQI data from the training CSV."""
    if not _SYNTHETIC_CSV.exists():
        raise FileNotFoundError(f"Synthetic CSV not found: {_SYNTHETIC_CSV}")

    df = pd.read_csv(_SYNTHETIC_CSV, parse_dates=["recorded_at"])

    ward_name = kwargs.get("ward_name")
    if ward_name:
        df = df[df["ward_name"] == ward_name].copy()

    ward_id = kwargs.get("ward_id")
    if ward_id is not None:
        df = df[df["ward_id"] == ward_id].copy()

    return df[AQI_COLUMNS]


def _load_from_api(**kwargs: Any) -> pd.DataFrame:
    """Placeholder for loading AQI from a live API."""
    raise NotImplementedError("Live API source not yet implemented.")


def _normalize(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize column types and sort by time."""
    df["recorded_at"] = pd.to_datetime(df["recorded_at"], errors="coerce")
    df = df.sort_values(["ward_id", "recorded_at"]).reset_index(drop=True)

    numeric_cols = ["aqi_value", "pm25", "pm10", "no2", "so2", "co", "o3"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    return df


def _fill_gaps(df: pd.DataFrame) -> pd.DataFrame:
    """Forward-fill gaps up to 2 hours, then linear interpolate remaining NaNs.

    Operates per-ward to avoid bleeding across locations.
    """
    numeric_cols = ["aqi_value", "pm25", "pm10", "no2", "so2", "co", "o3"]

    filled_parts: list[pd.DataFrame] = []
    for _, group in df.groupby("ward_id"):
        group = group.set_index("recorded_at")
        group[numeric_cols] = group[numeric_cols].ffill(limit=2)
        group[numeric_cols] = group[numeric_cols].interpolate(method="linear")
        group = group.reset_index()
        filled_parts.append(group)

    if filled_parts:
        return pd.concat(filled_parts, ignore_index=True)
    return df
