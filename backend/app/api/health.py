from datetime import datetime
from fastapi import APIRouter
from app.services.gemini_service import gemini_service
from app.services.firestore_service import firestore_service

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "PranaMap AI Backend",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "gemini": "connected" if gemini_service.is_available() else "fallback_mode",
        "firestore": "connected" if firestore_service.is_live() else "memory_cache",
        "database": "operational",
    }
