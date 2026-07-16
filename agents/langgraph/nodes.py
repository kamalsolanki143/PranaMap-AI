"""Node functions for each processing stage in the LangGraph pipeline."""

from __future__ import annotations

import logging
from typing import Any

from agents.langgraph.state import (
    PipelineState,
    ForecastResult,
    AttributionResult,
    EnforcementAction,
    AdvisoryOutput,
)
from agents.ingestion_agent.aqi_loader import AQILoader
from agents.ingestion_agent.weather_loader import WeatherLoader
from agents.ingestion_agent.satellite_loader import SatelliteLoader
from agents.ingestion_agent.fire_loader import FireLoader
from agents.ingestion_agent.osm_loader import OSMLoader
from agents.ingestion_agent.population_loader import PopulationLoader
from agents.forecast_agent.predictor import AQIPredictor
from agents.forecast_agent.preprocessing import DataPreprocessor
from agents.forecast_agent.feature_engineering import FeatureEngineer
from agents.attribution_agent.source_classifier import SourceClassifier
from agents.attribution_agent.confidence import ConfidenceScorer
from agents.enforcement_agent.ranking import PriorityRanker
from agents.enforcement_agent.intervention import InterventionRecommender
from agents.advisory_agent.advisory import AdvisoryGenerator
from agents.advisory_agent.translator import Translator
from agents.shared.memory import SharedMemory

logger = logging.getLogger(__name__)


def ingestion_node(state: PipelineState) -> dict[str, Any]:
    """Load all data sources and merge into a single dataset.

    Args:
        state: Current pipeline state with region and timestamp.

    Returns:
        Partial state update with raw and processed data.
    """
    region = state["region"]
    timestamp = state["timestamp"]
    errors: list[str] = []

    aqi_loader = AQILoader()
    weather_loader = WeatherLoader()
    satellite_loader = SatelliteLoader()
    fire_loader = FireLoader()
    osm_loader = OSMLoader()
    population_loader = PopulationLoader()

    try:
        raw_aqi = aqi_loader.load(region=region, timestamp=timestamp)
    except Exception as exc:
        logger.warning("AQI load failed: %s", exc)
        raw_aqi = []
        errors.append(f"aqi_load: {exc}")

    try:
        raw_weather = weather_loader.load(region=region, timestamp=timestamp)
    except Exception as exc:
        logger.warning("Weather load failed: %s", exc)
        raw_weather = {}
        errors.append(f"weather_load: {exc}")

    try:
        raw_satellite = satellite_loader.load(region=region, timestamp=timestamp)
    except Exception as exc:
        logger.warning("Satellite load failed: %s", exc)
        raw_satellite = {}
        errors.append(f"satellite_load: {exc}")

    try:
        raw_fire = fire_loader.load(region=region, timestamp=timestamp)
    except Exception as exc:
        logger.warning("Fire load failed: %s", exc)
        raw_fire = {}
        errors.append(f"fire_load: {exc}")

    try:
        raw_osm = osm_loader.load(region=region, timestamp=timestamp)
    except Exception as exc:
        logger.warning("OSM load failed: %s", exc)
        raw_osm = {}
        errors.append(f"osm_load: {exc}")

    try:
        raw_population = population_loader.load(region=region, timestamp=timestamp)
    except Exception as exc:
        logger.warning("Population load failed: %s", exc)
        raw_population = {}
        errors.append(f"population_load: {exc}")

    preprocessor = DataPreprocessor()
    processed_data = preprocessor.merge_sources(
        aqi=raw_aqi,
        weather=raw_weather,
        satellite=raw_satellite,
        fire=raw_fire,
        osm=raw_osm,
        population=raw_population,
    )

    return {
        "raw_aqi": raw_aqi,
        "raw_weather": raw_weather,
        "raw_satellite": raw_satellite,
        "raw_fire": raw_fire,
        "raw_osm": raw_osm,
        "raw_population": raw_population,
        "processed_data": processed_data,
        "errors": errors,
        "status": "running",
    }


def forecast_node(state: PipelineState) -> dict[str, Any]:
    """Run AQI prediction models on processed data.

    Args:
        state: Pipeline state with processed_data.

    Returns:
        Partial state update with forecast results.
    """
    errors = list(state.get("errors", []))

    try:
        engineer = FeatureEngineer()
        features_df = engineer.build_features(state["processed_data"])

        predictor = AQIPredictor()
        predictions = predictor.predict(features_df)

        forecast_results: list[ForecastResult] = [
            ForecastResult(
                station_id=pred["station_id"],
                pollutant=pred["pollutant"],
                predicted_aqi=pred["predicted_aqi"],
                confidence=pred["confidence"],
                horizon_hours=pred["horizon_hours"],
            )
            for pred in predictions
        ]
    except Exception as exc:
        logger.error("Forecast failed: %s", exc)
        forecast_results = []
        errors.append(f"forecast: {exc}")

    return {
        "forecast_results": forecast_results,
        "errors": errors,
    }


def attribution_node(state: PipelineState) -> dict[str, Any]:
    """Classify pollution sources and compute attributions.

    Args:
        state: Pipeline state with processed data and forecasts.

    Returns:
        Partial state update with attribution results.
    """
    errors = list(state.get("errors", []))

    try:
        classifier = SourceClassifier()
        scorer = ConfidenceScorer()

        raw_aqi = state.get("raw_aqi", [])
        attribution_results: list[AttributionResult] = []

        for record in raw_aqi:
            classification = classifier.classify(record)
            confidence = scorer.score(classification)

            attribution_results.append(
                AttributionResult(
                    station_id=record["station_id"],
                    dominant_source=classification["dominant_source"],
                    source_breakdown=classification["source_breakdown"],
                    confidence=confidence,
                    evidence=classification.get("evidence", []),
                )
            )
    except Exception as exc:
        logger.error("Attribution failed: %s", exc)
        attribution_results = []
        errors.append(f"attribution: {exc}")

    return {
        "attribution_results": attribution_results,
        "errors": errors,
    }


def enforcement_node(state: PipelineState) -> dict[str, Any]:
    """Rank enforcement priorities and recommend interventions.

    Args:
        state: Pipeline state with attribution results.

    Returns:
        Partial state update with enforcement actions.
    """
    errors = list(state.get("errors", []))

    try:
        ranker = PriorityRanker()
        recommender = InterventionRecommender()

        attributions = state.get("attribution_results", [])
        ranked = ranker.rank(attributions)
        enforcement_actions: list[EnforcementAction] = [
            recommender.recommend(entry) for entry in ranked
        ]
    except Exception as exc:
        logger.error("Enforcement ranking failed: %s", exc)
        enforcement_actions = []
        errors.append(f"enforcement: {exc}")

    return {
        "enforcement_actions": enforcement_actions,
        "errors": errors,
    }


def advisory_node(state: PipelineState) -> dict[str, Any]:
    """Generate multilingual advisories for affected populations.

    Args:
        state: Pipeline state with all upstream results.

    Returns:
        Partial state update with advisory outputs.
    """
    errors = list(state.get("errors", []))

    try:
        generator = AdvisoryGenerator()
        translator = Translator()

        advisories: list[AdvisoryOutput] = []
        forecasts = state.get("forecast_results", [])
        attributions = state.get("attribution_results", [])

        for forecast in forecasts:
            advisory_en = generator.generate(forecast=forecast, attributions=attributions)
            advisory_hi = translator.translate(advisory_en["message_en"], target="hi")
            advisory_mr = translator.translate(advisory_en["message_en"], target="mr")

            advisories.append(
                AdvisoryOutput(
                    region=advisory_en["region"],
                    message_en=advisory_en["message_en"],
                    message_hi=advisory_hi,
                    message_mr=advisory_mr,
                    severity=advisory_en["severity"],
                    target_groups=advisory_en.get("target_groups", []),
                )
            )
    except Exception as exc:
        logger.error("Advisory generation failed: %s", exc)
        advisories = []
        errors.append(f"advisory: {exc}")

    memory = SharedMemory()
    memory.store(state["run_id"], {"advisories": advisories})

    return {
        "advisories": advisories,
        "errors": errors,
        "status": "completed",
    }
