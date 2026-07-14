"""Helper functions used across the agent modules."""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


def get_env_or_default(key: str, default: str = "") -> str:
    """Get an environment variable with a default fallback.

    Args:
        key: Environment variable name.
        default: Default value if not set.

    Returns:
        Environment variable value or default.
    """
    return os.environ.get(key, default)


def ensure_dir(path: str | Path) -> Path:
    """Create a directory if it does not exist.

    Args:
        path: Directory path.

    Returns:
        Path object of the created/existing directory.
    """
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p


def flatten_dict(d: dict[str, Any], parent_key: str = "", sep: str = ".") -> dict[str, Any]:
    """Flatten a nested dictionary into dot-notation keys.

    Args:
        d: Input dictionary.
        parent_key: Prefix for nested keys.
        sep: Separator between key levels.

    Returns:
        Flattened dictionary.
    """
    items: list[tuple[str, Any]] = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


def unflatten_dict(d: dict[str, Any], sep: str = ".") -> dict[str, Any]:
    """Convert a dot-notation dictionary back to nested form.

    Args:
        d: Flattened dictionary with dot-separated keys.
        sep: Separator used in keys.

    Returns:
        Nested dictionary.
    """
    result: dict[str, Any] = {}
    for key, value in d.items():
        parts = key.split(sep)
        current = result
        for part in parts[:-1]:
            current = current.setdefault(part, {})
        current[parts[-1]] = value
    return result


def compute_aqi_iaqi(
    pollutant_concentration: float,
    breakpoint_low: float,
    breakpoint_high: float,
    aqi_low: int,
    aqi_high: int,
) -> float:
    """Compute individual AQI (IAQI) using breakpoint interpolation.

    Args:
        pollutant_concentration: Measured concentration.
        breakpoint_low: Lower breakpoint concentration.
        breakpoint_high: Upper breakpoint concentration.
        aqi_low: Lower AQI breakpoint.
        aqi_high: Upper AQI breakpoint.

    Returns:
        Computed IAQI value.
    """
    if breakpoint_high == breakpoint_low:
        return float(aqi_low)

    iaqi = ((aqi_high - aqi_low) / (breakpoint_high - breakpoint_low)) * (
        pollutant_concentration - breakpoint_low
    ) + aqi_low
    return round(iaqi, 1)


def classify_wind_direction(degrees: float) -> str:
    """Convert wind degrees to cardinal direction.

    Args:
        degrees: Wind direction in degrees (0-360).

    Returns:
        Cardinal direction string.
    """
    directions = [
        "N", "NNE", "NE", "ENE",
        "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW",
        "W", "WNW", "NW", "NNW",
    ]
    idx = round(degrees / 22.5) % 16
    return directions[idx]


def merge_dicts(base: dict[str, Any], override: dict[str, Any]) -> dict[str, Any]:
    """Deep-merge two dictionaries, with override taking precedence.

    Args:
        base: Base dictionary.
        override: Override dictionary.

    Returns:
        Merged dictionary.
    """
    result = dict(base)
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge_dicts(result[key], value)
        else:
            result[key] = value
    return result


def setup_logging(level: str = "INFO", log_file: str | None = None) -> None:
    """Configure application logging.

    Args:
        level: Logging level string.
        log_file: Optional file path for log output.
    """
    handlers: list[logging.Handler] = [logging.StreamHandler()]
    if log_file:
        handlers.append(logging.FileHandler(log_file))

    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
        handlers=handlers,
    )
