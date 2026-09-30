"""PranaMap AI - Transparent Environmental Data Sources Endpoints.

Provides full transparency into ingested telemetry providers, update cadences,
and verification documentation without concealing data lineage.
"""

from fastapi import APIRouter
from app.services.firestore_service import firestore_service

router = APIRouter()


@router.get("/data-sources")
async def get_data_sources():
    """Retrieve all integrated environmental telemetry sources and providers."""
    sources = firestore_service.list_documents("data_sources")
    return {
        "count": len(sources),
        "data_sources": sources,
    }
