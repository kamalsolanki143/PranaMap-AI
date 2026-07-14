from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.models import AQIReading


class AQIRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_latest_by_ward(self, ward_id: int) -> AQIReading | None:
        return (
            self.db.query(AQIReading)
            .filter(AQIReading.ward_id == ward_id)
            .order_by(desc(AQIReading.timestamp))
            .first()
        )

    def get_history(self, ward_id: int, limit: int = 24) -> list[AQIReading]:
        return (
            self.db.query(AQIReading)
            .filter(AQIReading.ward_id == ward_id)
            .order_by(desc(AQIReading.timestamp))
            .limit(limit)
            .all()
        )

    def create(self, ward_id: int, aqi_value: float, **kwargs) -> AQIReading:
        reading = AQIReading(ward_id=ward_id, aqi_value=aqi_value, **kwargs)
        self.db.add(reading)
        self.db.commit()
        self.db.refresh(reading)
        return reading
