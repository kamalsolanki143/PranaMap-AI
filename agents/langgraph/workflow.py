"""Workflow orchestration: compile, configure, and run the graph."""

from __future__ import annotations

import uuid
import logging
from datetime import datetime, timezone
from typing import Any

from agents.langgraph.graph import build_graph
from agents.langgraph.state import PipelineState
from agents.shared.memory import SharedMemory

logger = logging.getLogger(__name__)


class WorkflowOrchestrator:
    """High-level orchestrator for the PranaMap-AI pipeline.

    Attributes:
        graph: Compiled LangGraph graph.
        memory: Shared memory store for cross-run persistence.
    """

    def __init__(self) -> None:
        self.graph = build_graph().compile()
        self.memory = SharedMemory()

    def run(
        self,
        region: str,
        timestamp: str | None = None,
        config: dict[str, Any] | None = None,
    ) -> PipelineState:
        """Execute the full pipeline for a given region.

        Args:
            region: Geographic region identifier (e.g. city name or bounding box).
            timestamp: ISO-8601 timestamp; defaults to current UTC time.
            config: Optional runtime configuration overrides.

        Returns:
            Final pipeline state with all results populated.
        """
        run_id = str(uuid.uuid4())
        ts = timestamp or datetime.now(timezone.utc).isoformat()

        initial_state: PipelineState = {
            "run_id": run_id,
            "timestamp": ts,
            "region": region,
            "raw_aqi": [],
            "raw_weather": {},
            "raw_satellite": {},
            "raw_fire": {},
            "raw_osm": {},
            "raw_population": {},
            "processed_data": [],
            "forecast_results": [],
            "attribution_results": [],
            "enforcement_actions": [],
            "advisories": [],
            "errors": [],
            "status": "pending",
        }

        logger.info("Starting pipeline run %s for region=%s", run_id, region)

        final_state = self.graph.invoke(initial_state, config=config or {})

        logger.info(
            "Pipeline run %s completed with status=%s, errors=%d",
            run_id,
            final_state.get("status"),
            len(final_state.get("errors", [])),
        )

        self.memory.store(run_id, final_state)
        return final_state

    async def arun(
        self,
        region: str,
        timestamp: str | None = None,
        config: dict[str, Any] | None = None,
    ) -> PipelineState:
        """Async variant of `run`.

        Args:
            region: Geographic region identifier.
            timestamp: ISO-8601 timestamp.
            config: Optional runtime configuration overrides.

        Returns:
            Final pipeline state.
        """
        run_id = str(uuid.uuid4())
        ts = timestamp or datetime.now(timezone.utc).isoformat()

        initial_state: PipelineState = {
            "run_id": run_id,
            "timestamp": ts,
            "region": region,
            "raw_aqi": [],
            "raw_weather": {},
            "raw_satellite": {},
            "raw_fire": {},
            "raw_osm": {},
            "raw_population": {},
            "processed_data": [],
            "forecast_results": [],
            "attribution_results": [],
            "enforcement_actions": [],
            "advisories": [],
            "errors": [],
            "status": "pending",
        }

        final_state = await self.graph.ainvoke(initial_state, config=config or {})
        self.memory.store(run_id, final_state)
        return final_state
