"""Model evaluation script.

Loads trained models and computes evaluation metrics on held-out test data.
Generates a structured evaluation report.
"""

import argparse
import json
import logging
import os
import pickle

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

from metrics import compute_all_metrics, print_metrics_table

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate trained air quality model")
    parser.add_argument("--model-path", type=str, required=True, help="Path to saved model pickle")
    parser.add_argument("--data", type=str, required=True, help="Path to evaluation data CSV")
    parser.add_argument("--scaler-path", type=str, default=None, help="Path to saved StandardScaler")
    parser.add_argument("--output", type=str, default=None, help="Path to save evaluation report JSON")
    parser.add_argument("--feature-cols", type=str, nargs="+", default=None, help="Override feature columns")
    parser.add_argument("--target-col", type=str, default="aqi", help="Target column name")
    return parser.parse_args()


def load_model(model_path: str):
    """Load a pickled model artifact."""
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    logger.info(f"Loaded model from {model_path}")
    return model


def load_scaler(scaler_path: str):
    """Load a pickled StandardScaler."""
    with open(scaler_path, "rb") as f:
        scaler = pickle.load(f)
    logger.info(f"Loaded scaler from {scaler_path}")
    return scaler


def generate_report(y_true: np.ndarray, y_pred: np.ndarray, model_info: dict) -> dict:
    """Generate a structured evaluation report."""
    metrics = compute_all_metrics(y_true, y_pred)
    residuals = y_true - y_pred

    report = {
        "model_info": model_info,
        "metrics": metrics,
        "residual_stats": {
            "mean": float(np.mean(residuals)),
            "std": float(np.std(residuals)),
            "min": float(np.min(residuals)),
            "max": float(np.max(residuals)),
            "median": float(np.median(residuals)),
        },
        "percentile_errors": {
            "p50": float(np.percentile(np.abs(residuals), 50)),
            "p90": float(np.percentile(np.abs(residuals), 90)),
            "p95": float(np.percentile(np.abs(residuals), 95)),
            "p99": float(np.percentile(np.abs(residuals), 99)),
        },
        "sample_size": len(y_true),
    }
    return report


def main() -> None:
    args = parse_args()

    from train import FEATURE_COLS

    feature_cols = args.feature_cols if args.feature_cols else FEATURE_COLS

    df = pd.read_csv(args.data)
    df = df.dropna(subset=feature_cols + [args.target_col])

    X = df[feature_cols]
    y = df[args.target_col]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = load_model(args.model_path)

    if args.scaler_path:
        scaler = load_scaler(args.scaler_path)
        X_test = pd.DataFrame(scaler.transform(X_test), columns=feature_cols, index=X_test.index)

    y_pred = model.predict(X_test)

    report = generate_report(y_test.values, y_pred, {"model_path": args.model_path})
    print_metrics_table(report["metrics"])

    if args.output:
        os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
        with open(args.output, "w") as f:
            json.dump(report, f, indent=2)
        logger.info(f"Report saved to {args.output}")


if __name__ == "__main__":
    main()
