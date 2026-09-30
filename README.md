<div align="center">

# 🫁 PranaMap AI
### **Environmental Intelligence & Decision Support Platform for Indian Cities**

*Google Cloud & Google AI Hackathon Track: Clean Air & Climate Resilience*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Cloud Firestore](https://img.shields.io/badge/Cloud_Firestore-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[Live Dashboard](http://localhost:3000) • [System Architecture](docs/architecture.md) • [Demo Script](docs/demo_script.md) • [Data Pipeline](docs/data_pipeline.md) • [AI & ML Architecture](docs/ai_system.md) • [Firestore Guide](docs/firebase.md)

---

</div>

## 📌 Executive Overview

Urban air pollution in Indian cities is a recurring, severe environmental health and climate resilience crisis. During winter atmospheric inversion events, particulate concentrations ($\text{PM}_{2.5}$ and $\text{PM}_{10}$) routinely cross 400+ AQI (Severe), causing immense respiratory distress, school closures, and economic losses across the Indo-Gangetic plain and industrial belts.

### The Four Operational Questions for City Authorities

PranaMap AI equips municipal authorities and state pollution control boards with data-driven answers to four fundamental questions:

1. **WHERE is air quality deteriorating?**
   - Continuous ground sensor aggregation across wards and automated critical zone ranking (e.g., *Anand Vihar*, *Dwarka Sector 8*).
2. **WHY is it deteriorating?**
   - Multi-modal source attribution breaking down Traffic, Construction, Biomass, and Industrial contributions coupled with physical evidence (wind corridors, traffic congestion levels, satellite AOD).
3. **WHAT is likely to happen next?**
   - Calibrated 72-hour predictive forecasting with diurnal curve decomposition and peak hazard window identification (e.g., *16:00–20:00 IST*).
4. **WHAT action should authorities and citizens take?**
   - Prioritized operational interventions assigned to municipal response teams, scenario impact simulations, and Google Gemini-powered multilingual citizen advisories in English, Hindi, and Marathi.

---

## 🔄 Core Intelligence Loop

```
OBSERVE ───► DETECT ───► PREDICT ───► EXPLAIN ───► RECOMMEND ───► COMMUNICATE ───► MEASURE IMPACT
 (CPCB /      (Hotspot     (72h XGBoost/  (SHAP /       (Operational     (Google Gemini     (What-If Box
Open-Meteo)   Ranking)      Ensemble)     Evidence)    Interventions)    EN / HI / MR)      Simulation)
```

---

## ✨ Key Capabilities & Product Features

| Module | Purpose & Capabilities |
| :--- | :--- |
| **Command Center** | Geospatial cockpit with MapLibre rendering, interactive hotspot selection, live situation briefs, and priority zone rankings. |
| **Air Quality Analysis** | Multi-pollutant speciation ($\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, $\text{O}_3$) benchmarked against India NAAQS standards. |
| **72-Hour Forecast Engine** | Calibrated time-series forecast with expanding confidence bands, peak window calculation, and transparent feature contribution factors. |
| **Source Attribution (XAI)** | Evidence-driven percentage breakdown across Traffic, Construction, Biomass, and Industry grounded in wind vectors and satellite data. |
| **Intervention Priorities** | Actionable municipal pipeline assigned to generic operational teams (`Traffic Control Team`, `Municipal Dust Control Team`, `Environmental Inspection Team`) with full lifecycle tracking (`Recommended` → `Reviewed` → `Approved` → `Dispatched` → `Completed`). |
| **Impact Simulator** | "What-If" scenario simulator estimating localized AQI reductions under combined interventions using documented attenuation assumptions. |
| **Citizen Advisories** | Vernacular public health guidance in **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)** generated using Google Gemini with certified health precautions. |
| **Multi-City Pan-India Network** | Natively engineered for 9 major Indian metropolitan zones: Delhi NCR, Mumbai, Ahmedabad, Jaipur, Lucknow, Kolkata, Bengaluru, Hyderabad, and Chennai. |
| **Data Source Transparency** | Complete audit of telemetry lineage across CPCB CAAQMS, Open-Meteo, Copernicus Sentinel-5P, NASA FIRMS, Google Gemini, and Cloud Firestore. |

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PRESENTATION LAYER                                     │
│     Next.js 14 App Router · React 18 · TypeScript · MapLibre GL · Recharts · Tailwind   │
│  ┌────────────────────┐ ┌────────────────────┐ ┌───────────────────┐ ┌───────────────┐ │
│  │   Command Center   │ │  Forecast Engine   │ │ Source Attribution│ │ Interventions │ │
│  └────────────────────┘ └────────────────────┘ └───────────────────┘ └───────────────┘ │
│  ┌────────────────────┐ ┌────────────────────┐ ┌───────────────────┐ ┌───────────────┐ │
│  │  Citizen Advisory  │ │   Cities Network   │ │   Data Sources    │ │Impact Simulator││
│  └────────────────────┘ └────────────────────┘ └───────────────────┘ └───────────────┘ │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ Typed REST API (/api/v1)
┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
│                                APPLICATION SERVICES LAYER                              │
│                    FastAPI · Pydantic v2 · AsyncIO · Python 3.12                       │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                            MULTI-AGENT ORCHESTRATOR                              │  │
│  │  1. Ingestion Agent  ──► 2. Forecast Agent      ──► 3. Attribution Agent        │  │
│  │  4. Intervention Agent──► 5. Advisory Agent (GenAI)──► 6. Impact Simulation Agent│  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────┬────────────────────────────────────────┬───────────────────────┘
                        │                                        │
┌───────────────────────▼──────────────┐  ┌──────────────────────▼───────────────────────┐
│       AI & MACHINE LEARNING          │  │       PERSISTENCE & TELEMETRY LAYER          │
│ • Google Gemini (Reasoning & NLP)    │  │ • Google Cloud Firestore (Collections)       │
│ • Atmospheric Diurnal Regression     │  │ • CPCB CAAQMS Ground Sensor Network (27 stn) │
│ • Empirical Receptor Apportionment   │  │ • Open-Meteo / ECMWF Boundary Layer Model    │
│ • Empirical Linear Box Dispersion Sim│  │ • Copernicus Sentinel-5P Satellite Troposphere│
└──────────────────────────────────────┘  └──────────────────────────────────────────────┘
```

---

## 🤖 Google Technology Integration

### 1. Google Gemini
- **Official SDK**: Utilizes the official `google-genai` SDK on the backend.
- **Zero Frontend Secret Exposure**: All API keys remain isolated in the server environment.
- **Structured Grounding**: Injects verified sensor telemetry (AQI, particulate speciation, wind corridors) into Gemini prompts and validates outputs using Pydantic schemas.
- **Vernacular Precision**: Generates natural, idiomatically accurate Hindi and Marathi advisories without mechanical translation artifacts.

### 2. Google Cloud Firestore
- **Application Data Layer**: Manages persistent collections for `cities`, `air_quality`, `weather`, `hotspots`, `forecasts`, `attributions`, `interventions`, `advisories`, and `simulation_runs`.
- **Resilient Fallback**: Out-of-the-box in-memory document store ensures immediate execution locally and in offline judging environments.

### 3. Google Cloud Run Ready
- Containerized Docker deployment optimized for serverless execution in Google Cloud Mumbai (`asia-south1`).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 18.x
- Python >= 3.10
- Git

### 1. Clone & Setup Repository
```bash
git clone https://github.com/kamalsolanki143/PranaMap-AI.git
cd PranaMap-AI
git checkout feature/pranamap-platform-redesign

# Configure environment variables
cp .env.example .env
```

### 2. Start Backend API Server
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI interactive documentation is available at: `http://localhost:8000/docs`

### 3. Start Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Open your browser at: `http://localhost:3000`

---

## 🧪 Testing & Verification

### Run Backend Unit & API Tests
```bash
# In repository root
backend\.venv\Scripts\python -m pytest tests/backend/test_api.py -v
```
*Result: 12 tests covering `/health`, `/cities`, `/dashboard`, `/forecast`, `/attribution`, `/interventions`, `/simulations`, `/advisories`, `/data-sources`, and `/orchestrate`.*

### Run ML Training & Feature Engineering Tests
```bash
backend\.venv\Scripts\python -m pytest tests/ml/test_training.py -v
```
*Result: 13 tests covering feature engineering, cyclical encoding, lag features, rolling statistics, model persistence, and time-series validation.*

### Run Frontend Static Production Build
```bash
cd frontend
npm run build
```
*Result: All 18 routes statically compiled with 0 TypeScript/lint errors.*

---

## 📂 Repository Structure

```
PranaMap-AI/
├── backend/                  # FastAPI Application Service
│   ├── app/
│   │   ├── api/              # RESTful API routers (v1)
│   │   ├── core/             # Configuration & environment settings
│   │   ├── database/         # Models & database sessions
│   │   └── services/         # Gemini, Firestore, Forecast, Attribution, Ingestion
│   ├── Dockerfile            # Container definition for Google Cloud Run
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Next.js 14 App Router UI
│   ├── src/
│   │   ├── app/              # Routes: dashboard, forecast, attribution, interventions, advisory, cities
│   │   ├── components/       # Reusable GovTech UI tokens, maps, and charts
│   │   ├── services/         # Resilient API service client
│   │   ├── store/            # Lightweight Zustand global state
│   │   └── styles/           # Modern GovTech design tokens (globals.css)
│   ├── package.json
│   └── tailwind.config.ts
├── docs/                     # Comprehensive Architecture & Strategy Docs
│   ├── architecture.md       # Full architectural blueprint
│   ├── data_pipeline.md      # Telemetry ingestion & normalization
│   ├── ai_system.md          # Gemini, forecasting, and XAI models
│   ├── firebase.md           # Cloud Firestore collections & schema
│   ├── deployment.md         # Local and Google Cloud Run instructions
│   ├── demo_script.md        # 3-5 minute live hackathon pitch script
│   └── product_strategy.md   # Market need, GovTech vision, and impact
├── ml/                       # Machine Learning, inference, and SHAP pipelines
├── scripts/                  # Model training orchestrators
└── tests/                    # Backend API and ML test suites
```

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
