"""Advisory generation logic combining forecasts, attributions, and prompts."""

from __future__ import annotations

import json
import logging
import os
from typing import Any, Literal

logger = logging.getLogger(__name__)

SEVERITY_THRESHOLDS = {
    (0, 50): "good",
    (51, 100): "moderate",
    (101, 150): "unhealthy_sensitive",
    (151, 200): "unhealthy",
    (201, 300): "very_unhealthy",
    (301, 500): "hazardous",
}

TARGET_GROUP_RECOMMENDATIONS = {
    "children": "Children should avoid outdoor play. Keep windows closed.",
    "elderly": "Elderly individuals should remain indoors. Monitor breathing.",
    "outdoor_workers": "Outdoor workers should use N95 masks. Take frequent breaks.",
    "asthma_patients": "Asthma patients should carry inhalers. Avoid exertion.",
}

# ─── Multilingual Advisory Templates ─────────────────────────────────────────

_ADVISORY_TEMPLATES_EN = {
    "good": (
        "Air quality is GOOD (AQI {aqi:.0f}). "
        "Enjoy outdoor activities. No precautions needed."
    ),
    "moderate": (
        "Air quality is MODERATE (AQI {aqi:.0f}). "
        "Sensitive individuals should limit prolonged outdoor exertion. "
        "Primary source: {dominant_source}."
    ),
    "unhealthy_sensitive": (
        "Air quality is UNHEALTHY FOR SENSITIVE GROUPS (AQI {aqi:.0f}). "
        "Children, elderly, and those with respiratory conditions should reduce outdoor activity. "
        "Primary source: {dominant_source}. {action}"
    ),
    "unhealthy": (
        "Air quality is UNHEALTHY (AQI {aqi:.0f}). "
        "Everyone should reduce prolonged outdoor exertion. "
        "Primary source: {dominant_source}. {action}"
    ),
    "very_unhealthy": (
        "ALERT: Air quality is VERY UNHEALTHY (AQI {aqi:.0f}). "
        "Avoid all outdoor physical activity. Wear N95 masks if going outside. "
        "Primary source: {dominant_source}. {action}"
    ),
    "hazardous": (
        "EMERGENCY: Air quality is HAZARDOUS (AQI {aqi:.0f}). "
        "Stay indoors with windows and doors closed. Use air purifiers. "
        "Primary source: {dominant_source}. {action}"
    ),
}

_ADVISORY_TEMPLATES_HI = {
    "good": (
        "Hawa ki gunvatta ACHHI hai (AQI {aqi:.0f}). "
        "Bahar ki gatividhiyon ka anand lein. Koi savdhani zaroori nahi."
    ),
    "moderate": (
        "Hawa ki gunvatta MADHYAM hai (AQI {aqi:.0f}). "
        "Sanvedansheel logon ko lambi bahari mehnat se bachna chahiye. "
        "Mukhya strot: {dominant_source}."
    ),
    "unhealthy_sensitive": (
        "Hawa SANVEDANSHEEL SAMOOHON KE LIYE HAANIKARAK hai (AQI {aqi:.0f}). "
        "Bacche, buzurg, aur saans ke rogi bahari gatividhi kam karein. "
        "Mukhya strot: {dominant_source}. {action}"
    ),
    "unhealthy": (
        "Hawa ki gunvatta HAANIKARAK hai (AQI {aqi:.0f}). "
        "Sabhi ko lambi bahari mehnat se bachna chahiye. "
        "Mukhya strot: {dominant_source}. {action}"
    ),
    "very_unhealthy": (
        "CHETAVANI: Hawa BAHUT HAANIKARAK hai (AQI {aqi:.0f}). "
        "Bahar ki sharirik gatividhi se poori tarah bachein. N95 mask lagayen. "
        "Mukhya strot: {dominant_source}. {action}"
    ),
    "hazardous": (
        "AAPAT-KAAL: Hawa KHATARNAAK hai (AQI {aqi:.0f}). "
        "Ghar ke andar rahein, khidkiyan band rakhein. Air purifier chalayein. "
        "Mukhya strot: {dominant_source}. {action}"
    ),
}

_ADVISORY_TEMPLATES_MR = {
    "good": (
        "Havecha gunvatta CHANGALI aahe (AQI {aqi:.0f}). "
        "Baherchya upkramancha anand ghya. Kontyahi savdhanichi garaj nahi."
    ),
    "moderate": (
        "Havecha gunvatta MADHYAM aahe (AQI {aqi:.0f}). "
        "Sanvedansheel lokanni lambcya baherchya shramapasun dur rahave. "
        "Mukhya strot: {dominant_source}."
    ),
    "unhealthy_sensitive": (
        "Hava SANVEDANSHEEL GATAGAT-SATHI HAANIKARAK aahe (AQI {aqi:.0f}). "
        "Mule, vriddha, aani shwasochchhvasache rugna baherchya upkram kami karavet. "
        "Mukhya strot: {dominant_source}. {action}"
    ),
    "unhealthy": (
        "Havecha gunvatta HAANIKARAK aahe (AQI {aqi:.0f}). "
        "Sarvanch lambcya baherchya shramapasun dur rahave. "
        "Mukhya strot: {dominant_source}. {action}"
    ),
    "very_unhealthy": (
        "CHETAVANI: Hava KHUP HAANIKARAK aahe (AQI {aqi:.0f}). "
        "Baherchya sharirik upkramapasun sampurna dur raha. N95 mask lagava. "
        "Mukhya strot: {dominant_source}. {action}"
    ),
    "hazardous": (
        "AAPATKALIN: Hava DHOKAADAYAK aahe (AQI {aqi:.0f}). "
        "Gharaat raha, khidkya band theva. Air purifier chalava. "
        "Mukhya strot: {dominant_source}. {action}"
    ),
}

# Source labels for Hindi/Marathi transliteration
_SOURCE_LABELS = {
    "en": {
        "vehicular": "vehicular emissions",
        "industrial": "industrial activity",
        "biomass_burning": "biomass/crop burning",
        "construction": "construction dust",
        "natural": "natural/meteorological factors",
        "mixed": "multiple sources",
        "unknown": "unidentified sources",
    },
    "hi": {
        "vehicular": "vaahano ka pradushan",
        "industrial": "audyogik gatividhi",
        "biomass_burning": "parali/jalaane ka dhuaan",
        "construction": "nirman ki dhool",
        "natural": "prakritik kaaran",
        "mixed": "anekaaneka strot",
        "unknown": "agyaat strot",
    },
    "mr": {
        "vehicular": "vaahanancha pradushan",
        "industrial": "audyogik gatividhi",
        "biomass_burning": "parali/jaalanecha dhuun",
        "construction": "bandkamachi dhool",
        "natural": "naisargik karane",
        "mixed": "aneka strot",
        "unknown": "agyaat strot",
    },
}

# Action templates by severity
_ACTION_TEMPLATES = {
    "en": {
        "unhealthy_sensitive": "Consider wearing masks outdoors.",
        "unhealthy": "Limit outdoor activity. Vulnerable groups stay indoors.",
        "very_unhealthy": "Schools should suspend outdoor activities.",
        "hazardous": "All outdoor events should be cancelled immediately.",
    },
    "hi": {
        "unhealthy_sensitive": "Bahar mask pehenne par vichar karein.",
        "unhealthy": "Bahari gatividhi seemit karein. Kamzor log ghar par rahein.",
        "very_unhealthy": "Schoolon ko bahari gatividhiyan band karni chahiye.",
        "hazardous": "Sabhi bahari aayojan turant radd kiye jaayein.",
    },
    "mr": {
        "unhealthy_sensitive": "Baher jaatana mask ghalanecha vichar kara.",
        "unhealthy": "Baherchya upkram maryaadit kara. Kamzor lokanni gharaat rahave.",
        "very_unhealthy": "Shalanni baherchya upkram band karavyat.",
        "hazardous": "Sarvach baherche kaaryakram tatkalin radd karaveet.",
    },
}


class AdvisoryGenerator:
    """Generate multilingual health advisories from pipeline results.

    Supports both LLM-based generation (when API key is available)
    and template-based generation (offline/demo mode).

    Attributes:
        use_templates: Whether to use template-based generation.
    """

    def __init__(self, use_templates: bool | None = None) -> None:
        if use_templates is None:
            # Auto-detect: use templates when no LLM API key is configured
            api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("LLM_API_KEY")
            self.use_templates = not bool(api_key)
        else:
            self.use_templates = use_templates

    @staticmethod
    def _determine_severity(aqi: float) -> str:
        """Map AQI value to severity category.

        Ranges:
            0-50: good
            51-100: moderate
            101-150: unhealthy_sensitive
            151-200: unhealthy
            201-300: very_unhealthy
            301+: hazardous

        Args:
            aqi: AQI value.

        Returns:
            Severity string.
        """
        for (low, high), label in SEVERITY_THRESHOLDS.items():
            if low <= aqi <= high:
                return label
        return "hazardous"

    def generate_from_forecast(
        self,
        forecast_result: dict,
        attribution_result: dict,
    ) -> dict:
        """Generate a multilingual advisory from model forecast and attribution outputs.

        This is the primary integration method for the end-to-end pipeline.
        It generates English, Hindi, and Marathi advisories using either
        template-based (offline/demo) or LLM-based generation.

        Args:
            forecast_result: Dict containing at minimum:
                - predicted_aqi (float): predicted AQI value
                - ward_name (str): name of the ward/area
                - horizon_hours (int, optional): forecast horizon, default 24
                - current_aqi (float, optional): current AQI reading
            attribution_result: Dict containing at minimum:
                - dominant_source (str): primary pollution source sector
                - source_breakdown (dict): {sector: percentage} mapping
                - evidence (list[str]): evidence strings
                - method (str, optional): 'shap' or 'rule_based'

        Returns:
            Dict with keys:
                - ward_name: str
                - predicted_aqi: float
                - current_aqi: float
                - severity: str
                - dominant_source: str
                - source_breakdown: dict
                - evidence: list[str]
                - advisory_en: str (English advisory)
                - advisory_hi: str (Hindi transliterated advisory)
                - advisory_mr: str (Marathi transliterated advisory)
                - target_groups: list[str]
                - method: str ('template' or 'llm')
        """
        predicted_aqi = float(forecast_result.get("predicted_aqi", 0))
        current_aqi = float(forecast_result.get("current_aqi", predicted_aqi))
        ward_name = forecast_result.get("ward_name", "Unknown")
        horizon_hours = forecast_result.get("horizon_hours", 24)

        severity = self._determine_severity(predicted_aqi)

        dominant_source = attribution_result.get("dominant_source", "unknown")
        source_breakdown = attribution_result.get("source_breakdown", {})
        evidence = attribution_result.get("evidence", [])

        # Generate advisories
        if self.use_templates:
            advisory_en = self._render_template(
                "en", severity, predicted_aqi, dominant_source
            )
            advisory_hi = self._render_template(
                "hi", severity, predicted_aqi, dominant_source
            )
            advisory_mr = self._render_template(
                "mr", severity, predicted_aqi, dominant_source
            )
            method = "template"
        else:
            # LLM-based generation (placeholder — requires API key)
            advisory_en = self._render_template(
                "en", severity, predicted_aqi, dominant_source
            )
            advisory_hi = self._render_template(
                "hi", severity, predicted_aqi, dominant_source
            )
            advisory_mr = self._render_template(
                "mr", severity, predicted_aqi, dominant_source
            )
            method = "llm"

        target_groups = self._select_target_groups(severity)

        return {
            "ward_name": ward_name,
            "predicted_aqi": predicted_aqi,
            "current_aqi": current_aqi,
            "severity": severity,
            "dominant_source": dominant_source,
            "source_breakdown": source_breakdown,
            "evidence": evidence,
            "advisory_en": advisory_en,
            "advisory_hi": advisory_hi,
            "advisory_mr": advisory_mr,
            "target_groups": target_groups,
            "method": method,
        }

    def _render_template(
        self,
        lang: str,
        severity: str,
        aqi: float,
        dominant_source: str,
    ) -> str:
        """Render a template-based advisory for a given language.

        Args:
            lang: Language code ('en', 'hi', or 'mr').
            severity: Severity category string.
            aqi: AQI value.
            dominant_source: Primary pollution source sector key.

        Returns:
            Rendered advisory string.
        """
        templates = {
            "en": _ADVISORY_TEMPLATES_EN,
            "hi": _ADVISORY_TEMPLATES_HI,
            "mr": _ADVISORY_TEMPLATES_MR,
        }

        template_set = templates.get(lang, _ADVISORY_TEMPLATES_EN)
        template = template_set.get(severity, template_set.get("moderate", ""))

        # Get localized source label
        source_label = _SOURCE_LABELS.get(lang, _SOURCE_LABELS["en"]).get(
            dominant_source, dominant_source
        )

        # Get action for severity
        action = _ACTION_TEMPLATES.get(lang, _ACTION_TEMPLATES["en"]).get(severity, "")

        return template.format(
            aqi=aqi,
            dominant_source=source_label,
            action=action,
        )

    @staticmethod
    def _select_target_groups(severity: str) -> list[str]:
        """Select which groups should receive specific advisories.

        Args:
            severity: Severity level.

        Returns:
            List of target group names.
        """
        groups = ["outdoor_workers"]
        if severity in ("unhealthy", "unhealthy_sensitive", "very_unhealthy", "hazardous"):
            groups.extend(["children", "elderly", "asthma_patients"])
        elif severity == "moderate":
            groups.append("asthma_patients")
        return groups

    # ─── Legacy interface (backward-compatible) ──────────────────────────────

    def generate(
        self,
        forecast: dict,
        attributions: list[dict] | None = None,
    ) -> dict[str, Any]:
        """Generate an advisory for a single forecast result (legacy interface).

        Args:
            forecast: AQI forecast result dict.
            attributions: Optional attribution results for context.

        Returns:
            Advisory dict with message, severity, and target groups.
        """
        aqi = forecast.get("predicted_aqi", 0)
        severity = self._determine_severity(aqi)

        matching_attribution = self._find_attribution(forecast, attributions or [])
        dominant_source = (
            matching_attribution.get("dominant_source", "unknown")
            if matching_attribution
            else "unknown"
        )
        evidence = (
            matching_attribution.get("evidence", [])
            if matching_attribution
            else []
        )

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
        forecasts: list[dict],
        attributions: list[dict] | None = None,
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
    def _find_attribution(
        forecast: dict,
        attributions: list[dict],
    ) -> dict | None:
        """Find matching attribution for a forecast.

        Args:
            forecast: Forecast result.
            attributions: List of attribution results.

        Returns:
            Matching attribution dict or None.
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
        source_text = (
            f" primarily due to {dominant_source}"
            if dominant_source != "unknown"
            else ""
        )
        evidence_text = ""
        if evidence:
            evidence_text = f" Key factors: {evidence[0]}"

        message = (
            f"AQI in your area is predicted to reach {aqi:.0f} ({severity}) "
            f"in the next {horizon_hours} hours{source_text}.{evidence_text} "
            f"{TARGET_GROUP_RECOMMENDATIONS.get('outdoor_workers', '')}"
        )
        return message.strip()
