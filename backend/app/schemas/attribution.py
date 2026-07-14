from typing import Optional
from pydantic import BaseModel


class SourceContribution(BaseModel):
    source_type: str
    contribution_pct: float
    description: str


class AttributionResponse(BaseModel):
    ward_id: int
    sources: list[SourceContribution]
    top_contributor: Optional[str] = None
