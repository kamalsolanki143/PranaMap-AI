"""Recommend specific enforcement interventions."""

from __future__ import annotations

import logging
from typing import Any, Literal

logger = logging.getLogger(__name__)

INTERVENTION_TEMPLATES: dict[str, list[dict[str, Any]]] = {
    "vehicular": [
        {
            "type": "traffic_restrictions",
            "description": "Implement odd-even vehicle rationing in affected zones",
            "resource_requirement": "high",
            "expected_impact_pct": 15,
        },
        {
            "type": "public_transit_boost",
            "description": "Increase bus/metro frequency by 30% in high-AQI corridors",
            "resource_requirement": "medium",
            "expected_impact_pct": 10,
        },
    ],
    "industrial": [
        {
            "type": "emission_controls",
            "description": "Mandate temporary production curtailment for non-compliant units",
            "resource_requirement": "high",
            "expected_impact_pct": 25,
        },
        {
            "type": "stack_monitoring",
            "description": "Deploy continuous emission monitoring systems (CEMS) at top-5 sources",
            "resource_requirement": "medium",
            "expected_impact_pct": 12,
        },
    ],
    "biomass_burning": [
        {
            "type": "fire_suppression",
            "description": "Deploy fire response teams to active hotspots",
            "resource_requirement": "high",
            "expected_impact_pct": 30,
        },
        {
            "type": "crop_residue_awareness",
            "description": "Distribute crop residue management advisories to local farmers",
            "resource_requirement": "low",
            "expected_impact_pct": 8,
        },
    ],
    "construction": [
        {
            "type": "dust_control",
            "description": "Enforce mandatory dust screens and water sprinklers at construction sites",
            "resource_requirement": "low",
            "expected_impact_pct": 10,
        },
    ],
    "natural": [
        {
            "type": "green_barrier",
            "description": "Plant windbreak vegetation along high-pollution corridors",
            "resource_requirement": "medium",
            "expected_impact_pct": 5,
        },
    ],
}


class InterventionRecommender:
    """Recommend enforcement interventions for ranked pollution sources.

    Matches dominant source types to pre-defined intervention templates
    and adjusts impact estimates based on context.

    Attributes:
        templates: Source-to-intervention mapping.
    """

    def __init__(
        self,
        templates: dict[str, list[dict[str, Any]]] | None = None,
    ) -> None:
        self.templates = templates or INTERVENTION_TEMPLATES

    def recommend(self, ranked_attribution: dict[str, Any]) -> dict[str, Any]:
        """Recommend the best intervention for a ranked attribution.

        Args:
            ranked_attribution: Attribution with priority_score and priority_rank.

        Returns:
            Enforcement action dict with intervention details.
        """
        source = ranked_attribution.get("dominant_source", "mixed")
        confidence = ranked_attribution.get("confidence", 0.5)
        priority_rank = ranked_attribution.get("priority_rank", 99)
        priority_score = ranked_attribution.get("priority_score", 0)

        candidates = self.templates.get(source, self.templates.get("natural", []))

        if not candidates:
            best = {
                "type": "monitoring",
                "description": "Enhanced monitoring recommended",
                "resource_requirement": "low",
                "expected_impact_pct": 3,
            }
        else:
            best = candidates[0]

        adjusted_impact = best["expected_impact_pct"] * confidence

        return {
            "priority_rank": priority_rank,
            "location": ranked_attribution.get("station_id", "unknown"),
            "intervention_type": best["type"],
            "intervention_description": best["description"],
            "expected_impact_pct": round(adjusted_impact, 1),
            "resource_requirement": best["resource_requirement"],
            "dominant_source": source,
            "confidence": confidence,
            "priority_score": priority_score,
        }
