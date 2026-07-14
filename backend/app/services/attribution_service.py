from sqlalchemy.orm import Session

from app.database.models import SourceAttribution


class AttributionService:
    def __init__(self, db: Session):
        self.db = db

    def get_attribution(self, ward_id: int) -> dict:
        """Get source attribution breakdown for a ward."""
        # TODO: Run SHAP-based attribution model
        return {"ward_id": ward_id, "sources": [], "top_contributor": None}

    def compute_attribution(self, ward_id: int) -> dict:
        """Recompute attribution using latest data."""
        # TODO: Integrate SHAP explainability
        return {"ward_id": ward_id, "sources": []}
