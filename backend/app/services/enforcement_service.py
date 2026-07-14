from sqlalchemy.orm import Session

from app.database.models import EnforcementAction


class EnforcementService:
    def __init__(self, db: Session):
        self.db = db

    def get_priorities(self, limit: int = 10, severity: str = "high") -> list[dict]:
        """Get prioritized enforcement hotspots."""
        return []

    def create_action(self, ward_id: int, source_type: str, severity: str) -> dict:
        """Create a new enforcement action record."""
        return {"ward_id": ward_id, "source_type": source_type, "severity": severity, "status": "pending"}
