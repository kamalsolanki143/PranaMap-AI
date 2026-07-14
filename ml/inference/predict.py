"""Model loading and prediction interface for air quality inference.

Provides a clean API for loading trained models and generating
AQI predictions from raw or processed feature vectors.
"""

import logging
import pickle
from pathlib import Path

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

DEFAULT_FEATURE_COLS = [
    "pm25", "pm10", "no2", "so2", "co", "o3",
    "temperature", "humidity", "wind_speed", "wind_direction",
    "pressure", "hour", "day_of_week", "month",
    "lat", "lon", "elevation", "population_density",
    "traffic_index", "industrial_proximity",
]


class AQIPredictor:
    """Encapsulates model loading, preprocessing, and prediction.

    Attributes:
        model: The loaded ML model (XGBoost Booster or LightGBM Booster).
        scaler: Optional StandardScaler for feature normalization.
        feature_cols: Ordered list of feature column names.
    """

    def __init__(self, model_path: str, scaler_path: str | None = None,
                 feature_cols: list[str] | None = None):
        """Load model and optional scaler from disk.

        Args:
            model_path: Path to the pickled model file.
            scaler_path: Optional path to the pickled StandardScaler.
            feature_cols: Override the default feature column order.
        """
        self.feature_cols = feature_cols or DEFAULT_FEATURE_COLS
        self.model = self._load_pickle(model_path)
        self.scaler = self._load_pickle(scaler_path) if scaler_path else None
        logger.info(f"Predictor initialized with model from {model_path}")

    @staticmethod
    def _load_pickle(path: str | None):
        """Deserialize a pickle file."""
        if path is None:
            return None
        with open(path, "rb") as f:
            return pickle.load(f)

    def _validate_features(self, X: pd.DataFrame) -> pd.DataFrame:
        """Ensure the input DataFrame has all required columns in order."""
        missing = set(self.feature_cols) - set(X.columns)
        if missing:
            raise ValueError(f"Missing feature columns: {missing}")
        return X[self.feature_cols]

    def predict(self, X: pd.DataFrame | dict | np.ndarray) -> np.ndarray:
        """Generate AQI predictions.

        Args:
            X: Input data as a DataFrame, dict, or numpy array.

        Returns:
            Array of predicted AQI values.

        Raises:
            ValueError: If input is missing required features.
        """
        if isinstance(X, dict):
            X = pd.DataFrame([X])
        elif isinstance(X, np.ndarray):
            X = pd.DataFrame(X, columns=self.feature_cols)

        X = self._validate_features(X)

        if self.scaler is not None:
            X = pd.DataFrame(self.scaler.transform(X), columns=self.feature_cols, index=X.index)

        predictions = self.model.predict(X)
        return np.array(predictions)

    def predict_single(self, features: dict) -> float:
        """Predict AQI for a single observation.

        Args:
            features: Dictionary mapping feature names to values.

        Returns:
            Predicted AQI as a float.
        """
        preds = self.predict(features)
        return float(preds[0])


def load_predictor(model_path: str, scaler_path: str | None = None) -> AQIPredictor:
    """Convenience factory to create an AQIPredictor instance.

    Args:
        model_path: Path to the pickled model.
        scaler_path: Optional path to the pickled scaler.

    Returns:
        Ready-to-use AQIPredictor instance.
    """
    return AQIPredictor(model_path=model_path, scaler_path=scaler_path)
