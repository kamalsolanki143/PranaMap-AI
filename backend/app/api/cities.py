"""PranaMap AI - Indian Cities Network Endpoints.

Provides registry of supported municipal jurisdictions across India.
"""

from fastapi import APIRouter
from app.services.firestore_service import firestore_service

router = APIRouter()


@router.get("/cities")
async def get_supported_cities():
    """Retrieve all supported Indian cities in the PranaMap network."""
    cities = firestore_service.list_documents("cities")
    return {
        "count": len(cities),
        "cities": cities,
    }
