"""PranaMap AI - Backend API Tests

Tests for FastAPI endpoints. Uses httpx AsyncClient with pytest-asyncio.
"""

import pytest
from httpx import ASGITransport, AsyncClient


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    """Create async test client for the FastAPI app."""
    # from backend.app import app
    # transport = ASGITransport(app=app)
    # async with AsyncClient(transport=transport, base_url="http://test") as ac:
    #     yield ac
    pass


class TestHealthEndpoint:
    """GET /api/health"""

    @pytest.mark.anyio
    async def test_health_returns_200(self, client):
        response = await client.get("/api/health")
        assert response.status_code == 200

    @pytest.mark.anyio
    async def test_health_contains_status(self, client):
        response = await client.get("/api/health")
        data = response.json()
        assert "status" in data
        assert data["status"] == "ok"

    @pytest.mark.anyio
    async def test_health_includes_db_check(self, client):
        response = await client.get("/api/health")
        data = response.json()
        assert "database" in data


class TestWardsEndpoint:
    """GET /api/wards"""

    @pytest.mark.anyio
    async def test_list_wards_returns_200(self, client):
        response = await client.get("/api/wards")
        assert response.status_code == 200

    @pytest.mark.anyio
    async def test_list_wards_returns_array(self, client):
        response = await client.get("/api/wards")
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.anyio
    async def test_ward_has_required_fields(self, client):
        response = await client.get("/api/wards")
        wards = response.json()
        if wards:
            ward = wards[0]
            assert "ward_id" in ward
            assert "ward_name" in ward
            assert "zone" in ward

    @pytest.mark.anyio
    async def test_ward_by_id(self, client):
        response = await client.get("/api/wards/1")
        assert response.status_code in (200, 404)

    @pytest.mark.anyio
    async def test_wards_filter_by_zone(self, client):
        response = await client.get("/api/wards?zone=West")
        assert response.status_code == 200
        wards = response.json()
        for ward in wards:
            assert ward["zone"] == "West"


class TestAQIEndpoint:
    """GET /api/aqi"""

    @pytest.mark.anyio
    async def test_latest_aqi_returns_200(self, client):
        response = await client.get("/api/aqi/latest")
        assert response.status_code == 200

    @pytest.mark.anyio
    async def test_aqi_has_value_and_category(self, client):
        response = await client.get("/api/aqi/latest")
        data = response.json()
        if data:
            assert "aqi_value" in data
            assert "category" in data

    @pytest.mark.anyio
    async def test_aqi_history_endpoint(self, client):
        response = await client.get("/api/aqi/history?ward_id=1&hours=24")
        assert response.status_code == 200

    @pytest.mark.anyio
    async def test_aqi_history_returns_time_series(self, client):
        response = await client.get("/api/aqi/history?ward_id=1&hours=24")
        data = response.json()
        assert isinstance(data, list)


class TestForecastEndpoint:
    """GET /api/forecasts"""

    @pytest.mark.anyio
    async def test_forecast_returns_200(self, client):
        response = await client.get("/api/forecasts?ward_id=1")
        assert response.status_code == 200

    @pytest.mark.anyio
    async def test_forecast_requires_ward_id(self, client):
        response = await client.get("/api/forecasts")
        assert response.status_code == 422

    @pytest.mark.anyio
    async def test_forecast_horizon_parameter(self, client):
        response = await client.get("/api/forecasts?ward_id=1&horizon=6")
        assert response.status_code == 200

    @pytest.mark.anyio
    async def test_forecast_includes_confidence(self, client):
        response = await client.get("/api/forecasts?ward_id=1")
        data = response.json()
        if data:
            assert "confidence_low" in data or "confidence_pct" in data


class TestAdvisoriesEndpoint:
    """GET /api/advisories"""

    @pytest.mark.anyio
    async def test_active_advisories(self, client):
        response = await client.get("/api/advisories")
        assert response.status_code == 200

    @pytest.mark.anyio
    async def test_advisories_filter_by_severity(self, client):
        response = await client.get("/api/advisories?severity=danger")
        assert response.status_code == 200

    @pytest.mark.anyio
    async def test_create_advisory(self, client):
        payload = {
            "title": "Test Advisory",
            "description": "Test description",
            "severity": "info",
            "target_zones": ["West"],
        }
        response = await client.post("/api/advisories", json=payload)
        assert response.status_code in (201, 403)


class TestFireDataEndpoint:
    """GET /api/fire"""

    @pytest.mark.anyio
    async def test_recent_fires(self, client):
        response = await client.get("/api/fire?days=7")
        assert response.status_code == 200

    @pytest.mark.anyio
    async def test_fire_data_by_ward(self, client):
        response = await client.get("/api/fire?ward_id=1")
        assert response.status_code == 200


class TestEnforcementEndpoint:
    """GET /api/enforcement"""

    @pytest.mark.anyio
    async def test_enforcement_list(self, client):
        response = await client.get("/api/enforcement")
        assert response.status_code == 200

    @pytest.mark.anyio
    async def test_enforcement_filter_by_status(self, client):
        response = await client.get("/api/enforcement?status=detected")
        assert response.status_code == 200
