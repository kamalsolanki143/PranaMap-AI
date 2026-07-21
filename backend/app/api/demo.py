"""Demo data endpoints — returns realistic seed data without DB dependency."""
from datetime import datetime
from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/command-center")
async def command_center():
    """Dashboard summary with live AQI and ward data."""
    return {
        "region": "Delhi NCR / Rohini",
        "live_aqi": 184,
        "live_status": "Poor",
        "ai_insight": "3 wards expected to cross 'Poor' AQI by 6 PM — Source: Construction + Traffic",
        "ai_confidence": 92,
        "forecast_peak_time": "18:00 PM",
        "avg_wind": "12km/h NNW",
        "wards": [
            {"name": "Rohini Sector 7", "sensor_id": "4122-A", "aqi": 214, "status": "Very Poor"},
            {"name": "Pitampura West", "sensor_id": "9021-B", "aqi": 162, "status": "Poor"},
            {"name": "Dwarka Sec-10", "sensor_id": "1255-K", "aqi": 84, "status": "Satisfactory"},
            {"name": "Anand Vihar", "sensor_id": "8821-X", "aqi": 392, "status": "Severe"},
            {"name": "Okhla Ph-3", "sensor_id": "1044-M", "aqi": 245, "status": "Very Poor"},
            {"name": "Punjabi Bagh", "sensor_id": "3301-P", "aqi": 312, "status": "Severe"},
            {"name": "Lodhi Garden", "sensor_id": "7721-L", "aqi": 62, "status": "Satisfactory"},
        ],
    }


@router.get("/forecast/demo")
async def forecast_demo(ward: str = Query("Dwarka Ward 34")):
    """72-hour forecast with confidence intervals."""
    return {
        "ward": ward,
        "generated_at": datetime.utcnow().isoformat(),
        "model_confidence": 94,
        "trend": "Rising",
        "trend_pct": 12,
        "today_avg": 142,
        "tomorrow_predicted": 168,
        "points": [
            {"time": "21:00", "aqi": 110, "pm25": 42, "confidence": 96, "lower": 100, "upper": 120},
            {"time": "00:00", "aqi": 128, "pm25": 51, "confidence": 94, "lower": 115, "upper": 141},
            {"time": "03:00", "aqi": 145, "pm25": 60, "confidence": 93, "lower": 130, "upper": 162},
            {"time": "06:00", "aqi": 162, "pm25": 72, "confidence": 91, "lower": 145, "upper": 180},
            {"time": "09:00", "aqi": 184, "pm25": 84, "confidence": 90, "lower": 164, "upper": 205},
            {"time": "12:00", "aqi": 210, "pm25": 95, "confidence": 88, "lower": 188, "upper": 232},
            {"time": "15:00", "aqi": 248, "pm25": 112, "confidence": 86, "lower": 222, "upper": 275},
            {"time": "18:00", "aqi": 290, "pm25": 135, "confidence": 84, "lower": 258, "upper": 322},
        ],
    }


@router.get("/attribution/demo")
async def attribution_demo(station: str = Query("DL-422")):
    """Source attribution with SHAP-based evidence."""
    return {
        "station": station,
        "ward": "RK Puram Sector 7",
        "current_aqi": 342,
        "analysis_confidence": 94,
        "ai_summary": "High confidence due to wind direction analysis and 3 active construction sites within 2km. Secondary spikes in Biomass Burning observed.",
        "sources": [
            {"source": "Traffic", "impact_pct": 84, "confidence_pct": 96, "icon": "car_tag", "color": "#00f5ff", "tags": ["Wind: NW", "Peak: 08:30 AM"], "evidence": [{"label": "Real-time congestion data from Google Traffic API (Lvl 4)"}, {"label": "Satellite CO detection matches road corridor geometry"}]},
            {"source": "Biomass", "impact_pct": 91, "confidence_pct": 88, "icon": "local_fire_department", "color": "#ffdb3f", "tags": ["Sentinel-5P Overlay", "Thermal Anomalies: 12"], "evidence": [{"label": "High Potassium trace levels detected at DL-422"}]},
            {"source": "Construction", "impact_pct": 72, "confidence_pct": 92, "icon": "construction", "color": "#c1c6d7", "tags": ["3 Active Sites", "PM10/PM2.5 Ratio: 1.8"], "evidence": [{"label": "AI Vision identified un-covered soil at Sites A & B"}]},
            {"source": "Industrial", "impact_pct": 38, "confidence_pct": 64, "icon": "factory", "color": "#849495", "tags": ["SO2 Signal: Low"], "evidence": [{"label": "No thermal anomaly at Wazirpur Industrial Area"}]},
        ],
        "wind_direction": "North-West",
        "wind_speed_kmh": 14.2,
        "nodes_active": 1242,
        "network_latency_ms": 4,
    }


@router.get("/enforcement/demo")
async def enforcement_demo():
    """Priority-ranked enforcement targets."""
    return {
        "total_wards": 272,
        "critical_zones": 12,
        "active_missions": 48,
        "projected_impact_pct": -18.4,
        "wards": [
            {"id": "row-1", "priority": "CRITICAL", "ward": "Anand Vihar (Zone 4)", "uid": "ND-AV-402", "current_aqi": 428, "primary_source": "Industrial Exhaust", "primary_source_icon": "factory", "projected_aqi": 312, "root_cause": "Illegal waste incineration at Site B-12.", "tags": ["Waste Burning", "Heavy Transport"], "actions": [{"label": "Deploy Site Inspection Team (B-12)"}], "department": "NDMC Enforcement Wing", "lead": "Inspector R. Khanna"},
            {"id": "row-2", "priority": "HIGH", "ward": "Punjabi Bagh (Zone 1)", "uid": "ND-PB-115", "current_aqi": 312, "primary_source": "Construction Dust", "primary_source_icon": "construction", "projected_aqi": 245, "root_cause": "3 construction sites without dust suppression.", "tags": ["Fugitive Dust"], "actions": [{"label": "Issue Stop-Work Notice"}], "department": "Delhi PWD", "lead": "Inspector M. Singh"},
            {"id": "row-3", "priority": "MEDIUM", "ward": "Dwarka Sector 8", "uid": "ND-DW-801", "current_aqi": 188, "primary_source": "Vehicular Idling", "primary_source_icon": "directions_car", "projected_aqi": 142, "root_cause": "High vehicular idling near sector market.", "tags": ["Traffic"], "actions": [{"label": "Deploy Traffic Marshals"}], "department": "Delhi Traffic Police", "lead": "SHO S. Kumar"},
            {"id": "row-4", "priority": "LOW", "ward": "Lodhi Garden Area", "uid": "ND-LG-100", "current_aqi": 62, "primary_source": "Leaf Burning", "primary_source_icon": "park", "projected_aqi": 54, "root_cause": "Seasonal leaf burning.", "tags": ["Biomass"], "actions": [{"label": "Issue Advisory to Parks Dept"}], "department": "NDMC Parks Division", "lead": "Supervisor A. Rao"},
        ],
    }


@router.get("/advisory/demo")
async def advisory_demo(lang: str = Query("ENGLISH")):
    """Citizen health advisories with multilingual support."""
    return {
        "total_sms": "1.2M",
        "app_reach": "842K",
        "delivery_rate": 98.2,
        "advisories": [
            {"id": "PRANA-DLI-7729", "ward": "RK Puram, South Delhi", "ref_id": "PRANA-DLI-7729", "aqi": 342, "status": "Very Poor", "updated_ago": "4M AGO", "ai_message": "Predictive models indicate persistent stagnant air in RK Puram for the next 6 hours.", "audience_tags": ["SCHOOLS", "ELDERLY", "HOSPITALS"], "sms_status": "SENT", "app_status": "PENDING"},
            {"id": "PRANA-DLI-8841", "ward": "Okhla Phase III", "ref_id": "PRANA-DLI-8841", "aqi": 184, "status": "Moderate", "updated_ago": "12M AGO", "ai_message": "Slight improvement in air flow detected. Outdoor activities can resume with caution.", "audience_tags": ["CONSTRUCTION", "GENERAL PUBLIC"], "sms_status": "SENT", "app_status": "SENT"},
            {"id": "PRANA-DLI-4412", "ward": "Dwarka Sector 10", "ref_id": "PRANA-DLI-4412", "aqi": 412, "status": "Severe", "updated_ago": "1M AGO", "ai_message": "Critical pollution spike. Immediate GRAP IV measures recommended.", "audience_tags": ["URGENT", "ALL CITIZENS"], "sms_status": "QUEUED", "app_status": "QUEUED"},
        ],
        "log": [
            {"type": "ADVISORY BROADCAST", "ward": "Noida Sector 62", "message": "Severe AQI Alert Sent", "time": "14:22:10 IST", "result": "SUCCESS", "color": "primary-container"},
            {"type": "SYSTEM NOTICE", "ward": "System", "message": "Bengali Translation Applied", "time": "13:45:05 IST", "result": "SUCCESS", "color": "tertiary-container"},
            {"type": "FAILURE RETRY", "ward": "Ward 22", "message": "SMS Gateway Timeout", "time": "13:12:44 IST", "result": "RETRIED", "color": "error"},
        ],
    }
