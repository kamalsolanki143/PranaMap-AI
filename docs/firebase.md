# PranaMap AI — Google Cloud Firestore & Firebase Integration

PranaMap AI utilizes Google Cloud Firestore as its scalable, low-latency operational data layer for municipal air quality governance.

---

## 1. Firestore Schema & Collections

```
Cloud Firestore
├── cities/{cityId}
├── air_quality/{readingId}
├── weather/{weatherId}
├── hotspots/{hotspotId}
├── forecasts/{forecastId}
├── attributions/{attributionId}
├── interventions/{interventionId}
├── advisories/{advisoryId}
├── simulation_runs/{simulationId}
├── data_sources/{sourceId}
└── system_events/{eventId}
```

### 1.1 `cities/{cityId}`
```json
{
  "id": "delhi-ncr",
  "name": "Delhi NCR",
  "state": "National Capital Region",
  "lat": 28.6139,
  "lon": 77.2090,
  "stations": 38,
  "avg_aqi": 242,
  "status": "Poor"
}
```

### 1.2 `interventions/{interventionId}`
```json
{
  "id": "int-delhi-01",
  "city_id": "delhi-ncr",
  "zone": "Anand Vihar",
  "risk": "Critical",
  "observed_driver": "Traffic emissions & ISBT idling",
  "recommended_action": "Heavy vehicle diversion & traffic signal retiming",
  "assigned_team": "Traffic Control Team",
  "expected_impact": "Estimated AQI reduction: 18–24",
  "status": "Reviewed",
  "created_at": "2026-09-29T21:00:00Z",
  "updated_at": "2026-09-29T21:45:00Z"
}
```

### 1.3 `advisories/{advisoryId}`
```json
{
  "id": "adv_delhi_1727632800",
  "city_id": "delhi-ncr",
  "ward": "Anand Vihar",
  "risk_level": "Severe",
  "messages": {
    "en": "...",
    "hi": "...",
    "mr": "..."
  },
  "generated_by": "Google Gemini Reasoner"
}
```

---

## 2. Authentication & Security

- **Admin SDK**: Configured exclusively on the backend (`firebase-admin` with service account credentials or Application Default Credentials).
- **Client Security**: Frontend only communicates with Firestore via authenticated backend endpoints or restricted read-only client access tokens.
- **Local Fallback**: If `FIREBASE_PROJECT_ID` or service account credentials are not provided during offline development, the `FirestoreService` seamlessly provides an in-memory document store so that developers and hackathon judges can evaluate the system instantly.
