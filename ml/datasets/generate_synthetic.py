#!/usr/bin/env python3
"""
PranaMap AI — Synthetic Data Generator for Pune

Generates semi-realistic AQI, weather, fire hotspot, and geospatial data
for 15 Pune wards over 1 year at hourly resolution.

Patterns modeled:
- Seasonal: winter peaks (Nov-Jan), monsoon washout (Jun-Sep), summer moderate
- Diurnal: rush-hour spikes (8-9AM, 6-8PM), early morning inversions
- Correlations: PM2.5 ↔ traffic, AQI ↔ 1/wind_speed, humidity ↔ monsoon
- Events: Diwali spike (~Oct/Nov), crop burning (Oct-Nov)

Usage:
    python ml/datasets/generate_synthetic.py [--output-dir ml/datasets] [--seed 42]
"""

from __future__ import annotations

import argparse
import logging
import os
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ─── Ward Configuration ──────────────────────────────────────────────────────

PUNE_WARDS = {
    "Kothrud": {"lat": 18.5074, "lon": 73.8077, "road_density": 7.2, "industrial_proximity": 12.0, "population_density": 15000, "traffic_base": 0.7, "industrial_poi_count": 3},
    "Hadapsar": {"lat": 18.5089, "lon": 73.9260, "road_density": 6.8, "industrial_proximity": 5.0, "population_density": 18000, "traffic_base": 0.8, "industrial_poi_count": 8},
    "Pimpri-Chinchwad": {"lat": 18.6298, "lon": 73.7997, "road_density": 8.5, "industrial_proximity": 2.0, "population_density": 20000, "traffic_base": 0.9, "industrial_poi_count": 15},
    "Shivajinagar": {"lat": 18.5308, "lon": 73.8475, "road_density": 9.0, "industrial_proximity": 15.0, "population_density": 22000, "traffic_base": 0.85, "industrial_poi_count": 2},
    "Viman Nagar": {"lat": 18.5679, "lon": 73.9143, "road_density": 6.5, "industrial_proximity": 8.0, "population_density": 14000, "traffic_base": 0.65, "industrial_poi_count": 4},
    "Katraj": {"lat": 18.4529, "lon": 73.8652, "road_density": 5.5, "industrial_proximity": 6.0, "population_density": 12000, "traffic_base": 0.6, "industrial_poi_count": 5},
    "Hinjewadi": {"lat": 18.5912, "lon": 73.7390, "road_density": 7.0, "industrial_proximity": 10.0, "population_density": 10000, "traffic_base": 0.75, "industrial_poi_count": 2},
    "Kondhwa": {"lat": 18.4683, "lon": 73.8950, "road_density": 5.8, "industrial_proximity": 7.5, "population_density": 13000, "traffic_base": 0.55, "industrial_poi_count": 4},
    "Baner": {"lat": 18.5590, "lon": 73.7868, "road_density": 6.2, "industrial_proximity": 11.0, "population_density": 11000, "traffic_base": 0.6, "industrial_poi_count": 2},
    "Aundh": {"lat": 18.5580, "lon": 73.8077, "road_density": 6.8, "industrial_proximity": 13.0, "population_density": 13500, "traffic_base": 0.65, "industrial_poi_count": 3},
    "Wanowrie": {"lat": 18.4875, "lon": 73.8936, "road_density": 6.0, "industrial_proximity": 4.5, "population_density": 16000, "traffic_base": 0.7, "industrial_poi_count": 6},
    "Swargate": {"lat": 18.5018, "lon": 73.8636, "road_density": 9.5, "industrial_proximity": 9.0, "population_density": 25000, "traffic_base": 0.95, "industrial_poi_count": 5},
    "Deccan": {"lat": 18.5168, "lon": 73.8414, "road_density": 8.8, "industrial_proximity": 14.0, "population_density": 20000, "traffic_base": 0.8, "industrial_poi_count": 2},
    "Koregaon Park": {"lat": 18.5362, "lon": 73.8930, "road_density": 6.0, "industrial_proximity": 12.0, "population_density": 9000, "traffic_base": 0.5, "industrial_poi_count": 1},
    "Wakad": {"lat": 18.5981, "lon": 73.7630, "road_density": 6.5, "industrial_proximity": 9.0, "population_density": 12000, "traffic_base": 0.7, "industrial_poi_count": 3},
}

# Diwali dates (approximate) for synthetic events
DIWALI_DATE = datetime(2024, 11, 1)


class PuneSyntheticGenerator:
    """Generate semi-realistic synthetic environmental data for Pune.

    Produces hourly AQI readings, weather observations, fire hotspot data,
    and static geospatial features for 15 Pune wards over 1 year.

    Attributes:
        start_date: Beginning of the synthetic time range.
        end_date: End of the synthetic time range.
        seed: Random seed for reproducibility.
    """

    def __init__(
        self,
        start_date: str = "2024-01-01",
        end_date: str = "2024-12-31",
        seed: int = 42,
    ) -> None:
        self.start_date = pd.Timestamp(start_date)
        self.end_date = pd.Timestamp(end_date)
        self.seed = seed
        self.rng = np.random.default_rng(seed)
        self.timestamps = pd.date_range(self.start_date, self.end_date, freq="h")
        self.n_hours = len(self.timestamps)
        logger.info(
            "Generator initialized: %s to %s (%d hours, %d wards)",
            start_date, end_date, self.n_hours, len(PUNE_WARDS),
        )

    def generate_all(self) -> pd.DataFrame:
        """Generate complete synthetic dataset for all wards.

        Returns:
            DataFrame with all features, one row per ward per hour.
        """
        all_records = []
        for ward_name, ward_config in PUNE_WARDS.items():
            logger.info("  Generating data for %s...", ward_name)
            ward_df = self._generate_ward(ward_name, ward_config)
            all_records.append(ward_df)

        df = pd.concat(all_records, ignore_index=True)
        df = df.sort_values(["recorded_at", "ward_name"]).reset_index(drop=True)
        logger.info("Generated %d total records", len(df))
        return df

    def _generate_ward(self, ward_name: str, config: dict) -> pd.DataFrame:
        """Generate hourly data for a single ward.

        Args:
            ward_name: Name of the ward.
            config: Ward-specific configuration dict.

        Returns:
            DataFrame with all features for this ward.
        """
        n = self.n_hours
        hours = np.array([ts.hour for ts in self.timestamps])
        months = np.array([ts.month for ts in self.timestamps])
        day_of_week = np.array([ts.dayofweek for ts in self.timestamps])
        day_of_year = np.array([ts.dayofyear for ts in self.timestamps])

        # ── Weather Generation ──────────────────────────────────────────────
        temperature = self._generate_temperature(months, hours)
        humidity = self._generate_humidity(months, hours)
        wind_speed = self._generate_wind_speed(months, hours)
        wind_direction = self.rng.uniform(0, 360, n)
        pressure = 1010 + 5 * np.sin(2 * np.pi * day_of_year / 365) + self.rng.normal(0, 2, n)

        # ── AQI & Pollutant Generation ──────────────────────────────────────
        base_aqi = self._generate_base_aqi(months, hours, day_of_week, config)

        # Add wind suppression effect (low wind → higher AQI)
        wind_effect = np.clip(5.0 / (wind_speed + 0.5), 0, 3.0)
        base_aqi *= wind_effect

        # Add temperature inversion effect (early morning, cold + calm)
        inversion_mask = (hours >= 4) & (hours <= 7) & (temperature < 20)
        base_aqi[inversion_mask] *= 1.3

        # Diwali spike
        base_aqi = self._add_diwali_spike(base_aqi)

        # Clip and add noise
        aqi_value = np.clip(base_aqi + self.rng.normal(0, 8, n), 0, 500).astype(int)

        # Generate correlated pollutants
        pm25 = self._aqi_to_pm25(aqi_value)
        pm10 = pm25 * self.rng.uniform(1.4, 2.0, n)
        no2 = 10 + aqi_value * 0.15 + self.rng.normal(0, 5, n)
        so2 = 5 + aqi_value * 0.05 + self.rng.normal(0, 2, n)
        co = 0.3 + aqi_value * 0.005 + self.rng.normal(0, 0.1, n)
        o3 = np.clip(30 + 20 * np.sin(2 * np.pi * hours / 24 - np.pi / 3) - aqi_value * 0.05 + self.rng.normal(0, 5, n), 0, 150)

        # ── Fire Hotspot Data ───────────────────────────────────────────────
        fire_count, total_frp = self._generate_fire_data(months, day_of_year)

        # ── Traffic Index ───────────────────────────────────────────────────
        traffic_index = self._generate_traffic(hours, day_of_week, config["traffic_base"])

        # ── Satellite Proxies ───────────────────────────────────────────────
        mean_ndvi = self._generate_ndvi(months)
        mean_aod = np.clip(aqi_value / 400 + self.rng.normal(0, 0.05, n), 0.05, 1.0)

        # ── Assemble DataFrame ──────────────────────────────────────────────
        df = pd.DataFrame({
            "recorded_at": self.timestamps,
            "ward_name": ward_name,
            "ward_id": list(PUNE_WARDS.keys()).index(ward_name) + 1,
            "station_id": f"PUNE_{ward_name.upper().replace('-', '_').replace(' ', '_')}",
            "latitude": config["lat"],
            "longitude": config["lon"],
            "aqi_value": aqi_value,
            "pm25": np.clip(pm25, 0, None).round(2),
            "pm10": np.clip(pm10, 0, None).round(2),
            "no2": np.clip(no2, 0, None).round(2),
            "so2": np.clip(so2, 0, None).round(2),
            "co": np.clip(co, 0, None).round(4),
            "o3": np.clip(o3, 0, None).round(2),
            "temperature_c": temperature.round(2),
            "humidity_pct": humidity.round(2),
            "wind_speed_kph": wind_speed.round(2),
            "wind_dir_deg": wind_direction.round(1),
            "pressure_hpa": pressure.round(2),
            "traffic_index": traffic_index.round(3),
            "fire_count": fire_count,
            "total_frp": total_frp.round(2),
            "mean_ndvi": mean_ndvi.round(4),
            "mean_aod": mean_aod.round(4),
            "road_density": config["road_density"],
            "industrial_proximity": config["industrial_proximity"],
            "population_density": config["population_density"],
            "industrial_poi_count": config["industrial_poi_count"],
        })

        return df

    def _generate_temperature(self, months: np.ndarray, hours: np.ndarray) -> np.ndarray:
        """Generate realistic Pune temperature (18-42°C).

        Pune climate: hot pre-monsoon (Mar-May), moderate monsoon (Jun-Sep),
        cool winter (Nov-Feb).
        """
        n = len(months)
        # Seasonal base: peaks in April-May (~38°C), lowest in Dec-Jan (~20°C)
        seasonal = 28 + 10 * np.sin(2 * np.pi * (months - 4) / 12)
        # Diurnal: peaks at 2-3PM, lowest at 5-6AM
        diurnal = 5 * np.sin(2 * np.pi * (hours - 6) / 24)
        # Monsoon cooling
        monsoon_mask = (months >= 6) & (months <= 9)
        seasonal[monsoon_mask] -= 5
        return seasonal + diurnal + self.rng.normal(0, 1.5, n)

    def _generate_humidity(self, months: np.ndarray, hours: np.ndarray) -> np.ndarray:
        """Generate humidity (30-95%). High during monsoon, low in summer."""
        n = len(months)
        base = 55 + 25 * np.sin(2 * np.pi * (months - 3) / 12)  # peaks Jul-Aug
        diurnal = -10 * np.sin(2 * np.pi * (hours - 6) / 24)  # lower midday
        return np.clip(base + diurnal + self.rng.normal(0, 5, n), 25, 98)

    def _generate_wind_speed(self, months: np.ndarray, hours: np.ndarray) -> np.ndarray:
        """Generate wind speed (1-20 kph). Higher during monsoon, lower winter mornings."""
        n = len(months)
        seasonal = 6 + 4 * np.sin(2 * np.pi * (months - 3) / 12)  # peaks during monsoon
        diurnal = 2 * np.sin(2 * np.pi * (hours - 6) / 24)  # peaks afternoon
        # Winter calm mornings
        winter_morning = (months <= 2) | (months >= 11)
        early_morning = (hours >= 4) & (hours <= 8)
        calm = winter_morning & early_morning
        result = seasonal + diurnal + self.rng.normal(0, 1.5, n)
        result[calm] *= 0.4
        return np.clip(result, 0.5, 25)

    def _generate_base_aqi(
        self,
        months: np.ndarray,
        hours: np.ndarray,
        day_of_week: np.ndarray,
        config: dict,
    ) -> np.ndarray:
        """Generate base AQI with seasonal, diurnal, and traffic patterns.

        Winter (Nov-Jan): mean ~150-200
        Summer (Mar-May): mean ~80-100
        Monsoon (Jun-Sep): mean ~50-70
        """
        n = len(months)

        # Seasonal component
        # Model as piecewise: low monsoon, rising post-monsoon, peak winter, declining summer
        seasonal = np.zeros(n)
        for i, m in enumerate(months):
            if m in (11, 12, 1):  # Winter — worst air quality
                seasonal[i] = 160 + self.rng.normal(0, 15)
            elif m in (2, 10):  # Transition
                seasonal[i] = 120 + self.rng.normal(0, 12)
            elif m in (3, 4, 5):  # Summer — moderate
                seasonal[i] = 90 + self.rng.normal(0, 10)
            else:  # Monsoon (Jun-Sep) — cleanest
                seasonal[i] = 55 + self.rng.normal(0, 8)

        # Diurnal traffic pattern: morning rush (7-10AM), evening rush (5-9PM)
        traffic_mult = config["traffic_base"]
        diurnal = np.zeros(n)
        for i, h in enumerate(hours):
            if 7 <= h <= 10:
                diurnal[i] = 20 * traffic_mult
            elif 17 <= h <= 21:
                diurnal[i] = 25 * traffic_mult
            elif 0 <= h <= 5:
                diurnal[i] = -15  # Nighttime low
            else:
                diurnal[i] = 5 * traffic_mult

        # Weekend effect (slightly lower traffic)
        weekend_mask = day_of_week >= 5
        diurnal[weekend_mask] *= 0.7

        # Industrial contribution
        industrial_effect = (20 - config["industrial_proximity"]) * 1.5
        industrial_effect = max(industrial_effect, 0)

        return seasonal + diurnal + industrial_effect

    def _add_diwali_spike(self, aqi: np.ndarray) -> np.ndarray:
        """Add Diwali AQI spike (±2 days around Diwali date)."""
        diwali_start = (DIWALI_DATE - self.start_date.to_pydatetime()).days * 24
        diwali_end = diwali_start + 72  # 3 days of elevated AQI

        if 0 <= diwali_start < len(aqi):
            end_idx = min(diwali_end, len(aqi))
            # Spike profile: ramp up, peak, slow decay
            spike_hours = end_idx - diwali_start
            spike = np.zeros(spike_hours)
            peak_hour = spike_hours // 3
            for i in range(spike_hours):
                if i < peak_hour:
                    spike[i] = 150 * (i / peak_hour)
                else:
                    spike[i] = 150 * np.exp(-(i - peak_hour) / 20)
            aqi[diwali_start:end_idx] += spike

        return aqi

    def _aqi_to_pm25(self, aqi: np.ndarray) -> np.ndarray:
        """Convert AQI to approximate PM2.5 (µg/m³) using Indian AQI breakpoints."""
        pm25 = np.zeros_like(aqi, dtype=float)
        for i, a in enumerate(aqi):
            if a <= 50:
                pm25[i] = a * 30 / 50
            elif a <= 100:
                pm25[i] = 30 + (a - 50) * 30 / 50
            elif a <= 200:
                pm25[i] = 60 + (a - 100) * 60 / 100
            elif a <= 300:
                pm25[i] = 120 + (a - 200) * 130 / 100
            else:
                pm25[i] = 250 + (a - 300) * 130 / 200
        return pm25 + self.rng.normal(0, 3, len(aqi))

    def _generate_fire_data(
        self,
        months: np.ndarray,
        day_of_year: np.ndarray,
    ) -> tuple[np.ndarray, np.ndarray]:
        """Generate fire hotspot data. Elevated Oct-Nov (crop burning season)."""
        n = len(months)
        fire_count = np.zeros(n, dtype=int)
        total_frp = np.zeros(n)

        for i in range(n):
            if months[i] in (10, 11):  # Crop burning season
                if self.rng.random() < 0.15:  # 15% chance per hour
                    fire_count[i] = self.rng.integers(1, 8)
                    total_frp[i] = fire_count[i] * self.rng.uniform(5, 25)
            elif months[i] in (3, 4, 5):  # Hot summer — occasional fires
                if self.rng.random() < 0.03:
                    fire_count[i] = self.rng.integers(1, 3)
                    total_frp[i] = fire_count[i] * self.rng.uniform(3, 15)
            else:  # Rare fires other months
                if self.rng.random() < 0.005:
                    fire_count[i] = 1
                    total_frp[i] = self.rng.uniform(2, 10)

        return fire_count, total_frp

    def _generate_traffic(
        self,
        hours: np.ndarray,
        day_of_week: np.ndarray,
        traffic_base: float,
    ) -> np.ndarray:
        """Generate traffic index (0-1) with rush hour peaks."""
        n = len(hours)
        traffic = np.zeros(n)

        for i in range(n):
            h = hours[i]
            if 7 <= h <= 10:
                traffic[i] = traffic_base * self.rng.uniform(0.7, 1.0)
            elif 17 <= h <= 21:
                traffic[i] = traffic_base * self.rng.uniform(0.8, 1.0)
            elif 11 <= h <= 16:
                traffic[i] = traffic_base * self.rng.uniform(0.4, 0.6)
            elif 22 <= h or h <= 5:
                traffic[i] = traffic_base * self.rng.uniform(0.05, 0.2)
            else:
                traffic[i] = traffic_base * self.rng.uniform(0.3, 0.5)

            # Weekend reduction
            if day_of_week[i] >= 5:
                traffic[i] *= 0.6

        return traffic

    def _generate_ndvi(self, months: np.ndarray) -> np.ndarray:
        """Generate NDVI (vegetation index). High monsoon, low summer."""
        n = len(months)
        base_ndvi = np.zeros(n)
        for i, m in enumerate(months):
            if m in (7, 8, 9):  # Monsoon — lush green
                base_ndvi[i] = 0.6 + self.rng.normal(0, 0.05)
            elif m in (10, 11):  # Post-monsoon
                base_ndvi[i] = 0.45 + self.rng.normal(0, 0.05)
            elif m in (3, 4, 5):  # Summer — dry
                base_ndvi[i] = 0.2 + self.rng.normal(0, 0.04)
            else:  # Winter
                base_ndvi[i] = 0.35 + self.rng.normal(0, 0.04)
        return np.clip(base_ndvi, 0.05, 0.85)


def split_train_test(df: pd.DataFrame, test_months: int = 2) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Split data temporally — last N months as test set.

    Args:
        df: Full dataset sorted by time.
        test_months: Number of months to hold out for testing.

    Returns:
        Tuple of (train_df, test_df).
    """
    cutoff = df["recorded_at"].max() - pd.Timedelta(days=test_months * 30)
    train = df[df["recorded_at"] <= cutoff].copy()
    test = df[df["recorded_at"] > cutoff].copy()
    return train, test


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic Pune AQI data")
    parser.add_argument("--output-dir", type=str, default=None, help="Output directory for CSVs")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--start-date", type=str, default="2024-01-01", help="Start date")
    parser.add_argument("--end-date", type=str, default="2024-12-31", help="End date")
    args = parser.parse_args()

    output_dir = Path(args.output_dir) if args.output_dir else Path(__file__).parent
    output_dir.mkdir(parents=True, exist_ok=True)

    generator = PuneSyntheticGenerator(
        start_date=args.start_date,
        end_date=args.end_date,
        seed=args.seed,
    )

    logger.info("Generating synthetic data...")
    df = generator.generate_all()

    # Split into train/test
    train_df, test_df = split_train_test(df, test_months=2)

    # Save outputs
    train_path = output_dir / "pune_aqi_train.csv"
    test_path = output_dir / "pune_aqi_test.csv"
    full_path = output_dir / "pune_aqi_full.csv"

    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)
    df.to_csv(full_path, index=False)

    logger.info("=" * 60)
    logger.info("Synthetic Data Generation Complete")
    logger.info("=" * 60)
    logger.info("  Total records: %d", len(df))
    logger.info("  Train records: %d (%s to %s)", len(train_df),
                train_df["recorded_at"].min(), train_df["recorded_at"].max())
    logger.info("  Test records:  %d (%s to %s)", len(test_df),
                test_df["recorded_at"].min(), test_df["recorded_at"].max())
    logger.info("  Wards: %d", df["ward_name"].nunique())
    logger.info("  AQI range: %d - %d (mean: %.1f)", df["aqi_value"].min(),
                df["aqi_value"].max(), df["aqi_value"].mean())
    logger.info("  Output: %s", output_dir)
    logger.info("=" * 60)

    # Print seasonal summary
    logger.info("\nSeasonal AQI Summary:")
    season_map = {1: "Winter", 2: "Winter", 3: "Summer", 4: "Summer", 5: "Summer",
                  6: "Monsoon", 7: "Monsoon", 8: "Monsoon", 9: "Monsoon",
                  10: "Post-Monsoon", 11: "Winter", 12: "Winter"}
    df["season"] = df["recorded_at"].dt.month.map(season_map)
    for season in ["Winter", "Summer", "Monsoon", "Post-Monsoon"]:
        subset = df[df["season"] == season]
        logger.info("  %s: mean=%.1f, std=%.1f, min=%d, max=%d",
                    season, subset["aqi_value"].mean(), subset["aqi_value"].std(),
                    subset["aqi_value"].min(), subset["aqi_value"].max())


if __name__ == "__main__":
    main()
