"""Fire hotspot processor: extract fire_count and total_frp per ward per timestamp."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import pandas as pd

logger = logging.getLogger(__name__)

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_SYNTHETIC_CSV = _PROJECT_ROOT / "ml" / "datasets" / "pune_aqi_train.csv"

FIRE_COLUMNS = [
    "recorded_at",
    "ward_name",
    "ward_id",
    "fire_count",
    "total_frp",
]


def load(source: str = "synthetic", **kwargs: Any) -> pd.DataFrame:
    """Load fire hotspot data per ward per timestamp.

    Args:
        source: Data source — 'synthetic' or 'api'.
        **kwargs: Optional filters (ward_name, ward_id).

    Returns:
        DataFrame with fire_count and total_frp per ward per timestamp.

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
    logger.info("Fire processor loaded %d records.", len(df))
    return df


def _load_synthetic(**kwargs: Any) -> pd.DataFrame:
    """Load fire columns from the synthetic training CSV."""
    if not _SYNTHETIC_CSV.exists():
        raise FileNotFoundError(f"Synthetic CSV not found: {_SYNTHETIC_CSV}")

    cols = ["recorded_at", "ward_name", "ward_id", "fire_count", "total_frp"]
    df = pd.read_csv(_SYNTHETIC_CSV, usecols=cols, parse_dates=["recorded_at"])

    ward_name = kwargs.get("ward_name")
    if ward_name:
        df = df[df["ward_name"] == ward_name].copy()

    ward_id = kwargs.get("ward_id")
    if ward_id is not None:
        df = df[df["ward_id"] == ward_id].copy()

    return df


def _load_from_api(**kwargs: Any) -> pd.DataFrame:
    """Placeholder for loading fire data from NASA FIRMS API."""
    raise NotImplementedError("NASA FIRMS API source not yet implemented.")


def _normalize(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize fire data: ensure types and sort."""
    df["recorded_at"] = pd.to_datetime(df["recorded_at"], errors="coerce")
    df["fire_count"] = pd.to_numeric(df["fire_count"], errors="coerce").fillna(0).astype(int)
    df["total_frp"] = pd.to_numeric(df["total_frp"], errors="coerce").fillna(0.0)

    df = df.sort_values(["ward_id", "recorded_at"]).reset_index(drop=True)
    return df[FIRE_COLUMNS]
