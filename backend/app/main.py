from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    health,
    dashboard,
    forecast,
    attribution,
    enforcement,
    advisory,
    simulations,
    cities,
    data_sources,
    orchestration,
    demo,
    weather,
    satellite,
    geography,
)
from app.core.config import settings

app = FastAPI(
    title="PranaMap AI Backend",
    description="Environmental Intelligence & Decision Support Platform for Indian Cities",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Environmental Intelligence API routes
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["dashboard"])
app.include_router(forecast.router, prefix="/api/v1", tags=["forecast"])
app.include_router(attribution.router, prefix="/api/v1", tags=["attribution"])
app.include_router(enforcement.router, prefix="/api/v1", tags=["interventions"])
app.include_router(advisory.router, prefix="/api/v1", tags=["advisory"])
app.include_router(simulations.router, prefix="/api/v1", tags=["simulations"])
app.include_router(cities.router, prefix="/api/v1", tags=["cities"])
app.include_router(geography.router, prefix="/api/v1", tags=["geography"])
app.include_router(data_sources.router, prefix="/api/v1", tags=["data-sources"])
app.include_router(orchestration.router, prefix="/api/v1", tags=["orchestration"])

# Backward-compatibility routes
app.include_router(demo.router, prefix="/api/v1", tags=["demo"])
app.include_router(weather.router, prefix="/api/v1", tags=["weather"])
app.include_router(satellite.router, prefix="/api/v1", tags=["satellite"])


@app.get("/")
async def root():
    return {
        "service": "PranaMap AI",
        "description": "Environmental Intelligence & Decision Support Platform for Indian Cities",
        "version": app.version,
        "docs_url": "/docs",
    }
