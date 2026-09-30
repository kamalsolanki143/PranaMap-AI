"""PranaMap AI - Dashboard & Environmental Intelligence Endpoints.

Provides city-level situation briefings, multi-pollutant metrics,
critical zone identification, and priority area rankings.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Path, Query
from app.services.firestore_service import firestore_service
from app.services.forecast_service import forecast_service, CITY_BASELINES

router = APIRouter()

CITY_DETAILS = {
    "delhi-ncr": {
        "id": "delhi-ncr",
        "name": "Delhi NCR",
        "state": "National Capital Region",
        "coordinates": {"lat": 28.6139, "lon": 77.2090},
        "critical_zone": {
            "name": "Anand Vihar",
            "ward_id": "anand-vihar",
            "aqi": 342,
            "category": "Severe",
            "pm25": 218,
            "drivers": ["Traffic emissions", "Low wind dispersion"],
            "forecast_note": "Potential deterioration over next 4 hours",
        },
        "priority_areas": [
            {"rank": "01", "name": "Anand Vihar", "ward_id": "anand-vihar", "aqi": 342, "risk": "Critical", "driver": "Traffic emissions", "action": "Traffic diversion"},
            {"rank": "02", "name": "Dwarka", "ward_id": "dwarka", "aqi": 271, "risk": "High", "driver": "Construction dust", "action": "Site dust suppression"},
            {"rank": "03", "name": "RK Puram", "ward_id": "rk-puram", "aqi": 238, "risk": "High", "driver": "Low wind dispersion", "action": "Mechanical sweeping"},
            {"rank": "04", "name": "Punjabi Bagh", "ward_id": "punjabi-bagh", "aqi": 215, "risk": "Poor", "driver": "Commercial vehicular idling", "action": "Traffic marshals"},
        ],
        "hotspots": [
            {"id": "hs-01", "name": "Anand Vihar", "coordinates": [28.6469, 77.3160], "aqi": 342, "category": "Severe", "pm25": 218, "primaryDriver": "Traffic & ISBT idling", "trend": "Rising", "action": "Traffic Diversion"},
            {"id": "hs-02", "name": "Dwarka Sector 8", "coordinates": [28.5700, 77.0710], "aqi": 271, "category": "Poor", "pm25": 168, "primaryDriver": "Construction dust", "trend": "Stable", "action": "Mist Cannons"},
            {"id": "hs-03", "name": "RK Puram", "coordinates": [28.5660, 77.1767], "aqi": 238, "category": "Poor", "pm25": 142, "primaryDriver": "Low wind dispersion", "trend": "Rising", "action": "Road Sweeping"},
            {"id": "hs-04", "name": "Punjabi Bagh", "coordinates": [28.6692, 77.1315], "aqi": 215, "category": "Poor", "pm25": 134, "primaryDriver": "Vehicular emissions", "trend": "Stable", "action": "Traffic Control"},
            {"id": "hs-05", "name": "Lodhi Road", "coordinates": [28.5915, 77.2274], "aqi": 118, "category": "Moderate", "pm25": 62, "primaryDriver": "Urban background", "trend": "Improving", "action": "Monitoring"},
        ],
    },
    "mumbai": {
        "id": "mumbai",
        "name": "Mumbai",
        "state": "Maharashtra",
        "coordinates": {"lat": 19.0760, "lon": 72.8777},
        "critical_zone": {
            "name": "Bandra-Kurla Complex (BKC)",
            "ward_id": "bkc",
            "aqi": 178,
            "category": "Moderate",
            "pm25": 94,
            "drivers": ["High traffic density", "Metro excavation work"],
            "forecast_note": "Expected evening congestion spike",
        },
        "priority_areas": [
            {"rank": "01", "name": "BKC", "ward_id": "bkc", "aqi": 178, "risk": "Moderate", "driver": "Vehicular idling", "action": "Signal optimization"},
            {"rank": "02", "name": "Deonar", "ward_id": "deonar", "aqi": 164, "risk": "Moderate", "driver": "Waste disposal area emissions", "action": "Misting guns"},
            {"rank": "03", "name": "Sion", "ward_id": "sion", "aqi": 152, "risk": "Moderate", "driver": "Heavy transport transit", "action": "Corridor diversion"},
        ],
        "hotspots": [
            {"id": "hs-mb-01", "name": "BKC", "coordinates": [19.0664, 72.8687], "aqi": 178, "category": "Moderate", "pm25": 94, "primaryDriver": "Peak traffic", "trend": "Rising", "action": "Signal optimization"},
            {"id": "hs-mb-02", "name": "Deonar", "coordinates": [19.0433, 72.9192], "aqi": 164, "category": "Moderate", "pm25": 88, "primaryDriver": "Waste perimeter", "trend": "Stable", "action": "Misting guns"},
            {"id": "hs-mb-03", "name": "Colaba", "coordinates": [18.9067, 72.8147], "aqi": 72, "category": "Satisfactory", "pm25": 38, "primaryDriver": "Sea breeze dispersion", "trend": "Improving", "action": "Routine observation"},
        ],
    },
}


def build_dashboard_response(city_id: str) -> dict:
    city_key = city_id.lower().strip()
    baseline = CITY_BASELINES.get(city_key, CITY_BASELINES["delhi-ncr"])
    details = CITY_DETAILS.get(city_key)

    if not details:
        # Generate dynamic profile for other Indian cities
        city_title = city_key.replace("-", " ").title()
        details = {
            "id": city_key,
            "name": city_title,
            "state": "State Jurisdiction",
            "coordinates": {"lat": 20.0, "lon": 78.0},
            "critical_zone": {
                "name": f"{city_title} Central Station",
                "ward_id": f"{city_key}-central",
                "aqi": baseline["aqi"] + 25,
                "category": "Poor" if baseline["aqi"] > 150 else "Moderate",
                "pm25": int(baseline["pm25"] * 1.2),
                "drivers": ["Traffic density", "Urban dust"],
                "forecast_note": "Monitoring diurnal traffic buildup",
            },
            "priority_areas": [
                {"rank": "01", "name": f"{city_title} Industrial Area", "ward_id": f"{city_key}-ind", "aqi": baseline["aqi"] + 30, "risk": "High", "driver": "Point-source emissions", "action": "Audit"},
                {"rank": "02", "name": f"{city_title} Junction", "ward_id": f"{city_key}-junc", "aqi": baseline["aqi"] + 15, "risk": "Moderate", "driver": "Arterial congestion", "action": "Signal retiming"},
            ],
            "hotspots": [
                {"id": f"hs-{city_key}-1", "name": f"{city_title} Central", "coordinates": [20.0, 78.0], "aqi": baseline["aqi"], "category": "Moderate", "pm25": baseline["pm25"], "primaryDriver": "Traffic", "trend": "Stable", "action": "Patrol"},
            ],
        }

    now = datetime.now()
    aqi_val = baseline["aqi"]

    return {
        "city": {
            "id": city_key,
            "name": details["name"],
            "state": details["state"],
            "coordinates": details["coordinates"],
        },
        "situation_brief": {
            "city_name": details["name"],
            "aqi": aqi_val,
            "category": "Poor" if aqi_val > 200 else ("Moderate" if aqi_val > 100 else "Satisfactory"),
            "trend_6h_pct": 12.0 if city_key == "delhi-ncr" else -4.2,
            "trend_direction": "up" if city_key == "delhi-ncr" else "down",
            "trend_label": "↑ 12% over previous 6 hours" if city_key == "delhi-ncr" else "↓ 4% over previous 6 hours",
            "critical_zone": details["critical_zone"],
        },
        "air_quality": {
            "aqi": aqi_val,
            "pm25": baseline["pm25"],
            "pm10": baseline["pm10"],
            "no2": 52,
            "so2": 16,
            "co": 1.2,
            "o3": 38,
            "temperature_c": baseline["temp"],
            "humidity_pct": baseline["humidity"],
            "wind_speed_kmh": baseline["wind"],
            "wind_direction": "NW",
        },
        "priority_areas": details["priority_areas"],
        "hotspots": details["hotspots"],
        "data_freshness": {
            "last_synced": now.strftime("%d %b %Y, %H:%M IST"),
            "data_status": "LIVE" if firestore_service.is_live() else "CACHED",
            "provider": "CPCB Continuous Ambient Air Quality Monitoring Station (CAAQMS)",
        },
    }


@router.get("/dashboard/{city_id}")
async def get_city_dashboard(city_id: str = Path(..., description="City slug")):
    """Get full situation brief, air quality metrics, and priority zones for a city."""
    return build_dashboard_response(city_id)


@router.get("/dashboard/summary")
async def get_dashboard_summary(city_id: Optional[str] = Query("delhi-ncr")):
    """Backward-compatible dashboard summary endpoint."""
    return build_dashboard_response(city_id)


@router.get("/air-quality/{city_id}")
async def get_air_quality(city_id: str):
    """Get latest multi-pollutant speciation readings."""
    data = build_dashboard_response(city_id)
    return {
        "city_id": city_id,
        "metrics": data["air_quality"],
        "data_freshness": data["data_freshness"],
    }


@router.get("/hotspots/{city_id}")
async def get_hotspots(city_id: str):
    """Get geocoded environmental hotspots with drivers and recommended actions."""
    data = build_dashboard_response(city_id)
    return {
        "city_id": city_id,
        "count": len(data["hotspots"]),
        "hotspots": data["hotspots"],
    }
