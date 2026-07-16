# PranaMap AI — Agent Flow

## Overview

PranaMap AI uses **LangGraph** to orchestrate five specialized agents as a directed acyclic graph. Each agent is a self-contained unit with its own tools, prompts, and state mutations. The graph coordinates data flow between agents, handles retries, and manages shared state.

---

## Architecture

### LangGraph Integration

The agent graph is defined in `agents/langgraph/graph.py`. LangGraph manages:

- **State transitions** between agents via a shared `AgentState` TypedDict.
- **Conditional branching** based on intermediate results.
- **Retry logic** with exponential backoff for transient failures.
- **Human-in-the-loop** approval gates for enforcement actions.

---

## Shared State

```python
# agents/shared/state.py

from typing import TypedDict, Optional
from datetime import datetime

class AgentState(TypedDict):
    # Ingestion outputs
    raw_aqi_data: Optional[list[dict]]
    raw_weather_data: Optional[list[dict]]
    raw_satellite_data: Optional[list[dict]]
    ingestion_status: str  # "pending" | "completed" | "failed"
    ingestion_errors: list[str]

    # Forecast outputs
    forecast_results: Optional[list[dict]]
    forecast_model_id: Optional[str]
    forecast_status: str  # "pending" | "completed" | "failed"

    # Attribution outputs
    attribution_results: Optional[list[dict]]
    attribution_status: str  # "pending" | "completed" | "failed"

    # Enforcement outputs
    violations: Optional[list[dict]]
    enforcement_rankings: Optional[list[dict]]
    enforcement_status: str  # "pending" | "completed" | "failed"

    # Advisory outputs
    advisories: Optional[list[dict]]
    advisory_status: str  # "pending" | "completed" | "failed"

    # Metadata
    city: str
    reference_time: datetime
    pipeline_run_id: str
```

---

## Agent Definitions

### 1. Ingestion Agent

**File:** `agents/ingestion_agent/agent.py`

**Purpose:** Fetches the latest data from all external sources, validates it, and writes to the database.

**Tools:**

| Tool | Description |
|------|-------------|
| `fetch_aqi_data` | Calls CPCB / OpenAQ API for latest AQI readings |
| `fetch_weather_data` | Calls OpenWeatherMap API for meteorological data |
| `fetch_satellite_data` | Queries Sentinel-5P STAC catalog and NASA FIRMS API |
| `validate_data` | Schema validation, range checks, duplicate detection |
| `write_to_db` | Inserts validated data into PostgreSQL staging tables |

**Flow:**

```
Receive trigger (cron or manual)
  → Parallel fetch: AQI + Weather + Satellite
    → Validate each dataset
      → If valid: write to database
      → If invalid: log errors, flag partial ingestion
  → Update state: ingestion_status = "completed"
  → Next nodes: Forecast Agent, Attribution Agent
```

**Error Handling:**

- If any single source fails, the agent continues with available data and logs warnings.
- If all sources fail, the pipeline halts and sends an alert.

---

### 2. Forecast Agent

**File:** `agents/forecast_agent/agent.py`

**Purpose:** Runs ML models to produce 72-hour AQI forecasts for all active stations.

**Tools:**

| Tool | Description |
|------|-------------|
| `load_model` | Loads serialized XGBoost/LightGBM model from disk |
| `build_features` | Assembles feature matrix from latest database state |
| `run_prediction` | Executes model inference with prediction intervals |
| `store_forecasts` | Writes predictions to the `forecasts` table |

**Flow:**

```
Receive state from Ingestion Agent
  → Fetch latest feature data from database
  → For each active station:
      → build_features(station_id, reference_time)
      → run_prediction(features, model)
      → compute_prediction_intervals(prediction)
  → store_forecasts(all_predictions)
  → Update state: forecast_status = "completed"
  → Next nodes: Attribution Agent, Enforcement Agent, Advisory Agent
```

**Model Selection:**

- The agent queries `forecast_models` table for the active model matching each pollutant.
- Default ensemble: 50% XGBoost + 50% LightGBM.

---

### 3. Attribution Agent

**File:** `agents/attribution_agent/agent.py`

**Purpose:** Explains forecasted AQI values by decomposing contributions by source sector using SHAP.

**Tools:**

| Tool | Description |
|------|-------------|
| `compute_shap_values` | Runs SHAP TreeExplainer on a prediction |
| `aggregate_by_sector` | Groups SHAP values into source sectors |
| `store_attributions` | Writes results to `attributions` table |
| `detect_anomalies` | Flags unusual attribution shifts (e.g., sudden industrial spike) |

**Flow:**

```
Receive state from Forecast Agent
  → For each station with forecast:
      → Load the forecast prediction and feature vector
      → compute_shap_values(model, features)
      → aggregate_by_sector(shap_values, sector_mapping)
      → If anomaly detected: flag for Enforcement Agent
  → store_attributions(all_attributions)
  → Update state: attribution_status = "completed"
  → Next nodes: Enforcement Agent, Advisory Agent
```

**Sector Mapping:**

```python
SECTOR_FEATURE_MAP = {
    "vehicular":    ["traffic_density", "road_proximity", "no2_lag", "co_lag"],
    "industrial":   ["industry_proximity", "so2_lag", "satellite_so2"],
    "construction": ["pm10_pm25_ratio", "construction_flag"],
    "residential":  ["temperature", "hour_of_day", "is_weekend"],
    "natural":      ["wind_speed", "wind_u", "wind_v", "satellite_aerosol", "fire_count"],
}
```

---

### 4. Enforcement Agent

**File:** `agents/enforcement_agent/agent.py`

**Purpose:** Identifies regulatory violations, clusters pollution hot-spots, and produces a prioritized enforcement action list.

**Tools:**

| Tool | Description |
|------|-------------|
| `check_thresholds` | Compares readings against NAAQS limits |
| `cluster_hotspots` | Runs DBSCAN clustering on violation locations |
| `rank_violations` | Scores violations by severity, duration, and population exposure |
| `store_violations` | Writes to `violations` table |
| `generate_actions` | Produces recommended enforcement actions |

**Flow:**

```
Receive state from Forecast + Attribution Agents
  → check_thresholds(latest_readings, naaqs_limits)
  → If violations found:
      → cluster_hotspots(violation_locations)
      → rank_violations(violations, population_data, attribution_data)
      → generate_actions(top_violations)
  → store_violations(ranked_violations)
  → Update state: enforcement_status = "completed"
  → Next node: Advisory Agent
```

**NAAQS Thresholds (India):**

| Pollutant | Averaging Period | Limit |
|-----------|-----------------|-------|
| PM2.5 | 24h | 60 µg/m³ |
| PM10 | 24h | 100 µg/m³ |
| NO₂ | 24h | 80 µg/m³ |
| SO₂ | 24h | 80 µg/m³ |
| O₃ | 8h | 100 µg/m³ |
| CO | 8h | 4 mg/m³ |

---

### 5. Advisory Agent

**File:** `agents/advisory_agent/agent.py`

**Purpose:** Generates multilingual, population-targeted health advisories from forecast and attribution data.

**Tools:**

| Tool | Description |
|------|-------------|
| `select_template` | Picks advisory template based on AQI category and population |
| `generate_text` | Composes advisory text using LLM with appropriate tone |
| `translate` | Translates advisory to target languages (Hindi, Marathi) |
| `store_advisories` | Writes to `advisories` table |
| `push_notifications` | Sends advisories to registered users via email/push |

**Flow:**

```
Receive state from all upstream agents
  → For each target population (general, asthmatic, cardiac, elderly, children):
      → For each language (en, hi, mr):
          → select_template(aqi_category, population)
          → generate_text(template, forecast_data, attribution_data, language)
          → If not English: translate(text, target_language)
  → store_advisories(all_advisories)
  → push_notifications(subscribers, advisories)
  → Update state: advisory_status = "completed"
```

**Advisory Population Profiles:**

| Population | Sensitivity | Extra Warnings |
|------------|------------|----------------|
| General | Baseline | Standard guidance |
| Asthmatic | High for PM2.5, O₃ | Keep inhaler ready; avoid outdoor activity |
| Cardiac | High for PM2.5, CO | Monitor symptoms; seek care if chest discomfort |
| Elderly | High for all pollutants | Stay indoors; ensure medication supply |
| Children | High for PM2.5, O₃ | Restrict outdoor play; school advisory |

---

## Graph Definition

```python
# agents/langgraph/graph.py

from langgraph.graph import StateGraph, END

def build_pipeline_graph() -> StateGraph:
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("ingestion", ingestion_agent.run)
    graph.add_node("forecast", forecast_agent.run)
    graph.add_node("attribution", attribution_agent.run)
    graph.add_node("enforcement", enforcement_agent.run)
    graph.add_node("advisory", advisory_agent.run)

    # Entry point
    graph.set_entry_point("ingestion")

    # Edges
    graph.add_edge("ingestion", "forecast")
    graph.add_conditional_edges(
        "forecast",
        route_after_forecast,
        {
            "attribution": "attribution",
            "enforcement": "enforcement",
            "advisory": "advisory",
        },
    )
    graph.add_edge("attribution", "enforcement")
    graph.add_edge("enforcement", "advisory")
    graph.add_edge("advisory", END)

    return graph.compile()
```

### Execution Order

```
Ingestion ──▶ Forecast ──┬──▶ Attribution ──▶ Enforcement ──▶ Advisory ──▶ END
                         ├──▶ Enforcement (if attribution skipped)
                         └──▶ Advisory (if no violations)
```

The `route_after_forecast` function determines which downstream agents to activate based on whether attribution data is needed.

---

## Error Handling & Retries

| Failure | Strategy |
|---------|----------|
| Transient API error | Retry 3× with exponential backoff (2s, 4s, 8s) |
| Model inference failure | Skip station, log warning, continue with remaining |
| Database write failure | Retry once; if persistent, buffer to local JSON and alert |
| LLM generation failure | Fall back to template-based advisory (no LLM) |

---

## Monitoring

Each agent logs structured events to the `pipeline_runs` table:

```sql
CREATE TABLE pipeline_runs (
    run_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city           VARCHAR(100) NOT NULL,
    started_at     TIMESTAMPTZ NOT NULL,
    completed_at   TIMESTAMPTZ,
    status         VARCHAR(20) NOT NULL,
    agent_statuses JSONB NOT NULL,
    errors         JSONB,
    duration_ms    INTEGER
);
```

Dashboard metrics (Grafana or frontend admin panel):

- Pipeline success rate (target: > 99%)
- Per-agent latency
- Forecast accuracy (rolling MAE vs actuals)
- Number of violations detected per run
- Advisory delivery rate
