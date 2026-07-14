-- PranaMap AI - PostgreSQL + PostGIS Schema
-- Pune Environmental Monitoring & Prediction System

-- Enable PostGIS extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE aqi_category AS ENUM (
    'good', 'satisfactory', 'moderate', 'poor', 'very_poor', 'severe'
);

CREATE TYPE pollutant_type AS ENUM (
    'pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'nh3', 'pb'
);

CREATE TYPE fire_confidence AS ENUM ('low', 'nominal', 'high', 'very_high');

CREATE TYPE advisory_severity AS ENUM ('info', 'warning', 'danger', 'emergency');

CREATE TYPE data_source AS ENUM (
    'cpcb', 'openweather', 'nasa_firms', 'sentinel2', 'landsat',
    'osm', 'iaqi', 'weatherapi', 'manual'
);

CREATE TYPE enforcement_status AS ENUM (
    'detected', 'reported', 'acknowledged', 'action_taken', 'resolved', 'dismissed'
);

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Administrative wards with PostGIS geometry
CREATE TABLE wards (
    ward_id         SERIAL PRIMARY KEY,
    ward_name       VARCHAR(150) NOT NULL,
    ward_number     INTEGER UNIQUE,
    area_sq_km      NUMERIC(8, 3),
    population      INTEGER,
    zone            VARCHAR(50),
    geom            GEOMETRY(MultiPolygon, 4326) NOT NULL,
    centroid        GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_Centroid(geom)) STORED,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wards_geom ON wards USING GIST (geom);
CREATE INDEX idx_wards_centroid ON wards USING GIST (centroid);
CREATE INDEX idx_wards_zone ON wards (zone);

-- AQI sensor readings
CREATE TABLE aqi_readings (
    reading_id      SERIAL PRIMARY KEY,
    ward_id         INTEGER REFERENCES wards(ward_id) ON DELETE CASCADE,
    station_id      VARCHAR(50),
    source          data_source NOT NULL,
    recorded_at     TIMESTAMPTZ NOT NULL,
    aqi_value       INTEGER NOT NULL CHECK (aqi_value >= 0 AND aqi_value <= 500),
    category        aqi_category NOT NULL,
    pm25            NUMERIC(8, 2),
    pm10            NUMERIC(8, 2),
    no2             NUMERIC(8, 2),
    so2             NUMERIC(8, 2),
    co              NUMERIC(8, 4),
    o3              NUMERIC(8, 2),
    nh3             NUMERIC(8, 2),
    pb              NUMERIC(8, 4),
    temperature_c   NUMERIC(5, 2),
    humidity_pct    NUMERIC(5, 2),
    wind_speed_kph  NUMERIC(5, 2),
    wind_dir_deg    NUMERIC(5, 1),
    location        GEOMETRY(Point, 4326),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_aqi_ward_id ON aqi_readings (ward_id);
CREATE INDEX idx_aqi_recorded_at ON aqi_readings (recorded_at DESC);
CREATE INDEX idx_aqi_category ON aqi_readings (category);
CREATE INDEX idx_aqi_source ON aqi_readings (source);
CREATE INDEX idx_aqi_location ON aqi_readings USING GIST (location);
CREATE INDEX idx_aqi_composite ON aqi_readings (ward_id, recorded_at DESC);

-- ML forecast outputs
CREATE TABLE forecasts (
    forecast_id     SERIAL PRIMARY KEY,
    ward_id         INTEGER REFERENCES wards(ward_id) ON DELETE CASCADE,
    model_version   VARCHAR(50) NOT NULL,
    generated_at    TIMESTAMPTZ NOT NULL,
    forecast_hour   TIMESTAMPTZ NOT NULL,
    predicted_aqi   INTEGER NOT NULL CHECK (predicted_aqi >= 0 AND predicted_aqi <= 500),
    predicted_category aqi_category NOT NULL,
    confidence_low  NUMERIC(8, 2),
    confidence_high NUMERIC(8, 2),
    confidence_pct  NUMERIC(5, 2) CHECK (confidence_pct >= 0 AND confidence_pct <= 100),
    input_features  JSONB,
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forecasts_ward_id ON forecasts (ward_id);
CREATE INDEX idx_forecasts_forecast_hour ON forecasts (forecast_hour);
CREATE INDEX idx_forecasts_model ON forecasts (model_version);
CREATE INDEX idx_forecasts_composite ON forecasts (ward_id, forecast_hour);

-- Data source tracking & attribution
CREATE TABLE source_attributions (
    attribution_id  SERIAL PRIMARY KEY,
    source_name     data_source NOT NULL,
    endpoint_url    VARCHAR(500),
    license_url     VARCHAR(500),
    attribution_text TEXT NOT NULL,
    api_key_ref     VARCHAR(100),
    rate_limit_rpm  INTEGER,
    last_fetched_at TIMESTAMPTZ,
    is_active       BOOLEAN DEFAULT TRUE,
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_source_name ON source_attributions (source_name);

-- Environmental enforcement actions
CREATE TABLE enforcement_actions (
    action_id       SERIAL PRIMARY KEY,
    ward_id         INTEGER REFERENCES wards(ward_id) ON DELETE SET NULL,
    detected_at     TIMESTAMPTZ NOT NULL,
    violation_type  VARCHAR(100) NOT NULL,
    description     TEXT,
    severity        advisory_severity NOT NULL DEFAULT 'warning',
    status          enforcement_status NOT NULL DEFAULT 'detected',
    location        GEOMETRY(Point, 4326),
    evidence_urls   TEXT[],
    reported_to     VARCHAR(200),
    resolved_at     TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enforcement_ward ON enforcement_actions (ward_id);
CREATE INDEX idx_enforcement_status ON enforcement_actions (status);
CREATE INDEX idx_enforcement_detected ON enforcement_actions (detected_at DESC);
CREATE INDEX idx_enforcement_location ON enforcement_actions USING GIST (location);

-- Public health & environmental advisories
CREATE TABLE advisories (
    advisory_id     SERIAL PRIMARY KEY,
    ward_id         INTEGER REFERENCES wards(ward_id) ON DELETE SET NULL,
    severity        advisory_severity NOT NULL,
    title           VARCHAR(300) NOT NULL,
    description     TEXT NOT NULL,
    affected_pollutants pollutant_type[],
    recommended_actions TEXT[],
    issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    is_active       BOOLEAN DEFAULT TRUE,
    target_zones    TEXT[],
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_advisories_ward ON advisories (ward_id);
CREATE INDEX idx_advisories_severity ON advisories (severity);
CREATE INDEX idx_advisories_active ON advisories (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_advisories_issued ON advisories (issued_at DESC);

-- Weather data from OpenWeather / WeatherAPI
CREATE TABLE weather_data (
    weather_id      SERIAL PRIMARY KEY,
    ward_id         INTEGER REFERENCES wards(ward_id) ON DELETE CASCADE,
    source          data_source NOT NULL DEFAULT 'openweather',
    recorded_at     TIMESTAMPTZ NOT NULL,
    temperature_c   NUMERIC(5, 2),
    feels_like_c    NUMERIC(5, 2),
    humidity_pct    NUMERIC(5, 2),
    pressure_hpa    NUMERIC(7, 1),
    wind_speed_kph  NUMERIC(5, 2),
    wind_dir_deg    NUMERIC(5, 1),
    wind_gust_kph   NUMERIC(5, 2),
    clouds_pct      NUMERIC(5, 1),
    visibility_km   NUMERIC(5, 1),
    uv_index        NUMERIC(4, 1),
    rain_1h_mm      NUMERIC(6, 2),
    rain_3h_mm      NUMERIC(6, 2),
    snow_1h_mm      NUMERIC(6, 2),
    weather_main    VARCHAR(50),
    weather_desc    VARCHAR(200),
    location        GEOMETRY(Point, 4326),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_weather_ward ON weather_data (ward_id);
CREATE INDEX idx_weather_recorded ON weather_data (recorded_at DESC);
CREATE INDEX idx_weather_location ON weather_data USING GIST (location);

-- Satellite imagery metadata
CREATE TABLE satellite_data (
    satellite_id    SERIAL PRIMARY KEY,
    ward_id         INTEGER REFERENCES wards(ward_id) ON DELETE CASCADE,
    source          data_source NOT NULL,
    capture_date    DATE NOT NULL,
    product_type    VARCHAR(100),
    cloud_cover_pct NUMERIC(5, 2),
    resolution_m    NUMERIC(6, 2),
    bands           TEXT[],
    file_path       VARCHAR(500),
    file_size_mb    NUMERIC(10, 2),
    bbox            GEOMETRY(Polygon, 4326),
    ndvi_mean       NUMERIC(5, 3),
    ndvi_std        NUMERIC(5, 3),
    aod             NUMERIC(5, 3),
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_satellite_ward ON satellite_data (ward_id);
CREATE INDEX idx_satellite_date ON satellite_data (capture_date DESC);
CREATE INDEX idx_satellite_bbox ON satellite_data USING GIST (bbox);
CREATE INDEX idx_satellite_source ON satellite_data (source);

-- NASA FIRMS fire/hotspot data
CREATE TABLE fire_data (
    fire_id         SERIAL PRIMARY KEY,
    ward_id         INTEGER REFERENCES wards(ward_id) ON DELETE SET NULL,
    source          data_source NOT NULL DEFAULT 'nasa_firms',
    detection_time  TIMESTAMPTZ NOT NULL,
    latitude        NUMERIC(10, 7) NOT NULL,
    longitude       NUMERIC(10, 7) NOT NULL,
    location        GEOMETRY(Point, 4326) NOT NULL,
    brightness      NUMERIC(8, 2),
    scan            NUMERIC(6, 2),
    track           NUMERIC(6, 2),
    satellite       VARCHAR(10),
    confidence      fire_confidence,
    frp             NUMERIC(10, 2),
    daynight        CHAR(1),
    instrument      VARCHAR(20),
    is_anomaly      BOOLEAN DEFAULT FALSE,
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fire_ward ON fire_data (ward_id);
CREATE INDEX idx_fire_time ON fire_data (detection_time DESC);
CREATE INDEX idx_fire_location ON fire_data USING GIST (location);
CREATE INDEX idx_fire_confidence ON fire_data (confidence);
CREATE INDEX idx_fire_composite ON fire_data (ward_id, detection_time DESC);

-- ============================================================
-- VIEWS
-- ============================================================

-- Latest AQI per ward
CREATE VIEW v_latest_aqi AS
SELECT DISTINCT ON (ward_id)
    ward_id,
    aqi_value,
    category,
    recorded_at,
    source
FROM aqi_readings
ORDER BY ward_id, recorded_at DESC;

-- Active advisories with ward info
CREATE VIEW v_active_advisories AS
SELECT
    a.advisory_id,
    a.severity,
    a.title,
    a.description,
    a.issued_at,
    a.expires_at,
    w.ward_name,
    w.zone
FROM advisories a
LEFT JOIN wards w ON a.ward_id = w.ward_id
WHERE a.is_active = TRUE
  AND (a.expires_at IS NULL OR a.expires_at > NOW());

-- Ward environmental summary
CREATE VIEW v_ward_summary AS
SELECT
    w.ward_id,
    w.ward_name,
    w.zone,
    w.area_sq_km,
    w.population,
    la.aqi_value AS latest_aqi,
    la.category AS latest_category,
    la.recorded_at AS latest_reading,
    (SELECT COUNT(*) FROM fire_data fd WHERE fd.ward_id = w.ward_id
     AND fd.detection_time > NOW() - INTERVAL '24 hours') AS fires_24h,
    (SELECT COUNT(*) FROM enforcement_actions ea
     WHERE ea.ward_id = w.ward_id AND ea.status NOT IN ('resolved', 'dismissed'))
     AS open_violations
FROM wards w
LEFT JOIN v_latest_aqi la ON w.ward_id = la.ward_id;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wards_updated
    BEFORE UPDATE ON wards
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER trg_enforcement_updated
    BEFORE UPDATE ON enforcement_actions
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Auto-classify AQI category from value
CREATE OR REPLACE FUNCTION classify_aqi(aqi_val INTEGER)
RETURNS aqi_category AS $$
BEGIN
    RETURN CASE
        WHEN aqi_val <= 50  THEN 'good'
        WHEN aqi_val <= 100 THEN 'satisfactory'
        WHEN aqi_val <= 200 THEN 'moderate'
        WHEN aqi_val <= 300 THEN 'poor'
        WHEN aqi_val <= 400 THEN 'very_poor'
        ELSE 'severe'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- ROW LEVEL SECURITY (for API access)
-- ============================================================

ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqi_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE enforcement_actions ENABLE ROW LEVEL SECURITY;

-- Public read access for wards and advisories
CREATE POLICY public_read_wards ON wards
    FOR SELECT USING (true);

CREATE POLICY public_read_advisories ON advisories
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY public_read_aqi ON aqi_readings
    FOR SELECT USING (true);

CREATE POLICY public_read_forecasts ON forecasts
    FOR SELECT USING (true);

-- Service role full access
CREATE POLICY service_all_wards ON wards
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY service_all_aqi ON aqi_readings
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY service_all_forecasts ON forecasts
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY service_all_enforcement ON enforcement_actions
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY service_all_advisories ON advisories
    FOR ALL USING (current_setting('role') = 'service_role');
