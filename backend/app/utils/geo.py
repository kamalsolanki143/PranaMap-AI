from typing import Optional


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two points in km."""
    import math
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def ward_centroid(geom_wkt: str) -> Optional[tuple[float, float]]:
    """Extract centroid from a WKT geometry string."""
    # TODO: Use GeoAlchemy2 / Shapely for proper geometry parsing
    return None


def buffer_point(lat: float, lon: float, radius_km: float) -> str:
    """Create a WKT buffer around a point."""
    # TODO: Use Shapely to create a proper buffer polygon
    return f"POINT({lon} {lat})"
