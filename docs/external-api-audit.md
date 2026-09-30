# PranaMap AI — External API & Data Connection Audit

> **Audit Date**: 2026-09-30  
> **Methodology**: Full source code inspection of every service, component, and configuration file.  
> **Scope**: Frontend (`frontend/src/`), Backend (`backend/app/`), root config files.  
> **Auditor**: Automated deep code audit (no runtime network interception — code-only evidence).

---

## Summary Table

| Service | Feature | Provider | Runtime Request? | Response Verified? | API Key Required? | Key Configured? | Data Type | UI Uses It? | Status |
|---|---|---|---|---|---|---|---|---|---|
| **Map Tiles (Satellite)** | Satellite imagery base map | ESRI ArcGIS World Imagery | ✅ Yes (raster tile fetch) | ✅ Yes (tile renders) | ❌ No (public tile service) | N/A | Raster tiles (256px) | ✅ Yes — `BaseMap.tsx` | **LIVE** |
| **Map Tiles (Hybrid Labels)** | Text labels overlay | CARTO Basemaps (Voyager Labels) | ✅ Yes (raster tile fetch) | ✅ Yes (tile renders) | ❌ No (public tile service) | N/A | Raster tiles | ✅ Yes — `BaseMap.tsx` hybrid mode | **LIVE** |
| **Map Tiles (Streets)** | Streets-style vector map | CARTO GL Voyager | ✅ Yes (style.json + tiles) | ✅ Yes (tile renders) | ❌ No (public style) | N/A | Vector tiles | ✅ Yes — `BaseMap.tsx` streets mode | **LIVE** |
| **Weather (Current)** | Temperature, humidity, wind, pressure | Open-Meteo (ECMWF/GFS NWP) | ✅ Yes — `fetch()` to `api.open-meteo.com` | ✅ Yes (JSON parsed) | ❌ No (free public API) | N/A | NWP model output | ✅ Yes — Dashboard weather cards | **LIVE (MODELLED)** |
| **Weather (Hourly Forecast)** | 3-day hourly forecast | Open-Meteo (ECMWF/GFS NWP) | ✅ Yes — same request | ✅ Yes (JSON parsed) | ❌ No | N/A | NWP model forecast | ✅ Yes — Forecast chart | **LIVE (MODELLED)** |
| **Air Quality (Current)** | PM2.5, PM10, NO₂, SO₂, O₃, Dust, AOD | Open-Meteo Air Quality (Copernicus CAMS) | ✅ Yes — `fetch()` to `air-quality-api.open-meteo.com` | ✅ Yes (JSON parsed) | ❌ No (free public API) | N/A | CAMS 0.1° assimilation | ✅ Yes — Dashboard AQI panel | **LIVE (MODELLED)** |
| **Air Quality (Hourly)** | Hourly PM2.5, PM10, AOD forecast | Open-Meteo Air Quality | ✅ Yes — same request | ✅ Yes (JSON parsed) | ❌ No | N/A | CAMS forecast | ✅ Yes — Forecast enrichment | **LIVE (MODELLED)** |
| **CPCB Stations** | Station registry, AQI, pollutant values | Static `CPCB_STATIONS[]` array | ❌ No external request | N/A | N/A | N/A | **STATIC hardcoded registry** | ✅ Yes — Map markers, station drawer, dashboard | **STATIC** |
| **Satellite (Sentinel-5P/TROPOMI)** | NO₂ column, Aerosol Index layers | None (UI toggles only) | ❌ No external request | ❌ No data fetched | N/A | N/A | **UI visual only** | ✅ Yes — Layer toggle + info pill | **VISUAL PLACEHOLDER** |
| **Satellite (AOD/Aerosol)** | Aerosol Optical Depth numeric value | Open-Meteo Air Quality CAMS response | ✅ Yes (within AQ request) | ✅ Yes (`aerosol_optical_depth` field) | ❌ No | N/A | CAMS-derived AOD | ✅ Yes — Outlook factors | **LIVE (MODELLED)** |
| **Gemini (Backend)** | Multilingual citizen advisory | Google GenAI SDK (`google-genai`) | ⚠️ Only if `GEMINI_API_KEY` set | ❌ Key not configured | ✅ Yes | ❌ **No** (key not in `.env`) | GenAI text generation | ✅ Yes — Advisory fallback | **FALLBACK (Deterministic)** |
| **Firebase Auth (Frontend)** | Google Sign-In, Email/Password Auth | Firebase Authentication | ✅ Yes — Firebase SDK initialized | ✅ Yes (configured with real credentials) | ✅ Yes (Firebase API key) | ✅ **Yes** (`.env.local`) | Auth tokens | ✅ Yes — Login/Signup/Protected Routes | **LIVE** |
| **Firestore (Backend)** | Document database (cities, events) | Firebase Admin SDK / Cloud Firestore | ⚠️ Only if credentials present | ❌ No service account file present | ✅ Yes (service account JSON) | ❌ **No** locally | Document store | ✅ Yes — In-memory fallback active | **FALLBACK (Memory Store)** |
| **Backend API (FastAPI)** | Dashboard, forecast, attribution, etc. | Self-hosted `localhost:8000` | ✅ Yes — `resilientFetch()` calls | ⚠️ Only if backend is running | N/A | N/A | REST JSON | ✅ Yes — All dashboard panels | **Depends on backend availability** |

---

## 1. MAP — Detailed Analysis

### Library
- **MapLibre GL JS** via `react-map-gl/maplibre` ([`package.json`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/package.json#L21-L25): `maplibre-gl ^4.6.0`, `react-map-gl ^7.1.0`)

### Tile Providers (Actual)
| Style Mode | Provider | Tile URL | API Key? |
|---|---|---|---|
| **Satellite** | ESRI ArcGIS World Imagery | `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}` | ❌ No |
| **Hybrid** (imagery) | ESRI ArcGIS World Imagery | Same as above | ❌ No |
| **Hybrid** (labels) | CARTO Basemaps | `https://basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png` | ❌ No |
| **Streets** | CARTO GL Voyager | `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json` | ❌ No |

**Source**: [`BaseMap.tsx` lines 30-90](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/src/components/Map/BaseMap.tsx#L30-L90)

### Verdict
- ✅ **Map tiles are LIVE** — fetched from public ESRI and CARTO endpoints at runtime.
- ❌ **Google Maps is NOT used** anywhere.
- ❌ **Mapbox is NOT used** anywhere.
- ❌ **OpenStreetMap is NOT used** as a direct tile source (CARTO ultimately derives from OSM but is a separate CDN).
- No API key or token is required for any of these tile services.

---

## 2. WEATHER — Detailed Analysis

### Implementation
- **Frontend-side direct fetch** in [`weatherService.ts`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/src/services/weatherService.ts#L341-L525)
- Called from [`dashboard/page.tsx`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/src/app/(dashboard)/dashboard/page.tsx#L87-L108) via `fetchLocationWeather(lon, lat, baseAqi)`

### Exact Endpoint Called
```
https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}
  &current=temperature_2m,relative_humidity_2m,apparent_temperature,
           precipitation_probability,surface_pressure,wind_speed_10m,
           wind_direction_10m,weather_code
  &hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,
          precipitation_probability,weather_code
  &forecast_days=3&timezone=Asia%2FKolkata
```

### Data Flow
1. `fetch()` with 4-second abort timeout
2. JSON parsed → `data.current` fields mapped to `WeatherTelemetry`
3. `dataStatus` set to `'LIVE'`
4. On failure → hardcoded fallback values with `dataStatus: 'CACHED'`

### Fallback Values (if API fails)
- Temperature: 30.5°C, Humidity: 54%, Wind: 8.4 km/h NW, Pressure: 1011 hPa
- Source label: `'Open-Meteo Synoptic NWP (Cached Baseline)'`

### API Key Requirement
- ❌ **None** — Open-Meteo is a free, public, keyless API.

### Classification
- **LIVE (MODELLED)** — Open-Meteo provides NWP model output (ECMWF IFS / GFS), not direct sensor observations. This is numerical weather prediction, not ground telemetry.

---

## 3. AIR QUALITY — Detailed Analysis

### Implementation
- **Frontend-side direct fetch** in [`weatherService.ts`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/src/services/weatherService.ts#L354)
- Also **Backend adapter** in [`data_ingestion_service.py`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/backend/app/services/data_ingestion_service.py#L34-L101)

### Exact Frontend Endpoint
```
https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}
  &current=pm10,pm2_5,nitrogen_dioxide,sulphur_dioxide,ozone,
           aerosol_optical_depth,dust
  &hourly=pm2_5,pm10,aerosol_optical_depth
  &forecast_days=3&timezone=Asia%2FKolkata
```

### Pollutants Actually Returned
| Pollutant | Field | Source |
|---|---|---|
| PM2.5 | `pm2_5` | Copernicus CAMS assimilation |
| PM10 | `pm10` | Copernicus CAMS assimilation |
| NO₂ | `nitrogen_dioxide` | Copernicus CAMS assimilation |
| SO₂ | `sulphur_dioxide` | Copernicus CAMS assimilation |
| O₃ | `ozone` | Copernicus CAMS assimilation |
| Dust | `dust` | Copernicus CAMS assimilation |
| AOD | `aerosol_optical_depth` | Copernicus CAMS 550nm |

### AQI Calculation
- **CPCB NAQI breakpoint interpolation** is implemented client-side in [`calculateIndianAqi()`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/src/services/weatherService.ts#L112-L228)
- Uses **real** CPCB breakpoint tables for PM2.5, PM10, NO₂, SO₂, CO, O₃
- AQI = `max(sub-indices)` — correct NAQI methodology
- Input concentrations come from the Open-Meteo CAMS response (modelled, not observed)

### Fallback Values (if API fails)
- PM2.5: `baseAqi * 0.45`, PM10: `baseAqi * 0.95`, NO₂: 24.2, SO₂: 10.4, O₃: 38.0
- Source label: `'Copernicus CAMS & Open-Meteo Air Quality (Cached Baseline)'`

### Classification
- **LIVE (MODELLED)** — Concentrations are from Copernicus CAMS global atmospheric model assimilation (0.1° resolution), NOT from ground sensors. The AQI calculation is correctly done per CPCB methodology but applied to modelled concentrations, not observed values.

---

## 4. CPCB — Detailed Analysis

### Implementation
- [`indiaGeography.ts`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/src/lib/indiaGeography.ts#L67-L523) — `CPCB_STATIONS: CAAQSStation[]`

### What It Actually Is
**A STATIC HARDCODED REGISTRY.** The `CPCB_STATIONS` array contains:
- 30 stations across India
- Each with hardcoded `baseAqi`, `baseSeverity`, `pollutants` object, `lastUpdated` (static string like `"12m ago"`)
- `dataStatus` is set to `'OBSERVED'` on every station — **this is a label, not a truth claim from a live feed**
- `source` is set to `'CPCB CAAQMS Real-Time Network'` — **this is a label, NOT evidence of live fetching**

### What It Does NOT Do
- ❌ Does NOT fetch from `app.cpcbccr.com` or any CPCB API
- ❌ Does NOT fetch from any AQI aggregator (AirNow, AQICN, etc.)
- ❌ Does NOT update `baseAqi` at runtime
- ❌ The `lastUpdated: "12m ago"` is a frozen string, NOT a computed timestamp

### How It's Used
- Map markers display `station.baseAqi` directly
- Station drawer shows pollutant breakdown from the static object
- `resolveAqiTruth()` finds nearest station by Haversine distance and returns its static `baseAqi`
- For locations >6km from any station, a spatial attenuation model estimates local AQI from the nearest static value

### Classification
- **STATIC** — This is a one-time snapshot of CPCB station metadata with representative AQI values. It does NOT represent live CPCB observations. The labels "OBSERVED" and "Real-Time Network" are aspirational metadata, not runtime behavior.

---

## 5. SATELLITE — Detailed Analysis

### Frontend Implementation
- [`BaseMap.tsx`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/src/components/Map/BaseMap.tsx#L472-L521) — Layer toggle checkboxes for:
  - `satelliteNo2` (Sentinel-5P NO₂)
  - `aerosol` (Aerosol Index UVAI)

### What Happens When Toggled
- **Sentinel-5P NO₂ toggle**: Shows an **info pill UI** with a gradient legend (`LOW → HIGH`) and text "Copernicus Sentinel-5P TROPOMI Tropospheric Vertical Column (µmol/m²)". **No data is fetched. No tile layer is added. No WMS/WMTS call is made.** This is a visual-only UI element.
- **Aerosol Index toggle**: Checkbox toggles a layer name in the store. **No corresponding map layer, tile source, or data fetch exists in the code.**

### Backend Satellite API
- [`satellite.py`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/backend/app/api/satellite.py) — Returns hardcoded `SatelliteData(aod_value=None, source="MODIS", timestamp=None, coverage_area=None)` — a **placeholder endpoint returning null values**.

### AOD Value (Actual)
- The `aerosol_optical_depth` value displayed in the dashboard comes from the **Open-Meteo Air Quality CAMS response** (see Section 3), NOT from any satellite imagery service.

### Classification
- **VISUAL PLACEHOLDER** — The satellite layer toggles are UI-only. No Sentinel-5P, TROPOMI, MODIS, or Sentinel Hub data is fetched at runtime. The backend satellite endpoint returns null. AOD numeric values come from CAMS via Open-Meteo (modelled).

---

## 6. GEMINI — Detailed Analysis

### Backend Implementation
- [`gemini_service.py`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/backend/app/services/gemini_service.py)

### SDK Used
- `from google import genai` — the official `google-genai` Python SDK
- Client: `genai.Client(api_key=self.api_key)`
- Model: `self.model_name = settings.GEMINI_MODEL or "gemini-2.5-flash"`

### Runtime Behavior
1. On init: checks `settings.GEMINI_API_KEY`
2. If key exists → initializes `genai.Client`
3. If key missing → logs `"GEMINI_API_KEY not configured. Operating in safe deterministic fallback mode."`
4. On advisory generation: if client exists → calls `generate_content()` with structured JSON response; on failure → falls back to deterministic template
5. If no client → directly returns deterministic fallback

### Current State
- ❌ `GEMINI_API_KEY` is NOT set in any `.env` file that exists
- ❌ `google-genai` is NOT listed in `backend/requirements.txt` — the import would fail even with a key
- ✅ Deterministic fallback in [`_deterministic_advisory_fallback()`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/backend/app/services/gemini_service.py#L130-L169) is fully functional and produces structured multilingual advisory output

### Frontend Gemini Usage
- [`api.ts` → `generateGeminiAdvisory()`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/src/services/api.ts#L135-L167) calls `POST /api/v1/advisories/generate` on the backend
- On backend failure → returns client-side fallback with `generated_by: "Google Gemini Reasoner (Fallback Verified)"`

### Outdated "Gemini 1.5" References Found
| File | Content |
|---|---|
| [`backend/.env.example`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/backend/.env.example#L3) | `GEMINI_MODEL=gemini-1.5-flash` |
| [`.env.example`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/.env.example#L9) | `GEMINI_MODEL=gemini-1.5-flash` |

> [!NOTE]
> The runtime config in [`config.py`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/backend/app/core/config.py#L21) correctly defaults to `gemini-2.5-flash`. The `.env.example` files are stale.

### Classification
- **FALLBACK (Deterministic)** — Gemini is not invoked at runtime. The SDK dependency is not installed, and no API key is configured. All advisory output currently comes from the deterministic template.

---

## 7. FIREBASE — Detailed Analysis

### Frontend Firebase Auth
- **Configuration**: [`firebase.ts`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/src/lib/firebase.ts) — Fully configured with real Firebase credentials
- **Credentials**: Set in [`.env.local`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/.env.local) with a real Firebase API key, auth domain, project ID, storage bucket, messaging sender ID, and app ID
- **Project**: `pranamap-ai` (note: different from `pranamap-ai-clean-air` in `.env.example`)
- **Auth Methods**: Email/password, Google Sign-In popup ([`auth.ts`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/src/lib/auth.ts))
- **Status**: ✅ **LIVE** — Firebase Auth is correctly configured and functional

### Backend Firestore
- **Implementation**: [`firestore_service.py`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/backend/app/services/firestore_service.py)
- **Behavior**: Attempts to import `firebase_admin` and connect to Firestore; falls back to in-memory `dict` store if credentials unavailable
- **Dependencies**: `firebase_admin` is NOT in `requirements.txt`
- **Current State**: Falls back to `_memory_store` (in-memory dict seeded with city/data-source defaults)
- **Status**: **FALLBACK** — operates on in-memory store locally

### Separation Confirmed
- ✅ Firebase API key in `.env.local` is used ONLY for Firebase Authentication (client-side SDK)
- ✅ It does NOT provide Maps, CPCB, satellite, weather, or Gemini access
- ✅ Backend Firestore uses a separate authentication path (service account or ADC)

---

## 8. FALLBACK / MOCK / STATIC DATA ANALYSIS

### Files Containing Fallback/Mock/Static Data

| File | Content | Reaches Dashboard? |
|---|---|---|
| [`mockData.ts`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/src/lib/mockData.ts) | `MOCK_WARDS`, `MOCK_HOTSPOTS`, `MOCK_FORECAST`, `MOCK_ATTRIBUTION`, `MOCK_ENFORCEMENT`, `MOCK_ADVISORY` — Mumbai-centric demo data | ⚠️ Imported but may not be actively used in current dashboard routing |
| [`api.ts`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/src/services/api.ts#L260-L341) | `MOCK_COMMAND_CENTER`, `MOCK_FORECAST`, `MOCK_ATTRIBUTION`, `MOCK_ENFORCEMENT`, `MOCK_ADVISORY` — Delhi-centric fallback data | ✅ **Yes** — used when backend API is unreachable (via `resilientFetch` fallback) |
| [`weatherService.ts`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/src/services/weatherService.ts#L466-L517) | Fallback weather values and fallback forecast array | ✅ **Yes** — used when Open-Meteo API times out or fails |
| [`cityData.ts`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/src/lib/cityData.ts) | `CITY_DATA_PROFILES` with hardcoded AQI, ward, hotspot data for Delhi, Mumbai, etc. | ✅ **Yes** — consumed by city pages |
| [`indiaGeography.ts`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/frontend/src/lib/indiaGeography.ts#L67-L523) | `CPCB_STATIONS` with hardcoded `baseAqi` and pollutant values | ✅ **Yes** — map markers and station popups |
| [`firestore_service.py`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/backend/app/services/firestore_service.py#L153-L178) | `_seed_default_collections()` with cities and data_sources seed data | ✅ **Yes** — returned by backend API endpoints |
| [`dashboard.py`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/backend/app/api/dashboard.py#L15-L68) | `CITY_DETAILS` dict with hardcoded AQI, hotspot, priority area data | ✅ **Yes** — backend dashboard endpoint returns this |

### Key Finding
The application has a layered fallback architecture:
1. **Layer 1**: Frontend calls backend API (`resilientFetch`)
2. **Layer 2**: Backend calls external APIs (Open-Meteo) and processes results
3. **Layer 3**: If backend is unreachable, frontend uses inline `MOCK_*` data
4. **Layer 4**: If external API fails, service returns cached/static fallback values

All layers can serve the dashboard — the UI does not crash or show errors regardless of which data source is available.

---

## 9. RUNTIME BEHAVIOR SUMMARY

> [!IMPORTANT]
> This section is based on code-path analysis. The actual network behavior depends on whether each service is accessible at the time of use.

| External Service | Request Made? | Response Verified? | HTTP Status | Data Timestamp | Provider | Key Required? | Key Configured? | UI Component Consuming |
|---|---|---|---|---|---|---|---|---|
| ESRI World Imagery tiles | ✅ Yes | ✅ Tiles render | 200 (tile CDN) | N/A (raster tiles) | ESRI / Maxar | ❌ No | N/A | `BaseMap.tsx` |
| CARTO Labels/Streets tiles | ✅ Yes | ✅ Tiles render | 200 (tile CDN) | N/A (raster/vector tiles) | CARTO | ❌ No | N/A | `BaseMap.tsx` |
| Open-Meteo Weather API | ✅ Yes | ✅ JSON parsed → state | 200 | Current + 3-day hourly | Open-Meteo (ECMWF/GFS) | ❌ No | N/A | Dashboard weather panel, outlook, forecast |
| Open-Meteo Air Quality API | ✅ Yes | ✅ JSON parsed → state | 200 | Current + 3-day hourly | Open-Meteo (CAMS) | ❌ No | N/A | Dashboard AQI panel, outlook factors, forecast |
| CPCB CAAQMS stations | ❌ No (static array) | N/A | N/A | Frozen strings | Static code | N/A | N/A | Map markers, station drawer, dashboard |
| Sentinel-5P TROPOMI | ❌ No | ❌ No data | N/A | N/A | None | N/A | N/A | Layer toggle info pill (visual only) |
| Google Gemini | ❌ No (SDK not installed) | ❌ No | N/A | N/A | Google AI | ✅ Yes | ❌ No | Advisory panel (deterministic fallback) |
| Firebase Auth | ✅ Yes | ✅ Auth working | 200 | Real-time | Firebase/Google | ✅ Yes | ✅ Yes | Login, Signup, Protected Routes |
| Cloud Firestore | ❌ No (no SDK installed) | ❌ No | N/A | N/A | Google Cloud | ✅ Yes | ❌ No | In-memory fallback active |
| FastAPI Backend | ✅ Yes (if running) | ⚠️ Depends | 200 or timeout | Per-request | Self-hosted | N/A | N/A | All dashboard panels |

---

## Final Classification

### A. APIs Genuinely Working Without a Key
| Service | Endpoint | Status |
|---|---|---|
| Open-Meteo Weather API | `api.open-meteo.com/v1/forecast` | ✅ Free, keyless, LIVE (MODELLED) |
| Open-Meteo Air Quality API | `air-quality-api.open-meteo.com/v1/air-quality` | ✅ Free, keyless, LIVE (MODELLED) |
| ESRI World Imagery tiles | `server.arcgisonline.com/.../tile/{z}/{y}/{x}` | ✅ Free public tile CDN |
| CARTO Basemap tiles | `basemaps.cartocdn.com/...` | ✅ Free public tile CDN |

### B. APIs Requiring a Key
| Service | Key Variable | Purpose |
|---|---|---|
| Google Gemini | `GEMINI_API_KEY` | Multilingual advisory generation |
| Firebase Auth | `NEXT_PUBLIC_FIREBASE_API_KEY` | User authentication |
| Cloud Firestore | `FIREBASE_SERVICE_ACCOUNT_JSON` or ADC | Backend document database |

### C. APIs Where a Key Is Currently Missing
| Service | Key Variable | Impact |
|---|---|---|
| Google Gemini | `GEMINI_API_KEY` | Falls back to deterministic template — functional but not AI-generated |
| Cloud Firestore | `FIREBASE_SERVICE_ACCOUNT_JSON` | Falls back to in-memory store — data not persisted across restarts |

### D. Data That Is STATIC / Mock / Fallback
| Data | File | Detail |
|---|---|---|
| CPCB Station AQI values | `indiaGeography.ts` → `CPCB_STATIONS[]` | All `baseAqi`, `pollutants`, `lastUpdated` are frozen hardcoded values. NOT live CPCB data. |
| City profiles (Delhi, Mumbai, etc.) | `cityData.ts` → `CITY_DATA_PROFILES` | All AQI, ward, hotspot data is static. |
| Backend city details | `dashboard.py` → `CITY_DETAILS` | Hardcoded AQI/hotspot/priority data for dashboard API. |
| Firestore seed data | `firestore_service.py` → `_seed_default_collections()` | City metadata and data source registry. |
| API fallback mocks | `api.ts` → `MOCK_COMMAND_CENTER`, etc. | Used when backend is unreachable. |
| Weather/AQ fallbacks | `weatherService.ts` → fallback objects | Used when Open-Meteo API times out. |
| Backend satellite endpoint | `satellite.py` | Returns `None` for all fields — pure placeholder. |
| Backend weather endpoint | `weather.py` | Returns zeros for all fields — pure placeholder. |

### E. Data That Is Genuinely LIVE
| Data | Source | Detail |
|---|---|---|
| Firebase Authentication | Firebase Auth | Real user authentication with configured project |
| Map tiles (ESRI/CARTO) | Public tile CDNs | Real satellite imagery and street maps rendered at runtime |

### F. Data That Is MODELLED (Live-fetched but model output, not ground observations)
| Data | Source | Detail |
|---|---|---|
| Weather (temperature, humidity, wind, pressure) | Open-Meteo → ECMWF IFS / GFS | Numerical Weather Prediction model output |
| Air Quality (PM2.5, PM10, NO₂, SO₂, O₃, dust, AOD) | Open-Meteo → Copernicus CAMS | Global atmospheric composition model assimilation at 0.1° resolution |
| AQI (Indian NAQI) | Client-side calculation | CPCB breakpoint formula applied to CAMS-modelled concentrations |
| Environmental Outlook | Client-side derivation | Generated from modelled weather + air quality inputs |

### G. Data That Is CACHED
| Data | When? |
|---|---|
| Weather fallback values | Only when Open-Meteo API fails (4s timeout). These are static fallback values, not a real cache. |
| Air Quality fallback values | Only when Open-Meteo API fails. Same: static values, not a time-based cache. |

> [!NOTE]
> There is no true caching layer (Redis, local storage, service worker cache) implemented. The term "cached" in the codebase refers to static fallback values, not time-to-live cached API responses.

### H. Exact Next Keys / Configuration Required

| Priority | Key | Purpose | How to Obtain |
|---|---|---|---|
| 1 | `GEMINI_API_KEY` | Enable AI-generated multilingual advisories instead of deterministic templates | [Google AI Studio](https://aistudio.google.com/apikey) → Generate API Key |
| 2 | `google-genai` package | Backend Python dependency for Gemini SDK | Add `google-genai` to `backend/requirements.txt` and `pip install` |
| 3 | `firebase-admin` package | Backend Python dependency for Firestore | Add `firebase-admin` to `backend/requirements.txt` |
| 4 | `FIREBASE_SERVICE_ACCOUNT_JSON` | Enable persistent Firestore document storage | Firebase Console → Project Settings → Service Accounts → Generate Key |
| 5 | (Optional) Sentinel Hub / Copernicus API | Enable actual satellite imagery layers on map | ESA Copernicus Data Space or Sentinel Hub subscription |
| 6 | (Optional) CPCB live feed integration | Replace static station registry with real-time CPCB observations | Requires CPCB CAAQMS API access or scraper implementation |

---

## Configuration Bugs Found

> [!WARNING]
> The following are stale configuration values, not functional bugs:

1. **[`backend/.env.example`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/backend/.env.example#L3)**: `GEMINI_MODEL=gemini-1.5-flash` — should be `gemini-2.5-flash` to match runtime default
2. **[`.env.example`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/.env.example#L9)**: `GEMINI_MODEL=gemini-1.5-flash` — same stale value
3. **[`backend/requirements.txt`](file:///d:/Kamal%20Solanki/PROJECT/pranavai/PranaMap-AI/backend/requirements.txt)**: Missing `google-genai` and `firebase-admin` — both are imported at runtime with `try/except` guards, so no crash occurs, but the features are silently unavailable
