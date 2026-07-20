"""Feature matrix builder: lag features, rolling stats, cyclical encoding, wind decomposition."""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_SYNTHETIC_CSV = _PROJECT_ROOT / "ml" / "datasets" / "pune_aqi_train.csv"

LAG_PERIODS = [1, 3, 6, 12, 24]
ROLLING_WINDOWS = [3, 6, 12, 24]


def build_feature_matrix(
    df: pd.DataFrame,
    target_col: str = "aqi_value",
    horizons: list[int] | None = None,
) -> pd.DataFrame:
    """Build a complete feature matrix with lag, rolling, cyclical, and target columns.

    Args:
        df: Input DataFrame with at least recorded_at, ward_id, and target_col.
        target_col: Column to predict (used for lag/rolling and horizon targets).
        horizons: List of forecast horizons (in hours) for target creation.

    Returns:
        Feature-enriched DataFrame with target columns for each horizon.
    """
    if horizons is None:
        horizons = [1, 6, 12, 24]

    df = _ensure_datetime(df)
    df = _add_lag_features(df, target_col)
    df = _add_rolling_stats(df, target_col)
    df = _add_cyclical_encoding(df)
    df = _add_wind_decomposition(df)
    df = _add_target_horizons(df, target_col, horizons)

    return df


def _ensure_datetime(df: pd.DataFrame) -> pd.DataFrame:
    """Parse recorded_at and extract time components."""
    df["recorded_at"] = pd.to_datetime(df["recorded_at"], errors="coerce")
    df = df.sort_values(["ward_id", "recorded_at"]).reset_index(drop=True)
    df["hour"] = df["recorded_at"].dt.hour
    df["day_of_week"] = df["recorded_at"].dt.dayofweek
    df["month"] = df["recorded_at"].dt.month
    return df


def _add_lag_features(df: pd.DataFrame, target_col: str) -> pd.DataFrame:
    """Create lagged features per ward for the target and key weather vars."""
    lag_cols = [target_col, "pm25", "temperature_c", "humidity_pct"]
    lag_cols = [c for c in lag_cols if c in df.columns]

    parts: list[pd.DataFrame] = []
    for _, group in df.groupby("ward_id"):
        group = group.copy()
        for col in lag_cols:
            for lag in LAG_PERIODS:
                group[f"{col}_lag_{lag}h"] = group[col].shift(lag)
        parts.append(group)

    return pd.concat(parts, ignore_index=True) if parts else df


def _add_rolling_stats(df: pd.DataFrame, target_col: str) -> pd.DataFrame:
    """Create rolling mean, std, min, max for target column per ward."""
    if target_col not in df.columns:
        return df

    parts: list[pd.DataFrame] = []
    for _, group in df.groupby("ward_id"):
        group = group.copy()
        for window in ROLLING_WINDOWS:
            rolling = group[target_col].rolling(window=window, min_periods=1)
            group[f"{target_col}_roll_mean_{window}h"] = rolling.mean()
            group[f"{target_col}_roll_std_{window}h"] = rolling.std()
            group[f"{target_col}_roll_min_{window}h"] = rolling.min()
            group[f"{target_col}_roll_max_{window}h"] = rolling.max()
        parts.append(group)

    return pd.concat(parts, ignore_index=True) if parts else df


def _add_cyclical_encoding(df: pd.DataFrame) -> pd.DataFrame:
    """Encode hour, day_of_week, and month as sin/cos pairs."""
    if "hour" in df.columns:
        df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
        df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)
    if "day_of_week" in df.columns:
        df["dow_sin"] = np.sin(2 * np.pi * df["day_of_week"] / 7)
        df["dow_cos"] = np.cos(2 * np.pi * df["day_of_week"] / 7)
    if "month" in df.columns:
        df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
        df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)
    return df


def _add_wind_decomposition(df: pd.DataFrame) -> pd.DataFrame:
    """Decompose wind into u (east-west) and v (north-south) components."""
    speed_col = "wind_speed_kph" if "wind_speed_kph" in df.columns else "wind_speed_ms"
    dir_col = "wind_dir_deg" if "wind_dir_deg" in df.columns else "wind_deg"

    if speed_col in df.columns and dir_col in df.columns:
        speed = df[speed_col].fillna(0)
        # Convert kph to ms if needed
        if speed_col == "wind_speed_kph":
            speed = speed / 3.6
        rad = np.radians(df[dir_col].fillna(0))
        df["wind_u"] = speed * np.sin(rad)
        df["wind_v"] = speed * np.cos(rad)

    return df


def _add_target_horizons(
    df: pd.DataFrame,
    target_col: str,
    horizons: list[int],
) -> pd.DataFrame:
    """Create future target columns for each horizon (shift backward).

    For horizon h, target_col_t+h = the value h steps ahead.
    """
    if target_col not in df.columns:
        return df

    parts: list[pd.DataFrame] = []
    for _, group in df.groupby("ward_id"):
        group = group.copy()
        for h in horizons:
            group[f"{target_col}_t+{h}"] = group[target_col].shift(-h)
        parts.append(group)

    return pd.concat(parts, ignore_index=True) if parts else df


def _load_data(source: str, ward_name: str | None = None) -> pd.DataFrame:
    """Load full dataset for CLI usage."""
    if source == "synthetic":
        if not _SYNTHETIC_CSV.exists():
            raise FileNotFoundError(f"Synthetic CSV not found: {_SYNTHETIC_CSV}")
        df = pd.read_csv(_SYNTHETIC_CSV, parse_dates=["recorded_at"])
        if ward_name:
            df = df[df["ward_name"] == ward_name].copy()
        return df
    raise ValueError(f"Unsupported source: {source!r}")


def main() -> None:
    """CLI entrypoint for feature matrix building."""
    parser = argparse.ArgumentParser(
        description="Build feature matrix from PranaMap data pipeline.",
    )
    parser.add_argument(
        "--source",
        choices=["synthetic", "api"],
        default="synthetic",
        help="Data source (default: synthetic)",
    )
    parser.add_argument(
        "--ward",
        type=str,
        default=None,
        help="Ward name filter (e.g., Kothrud)",
    )
    parser.add_argument(
        "--horizons",
        type=str,
        default="1,6,12,24",
        help="Comma-separated forecast horizons in hours (default: 1,6,12,24)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Output CSV path (default: print summary to stdout)",
    )
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    horizons = [int(h.strip()) for h in args.horizons.split(",")]
    df = _load_data(args.source, ward_name=args.ward)
    logger.info("Loaded %d rows from source=%s, ward=%s", len(df), args.source, args.ward)

    features = build_feature_matrix(df, target_col="aqi_value", horizons=horizons)
    logger.info("Feature matrix shape: %s", features.shape)

    if args.output:
        out_path = Path(args.output)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        features.to_csv(out_path, index=False)
        logger.info("Saved feature matrix to %s", out_path)
    else:
        print(f"Feature matrix: {features.shape[0]} rows x {features.shape[1]} columns")
        print(f"Columns: {list(features.columns)}")
        print(features.head(3).to_string(max_cols=15))


if __name__ == "__main__":
    main()
