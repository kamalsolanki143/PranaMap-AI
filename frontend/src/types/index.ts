export type AQISeverity = 'good' | 'moderate' | 'sensitive' | 'unhealthy' | 'veryUnhealthy' | 'hazardous';

export interface Ward {
  id: string;
  name: string;
  centroid: [number, number]; // [longitude, latitude]
  aqi: number;
  severity: AQISeverity;
  population: number;
  area: number; // sq km
}

export interface Hotspot {
  id: string;
  name: string;
  type: 'industrial' | 'traffic' | 'construction' | 'waste';
  coordinates: [number, number];
  intensity: number; // 0-100
  status: 'active' | 'mitigated' | 'monitoring';
  aqi?: number;
  source?: string;
  truthTier?: 'OBSERVED' | 'MODELLED' | 'LIVE' | 'CACHED' | 'SIMULATION';
  timestamp?: string;
  reason?: string;
}

export interface ForecastData {
  time: string;
  aqi: number;
}

export interface SourceContribution {
  source: string;
  percentage: number;
  confidence: number;
  description: string;
}

export interface EnforcementAction {
  id: string;
  wardId: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  targetReduction: number;
  status: 'pending' | 'active' | 'completed';
}

export interface Advisory {
  wardId: string;
  audience: 'general' | 'sensitive' | 'schools' | 'outdoor_workers';
  messageEn: string;
  messageHi: string;
  messageMr: string;
  riskLevel: AQISeverity;
}

// Used by AQILineChart — matches forecast agent output shape
export interface ForecastPoint {
  time: string;
  aqi: number;
  pm25: number;
  confidence: number;
  lower?: number;
  upper?: number;
}

// Used by SourceBarChart — matches attribution agent output shape
export interface SourceAttribution {
  source: string;
  impact_pct: number;
  confidence_pct: number;
  icon: string;
  color: string;
  tags: string[];
  evidence: { label: string }[];
}

// Used by AQIBadge — India AQI status levels
export interface AQIReading {
  status: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  aqi: number;
}

// Used by PriorityBadge — enforcement priority levels
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// ─── API Response types (used by services/api.ts) ────────────────────────────

export interface WardSummary {
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
  wards: WardSummary[];
}

export interface ForecastResponsePoint {
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
  trend: string;
  trend_pct: number;
  today_avg: number;
  tomorrow_predicted: number;
  points: ForecastResponsePoint[];
}

export interface AttributionSource {
  source: string;
  impact_pct: number;
  confidence_pct: number;
  icon: string;
  color: string;
  tags: string[];
  evidence: { label: string }[];
}

export interface AttributionResponse {
  station: string;
  ward: string;
  current_aqi: number;
  analysis_confidence: number;
  ai_summary: string;
  sources: AttributionSource[];
  wind_direction: string;
  wind_speed_kmh: number;
  nodes_active: number;
  network_latency_ms: number;
}

export interface EnforcementWard {
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
  actions: { label: string }[];
  department: string;
  lead: string;
}

export interface EnforcementResponse {
  total_wards: number;
  critical_zones: number;
  active_missions: number;
  projected_impact_pct: number;
  wards: EnforcementWard[];
}

export interface AdvisoryItem {
  id: string;
  ward: string;
  ref_id: string;
  aqi: number;
  status: AQIReading['status'];
  updated_ago: string;
  ai_message: string;
  audience_tags: string[];
  sms_status: string;
  app_status: string;
}

export type AdvisoryCardData = AdvisoryItem;

export interface AdvisoryLogEntry {
  type: string;
  ward: string;
  message: string;
  time: string;
  result: string;
  color: string;
}

export interface AdvisoryResponse {
  total_sms: string;
  app_reach: string;
  delivery_rate: number;
  advisories: AdvisoryItem[];
  log: AdvisoryLogEntry[];
}

// ─── Extended Environmental Intelligence Models ───────────────────────────────

export type DataStatus = 'LIVE' | 'CACHED' | 'MODELLED' | 'SIMULATION' | 'DEMO' | 'UNAVAILABLE';

export interface CityConfig {
  id: string;
  name: string;
  state: string;
  coordinates: [number, number]; // [longitude, latitude]
  zoom: number;
  population: string;
  activeStations: number;
  avgAqi: number;
  status: 'active' | 'monitoring';
  dominantPollutant: string;
}

export interface DataSourceItem {
  id: string;
  name: string;
  provider: string;
  type: 'Ground Sensor' | 'Satellite' | 'Meteorology' | 'AI / GenAI' | 'Cloud Database';
  last_updated: string;
  status: DataStatus;
  coverage: string;
  documentation_url: string;
  update_frequency: string;
  description: string;
}

export type InterventionStatus = 'Recommended' | 'Reviewed' | 'Approved' | 'Dispatched' | 'Completed';

export interface InterventionItem {
  id: string;
  city_id: string;
  zone: string;
  risk_level: 'Critical' | 'High' | 'Moderate' | 'Low';
  driver: string;
  recommended_action: string;
  expected_impact: string;
  estimated_reduction_range: [number, number];
  assigned_team: 'Traffic Control Team' | 'Environmental Inspection Team' | 'Municipal Dust Control Team' | 'Air Quality Taskforce';
  status: InterventionStatus;
  created_at?: string;
  updated_at?: string;
}

export interface SimulationResult {
  city_id: string;
  baseline_aqi: number;
  selected_interventions: string[];
  projected_aqi: number;
  delta_aqi: number;
  impact_level: string;
  assumptions: string[];
  methodology: string;
  simulated_at: string;
}

export interface MultilingualAdvisory {
  city_id: string;
  ward_id: string;
  ward_name: string;
  current_aqi: number;
  status_label: string;
  audience: 'Schools' | 'Elderly' | 'Hospitals' | 'General Public';
  message_en: string;
  message_hi: string;
  message_mr: string;
  actions: string[];
  model_used: string;
  generated_at: string;
  is_fallback: boolean;
}
