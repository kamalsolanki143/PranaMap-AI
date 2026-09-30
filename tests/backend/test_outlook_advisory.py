"""PranaMap AI - Environmental Outlook & Advisory Integration Tests (Task 5).

Verifies:
1. Environmental Outlook endpoint (/api/v1/weather/outlook and /api/v1/outlook)
2. Advisory endpoints (/api/v1/advisories/generate and /api/v1/advisories/{city_id})
3. Raniwara end-to-end flow (MODELLED Copernicus CAMS, nearest station Jalore)
4. Anand Vihar end-to-end flow (OBSERVED CPCB CAAQMS ground sensor / CACHED benchmark)
5. Multilingual support: Hindi (hi), English (en), and Marathi (mr)
6. Robust fallback when Gemini fails (timeout, rate limit, invalid response, no API key)
7. Negative constraints (no medical diagnosis, no invented orders, qualified language)
8. Data provenance preservation (MODELLED - Open-Meteo, MODELLED - Open-Meteo CAMS, AI-GENERATED)
"""

import sys
from pathlib import Path
from unittest.mock import MagicMock, AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

# Ensure backend directory is in python path
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app
from app.schemas.intelligence import (
    RiskLevel,
    DataStatus,
    EnvironmentalOutlookOutput,
)
from app.services.grounding_service import grounding_service
from app.services.gemini_service import (
    GeminiService,
    gemini_service,
    GeminiAdvisoryOutput,
)
from app.services.advisory_service import advisory_service


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ─── 1. OUTLOOK ENDPOINT TESTS ───────────────────────────────────────────────

class TestEnvironmentalOutlookEndpoint:
    @pytest.mark.anyio
    async def test_outlook_endpoint_delhi_success(self, client):
        """Verify GET /api/v1/weather/outlook returns structured, validated outlook."""
        res = await client.get("/api/v1/weather/outlook?location=delhi-ncr&lang=en")
        assert res.status_code == 200
        data = res.json()

        assert "summary" in data
        assert "ventilation_index" in data
        assert "risk_trend" in data
        assert "major_contributing_conditions" in data
        assert len(data["major_contributing_conditions"]) >= 1
        assert "possible_near_term_changes" in data
        assert len(data["possible_near_term_changes"]) >= 1
        assert "monitoring_and_action_focus" in data
        assert len(data["monitoring_and_action_focus"]) >= 1
        assert "data_status" in data
        assert "provenance_label" in data
        assert "ai_status" in data
        assert "factors" in data
        assert data["location"]["name"] is not None

    @pytest.mark.anyio
    async def test_outlook_endpoint_alias_route(self, client):
        """Verify GET /api/v1/outlook works as an alias for /weather/outlook."""
        res = await client.get("/api/v1/outlook?location=delhi-ncr")
        assert res.status_code == 200
        data = res.json()
        assert data["ventilation_index"] in [
            "High Dispersion",
            "Moderate Ventilation",
            "Severe Stagnation",
        ]


# ─── 2. ADVISORY ENDPOINT TESTS ──────────────────────────────────────────────

class TestAdvisoryEndpoint:
    @pytest.mark.anyio
    async def test_advisory_generate_post(self, client):
        """Verify POST /api/v1/advisories/generate returns structured multilingual advisory."""
        payload = {
            "city_id": "delhi-ncr",
            "ward": "Anand Vihar",
            "audience": "General Public",
            "language": "en",
        }
        res = await client.post("/api/v1/advisories/generate", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert "id" in data
        assert data["ward"] == "Anand Vihar"
        assert "messages" in data
        assert "en" in data["messages"]
        assert "hi" in data["messages"]
        assert "mr" in data["messages"]
        assert "recommended_actions" in data
        assert len(data["recommended_actions"]) >= 1
        assert "provenance_label" in data
        assert "ai_status" in data
        assert "data_status" in data

    @pytest.mark.anyio
    async def test_get_city_advisories(self, client):
        """Verify GET /api/v1/advisories/{city_id} returns recent advisories."""
        res = await client.get("/api/v1/advisories/delhi-ncr?lang=en")
        assert res.status_code == 200
        data = res.json()
        assert data["city_id"] == "delhi-ncr"
        assert data["count"] >= 1
        assert len(data["advisories"]) >= 1


# ─── 3. TEST LOCATION A: RANIWARA (MODELLED / NO DIRECT STATION) ─────────────

class TestRaniwaraFlow:
    @pytest.mark.anyio
    async def test_raniwara_grounding_preserves_modelled_distinction(self):
        """Raniwara has no direct station; nearest verified station is Jalore ~68km away."""
        ctx = await grounding_service.build_grounded_input(location_name_or_id="raniwara")
        assert ctx.location.name == "Raniwara"
        assert ctx.location.state == "Rajasthan"
        assert ctx.provenance.ground_station_available is False
        assert ctx.provenance.nearest_station is not None
        assert ctx.provenance.nearest_station_distance_km > 6.0
        assert ctx.air_quality.status in ["MODELLED", "CACHED / BENCHMARK"]


    @pytest.mark.anyio
    async def test_raniwara_outlook_endpoint(self, client):
        """Verify Raniwara outlook returns correct provenance label without claiming direct CPCB station."""
        res = await client.get("/api/v1/weather/outlook?location=raniwara&lang=en")
        assert res.status_code == 200
        data = res.json()
        assert data["location"]["name"] == "Raniwara"
        assert data["data_status"] in ["MODELLED", "CACHED"]
        assert "LIVE OBSERVATION" not in data["provenance_label"].upper()
        assert "CPCB OBSERVATION" not in data["provenance_label"].upper()


# ─── 4. TEST LOCATION B: ANAND VIHAR (OBSERVED GROUND STATION) ───────────────

class TestAnandViharFlow:
    @pytest.mark.anyio
    async def test_anand_vihar_grounding_preserves_observed_distinction(self):
        """Anand Vihar has a direct verified CPCB CAAQMS physical station."""
        ctx = await grounding_service.build_grounded_input(location_name_or_id="Anand Vihar")
        assert "Anand Vihar" in ctx.location.name
        assert ctx.provenance.ground_station_available is True
        assert ctx.air_quality.status in ["OBSERVED", "CACHED / BENCHMARK"]

    @pytest.mark.anyio
    async def test_anand_vihar_outlook_endpoint(self, client):
        """Verify Anand Vihar returns OBSERVED or CACHED status."""
        res = await client.get("/api/v1/weather/outlook?location=anand-vihar&lang=en")
        assert res.status_code == 200
        data = res.json()
        assert "Anand Vihar" in data["location"]["name"]
        assert data["data_status"] in ["OBSERVED", "CACHED"]


# ─── 5. MULTILINGUAL SUPPORT (HINDI, ENGLISH, MARATHI) ───────────────────────

class TestMultilingualSupport:
    @pytest.mark.anyio
    async def test_hindi_outlook_response(self, client):
        """Verify lang=hi instructs Hindi output in environmental outlook."""
        res = await client.get("/api/v1/weather/outlook?location=delhi-ncr&lang=hi")
        assert res.status_code == 200
        data = res.json()
        assert data["hindi_headline"] is not None
        assert len(data["hindi_headline"]) > 0

    @pytest.mark.anyio
    async def test_hindi_advisory_response(self, client):
        """Verify lang=hi instructs Hindi primary message in advisory."""
        payload = {
            "city_id": "delhi-ncr",
            "ward": "Anand Vihar",
            "audience": "General Public",
            "language": "hi",
        }
        res = await client.post("/api/v1/advisories/generate", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["messages"]["hi"] is not None
        assert len(data["messages"]["hi"]) > 0
        assert data["primary_message"] == data["messages"]["hi"]

    @pytest.mark.anyio
    async def test_marathi_advisory_preserved(self, client):
        """Verify Marathi advisory is preserved."""
        payload = {
            "city_id": "delhi-ncr",
            "ward": "Anand Vihar",
            "audience": "General Public",
            "language": "mr",
        }
        res = await client.post("/api/v1/advisories/generate", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["messages"]["mr"] is not None
        assert len(data["messages"]["mr"]) > 0
        assert data["primary_message"] == data["messages"]["mr"]


# ─── 6. FALLBACK BEHAVIOR WHEN GEMINI FAILS ──────────────────────────────────

class TestGeminiFallbackBehavior:
    @pytest.mark.anyio
    async def test_outlook_deterministic_fallback_when_gemini_unavailable(self):
        """When Gemini client is unconfigured or unavailable, outlook must not break and provide clear status."""
        svc = GeminiService(api_key=None)
        ctx = await grounding_service.build_grounded_input(location_name_or_id="delhi-ncr")

        outlook = await svc.generate_environmental_outlook(ctx, language="en")
        assert isinstance(outlook, EnvironmentalOutlookOutput)
        assert outlook.ai_status == "AI narrative unavailable — showing rule-based analysis."
        assert "Rule-based analysis" in outlook.provenance_label
        assert outlook.generated_by == "PranaMap AI Deterministic Engine"
        assert len(outlook.major_contributing_conditions) >= 1
        assert len(outlook.possible_near_term_changes) >= 1
        assert len(outlook.monitoring_and_action_focus) >= 1

    @pytest.mark.anyio
    async def test_advisory_deterministic_fallback_when_gemini_unavailable(self):
        """When Gemini client is unconfigured, advisory returns verified deterministic CPCB fallback."""
        svc = GeminiService(api_key=None)
        adv = await svc.generate_multilingual_advisory({
            "city": "Delhi NCR",
            "ward": "Anand Vihar",
            "aqi": 342,
            "audience": "General Public",
            "drivers": ["Traffic congestion", "Low wind velocity"],
        })
        assert isinstance(adv, GeminiAdvisoryOutput)
        assert adv.ai_status == "AI narrative unavailable — showing rule-based analysis."
        assert adv.generated_by == "PranaMap AI Deterministic Engine"
        assert "Severe" in adv.risk_level.title() or "Very Poor" in adv.risk_level.title()
        assert len(adv.recommended_actions) >= 1

    @pytest.mark.anyio
    async def test_gemini_exception_handled_gracefully_in_outlook(self):
        """When Gemini API throws an exception (timeout, 500, etc.), fallback engages safely."""
        svc = GeminiService(api_key="mock_key")
        svc._client = MagicMock()
        mock_aio = MagicMock()
        mock_aio.models.generate_content = AsyncMock(side_effect=RuntimeError("Simulated Gemini API timeout"))
        svc._client.aio = mock_aio

        ctx = await grounding_service.build_grounded_input(location_name_or_id="delhi-ncr")
        outlook = await svc.generate_environmental_outlook(ctx, language="en")

        assert isinstance(outlook, EnvironmentalOutlookOutput)
        assert outlook.ai_status == "AI narrative unavailable — showing rule-based analysis."
        assert "Simulated Gemini API timeout" not in outlook.summary


# ─── 7. NEGATIVE CONSTRAINTS & EVIDENCE VALIDATION ───────────────────────────

class TestNegativeConstraints:
    @pytest.mark.anyio
    async def test_advisory_does_not_contain_prohibited_terms(self, client):
        """Advisory must NOT invent government orders, emergency declarations, or officer names."""
        payload = {
            "city_id": "delhi-ncr",
            "ward": "Anand Vihar",
            "audience": "General Public",
        }
        res = await client.post("/api/v1/advisories/generate", json=payload)
        assert res.status_code == 200
        data = res.json()
        all_text = " ".join([
            data.get("summary", ""),
            data["messages"]["en"],
            " ".join(data.get("recommended_actions", [])),
        ]).lower()

        # Prohibited hallucinated authorities / declarations
        prohibited = [
            "dr. ramesh",
            "officer sharma",
            "prime minister order",
            "presidential decree",
            "cpcb order no.",
            "curfew declared",
        ]
        for term in prohibited:
            assert term not in all_text

    @pytest.mark.anyio
    async def test_outlook_uses_qualified_language_in_near_term_changes(self, client):
        """Outlook near-term changes must use qualified language rather than unhedged certainty."""
        res = await client.get("/api/v1/weather/outlook?location=delhi-ncr&lang=en")
        assert res.status_code == 200
        data = res.json()
        changes = " ".join(data["possible_near_term_changes"]).lower()

        assert "pollution will definitely increase" not in changes
        qualified_phrases = [
            "may",
            "indicates",
            "forecast",
            "conditions",
            "support",
            "potential",
        ]
        assert any(phrase in changes for phrase in qualified_phrases)
