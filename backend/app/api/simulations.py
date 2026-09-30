"""PranaMap AI - Policy Scenario Simulation Endpoints.

Computes estimated environmental impact of municipal interventions with documented assumptions.
"""

from fastapi import APIRouter
from app.services.simulation_service import simulation_service, SimulationRequest

router = APIRouter()


@router.post("/simulations")
async def run_scenario_simulation(payload: SimulationRequest):
    """Run an empirical policy intervention simulation."""
    return simulation_service.simulate(payload)
