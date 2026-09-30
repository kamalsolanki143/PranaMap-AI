"""PranaMap AI - Citizen Advisory Endpoints.

Generates structured, natural public health advisories across English, Hindi, and Marathi
using Google Gemini with verified fallback. Simulates municipal broadcast dissemination
to schools, hospitals, elderly networks, and citizens.
"""

from typing import Optional, List
from fastapi import APIRouter, Path, Query
from pydantic import BaseModel, Field
from app.services.advisory_service import advisory_service

router = APIRouter()


class GenerateAdvisoryRequest(BaseModel):
    city_id: str = Field("delhi-ncr", description="City identifier")
    ward: str = Field("Anand Vihar", description="Ward or station name")
    aqi: Optional[int] = Field(None, description="Current AQI (optional; resolved from grounded telemetry if not supplied)")
    audience: str = Field("General Public", description="Target demographic: Schools, Elderly, Hospitals, General Public")
    language: Optional[str] = Field("en", description="Target language code: en, hi, mr")
    drivers: List[str] = Field(default_factory=lambda: ["Traffic congestion", "Low wind velocity"])


class BroadcastSimulationRequest(BaseModel):
    city_id: Optional[str] = "delhi-ncr"
    ward_name: Optional[str] = "Anand Vihar"
    message: Optional[str] = None
    language: Optional[str] = "English"
    channel: Optional[str] = "Web / SMS simulation"
    simulated_recipients: Optional[int] = 1240


@router.get("/advisories/{city_id}")
async def get_city_advisories(
    city_id: str = Path(..., description="City ID"),
    lang: Optional[str] = Query("en", description="Language code: en, hi, mr"),
):
    """Get recent public health advisories for a city."""
    records = advisory_service.get_latest_advisories(city_id)
    if not records:
        # Generate default initial advisory
        default_rec = await advisory_service.generate_advisory({
            "city_id": city_id,
            "ward": city_id,
            "audience": "General Public",
            "language": lang,
        })
        records = [default_rec]
    return {
        "city_id": city_id,
        "count": len(records),
        "advisories": records,
    }


@router.post("/advisories/generate")
async def generate_citizen_advisory(payload: GenerateAdvisoryRequest):
    """Generate verified multilingual citizen advisory via Google Gemini (or deterministic fallback)."""
    return await advisory_service.generate_advisory(payload.model_dump())


# Backward-compatible routes
@router.get("/advisory")
async def get_advisories_legacy(lang: str = Query("ENGLISH")):
    """Legacy advisory endpoint for existing UI components."""
    clean_lang = "hi" if "hi" in lang.lower() else ("mr" if "mr" in lang.lower() else "en")
    data = await advisory_service.generate_advisory({
        "city_id": "delhi-ncr",
        "ward": "Anand Vihar",
        "audience": "General Public",
        "language": clean_lang,
    })
    return {
        "total_sms": "Simulated Broadcast Ready",
        "app_reach": "Multi-Channel Dissemination",
        "delivery_status": "Simulated Delivery Ready (Simulation Mode)",
        "advisory": data,
        "selected_language": lang,
    }



@router.get("/advisory/{ward_id}")
async def get_advisory_by_ward(ward_id: str):
    """Legacy ward-based advisory endpoint."""
    return await advisory_service.generate_advisory({
        "city_id": "delhi-ncr",
        "ward": ward_id,
        "aqi": 342,
    })


@router.post("/advisory/broadcast")
async def broadcast_advisory_legacy(request: BroadcastSimulationRequest):
    """Simulate broadcast dissemination to target audience."""
    return advisory_service.simulate_broadcast(request.model_dump())


@router.post("/advisory/generate")
async def generate_advisory_legacy(request: GenerateAdvisoryRequest):
    """Legacy alias for generate endpoint."""
    return await advisory_service.generate_advisory(request.model_dump())
