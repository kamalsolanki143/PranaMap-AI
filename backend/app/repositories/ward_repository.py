from sqlalchemy.orm import Session

from app.database.models import Ward


class WardRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Ward]:
        return self.db.query(Ward).all()

    def get_by_id(self, ward_id: int) -> Ward | None:
        return self.db.query(Ward).filter(Ward.id == ward_id).first()

    def create(self, name: str, population: int = 0, area_km2: float = 0.0) -> Ward:
        ward = Ward(name=name, population=population, area_km2=area_km2)
        self.db.add(ward)
        self.db.commit()
        self.db.refresh(ward)
        return ward

    def count(self) -> int:
        return self.db.query(Ward).count()
