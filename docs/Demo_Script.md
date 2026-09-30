# PranaMap AI — Hackathon Live Demonstration Script

**Target Duration**: 3 to 5 minutes  
**Target Track**: Google Cloud / Google AI Hackathon — Clean Air & Climate Resilience

---

## Chronological Pitch & Demo Flow

### 0:00–0:20 — The Problem (Urgency & Scale)
- **Speaker**: "Indian cities face severe, recurring air pollution crises. Every winter, AQI across northern and central plains crosses 400. Yet municipal authorities often operate reactively—issuing emergency blanket restrictions days after air has already reached hazardous levels. Authorities lack a unified system that explains *where*, *why*, and *what action to take before* conditions peak."

### 0:20–0:50 — PranaMap Overview & Landing
- **Action**: Open PranaMap AI landing page.
- **Speaker**: "PranaMap AI transforms environmental governance from static reporting into predictive decision intelligence. It closes the loop: Observe, Detect, Predict, Explain, Act, Communicate, and Measure Impact."
- **Action**: Click **Explore Command Center**.

### 0:50–1:30 — Command Center & Hotspot Detection
- **Action**: Command Center loads with Delhi NCR selected.
- **Speaker**: "Here in the Command Center, the geospatial map is the primary cockpit. The top status displays **LIVE** CAAQMS data freshness. On the right, the Situation Brief immediately highlights Delhi's current AQI of 184, rising 12% over the last 6 hours, with Anand Vihar identified as the Critical Zone at AQI 342."
- **Action**: Click on the **Anand Vihar** red hotspot on the map.
- **Speaker**: "Notice how selecting Anand Vihar opens an immediate evidence panel—detailing PM2.5 at 218 µg/m³, arterial idling traffic, and low wind dispersion."

### 1:30–2:00 — 72-Hour Calibrated Forecast
- **Action**: Click **Forecast** in the sidebar.
- **Speaker**: "Under the Forecast tab, we don't display a single generic number. We provide a calibrated 72-hour trajectory with widening confidence bounds and an identified peak hazard window of 16:00 to 20:00 IST. Crucially, we explain *why*: low wind speed (<8 km/h), high humidity, and evening traffic accumulation all act as risk-increasing features."

### 2:00–2:30 — Source Attribution & Physical Evidence
- **Action**: Click **Pollution Sources** in the sidebar.
- **Speaker**: "Next: Why is Anand Vihar deteriorating? Our attribution engine calculates source contributions: Traffic 41%, Construction 24%, Biomass 19%, Industrial 16%. Below, we ground this in verifiable physical evidence—local wind corridors, Level-4 congestion on arterial roads, and satellite aerosol optical depth."

### 2:30–3:10 — Intervention Priorities & Lifecycle
- **Action**: Click **Interventions** in the sidebar.
- **Speaker**: "Rather than leaving authorities with passive charts, PranaMap provides actionable operational priorities. Generic operational units—like the Traffic Control Team and Municipal Dust Control Team—receive targeted recommendations with estimated localized AQI reductions. Authorities can transition actions from Recommended to Reviewed, Approved, and Dispatched, persisting state in Cloud Firestore."
- **Action**: Click on a status dropdown and change a status to **Approved**.

### 3:10–3:40 — Policy Scenario Impact Simulation
- **Action**: Scroll down to the **What-If Scenario Simulator** on the Interventions page.
- **Speaker**: "Before dispatching heavy machinery, officers can run scenario simulations. By selecting traffic diversion, construction control, and misting guns, the empirical box dispersion model estimates an AQI reduction from 186 down to 148 (-38 AQI), clearly disclosing all physical assumptions."

### 3:40–4:20 — Gemini Multilingual Citizen Advisories
- **Action**: Click **Citizen Advisories** in the sidebar.
- **Speaker**: "Environmental intelligence must reach citizens in their native language. Powered by Google Gemini on the backend, PranaMap generates natural, idiomatically accurate advisories in English, Hindi (हिंदी), and Marathi (मराठी) tailored for schools, hospitals, and vulnerable elderly groups."
- **Action**: Toggle between **English**, **हिंदी**, and **मराठी** tabs. Show the natural Hindi phrasing.
- **Action**: Click **Simulate Broadcast** to show the demonstration dissemination log.

### 4:20–4:50 — Pan-India Network Scale & Data Transparency
- **Action**: Click the **City Selector** in the header or visit the **Cities** tab. Switch from **Delhi NCR** to **Mumbai** or **Ahmedabad**.
- **Speaker**: "PranaMap is engineered for pan-India scale. We natively support 9 major metropolitan zones—including Mumbai, Ahmedabad, Bengaluru, and Chennai—each with distinct topography and emission baselines."
- **Action**: Click **Data Sources** in the sidebar.
- **Speaker**: "Every data stream is transparently audited—CPCB sensors, Open-Meteo, Copernicus Sentinel-5P, NASA FIRMS, and Google Cloud services."

### 4:50–5:00 — Conclusion & Impact
- **Speaker**: "PranaMap AI bridges the critical gap between environmental data and municipal climate action. Built on Google Gemini and Google Cloud, it equips Indian cities to protect public health and build climate resilience. Thank you."
