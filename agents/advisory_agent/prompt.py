"""LLM prompt templates for advisory generation."""

from __future__ import annotations

from typing import Any

SYSTEM_PROMPT = (
    "You are PranaMap-AI, an air quality advisory assistant for Indian cities. "
    "Generate clear, actionable health advisories based on AQI data. "
    "Use simple language suitable for general public consumption. "
    "Include specific health recommendations for vulnerable groups."
)

ADVISORY_TEMPLATE = """Generate an air quality advisory for the following conditions:

Region: {region}
Current AQI: {aqi_value} ({severity})
Predicted AQI (next {horizon_hours}h): {predicted_aqi}
Dominant Pollution Source: {dominant_source}
Key Factors: {evidence}

Provide:
1. A health advisory message (2-3 sentences)
2. Specific recommendations for: children, elderly, outdoor workers, asthma patients
3. Overall severity rating: good | moderate | unhealthy | very_unhealthy | hazardous

Respond in JSON format:
{{
    "message": "<advisory text>",
    "target_groups": ["children", "elderly", "outdoor_workers", "asthma_patients"],
    "severity": "<rating>"
}}
"""

SUMMARY_TEMPLATE = """Summarize the following air quality data for {region}:

AQI Summary:
- Average AQI: {avg_aqi}
- Max AQI: {max_aqi}
- Dominant Sources: {dominant_sources}
- Stations Monitored: {station_count}

Generate a brief executive summary (3-4 sentences) suitable for a government dashboard.
"""

EMERGENCY_TEMPLATE = """URGENT: Hazardous air quality detected!

Region: {region}
Current AQI: {aqi_value} (HAZARDOUS)
Active Fires: {fire_count}
Primary Source: {dominant_source}

Generate an emergency advisory with:
1. Immediate health warnings
2. Recommended government actions
3. Public safety measures

Be direct and urgent in tone.
"""


class PromptBuilder:
    """Build structured prompts for LLM advisory generation.

    Attributes:
        system_prompt: System-level instructions for the LLM.
    """

    def __init__(self, system_prompt: str | None = None) -> None:
        self.system_prompt = system_prompt or SYSTEM_PROMPT

    def build_advisory_prompt(
        self,
        region: str,
        aqi_value: float,
        severity: str,
        predicted_aqi: float,
        horizon_hours: int,
        dominant_source: str,
        evidence: list[str],
    ) -> str:
        """Build the advisory generation prompt.

        Args:
            region: Geographic region.
            aqi_value: Current AQI reading.
            severity: Current severity level.
            predicted_aqi: Forecasted AQI.
            horizon_hours: Forecast horizon.
            dominant_source: Primary pollution source.
            evidence: Supporting evidence strings.

        Returns:
            Formatted prompt string.
        """
        return ADVISORY_TEMPLATE.format(
            region=region,
            aqi_value=aqi_value,
            severity=severity,
            predicted_aqi=predicted_aqi,
            horizon_hours=horizon_hours,
            dominant_source=dominant_source,
            evidence="; ".join(evidence) if evidence else "No specific evidence",
        )

    def build_summary_prompt(
        self,
        region: str,
        avg_aqi: float,
        max_aqi: float,
        dominant_sources: list[str],
        station_count: int,
    ) -> str:
        """Build executive summary prompt.

        Args:
            region: Region name.
            avg_aqi: Average AQI across stations.
            max_aqi: Maximum AQI reading.
            dominant_sources: List of dominant sources.
            station_count: Number of monitored stations.

        Returns:
            Formatted summary prompt.
        """
        return SUMMARY_TEMPLATE.format(
            region=region,
            avg_aqi=avg_aqi,
            max_aqi=max_aqi,
            dominant_sources=", ".join(dominant_sources),
            station_count=station_count,
        )

    def build_emergency_prompt(
        self,
        region: str,
        aqi_value: float,
        fire_count: int,
        dominant_source: str,
    ) -> str:
        """Build emergency advisory prompt.

        Args:
            region: Region name.
            aqi_value: Current AQI.
            fire_count: Number of active fires.
            dominant_source: Primary pollution source.

        Returns:
            Formatted emergency prompt.
        """
        return EMERGENCY_TEMPLATE.format(
            region=region,
            aqi_value=aqi_value,
            fire_count=fire_count,
            dominant_source=dominant_source,
        )
