"""PranaMap AI - Cloud Firestore & Application Data Layer Service.

Manages collections:
- cities
- air_quality
- weather
- hotspots
- forecasts
- attributions
- interventions
- advisories
- simulation_runs
- data_sources
- system_events

Provides modular abstraction with seamless in-memory fallback when Cloud credentials
are not supplied, ensuring the application runs out-of-the-box locally and in CI/CD.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.config import settings

logger = logging.getLogger(__name__)


class FirestoreService:
    def __init__(self):
        self._db = None
        self._is_live_firestore = False
        self._memory_store: Dict[str, Dict[str, Any]] = {
            "cities": {},
            "air_quality": {},
            "weather": {},
            "hotspots": {},
            "forecasts": {},
            "attributions": {},
            "interventions": {},
            "advisories": {},
            "simulation_runs": {},
            "data_sources": {},
            "system_events": {},
        }
        self._init_firebase()
        self._seed_default_collections()

    def _init_firebase(self):
        """Attempt to initialize Firebase Admin SDK and Firestore client."""
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore

            # Check if default app is already initialized
            if not firebase_admin._apps:
                cred_path = settings.FIREBASE_SERVICE_ACCOUNT_JSON
                if cred_path and os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred, {"projectId": settings.FIREBASE_PROJECT_ID})
                    self._db = firestore.client()
                    self._is_live_firestore = True
                    logger.info("Initialized Google Cloud Firestore from service account certificate.")
                elif os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
                    firebase_admin.initialize_app()
                    self._db = firestore.client()
                    self._is_live_firestore = True
                    logger.info("Initialized Google Cloud Firestore from Application Default Credentials.")
                elif settings.FIREBASE_PROJECT_ID:
                    firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})
                    self._db = firestore.client()
                    self._is_live_firestore = True
                    logger.info(f"Initialized Google Cloud Firestore with project {settings.FIREBASE_PROJECT_ID}.")
                else:
                    logger.info("No Firebase credentials provided. Using resilient local memory/document cache.")
            else:
                self._db = firestore.client()
                self._is_live_firestore = True
        except Exception as e:
            logger.warning(f"Could not connect to live Cloud Firestore: {e}. Falling back to memory store.")
            self._db = None
            self._is_live_firestore = False

    def is_live(self) -> bool:
        return self._is_live_firestore

    def get_document(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a document by collection and ID."""
        if self._is_live_firestore and self._db:
            try:
                doc = self._db.collection(collection).document(doc_id).get()
                if doc.exists:
                    return doc.to_dict()
            except Exception as e:
                logger.error(f"Firestore get error on {collection}/{doc_id}: {e}")

        # Fallback to local store
        return self._memory_store.get(collection, {}).get(doc_id)

    def set_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        """Store or update a document in collection."""
        data_copy = {**data, "updated_at": datetime.now(timezone.utc).isoformat()}

        if collection not in self._memory_store:
            self._memory_store[collection] = {}
        self._memory_store[collection][doc_id] = data_copy

        if self._is_live_firestore and self._db:
            try:
                self._db.collection(collection).document(doc_id).set(data_copy, merge=True)
                return True
            except Exception as e:
                logger.error(f"Firestore set error on {collection}/{doc_id}: {e}")

        return True

    def list_collection(self, collection: str, limit: int = 50) -> List[Dict[str, Any]]:
        """List documents from a collection."""
        if self._is_live_firestore and self._db:
            try:
                docs = self._db.collection(collection).limit(limit).stream()
                results = [doc.to_dict() for doc in docs]
                if results:
                    return results
            except Exception as e:
                logger.error(f"Firestore list error on {collection}: {e}")

        # Fallback to local store
        items = list(self._memory_store.get(collection, {}).values())
        return items[:limit]

    # Convenient aliases
    def save_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        return self.set_document(collection, doc_id, data)

    def list_documents(self, collection: str, limit: int = 50) -> List[Dict[str, Any]]:
        return self.list_collection(collection, limit)


    def log_system_event(self, event_type: str, details: Dict[str, Any]):
        """Append to system_events collection."""
        event_id = f"evt_{int(datetime.now(timezone.utc).timestamp())}_{event_type}"
        event_payload = {
            "event_id": event_id,
            "type": event_type,
            "details": details,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self.set_document("system_events", event_id, event_payload)


    def _seed_default_collections(self):
        """Seed foundational dataset for cities, data sources, and baseline scenarios."""
        cities_seed = [
            {"id": "delhi-ncr", "name": "Delhi NCR", "state": "Delhi / NCR", "lat": 28.6139, "lon": 77.2090, "stations": 38, "avg_aqi": 242, "status": "Poor"},
            {"id": "mumbai", "name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777, "stations": 22, "avg_aqi": 156, "status": "Moderate"},
            {"id": "ahmedabad", "name": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lon": 72.5714, "stations": 14, "avg_aqi": 178, "status": "Moderate"},
            {"id": "jaipur", "name": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lon": 75.7873, "stations": 9, "avg_aqi": 188, "status": "Moderate"},
            {"id": "lucknow", "name": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462, "stations": 11, "avg_aqi": 215, "status": "Poor"},
            {"id": "kolkata", "name": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639, "stations": 16, "avg_aqi": 164, "status": "Moderate"},
            {"id": "bengaluru", "name": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946, "stations": 18, "avg_aqi": 92, "status": "Satisfactory"},
            {"id": "hyderabad", "name": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lon": 78.4867, "stations": 15, "avg_aqi": 124, "status": "Moderate"},
            {"id": "chennai", "name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707, "stations": 12, "avg_aqi": 86, "status": "Satisfactory"},
        ]
        for c in cities_seed:
            self._memory_store["cities"][c["id"]] = c

        data_sources_seed = [
            {"id": "cpcb-caaqms", "name": "CPCB CAAQMS Sensors", "provider": "Central Pollution Control Board", "type": "Ground Sensor", "status": "LIVE", "update_frequency": "15 mins"},
            {"id": "open-meteo", "name": "Open-Meteo GFS Atmospheric Model", "provider": "ECMWF / GFS", "type": "Meteorology", "status": "LIVE", "update_frequency": "Hourly"},
            {"id": "sentinel-5p", "name": "Copernicus Sentinel-5P", "provider": "ESA Copernicus", "type": "Satellite", "status": "LIVE", "update_frequency": "Daily"},
            {"id": "nasa-firms", "name": "NASA FIRMS Thermal Anomalies", "provider": "NASA LANCE", "type": "Satellite", "status": "LIVE", "update_frequency": "Sub-daily"},
            {"id": "gemini-ai", "name": "Google Gemini Reasoner", "provider": "Google AI", "type": "AI / GenAI", "status": "LIVE", "update_frequency": "Real-time"},
            {"id": "firestore", "name": "Google Cloud Firestore", "provider": "Google Cloud Platform", "type": "Cloud Database", "status": "LIVE", "update_frequency": "Streaming"},
        ]
        for s in data_sources_seed:
            self._memory_store["data_sources"][s["id"]] = s


firestore_service = FirestoreService()
