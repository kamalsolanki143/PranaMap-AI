// ─── AQI ─────────────────────────────────────────────────────────────────────
export interface AQIReading {
  ward: string;
  sensorId: string;
  aqi: number;
  pm25: number;
  pm10: number;
  status: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  timestamp: string;
}

export interface ForecastPoint {
  time: string;
  aqi: number;
  pm25: number;
  confidence: number;
  lower: number;
  upper: number;
}

export interface ForecastResponse {
  ward: string;
  generated_at: string;
  model_confidence: number;
  trend: 'Rising' | 'Falling' | 'Stable';
  trend_pct: number;
  today_avg: number;
  tomorrow_predicted: number;
  points: ForecastPoint[];
}

// ─── Source Attribution ───────────────────────────────────────────────────────
export type SourceType = 'Traffic' | 'Biomass' | 'Construction' | 'Industrial';

export interface SourceEvidence {
  label: string;
}

export interface SourceAttribution {
  source: SourceType;
  impact_pct: number;
  confidence_pct: number;
  icon: string;
  color: string;
  evidence: SourceEvidence[];
  tags: string[];
}

export interface AttributionResponse {
  station: string;
  ward: string;
  current_aqi: number;
  analysis_confidence: number;
  ai_summary: string;
  sources: SourceAttribution[];
  wind_direction: string;
  wind_speed_kmh: number;
  nodes_active: number;
  network_latency_ms: number;
}

// ─── Enforcement ─────────────────────────────────────────────────────────────
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface EnforcementAction {
  label: string;
}

export interface WardEnforcement {
  id: string;
  priority: Priority;
  ward: string;
  uid: string;
  current_aqi: number;
  primary_source: string;
  primary_source_icon: string;
  projected_aqi: number;
  root_cause: string;
  tags: string[];
  actions: EnforcementAction[];
  department: string;
  lead: string;
}

export interface EnforcementResponse {
  total_wards: number;
  critical_zones: number;
  active_missions: number;
  projected_impact_pct: number;
  wards: WardEnforcement[];
}

// ─── Advisory ────────────────────────────────────────────────────────────────
export type AdvisoryStatus = 'SENT' | 'PENDING' | 'QUEUED';
export type Language = 'ENGLISH' | 'HINDI' | 'BENGALI' | 'PUNJABI';

export interface AdvisoryCard {
  id: string;
  ward: string;
  ref_id: string;
  aqi: number;
  status: AQIReading['status'];
  updated_ago: string;
  ai_message: string;
  audience_tags: string[];
  sms_status: AdvisoryStatus;
  app_status: AdvisoryStatus;
}

export interface LogEntry {
  type: 'ADVISORY BROADCAST' | 'SYSTEM NOTICE' | 'FAILURE RETRY' | 'TELEMETRY SYNC';
  ward: string;
  message: string;
  time: string;
  result: 'SUCCESS' | 'RETRIED' | 'LIVE';
  color: string;
}

export interface AdvisoryResponse {
  total_sms: string;
  app_reach: string;
  delivery_rate: number;
  advisories: AdvisoryCard[];
  log: LogEntry[];
}

// ─── Command Center ──────────────────────────────────────────────────────────
export interface WardReading {
  name: string;
  sensor_id: string;
  aqi: number;
  status: AQIReading['status'];
}

export interface CommandCenterResponse {
  region: string;
  live_aqi: number;
  live_status: AQIReading['status'];
  ai_insight: string;
  ai_confidence: number;
  forecast_peak_time: string;
  avg_wind: string;
  wards: WardReading[];
}
