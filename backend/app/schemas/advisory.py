from typing import Optional
from pydantic import BaseModel


class AdvisoryResponse(BaseModel):
    ward_id: int
    message: str
    severity: str
    recommendations: list[str]


class AdvisoryGenerateRequest(BaseModel):
    ward_id: int
    include_health_tips: bool = True
