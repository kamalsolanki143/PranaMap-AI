# PranaMap AI — System Architecture

## Overview

PranaMap AI is an end-to-end air quality management platform that ingests heterogeneous environmental data, applies machine learning for forecasting and source attribution, and delivers actionable insights through a map-centric web interface and multilingual health advisories.

The system is composed of six major layers:

```
┌──────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                     │
│  MapLibre GL maps · AQI dashboard · Health advisory cards    │
├──────────────────────────────────────────────────────────────┤
│                     API Gateway (FastAPI)                     │
│  REST endpoints · WebSocket live updates · Auth middleware    │
├──────────────────────────────────────────────────────────────┤
│               LangGraph Agent Orchestrator                   │
│  Ingestion · Forecast · Attribution · Enforcement · Advisory  │
├──────────────────────────────────────────────────────────────┤
│                    ML Inference Layer                         │
│  XGBoost · LightGBM · SHAP explainability · Scikit-learn     │
├──────────────────────────────────────────────────────────────┤
│                  Data Pipeline & Sources                      │
│  AQI monitors · NASA FIRMS · Weather APIs · Sentinel-5P      │
├──────────────────────────────────────────────────────────────┤
│               PostgreSQL + PostGIS Database                   │
│  Time-series AQI · Geospatial layers · Model artifacts       │
└──────────────────────────────────────────────────────────────┘
```

## Components

### 1. Frontend (`frontend/`)

| Detail | Value |
|--------|-------|
| Framework | Next.js (React) |
| Styling | Tailwind CSS |
| Map engine | MapLibre GL |
| Language | TypeScript |

Key pages:

- **Live AQI Map** — color-coded heatmap of current AQI readings across monitoring stations and interpolated grid cells.
- **Forecast View** — 72-hour ahead AQI forecast with confidence bands, toggleable by pollutant (PM2.5, PM10, NO₂, SO₂, O₃, CO).
- **Source Attribution** — SHAP waterfall charts and sector-level contribution percentages for a selected grid cell.
- **Enforcement Dashboard** — ranked list of violations with geo-clusters and recommended actions.
- **Health Advisories** — population-specific guidance (asthmatic, cardiac, elderly, children) in English, Hindi, and Marathi.

### 2. Backend API (`backend/`)

- Built with **FastAPI** (Python 3.11+).
- Uses **SQLAlchemy 2.0** as the ORM with **GeoAlchemy 2** for spatial queries.
- Authentication via JWT tokens; role-based access (admin, analyst, public).
- WebSocket endpoint for streaming live AQI updates to connected clients.

### 3. LangGraph Agent Orchestrator (`agents/`)

A multi-agent graph defined with **LangGraph**. Each agent is a node in a directed acyclic graph:

```
               ┌─────────────────┐
               │ Ingestion Agent │
               └────────┬────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
  ┌──────────────┐ ┌──────────┐ ┌────────────────┐
  │Forecast Agent│ │Attribution│ │Enforcement Agent│
  └──────┬───────┘ │  Agent   │ └───────┬────────┘
         │         └────┬─────┘         │
         ▼              ▼               ▼
         └──────────────┼───────────────┘
                        ▼
              ┌──────────────────┐
              │ Advisory Agent   │
              └──────────────────┘
```

| Agent | Responsibility |
|-------|---------------|
| **Ingestion** | Fetches raw data from external APIs, validates, and writes to the database. |
| **Forecast** | Runs ML models to produce 72-hour AQI forecasts per grid cell. |
| **Attribution** | Applies SHAP explainability to decompose pollutant contributions by source sector. |
| **Enforcement** | Identifies regulatory violations, clusters hot-spots, and ranks enforcement priorities. |
| **Advisory** | Generates multilingual, population-targeted health advisories from forecast + attribution results. |

### 4. ML Inference Layer (`ml/`)

- **Training**: XGBoost and LightGBM regressors trained on historical AQI, weather, and satellite features.
- **Inference**: Models are serialized with `joblib` and loaded at startup; predictions served via FastAPI endpoints.
- **Explainability**: SHAP TreeExplainer produces per-feature contribution vectors for each prediction.

### 5. Data Pipeline (`data_pipeline/`)

| Module | Source | Refresh Cadence |
|--------|--------|-----------------|
| `aqi/` | CPCB / OpenAQ monitoring stations | Every 15 min |
| `weather/` | OpenWeatherMap / IMD APIs | Every 30 min |
| `satellite/` | Sentinel-5P (NO₂, SO₂, aerosol index) | Daily |
| `nasa_firms/` | NASA FIRMS fire/thermal anomalies | Every 6 hours |
| `osm/` | OpenStreetMap roads, industries, land-use | Weekly |
| `preprocess/` |清洗, imputation, feature engineering | Triggered after each ingestion |
| `scheduler/` | APScheduler / Celery Beat cron jobs | Continuous |

### 6. Database (`database/`)

- **PostgreSQL 15** with **PostGIS 3.3** extension.
- Stores time-series AQI readings, geospatial boundaries (wards, hotspots), model metadata, and enforcement records.
- See [Database Schema](Database_Schema.md) for full table definitions.

## Data Flow

1. **Ingestion** — Scheduled jobs pull data from external APIs and insert raw records into staging tables.
2. **Preprocessing** — Missing values are imputed; features are engineered (rolling averages, wind-direction components, satellite band ratios).
3. **Forecasting** — The Forecast Agent loads the latest model artifacts and runs batch inference for all active grid cells, writing 72-hour predictions.
4. **Attribution** — The Attribution Agent runs SHAP on the forecast outputs and stores per-sector contribution vectors.
5. **Enforcement** — The Enforcement Agent cross-references attribution results with regulatory thresholds and existing violation records to produce a ranked action list.
6. **Advisory** — The Advisory Agent composes natural-language health advisories in three languages and pushes them to the notification service.
7. **Visualization** — The frontend polls the API (or connects via WebSocket) to render the map, charts, and advisory cards.

## Infrastructure

```
                  ┌──────────┐
                  │  Vercel   │ ◄── Frontend (Next.js)
                  └──────────┘
                       │
                  ┌──────────┐
                  │  Render   │ ◄── Backend (FastAPI)
                  └──────────┘
                       │
                  ┌──────────────┐
                  │  Render / AWS │ ◄── PostgreSQL + PostGIS
                  └──────────────┘
```

- **Frontend** is deployed on Vercel for edge-cached static generation.
- **Backend** runs on Render (or any Docker-compatible host) behind an Nginx reverse proxy.
- **Database** runs on a managed PostgreSQL service with PostGIS enabled, or self-hosted via Docker Compose in development.

## Security Considerations

- JWT-based authentication with short-lived access tokens (15 min) and refresh tokens (7 days).
- Role-based access control: `admin`, `analyst`, `public`.
- All external API keys stored in environment variables; never committed to source control.
- Rate limiting on public endpoints (100 req/min).
- HTTPS enforced in production; HSTS headers set by Nginx.
