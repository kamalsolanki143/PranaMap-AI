"""Confidence scoring for pollution source attributions."""

from __future__ import annotations

import math
import logging
from typing import Any

logger = logging.getLogger(__name__)


class ConfidenceScorer:
    """Compute confidence scores for source classification results.

    Factors in data completeness, source score separation, and
    historical accuracy of the classifier.

    Attributes:
        base_confidence: Baseline confidence when data is complete.
        missing_penalty: Penalty per missing feature.
    """

    def __init__(
        self,
        base_confidence: float = 0.80,
        missing_penalty: float = 0.05,
    ) -> None:
        self.base_confidence = base_confidence
        self.missing_penalty = missing_penalty

    def score(self, classification: dict[str, Any]) -> float:
        """Compute confidence score for a classification result.

        Args:
            classification: Dict with source_breakdown and evidence.

        Returns:
            Confidence score in [0, 1].
        """
        breakdown = classification.get("source_breakdown", {})
        evidence = classification.get("evidence", [])

        if not breakdown:
            return 0.0

        separation = self._score_separation(breakdown)
        evidence_score = self._score_evidence(evidence)
        completeness = self._score_completeness(classification)

        raw = (
            self.base_confidence * separation
            + 0.15 * evidence_score
            + 0.10 * completeness
        )
        return float(min(max(raw, 0.0), 1.0))

    def _score_separation(self, breakdown: dict[str, float]) -> float:
        """Score based on how well-separated source probabilities are.

        Higher separation means more confidence in the dominant source.

        Args:
            breakdown: Source name to probability mapping.

        Returns:
            Separation score in [0, 1].
        """
        if not breakdown:
            return 0.0

        values = sorted(breakdown.values(), reverse=True)
        if len(values) < 2:
            return 1.0

        top = values[0]
        runner_up = values[1]
        gap = top - runner_up

        return float(min(gap * 2 + 0.3, 1.0))

    def _score_evidence(self, evidence: list[str]) -> float:
        """Score based on number and quality of evidence statements.

        Args:
            evidence: List of evidence description strings.

        Returns:
            Evidence score in [0, 1].
        """
        if not evidence:
            return 0.1

        count_score = min(len(evidence) / 4, 1.0)
        quality_bonus = 0.1 if any("quantitative" in e.lower() or any(c.isdigit() for c in e) for e in evidence) else 0.0

        return min(count_score + quality_bonus, 1.0)

    def _score_completeness(self, classification: dict[str, Any]) -> float:
        """Penalize classification when key evidence is missing.

        Args:
            classification: Classification result dict.

        Returns:
            Completeness score in [0, 1].
        """
        required_keys = {"dominant_source", "source_breakdown", "evidence"}
        present = sum(1 for k in required_keys if k in classification and classification[k])
        return present / len(required_keys)
