"""Training script for air quality prediction models.

Supports XGBoost and LightGBM with configurable hyperparameters,
cross-validation, and model persistence.
"""

import argparse
import json
import logging
import os
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
import xgboost as xgb
import lightgbm as lgb
from sklearn.model_selection import train_test_split, KFold
from sklearn.preprocessing import StandardScaler

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

FEATURE_COLS = [
    "pm25", "pm10", "no2", "so2", "co", "o3",
    "temperature", "humidity", "wind_speed", "wind_direction",
    "pressure", "hour", "day_of_week", "month",
    "lat", "lon", "elevation", "population_density",
    "traffic_index", "industrial_proximity",
]

TARGET_COL = "aqi"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train air quality prediction model")
    parser.add_argument("--data", type=str, required=True, help="Path to training data CSV")
    parser.add_argument("--model", type=str, default="xgboost", choices=["xgboost", "lightgbm"],
                        help="Model type to train")
    parser.add_argument("--output", type=str, default="../models", help="Directory to save model artifacts")
    parser.add_argument("--test-size", type=float, default=0.2, help="Test set proportion")
    parser.add_argument("--random-state", type=int, default=42, help="Random seed")
    parser.add_argument("--n-folds", type=int, default=5, help="Number of CV folds")
    parser.add_argument("--hyperparams", type=str, default=None, help="JSON file with hyperparameters")
    parser.add_argument("--scale-features", action="store_true", help="Apply StandardScaler to features")
    return parser.parse_args()


def load_data(path: str) -> tuple[pd.DataFrame, pd.Series]:
    """Load and validate training data."""
    df = pd.read_csv(path)
    missing_cols = set(FEATURE_COLS + [TARGET_COL]) - set(df.columns)
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")
    df = df.dropna(subset=FEATURE_COLS + [TARGET_COL])
    X = df[FEATURE_COLS]
    y = df[TARGET_COL]
    logger.info(f"Loaded {len(df)} samples with {len(FEATURE_COLS)} features")
    return X, y


def train_xgboost(X_train, y_train, params: dict, n_folds: int = 5) -> dict:
    """Train XGBoost model with cross-validation."""
    default_params = {
        "objective": "reg:squarederror",
        "eval_metric": "rmse",
        "max_depth": 6,
        "learning_rate": 0.1,
        "n_estimators": 500,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "min_child_weight": 3,
        "reg_alpha": 0.1,
        "reg_lambda": 1.0,
        "random_state": 42,
    }
    default_params.update(params)

    dtrain = xgb.DMatrix(X_train, label=y_train)
    cv_results = xgb.cv(
        default_params,
        dtrain,
        num_boost_round=default_params["n_estimators"],
        nfold=n_folds,
        early_stopping_rounds=50,
        verbose_eval=False,
    )

    best_rounds = cv_results.shape[0]
    final_params = {k: v for k, v in default_params.items() if k != "n_estimators"}
    model = xgb.train(final_params, dtrain, num_boost_round=best_rounds)

    metrics = {
        "best_rmse": float(cv_results["test-rmse-mean"].iloc[-1]),
        "best_rounds": best_rounds,
    }
    logger.info(f"XGBoost CV RMSE: {metrics['best_rmse']:.4f} ({best_rounds} rounds)")
    return {"model": model, "metrics": metrics, "params": final_params}


def train_lightgbm(X_train, y_train, params: dict, n_folds: int = 5) -> dict:
    """Train LightGBM model with cross-validation."""
    default_params = {
        "objective": "regression",
        "metric": "rmse",
        "max_depth": 7,
        "learning_rate": 0.1,
        "n_estimators": 500,
        "num_leaves": 63,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "min_child_samples": 20,
        "reg_alpha": 0.1,
        "reg_lambda": 1.0,
        "random_state": 42,
        "verbose": -1,
    }
    default_params.update(params)

    dtrain = lgb.Dataset(X_train, label=y_train)
    cv_results = lgb.cv(
        default_params,
        dtrain,
        num_boost_round=default_params["n_estimators"],
        nfold=n_folds,
        early_stopping_rounds=50,
        verbose_eval=False,
    )

    best_rounds = len(cv_results["valid rmse-mean"])
    final_model = lgb.train(
        {k: v for k, v in default_params.items() if k != "n_estimators"},
        dtrain,
        num_boost_round=best_rounds,
    )

    metrics = {
        "best_rmse": cv_results["valid rmse-mean"][-1],
        "best_rounds": best_rounds,
    }
    logger.info(f"LightGBM CV RMSE: {metrics['best_rmse']:.4f} ({best_rounds} rounds)")
    return {"model": final_model, "metrics": metrics, "params": default_params}


def save_artifacts(result: dict, scaler: StandardScaler | None, output_dir: str, model_name: str) -> None:
    """Save model, scaler, and training metadata."""
    os.makedirs(output_dir, exist_ok=True)

    model_path = os.path.join(output_dir, f"{model_name}.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(result["model"], f)

    if scaler is not None:
        scaler_path = os.path.join(output_dir, "scaler.pkl")
        with open(scaler_path, "wb") as f:
            pickle.dump(scaler, f)

    meta = {
        "model_type": model_name,
        "features": FEATURE_COLS,
        "target": TARGET_COL,
        "metrics": result["metrics"],
        "params": {k: v for k, v in result["params"].items() if isinstance(v, (int, float, str))},
    }
    meta_path = os.path.join(output_dir, f"{model_name}_meta.json")
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)

    logger.info(f"Artifacts saved to {output_dir}")


def main() -> None:
    args = parse_args()

    X, y = load_data(args.data)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=args.test_size, random_state=args.random_state
    )

    scaler = None
    if args.scale_features:
        scaler = StandardScaler()
        X_train = pd.DataFrame(scaler.fit_transform(X_train), columns=FEATURE_COLS, index=X_train.index)
        X_test = pd.DataFrame(scaler.transform(X_test), columns=FEATURE_COLS, index=X_test.index)

    hyperparams = {}
    if args.hyperparams:
        with open(args.hyperparams) as f:
            hyperparams = json.load(f)

    if args.model == "xgboost":
        result = train_xgboost(X_train, y_train, hyperparams, args.n_folds)
    else:
        result = train_lightgbm(X_train, y_train, hyperparams, args.n_folds)

    save_artifacts(result, scaler, args.output, args.model)
    logger.info("Training complete.")


if __name__ == "__main__":
    main()
