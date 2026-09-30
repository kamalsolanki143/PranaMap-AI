"""PranaMap AI - Citizen Advisory & Multi-Channel Broadcast Service.

Generates structured, natural public health advisories across English, Hindi, and Marathi
using Google Gemini with verified fallback. Simulates municipal broadcast dissemination
to schools, hospitals, elderly care networks, and the general public.
"""

from datetime import datetime
import logging
from typing import Dict, Any, List, Optional
from app.services.gemini_service import gemini_service
from app.services.grounding_service import grounding_service
from app.services.firestore_service import firestore_service

logger = logging.getLogger(__name__)


class AdvisoryService:
    def __init__(self):
        self.gemini = gemini_service
        self.grounding = grounding_service
        self.firestore = firestore_service

    async def generate_advisory(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate structured multilingual citizen advisory grounded in real environmental telemetry."""
        city_id = context.get("city_id", "delhi-ncr")
        ward = context.get("ward", "Anand Vihar")
        audience = context.get("audience", "General Public")
        requested_lang = context.get("language") or context.get("lang") or "en"

        # Resolve real environmental context via GroundingService
        grounded_ctx = None
        try:
            target_loc = ward if ward and ward != "Central District" else city_id
            grounded_ctx = await self.grounding.build_grounded_input(location_name_or_id=target_loc)
        except Exception as e:
            logger.info(f"Grounding resolution fallback for {ward or city_id}: {e}")

        # Extract AQI: preference to explicit request if provided and valid, else grounded telemetry
        if context.get("aqi") is not None:
            resolved_aqi = context.get("aqi")
        elif grounded_ctx and grounded_ctx.air_quality and grounded_ctx.air_quality.aqi is not None:
            resolved_aqi = grounded_ctx.air_quality.aqi
        else:
            resolved_aqi = 184 if city_id == "delhi-ncr" else 112

        # Pass grounded context to Gemini
        gemini_output = await self.gemini.generate_multilingual_advisory(
            context={
                "city": city_id.replace("-", " ").title(),
                "ward": ward,
                "aqi": resolved_aqi,
                "audience": audience,
                "drivers": context.get("drivers", ["Traffic congestion", "Low wind velocity"]),
                "language": requested_lang,
            },
            grounded_context=grounded_ctx,
        )

        advisory_id = f"adv_{city_id}_{int(datetime.now().timestamp())}"
        primary_msg = (
            gemini_output.citizen_message_hi
            if requested_lang == "hi"
            else (gemini_output.citizen_message_mr if requested_lang == "mr" else gemini_output.citizen_message_en)
        )
        record = {
            "id": advisory_id,
            "city_id": city_id,
            "ward": ward,
            "aqi": resolved_aqi,
            "audience": audience,
            "risk_level": gemini_output.risk_level,
            "summary": gemini_output.summary,
            "primary_message": primary_msg,
            "messages": {
                "en": gemini_output.citizen_message_en,
                "hi": gemini_output.citizen_message_hi,
                "mr": gemini_output.citizen_message_mr,
            },
            "recommended_actions": gemini_output.recommended_actions,
            "key_factors": gemini_output.key_factors,
            "limitations": gemini_output.limitations,
            "provenance_label": gemini_output.provenance_label,
            "ai_status": gemini_output.ai_status,
            "data_status": gemini_output.data_status,
            "generated_by": gemini_output.generated_by,
            "created_at": datetime.now().isoformat(),
        }

        # Store in Firestore
        self.firestore.save_document("advisories", advisory_id, record)
        return record


    def get_latest_advisories(self, city_id: str) -> List[Dict[str, Any]]:
        """Retrieve recent advisories for a city."""
        city_key = city_id.lower().strip()
        all_adv = self.firestore.list_documents("advisories")
        city_adv = [a for a in all_adv if a.get("city_id") == city_key]
        return city_adv

    def simulate_broadcast(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate sending advisory via SMS/App/Web without fake claims."""
        city_id = payload.get("city_id", "delhi-ncr")
        ward = payload.get("ward", "Anand Vihar")
        language = payload.get("language", "English")
        channel = payload.get("channel", "Web / SMS simulation")
        recipient_count = payload.get("simulated_recipients", 1240)

        result = {
            "broadcast_id": f"bc_{int(datetime.now().timestamp())}",
            "city_id": city_id,
            "ward": ward,
            "status": "SIMULATION COMPLETED",
            "is_simulation": True,
            "channel": channel,
            "language": language,
            "simulated_recipients": recipient_count,
            "timestamp": datetime.now().strftime("%d %b %Y, %H:%M:%S IST"),
            "disclaimer": "This was executed in demonstration mode. No cellular SMS provider credentials are configured.",
        }

        # Record in system_events
        self.firestore.save_document("system_events", result["broadcast_id"], result)
        return result


advisory_service = AdvisoryService()
