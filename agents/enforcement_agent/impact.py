"""Impact assessment scoring for proposed interventions."""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


class ImpactAssessor:
    """Assess expected impact of enforcement interventions.

    Estimates AQI improvement, population health benefit,
    cost-effectiveness, and feasibility.

    Attributes:
        baseline_aqi: Reference AQI for impact calculations.
    """

    def __init__(self, baseline_aqi: float = 150.0) -> None:
        self.baseline_aqi = baseline_aqi

    def assess(self, intervention: dict[str, Any]) -> dict[str, Any]:
        """Compute detailed impact assessment for an intervention.

        Args:
            intervention: Intervention recommendation dict.

        Returns:
            Impact assessment with AQI reduction, health benefit, and cost score.
        """
        impact_pct = intervention.get("expected_impact_pct", 0)
        resource = intervention.get("resource_requirement", "low")

        aqi_reduction = self.baseline_aqi * (impact_pct / 100)
        new_aqi = self.baseline_aqi - aqi_reduction

        health_benefit = self._compute_health_benefit(aqi_reduction)
        cost_score = self._compute_cost_effectiveness(impact_pct, resource)
        feasibility = self._assess_feasibility(resource)

        return {
            "intervention_type": intervention.get("intervention_type", "unknown"),
            "estimated_aqi_reduction": round(aqi_reduction, 1),
            "projected_aqi": round(max(new_aqi, 0), 1),
            "health_benefit_score": round(health_benefit, 3),
            "cost_effectiveness_score": round(cost_score, 3),
            "feasibility": feasibility,
            "overall_impact_score": round(
                (health_benefit * 0.4 + cost_score * 0.3 + feasibility * 0.3), 3
            ),
        }

    def assess_batch(self, interventions: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Assess impact for a batch of interventions.

        Args:
            interventions: List of intervention dicts.

        Returns:
            List of impact assessment dicts.
        """
        return [self.assess(intv) for intv in interventions]

    def _compute_health_benefit(self, aqi_reduction: float) -> float:
        """Estimate health benefit from AQI reduction.

        Uses a simplified dose-response curve.

        Args:
            aqi_reduction: Estimated AQI point reduction.

        Returns:
            Health benefit score in [0, 1].
        """
        if aqi_reduction <= 0:
            return 0.0

        benefit = 1 - 2 ** (-aqi_reduction / 30)
        return min(benefit, 1.0)

    @staticmethod
    def _compute_cost_effectiveness(
        impact_pct: float,
        resource_requirement: str,
    ) -> float:
        """Compute cost-effectiveness ratio.

        Args:
            impact_pct: Expected percentage impact.
            resource_requirement: Resource level (low/medium/high).

        Returns:
            Cost-effectiveness score in [0, 1].
        """
        cost_map = {"low": 1, "medium": 3, "high": 7}
        cost = cost_map.get(resource_requirement, 3)
        return min(impact_pct / (cost * 10), 1.0)

    @staticmethod
    def _assess_feasibility(resource_requirement: str) -> float:
        """Assess implementation feasibility.

        Args:
            resource_requirement: Resource level.

        Returns:
            Feasibility score in [0, 1].
        """
        feasibility_map = {"low": 0.9, "medium": 0.6, "high": 0.3}
        return feasibility_map.get(resource_requirement, 0.5)
