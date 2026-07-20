"""Classify pollution sources using feature-based rules and ML."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)

# Default model path for SHAP-based attribution
_DEFAULT_MODEL_PATH = Path(__file__).resolve().parents[2] / "ml" / "models" / "xgboost_24h.pkl"

POLLUTION_SOURCES = {
    "vehicular": {"road_density", "traffic_pop_interaction", "wind_u"},
    "industrial": {"industrial_poi_count", "mean_aod", "mean_ndvi"},
    "biomass_burning": {"fire_count", "total_frp", "fire_wind_interaction"},
    "construction": {"road_density", "temperature_c"},
    "natural": {"mean_ndvi", "wind_speed_ms", "humidity_pct"},
}


class SourceClassifier:
    """Classify dominant pollution sources for a given station record.

    Uses a combination of rule-based heuristics and learned feature
    importance to attribute AQI readings to source categories.

    Attributes:
        threshold: Minimum score for a source to be considered dominant.
    """

    def __init__(self, threshold: float = 0.25) -> None:
        self.threshold = threshold

    def classify(self, record: dict[str, Any]) -> dict[str, Any]:
        """Classify pollution sources for a single station record.

        Args:
            record: Merged data record with environmental features.

        Returns:
            Dict with dominant_source, source_breakdown, and evidence.
        """
        scores = self._compute_source_scores(record)
        evidence = self._gather_evidence(record, scores)

        dominant_source = max(scores, key=scores.get) if scores else "unknown"
        if scores.get(dominant_source, 0) < self.threshold:
            dominant_source = "mixed"

        return {
            "dominant_source": dominant_source,
            "source_breakdown": {k: round(v, 4) for k, v in scores.items()},
            "evidence": evidence,
        }

    def _compute_source_scores(self, record: dict[str, Any]) -> dict[str, float]:
        """Compute normalized likelihood scores for each source.

        Args:
            record: Feature dict.

        Returns:
            Dict mapping source name to score in [0, 1].
        """
        raw_scores: dict[str, float] = {}

        road_density = record.get("road_density", 0)
        industrial = record.get("industrial_poi_count", 0)
        fire_count = record.get("fire_count", 0)
        ndvi = record.get("mean_ndvi", 0.5)
        wind = record.get("wind_speed_ms", 0)
        humidity = record.get("humidity_pct", 50)
        aqi = record.get("aqi_value", 0)

        raw_scores["vehicular"] = self._normalize(road_density, max_val=10)
        raw_scores["industrial"] = self._normalize(industrial, max_val=20) + self._normalize(aqi, max_val=200) * 0.3
        raw_scores["biomass_burning"] = self._normalize(fire_count, max_val=10)
        raw_scores["construction"] = self._normalize(road_density, max_val=15) * 0.5 + (1 - self._normalize(ndvi, max_val=1)) * 0.5
        raw_scores["natural"] = (1 - self._normalize(aqi, max_val=200)) * 0.4 + self._normalize(ndvi, max_val=1) * 0.3

        total = sum(raw_scores.values()) or 1.0
        return {k: v / total for k, v in raw_scores.items()}

    @staticmethod
    def _normalize(value: float | int | None, max_val: float = 1.0) -> float:
        """Normalize a value to [0, 1] with clamping.

        Args:
            value: Raw numeric value.
            max_val: Maximum expected value for normalization.

        Returns:
            Normalized value.
        """
        if value is None or max_val == 0:
            return 0.0
        return float(np.clip(value / max_val, 0.0, 1.0))

    def _gather_evidence(
        self,
        record: dict[str, Any],
        scores: dict[str, float],
    ) -> list[str]:
        """Collect human-readable evidence strings supporting the classification.

        Args:
            record: Feature dict.
            scores: Computed source scores.

        Returns:
            List of evidence description strings.
        """
        evidence: list[str] = []

        if scores.get("vehicular", 0) > 0.3:
            road = record.get("road_density", 0)
            evidence.append(f"High road density ({road:.1f} km/km²) indicates vehicular emissions.")

        if scores.get("industrial", 0) > 0.3:
            ind = record.get("industrial_poi_count", 0)
            evidence.append(f"{ind} industrial POIs detected in area.")

        if scores.get("biomass_burning", 0) > 0.3:
            fires = record.get("fire_count", 0)
            frp = record.get("total_frp", 0)
            evidence.append(f"{fires} active fire hotspots with total FRP of {frp:.1f} MW.")

        if scores.get("natural", 0) > 0.3:
            ndvi = record.get("mean_ndvi", 0)
            evidence.append(f"High vegetation cover (NDVI={ndvi:.2f}) suggests natural sources.")

        if not evidence:
            evidence.append("No strong single-source indicators; mixed attribution.")

        return evidence

    def classify_hybrid(
        self,
        record: dict[str, Any],
        model_path: str | Path | None = None,
    ) -> dict[str, Any]:
        """Hybrid classification using SHAP when model is available.

        Attempts SHAP-based attribution as primary method. Falls back
        to rule-based classify() if the model file is missing or SHAP
        computation fails.

        Args:
            record: Merged data record with environmental features.
            model_path: Path to pickled model. Defaults to
                ml/models/xgboost_24h.pkl.

        Returns:
            Dict with dominant_source, source_breakdown, evidence, and method.
        """
        from agents.attribution_agent.shap_attribution import SHAPAttributor

        resolved_path = Path(model_path) if model_path else _DEFAULT_MODEL_PATH

        # Attempt SHAP-based attribution
        try:
            if not resolved_path.exists():
                raise FileNotFoundError(f"Model not found: {resolved_path}")

            attributor = SHAPAttributor(model_path=resolved_path)
            result = attributor.attribute(record)
            result["method"] = "shap"
            logger.info(
                "SHAP attribution: dominant_source=%s", result["dominant_source"]
            )
            return result

        except (FileNotFoundError, RuntimeError, ImportError) as e:
            logger.warning(
                "SHAP attribution unavailable (%s); falling back to rule-based.",
                e,
            )

        # Fallback to rule-based classification
        result = self.classify(record)
        result["method"] = "rule_based"
        result["shap_available"] = False
        return result
