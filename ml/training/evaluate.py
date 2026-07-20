"""Model evaluation module with EvaluationRunner class.

Loads trained models and computes evaluation metrics on held-out test data.
Generates structured evaluation reports and SHAP analysis.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import pickle
import sys
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Ensure project root is on sys.path
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(_PROJECT_ROOT))

from data_pipeline.preprocess.engineering import build_feature_matrix

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

MODELS_DIR = _PROJECT_ROOT / "ml" / "models"


def _aqi_category(value: float) -> int:
    """Map AQI value to category index (0-5)."""
    bins = [0, 50, 100, 150, 200, 300, 500]
    return int(np.digitize(value, bins))


def _aqi_category_accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Compute fraction of predictions in the correct AQI category."""
    bins = [0, 50, 100, 150, 200, 300, 500]
    true_cats = np.digitize(y_true, bins)
    pred_cats = np.digitize(y_pred, bins)
    return float(np.mean(true_cats == pred_cats))


def _mape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Compute Mean Absolute Percentage Error, ignoring zero targets."""
    mask = y_true != 0
    if not np.any(mask):
        return float("inf")
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)


class EvaluationRunner:
    """Evaluates trained models and generates reports.

    Methods:
        run: Load model, predict on test data, compute metrics, save JSON report.
        generate_shap_report: Generate SHAP feature importance as JSON.
    """

    def __init__(self, output_dir: str | Path | None = None):
        """Initialize EvaluationRunner.

        Args:
            output_dir: Directory to save evaluation reports.
                        Defaults to ml/models/.
        """
        self.output_dir = Path(output_dir) if output_dir else MODELS_DIR
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def run(
        self,
        model_path: str,
        test_data_path: str,
        feature_cols: list[str],
        target_col: str,
    ) -> dict[str, Any]:
        """Run evaluation on a trained model.

        Args:
            model_path: Path to pickled model file.
            test_data_path: Path to test CSV data.
            feature_cols: List of feature column names.
            target_col: Target column name (e.g., 'aqi_value_t+1').

        Returns:
            Dictionary with evaluation metrics and report path.
        """
        # Load model
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        logger.info("Loaded model from %s", model_path)

        # Load and prepare test data
        df = pd.read_csv(test_data_path, parse_dates=["recorded_at"])
        logger.info("Loaded test data: %d rows", len(df))

        # Apply feature engineering if target col not present
        if target_col not in df.columns:
            horizons = [1, 6, 12, 24]
            df = build_feature_matrix(df, target_col="aqi_value", horizons=horizons)

        # Filter to available feature columns
        available_features = [c for c in feature_cols if c in df.columns]
        if len(available_features) < len(feature_cols):
            missing = set(feature_cols) - set(available_features)
            logger.warning("Missing %d features: %s", len(missing), list(missing)[:5])

        # Drop NaN rows
        subset = df[available_features + [target_col]].dropna()
        X_test = subset[available_features]
        y_test = subset[target_col].values

        logger.info("Evaluation data: %d rows x %d features", X_test.shape[0], X_test.shape[1])

        # Predict
        y_pred = model.predict(X_test)

        # Compute metrics
        metrics = {
            "mae": float(mean_absolute_error(y_test, y_pred)),
            "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
            "r2": float(r2_score(y_test, y_pred)),
            "mape": _mape(y_test, y_pred),
            "aqi_category_accuracy": _aqi_category_accuracy(y_test, y_pred),
        }

        # Generate report
        model_name = Path(model_path).stem
        report = {
            "model_name": model_name,
            "model_path": str(model_path),
            "test_data_path": str(test_data_path),
            "target_col": target_col,
            "n_features": len(available_features),
            "n_test_samples": int(X_test.shape[0]),
            "metrics": metrics,
            "residual_stats": {
                "mean": float(np.mean(y_test - y_pred)),
                "std": float(np.std(y_test - y_pred)),
                "min": float(np.min(y_test - y_pred)),
                "max": float(np.max(y_test - y_pred)),
                "median": float(np.median(y_test - y_pred)),
            },
        }

        # Save report
        report_path = self.output_dir / f"{model_name}_evaluation.json"
        with open(report_path, "w") as f:
            json.dump(report, f, indent=2)
        logger.info("Evaluation report saved to %s", report_path)

        # Print summary
        self._print_metrics(model_name, metrics)

        # Generate SHAP report
        try:
            self.generate_shap_report(
                model=model,
                X_sample=X_test.iloc[:min(500, len(X_test))],
                output_dir=str(self.output_dir),
                model_name=model_name,
            )
        except Exception as e:
            logger.warning("SHAP report generation failed: %s", e)

        return {"metrics": metrics, "report_path": str(report_path)}

    def generate_shap_report(
        self,
        model: Any,
        X_sample: pd.DataFrame,
        output_dir: str,
        model_name: str = "model",
    ) -> Path:
        """Generate SHAP feature importance report as JSON.

        Args:
            model: Trained model (must be tree-based for TreeExplainer).
            X_sample: Sample of feature data for SHAP computation.
            output_dir: Directory to save SHAP report.
            model_name: Name prefix for output file.

        Returns:
            Path to saved SHAP report JSON.
        """
        import shap

        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        logger.info("Computing SHAP values for %s (%d samples)...", model_name, len(X_sample))

        # Use TreeExplainer for XGBoost/LightGBM
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_sample)

        # Compute mean absolute SHAP for feature importance
        mean_abs_shap = np.mean(np.abs(shap_values), axis=0)
        feature_importance = dict(zip(X_sample.columns.tolist(), mean_abs_shap.tolist()))

        # Sort by importance
        feature_importance = dict(
            sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
        )

        # Top-20 features
        top_features = dict(list(feature_importance.items())[:20])

        shap_report = {
            "model_name": model_name,
            "n_samples": len(X_sample),
            "n_features": len(X_sample.columns),
            "expected_value": float(explainer.expected_value)
            if np.isscalar(explainer.expected_value)
            else float(explainer.expected_value[0]) if hasattr(explainer.expected_value, '__len__') else float(explainer.expected_value),
            "top_20_features": top_features,
            "all_feature_importance": feature_importance,
        }

        shap_path = output_path / f"{model_name}_shap.json"
        with open(shap_path, "w") as f:
            json.dump(shap_report, f, indent=2)
        logger.info("SHAP report saved to %s", shap_path)

        return shap_path

    def _print_metrics(self, model_name: str, metrics: dict[str, float]) -> None:
        """Print evaluation metrics in formatted output."""
        print(f"\n  Evaluation: {model_name}")
        print("-" * 45)
        print(f"  {'MAE':<25s} {metrics['mae']:>10.4f}")
        print(f"  {'RMSE':<25s} {metrics['rmse']:>10.4f}")
        print(f"  {'R²':<25s} {metrics['r2']:>10.4f}")
        print(f"  {'MAPE':<25s} {metrics['mape']:>10.2f}%")
        print(f"  {'AQI Category Accuracy':<25s} {metrics['aqi_category_accuracy']:>10.1%}")
        print("-" * 45)


# --- Legacy CLI interface (backward compatible) ---


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate trained air quality model")
    parser.add_argument("--model-path", type=str, required=True, help="Path to saved model pickle")
    parser.add_argument("--data", type=str, required=True, help="Path to evaluation data CSV")
    parser.add_argument("--output", type=str, default=None, help="Path to save evaluation report JSON")
    parser.add_argument("--feature-cols", type=str, nargs="+", default=None, help="Override feature columns")
    parser.add_argument("--target-col", type=str, default="aqi_value_t+1", help="Target column name")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    runner = EvaluationRunner(output_dir=args.output or str(MODELS_DIR))

    # Load feature cols from metadata if not provided
    feature_cols = args.feature_cols
    if feature_cols is None:
        meta_path = Path(args.model_path).with_suffix(".pkl").parent / (
            Path(args.model_path).stem + "_meta.json"
        )
        if meta_path.exists():
            with open(meta_path) as f:
                meta = json.load(f)
            feature_cols = meta.get("features", [])
        else:
            raise ValueError("No feature columns provided and no metadata file found.")

    runner.run(
        model_path=args.model_path,
        test_data_path=args.data,
        feature_cols=feature_cols,
        target_col=args.target_col,
    )


if __name__ == "__main__":
    main()
