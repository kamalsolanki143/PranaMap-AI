"""Rank enforcement priorities based on attribution and impact."""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


class PriorityRanker:
    """Rank pollution sources by enforcement priority.

    Considers attribution confidence, population exposure,
    source severity, and regulatory compliance status.

    Attributes:
        weights: Feature weights for priority scoring.
    """

    DEFAULT_WEIGHTS = {
        "confidence": 0.25,
        "population_exposure": 0.30,
        "source_severity": 0.25,
        "recurrence": 0.20,
    }

    def __init__(self, weights: dict[str, float] | None = None) -> None:
        self.weights = weights or self.DEFAULT_WEIGHTS

    def rank(self, attributions: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Rank attributions by enforcement priority.

        Args:
            attributions: List of attribution results.

        Returns:
            Attributions sorted by priority score (highest first).
        """
        if not attributions:
            return []

        scored: list[dict[str, Any]] = []
        for attr in attributions:
            priority_score = self._compute_priority_score(attr)
            scored.append({**attr, "priority_score": priority_score})

        scored.sort(key=lambda x: x["priority_score"], reverse=True)

        for i, item in enumerate(scored):
            item["priority_rank"] = i + 1

        return scored

    def _compute_priority_score(self, attribution: dict[str, Any]) -> float:
        """Compute composite priority score for a single attribution.

        Args:
            attribution: Attribution result dict.

        Returns:
            Priority score in [0, 1].
        """
        confidence = attribution.get("confidence", 0)
        breakdown = attribution.get("source_breakdown", {})
        dominant = attribution.get("dominant_source", "unknown")

        severity = self._assess_source_severity(dominant, breakdown)
        exposure = self._estimate_population_exposure(attribution)
        recurrence = self._estimate_recurrence(attribution)

        score = (
            self.weights["confidence"] * confidence
            + self.weights["population_exposure"] * exposure
            + self.weights["source_severity"] * severity
            + self.weights["recurrence"] * recurrence
        )
        return round(score, 4)

    @staticmethod
    def _assess_source_severity(
        source: str,
        breakdown: dict[str, float],
    ) -> float:
        """Assess severity of a pollution source.

        Args:
            source: Dominant source name.
            breakdown: Source probability breakdown.

        Returns:
            Severity score in [0, 1].
        """
        severity_map = {
            "biomass_burning": 0.9,
            "industrial": 0.8,
            "vehicular": 0.7,
            "construction": 0.5,
            "natural": 0.2,
            "mixed": 0.5,
            "unknown": 0.3,
        }
        base = severity_map.get(source, 0.3)
        dominant_pct = breakdown.get(source, 0)
        return base * (0.7 + 0.3 * dominant_pct)

    @staticmethod
    def _estimate_population_exposure(attribution: dict[str, Any]) -> float:
        """Estimate population exposure level.

        Args:
            attribution: Attribution result dict.

        Returns:
            Exposure score in [0, 1].
        """
        evidence = attribution.get("evidence", [])
        high_population_keywords = ["high", "dense", "urban", "residential"]
        for stmt in evidence:
            if any(kw in stmt.lower() for kw in high_population_keywords):
                return 0.8
        return 0.5

    @staticmethod
    def _estimate_recurrence(attribution: dict[str, Any]) -> float:
        """Estimate likelihood of recurring violations.

        Args:
            attribution: Attribution result dict.

        Returns:
            Recurrence score in [0, 1].
        """
        source = attribution.get("dominant_source", "unknown")
        if source in ("industrial", "vehicular"):
            return 0.7
        if source == "biomass_burning":
            return 0.4
        return 0.3
