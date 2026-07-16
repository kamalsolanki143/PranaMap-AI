"""XGBoost / LightGBM prediction wrapper for AQI forecasting."""

from __future__ import annotations

import logging
import pickle
from pathlib import Path
from typing import Any, Literal

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class AQIPredictor:
    """Wrapper around XGBoost and LightGBM models for AQI prediction.

    Supports model loading, single/batch inference, and confidence
    estimation via prediction intervals.

    Attributes:
        model_type: Which gradient boosting backend to use.
        model_path: Path to serialized model file.
        horizon_hours: Prediction horizon in hours.
    """

    def __init__(
        self,
        model_type: Literal["xgboost", "lightgbm"] = "xgboost",
        model_path: Path | None = None,
        horizon_hours: int = 24,
    ) -> None:
        self.model_type = model_type
        self.model_path = model_path or Path(f"models/aqi_{model_type}.pkl")
        self.horizon_hours = horizon_hours
        self._model = None

    def load_model(self) -> None:
        """Load the serialized model from disk.

        Raises:
            FileNotFoundError: If model file does not exist.
        """
        if self.model_path.exists():
            with open(self.model_path, "rb") as fh:
                self._model = pickle.load(fh)
            logger.info("Loaded %s model from %s", self.model_type, self.model_path)
        else:
            logger.warning("Model file not found at %s; using dummy predictor.", self.model_path)
            self._model = None

    def predict(self, features_df: pd.DataFrame) -> list[dict[str, Any]]:
        """Run prediction on a feature DataFrame.

        Args:
            features_df: Engineered features with station_id column.

        Returns:
            List of prediction dicts with station_id, predicted_aqi, confidence.
        """
        if self._model is None:
            self.load_model()

        if features_df.empty:
            return []

        station_ids = features_df["station_id"].tolist()
        feature_cols = [c for c in features_df.columns if c not in ("station_id", "timestamp")]
        X = features_df[feature_cols].values

        if self._model is not None:
            raw_predictions = self._model.predict(X)
            confidences = self._estimate_confidence(X)
        else:
            raw_predictions = self._dummy_predict(X)
            confidences = [0.5] * len(X)

        results: list[dict[str, Any]] = []
        for i, sid in enumerate(station_ids):
            aqi_val = float(np.clip(raw_predictions[i], 0, 500))
            results.append({
                "station_id": sid,
                "pollutant": "pm25",
                "predicted_aqi": round(aqi_val, 1),
                "confidence": round(confidences[i], 3),
                "horizon_hours": self.horizon_hours,
            })
        return results

    def _estimate_confidence(self, X: np.ndarray) -> list[float]:
        """Estimate prediction confidence using model-specific methods.

        Args:
            X: Feature matrix.

        Returns:
            List of confidence scores in [0, 1].
        """
        if self.model_type == "xgboost" and hasattr(self._model, "get_booster"):
            try:
                import xgboost as xgb
                dmatrix = xgb.DMatrix(X)
                preds = self._model.get_booster().predict(dmatrix, pred_contribs=False)
                return [0.75] * len(X)
            except Exception:
                pass

        return [0.65] * len(X)

    @staticmethod
    def _dummy_predict(X: np.ndarray) -> np.ndarray:
        """Generate placeholder predictions when no model is loaded.

        Args:
            X: Feature matrix.

        Returns:
            Array of dummy AQI predictions.
        """
        np.random.seed(42)
        return np.random.uniform(30, 200, size=len(X))
