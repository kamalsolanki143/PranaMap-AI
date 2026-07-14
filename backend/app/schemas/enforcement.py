from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class EnforcementPriority(BaseModel):
    ward_id: int
    ward_name: str
    source_type: str
    severity: str
    violation_count: int
    aqi_impact: float
    recommended_action: str
