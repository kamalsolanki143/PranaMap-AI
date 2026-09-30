"""PranaMap AI - Environmental Grounding Layer Tests

Tests coverage for:
1. Complete environmental input
2. Missing weather field
3. Missing air-quality field
4. Missing station
5. Raniwara verification (MODELLED CAMS + Open-Meteo NWP + remote station)
6. Anand Vihar verification (OBSERVED CPCB CAAQMS + Open-Meteo NWP)
7. MODELLED provenance preservation (never converted to OBSERVED)
8. No fabricated numeric values (nulls preserved without random generation)
"""

import sys
from pathlib import Path
import pytest

# Ensure backend directory is in python path
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.grounding_service import (
    grounding_service,
    format_grounded_gemini_prompt,
    GroundedLocation,
    GroundedAirQuality,
    GroundedWeather,
    GroundedForecast,
    GroundedProvenance,
    GroundedEnvironmentalContext,
    GROUNDED_GEMINI_SYSTEM_DIRECTIVE,
)


@pytest.fixture
def anyio_backend():
    return "asyncio"


class TestGroundingServiceInputs:
    """Test schemas and edge cases."""

    def test_complete_environmental_input(self):
        """1. Verify complete environmental input parses, validates, and serializes."""
        loc = GroundedLocation(
            name="Delhi Test Center",
            state="Delhi",
            district="Central Delhi",
            latitude=28.6139,
            longitude=77.2090,
        )
        aq = GroundedAirQuality(
            source="CPCB CAAQMS Real-Time Network",
            status="OBSERVED",
            aqi=245,
            pm25=142.5,
            pm10=260.0,
            no2=58.0,
            so2=16.0,
            o3=42.0,
            co=1.8,
            dust=None,
        )
        weather = GroundedWeather(
            source="Open-Meteo Synoptic NWP (ECMWF/GFS)",
            status="MODELLED",
            temperature=26.4,
            humidity=65.0,
            wind_speed=8.2,
            wind_direction=290.0,
            precipitation=0.0,
            pressure=1008.0,
        )
        forecast = GroundedForecast(
            type="Calibrated 72-Hour Outlook (Diurnal Inversion Model)",
            status="MODELLED / RULE-BASED",
            horizon_hours=72,
            data=[{"hour_ahead": 3, "aqi": 255, "pm25": 148.0}],
        )
        provenance = GroundedProvenance(
            ground_station_available=True,
            nearest_station="ITO Delhi CPCB",
            nearest_station_distance_km=1.2,
            notes=["Direct physical CAAQMS station within 6 km."],
        )

        context = GroundedEnvironmentalContext(
            location=loc,
            air_quality=aq,
            weather=weather,
            forecast=forecast,
            provenance=provenance,
        )

        assert context.location.name == "Delhi Test Center"
        assert context.air_quality.status == "OBSERVED"
        assert context.weather.status == "MODELLED"
        assert context.provenance.ground_station_available is True

        prompt = format_grounded_gemini_prompt(context)
        assert GROUNDED_GEMINI_SYSTEM_DIRECTIVE in prompt
        assert "Delhi Test Center" in prompt
        assert "OBSERVED" in prompt

    def test_missing_weather_field(self):
        """2. Verify missing weather field is handled safely as null without crashing."""
        loc = GroundedLocation(
            name="Sample Ward",
            latitude=28.0,
            longitude=77.0,
        )
        aq = GroundedAirQuality(
            source="CPCB CAAQMS Real-Time Network",
            status="OBSERVED",
            aqi=150,
            pm25=75.0,
        )
        provenance = GroundedProvenance(
            ground_station_available=True,
            nearest_station="Sample Station",
            nearest_station_distance_km=2.0,
        )

        # weather is explicitly None
        context = GroundedEnvironmentalContext(
            location=loc,
            air_quality=aq,
            weather=None,
            forecast=None,
            provenance=provenance,
        )

        assert context.weather is None
        json_str = context.model_dump_json()
        assert '"weather":null' in json_str or '"weather": null' in json_str

        # Prompt formatting must succeed without error
        prompt = format_grounded_gemini_prompt(context)
        assert "Sample Ward" in prompt
        assert GROUNDED_GEMINI_SYSTEM_DIRECTIVE in prompt

    def test_missing_air_quality_field(self):
        """3. Verify missing air quality field remains null without hallucinating measurements."""
        loc = GroundedLocation(
            name="Remote Outpost",
            latitude=25.0,
            longitude=71.5,
        )
        weather = GroundedWeather(
            source="Open-Meteo Synoptic NWP (ECMWF/GFS)",
            status="MODELLED",
            temperature=32.0,
            humidity=30.0,
        )
        provenance = GroundedProvenance(
            ground_station_available=False,
            nearest_station=None,
            nearest_station_distance_km=None,
            notes=["No station available"],
        )

        # air_quality is explicitly None
        context = GroundedEnvironmentalContext(
            location=loc,
            air_quality=None,
            weather=weather,
            provenance=provenance,
        )

        assert context.air_quality is None
        json_str = context.model_dump_json()
        assert '"air_quality":null' in json_str or '"air_quality": null' in json_str

        prompt = format_grounded_gemini_prompt(context)
        assert "Remote Outpost" in prompt
        assert GROUNDED_GEMINI_SYSTEM_DIRECTIVE in prompt

    def test_missing_station(self):
        """4. Verify missing station leaves nearest_station null without fabricating station names."""
        loc = GroundedLocation(
            name="Deep Thar Desert",
            state="Rajasthan",
            district="Jaisalmer",
            latitude=27.0,
            longitude=70.0,
        )
        provenance = GroundedProvenance(
            ground_station_available=False,
            nearest_station=None,
            nearest_station_distance_km=None,
            notes=["No physical CPCB CAAQMS stations detected within regional radius."],
        )

        context = GroundedEnvironmentalContext(
            location=loc,
            air_quality=None,
            weather=None,
            provenance=provenance,
        )

        assert context.provenance.ground_station_available is False
        assert context.provenance.nearest_station is None
        assert context.provenance.nearest_station_distance_km is None

        json_str = context.model_dump_json()
        assert '"nearest_station":null' in json_str or '"nearest_station": null' in json_str


class TestGroundingServiceRealPipelines:
    """Run real PranaMap data pipelines through the grounding layer."""

    @pytest.mark.anyio
    async def test_raniwara_pipeline(self):
        """5. Test Raniwara: Verified non-station rural node (MODELLED CAMS + Open-Meteo)."""
        ctx = await grounding_service.build_grounded_input("raniwara")

        # Location verification
        assert ctx.location.name == "Raniwara"
        assert ctx.location.district == "Jalore"
        assert ctx.location.state == "Rajasthan"
        assert ctx.location.latitude == 24.7547
        assert ctx.location.longitude == 72.2215

        # Provenance verification: NO direct station
        assert ctx.provenance.ground_station_available is False
        assert ctx.provenance.nearest_station_distance_km > 6.0
        assert ctx.provenance.nearest_station is not None

        # Air Quality: MUST be MODELLED or CACHED (never OBSERVED!)
        assert ctx.air_quality is not None
        assert ctx.air_quality.status in ("MODELLED", "CACHED / BENCHMARK")
        assert ctx.air_quality.status != "OBSERVED"
        assert "CPCB CAAQMS Real-Time Network" not in ctx.air_quality.source

        # Weather: MUST be MODELLED
        assert ctx.weather is not None
        assert ctx.weather.status == "MODELLED"
        assert "Open-Meteo" in ctx.weather.source

        # Check prompt generation
        prompt = format_grounded_gemini_prompt(ctx)
        assert "Raniwara" in prompt
        assert "Jalore" in prompt
        assert "MODELLED" in prompt

    @pytest.mark.anyio
    async def test_anand_vihar_pipeline(self):
        """6. Test Anand Vihar: Verified urban hotspot with direct physical CPCB CAAQMS."""
        ctx = await grounding_service.build_grounded_input("anand-vihar")

        # Location verification
        assert ctx.location.name == "Anand Vihar"
        assert ctx.location.district == "East Delhi"
        assert ctx.location.state == "Delhi"
        assert ctx.location.latitude == 28.6469
        assert ctx.location.longitude == 77.3153

        # Provenance verification: Direct physical station active
        assert ctx.provenance.ground_station_available is True
        assert ctx.provenance.nearest_station_distance_km <= 6.0
        assert ctx.provenance.nearest_station == "Anand Vihar CAAQS"

        # Air Quality: MUST be OBSERVED ground measurements
        assert ctx.air_quality is not None
        assert ctx.air_quality.status == "OBSERVED"
        assert "CPCB" in ctx.air_quality.source
        assert ctx.air_quality.aqi == 342
        assert ctx.air_quality.pm25 == 218.0
        assert ctx.air_quality.pm10 == 384.0

        # Weather: NWP is MODELLED
        assert ctx.weather is not None
        assert ctx.weather.status == "MODELLED"
        assert "Open-Meteo" in ctx.weather.source

        prompt = format_grounded_gemini_prompt(ctx)
        assert "Anand Vihar" in prompt
        assert "OBSERVED" in prompt

    def test_modelled_provenance_preservation(self):
        """7. Verify MODELLED provenance is preserved and never converted to OBSERVED."""
        # Open-Meteo Weather must always have status MODELLED
        weather = GroundedWeather(
            source="Open-Meteo Synoptic NWP (ECMWF/GFS)",
            status="MODELLED",
            temperature=28.0,
        )
        assert weather.status == "MODELLED"
        assert weather.status != "OBSERVED"

        # Open-Meteo CAMS must always have status MODELLED
        cams_aq = GroundedAirQuality(
            source="Copernicus CAMS & Open-Meteo Air Quality",
            status="MODELLED",
            pm25=22.4,
            pm10=54.1,
        )
        assert cams_aq.status == "MODELLED"
        assert cams_aq.status != "OBSERVED"
        assert "CPCB CAAQMS" not in cams_aq.source

        # Forecast must always be MODELLED / RULE-BASED
        fc = GroundedForecast(
            type="Calibrated 72-Hour Outlook",
            status="MODELLED / RULE-BASED",
            data=[],
        )
        assert "MODELLED" in fc.status
        assert fc.status != "OBSERVED"

    def test_no_fabricated_numeric_values(self):
        """8. Verify that missing metrics remain None/null and are not fabricated with random values."""
        aq = GroundedAirQuality(
            source="Copernicus CAMS & Open-Meteo Air Quality",
            status="MODELLED",
            pm25=18.5,
            pm10=42.0,
            no2=None,
            so2=None,
            o3=None,
            co=None,
            dust=None,
        )

        assert aq.no2 is None
        assert aq.so2 is None
        assert aq.o3 is None
        assert aq.co is None
        assert aq.dust is None

        weather = GroundedWeather(
            source="Open-Meteo Synoptic NWP",
            status="MODELLED",
            temperature=24.5,
            humidity=None,
            wind_speed=None,
            wind_direction=None,
            precipitation=None,
            pressure=None,
        )

        assert weather.humidity is None
        assert weather.wind_speed is None
        assert weather.wind_direction is None
        assert weather.precipitation is None
        assert weather.pressure is None

        ctx = GroundedEnvironmentalContext(
            location=GroundedLocation(name="Station Alpha", latitude=20.0, longitude=75.0),
            air_quality=aq,
            weather=weather,
            provenance=GroundedProvenance(ground_station_available=False),
        )

        json_data = ctx.model_dump()
        assert json_data["air_quality"]["so2"] is None
        assert json_data["weather"]["precipitation"] is None
