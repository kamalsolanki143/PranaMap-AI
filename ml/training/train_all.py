"""Training orchestrator for XGBoost and LightGBM AQI forecast models.

Trains models for multiple forecast horizons [1, 6, 12, 24] hours using
TimeSeriesSplit cross-validation and saves artifacts with metadata.

Usage:
    python3 ml/training/train_all.py --data ml/datasets/pune_aqi_train.csv --auto-report
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import pickle
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.model_selection import TimeSeriesSplit
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor

# Ensure project root is on sys.path
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(_PROJECT_ROOT))

from data_pipeline.preprocess.engineering import build_feature_matrix

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Forecast horizons in hours
HORIZONS = [1, 6, 12, 24]

# Model output directory
MODELS_DIR = _PROJECT_ROOT / "ml" / "models"

# Columns to exclude from features (non-predictive or target-related)
EXCLUDE_COLS = [
    "recorded_at", "ward_name", "ward_id", "station_id",
    "latitude", "longitude", "hour", "day_of_week", "month",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Train XGBoost and LightGBM models for AQI forecasting",
    )
    parser.add_argument(
        "--data",
        type=str,
        default="ml/datasets/pune_aqi_train.csv",
        help="Path to training CSV (default: ml/datasets/pune_aqi_train.csv)",
    )
    parser.add_argument(
        "--auto-report",
        action="store_true",
        default=False,
        help="Run evaluation after training",
    )
    return parser.parse_args()


def load_data(csv_path: str) -> pd.DataFrame:
    """Load training CSV and apply feature engineering."""
    path = Path(csv_path)
    if not path.is_absolute():
        path = _PROJECT_ROOT / path

    if not path.exists():
        raise FileNotFoundError(f"Training data not found: {path}")

    logger.info("Loading data from %s", path)
    df = pd.read_csv(path, parse_dates=["recorded_at"])
    logger.info("Raw data shape: %d rows x %d columns", df.shape[0], df.shape[1])

    # Build feature matrix
    logger.info("Building feature matrix...")
    df = build_feature_matrix(df, target_col="aqi_value", horizons=HORIZONS)
    logger.info("Feature matrix shape: %d rows x %d columns", df.shape[0], df.shape[1])

    return df


def get_feature_columns(df: pd.DataFrame, horizon: int) -> list[str]:
    """Determine feature columns by excluding targets and non-predictive cols."""
    target_cols = [c for c in df.columns if c.startswith("aqi_value_t+")]
    exclude = set(EXCLUDE_COLS + target_cols)
    feature_cols = [c for c in df.columns if c not in exclude and df[c].dtype in [np.float64, np.int64, float, int]]
    return feature_cols


def train_model_cv(
    model,
    X: pd.DataFrame,
    y: pd.Series,
    n_splits: int = 5,
) -> dict[str, float]:
    """Train with TimeSeriesSplit and return average CV metrics."""
    tscv = TimeSeriesSplit(n_splits=n_splits)
    mae_scores = []
    rmse_scores = []
    r2_scores = []

    for fold, (train_idx, val_idx) in enumerate(tscv.split(X)):
        X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

        model.fit(X_train, y_train)

        y_pred = model.predict(X_val)
        mae = float(np.mean(np.abs(y_val - y_pred)))
        rmse = float(np.sqrt(np.mean((y_val - y_pred) ** 2)))
        ss_res = np.sum((y_val - y_pred) ** 2)
        ss_tot = np.sum((y_val - np.mean(y_val)) ** 2)
        r2 = float(1.0 - ss_res / ss_tot) if ss_tot > 0 else 0.0

        mae_scores.append(mae)
        rmse_scores.append(rmse)
        r2_scores.append(r2)

    return {
        "cv_mae_mean": float(np.mean(mae_scores)),
        "cv_mae_std": float(np.std(mae_scores)),
        "cv_rmse_mean": float(np.mean(rmse_scores)),
        "cv_rmse_std": float(np.std(rmse_scores)),
        "cv_r2_mean": float(np.mean(r2_scores)),
        "cv_r2_std": float(np.std(r2_scores)),
    }


def create_xgboost(horizon: int) -> XGBRegressor:
    """Create XGBRegressor with horizon-appropriate hyperparameters."""
    return XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        n_jobs=-1,
        verbosity=0,
    )


def create_lightgbm(horizon: int) -> LGBMRegressor:
    """Create LGBMRegressor with horizon-appropriate hyperparameters."""
    return LGBMRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        n_jobs=-1,
        verbose=-1,
    )


class EnsembleModel:
    """Simple average ensemble of two sklearn-compatible models."""

    def __init__(self, model_a, model_b, name: str = "ensemble"):
        self.model_a = model_a
        self.model_b = model_b
        self.name = name

    def predict(self, X) -> np.ndarray:
        pred_a = self.model_a.predict(X)
        pred_b = self.model_b.predict(X)
        return (pred_a + pred_b) / 2.0

    def fit(self, X, y):
        """No-op since component models are pre-trained."""
        return self


def save_model(model: Any, name: str, horizon: int, feature_cols: list[str], metrics: dict) -> Path:
    """Save model pickle and metadata JSON."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    # Save pickle
    pkl_path = MODELS_DIR / f"{name}_{horizon}h.pkl"
    with open(pkl_path, "wb") as f:
        pickle.dump(model, f)

    # Save metadata
    meta = {
        "model_name": name,
        "horizon_hours": horizon,
        "features": feature_cols,
        "metrics": metrics,
        "training_date": datetime.now(timezone.utc).isoformat(),
        "n_features": len(feature_cols),
        "model_type": type(model).__name__,
    }
    meta_path = MODELS_DIR / f"{name}_{horizon}h_meta.json"
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)

    logger.info("Saved %s → %s", name, pkl_path)
    return pkl_path


def print_summary(all_metrics: dict[str, dict[str, dict[str, float]]]) -> None:
    """Print a formatted training metrics summary."""
    print("\n" + "=" * 70)
    print("  TRAINING METRICS SUMMARY")
    print("=" * 70)
    print(f"  {'Model':<20s} {'Horizon':<10s} {'CV MAE':<12s} {'CV RMSE':<12s} {'CV R²':<12s}")
    print("-" * 70)

    for horizon in HORIZONS:
        for model_name in ["xgboost", "lightgbm", "ensemble"]:
            key = f"{model_name}_{horizon}h"
            if key in all_metrics:
                m = all_metrics[key]
                mae_str = f"{m['cv_mae_mean']:.2f}±{m['cv_mae_std']:.2f}"
                rmse_str = f"{m['cv_rmse_mean']:.2f}±{m['cv_rmse_std']:.2f}"
                r2_str = f"{m['cv_r2_mean']:.4f}±{m['cv_r2_std']:.4f}"
                print(f"  {model_name:<20s} {horizon:<10d} {mae_str:<12s} {rmse_str:<12s} {r2_str:<12s}")
        print("-" * 70)

    print("=" * 70 + "\n")


def train_all(data_path: str, auto_report: bool = False) -> None:
    """Main training loop: train XGBoost + LightGBM for all horizons."""
    df = load_data(data_path)

    all_metrics: dict[str, dict[str, float]] = {}
    trained_models: dict[str, tuple[Any, list[str]]] = {}

    for horizon in HORIZONS:
        target_col = f"aqi_value_t+{horizon}"
        logger.info("=" * 50)
        logger.info("Training for horizon: t+%dh (target: %s)", horizon, target_col)
        logger.info("=" * 50)

        # Prepare data: drop rows with NaN in target or features
        feature_cols = get_feature_columns(df, horizon)
        subset = df[feature_cols + [target_col]].dropna()
        X = subset[feature_cols]
        y = subset[target_col]

        logger.info("Training data: %d rows x %d features", X.shape[0], X.shape[1])

        # --- XGBoost ---
        logger.info("Training XGBoost (horizon=%dh)...", horizon)
        xgb_model = create_xgboost(horizon)
        xgb_metrics = train_model_cv(xgb_model, X, y, n_splits=5)
        # Final fit on all data
        xgb_model.fit(X, y)
        save_model(xgb_model, "xgboost", horizon, feature_cols, xgb_metrics)
        all_metrics[f"xgboost_{horizon}h"] = xgb_metrics
        trained_models[f"xgboost_{horizon}h"] = (xgb_model, feature_cols)

        # --- LightGBM ---
        logger.info("Training LightGBM (horizon=%dh)...", horizon)
        lgbm_model = create_lightgbm(horizon)
        lgbm_metrics = train_model_cv(lgbm_model, X, y, n_splits=5)
        # Final fit on all data
        lgbm_model.fit(X, y)
        save_model(lgbm_model, "lightgbm", horizon, feature_cols, lgbm_metrics)
        all_metrics[f"lightgbm_{horizon}h"] = lgbm_metrics
        trained_models[f"lightgbm_{horizon}h"] = (lgbm_model, feature_cols)

        # --- Ensemble ---
        logger.info("Creating ensemble (horizon=%dh)...", horizon)
        ensemble = EnsembleModel(xgb_model, lgbm_model, name=f"ensemble_{horizon}h")

        # Evaluate ensemble with CV
        tscv = TimeSeriesSplit(n_splits=5)
        ens_mae, ens_rmse, ens_r2 = [], [], []
        for train_idx, val_idx in tscv.split(X):
            X_val = X.iloc[val_idx]
            y_val = y.iloc[val_idx]
            y_pred = ensemble.predict(X_val)
            ens_mae.append(float(np.mean(np.abs(y_val - y_pred))))
            ens_rmse.append(float(np.sqrt(np.mean((y_val - y_pred) ** 2))))
            ss_res = np.sum((y_val - y_pred) ** 2)
            ss_tot = np.sum((y_val - np.mean(y_val)) ** 2)
            ens_r2.append(float(1.0 - ss_res / ss_tot) if ss_tot > 0 else 0.0)

        ensemble_metrics = {
            "cv_mae_mean": float(np.mean(ens_mae)),
            "cv_mae_std": float(np.std(ens_mae)),
            "cv_rmse_mean": float(np.mean(ens_rmse)),
            "cv_rmse_std": float(np.std(ens_rmse)),
            "cv_r2_mean": float(np.mean(ens_r2)),
            "cv_r2_std": float(np.std(ens_r2)),
        }
        save_model(ensemble, "ensemble", horizon, feature_cols, ensemble_metrics)
        all_metrics[f"ensemble_{horizon}h"] = ensemble_metrics
        trained_models[f"ensemble_{horizon}h"] = (ensemble, feature_cols)

    # Print summary
    print_summary(all_metrics)

    # Auto-report: run evaluation
    if auto_report:
        logger.info("Running auto-evaluation...")
        _run_evaluation(trained_models, data_path)

    logger.info("Training complete. Models saved to %s", MODELS_DIR)


def _run_evaluation(
    trained_models: dict[str, tuple[Any, list[str]]],
    data_path: str,
) -> None:
    """Run evaluation on the trained models using the EvaluationRunner."""
    from ml.training.evaluate import EvaluationRunner

    test_csv = _PROJECT_ROOT / "ml" / "datasets" / "pune_aqi_test.csv"
    if not test_csv.exists():
        # Fall back to using a portion of train data
        test_csv = Path(data_path) if Path(data_path).is_absolute() else _PROJECT_ROOT / data_path
        logger.warning("No test CSV found; evaluating on training data: %s", test_csv)

    runner = EvaluationRunner()

    for key, (model, feature_cols) in trained_models.items():
        if "ensemble" in key:
            # Skip ensemble in auto-report (it's derived from component models)
            continue
        horizon = int(key.split("_")[-1].replace("h", ""))
        target_col = f"aqi_value_t+{horizon}"
        model_path = MODELS_DIR / f"{key}.pkl"

        logger.info("Evaluating %s on %s...", key, test_csv.name)
        try:
            runner.run(
                model_path=str(model_path),
                test_data_path=str(test_csv),
                feature_cols=feature_cols,
                target_col=target_col,
            )
        except Exception as e:
            logger.error("Evaluation failed for %s: %s", key, e)


def main() -> None:
    args = parse_args()
    train_all(data_path=args.data, auto_report=args.auto_report)


if __name__ == "__main__":
    main()
