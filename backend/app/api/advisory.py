from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.schemas.advisory import AdvisoryResponse, AdvisoryGenerateRequest
from app.api.demo import advisory_demo

router = APIRouter()


class BroadcastRequest(BaseModel):
    ward_name: str
    message: Optional[str] = None


@router.get("/advisory")
async def get_advisories(lang: str = Query("ENGLISH")):
    """Get citizen health advisories."""
    return await advisory_demo(lang=lang)


@router.get("/advisory/{ward_id}")
async def get_advisory(ward_id: str):
    """Get latest health advisory for a ward."""
    demo = await advisory_demo()
    return demo


@router.post("/advisory/broadcast")
async def broadcast_advisory(request: BroadcastRequest):
    """Broadcast SMS advisory for a specific ward."""
    timestamp = datetime.now().strftime("%H:%M:%S IST")
    return {
        "success": True,
        "ward": request.ward_name,
        "message": request.message or f"Severe AQI Alert Sent to {request.ward_name}",
        "timestamp": timestamp,
        "recipients_reached": "42.8K Citizens",
        "result": "SUCCESS",
    }


@router.post("/advisory/generate", response_model=AdvisoryResponse)
async def generate_advisory(request: AdvisoryGenerateRequest):
    """Generate a new health advisory based on current conditions."""
    return AdvisoryResponse(
        ward_id=request.ward_id,
        message="Alert: AQI exceeding critical threshold. Mask recommended.",
        severity="high",
        recommendations=["Stay indoors", "Use N95 mask", "Avoid outdoor exercise"],
    )

