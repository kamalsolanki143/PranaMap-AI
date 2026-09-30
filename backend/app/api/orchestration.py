"""PranaMap AI - Multi-Agent Decision Cycle Endpoint.

Runs the complete 6-agent environmental intelligence pipeline:
Ingestion -> Forecast -> Attribution -> Intervention -> Advisory -> Simulation.
"""

from fastapi import APIRouter, Path, Query
from app.services.orchestrator_service import orchestrator

router = APIRouter()


@router.get("/orchestrate/{city_id}")
async def orchestrate_city_cycle(
    city_id: str = Path(..., description="City ID"),
    ward_id: str = Query("anand-vihar", description="Ward identifier"),
):
    """Execute full 6-agent decision cycle for a city and return unified state."""
    return await orchestrator.execute_decision_cycle(city_id=city_id, ward_id=ward_id)
