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
