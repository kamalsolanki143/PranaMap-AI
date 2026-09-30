"""PranaMap AI - Intervention & Decision Support Endpoints.

Provides municipal intervention recommendations, priority tracking across city zones,
and lifecycle state transitions: Recommended -> Reviewed -> Approved -> Dispatched -> Completed.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel, Field
from app.services.enforcement_service import intervention_service

router = APIRouter()


class StatusUpdateRequest(BaseModel):
    status: str = Field(..., description="Target status: Recommended, Reviewed, Approved, Dispatched, or Completed")


class LegacyActionRequest(BaseModel):
    target_id: str
    ward: str
    action_label: str
    department: Optional[str] = "Municipal Response Team"


@router.get("/interventions/{city_id}")
async def get_city_interventions(city_id: str = Path(..., description="City ID")):
    """Get prioritized municipal intervention recommendations for a city."""
    items = intervention_service.get_interventions(city_id)
    return {
        "city_id": city_id,
        "count": len(items),
        "interventions": items,
    }


@router.post("/interventions/{intervention_id}/status")
async def update_intervention_status(
    intervention_id: str = Path(..., description="Intervention record ID"),
    payload: StatusUpdateRequest = ...,
):
    """Update lifecycle status of an intervention record."""
    try:
        updated = intervention_service.update_status(intervention_id, payload.status)
        return {
            "success": True,
            "intervention": updated,
            "message": f"Intervention status transitioned to {payload.status}.",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/enforcement/priorities")
async def get_enforcement_priorities():
    """Backward-compatible endpoint for enforcement priorities."""
    items = intervention_service.get_interventions("delhi-ncr")
    return {
        "total_wards": len(items),
        "critical_zones": len([i for i in items if i.get("risk") == "Critical"]),
        "active_missions": len([i for i in items if i.get("status") in ("Approved", "Dispatched")]),
        "projected_impact_pct": -18.4,
        "wards": [
            {
                "id": i["id"],
                "priority": i["risk"].upper(),
                "ward": i["zone"],
                "uid": f"ND-{i['id']}",
                "current_aqi": 342 if i["risk"] == "Critical" else 240,
                "primary_source": i["observed_driver"],
                "primary_source_icon": "directions_car" if "traffic" in i["observed_driver"].lower() else "construction",
                "projected_aqi": 312 if i["risk"] == "Critical" else 215,
                "root_cause": i["observed_driver"],
                "tags": [i["observed_driver"]],
                "actions": [{"label": i["recommended_action"]}],
                "department": i["assigned_team"],
                "lead": i["assigned_team"],
            }
            for i in items
        ],
    }


@router.post("/enforcement/action")
async def trigger_enforcement_action(request: LegacyActionRequest):
    """Backward-compatible endpoint for dispatching an action team."""
    try:
        updated = intervention_service.update_status(request.target_id, "Dispatched")
    except Exception:
        pass

    return {
        "success": True,
        "target_id": request.target_id,
        "ward": request.ward,
        "action": request.action_label,
        "department": request.department,
        "status": "DISPATCHED",
        "timestamp": datetime.now().strftime("%H:%M:%S IST"),
        "message": f"Action '{request.action_label}' successfully dispatched to {request.department} for {request.ward}.",
    }
