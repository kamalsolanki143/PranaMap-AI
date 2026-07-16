-- PranaMap AI - Seed Data
-- Sample Pune ward data and reference records

-- ============================================================
-- WARDS - Pune Municipal Corporation administrative wards
-- ============================================================

INSERT INTO wards (ward_name, ward_number, area_sq_km, population, zone, geom) VALUES
(
    'Kothrud', 1, 18.5, 285000, 'West',
    ST_GeomFromText('MULTIPOLYGON(((73.80 18.50, 73.83 18.50, 73.83 18.53, 73.80 18.53, 73.80 18.50)))', 4326)
),
(
    'Hadapsar', 2, 22.1, 320000, 'East',
    ST_GeomFromText('MULTIPOLYGON(((73.93 18.50, 73.96 18.50, 73.96 18.53, 73.93 18.53, 73.93 18.50)))', 4326)
),
(
    'Aundh', 3, 12.8, 195000, 'West',
    ST_GeomFromText('MULTIPOLYGON(((73.78 18.55, 73.81 18.55, 73.81 18.58, 73.78 18.58, 73.78 18.55)))', 4326)
),
(
    'Baner', 4, 14.2, 210000, 'West',
    ST_GeomFromText('MULTIPOLYGON(((73.77 18.55, 73.80 18.55, 73.80 18.58, 73.77 18.58, 73.77 18.55)))', 4326)
),
(
    'Vishrantwadi', 5, 10.5, 145000, 'East',
    ST_GeomFromText('MULTIPOLYGON(((73.88 18.55, 73.91 18.55, 73.91 18.58, 73.88 18.58, 73.88 18.55)))', 4326)
),
(
    'Shivajinagar', 6, 8.3, 175000, 'Central',
    ST_GeomFromText('MULTIPOLYGON(((73.83 18.53, 73.86 18.53, 73.86 18.56, 73.83 18.56, 73.83 18.53)))', 4326)
),
(
    'Sinhagad Road', 7, 16.7, 230000, 'South',
    ST_GeomFromText('MULTIPOLYGON(((73.78 18.46, 73.81 18.46, 73.81 18.49, 73.78 18.49, 73.78 18.46)))', 4326)
),
(
    'Kondhwa', 8, 11.4, 180000, 'South',
    ST_GeomFromText('MULTIPOLYGON(((73.88 18.46, 73.91 18.46, 73.91 18.49, 73.88 18.49, 73.88 18.46)))', 4326)
),
(
    'Kharadi', 9, 20.3, 165000, 'East',
    ST_GeomFromText('MULTIPOLYGON(((73.95 18.53, 73.98 18.53, 73.98 18.56, 73.95 18.56, 73.95 18.53)))', 4326)
),
(
    'Wanwadi', 10, 9.8, 155000, 'Central',
    ST_GeomFromText('MULTIPOLYGON(((73.88 18.49, 73.91 18.49, 73.91 18.52, 73.88 18.52, 73.88 18.49)))', 4326)
),
(
    'Pimpri', 11, 15.6, 290000, 'North',
    ST_GeomFromText('MULTIPOLYGON(((73.78 18.60, 73.82 18.60, 73.82 18.64, 73.78 18.64, 73.78 18.60)))', 4326)
),
(
    'Chinchwad', 12, 13.2, 260000, 'North',
    ST_GeomFromText('MULTIPOLYGON(((73.75 18.60, 73.78 18.60, 73.78 18.63, 73.75 18.63, 73.75 18.60)))', 4326)
),
(
    'Bibwewadi', 13, 10.1, 170000, 'South',
    ST_GeomFromText('MULTIPOLYGON(((73.85 18.46, 73.88 18.46, 73.88 18.49, 73.85 18.49, 73.85 18.46)))', 4326)
),
(
    'Dhayari', 14, 7.6, 120000, 'South',
    ST_GeomFromText('MULTIPOLYGON(((73.75 18.46, 73.78 18.46, 73.78 18.49, 73.75 18.49, 73.75 18.46)))', 4326)
),
(
    'Undri', 15, 12.9, 140000, 'South',
    ST_GeomFromText('MULTIPOLYGON(((73.88 18.43, 73.91 18.43, 73.91 18.46, 73.88 18.46, 73.88 18.43)))', 4326)
),
(
    'Yerawada', 16, 11.3, 185000, 'East',
    ST_GeomFromText('MULTIPOLYGON(((73.88 18.53, 73.91 18.53, 73.91 18.56, 73.88 18.56, 73.88 18.53)))', 4326)
),
(
    'Kalyani Nagar', 17, 6.5, 130000, 'East',
    ST_GeomFromText('MULTIPOLYGON(((73.90 18.54, 73.93 18.54, 73.93 18.57, 73.90 18.57, 73.90 18.54)))', 4326)
),
(
    'Viman Nagar', 18, 7.8, 160000, 'East',
    ST_GeomFromText('MULTIPOLYGON(((73.91 18.55, 73.94 18.55, 73.94 18.58, 73.91 18.58, 73.91 18.55)))', 4326)
),
(
    'Dhanakwadi', 19, 5.4, 85000, 'South',
    ST_GeomFromText('MULTIPOLYGON(((73.82 18.44, 73.85 18.44, 73.85 18.47, 73.82 18.47, 73.82 18.44)))', 4326)
),
(
    'Nigdi', 20, 8.7, 140000, 'North',
    ST_GeomFromText('MULTIPOLYGON(((73.74 18.63, 73.77 18.63, 73.77 18.66, 73.74 18.66, 73.74 18.63)))', 4326)
);

-- ============================================================
-- SOURCE ATTRIBUTIONS
-- ============================================================

INSERT INTO source_attributions (source_name, endpoint_url, license_url, attribution_text, rate_limit_rpm) VALUES
('cpcb', 'https://app.cpcbccr.com/ccr_docs', 'https://cpcb.gov.in/', 'Central Pollution Control Board - National Air Quality Index', 60),
('openweather', 'https://api.openweathermap.org/data/2.5/', 'https://openweathermap.org/api', 'Weather data by OpenWeatherMap', 120),
('nasa_firms', 'https://firms.modaps.eosdis.nasa.gov/api/area/', 'https://firms.modaps.eosdis.nasa.gov/data/, NASA Open Data Policy', 'Fire data from NASA FIRMS (Fire Information for Resource Management System)', 30),
('sentinel2', 'https://scihub.copernicus.eu/dhus/', 'https://scihub.copernicus.eu/tree/', 'Sentinel-2 imagery courtesy of Copernicus Open Access Hub', 10),
('osm', 'https://overpass-api.de/api/interpreter', 'https://www.openstreetmap.org/copyright', 'Map data by OpenStreetMap contributors, ODbL 1.0', 20),
('iaqi', 'https://api.waqi.info/feed/', 'https://aqicn.org/api/', 'Air Quality data by WAQI (World Air Quality Index)', 60),
('weatherapi', 'https://api.weatherapi.com/v1/', 'https://www.weatherapi.com/', 'Weather data by WeatherAPI.com', 100);

-- ============================================================
-- SAMPLE AQI READINGS (recent data for a few wards)
-- ============================================================

INSERT INTO aqi_readings (ward_id, station_id, source, recorded_at, aqi_value, category, pm25, pm10, no2, so2, co, o3, temperature_c, humidity_pct, wind_speed_kph, location)
VALUES
(1, 'CPCB-KOT-001', 'cpcb', NOW() - INTERVAL '1 hour', 85, 'satisfactory', 42.3, 78.1, 28.5, 12.1, 0.8, 18.2, 32.5, 65.0, 8.3, ST_SetSRID(ST_MakePoint(73.815, 18.515), 4326)),
(1, 'IAQI-KOT-001', 'iaqi', NOW() - INTERVAL '2 hours', 92, 'satisfactory', 48.1, 82.4, 31.2, 14.3, 0.9, 20.1, 33.0, 62.0, 7.1, ST_SetSRID(ST_MakePoint(73.815, 18.515), 4326)),
(2, 'CPCB-HAD-001', 'cpcb', NOW() - INTERVAL '1 hour', 115, 'moderate', 62.5, 98.3, 35.8, 18.6, 1.1, 22.5, 34.2, 58.0, 6.5, ST_SetSRID(ST_MakePoint(73.945, 18.515), 4326)),
(3, 'CPCB-AUN-001', 'cpcb', NOW() - INTERVAL '30 minutes', 68, 'satisfactory', 31.2, 55.8, 22.1, 9.5, 0.6, 15.3, 31.8, 70.0, 10.2, ST_SetSRID(ST_MakePoint(73.795, 18.565), 4326)),
(6, 'CPCB-SHI-001', 'cpcb', NOW() - INTERVAL '45 minutes', 142, 'poor', 78.4, 125.6, 42.3, 22.8, 1.4, 28.1, 35.0, 55.0, 5.8, ST_SetSRID(ST_MakePoint(73.845, 18.545), 4326)),
(11, 'CPCB-PIM-001', 'cpcb', NOW() - INTERVAL '1 hour', 158, 'poor', 88.2, 142.3, 48.5, 25.4, 1.6, 30.2, 35.5, 52.0, 4.9, ST_SetSRID(ST_MakePoint(73.800, 18.620), 4326)),
(16, 'CPCB-YER-001', 'cpcb', NOW() - INTERVAL '2 hours', 76, 'satisfactory', 36.8, 65.2, 25.4, 11.2, 0.7, 16.8, 33.5, 60.0, 9.1, ST_SetSRID(ST_MakePoint(73.895, 18.545), 4326)),
(18, 'CPCB-VIM-001', 'cpcb', NOW() - INTERVAL '1.5 hours', 62, 'satisfactory', 28.5, 48.6, 19.8, 8.4, 0.5, 14.2, 32.0, 68.0, 11.5, ST_SetSRID(ST_MakePoint(73.925, 18.565), 4326)),
(7, 'IAQB-SIN-001', 'iaqi', NOW() - INTERVAL '3 hours', 105, 'moderate', 55.8, 92.1, 32.4, 16.8, 1.0, 21.3, 34.8, 56.0, 6.2, ST_SetSRID(ST_MakePoint(73.795, 18.475), 4326)),
(12, 'CPCB-CHI-001', 'cpcb', NOW() - INTERVAL '1 hour', 138, 'poor', 75.2, 118.5, 40.1, 21.5, 1.3, 26.8, 35.2, 50.0, 5.5, ST_SetSRID(ST_MakePoint(73.765, 18.615), 4326));

-- ============================================================
-- SAMPLE WEATHER DATA
-- ============================================================

INSERT INTO weather_data (ward_id, source, recorded_at, temperature_c, feels_like_c, humidity_pct, pressure_hpa, wind_speed_kph, wind_dir_deg, clouds_pct, visibility_km, uv_index, rain_1h_mm, weather_main, weather_desc, location)
VALUES
(1, 'openweather', NOW() - INTERVAL '1 hour', 32.5, 35.1, 65.0, 1008.2, 8.3, 245, 25.0, 8.5, 7.2, 0.0, 'haze', 'haze', ST_SetSRID(ST_MakePoint(73.815, 18.515), 4326)),
(2, 'openweather', NOW() - INTERVAL '1 hour', 34.2, 37.0, 58.0, 1007.8, 6.5, 220, 15.0, 9.2, 8.1, 0.0, 'clear', 'clear sky', ST_SetSRID(ST_MakePoint(73.945, 18.515), 4326)),
(3, 'openweather', NOW() - INTERVAL '1 hour', 31.8, 33.5, 70.0, 1008.5, 10.2, 260, 30.0, 7.8, 6.5, 0.0, 'clouds', 'scattered clouds', ST_SetSRID(ST_MakePoint(73.795, 18.565), 4326)),
(6, 'weatherapi', NOW() - INTERVAL '2 hours', 35.0, 38.2, 55.0, 1007.5, 5.8, 200, 10.0, 10.0, 8.5, 0.0, 'clear', 'clear sky', ST_SetSRID(ST_MakePoint(73.845, 18.545), 4326)),
(11, 'openweather', NOW() - INTERVAL '1 hour', 35.5, 39.0, 52.0, 1007.2, 4.9, 190, 20.0, 8.0, 8.8, 0.0, 'haze', 'haze', ST_SetSRID(ST_MakePoint(73.800, 18.620), 4326));

-- ============================================================
-- SAMPLE FORECASTS
-- ============================================================

INSERT INTO forecasts (ward_id, model_version, generated_at, forecast_hour, predicted_aqi, predicted_category, confidence_low, confidence_high, confidence_pct)
VALUES
(1, 'lstm-v1.2', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '6 hours', 95, 'satisfactory', 82.0, 110.0, 78.5),
(1, 'lstm-v1.2', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '12 hours', 105, 'moderate', 88.0, 125.0, 72.0),
(1, 'lstm-v1.2', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '24 hours', 78, 'satisfactory', 65.0, 95.0, 68.2),
(2, 'lstm-v1.2', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '6 hours', 125, 'moderate', 108.0, 145.0, 75.0),
(6, 'lstm-v1.2', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '6 hours', 155, 'poor', 135.0, 178.0, 70.5),
(6, 'lstm-v1.2', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '12 hours', 148, 'poor', 125.0, 170.0, 68.8),
(11, 'lstm-v1.2', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '6 hours', 165, 'poor', 142.0, 190.0, 72.3);

-- ============================================================
-- SAMPLE FIRE DATA
-- ============================================================

INSERT INTO fire_data (ward_id, source, detection_time, latitude, longitude, location, brightness, scan, track, satellite, confidence, frp, daynight, instrument)
VALUES
(2, 'nasa_firms', NOW() - INTERVAL '3 hours', 18.520, 73.950, ST_SetSRID(ST_MakePoint(73.950, 18.520), 4326), 312.5, 1.0, 1.0, 'Terra', 'nominal', 15.2, 'D', 'MODIS'),
(9, 'nasa_firms', NOW() - INTERVAL '6 hours', 18.545, 73.965, ST_SetSRID(ST_MakePoint(73.965, 18.545), 4326), 328.8, 1.2, 1.1, 'Aqua', 'high', 28.5, 'D', 'MODIS'),
(11, 'nasa_firms', NOW() - INTERVAL '2 hours', 18.625, 73.805, ST_SetSRID(ST_MakePoint(73.805, 18.625), 4326), 295.3, 1.0, 1.0, 'Terra', 'low', 8.7, 'D', 'MODIS');

-- ============================================================
-- SAMPLE ENFORCEMENT ACTIONS
-- ============================================================

INSERT INTO enforcement_actions (ward_id, detected_at, violation_type, description, severity, status, location)
VALUES
(2, NOW() - INTERVAL '1 day', 'Industrial Emissions', 'Excessive smoke from unauthorized industrial unit in Hadapsar MIDC area', 'warning', 'acknowledged', ST_SetSRID(ST_MakePoint(73.945, 18.515), 4326)),
(11, NOW() - INTERVAL '3 days', 'Construction Dust', 'Uncontrolled construction dust without PM10 suppression measures at Pimpri site', 'danger', 'action_taken', ST_SetSRID(ST_MakePoint(73.800, 18.620), 4326)),
(6, NOW() - INTERVAL '12 hours', 'Vehicle Emissions', 'High concentration of old diesel vehicles on Shivajinagar road', 'warning', 'detected', ST_SetSRID(ST_MakePoint(73.845, 18.545), 4326));

-- ============================================================
-- SAMPLE ADVISORIES
-- ============================================================

INSERT INTO advisories (severity, title, description, affected_pollutants, recommended_actions, issued_at, expires_at, target_zones)
VALUES
(
    'warning',
    'Moderate AQI Alert - Pune East Zone',
    'Air quality in Pimpri and Chinchwad areas has deteriorated due to industrial emissions and vehicular traffic. PM2.5 and PM10 levels are above recommended limits.',
    ARRAY['pm25'::pollutant_type, 'pm10'::pollutant_type],
    ARRAY['Avoid prolonged outdoor exertion', 'Keep windows closed', 'Use air purifiers indoors', 'Children and elderly should remain indoors'],
    NOW() - INTERVAL '2 hours',
    NOW() + INTERVAL '22 hours',
    ARRAY['North', 'East']
),
(
    'danger',
    'Poor Air Quality - Shivajinagar Area',
    'AQI has reached poor levels in central Pune due to combined effects of traffic congestion and construction activity. Sensitive groups are at risk.',
    ARRAY['pm25'::pollutant_type, 'no2'::pollutant_type, 'pm10'::pollutant_type],
    ARRAY['Minimize outdoor activities', 'Wear N95 masks outdoors', 'Schools should avoid outdoor assemblies', 'Hospitals to prepare for respiratory cases'],
    NOW() - INTERVAL '30 minutes',
    NOW() + INTERVAL '12 hours',
    ARRAY['Central']
),
(
    'info',
    'Fog Advisory - Morning Hours',
    'Reduced visibility expected in early morning hours across Pune. Fog may affect air quality measurements temporarily.',
    ARRAY['pm10'::pollutant_type],
    ARRAY['Drive carefully with fog lights', 'Check AQI after fog clears for accurate readings'],
    NOW(),
    NOW() + INTERVAL '8 hours',
    ARRAY['West', 'Central', 'South']
);
