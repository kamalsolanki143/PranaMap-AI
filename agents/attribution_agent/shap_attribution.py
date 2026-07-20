"""SHAP-based hybrid source attribution for pollutant sector identification."""

from __future__ import annotations

import logging
import pickle
from pathlib import Path
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)


class SHAPAttributor:
    """Attribute AQI predictions to pollution source sectors using SHAP values.

    Computes per-sector contribution scores by aggregating SHAP values
    for features mapped to each source sector. Falls back to permutation
    importance when SHAP library is unavailable.

    Attributes:
        model: Loaded ML model with predict method.
        feature_names: Ordered list of model feature names.
    """

    # Source sector -> feature mapping
    SECTOR_FEATURES: dict[str, list[str]] = {
        "vehicular": [
            "traffic_index",
            "road_density",
            "no2_lag_1h",
            "co_lag_1h",
            "no2",
            "co",
        ],
        "industrial": [
            "industrial_proximity",
            "industrial_poi_count",
            "so2",
            "so2_lag_1h",
            "mean_aod",
        ],
        "biomass_burning": [
            "fire_count",
            "total_frp",
            "fire_wind_interaction",
        ],
        "construction": [
            "pm10",
            "road_density",
            "mean_ndvi",
        ],  # high pm10/pm25 ratio + low ndvi
        "natural": [
            "wind_speed_ms",
            "humidity_pct",
            "mean_ndvi",
            "temperature_c",
        ],
    }

    # Human-readable labels for evidence generation
    _FEATURE_LABELS: dict[str, str] = {
        "traffic_index": "Traffic index",
        "road_density": "Road density",
        "no2_lag_1h": "NO₂ (1h lag)",
        "co_lag_1h": "CO (1h lag)",
        "no2": "NO₂ level",
        "co": "CO level",
        "industrial_proximity": "Industrial proximity",
        "industrial_poi_count": "Industrial POI count",
        "so2": "SO₂ level",
        "so2_lag_1h": "SO₂ (1h lag)",
        "mean_aod": "Aerosol optical depth",
        "fire_count": "Fire hotspot count",
        "total_frp": "Fire radiative power",
        "fire_wind_interaction": "Fire-wind interaction",
        "pm10": "PM10 level",
        "mean_ndvi": "Vegetation index (NDVI)",
        "wind_speed_ms": "Wind speed",
        "humidity_pct": "Humidity",
        "temperature_c": "Temperature",
    }

    def __init__(self, model_path: str | Path | None = None) -> None:
        """Initialize the SHAP attributor.

        Args:
            model_path: Path to a pickled model file. If None, model must
                be set later via load_model().
        """
        self.model: Any = None
        self.feature_names: list[str] = []

        if model_path is not None:
            self.load_model(model_path)

    def load_model(self, model_path: str | Path) -> None:
        """Load a trained model from a pickle file.

        Also loads feature names from the companion metadata JSON if
        available.

        Args:
            model_path: Path to pickled model file.

        Raises:
            FileNotFoundError: If model_path does not exist.
        """
        model_path = Path(model_path)
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found: {model_path}")

        with open(model_path, "rb") as f:
            self.model = pickle.load(f)

        # Try to load feature names from metadata
        meta_path = model_path.with_name(
            model_path.stem + "_meta.json"
        )
        if meta_path.exists():
            import json

            with open(meta_path) as f:
                meta = json.load(f)
            self.feature_names = meta.get("features", [])
            logger.info(
                "Loaded model with %d features from %s",
                len(self.feature_names),
                model_path.name,
            )
        else:
            logger.warning(
                "No metadata found for %s; feature names unavailable.",
                model_path.name,
            )

    def attribute(self, feature_dict: dict[str, Any]) -> dict[str, Any]:
        """Attribute AQI prediction to source sectors.

        Args:
            feature_dict: Dict mapping feature names to values. Must
                contain at least the features the model was trained on.

        Returns:
            Dict with keys:
                - source_breakdown: {sector: score} normalized to sum to 1.0
                - dominant_source: sector with highest score
                - evidence: list of human-readable evidence strings
                - shap_available: whether SHAP was used (vs fallback)
        """
        if self.model is None:
            raise RuntimeError(
                "No model loaded. Call load_model() or pass model_path to __init__."
            )

        # Build input array in correct feature order
        X = self._build_feature_array(feature_dict)

        # Compute SHAP values
        shap_values, shap_available = self._compute_shap_values(X)

        # Aggregate into sector scores
        sector_scores = self._compute_sector_scores(shap_values, self.feature_names)

        # Determine dominant source
        dominant_source = max(sector_scores, key=sector_scores.get)

        # Generate evidence strings
        evidence = self._generate_evidence(shap_values, self.feature_names)

        return {
            "source_breakdown": {k: round(v, 4) for k, v in sector_scores.items()},
            "dominant_source": dominant_source,
            "evidence": evidence,
            "shap_available": shap_available,
        }

    def _build_feature_array(self, feature_dict: dict[str, Any]) -> np.ndarray:
        """Convert feature dict to numpy array in model feature order.

        Args:
            feature_dict: Raw feature values.

        Returns:
            Numpy array of shape (1, n_features).
        """
        values = []
        for feat in self.feature_names:
            val = feature_dict.get(feat, 0.0)
            values.append(float(val) if val is not None else 0.0)
        return np.array([values], dtype=np.float64)

    def _compute_shap_values(self, X: np.ndarray) -> tuple[np.ndarray, bool]:
        """Compute SHAP values for the input features.

        Attempts TreeExplainer first; falls back to permutation-based
        approximation if SHAP is not installed.

        Args:
            X: Feature array of shape (1, n_features).

        Returns:
            Tuple of (shap_values array, whether SHAP library was used).
        """
        try:
            import shap

            explainer = shap.TreeExplainer(self.model)
            values = explainer.shap_values(X)
            if isinstance(values, list):
                values = values[0]
            return np.array(values).flatten(), True
        except ImportError:
            logger.warning("SHAP not installed; using permutation-based fallback.")
            return self._permutation_importance(X), False
        except Exception as e:
            logger.warning("SHAP computation failed (%s); using fallback.", e)
            return self._permutation_importance(X), False

    def _permutation_importance(self, X: np.ndarray) -> np.ndarray:
        """Approximate feature importance via single-feature permutation.

        Args:
            X: Feature array of shape (1, n_features).

        Returns:
            Importance values array of shape (n_features,).
        """
        baseline = float(self.model.predict(X)[0])
        importances = np.zeros(X.shape[1])

        for j in range(X.shape[1]):
            X_permuted = X.copy()
            X_permuted[0, j] = 0.0  # Zero out feature
            permuted_pred = float(self.model.predict(X_permuted)[0])
            importances[j] = baseline - permuted_pred  # Signed contribution

        return importances

    def _compute_sector_scores(
        self,
        shap_values: np.ndarray,
        feature_names: list[str],
    ) -> dict[str, float]:
        """Aggregate SHAP values by sector and normalize.

        Sums the absolute SHAP values for each sector's features,
        then normalizes so all sectors sum to 1.0.

        Args:
            shap_values: Flat array of SHAP values per feature.
            feature_names: Ordered feature names corresponding to shap_values.

        Returns:
            Dict mapping sector names to normalized scores.
        """
        # Build feature name -> index lookup
        feat_idx = {name: i for i, name in enumerate(feature_names)}

        sector_scores: dict[str, float] = {}
        for sector, features in self.SECTOR_FEATURES.items():
            total = 0.0
            for feat in features:
                if feat in feat_idx:
                    total += abs(float(shap_values[feat_idx[feat]]))
            sector_scores[sector] = total

        # Normalize to sum to 1.0
        grand_total = sum(sector_scores.values())
        if grand_total > 0:
            sector_scores = {k: v / grand_total for k, v in sector_scores.items()}
        else:
            # Equal distribution as fallback
            n_sectors = len(sector_scores)
            sector_scores = {k: 1.0 / n_sectors for k in sector_scores}

        return sector_scores

    def _generate_evidence(
        self,
        shap_values: np.ndarray,
        feature_names: list[str],
    ) -> list[str]:
        """Generate human-readable evidence from SHAP values.

        Produces strings like 'Traffic index contributed +12.3 AQI points'.

        Args:
            shap_values: Flat SHAP values array.
            feature_names: Ordered feature names.

        Returns:
            List of evidence strings for top contributing features.
        """
        # Get sector features and find top contributors
        all_sector_features: set[str] = set()
        for features in self.SECTOR_FEATURES.values():
            all_sector_features.update(features)

        feat_idx = {name: i for i, name in enumerate(feature_names)}

        # Collect (feature_name, shap_value) for sector-relevant features
        contributions: list[tuple[str, float]] = []
        for feat in all_sector_features:
            if feat in feat_idx:
                sv = float(shap_values[feat_idx[feat]])
                if abs(sv) > 0.5:  # Only include meaningful contributions
                    contributions.append((feat, sv))

        # Sort by absolute value descending
        contributions.sort(key=lambda x: abs(x[1]), reverse=True)

        evidence: list[str] = []
        for feat, sv in contributions[:7]:  # Top 7 contributors
            label = self._FEATURE_LABELS.get(feat, feat)
            sign = "+" if sv > 0 else ""
            evidence.append(f"{label} contributed {sign}{sv:.1f} AQI points")

        if not evidence:
            evidence.append("No strong single-feature contributors identified.")

        return evidence
