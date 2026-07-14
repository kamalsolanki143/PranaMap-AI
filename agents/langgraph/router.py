"""Conditional routing logic between graph nodes."""

from __future__ import annotations

import logging
from typing import Literal

from agents.langgraph.state import PipelineState

logger = logging.getLogger(__name__)


def route_after_ingestion(
    state: PipelineState,
) -> Literal["forecast", "end"]:
    """Decide whether to proceed to forecasting or abort.

    Routes to 'end' if ingestion produced no usable data.

    Args:
        state: Current pipeline state after ingestion.

    Returns:
        Next node name.
    """
    processed = state.get("processed_data", [])
    errors = state.get("errors", [])

    if not processed:
        logger.warning("No processed data after ingestion; aborting pipeline.")
        return "end"

    critical_errors = [e for e in errors if any(k in e for k in ("aqi_load", "weather_load"))]
    if len(critical_errors) >= 2:
        logger.error("Two or more critical sources failed; aborting pipeline.")
        return "end"

    return "forecast"


def route_after_forecast(
    state: PipelineState,
) -> Literal["attribution", "advisory"]:
    """Decide whether to run attribution or skip to advisory.

    If forecasts are valid, run attribution to identify sources.
    Otherwise, generate advisory directly from raw data.

    Args:
        state: Current pipeline state after forecasting.

    Returns:
        Next node name.
    """
    forecasts = state.get("forecast_results", [])

    if not forecasts:
        logger.info("No forecast results; skipping attribution.")
        return "advisory"

    high_confidence = [f for f in forecasts if f.get("confidence", 0) > 0.6]
    if not high_confidence:
        logger.info("All forecasts below confidence threshold; skipping attribution.")
        return "advisory"

    return "attribution"
