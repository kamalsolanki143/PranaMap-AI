from sqlalchemy.orm import Session

from app.database.models import Advisory


class AdvisoryService:
    def __init__(self, db: Session):
        self.db = db

    def get_advisory(self, ward_id: int) -> dict:
        """Get latest advisory for a ward."""
        return {"ward_id": ward_id, "message": "", "severity": "low", "recommendations": []}

    def generate_advisory(self, ward_id: int, include_health_tips: bool = True) -> dict:
        """Generate a new advisory based on current AQI and forecasts."""
        # TODO: Template-based advisory generation
        return {"ward_id": ward_id, "message": "Air quality is satisfactory.", "severity": "low", "recommendations": []}
