from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DashboardSummary(BaseModel):
    city_aqi: float
    total_wards: int
    hazardous_wards: int
    active_enforcements: int
    latest_updated: Optional[datetime] = None
