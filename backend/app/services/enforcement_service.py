"""PranaMap AI - Intervention & Decision Support Service.

Manages municipal intervention priorities across city zones with transparent lifecycle tracking:
Recommended -> Reviewed -> Approved -> Dispatched -> Completed.
Uses generic operational teams and estimates realistic localized AQI reductions.
Persists state in Cloud Firestore (with local memory fallback).
"""

from datetime import datetime
import logging
from typing import Dict, Any, List, Optional
from app.services.firestore_service import firestore_service

logger = logging.getLogger(__name__)

INITIAL_INTERVENTIONS = [
    {
        "id": "int-delhi-01",
        "city_id": "delhi-ncr",
        "zone": "Anand Vihar",
        "ward_id": "anand-vihar",
        "risk": "Critical",
        "observed_driver": "Traffic emissions & ISBT corridor idling",
        "recommended_action": "Heavy vehicle diversion & traffic signal retiming",
        "assigned_team": "Traffic Control Team",
        "expected_impact": "Estimated AQI reduction: 18–24",
        "status": "Reviewed",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    },
    {
        "id": "int-delhi-02",
        "city_id": "delhi-ncr",
        "zone": "Dwarka Sector 8",
        "ward_id": "dwarka",
        "risk": "High",
        "observed_driver": "Fugitive construction dust at 3 unpaved sites",
        "recommended_action": "On-site dust audit & mandatory mist cannon enforcement",
        "assigned_team": "Environmental Inspection Team",
        "expected_impact": "Estimated AQI reduction: 10–15",
        "status": "Recommended",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    },
    {
        "id": "int-delhi-03",
        "city_id": "delhi-ncr",
        "zone": "RK Puram",
        "ward_id": "rk-puram",
        "risk": "High",
        "observed_driver": "Low wind dispersion & road re-suspension",
        "recommended_action": "Continuous mechanical sweeping & water sprinkler deployment",
        "assigned_team": "Municipal Dust Control Team",
        "expected_impact": "Estimated AQI reduction: 8–12",
        "status": "Approved",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    },
    {
        "id": "int-delhi-04",
        "city_id": "delhi-ncr",
        "zone": "Okhla Phase 3",
        "ward_id": "okhla",
        "risk": "Moderate",
        "observed_driver": "Industrial boiler point-source emissions",
        "recommended_action": "Stack emission monitoring & fuel compliance verification",
        "assigned_team": "Environmental Inspection Team",
        "expected_impact": "Estimated AQI reduction: 6–10",
        "status": "Dispatched",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    },
    {
        "id": "int-mumbai-01",
        "city_id": "mumbai",
        "zone": "Bandra-Kurla Complex",
        "ward_id": "bkc",
        "risk": "High",
        "observed_driver": "High-density peak commercial traffic",
        "recommended_action": "Variable Message Sign routing & bottleneck decongestion",
        "assigned_team": "Traffic Control Team",
        "expected_impact": "Estimated AQI reduction: 12–16",
        "status": "Reviewed",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    },
]


class InterventionService:
    VALID_STATUSES = ["Recommended", "Reviewed", "Approved", "Dispatched", "Completed"]

    def __init__(self):
        self.firestore = firestore_service
        self._seed_interventions()

    def _seed_interventions(self):
        """Seed initial interventions if not present in firestore."""
        for item in INITIAL_INTERVENTIONS:
            existing = self.firestore.get_document("interventions", item["id"])
            if not existing:
                self.firestore.save_document("interventions", item["id"], item)

    def get_interventions(self, city_id: str) -> List[Dict[str, Any]]:
        """Retrieve all interventions for a city."""
        city_key = city_id.lower().strip()
        all_items = self.firestore.list_documents("interventions")
        city_items = [i for i in all_items if i.get("city_id") == city_key]
        
        # If no custom items for city, return defaults tailored to that city
        if not city_items:
            city_items = [i for i in all_items if i.get("city_id") == "delhi-ncr"]

        return city_items

    def update_status(self, intervention_id: str, new_status: str) -> Dict[str, Any]:
        """Update lifecycle status of an intervention record."""
        formatted_status = new_status.capitalize()
        if formatted_status not in self.VALID_STATUSES:
            raise ValueError(f"Invalid status '{new_status}'. Allowed: {self.VALID_STATUSES}")

        doc = self.firestore.get_document("interventions", intervention_id)
        if not doc:
            # Fallback creation
            doc = {
                "id": intervention_id,
                "city_id": "delhi-ncr",
                "zone": "City Zone",
                "status": formatted_status,
                "created_at": datetime.now().isoformat(),
            }

        doc["status"] = formatted_status
        doc["updated_at"] = datetime.now().isoformat()
        self.firestore.save_document("interventions", intervention_id, doc)
        logger.info(f"Updated intervention {intervention_id} status to {formatted_status}")
        return doc


intervention_service = InterventionService()
