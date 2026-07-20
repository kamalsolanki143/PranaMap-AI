"""Weather data processor: extract and convert meteorological variables."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import pandas as pd

logger = logging.getLogger(__name__)

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_SYNTHETIC_CSV = _PROJECT_ROOT / "ml" / "datasets" / "pune_aqi_train.csv"

WEATHER_COLUMNS = [
    "recorded_at",
    "ward_name",
    "ward_id",
    "temperature_c",
    "humidity_pct",
    "wind_speed_ms",
    "wind_deg",
    "pressure_hpa",
]


def load(source: str = "synthetic", **kwargs: Any) -> pd.DataFrame:
    """Load and process weather data.

    Args:
        source: Data source — 'synthetic' or 'api'.
        **kwargs: Optional filters (ward_name, ward_id).

    Returns:
        DataFrame with weather variables, wind speed in m/s.

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

    df = _convert_units(df)
    logger.info("Weather processor loaded %d records.", len(df))
    return df


def _load_synthetic(**kwargs: Any) -> pd.DataFrame:
    """Load weather columns from the synthetic training CSV."""
    if not _SYNTHETIC_CSV.exists():
        raise FileNotFoundError(f"Synthetic CSV not found: {_SYNTHETIC_CSV}")

    cols = [
        "recorded_at",
        "ward_name",
        "ward_id",
        "temperature_c",
        "humidity_pct",
        "wind_speed_kph",
        "wind_dir_deg",
        "pressure_hpa",
    ]
    df = pd.read_csv(_SYNTHETIC_CSV, usecols=cols, parse_dates=["recorded_at"])

    ward_name = kwargs.get("ward_name")
    if ward_name:
        df = df[df["ward_name"] == ward_name].copy()

    ward_id = kwargs.get("ward_id")
    if ward_id is not None:
        df = df[df["ward_id"] == ward_id].copy()

    return df


def _load_from_api(**kwargs: Any) -> pd.DataFrame:
    """Placeholder for loading weather from a live API."""
    raise NotImplementedError("Live weather API source not yet implemented.")


def _convert_units(df: pd.DataFrame) -> pd.DataFrame:
    """Convert wind speed from km/h to m/s and rename direction column."""
    if "wind_speed_kph" in df.columns:
        df["wind_speed_ms"] = df["wind_speed_kph"] / 3.6
        df = df.drop(columns=["wind_speed_kph"])

    if "wind_dir_deg" in df.columns:
        df = df.rename(columns={"wind_dir_deg": "wind_deg"})

    df = df.sort_values(["ward_id", "recorded_at"]).reset_index(drop=True)
    return df[WEATHER_COLUMNS]
