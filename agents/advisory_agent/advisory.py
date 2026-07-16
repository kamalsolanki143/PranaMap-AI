"""Advisory generation logic combining forecasts, attributions, and prompts."""

from __future__ import annotations

import json
import logging
from typing import Any, Literal

from agents.langgraph.state import ForecastResult, AttributionResult
from agents.advisory_agent.prompt import PromptBuilder

logger = logging.getLogger(__name__)

SEVERITY_THRESHOLDS = {
    (0, 50): "good",
    (51, 100): "moderate",
    (101, 150): "unhealthy",
    (151, 200): "very_unhealthy",
    (201, 500): "hazardous",
}

TARGET_GROUP_RECOMMENDATIONS = {
    "children": "Children should avoid outdoor play. Keep windows closed.",
    "elderly": "Elderly individuals should remain indoors. Monitor breathing.",
    "outdoor_workers": "Outdoor workers should use N95 masks. Take frequent breaks.",
    "asthma_patients": "Asthma patients should carry inhalers. Avoid exertion.",
}


class AdvisoryGenerator:
    """Generate multilingual health advisories from pipeline results.

    Combines forecast data, attribution evidence, and LLM prompts
    to produce actionable advisories.

    Attributes:
        prompt_builder: Prompt template builder.
    """

    def __init__(self) -> None:
        self.prompt_builder = PromptBuilder()

    def generate(
        self,
        forecast: ForecastResult,
        attributions: list[AttributionResult] | None = None,
    ) -> dict[str, Any]:
        """Generate an advisory for a single forecast result.

        Args:
            forecast: AQI forecast result.
            attributions: Optional attribution results for context.

        Returns:
            Advisory dict with message, severity, and target groups.
        """
        aqi = forecast.get("predicted_aqi", 0)
        severity = self._determine_severity(aqi)

        matching_attribution = self._find_attribution(forecast, attributions or [])
        dominant_source = matching_attribution.get("dominant_source", "unknown") if matching_attribution else "unknown"
        evidence = matching_attribution.get("evidence", []) if matching_attribution else []

        message = self._compose_message(
            aqi=aqi,
            severity=severity,
            dominant_source=dominant_source,
            evidence=evidence,
            horizon_hours=forecast.get("horizon_hours", 24),
        )

        target_groups = self._select_target_groups(severity)

        return {
            "region": forecast.get("station_id", "unknown"),
            "message_en": message,
            "severity": severity,
            "target_groups": target_groups,
            "dominant_source": dominant_source,
        }

    def generate_batch(
        self,
        forecasts: list[ForecastResult],
        attributions: list[AttributionResult] | None = None,
    ) -> list[dict[str, Any]]:
        """Generate advisories for multiple forecasts.

        Args:
            forecasts: List of forecast results.
            attributions: Optional attributions.

        Returns:
            List of advisory dicts.
        """
        return [self.generate(f, attributions) for f in forecasts]

    @staticmethod
    def _determine_severity(aqi: float) -> Literal["good", "moderate", "unhealthy", "very_unhealthy", "hazardous"]:
        """Map AQI value to severity category.

        Args:
            aqi: AQI value.

        Returns:
            Severity string.
        """
        for (low, high), label in SEVERITY_THRESHOLDS.items():
            if low <= aqi <= high:
                return label  # type: ignore[return-value]
        return "hazardous"

    @staticmethod
    def _find_attribution(
        forecast: ForecastResult,
        attributions: list[AttributionResult],
    ) -> AttributionResult | None:
        """Find matching attribution for a forecast.

        Args:
            forecast: Forecast result.
            attributions: List of attribution results.

        Returns:
            Matching AttributionResult or None.
        """
        station = forecast.get("station_id", "")
        for attr in attributions:
            if attr.get("station_id") == station:
                return attr
        return None

    def _compose_message(
        self,
        aqi: float,
        severity: str,
        dominant_source: str,
        evidence: list[str],
        horizon_hours: int,
    ) -> str:
        """Compose a human-readable advisory message.

        Args:
            aqi: Predicted AQI.
            severity: Severity level.
            dominant_source: Primary pollution source.
            evidence: Supporting evidence.
            horizon_hours: Forecast horizon.

        Returns:
            Advisory message string.
        """
        source_text = f" primarily due to {dominant_source}" if dominant_source != "unknown" else ""
        evidence_text = ""
        if evidence:
            evidence_text = f" Key factors: {evidence[0]}"

        message = (
            f"AQI in your area is predicted to reach {aqi:.0f} ({severity}) "
            f"in the next {horizon_hours} hours{source_text}.{evidence_text} "
            f"{TARGET_GROUP_RECOMMENDATIONS.get('outdoor_workers', '')}"
        )
        return message.strip()

    @staticmethod
    def _select_target_groups(severity: str) -> list[str]:
        """Select which groups should receive specific advisories.

        Args:
            severity: Severity level.

        Returns:
            List of target group names.
        """
        groups = ["outdoor_workers"]
        if severity in ("unhealthy", "very_unhealthy", "hazardous"):
            groups.extend(["children", "elderly", "asthma_patients"])
        elif severity == "moderate":
            groups.append("asthma_patients")
        return groups
