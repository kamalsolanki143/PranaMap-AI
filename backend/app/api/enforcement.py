from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.api.demo import enforcement_demo

router = APIRouter()


class EnforcementActionRequest(BaseModel):
    target_id: str
    ward: str
    action_label: str
    department: Optional[str] = "Enforcement Wing"


@router.get("/enforcement/priorities")
async def get_enforcement_priorities():
    """Get prioritized list of enforcement hotspots."""
    return await enforcement_demo()


@router.post("/enforcement/action")
async def trigger_enforcement_action(request: EnforcementActionRequest):
    """Deploy enforcement action team or issue stop-work notice."""
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

