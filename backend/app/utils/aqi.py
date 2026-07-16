from app.core.constants import AQI_BREAKPOINTS, AQI_CATEGORIES


def calculate_aqi(pollutant: str, concentration: float) -> int:
    """Calculate AQI sub-index for a pollutant given its concentration."""
    breakpoints = AQI_BREAKPOINTS.get(pollutant)
    if not breakpoints:
        return 0

    for bp_lo, bp_hi, aqi_lo, aqi_hi in breakpoints:
        if bp_lo <= concentration <= bp_hi:
            return int(((aqi_hi - aqi_lo) / (bp_hi - bp_lo)) * (concentration - bp_lo) + aqi_lo)

    return 500


def get_aqi_category(aqi: int) -> dict:
    """Return category info for a given AQI value."""
    for (low, high), info in AQI_CATEGORIES.items():
        if low <= aqi <= high:
            return {"aqi": aqi, **info}
    return {"aqi": aqi, "label": "Hazardous", "color": "#7e0023", "health_implication": "Emergency conditions."}


def composite_aqi(readings: dict[str, float]) -> int:
    """Compute composite AQI from a dict of pollutant concentrations."""
    sub_indices = {p: calculate_aqi(p, c) for p, c in readings.items() if c is not None}
    return max(sub_indices.values()) if sub_indices else 0
