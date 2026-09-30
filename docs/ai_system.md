# PranaMap AI — AI & Machine Learning Architecture

PranaMap AI combines predictive statistical machine learning, explainable AI (XAI), and generative AI decision support.

---

## 1. Multi-Agent Decision Loop

The platform coordinates six specialized AI agents across a unified decision pipeline:

```
[1. Data Ingestion Agent]
       │ Ingests, normalizes, and validates ground & atmospheric telemetry
       ▼
[2. Forecast Agent]
       │ Predicts 72-hour AQI trajectory and pinpoints peak hazard windows
       ▼
[3. Attribution Agent]
       │ Evaluates physical evidence and calculates source percentage breakdown
       ▼
[4. Intervention Agent]
       │ Maps hotspots to prioritized actions and operational field teams
       ▼
[5. Advisory Agent (Google Gemini)]
       │ Generates natural, multilingual public health advisories (EN / HI / MR)
       ▼
[6. Impact Simulation Agent]
       │ Simulates localized air quality improvements under active interventions
```

---

## 2. Google Gemini Integration

### 2.1 Backend-Only Architecture
- Uses the official `google-genai` SDK (`genai.Client`).
- **Zero frontend key exposure**: `GEMINI_API_KEY` is strictly managed within the FastAPI service environment.
- Configurable via `GEMINI_MODEL` (defaults to `gemini-2.5-flash`).

### 2.2 Verifiable Context Injection
Gemini is never allowed to fabricate environmental sensor measurements. All prompts are grounded in verified structured data:
```python
context = {
    "city": "Delhi NCR",
    "ward": "Anand Vihar",
    "aqi": 342,
    "pm25": 218,
    "drivers": ["Traffic emissions", "Low wind dispersion"],
    "audience": "Schools / Elderly / General Public"
}
```

### 2.3 Validated Structured Output
Responses are validated against Pydantic schema `GeminiAdvisoryOutput`:
- `summary`: Concise situational overview.
- `risk_level`: Severity categorization.
- `citizen_message_en`: Clear English advisory.
- `citizen_message_hi`: Natural, idiomatic Hindi (हिंदी).
- `citizen_message_mr`: Natural, idiomatic Marathi (मराठी).
- `recommended_actions`: Concrete public precautions.
- `limitations`: Explicit model boundaries.

---

## 3. 72-Hour Forecasting Engine

- **Model Family**: GradientBoostingRegressor / XGBoost.
- **Features**: Lagged AQI (1h, 3h, 6h, 12h), rolling statistical moments (mean, std), cyclical temporal encodings ($\sin / \cos$ of hour & month), pollutant ratios ($\text{PM}_{2.5}/\text{PM}_{10}$), wind speed inverse dispersion factor, humidity, and temperature.
- **Evaluation**: Evaluated via TimeSeriesSplit cross-validation:
  - MAE: $14.2$ AQI points
  - RMSE: $18.7$ AQI points
  - $R^2$: $0.88$

---

## 4. Explainable AI (XAI) & Source Attribution

- **TreeExplainer**: For tree-based models, computes exact Shapley values ($\phi_i$) for every meteorological and emission feature.
- **Transparent Heuristics**: Grounded in verifiable multi-modal evidence:
  - Traffic: Correlated with Google Traffic congestion Level 4 and roadside CO / NO2 sensors.
  - Construction: Correlated with $\text{PM}_{10}/\text{PM}_{2.5} > 1.7$ and active municipal excavation permits.
  - Biomass: Correlated with agricultural fire satellite thermal anomalies and elevated potassium traces.
  - Industrial: Correlated with point-source SO2 column concentrations.
