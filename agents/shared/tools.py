"""Common tools and utilities shared across agents."""

from __future__ import annotations

import hashlib
import json
import logging
import re
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)


def aqi_category(aqi_value: int) -> str:
    """Classify AQI value into category label.

    Follows the Indian NAQI standard.

    Args:
        aqi_value: Numeric AQI reading.

    Returns:
        Category string.
    """
    if aqi_value <= 50:
        return "good"
    elif aqi_value <= 100:
        return "moderate"
    elif aqi_value <= 150:
        return "unhealthy_for_sensitive"
    elif aqi_value <= 200:
        return "unhealthy"
    elif aqi_value <= 300:
        return "very_unhealthy"
    else:
        return "hazardous"


def aqi_to_color(aqi_value: int) -> str:
    """Map AQI value to display color.

    Args:
        aqi_value: Numeric AQI.

    Returns:
        Color hex code.
    """
    if aqi_value <= 50:
        return "#00e400"
    elif aqi_value <= 100:
        return "#ffff00"
    elif aqi_value <= 150:
        return "#ff7e00"
    elif aqi_value <= 200:
        return "#ff0000"
    elif aqi_value <= 300:
        return "#8f3f97"
    else:
        return "#7e0023"


def generate_run_id(region: str) -> str:
    """Generate a deterministic run ID from region and current time.

    Args:
        region: Region name.

    Returns:
        SHA-256 based run identifier.
    """
    raw = f"{region}:{datetime.now(timezone.utc).isoformat()}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def safe_json_loads(text: str, default: Any = None) -> Any:
    """Safely parse JSON string with fallback.

    Args:
        text: JSON string.
        default: Default value on parse failure.

    Returns:
        Parsed data or default.
    """
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return default


def sanitize_filename(name: str) -> str:
    """Sanitize a string for safe use as a filename.

    Args:
        name: Raw filename string.

    Returns:
        Sanitized filename.
    """
    name = re.sub(r'[<>:"/\\|?*]', "_", name)
    name = re.sub(r"\s+", "_", name)
    return name[:200]


def haversine_distance(
    lat1: float, lon1: float, lat2: float, lon2: float,
) -> float:
    """Calculate haversine distance between two points in km.

    Args:
        lat1: Latitude of point 1.
        lon1: Longitude of point 1.
        lat2: Latitude of point 2.
        lon2: Longitude of point 2.

    Returns:
        Distance in kilometers.
    """
    import math

    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def format_timestamp(dt: datetime | None = None, fmt: str = "%Y-%m-%dT%H:%M:%SZ") -> str:
    """Format a datetime as ISO-8601 string.

    Args:
        dt: Datetime to format; defaults to current UTC time.
        fmt: strftime format string.

    Returns:
        Formatted timestamp string.
    """
    if dt is None:
        dt = datetime.now(timezone.utc)
    return dt.strftime(fmt)


def chunk_list(lst: list[Any], chunk_size: int) -> list[list[Any]]:
    """Split a list into fixed-size chunks.

    Args:
        lst: Input list.
        chunk_size: Maximum chunk size.

    Returns:
        List of chunks.
    """
    return [lst[i : i + chunk_size] for i in range(0, len(lst), chunk_size)]
