from fastapi import APIRouter, Query

from app.schemas.enforcement import EnforcementPriority

router = APIRouter()


@router.get("/enforcement/priorities", response_model=list[EnforcementPriority])
async def get_enforcement_priorities(
    limit: int = Query(10, ge=1, le=50),
    severity: str = Query("high", regex="^(low|medium|high|critical)$"),
):
    """Get prioritized list of enforcement hotspots."""
    return []
