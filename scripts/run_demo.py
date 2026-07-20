#!/usr/bin/env python3
"""
PranaMap AI — End-to-End Demo Pipeline

Runs the complete AQI forecasting → source attribution → advisory pipeline
for sample Pune wards. Fully offline, no API keys required.

Usage:
    python3 scripts/run_demo.py
"""

from __future__ import annotations

import json
import logging
import os
import pickle
import subprocess
import sys
from pathlib import Path

# ─── Project root setup ──────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import numpy as np
import pandas as pd

logging.basicConfig(
    level=logging.WARNING,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# ─── Constants ────────────────────────────────────────────────────────────────
DATASETS_DIR = PROJECT_ROOT / "ml" / "datasets"
MODELS_DIR = PROJECT_ROOT / "ml" / "models"
TRAIN_CSV = DATASETS_DIR / "pune_aqi_train.csv"
TEST_CSV = DATASETS_DIR / "pune_aqi_test.csv"
MODEL_PATH = MODELS_DIR / "xgboost_24h.pkl"
META_PATH = MODELS_DIR / "xgboost_24h_meta.json"

DEMO_WARDS = ["Kothrud", "Swargate", "Pimpri-Chinchwad"]


# ─── Step 0: Ensure prerequisites ────────────────────────────────────────────

def ensure_synthetic_data() -> None:
    """Check if synthetic data exists; generate if not."""
    if TRAIN_CSV.exists() and TEST_CSV.exists():
        print("✓ Synthetic data found.")
        return

    print("⏳ Synthetic data not found. Generating...")
    gen_script = DATASETS_DIR / "generate_synthetic.py"
    if not gen_script.exists():
        print("  ✗ generate_synthetic.py not found at", gen_script)
        sys.exit(1)

    result = subprocess.run(
        [sys.executable, str(gen_script), "--output-dir", str(DATASETS_DIR)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print("  ✗ Data generation failed:")
        print(result.stderr[-500:] if result.stderr else "No error output")
        sys.exit(1)
    print("  ✓ Synthetic data generated.")


def ensure_models() -> None:
    """Check if trained models exist; train if not."""
    if MODEL_PATH.exists() and META_PATH.exists():
        print("✓ Trained model found (xgboost_24h.pkl).")
        return

    print("⏳ Models not found. Training...")
    train_script = PROJECT_ROOT / "ml" / "training" / "train_all.py"
    if not train_script.exists():
        print("  ✗ train_all.py not found at", train_script)
        sys.exit(1)

    result = subprocess.run(
        [sys.executable, str(train_script), "--data", str(TRAIN_CSV)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print("  ✗ Training failed:")
        print(result.stderr[-500:] if result.stderr else "No error output")
        sys.exit(1)
    print("  ✓ Models trained successfully.")


# ─── Step 1: Load test data ──────────────────────────────────────────────────

def load_test_data() -> pd.DataFrame:
    """Load test data CSV."""
    df = pd.read_csv(TEST_CSV, parse_dates=["recorded_at"])
    print(f"✓ Loaded test data: {len(df)} rows, {df['ward_name'].nunique()} wards.")
    return df


# ─── Step 2: Feature Engineering ─────────────────────────────────────────────

def prepare_ward_features(df: pd.DataFrame, ward_name: str, feature_names: list[str]) -> tuple[dict, float]:
    """Prepare features for a single ward from test data.

    Applies feature engineering (lag/rolling features) on recent ward data,
    then returns the latest complete feature vector.

    Args:
        df: Full test dataframe.
        ward_name: Ward to process.
        feature_names: Expected model feature names.

    Returns:
        Tuple of (feature_dict, current_aqi).
    """
    from data_pipeline.preprocess.engineering import build_feature_matrix

    ward_df = df[df["ward_name"] == ward_name].copy()
    ward_df = ward_df.sort_values("recorded_at").reset_index(drop=True)

    if ward_df.empty:
        raise ValueError(f"No data for ward: {ward_name}")

    # Build feature matrix (with lags, rolling stats, cyclical encodings)
    featured = build_feature_matrix(ward_df, target_col="aqi_value", horizons=[24])

    # Drop rows with NaN (initial lag period)
    featured = featured.dropna(subset=[c for c in feature_names if c in featured.columns])

    if featured.empty:
        raise ValueError(f"No complete feature rows for ward: {ward_name}")

    # Take the last row (most recent complete data point)
    last_row = featured.iloc[-1]

    # Build feature dict matching model's expected feature order
    feature_dict = {}
    for feat in feature_names:
        if feat in last_row.index:
            val = last_row[feat]
            feature_dict[feat] = float(val) if pd.notna(val) else 0.0
        else:
            feature_dict[feat] = 0.0

    current_aqi = float(last_row.get("aqi_value", 0))
    return feature_dict, current_aqi


# ─── Step 3: Model Prediction ────────────────────────────────────────────────

def predict_aqi(model, feature_dict: dict, feature_names: list[str]) -> float:
    """Run XGBoost prediction on a feature vector.

    Args:
        model: Loaded model with predict() method.
        feature_dict: Dict mapping feature names to values.
        feature_names: Ordered feature list.

    Returns:
        Predicted AQI value.
    """
    X = np.array([[feature_dict.get(f, 0.0) for f in feature_names]])
    pred = model.predict(X)
    return float(pred[0])


# ─── Step 4: Source Attribution ───────────────────────────────────────────────

def run_attribution(feature_dict: dict) -> dict:
    """Run SHAP-based source attribution.

    Args:
        feature_dict: Feature vector dict.

    Returns:
        Attribution result with source_breakdown, dominant_source, evidence.
    """
    from agents.attribution_agent.shap_attribution import SHAPAttributor

    attributor = SHAPAttributor(model_path=str(MODEL_PATH))
    result = attributor.attribute(feature_dict)
    return result


# ─── Step 5: Enforcement Priority ────────────────────────────────────────────

def compute_enforcement(attribution_result: dict, predicted_aqi: float) -> dict:
    """Compute enforcement priority and recommend intervention.

    Args:
        attribution_result: Source attribution result.
        predicted_aqi: Predicted AQI value.

    Returns:
        Dict with priority_score, priority_rank, and intervention.
    """
    from agents.enforcement_agent.ranking import PriorityRanker
    from agents.enforcement_agent.intervention import InterventionRecommender

    # Add confidence based on SHAP availability
    attribution_with_meta = {
        **attribution_result,
        "confidence": 0.85 if attribution_result.get("shap_available") else 0.6,
        "station_id": "demo",
    }

    ranker = PriorityRanker()
    ranked = ranker.rank([attribution_with_meta])
    ranked_item = ranked[0] if ranked else attribution_with_meta

    recommender = InterventionRecommender()
    enforcement = recommender.recommend(ranked_item)
    return enforcement


# ─── Step 6: Advisory Generation ─────────────────────────────────────────────

def generate_advisory(
    ward_name: str,
    predicted_aqi: float,
    current_aqi: float,
    attribution_result: dict,
) -> dict:
    """Generate multilingual advisory using template mode.

    Args:
        ward_name: Name of the ward.
        predicted_aqi: Forecasted AQI.
        current_aqi: Current AQI reading.
        attribution_result: Source attribution output.

    Returns:
        Advisory dict with EN/HI/MR messages.
    """
    from agents.advisory_agent.advisory import AdvisoryGenerator

    generator = AdvisoryGenerator(use_templates=True)

    forecast_result = {
        "predicted_aqi": predicted_aqi,
        "current_aqi": current_aqi,
        "ward_name": ward_name,
        "horizon_hours": 24,
    }

    advisory = generator.generate_from_forecast(forecast_result, attribution_result)
    return advisory


# ─── Output Formatting ────────────────────────────────────────────────────────

def print_ward_result(
    ward_name: str,
    current_aqi: float,
    predicted_aqi: float,
    attribution: dict,
    enforcement: dict,
    advisory: dict,
) -> None:
    """Print formatted results for a single ward."""
    severity = advisory["severity"]
    severity_colors = {
        "good": "\033[92m",          # green
        "moderate": "\033[93m",      # yellow
        "unhealthy_sensitive": "\033[33m",  # orange
        "unhealthy": "\033[91m",     # red
        "very_unhealthy": "\033[95m",  # magenta
        "hazardous": "\033[31m",     # dark red
    }
    color = severity_colors.get(severity, "\033[0m")
    reset = "\033[0m"

    print(f"\n{'━' * 72}")
    print(f"  📍 {ward_name}")
    print(f"{'━' * 72}")

    # AQI Summary
    print(f"\n  {'─── AQI Forecast ───'}")
    print(f"    Current AQI:   {current_aqi:.0f}")
    print(f"    Predicted AQI: {color}{predicted_aqi:.0f} ({severity.upper().replace('_', ' ')}){reset}")
    delta = predicted_aqi - current_aqi
    arrow = "↑" if delta > 0 else "↓" if delta < 0 else "→"
    print(f"    Change:        {arrow} {abs(delta):.0f} AQI points ({'worsening' if delta > 0 else 'improving' if delta < 0 else 'stable'})")

    # Source Attribution
    print(f"\n  {'─── Source Attribution ───'}")
    breakdown = attribution.get("source_breakdown", {})
    # Sort by percentage descending
    sorted_sources = sorted(breakdown.items(), key=lambda x: x[1], reverse=True)
    for source, pct in sorted_sources:
        bar_len = int(pct * 30)
        bar = "█" * bar_len + "░" * (30 - bar_len)
        marker = " ◄" if source == attribution.get("dominant_source") else ""
        print(f"    {source:<20s} {bar} {pct*100:5.1f}%{marker}")

    method = attribution.get("method", attribution.get("shap_available", "unknown"))
    method_str = "SHAP" if method == "shap" or method is True else "Rule-based"
    print(f"    Method: {method_str}")

    # Evidence
    evidence = attribution.get("evidence", [])
    if evidence:
        print(f"\n  {'─── Key Evidence ───'}")
        for ev in evidence[:3]:
            print(f"    • {ev}")

    # Enforcement
    print(f"\n  {'─── Enforcement Priority ───'}")
    print(f"    Priority Score: {enforcement.get('priority_score', 0):.3f}")
    print(f"    Action:         {enforcement.get('intervention_type', 'N/A')}")
    print(f"    Description:    {enforcement.get('intervention_description', 'N/A')}")
    print(f"    Expected Impact: -{enforcement.get('expected_impact_pct', 0):.0f}% AQI reduction")

    # Multilingual Advisory
    print(f"\n  {'─── Health Advisory ───'}")
    print(f"\n    🇬🇧 EN: {advisory['advisory_en']}")
    print(f"\n    🇮🇳 HI: {advisory['advisory_hi']}")
    print(f"\n    🇮🇳 MR: {advisory['advisory_mr']}")

    print(f"\n    Target Groups: {', '.join(advisory['target_groups'])}")


# ─── Main Pipeline ────────────────────────────────────────────────────────────

def main() -> None:
    """Run the complete PranaMap AI demo pipeline."""
    print()
    print("╔══════════════════════════════════════════════════════════════════════╗")
    print("║               🌿 PranaMap AI — Demo Pipeline                       ║")
    print("║               Air Quality Intelligence for Pune                     ║")
    print("╚══════════════════════════════════════════════════════════════════════╝")
    print()

    # Step 0: Ensure data and models exist
    print("── Prerequisites ──────────────────────────────────────────────────────")
    ensure_synthetic_data()
    ensure_models()
    print()

    # Load model
    print("── Loading Model ──────────────────────────────────────────────────────")
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(META_PATH) as f:
        meta = json.load(f)
    feature_names = meta["features"]
    print(f"✓ Model loaded: {meta['model_type']} ({meta['n_features']} features, horizon={meta['horizon_hours']}h)")
    print(f"  CV Metrics: MAE={meta['metrics']['cv_mae_mean']:.1f}, RMSE={meta['metrics']['cv_rmse_mean']:.1f}, R²={meta['metrics']['cv_r2_mean']:.3f}")
    print()

    # Load test data
    print("── Loading Test Data ──────────────────────────────────────────────────")
    df = load_test_data()
    print()

    # Process each demo ward
    print("══════════════════════════════════════════════════════════════════════════")
    print("  WARD-LEVEL FORECAST + ATTRIBUTION + ADVISORY")
    print("══════════════════════════════════════════════════════════════════════════")

    results = []
    for ward_name in DEMO_WARDS:
        try:
            # Feature engineering
            feature_dict, current_aqi = prepare_ward_features(df, ward_name, feature_names)

            # Model prediction
            predicted_aqi = predict_aqi(model, feature_dict, feature_names)

            # Clamp predicted AQI to reasonable range
            predicted_aqi = max(0, min(500, predicted_aqi))

            # Source attribution (SHAP)
            attribution = run_attribution(feature_dict)

            # Enforcement priority
            enforcement = compute_enforcement(attribution, predicted_aqi)

            # Advisory generation (template mode)
            advisory = generate_advisory(ward_name, predicted_aqi, current_aqi, attribution)

            # Print formatted output
            print_ward_result(
                ward_name=ward_name,
                current_aqi=current_aqi,
                predicted_aqi=predicted_aqi,
                attribution=attribution,
                enforcement=enforcement,
                advisory=advisory,
            )

            results.append({
                "ward": ward_name,
                "current_aqi": current_aqi,
                "predicted_aqi": predicted_aqi,
                "severity": advisory["severity"],
                "dominant_source": attribution["dominant_source"],
            })

        except Exception as e:
            print(f"\n  ⚠ Error processing {ward_name}: {e}")
            logger.exception("Error processing %s", ward_name)

    # Summary
    print(f"\n{'━' * 72}")
    print(f"\n── Summary ────────────────────────────────────────────────────────────")
    print(f"  Wards processed: {len(results)}/{len(DEMO_WARDS)}")
    if results:
        avg_pred = np.mean([r["predicted_aqi"] for r in results])
        print(f"  Average predicted AQI: {avg_pred:.0f}")
        print(f"  Wards:")
        for r in results:
            print(f"    • {r['ward']}: AQI {r['current_aqi']:.0f} → {r['predicted_aqi']:.0f} ({r['severity']}) [{r['dominant_source']}]")

    print(f"\n  Pipeline: Forecast → Attribution → Enforcement → Advisory")
    print(f"  Mode: Offline (template-based, no API keys required)")
    print(f"\n{'━' * 72}")
    print("  ✓ Demo complete.\n")


if __name__ == "__main__":
    main()
