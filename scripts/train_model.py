#!/usr/bin/env python3
"""
PranaMap AI - Model Training Orchestrator

Trains the AQI prediction model using multi-source environmental data.
Supports LSTM, XGBoost, and ensemble approaches.
"""

import argparse
import json
import logging
import os
import pickle
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.preprocessing import StandardScaler
from sqlalchemy import create_engine, text

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT_DIR / "model_artifacts"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

FEATURE_COLUMNS = [
    "pm25", "pm10", "no2", "so2", "co", "o3", "temperature_c",
    "humidity_pct", "wind_speed_kph", "wind_dir_deg", "pressure_hpa",
    "hour_of_day", "day_of_week", "month",
]
TARGET_COLUMN = "aqi_value"
FORECAST_HORIZONS = [1, 3, 6, 12, 24]  # hours ahead


def load_data_from_db(database_url: str) -> pd.DataFrame:
    """Load training data from PostgreSQL."""
    logger.info("Loading data from database...")
    engine = create_engine(database_url)

    query = text("""
        SELECT
            a.aqi_value,
            a.pm25, a.pm10, a.no2, a.so2, a.co, a.o3,
            a.temperature_c, a.humidity_pct, a.wind_speed_kph, a.wind_dir_deg,
            w.temperature_c AS w_temperature,
            w.humidity_pct AS w_humidity,
            w.pressure_hpa,
            a.recorded_at,
            a.ward_id
        FROM aqi_readings a
        LEFT JOIN weather_data w
            ON a.ward_id = w.ward_id
            AND ABS(EXTRACT(EPOCH FROM (a.recorded_at - w.recorded_at))) < 3600
        WHERE a.recorded_at > NOW() - INTERVAL '1 year'
        ORDER BY a.recorded_at ASC
    """)

    with engine.connect() as conn:
        df = pd.read_sql(query, conn)

    logger.info(f"  Loaded {len(df)} records")
    return df


def load_data_from_csv(csv_path: str) -> pd.DataFrame:
    """Load training data from CSV fallback."""
    logger.info(f"Loading data from {csv_path}...")
    df = pd.read_csv(csv_path, parse_dates=["recorded_at"])
    logger.info(f"  Loaded {len(df)} records")
    return df


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create temporal and derived features."""
    logger.info("Engineering features...")

    df["hour_of_day"] = df["recorded_at"].dt.hour
    df["day_of_week"] = df["recorded_at"].dt.dayofweek
    df["month"] = df["recorded_at"].dt.month
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)

    # Cyclical encoding for temporal features
    df["hour_sin"] = np.sin(2 * np.pi * df["hour_of_day"] / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour_of_day"] / 24)
    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)

    # Lag features for AQI (if previous readings exist)
    for lag in [1, 3, 6, 12]:
        df[f"aqi_lag_{lag}h"] = df.groupby("ward_id")["aqi_value"].shift(lag)

    # Rolling statistics
    for window in [3, 6, 12]:
        df[f"aqi_rolling_mean_{window}h"] = (
            df.groupby("ward_id")["aqi_value"]
            .transform(lambda x: x.rolling(window, min_periods=1).mean())
        )
        df[f"aqi_rolling_std_{window}h"] = (
            df.groupby("ward_id")["aqi_value"]
            .transform(lambda x: x.rolling(window, min_periods=1).std())
        )

    # Pollutant ratios
    df["pm25_pm10_ratio"] = df["pm25"] / df["pm10"].replace(0, np.nan)
    df["no2_o3_ratio"] = df["no2"] / df["o3"].replace(0, np.nan)

    df = df.fillna(method="ffill").fillna(0)

    logger.info(f"  Features engineered. Shape: {df.shape}")
    return df


def prepare_targets(df: pd.DataFrame) -> dict:
    """Create forecast target columns for different horizons."""
    targets = {}
    for horizon in FORECAST_HORIZONS:
        target_col = f"aqi_target_{horizon}h"
        df[target_col] = df.groupby("ward_id")["aqi_value"].shift(-horizon)
        targets[horizon] = target_col
    return targets


def train_models(df: pd.DataFrame, target_col: str, model_name: str) -> dict:
    """Train and evaluate models for a specific forecast horizon."""
    logger.info(f"\nTraining models for {model_name}...")

    available_features = [c for c in FEATURE_COLUMNS if c in df.columns]
    all_features = available_features + [
        c for c in df.columns
        if c.startswith("aqi_lag_") or c.startswith("aqi_rolling_") or c.endswith("_ratio")
    ]

    mask = df[target_col].notna()
    X = df.loc[mask, all_features].fillna(0)
    y = df.loc[mask, target_col]

    if len(X) < 100:
        logger.warning(f"  Insufficient data for {model_name}: {len(X)} samples")
        return {}

    tscv = TimeSeriesSplit(n_splits=5)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    models = {
        "random_forest": RandomForestRegressor(
            n_estimators=200, max_depth=15, min_samples_split=5,
            random_state=42, n_jobs=-1
        ),
        "gradient_boosting": GradientBoostingRegressor(
            n_estimators=200, max_depth=8, learning_rate=0.05,
            subsample=0.8, random_state=42
        ),
    }

    results = {}
    for name, model in models.items():
        logger.info(f"  Training {name}...")

        cv_scores = cross_val_score(model, X_scaled, y, cv=tscv, scoring="neg_mean_absolute_error")
        model.fit(X_scaled, y)

        y_pred = model.predict(X_scaled)
        metrics = {
            "mae": float(mean_absolute_error(y, y_pred)),
            "rmse": float(np.sqrt(mean_squared_error(y, y_pred))),
            "r2": float(r2_score(y, y_pred)),
            "cv_mae_mean": float(-cv_scores.mean()),
            "cv_mae_std": float(cv_scores.std()),
        }

        results[name] = {"model": model, "metrics": metrics}
        logger.info(f"    MAE: {metrics['mae']:.2f}, RMSE: {metrics['rmse']:.2f}, R²: {metrics['r2']:.4f}")

    # Select best model
    best_name = min(results, key=lambda k: results[k]["metrics"]["mae"])
    best = results[best_name]
    logger.info(f"  Best model: {best_name} (MAE={best['metrics']['mae']:.2f})")

    return {
        "model": best["model"],
        "scaler": scaler,
        "features": all_features,
        "metrics": best["metrics"],
        "model_type": best_name,
    }


def save_model(model_artifact: dict, horizon: int) -> Path:
    """Save trained model and metadata."""
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    model_path = MODEL_DIR / f"aqi_model_{horizon}h_{timestamp}.pkl"
    metadata_path = MODEL_DIR / f"aqi_model_{horizon}h_{timestamp}_metadata.json"

    with open(model_path, "wb") as f:
        pickle.dump({
            "model": model_artifact["model"],
            "scaler": model_artifact["scaler"],
            "features": model_artifact["features"],
        }, f)

    metadata = {
        "horizon_hours": horizon,
        "model_type": model_artifact["model_type"],
        "metrics": model_artifact["metrics"],
        "features": model_artifact["features"],
        "trained_at": timestamp,
        "training_samples": len(model_artifact["features"]),
    }
    metadata_path.write_text(json.dumps(metadata, indent=2))

    logger.info(f"  Saved model to {model_path}")
    return model_path


def main():
    parser = argparse.ArgumentParser(description="PranaMap AI - Model Training")
    parser.add_argument("--database-url", type=str, help="PostgreSQL connection URL")
    parser.add_argument("--csv", type=str, help="Path to CSV training data (alternative to DB)")
    parser.add_argument("--horizon", type=int, default=6, help="Forecast horizon in hours")
    parser.add_argument("--all-horizons", action="store_true", help="Train for all horizons")
    args = parser.parse_args()

    logger.info("=" * 50)
    logger.info("PranaMap AI - Model Training")
    logger.info("=" * 50)

    database_url = args.database_url or os.getenv("DATABASE_URL")

    if args.csv:
        df = load_data_from_csv(args.csv)
    elif database_url:
        df = load_data_from_db(database_url)
    else:
        logger.error("Provide --database-url or --csv")
        return

    df = engineer_features(df)
    targets = prepare_targets(df)

    horizons = FORECAST_HORIZONS if args.all_horizons else [args.horizon]

    all_results = {}
    for horizon in horizons:
        if horizon not in targets:
            continue
        target_col = targets[horizon]
        artifact = train_models(df, target_col, f"{horizon}h_forecast")
        if artifact:
            save_model(artifact, horizon)
            all_results[f"{horizon}h"] = artifact["metrics"]

    # Save summary
    summary_path = MODEL_DIR / "training_summary.json"
    summary_path.write_text(json.dumps(all_results, indent=2))

    logger.info("\n" + "=" * 50)
    logger.info("Training complete!")
    logger.info(f"Results saved to {MODEL_DIR}")
    logger.info("=" * 50)


if __name__ == "__main__":
    main()
