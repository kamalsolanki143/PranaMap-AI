# PranaMap AI — Data Ingestion & Normalization Pipeline

This document details the multi-source environmental telemetry pipeline powering PranaMap AI.

---

## 1. Data Ingestion Architecture

```
External Telemetry Sources
├── CPCB CAAQMS Ground Stations (PM2.5, PM10, NO2, SO2, CO, O3)
├── Open-Meteo / ECMWF Boundary Layer Meteorology (Wind, Temp, Humidity, Pressure)
├── Copernicus Sentinel-5P Satellite (NO2 column density, Aerosol Optical Depth)
└── NASA FIRMS VIIRS/MODIS (Thermal anomalies & open biomass burning)
                            │
                            ▼
              Data Adapter Interface (BaseDataAdapter)
              ├── fetch()     -> Timeout-bounded HTTP client (4.0s max)
              ├── validate()  -> Schema integrity & range check (0-1000 AQI)
              ├── normalize() -> Unified Speciation Schema & Indian AQI formula
              └── store()     -> Cloud Firestore or memory cache
                            │
                            ▼
                  Analytics & Inference Layer
              ├── Diurnal Cycle & XGBoost Predictor
              └── Multi-Modal Attribution Heuristics
```

---

## 2. Ingestion Adapters

### 2.1 CPCB Ground Sensors (`cpcb_adapter.py`)
- **Protocol**: REST polling from continuous monitoring stations.
- **Cadence**: 15-minute refresh.
- **Coverage**: 38+ Continuous Ambient Air Quality Monitoring Stations in Delhi NCR, plus active monitors in all 9 supported Indian cities.

### 2.2 Open-Meteo Atmospheric Forecast (`open_meteo.py`)
- **Parameters**: `european_aqi`, `pm2_5`, `pm10`, `nitrogen_dioxide`, `sulphur_dioxide`, `ozone`, `dust`.
- **Ventilation Index**: Calculated as $\text{Ventilation Index} = \text{Mixing Height} \times \text{Wind Speed}$.

### 2.3 Sentinel-5P Tropospheric Sensing
- **Indicators**: Tropospheric NO2 vertical column density ($10^{15} \text{ molecules/cm}^2$) and aerosol index.
- **Role**: Validates roadside traffic corridor congestion against ground sensor spikes.

---

## 3. Resilient Fallback Strategy

To ensure zero downtime during regional network latency or upstream provider downtime:
1. **LIVE**: Direct API query to continuous provider.
2. **CACHED**: Most recent validated reading from Google Cloud Firestore collection.
3. **HISTORICAL BASELINE**: Calibrated meteorological baseline stored locally.

Every response sent to the frontend includes `data_freshness`:
```json
{
  "last_synced": "29 Sep 2026, 22:30 IST",
  "data_status": "LIVE | CACHED | SIMULATION",
  "provider": "CPCB CAAQMS / Open-Meteo"
}
```
