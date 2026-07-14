"""SHAP value computation and visualization for model interpretability.

Generates global feature importance, local explanations, and
dependence plots for XGBoost/LightGBM air quality models.
"""

import argparse
import logging
import os
import pickle

import numpy as np
import pandas as pd
import shap
import matplotlib.pyplot as plt

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="SHAP analysis for air quality models")
    parser.add_argument("--model-path", type=str, required=True, help="Path to saved model pickle")
    parser.add_argument("--data", type=str, required=True, help="Path to data CSV for SHAP computation")
    parser.add_argument("--output-dir", type=str, default="../outputs/shap", help="Directory for SHAP plots")
    parser.add_argument("--n-samples", type=int, default=500, help="Number of samples for SHAP (subsample)")
    parser.add_argument("--max-display", type=int, default=20, help="Max features to display in summary plots")
    return parser.parse_args()


def load_model(model_path: str):
    """Load a pickled tree-based model."""
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    return model


def compute_shap_values(model, X: pd.DataFrame) -> shap.Explanation:
    """Compute SHAP values using the TreeExplainer.

    Args:
        model: Trained XGBoost or LightGBM model.
        X: Feature DataFrame.

    Returns:
        SHAP Explanation object.
    """
    explainer = shap.TreeExplainer(model)
    shap_values = explainer(X)
    logger.info(f"Computed SHAP values for {X.shape[0]} samples, {X.shape[1]} features")
    return shap_values


def plot_summary(shap_values: shap.Explanation, output_dir: str, max_display: int = 20) -> None:
    """Generate and save SHAP summary (beeswarm) plot."""
    plt.figure(figsize=(10, 8))
    shap.summary_plot(shap_values, max_display=max_display, show=False)
    plt.tight_layout()
    path = os.path.join(output_dir, "shap_summary.png")
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info(f"Summary plot saved to {path}")


def plot_bar_importance(shap_values: shap.Explanation, output_dir: str, max_display: int = 20) -> None:
    """Generate and save SHAP bar importance plot."""
    plt.figure(figsize=(10, 8))
    shap.plots.bar(shap_values, max_display=max_display, show=False)
    plt.tight_layout()
    path = os.path.join(output_dir, "shap_bar_importance.png")
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info(f"Bar importance plot saved to {path}")


def plot_dependence(shap_values: shap.Explanation, feature: str, output_dir: str) -> None:
    """Generate and save a SHAP dependence plot for a single feature."""
    plt.figure(figsize=(10, 6))
    shap.dependence_plot(feature, shap_values.values, shap_values.data,
                         feature_names=shap_values.feature_names, show=False)
    plt.tight_layout()
    path = os.path.join(output_dir, f"shap_dependence_{feature}.png")
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info(f"Dependence plot saved to {path}")


def export_feature_importance(shap_values: shap.Explanation, output_dir: str) -> None:
    """Export mean absolute SHAP values to CSV."""
    importance = pd.DataFrame({
        "feature": shap_values.feature_names,
        "mean_abs_shap": np.abs(shap_values.values).mean(axis=0),
    }).sort_values("mean_abs_shap", ascending=False)

    path = os.path.join(output_dir, "feature_importance.csv")
    importance.to_csv(path, index=False)
    logger.info(f"Feature importance exported to {path}")


def main() -> None:
    args = parse_args()

    from train import FEATURE_COLS

    model = load_model(args.model_path)

    df = pd.read_csv(args.data)
    df = df.dropna(subset=FEATURE_COLS)
    X = df[FEATURE_COLS]

    if len(X) > args.n_samples:
        X = X.sample(n=args.n_samples, random_state=42)
        logger.info(f"Subsampled to {args.n_samples} rows")

    os.makedirs(args.output_dir, exist_ok=True)

    shap_values = compute_shap_values(model, X)

    plot_summary(shap_values, args.output_dir, args.max_display)
    plot_bar_importance(shap_values, args.output_dir, args.max_display)

    for feat in ["pm25", "temperature", "traffic_index"]:
        if feat in FEATURE_COLS:
            plot_dependence(shap_values, feat, args.output_dir)

    export_feature_importance(shap_values, args.output_dir)
    logger.info("SHAP analysis complete.")


if __name__ == "__main__":
    main()
