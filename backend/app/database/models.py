from datetime import datetime

from sqlalchemy import (
    Column, Integer, Float, String, DateTime, ForeignKey, Text, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

from app.database.session import Base


class Ward(Base):
    __tablename__ = "wards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    population = Column(Integer, default=0)
    area_km2 = Column(Float, default=0.0)
    geom = Column(Geometry("MULTIPOLYGON", srid=4326))

    aqi_readings = relationship("AQIReading", back_populates="ward")
    forecasts = relationship("Forecast", back_populates="ward")
    attributions = relationship("SourceAttribution", back_populates="ward")
    advisories = relationship("Advisory", back_populates="ward")


class AQIReading(Base):
    __tablename__ = "aqi_readings"

    id = Column(Integer, primary_key=True, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False)
    aqi_value = Column(Float, nullable=False)
    pm25 = Column(Float)
    pm10 = Column(Float)
    no2 = Column(Float)
    so2 = Column(Float)
    co = Column(Float)
    o3 = Column(Float)
    category = Column(String(50))
    timestamp = Column(DateTime, default=datetime.utcnow)

    ward = relationship("Ward", back_populates="aqi_readings")


class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False)
    predicted_aqi = Column(Float, nullable=False)
    predicted_category = Column(String(50))
    model_name = Column(String(50))
    confidence = Column(Float)
    forecast_hour = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    ward = relationship("Ward", back_populates="forecasts")


class SourceAttribution(Base):
    __tablename__ = "source_attributions"

    id = Column(Integer, primary_key=True, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False)
    source_type = Column(String(50), nullable=False)
    contribution_pct = Column(Float, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    ward = relationship("Ward", back_populates="attributions")


class EnforcementAction(Base):
    __tablename__ = "enforcement_actions"

    id = Column(Integer, primary_key=True, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False)
    source_type = Column(String(50))
    severity = Column(String(20))
    status = Column(String(20), default="pending")
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)


class Advisory(Base):
    __tablename__ = "advisories"

    id = Column(Integer, primary_key=True, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20))
    recommendations = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    ward = relationship("Ward", back_populates="advisories")
