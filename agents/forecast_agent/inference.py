"""Batch and real-time inference orchestration."""

from __future__ import annotations

import logging
from typing import Any, Literal

import pandas as pd

from agents.forecast_agent.predictor import AQIPredictor

logger = logging.getLogger(__name__)


class InferenceEngine:
    """Orchestrate batch and streaming inference for AQI predictions.

    Supports scheduled batch runs and on-demand single-record inference.

    Attributes:
        predictor: Underlying model predictor.
        batch_size: Records per batch for chunked inference.
    """

    def __init__(
        self,
        model_type: Literal["xgboost", "lightgbm"] = "xgboost",
        batch_size: int = 256,
    ) -> None:
        self.predictor = AQIPredictor(model_type=model_type)
        self.batch_size = batch_size

    def run_batch(self, features_df: pd.DataFrame) -> list[dict[str, Any]]:
        """Run inference on a full DataFrame in batches.

        Args:
            features_df: Feature matrix with station_id column.

        Returns:
            Combined prediction results from all batches.
        """
        if features_df.empty:
            return []

        self.predictor.load_model()
        all_results: list[dict[str, Any]] = []

        total_rows = len(features_df)
        for start_idx in range(0, total_rows, self.batch_size):
            end_idx = min(start_idx + self.batch_size, total_rows)
            batch = features_df.iloc[start_idx:end_idx]

            logger.info(
                "Running inference batch %d-%d / %d",
                start_idx, end_idx, total_rows,
            )

            batch_results = self.predictor.predict(batch)
            all_results.extend(batch_results)

        logger.info("Batch inference complete: %d predictions generated.", len(all_results))
        return all_results

    def run_single(
        self,
        features: dict[str, Any],
    ) -> dict[str, Any] | None:
        """Run inference for a single record.

        Args:
            features: Feature dict for one station/timestamp.

        Returns:
            Prediction dict or None if features are invalid.
        """
        if not features:
            return None

        self.predictor.load_model()
        df = pd.DataFrame([features])

        station_id = features.get("station_id", "unknown")
        feature_cols = [c for c in df.columns if c not in ("station_id", "timestamp")]
        X = df[feature_cols].values

        predictions = self.predictor._model.predict(X) if self.predictor._model else [0.0]

        return {
            "station_id": station_id,
            "pollutant": features.get("pollutant", "pm25"),
            "predicted_aqi": round(float(predictions[0]), 1),
            "confidence": 0.70,
            "horizon_hours": self.predictor.horizon_hours,
        }

    def run_streaming(self, record: dict[str, Any]) -> dict[str, Any] | None:
        """Process a single streaming record (alias for run_single with logging).

        Args:
            record: Incoming real-time data record.

        Returns:
            Prediction dict or None.
        """
        logger.debug("Streaming inference for station=%s", record.get("station_id"))
        return self.run_single(record)
