from sqlalchemy.orm import Session

from app.database.models import Ward, AQIReading
from app.database.session import SessionLocal


def seed_wards(db: Session) -> None:
    """Seed default ward data."""
    if db.query(Ward).count() > 0:
        return

    wards = [
        Ward(name="Central Ward", population=150000, area_km2=12.5),
        Ward(name="Industrial Zone", population=80000, area_km2=8.2),
        Ward(name="Residential North", population=200000, area_km2=15.0),
    ]
    db.add_all(wards)
    db.commit()


def run_seed() -> None:
    db = SessionLocal()
    try:
        seed_wards(db)
    finally:
        db.close()
