# PranaMap AI — API Documentation

Base URL: `https://api.pranamap.ai/v1`

All endpoints return JSON. Responses follow a standard envelope:

```json
{
  "status": "success",
  "data": { ... },
  "meta": { "page": 1, "total": 42 }
}
```

Errors return:

```json
{
  "status": "error",
  "error": {
    "code": 404,
    "message": "Station not found"
  }
}
```

## Authentication

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer <access_token>` |

Obtain tokens via the `/auth/login` endpoint. Tokens expire after 15 minutes; use `/auth/refresh` to obtain a new access token.

---

## Stations

### `GET /stations`

List all monitoring stations.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `lat` | float | — | Filter by latitude (requires `lon` and `radius`) |
| `lon` | float | — | Filter by longitude |
| `radius` | int (meters) | 10000 | Search radius |
| `page` | int | 1 | Page number |
| `limit` | int | 50 | Results per page (max 200) |

**Response `200`:**

```json
{
  "status": "success",
  "data": [
    {
      "station_id": "CPCB-001",
      "name": "Mazgaon, Mumbai",
      "lat": 18.9553,
      "lon": 72.8386,
      "type": "reference",
      "active": true,
      "installed_date": "2021-03-15"
    }
  ],
  "meta": { "page": 1, "total": 156, "limit": 50 }
}
```

### `GET /stations/{station_id}`

Retrieve a single station with its latest AQI reading.

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "station_id": "CPCB-001",
    "name": "Mazgaon, Mumbai",
    "lat": 18.9553,
    "lon": 72.8386,
    "latest_aqi": {
      "aqi": 142,
      "category": "Unhealthy for Sensitive Groups",
      "dominant_pollutant": "PM2.5",
      "pm25": 68.3,
      "pm10": 112.7,
      "no2": 34.1,
      "so2": 12.8,
      "o3": 28.5,
      "co": 1.2,
      "recorded_at": "2026-07-14T14:30:00Z"
    }
  }
}
```

---

## AQI Readings

### `GET /aqi/current`

Latest AQI for all active stations.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `city` | string | Filter by city name |
| `category` | string | Filter by AQI category (Good, Moderate, etc.) |

### `GET /aqi/history/{station_id}`

Historical AQI readings for a station.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `start` | ISO 8601 | 24h ago | Start of time range |
| `end` | ISO 8601 | now | End of time range |
| `resolution` | string | `1h` | `15m`, `1h`, `6h`, `1d` |

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "station_id": "CPCB-001",
    "readings": [
      {
        "timestamp": "2026-07-14T10:00:00Z",
        "aqi": 138,
        "pm25": 65.1,
        "pm10": 108.3
      }
    ]
  }
}
```

---

## Forecasts

### `GET /forecast/{station_id}`

72-hour AQI forecast for a station.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `hours` | int | 72 | Forecast horizon (max 72) |
| `pollutant` | string | `aqi` | `aqi`, `pm25`, `pm10`, `no2`, `so2`, `o3`, `co` |

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "station_id": "CPCB-001",
    "model": "xgboost_aqi_v3",
    "generated_at": "2026-07-14T15:00:00Z",
    "forecasts": [
      {
        "hour": 1,
        "timestamp": "2026-07-14T16:00:00Z",
        "predicted_aqi": 145,
        "lower_bound": 132,
        "upper_bound": 158,
        "category": "Unhealthy for Sensitive Groups"
      }
    ]
  }
}
```

### `GET /forecast/grid`

Gridded forecast覆盖 all monitored area.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `bbox` | string | Bounding box `minLon,minLat,maxLon,maxLat` |
| `resolution` | float | Grid cell size in degrees (default 0.01) |

Returns a GeoJSON FeatureCollection of grid cells with forecasted AQI values.

---

## Source Attribution

### `GET /attribution/{station_id}`

Decomposes pollutant levels by contributing source sector.

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "station_id": "CPCB-001",
    "pollutant": "PM2.5",
    "total_contribution_ugm3": 68.3,
    "sectors": [
      { "sector": "vehicular", "share": 0.34, "value_ugm3": 23.2 },
      { "sector": "industrial", "share": 0.28, "value_ugm3": 19.1 },
      { "sector": "construction", "share": 0.18, "value_ugm3": 12.3 },
      { "sector": "residential", "share": 0.12, "value_ugm3": 8.2 },
      { "sector": "natural", "share": 0.08, "value_ugm3": 5.5 }
    ],
    "shap_values": {
      "wind_speed": -4.2,
      "traffic_density": 12.8,
      "industrial_emissions": 9.3,
      "construction_activity": 6.1,
      "residential_heating": 3.8,
      "crop_burning": 2.1,
      "temperature": 1.4
    }
  }
}
```

---

## Enforcement

### `GET /enforcement/violations`

List active violations ranked by severity.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | `active`, `resolved`, `all` |
| `min_severity` | int | 1–5 severity threshold |
| `ward` | string | Filter by ward ID |

**Response `200`:**

```json
{
  "status": "success",
  "data": [
    {
      "violation_id": "V-2026-0891",
      "type": "exceedance",
      "station_id": "CPCB-042",
      "pollutant": "PM10",
      "measured": 312.5,
      "limit": 100.0,
      "severity": 5,
      "ward_id": "WARD-14",
      "lat": 19.0760,
      "lon": 72.8777,
      "detected_at": "2026-07-14T08:00:00Z",
      "status": "active",
      "recommended_action": "Immediate site inspection and stop-work notice"
    }
  ],
  "meta": { "total": 12, "active": 8 }
}
```

### `POST /enforcement/violations/{violation_id}/resolve`

Mark a violation as resolved. Requires `admin` role.

**Request Body:**

```json
{
  "resolution_notes": "Site inspection completed; corrective action verified.",
  "resolved_by": "Officer-Prakash"
}
```

---

## Health Advisories

### `GET /advisories/latest`

Latest health advisories for a region.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `language` | string | `en`, `hi`, `mr` (default `en`) |
| `population` | string | `general`, `asthmatic`, `cardiac`, `elderly`, `children` |

**Response `200`:**

```json
{
  "status": "success",
  "data": [
    {
      "advisory_id": "ADV-2026-0714-001",
      "language": "hi",
      "population": "asthmatic",
      "city": "Mumbai",
      "aqi_forecast": 165,
      "category": "Unhealthy",
      "headline": "सांस की बीमरी वाले रोगियों के लिए चेतावनी",
      "body": "आज और कल PM2.5 का स्तर बहुत अधिक रहेगा। कृपया घर के अंदर रहें और खिड़कियां बंद रखें। इनहेलर साथ रखें।",
      "generated_at": "2026-07-14T15:30:00Z"
    }
  ]
}
```

### `POST /advisories/generate`

Trigger advisory generation for a city. Requires `analyst` role.

**Request Body:**

```json
{
  "city": "Mumbai",
  "forecast_id": "FC-2026-0714-001",
  "languages": ["en", "hi", "mr"],
  "populations": ["general", "asthmatic", "cardiac", "elderly", "children"]
}
```

---

## Geospatial

### `GET /geo/heatmap`

Returns a GeoJSON heatmap layer of AQI values for map rendering.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `bbox` | string | `minLon,minLat,maxLon,maxLat` |
| `timestamp` | ISO 8601 | Specific reading time (default: latest) |

### `GET /geo/hotspots`

Returns detected pollution hot-spot clusters.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `method` | string | `dbscan`, `stclustering` (default `dbscan`) |
| `eps` | float | DBSCAN epsilon parameter |
| `min_samples` | int | Minimum cluster size |

---

## WebSocket

### `ws /ws/live`

Streams real-time AQI updates to connected clients.

**Message format (server → client):**

```json
{
  "type": "aqi_update",
  "station_id": "CPCB-001",
  "aqi": 143,
  "timestamp": "2026-07-14T15:45:12Z"
}
```

**Message format (client → server):**

```json
{
  "action": "subscribe",
  "station_ids": ["CPCB-001", "CPCB-002"]
}
```

---

## Rate Limits

| Tier | Requests/min | WebSocket connections |
|------|-------------|----------------------|
| Public | 100 | — |
| Analyst | 600 | 10 |
| Admin | 1200 | 50 |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1689370800
```
