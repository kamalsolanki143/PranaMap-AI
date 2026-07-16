"""SHAP-based explainability for source attribution models."""

from __future__ import annotations

import logging
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)


class ExplainabilityEngine:
    """Generate human-readable explanations using SHAP values.

    Provides feature importance rankings and natural language
    explanations for individual predictions.

    Attributes:
        feature_names: Ordered list of feature names.
    """

    def __init__(self, feature_names: list[str] | None = None) -> None:
        self.feature_names = feature_names or []

    def explain(
        self,
        model: Any,
        X: np.ndarray,
        top_k: int = 5,
    ) -> dict[str, Any]:
        """Generate SHAP explanations for a single prediction.

        Args:
            model: Trained model with predict method.
            X: Feature array of shape (1, n_features).
            top_k: Number of top features to include.

        Returns:
            Dict with feature_importances and text_explanation.
        """
        shap_values = self._compute_shap(model, X)
        top_features = self._rank_features(shap_values, top_k)
        text = self._generate_text_explanation(top_features)

        return {
            "feature_importances": top_features,
            "text_explanation": text,
            "expected_value": 0.0,
        }

    def explain_batch(
        self,
        model: Any,
        X: np.ndarray,
        top_k: int = 5,
    ) -> list[dict[str, Any]]:
        """Generate explanations for multiple predictions.

        Args:
            model: Trained model.
            X: Feature array of shape (n_samples, n_features).
            top_k: Top features per prediction.

        Returns:
            List of explanation dicts.
        """
        results: list[dict[str, Any]] = []
        for i in range(len(X)):
            results.append(self.explain(model, X[i : i + 1], top_k))
        return results

    def _compute_shap(self, model: Any, X: np.ndarray) -> np.ndarray:
        """Compute SHAP values for a prediction.

        Args:
            model: Trained model.
            X: Feature array.

        Returns:
            SHAP values array of same shape as X.
        """
        try:
            import shap

            explainer = shap.TreeExplainer(model)
            values = explainer.shap_values(X)
            if isinstance(values, list):
                return np.array(values[0])
            return np.array(values)
        except ImportError:
            logger.warning("SHAP not installed; using permutation-based fallback.")
            return self._permutation_shap(model, X)

    def _permutation_shap(self, model: Any, X: np.ndarray) -> np.ndarray:
        """Fallback SHAP approximation via permutation importance.

        Args:
            model: Trained model.
            X: Feature array.

        Returns:
            Approximate importance values.
        """
        baseline = float(model.predict(X)[0])
        importances = np.zeros(X.shape[1])

        for j in range(X.shape[1]):
            X_permuted = X.copy()
            X_permuted[0, j] = np.random.permutation([X_permuted[0, j]])[0]
            permuted_pred = float(model.predict(X_permuted)[0])
            importances[j] = abs(baseline - permuted_pred)

        total = importances.sum() or 1.0
        return importances / total

    def _rank_features(
        self,
        shap_values: np.ndarray,
        top_k: int,
    ) -> list[dict[str, Any]]:
        """Rank features by absolute SHAP value.

        Args:
            shap_values: SHAP values array.
            top_k: Number of top features to return.

        Returns:
            Ranked list of feature dicts.
        """
        values = shap_values.flatten()
        indices = np.argsort(np.abs(values))[::-1][:top_k]

        ranked: list[dict[str, Any]] = []
        for idx in indices:
            name = self.feature_names[idx] if idx < len(self.feature_names) else f"feature_{idx}"
            ranked.append({
                "feature": name,
                "shap_value": round(float(values[idx]), 4),
                "direction": "increases" if values[idx] > 0 else "decreases",
            })
        return ranked

    def _generate_text_explanation(self, top_features: list[dict[str, Any]]) -> str:
        """Generate a natural language explanation from top features.

        Args:
            top_features: Ranked feature list.

        Returns:
            Human-readable explanation string.
        """
        if not top_features:
            return "Insufficient data to generate explanation."

        parts: list[str] = []
        for feat in top_features[:3]:
            name = feat["feature"]
            direction = feat["direction"]
            parts.append(f"{name} {direction} the prediction")

        return "Key factors: " + "; ".join(parts) + "."
