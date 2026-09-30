"""PranaMap AI - Gemini Structured Response & Validation Tests

Tests coverage for Task 4:
1. Valid Gemini JSON
2. Invalid JSON (triggers fallback)
3. Missing required field (triggers fallback)
4. Invalid enum (triggers fallback)
5. Wrong data type (triggers fallback)
6. Empty response (triggers fallback)
7. Gemini API failure (network error, timeout, 503)
8. Missing API key (instant safe fallback)
9. Numeric hallucination protection (numbers originate exclusively from PranaMap data)
10. Fallback response validity
11. Real grounded Raniwara intelligence test
12. Real grounded Anand Vihar intelligence test
"""

import sys
from pathlib import Path
from unittest.mock import MagicMock, AsyncMock
import pytest

# Ensure backend directory is in python path
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.schemas.intelligence import (
    RiskLevel,
    DataStatus,
    StructuredGeminiResponse,
    ValidatedEnvironmentalResponse,
    map_aqi_to_risk_level,
)
from app.services.grounding_service import (
    grounding_service,
    GroundedLocation,
    GroundedAirQuality,
    GroundedWeather,
    GroundedProvenance,
    GroundedEnvironmentalContext,
)
from app.services.gemini_service import GeminiService, gemini_service


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
def sample_context():
    """Deterministic grounded context for unit testing."""
    return GroundedEnvironmentalContext(
        location=GroundedLocation(
            name="Anand Vihar",
            state="Delhi",
            district="East Delhi",
            latitude=28.6469,
            longitude=77.3153,
        ),
        air_quality=GroundedAirQuality(
            source="CPCB CAAQMS Real-Time Network",
            status="OBSERVED",
            aqi=342,
            pm25=218.0,
            pm10=384.0,
            no2=84.0,
            so2=22.0,
            o3=56.0,
            co=2.8,
        ),
        weather=GroundedWeather(
            source="Open-Meteo Synoptic NWP (ECMWF/GFS)",
            status="MODELLED",
            temperature=27.4,
            humidity=71.0,
            wind_speed=4.4,
            wind_direction=302.0,
            precipitation=0.0,
            pressure=987.6,
        ),
        provenance=GroundedProvenance(
            ground_station_available=True,
            nearest_station="Anand Vihar CAAQS",
            nearest_station_distance_km=0.0,
            notes=["Direct physical CAAQMS station active."],
        ),
    )


class TestStructuredResponseValidation:
    """Unit tests for response parsing, schema enforcement, and validation rules."""

    def test_valid_gemini_json(self):
        """1. Valid Gemini JSON parses and validates against StructuredGeminiResponse."""
        valid_payload = {
            "summary": "Severe particulate pollution recorded in Anand Vihar under calm nocturnal wind vectors.",
            "risk_level": "SEVERE",
            "key_drivers": ["Low wind dispersion (<5 km/h)", "Fugitive transport emissions"],
            "recommended_actions": ["Deploy mechanical mist cannons", "Suspend outdoor athletic training"],
            "evidence_notes": ["Direct CPCB CAAQMS physical observation", "NWP surface pressure at 987.6 hPa"],
            "data_status": "OBSERVED",
            "generated_by": "Gemini",
            "provenance": "AI-GENERATED",
            "limitations": ["Sensor spatial footprint confined to 2 km airshed"],
        }
        res = StructuredGeminiResponse.model_validate(valid_payload)
        assert res.summary == valid_payload["summary"]
        assert res.risk_level == RiskLevel.SEVERE
        assert res.data_status == DataStatus.OBSERVED
        assert len(res.key_drivers) == 2
        assert len(res.recommended_actions) == 2

    @pytest.mark.anyio
    async def test_invalid_json_triggers_fallback(self, sample_context):
        """2. Invalid/malformed JSON string triggers deterministic fallback without raising errors."""
        service = GeminiService(api_key="mock-key")
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "{malformed json summary: broken..."
        mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)
        service._client = mock_client

        res = await service.generate_environmental_intelligence(sample_context)

        assert isinstance(res, ValidatedEnvironmentalResponse)
        assert res.intelligence.generated_by == "PranaMap AI Deterministic Engine"
        assert res.intelligence.provenance == "CALIBRATED-FALLBACK"
        assert res.intelligence.risk_level == RiskLevel.SEVERE

    @pytest.mark.anyio
    async def test_missing_required_field_triggers_fallback(self, sample_context):
        """3. JSON missing a required field (e.g. key_drivers) triggers fallback."""
        service = GeminiService(api_key="mock-key")
        mock_client = MagicMock()
        mock_response = MagicMock()
        # Missing key_drivers and recommended_actions
        mock_response.text = '{"summary": "Valid summary here", "risk_level": "SEVERE", "data_status": "OBSERVED"}'
        mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)
        service._client = mock_client

        res = await service.generate_environmental_intelligence(sample_context)

        assert res.intelligence.generated_by == "PranaMap AI Deterministic Engine"
        assert len(res.intelligence.key_drivers) > 0

    @pytest.mark.anyio
    async def test_invalid_enum_triggers_fallback(self, sample_context):
        """4. Invalid enum value triggers fallback."""
        service = GeminiService(api_key="mock-key")
        mock_client = MagicMock()
        mock_response = MagicMock()
        # Non-string or unsupported risk_level
        mock_response.text = '''{
            "summary": "Valid summary",
            "risk_level": {"nested": "not_an_enum"},
            "key_drivers": ["Traffic"],
            "recommended_actions": ["Stay indoors"],
            "data_status": "OBSERVED"
        }'''
        mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)
        service._client = mock_client

        res = await service.generate_environmental_intelligence(sample_context)

        assert res.intelligence.generated_by == "PranaMap AI Deterministic Engine"
        assert res.intelligence.risk_level == RiskLevel.SEVERE

    @pytest.mark.anyio
    async def test_wrong_data_type_triggers_fallback(self, sample_context):
        """5. Wrong data type (e.g. key_drivers as integer) triggers fallback."""
        service = GeminiService(api_key="mock-key")
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = '''{
            "summary": "Valid summary",
            "risk_level": "SEVERE",
            "key_drivers": 99999,
            "recommended_actions": ["Stay indoors"],
            "data_status": "OBSERVED"
        }'''
        mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)
        service._client = mock_client

        res = await service.generate_environmental_intelligence(sample_context)

        assert res.intelligence.generated_by == "PranaMap AI Deterministic Engine"
        assert isinstance(res.intelligence.key_drivers, list)

    @pytest.mark.anyio
    async def test_empty_response_triggers_fallback(self, sample_context):
        """6. Empty response from model triggers fallback."""
        service = GeminiService(api_key="mock-key")
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = ""
        mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)
        service._client = mock_client

        res = await service.generate_environmental_intelligence(sample_context)

        assert res.intelligence.generated_by == "PranaMap AI Deterministic Engine"

    @pytest.mark.anyio
    async def test_gemini_api_failure_triggers_fallback(self, sample_context):
        """7. Gemini API exception (network timeout, 503 quota) triggers fallback."""
        service = GeminiService(api_key="mock-key")
        mock_client = MagicMock()
        mock_client.aio.models.generate_content = AsyncMock(side_effect=Exception("503 Service Unavailable"))
        service._client = mock_client

        res = await service.generate_environmental_intelligence(sample_context)

        assert res.intelligence.generated_by == "PranaMap AI Deterministic Engine"
        assert res.intelligence.provenance == "CALIBRATED-FALLBACK"

    @pytest.mark.anyio
    async def test_missing_api_key_uses_fallback(self, sample_context):
        """8. Missing API key returns fallback immediately without error."""
        service = GeminiService(api_key=None)
        assert service.is_available() is False

        res = await service.generate_environmental_intelligence(sample_context)

        assert res.intelligence.generated_by == "PranaMap AI Deterministic Engine"
        assert res.intelligence.risk_level == RiskLevel.SEVERE

    def test_numeric_hallucination_protection(self, sample_context):
        """9. Numeric metrics originate exclusively from PranaMap data; Gemini schema contains none."""
        # StructuredGeminiResponse contains no numeric measurement fields
        schema_fields = StructuredGeminiResponse.model_fields.keys()
        for forbidden in ("aqi", "pm25", "pm10", "no2", "so2", "o3", "temperature", "latitude", "longitude"):
            assert forbidden not in schema_fields, f"Forbidden numeric field '{forbidden}' found in AI response schema"

        # ValidatedEnvironmentalResponse preserves original physical data unaltered
        fallback_res = gemini_service._deterministic_intelligence_fallback(
            sample_context, RiskLevel.SEVERE, DataStatus.OBSERVED
        )
        combined = ValidatedEnvironmentalResponse(
            location=sample_context.location,
            air_quality=sample_context.air_quality,
            weather=sample_context.weather,
            forecast=sample_context.forecast,
            provenance=sample_context.provenance,
            intelligence=fallback_res,
        )

        assert combined.air_quality.aqi == 342
        assert combined.air_quality.pm25 == 218.0
        assert combined.weather.temperature == 27.4
        assert combined.location.latitude == 28.6469

    def test_fallback_response_validity(self, sample_context):
        """10. Deterministic fallback itself strictly complies with StructuredGeminiResponse."""
        fallback = gemini_service._deterministic_intelligence_fallback(
            sample_context, RiskLevel.SEVERE, DataStatus.OBSERVED
        )
        assert isinstance(fallback, StructuredGeminiResponse)
        assert fallback.risk_level == RiskLevel.SEVERE
        assert fallback.data_status == DataStatus.OBSERVED
        assert fallback.generated_by == "PranaMap AI Deterministic Engine"
        assert fallback.provenance == "CALIBRATED-FALLBACK"
        assert len(fallback.key_drivers) > 0
        assert len(fallback.recommended_actions) > 0


class TestRealGroundedIntelligencePipelines:
    """Verify real data pipelines for Raniwara and Anand Vihar through the intelligence layer."""

    @pytest.mark.anyio
    async def test_real_grounded_raniwara_intelligence(self):
        """Test Raniwara: Rural node with Copernicus CAMS (MODELLED)."""
        ctx = await grounding_service.build_grounded_input("raniwara")
        res = await gemini_service.generate_environmental_intelligence(ctx)

        assert res.location.name == "Raniwara"
        assert res.location.state == "Rajasthan"
        assert res.air_quality.status in ("MODELLED", "CACHED / BENCHMARK")
        assert res.provenance.ground_station_available is False
        assert res.provenance.nearest_station_distance_km > 6.0

        # Intelligence validation
        assert res.intelligence.data_status == DataStatus.MODELLED
        assert res.intelligence.risk_level in (RiskLevel.LOW, RiskLevel.MODERATE)
        assert res.intelligence.provenance in ("AI-GENERATED", "CALIBRATED-FALLBACK")
        assert len(res.intelligence.key_drivers) > 0
        assert len(res.intelligence.recommended_actions) > 0

    @pytest.mark.anyio
    async def test_real_grounded_anand_vihar_intelligence(self):
        """Test Anand Vihar: Urban hotspot with direct CPCB CAAQMS (OBSERVED)."""
        ctx = await grounding_service.build_grounded_input("anand-vihar")
        res = await gemini_service.generate_environmental_intelligence(ctx)

        assert res.location.name == "Anand Vihar"
        assert res.location.state == "Delhi"
        assert res.air_quality.status == "OBSERVED"
        assert res.air_quality.aqi == 342
        assert res.provenance.ground_station_available is True
        assert res.provenance.nearest_station_distance_km == 0.0

        # Intelligence validation
        assert res.intelligence.data_status == DataStatus.OBSERVED
        assert res.intelligence.risk_level == RiskLevel.SEVERE
        assert res.intelligence.provenance in ("AI-GENERATED", "CALIBRATED-FALLBACK")
        assert len(res.intelligence.key_drivers) > 0
        assert len(res.intelligence.recommended_actions) > 0
