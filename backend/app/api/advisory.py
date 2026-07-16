from fastapi import APIRouter

from app.schemas.advisory import AdvisoryResponse, AdvisoryGenerateRequest

router = APIRouter()


@router.get("/advisory/{ward_id}", response_model=AdvisoryResponse)
async def get_advisory(ward_id: int):
    """Get latest health advisory for a ward."""
    return AdvisoryResponse(ward_id=ward_id, message="", severity="low", recommendations=[])


@router.post("/advisory/generate", response_model=AdvisoryResponse)
async def generate_advisory(request: AdvisoryGenerateRequest):
    """Generate a new health advisory based on current conditions."""
    return AdvisoryResponse(
        ward_id=request.ward_id,
        message="No advisories at this time.",
        severity="low",
        recommendations=[],
    )
