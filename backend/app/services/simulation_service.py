"""PranaMap AI - Policy Scenario Impact Simulator.

Simulates the projected environmental effect of targeted municipal interventions
(Traffic Diversion, Dust Suppression, Construction Audits, Industrial Throttling, Odd-Even)
using an empirical box dispersion model with documented physical assumptions.
"""

from datetime import datetime
import logging
from typing import Dict, Any, List
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# Documented intervention attenuation coefficients (percentage reduction on targeted source)
INTERVENTION_METRICS = {
    "traffic_diversion": {
        "label": "Arterial Traffic Diversion",
        "target_source": "Traffic",
        "attenuation_pct": 28,  # Reduces localized traffic emissions by ~28%
        "lag_hours": 1,
        "assumption": "Assumes 35% heavy vehicle diversion to peripheral bypass roads and signal synchronization.",
    },
    "construction_control": {
        "label": "Construction Dust Suppression & Audits",
        "target_source": "Construction",
        "attenuation_pct": 42,  # Reduces fugitive dust by ~42%
        "lag_hours": 3,
        "assumption": "Mandatory water misting cannons, wind-breaking barriers, and temporary excavation stoppage.",
    },
    "dust_suppression": {
        "label": "Mechanical Road Sweeping & Anti-Smog Guns",
        "target_source": "Construction",
        "attenuation_pct": 22,
        "lag_hours": 2,
        "assumption": "Continuous deployment along 45 km arterial road network at 15-minute sweep cycles.",
    },
    "industrial_throttling": {
        "label": "Industrial Point-Source Throttling",
        "target_source": "Industrial",
        "attenuation_pct": 35,
        "lag_hours": 4,
        "assumption": "Mandatory switch of non-essential industrial boilers to PNG/electricity or 50% capacity curtailment.",
    },
    "biomass_patrol": {
        "label": "Rapid Biomass & Waste Burning Patrol",
        "target_source": "Biomass",
        "attenuation_pct": 50,
        "lag_hours": 1,
        "assumption": "Active drone surveillance and quick-response extinguishing teams deployed in peripheral dump perimeters.",
    },
}


class SimulationRequest(BaseModel):
    city_id: str = "delhi-ncr"
    ward_id: str = "anand-vihar"
    current_aqi: int = 186
    selected_interventions: List[str] = Field(default_factory=list)


class SimulationService:
    def simulate(self, request: SimulationRequest) -> Dict[str, Any]:
        current_aqi = max(20, request.current_aqi)
        interventions = request.selected_interventions

        # Default source distribution for the baseline
        source_weights = {
            "Traffic": 0.40,
            "Construction": 0.25,
            "Biomass": 0.18,
            "Industrial": 0.17,
        }

        total_reduction = 0.0
        breakdown = []
        assumptions = []

        for key in interventions:
            metric = INTERVENTION_METRICS.get(key)
            if not metric:
                continue

            target = metric["target_source"]
            weight = source_weights.get(target, 0.25)
            # Estimated AQI reduction = current_aqi * source_weight * attenuation_pct
            reduction = current_aqi * weight * (metric["attenuation_pct"] / 100.0)
            reduction_int = max(1, int(round(reduction)))
            total_reduction += reduction_int

            breakdown.append({
                "intervention_id": key,
                "label": metric["label"],
                "target_source": target,
                "estimated_aqi_reduction": reduction_int,
                "lag_hours": metric["lag_hours"],
            })
            assumptions.append(f"{metric['label']}: {metric['assumption']}")

        # Diminishing returns ceiling: cumulative interventions rarely exceed 45% total localized AQI reduction due to regional background
        max_possible_reduction = int(current_aqi * 0.45)
        applied_reduction = min(int(round(total_reduction)), max_possible_reduction)
        projected_aqi = max(25, current_aqi - applied_reduction)

        return {
            "simulation_id": f"sim_{int(datetime.now().timestamp())}",
            "city_id": request.city_id,
            "ward_id": request.ward_id,
            "current_aqi": current_aqi,
            "projected_aqi": projected_aqi,
            "delta_aqi": -applied_reduction,
            "delta_pct": round((-applied_reduction / current_aqi) * 100, 1),
            "label": "Estimated scenario impact",
            "methodology": "Linear source-weighted attenuation box model with cross-boundary background ceiling.",
            "breakdown": breakdown,
            "assumptions": assumptions if assumptions else ["No active interventions selected."],
            "limitations": [
                "Assumes calm meteorological conditions (wind speed < 10 km/h).",
                "Regional transboundary pollution from external states is treated as invariant baseline.",
            ],
            "simulated_at": datetime.now().isoformat(),
        }


simulation_service = SimulationService()
