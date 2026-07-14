from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import forecast, attribution, enforcement, advisory, dashboard, weather, satellite, health
from app.core.config import settings
from app.middleware.cors import cors_middleware_config

app = FastAPI(
    title="PranaMap AI Backend",
    description="Air quality forecasting, source attribution, and enforcement API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    **cors_middleware_config,
)

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(forecast.router, prefix="/api/v1", tags=["forecast"])
app.include_router(attribution.router, prefix="/api/v1", tags=["attribution"])
app.include_router(enforcement.router, prefix="/api/v1", tags=["enforcement"])
app.include_router(advisory.router, prefix="/api/v1", tags=["advisory"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["dashboard"])
app.include_router(weather.router, prefix="/api/v1", tags=["weather"])
app.include_router(satellite.router, prefix="/api/v1", tags=["satellite"])


@app.get("/")
async def root():
    return {"message": "PranaMap AI API", "version": app.version}
