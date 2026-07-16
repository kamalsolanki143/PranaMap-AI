# PranaMap AI — Database Schema

**Database:** PostgreSQL 15 with PostGIS 3.3

All spatial columns use the `GEOMETRY` type with SRID 4326 (WGS 84). Extensions required:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_raster;
```

---

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   stations   │───┐   │   aqi_readings   │       │    forecasts     │
└──────────────┘   │   └──────────────────┘       └──────────────────┘
                   │            │                          │
                   │            ▼                          ▼
                   │   ┌──────────────────┐       ┌──────────────────┐
                   │   │  attributions    │       │ forecast_models  │
                   │   └──────────────────┘       └──────────────────┘
                   │
                   │   ┌──────────────────┐       ┌──────────────────┐
                   └──▶│    wards         │──────▶│  violations      │
                       └──────────────────┘       └──────────────────┘
                                │
                       ┌──────────────────┐
                       │   populations    │
                       └──────────────────┘
```

---

## Tables

### `stations`

Monitoring station metadata.

```sql
CREATE TABLE stations (
    station_id     VARCHAR(20) PRIMARY KEY,
    name           VARCHAR(200) NOT NULL,
    city           VARCHAR(100) NOT NULL,
    state          VARCHAR(100) NOT NULL,
    station_type   VARCHAR(50) NOT NULL CHECK (station_type IN ('reference', 'supplementary', 'low-cost')),
    latitude       DOUBLE PRECISION NOT NULL,
    longitude      DOUBLE PRECISION NOT NULL,
    geom           GEOMETRY(Point, 4326) NOT NULL,
    installed_date DATE,
    active         BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stations_geom ON stations USING GIST (geom);
CREATE INDEX idx_stations_city ON stations (city);
```

### `aqi_readings`

Raw and processed AQI readings at 15-minute intervals.

```sql
CREATE TABLE aqi_readings (
    reading_id     BIGSERIAL PRIMARY KEY,
    station_id     VARCHAR(20) NOT NULL REFERENCES stations(station_id),
    recorded_at    TIMESTAMPTZ NOT NULL,
    aqi            INTEGER NOT NULL CHECK (aqi BETWEEN 0 AND 500),
    category       VARCHAR(50) NOT NULL,
    dominant_pollutant VARCHAR(10),
    pm25           DOUBLE PRECISION,
    pm10           DOUBLE PRECISION,
    no2            DOUBLE PRECISION,
    so2            DOUBLE PRECISION,
    o3             DOUBLE PRECISION,
    co             DOUBLE PRECISION,
    temperature    DOUBLE PRECISION,
    humidity       DOUBLE PRECISION,
    wind_speed     DOUBLE PRECISION,
    wind_direction DOUBLE PRECISION,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_aqi_station_time ON aqi_readings (station_id, recorded_at DESC);
CREATE INDEX idx_aqi_recorded_at ON aqi_readings (recorded_at DESC);
```

### `weather_data`

Hourly weather observations from external APIs.

```sql
CREATE TABLE weather_data (
    weather_id     SERIAL PRIMARY KEY,
    station_id     VARCHAR(20) NOT NULL REFERENCES stations(station_id),
    recorded_at    TIMESTAMPTZ NOT NULL,
    temperature_c  DOUBLE PRECISION,
    feels_like_c   DOUBLE PRECISION,
    humidity_pct   DOUBLE PRECISION,
    pressure_hpa   DOUBLE PRECISION,
    wind_speed_ms  DOUBLE PRECISION,
    wind_dir_deg   DOUBLE PRECISION,
    cloud_cover_pct DOUBLE PRECISION,
    visibility_m   DOUBLE PRECISION,
    precipitation_mm DOUBLE PRECISION,
    uv_index       DOUBLE PRECISION,
    raw_json       JSONB,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_weather_station_time ON weather_data (station_id, recorded_at DESC);
```

### `satellite_data`

Sentinel-5P and NASA FIRMS satellite observations.

```sql
CREATE TABLE satellite_data (
    satellite_id   SERIAL PRIMARY KEY,
    source         VARCHAR(50) NOT NULL CHECK (source IN ('sentinel5p', 'nasa_firms', 'modis')),
    observation_date DATE NOT NULL,
    tile_id        VARCHAR(50),
    geom           GEOMETRY(Polygon, 4326),
    no2_trop柱     DOUBLE PRECISION,
    so2_column     DOUBLE PRECISION,
    aerosol_index  DOUBLE PRECISION,
    fire_count     INTEGER,
    fire_radiative_power DOUBLE PRECISION,
    cloud_fraction DOUBLE PRECISION,
    raw_raster     BYTEA,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_satellite_date ON satellite_data (observation_date DESC);
CREATE INDEX idx_satellite_geom ON satellite_data USING GIST (geom);
CREATE INDEX idx_satellite_source ON satellite_data (source);
```

### `wards`

Administrative ward boundaries.

```sql
CREATE TABLE wards (
    ward_id        VARCHAR(20) PRIMARY KEY,
    ward_name      VARCHAR(200) NOT NULL,
    city           VARCHAR(100) NOT NULL,
    population     INTEGER,
    area_sq_km     DOUBLE PRECISION,
    geom           GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wards_geom ON wards USING GIST (geom);
CREATE INDEX idx_wards_city ON wards (city);
```

### `industries`

Registered industrial facilities.

```sql
CREATE TABLE industries (
    industry_id    SERIAL PRIMARY KEY,
    name           VARCHAR(200) NOT NULL,
    industry_type  VARCHAR(100),
    ward_id        VARCHAR(20) REFERENCES wards(ward_id),
    latitude       DOUBLE PRECISION NOT NULL,
    longitude      DOUBLE PRECISION NOT NULL,
    geom           GEOMETRY(Point, 4326) NOT NULL,
    annual_emission_tonnes JSONB,
    compliance_status VARCHAR(20) DEFAULT 'pending',
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_industries_geom ON industries USING GIST (geom);
```

### `roads`

Major road segments with traffic estimates.

```sql
CREATE TABLE roads (
    road_id        SERIAL PRIMARY KEY,
    road_name      VARCHAR(200),
    road_class     VARCHAR(50),
    lanes          INTEGER,
    avg_daily_traffic INTEGER,
    geom           GEOMETRY(LineString, 4326) NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_roads_geom ON roads USING GIST (geom);
```

### `hospitals`

Healthcare facilities for advisory targeting.

```sql
CREATE TABLE hospitals (
    hospital_id    SERIAL PRIMARY KEY,
    name           VARCHAR(200) NOT NULL,
    facility_type  VARCHAR(100),
    beds           INTEGER,
    has_pulmonology BOOLEAN DEFAULT FALSE,
    latitude       DOUBLE PRECISION NOT NULL,
    longitude      DOUBLE PRECISION NOT NULL,
    geom           GEOMETRY(Point, 4326) NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hospitals_geom ON hospitals USING GIST (geom);
```

### `forecast_models`

Registered ML model metadata.

```sql
CREATE TABLE forecast_models (
    model_id       VARCHAR(50) PRIMARY KEY,
    model_type     VARCHAR(50) NOT NULL,
    algorithm      VARCHAR(50) NOT NULL,
    pollutant      VARCHAR(10) NOT NULL,
    version        VARCHAR(20) NOT NULL,
    training_date  DATE NOT NULL,
    metrics        JSONB,
    artifact_path  VARCHAR(500) NOT NULL,
    active         BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

### `forecasts`

Model predictions per station per forecast run.

```sql
CREATE TABLE forecasts (
    forecast_id    BIGSERIAL PRIMARY KEY,
    model_id       VARCHAR(50) NOT NULL REFERENCES forecast_models(model_id),
    station_id     VARCHAR(20) NOT NULL REFERENCES stations(station_id),
    generated_at   TIMESTAMPTZ NOT NULL,
    target_time    TIMESTAMPTZ NOT NULL,
    pollutant      VARCHAR(10) NOT NULL,
    predicted_value DOUBLE PRECISION NOT NULL,
    lower_bound    DOUBLE PRECISION,
    upper_bound    DOUBLE PRECISION,
    category       VARCHAR(50),
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forecasts_station_time ON forecasts (station_id, target_time);
CREATE INDEX idx_forecasts_model ON forecasts (model_id);
```

### `attributions`

Source attribution results per station per time window.

```sql
CREATE TABLE attributions (
    attribution_id BIGSERIAL PRIMARY KEY,
    station_id     VARCHAR(20) NOT NULL REFERENCES stations(station_id),
    computed_at    TIMESTAMPTZ NOT NULL,
    pollutant      VARCHAR(10) NOT NULL,
    total_value    DOUBLE PRECISION NOT NULL,
    sectors        JSONB NOT NULL,
    shap_values    JSONB NOT NULL,
    model_id       VARCHAR(50) REFERENCES forecast_models(model_id),
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attributions_station ON attributions (station_id, computed_at DESC);
```

### `violations`

Detected regulatory violations.

```sql
CREATE TABLE violations (
    violation_id   VARCHAR(20) PRIMARY KEY,
    station_id     VARCHAR(20) NOT NULL REFERENCES stations(station_id),
    ward_id        VARCHAR(20) REFERENCES wards(ward_id),
    violation_type VARCHAR(50) NOT NULL,
    pollutant      VARCHAR(10) NOT NULL,
    measured_value DOUBLE PRECISION NOT NULL,
    limit_value    DOUBLE PRECISION NOT NULL,
    severity       INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
    latitude       DOUBLE PRECISION,
    longitude      DOUBLE PRECISION,
    geom           GEOMETRY(Point, 4326),
    detected_at    TIMESTAMPTZ NOT NULL,
    status         VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'dismissed')),
    recommended_action TEXT,
    resolution_notes TEXT,
    resolved_by    VARCHAR(100),
    resolved_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_violations_status ON violations (status);
CREATE INDEX idx_violations_ward ON violations (ward_id);
CREATE INDEX idx_violations_geom ON violations USING GIST (geom);
```

### `advisories`

Generated health advisory content.

```sql
CREATE TABLE advisories (
    advisory_id    VARCHAR(30) PRIMARY KEY,
    city           VARCHAR(100) NOT NULL,
    language       VARCHAR(5) NOT NULL CHECK (language IN ('en', 'hi', 'mr')),
    population     VARCHAR(50) NOT NULL,
    aqi_forecast   INTEGER NOT NULL,
    category       VARCHAR(50) NOT NULL,
    headline       TEXT NOT NULL,
    body           TEXT NOT NULL,
    generated_at   TIMESTAMPTZ NOT NULL,
    model_id       VARCHAR(50) REFERENCES forecast_models(model_id),
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_advisories_city_time ON advisories (city, generated_at DESC);
CREATE INDEX idx_advisories_lang ON advisories (language);
```

### `users`

Platform users for role-based access.

```sql
CREATE TABLE users (
    user_id        SERIAL PRIMARY KEY,
    email          VARCHAR(254) UNIQUE NOT NULL,
    hashed_password VARCHAR(200) NOT NULL,
    full_name      VARCHAR(200) NOT NULL,
    role           VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (role IN ('admin', 'analyst', 'public')),
    active         BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    last_login     TIMESTAMPTZ
);
```

---

## Seed Data

The `database/seed.sql` file populates reference data:

- 150+ monitoring stations across major Indian cities (Mumbai, Delhi, Pune, Bangalore, Chennai, Kolkata).
- 30 administrative wards for Mumbai with PostGIS polygon geometries.
- 50 registered industrial facilities with emission profiles.
- 3 forecast model versions (v1 baseline, v2 with satellite features, v3 current production).
