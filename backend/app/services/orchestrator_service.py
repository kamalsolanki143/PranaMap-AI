"""PranaMap AI - Multi-Agent Orchestration Layer.

Orchestrates the 6-agent decision loop:
1. Data Ingestion Agent
2. Forecast Agent
3. Attribution Agent
4. Intervention Agent
5. Advisory Agent
6. Impact Simulation Agent

Passes shared structured environmental state across agents and returns a consolidated
situation briefing for city environmental authorities.
"""

from datetime import datetime
import logging
from typing import Dict, Any, List
from pydantic import BaseModel

from app.services.data_ingestion_service import data_ingestion_service
from app.services.forecast_service import forecast_service
from app.services.attribution_service import attribution_service
from app.services.enforcement_service import intervention_service
from app.services.advisory_service import advisory_service
from app.services.simulation_service import simulation_service, SimulationRequest

logger = logging.getLogger(__name__)


class AgentState(BaseModel):
    city_id: str
    ward_id: str
    timestamp: str
    air_quality: Dict[str, Any] = {}
    forecast: Dict[str, Any] = {}
    attribution: Dict[str, Any] = {}
    interventions: List[Dict[str, Any]] = []
    advisory: Dict[str, Any] = {}
    simulation: Dict[str, Any] = {}
    pipeline_status: str = "COMPLETED"


class AgentOrchestrator:
    def __init__(self):
        self.ingestion_agent = data_ingestion_service
        self.forecast_agent = forecast_service
        self.attribution_agent = attribution_service
        self.intervention_agent = intervention_service
        self.advisory_agent = advisory_service
        self.simulation_agent = simulation_service

    async def execute_decision_cycle(self, city_id: str = "delhi-ncr", ward_id: str = "anand-vihar") -> Dict[str, Any]:
        """Execute the full 6-agent pipeline sequentially with shared structured state."""
        now_str = datetime.now().isoformat()
        logger.info(f"Starting Multi-Agent Decision Cycle for {city_id} ({ward_id})")

        # Step 1: Data Ingestion Agent
        air_quality = await self.ingestion_agent.ingest_city_air_quality(city_id)

        # Step 2: Forecast Agent
        forecast = self.forecast_agent.get_forecast(city_id, ward_id)

        # Step 3: Attribution Agent
        attribution = self.attribution_agent.get_attribution(city_id, ward_id)

        # Step 4: Intervention Agent
        interventions = self.intervention_agent.get_interventions(city_id)

        # Step 5: Advisory Agent
        advisory = await self.advisory_agent.generate_advisory({
            "city_id": city_id,
            "ward": ward_id.replace("-", " ").title(),
            "aqi": air_quality.get("aqi", 184),
            "audience": "General Public",
            "drivers": [s["source"] for s in attribution.get("sources", [])[:2]],
        })

        # Step 6: Impact Simulation Agent
        active_interventions = [
            "traffic_diversion",
            "construction_control",
            "dust_suppression",
        ]
        simulation = self.simulation_agent.simulate(SimulationRequest(
            city_id=city_id,
            ward_id=ward_id,
            current_aqi=air_quality.get("aqi", 184),
            selected_interventions=active_interventions,
        ))

        state = AgentState(
            city_id=city_id,
            ward_id=ward_id,
            timestamp=now_str,
            air_quality=air_quality,
            forecast=forecast,
            attribution=attribution,
            interventions=interventions,
            advisory=advisory,
            simulation=simulation,
            pipeline_status="SUCCESS",
        )

        return state.model_dump()


orchestrator = AgentOrchestrator()
