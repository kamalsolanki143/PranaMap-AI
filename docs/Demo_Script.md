# PranaMap AI — Demo Script

This document provides a step-by-step walkthrough for demonstrating the PranaMap AI platform. It is designed for a 10–15 minute live demo.

---

## Pre-Demo Checklist

- [ ] Backend server running at `http://localhost:8000`
- [ ] Frontend running at `http://localhost:3000`
- [ ] Database seeded with sample data (stations, readings, forecasts)
- [ ] Browser open with PranaMap loaded and logged in as `analyst` role
- [ ] Stable internet connection (for satellite/weather data)
- [ ] Second browser tab open with the API docs (`http://localhost:8000/docs`)

---

## Demo Flow

### Act 1 — Live AQI Map (3 minutes)

**Goal:** Show real-time air quality monitoring across the city.

1. **Open the Live Map**
   - Navigate to `http://localhost:3000`.
   - Point out the color-coded station markers:
     - Green = Good (0–50)
     - Yellow = Moderate (51–100)
     - Orange = Unhealthy for Sensitive Groups (101–150)
     - Red = Unhealthy (151–200)
     - Purple = Very Unhealthy (201–300)
     - Maroon = Hazardous (301+)

2. **Select a Station**
   - Click on a station marker (e.g., "Mazgaon, Mumbai").
   - Show the popup with current AQI, dominant pollutant, and meteorological data.

3. **View Historical Trend**
   - In the station detail panel, switch to the "History" tab.
   - Show the 24-hour AQI trend line chart.
   - Point out the spike during morning rush hour.

4. **Talk Track:**
   > "This is the live monitoring dashboard. Each dot represents an air quality station. We're pulling data from CPCB monitors every 15 minutes. You can see how AQI fluctuates with traffic patterns and weather conditions."

---

### Act 2 — 72-Hour Forecast (3 minutes)

**Goal:** Demonstrate the ML-powered forecasting capability.

1. **Open the Forecast View**
   - Click "Forecasts" in the navigation bar.
   - Select a station from the dropdown.

2. **Show the Forecast Chart**
   - Point out the 72-hour AQI prediction line with 80% confidence bands.
   - Highlight the next 24 hours (high confidence) vs. 48–72 hours (wider bands).

3. **Toggle Pollutants**
   - Switch between PM2.5, PM10, NO₂ views.
   - Show how different pollutants have different forecast profiles.

4. **Explain the Model**
   - Mention XGBoost + LightGBM ensemble.
   - Show the model performance metrics card (MAE, R²).

5. **Talk Track:**
   > "Our ensemble model combines XGBoost and LightGBM, trained on historical AQI, weather, and satellite data. The shaded area represents the 80% confidence interval. Notice how uncertainty grows further into the future — this is expected and honestly communicated to users."

---

### Act 3 — Source Attribution (2 minutes)

**Goal:** Show explainable AI decomposing pollution by source.

1. **Open Attribution Panel**
   - From a station detail view, click "Source Attribution".

2. **Show the Sector Breakdown**
   - Display the donut chart with sector percentages:
     - Vehicular: 34%
     - Industrial: 28%
     - Construction: 18%
     - Residential: 12%
     - Natural: 8%

3. **Show SHAP Waterfall Chart**
   - Scroll to the SHAP feature importance visualization.
   - Point out the top drivers: traffic density (+12.8), industrial emissions (+9.3), wind speed (-4.2).

4. **Talk Track:**
   > "This is where explainable AI becomes actionable. We use SHAP to decompose every forecast into contribution by source sector. Local officials can see that vehicular emissions are the biggest contributor right now, and that wind is actually helping disperse pollutants — the negative SHAP value means it's pulling AQI down."

---

### Act 4 — Enforcement Dashboard (2 minutes)

**Goal:** Show automated violation detection and prioritization.

1. **Open the Enforcement Dashboard**
   - Click "Enforcement" in the navigation.

2. **Show the Violation List**
   - Highlight the ranked list of active violations.
   - Point out severity scores, measured vs. limit values.

3. **Show the Map View**
   - Switch to map view to see violation clusters (DBSCAN hotspots).
   - Click a cluster to see grouped violations.

4. **Show Recommended Actions**
   - Click a violation to expand the detail card.
   - Show the auto-generated recommended action: "Immediate site inspection and stop-work notice."

5. **Talk Track:**
   > "The system doesn't just detect violations — it prioritizes them. This violation in Ward 14 is ranked highest because it's a PM10 exceedance at 3x the limit, near a residential area, and has been ongoing for 6 hours. The recommended action is auto-generated based on severity and context."

---

### Act 5 — Health Advisories (2 minutes)

**Goal:** Show multilingual, population-targeted health guidance.

1. **Open Health Advisories**
   - Click "Advisories" in the navigation.

2. **Show Advisory in English**
   - Display the current advisory for the general population.
   - Point out the AQI forecast, category, and specific guidance.

3. **Switch to Hindi**
   - Change the language selector to Hindi (हिन्दी).
   - Show the same advisory fully translated.

4. **Switch to Marathi**
   - Change to Marathi (मराठी).
   - Show the translation.

5. **Show Population-Specific View**
   - Switch to "Asthmatic Patients" population filter.
   - Show the more aggressive guidance: "Keep inhaler ready; avoid outdoor activity."

6. **Talk Track:**
   > "Health advisories are generated automatically for every city every 6 hours, in three languages, and tailored to five population groups. A cardiac patient in Mumbai gets different guidance than a healthy adult. This is critical for a diverse country like India."

---

### Act 6 — Live Pipeline Execution (Optional, 2 minutes)

**Goal:** Show the agent pipeline running in real time.

1. **Trigger a Pipeline Run**
   - Open the terminal.
   - Run:
     ```bash
     curl -X POST http://localhost:8000/v1/pipeline/run \
       -H "Authorization: Bearer <analyst_token>" \
       -H "Content-Type: application/json" \
       -d '{"city": "Mumbai"}'
     ```

2. **Show Pipeline Progress**
   - Open the admin dashboard or stream logs.
   - Show each agent completing in sequence:
     - Ingestion ✅ (3.2s)
     - Forecast ✅ (8.1s)
     - Attribution ✅ (2.4s)
     - Enforcement ✅ (1.1s)
     - Advisory ✅ (4.7s)

3. **Talk Track:**
   > "The entire pipeline — from data ingestion through forecast, attribution, enforcement analysis, and advisory generation — completes in under 20 seconds for a full city. Each agent is independent and can be monitored separately."

---

## Key Talking Points

| Topic | One-Liner |
|-------|-----------|
| **Data freshness** | AQI data every 15 min, weather every 30 min, satellite daily |
| **Forecast accuracy** | MAE < 15 AQI units for 24-hour horizon (R² > 0.88) |
| **Explainability** | Every prediction comes with SHAP-based source decomposition |
| **Multilingual** | English, Hindi, Marathi — covering 95%+ of Maharashtra's population |
| **Scalability** | PostGIS handles millions of spatial queries; agents run in parallel |
| **Open standards** | Built on open data (CPCB, Sentinel-5P, OpenWeatherMap) |

---

## Q&A Preparation

**Q: How do you handle missing data?**
> We use forward-fill for short gaps (< 2h), linear interpolation for medium gaps, and spatial nearest-neighbor for satellite data. The model is also robust to missing features thanks to XGBoost's native handling.

**Q: What happens when the model accuracy degrades?**
> We monitor rolling MAE. If it exceeds 120% of baseline for 7 days, or if feature distribution drift (PSI > 0.2) is detected, the system triggers automatic retraining.

**Q: How do you ensure the SHAP attributions are physically meaningful?**
> We map SHAP features to predefined source sectors based on domain knowledge. The sector mappings are validated by environmental scientists and can be updated without retraining the model.

**Q: Can this work for other cities?**
> Yes. The architecture is city-agnostic. You need monitoring stations, and optionally satellite and weather data for the region. The models are retrained on local data.

**Q: What about data privacy?**
> We only process environmental data. No personal data is collected. The `users` table stores only email and role for authentication.

---

## Post-Demo

- Share the repository link: `https://github.com/your-org/PranaMap-AI`
- Point to this documentation: `docs/` directory
- Offer a deeper technical walkthrough of any specific component
- Share contact information for follow-up questions
