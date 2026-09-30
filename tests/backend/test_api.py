"""PranaMap AI - Backend API Tests

Automated tests for FastAPI endpoints verifying environmental intelligence services.
"""

import sys
from pathlib import Path
import pytest
from httpx import ASGITransport, AsyncClient

# Ensure backend directory is in python path
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    """Create async test client for the FastAPI app."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


class TestHealthEndpoint:
    @pytest.mark.anyio
    async def test_health_returns_200(self, client):
        res = await client.get("/api/v1/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert "firestore" in data
        assert "gemini" in data


class TestCitiesEndpoint:
    @pytest.mark.anyio
    async def test_cities_returns_indian_cities(self, client):
        res = await client.get("/api/v1/cities")
        assert res.status_code == 200
        data = res.json()
        assert data["count"] >= 9
        city_ids = [c["id"] for c in data["cities"]]
        assert "delhi-ncr" in city_ids
        assert "mumbai" in city_ids


class TestDashboardEndpoint:
    @pytest.mark.anyio
    async def test_dashboard_delhi_returns_situation_brief(self, client):
        res = await client.get("/api/v1/dashboard/delhi-ncr")
        assert res.status_code == 200
        data = res.json()
        assert data["city"]["name"] == "Delhi NCR"
        assert "situation_brief" in data
        assert "critical_zone" in data["situation_brief"]
        assert data["situation_brief"]["critical_zone"]["name"] == "Anand Vihar"
        assert len(data["priority_areas"]) >= 3

    @pytest.mark.anyio
    async def test_air_quality_endpoint(self, client):
        res = await client.get("/api/v1/air-quality/delhi-ncr")
        assert res.status_code == 200
        data = res.json()
        assert "metrics" in data
        assert "pm25" in data["metrics"]
        assert "pm10" in data["metrics"]

    @pytest.mark.anyio
    async def test_hotspots_endpoint(self, client):
        res = await client.get("/api/v1/hotspots/delhi-ncr")
        assert res.status_code == 200
        data = res.json()
        assert data["count"] > 0
        assert data["hotspots"][0]["name"] == "Anand Vihar"


class TestForecastEndpoint:
    @pytest.mark.anyio
    async def test_72h_forecast_returns_points_and_features(self, client):
        res = await client.get("/api/v1/forecast/delhi-ncr")
        assert res.status_code == 200
        data = res.json()
        assert data["horizon_hours"] == 72
        assert len(data["points"]) == 25
        assert "peak_window" in data
        assert "feature_contributions" in data
        assert len(data["feature_contributions"]) >= 3


class TestAttributionEndpoint:
    @pytest.mark.anyio
    async def test_attribution_returns_evidence_and_sources(self, client):
        res = await client.get("/api/v1/attribution/delhi-ncr/anand-vihar")
        assert res.status_code == 200
        data = res.json()
        assert "sources" in data
        sources = {s["source"]: s["percentage"] for s in data["sources"]}
        assert "Traffic" in sources
        assert "Construction" in sources
        assert "Biomass" in sources
        assert "Industrial" in sources
        assert "evidence" in data
        assert "wind" in data["evidence"]


class TestInterventionsEndpoint:
    @pytest.mark.anyio
    async def test_interventions_lifecycle(self, client):
        res = await client.get("/api/v1/interventions/delhi-ncr")
        assert res.status_code == 200
        data = res.json()
        assert data["count"] >= 3
        first_id = data["interventions"][0]["id"]

        # Test status update
        update_res = await client.post(f"/api/v1/interventions/{first_id}/status", json={"status": "Approved"})
        assert update_res.status_code == 200
        assert update_res.json()["intervention"]["status"] == "Approved"


class TestSimulationsEndpoint:
    @pytest.mark.anyio
    async def test_simulation_attenuation(self, client):
        res = await client.post("/api/v1/simulations", json={
            "city_id": "delhi-ncr",
            "ward_id": "anand-vihar",
            "current_aqi": 186,
            "selected_interventions": ["traffic_diversion", "construction_control", "dust_suppression"],
        })
        assert res.status_code == 200
        data = res.json()
        assert data["delta_aqi"] < 0
        assert data["projected_aqi"] < data["current_aqi"]
        assert len(data["assumptions"]) >= 3


class TestAdvisoryEndpoint:
    @pytest.mark.anyio
    async def test_generate_multilingual_advisory(self, client):
        res = await client.post("/api/v1/advisories/generate", json={
            "city_id": "delhi-ncr",
            "ward": "Anand Vihar",
            "aqi": 342,
            "audience": "General Public",
        })
        assert res.status_code == 200
        data = res.json()
        assert "messages" in data
        assert "en" in data["messages"]
        assert "hi" in data["messages"]
        assert "mr" in data["messages"]


class TestDataSourcesEndpoint:
    @pytest.mark.anyio
    async def test_data_sources_transparency(self, client):
        res = await client.get("/api/v1/data-sources")
        assert res.status_code == 200
        data = res.json()
        assert data["count"] >= 5


class TestOrchestratorEndpoint:
    @pytest.mark.anyio
    async def test_multi_agent_decision_cycle(self, client):
        res = await client.get("/api/v1/orchestrate/delhi-ncr?ward_id=anand-vihar")
        assert res.status_code == 200
        data = res.json()
        assert data["pipeline_status"] == "SUCCESS"
        assert "air_quality" in data
        assert "forecast" in data
        assert "attribution" in data
        assert "interventions" in data
        assert "advisory" in data
        assert "simulation" in data

