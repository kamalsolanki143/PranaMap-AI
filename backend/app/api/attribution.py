from fastapi import APIRouter

from app.schemas.attribution import AttributionResponse

router = APIRouter()


@router.get("/attribution/{ward_id}", response_model=AttributionResponse)
async def get_attribution(ward_id: int):
    """Get source attribution breakdown for a specific ward."""
    return AttributionResponse(ward_id=ward_id, sources=[], top_contributor=None)
