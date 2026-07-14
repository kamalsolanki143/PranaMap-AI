#!/usr/bin/env python3
"""
PranaMap AI - Dataset Download Script

Downloads datasets from multiple sources:
- CPCB AQI historical data
- NASA FIRMS fire/hotspot data
- OpenStreetMap road network for Pune
- Weather historical data
"""

import asyncio
import logging
import os
from datetime import datetime, timedelta
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIRS = {
    "weather": ROOT_DIR / "data_pipeline" / "weather",
    "aqi": ROOT_DIR / "data_pipeline" / "aqi",
    "satellite": ROOT_DIR / "data_pipeline" / "satellite",
    "nasa_firms": ROOT_DIR / "data_pipeline" / "nasa_firms",
    "osm": ROOT_DIR / "data_pipeline" / "osm",
}

# Pune bounding box
PUNE_BBOX = {"lat_min": 18.40, "lat_max": 18.68, "lon_min": 73.72, "lon_max": 74.00}


def ensure_dirs():
    for d in DATA_DIRS.values():
        d.mkdir(parents=True, exist_ok=True)


async def download_cpcb_aqi(client: httpx.AsyncClient) -> None:
    """Download historical AQI data from CPCB / WAQI API."""
    api_key = os.getenv("WAQI_API_KEY", "demo")
    output_file = DATA_DIRS["aqi"] / "pune_aqi_latest.json"

    stations = [
        ("@1568", "Kothrud"),
        ("@1569", "Hadapsar"),
        ("@1570", "Pimpri"),
        ("@1571", "Shivajinagar"),
        ("@1572", "Viman Nagar"),
    ]

    results = []
    for station_id, name in stations:
        url = f"https://api.waqi.info/feed/{station_id}/?token={api_key}"
        try:
            resp = await client.get(url, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "ok":
                    results.append({"station": name, "data": data["data"]})
                    logger.info(f"  Downloaded AQI for {name}")
            else:
                logger.warning(f"  Failed to download AQI for {name}: HTTP {resp.status_code}")
        except Exception as e:
            logger.error(f"  Error downloading AQI for {name}: {e}")

    import json
    output_file.write_text(json.dumps(results, indent=2, default=str))
    logger.info(f"  Saved {len(results)} station readings to {output_file}")


async def download_nasa_firms(client: httpx.AsyncClient) -> None:
    """Download active fire data from NASA FIRMS."""
    api_key = os.getenv("NASA_FIRMS_API_KEY", "DEMO_KEY")
    output_file = DATA_DIRS["nasa_firms"] / "pune_firms_latest.csv"

    today = datetime.utcnow()
    start_date = (today - timedelta(days=7)).strftime("%Y-%m-%d")
    end_date = today.strftime("%Y-%m-%d")

    bbox = f"{PUNE_BBOX['lon_min']},{PUNE_BBOX['lat_min']},{PUNE_BBOX['lon_max']},{PUNE_BBOX['lat_max']}"
    url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{api_key}/VIIRS_SNPP_NRT/{bbox}/1/2024-01-01"

    try:
        resp = await client.get(url, timeout=60)
        if resp.status_code == 200:
            output_file.write_text(resp.text)
            lines = resp.text.strip().split("\n")
            logger.info(f"  Downloaded {len(lines) - 1} fire records to {output_file}")
        else:
            logger.warning(f"  FIRMS download failed: HTTP {resp.status_code}")
    except Exception as e:
        logger.error(f"  Error downloading FIRMS data: {e}")


async def download_osm_data(client: httpx.AsyncClient) -> None:
    """Download road network from OpenStreetMap Overpass API."""
    output_file = DATA_DIRS["osm"] / "pune_roads.json"

    query = f"""
    [out:json][timeout:120];
    (
      way["highway"]({PUNE_BBOX['lat_min']},{PUNE_BBOX['lon_min']},{PUNE_BBOX['lat_max']},{PUNE_BBOX['lon_max']});
    );
    out body;
    >;
    out skel qt;
    """

    url = "https://overpass-api.de/api/interpreter"
    try:
        resp = await client.post(url, data={"data": query}, timeout=180)
        if resp.status_code == 200:
            output_file.write_text(resp.text)
            logger.info(f"  Downloaded OSM road data to {output_file}")
        else:
            logger.warning(f"  OSM download failed: HTTP {resp.status_code}")
    except Exception as e:
        logger.error(f"  Error downloading OSM data: {e}")


async def download_weather(client: httpx.AsyncClient) -> None:
    """Download weather forecast data from OpenWeatherMap."""
    api_key = os.getenv("OPENWEATHER_API_KEY", "")
    output_file = DATA_DIRS["weather"] / "pune_weather_latest.json"

    if not api_key:
        logger.warning("  OPENWEATHER_API_KEY not set - skipping weather download")
        return

    locations = [
        ("Pune Kothrud", 18.515, 73.815),
        ("Pune Hadapsar", 18.515, 73.945),
        ("Pune Pimpri", 18.620, 73.800),
    ]

    import json
    results = []
    for name, lat, lon in locations:
        url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        try:
            resp = await client.get(url, timeout=30)
            if resp.status_code == 200:
                results.append({"location": name, "data": resp.json()})
                logger.info(f"  Downloaded weather for {name}")
        except Exception as e:
            logger.error(f"  Error downloading weather for {name}: {e}")

    output_file.write_text(json.dumps(results, indent=2, default=str))
    logger.info(f"  Saved weather data for {len(results)} locations")


async def main():
    logger.info("PranaMap AI - Dataset Download")
    logger.info("=" * 50)

    ensure_dirs()

    async with httpx.AsyncClient() as client:
        await asyncio.gather(
            download_cpcb_aqi(client),
            download_nasa_firms(client),
            download_osm_data(client),
            download_weather(client),
        )

    logger.info("=" * 50)
    logger.info("Download complete. Check data_pipeline/ directories.")


if __name__ == "__main__":
    asyncio.run(main())
