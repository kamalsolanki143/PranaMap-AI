export interface AQIReading {
  wardId: string;
  wardName: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2?: number;
  so2?: number;
  o3?: number;
  timestamp: string;
  latitude: number;
  longitude: number;
}

export interface AQISummary {
  overallAQI: number;
  maxAQI: number;
  minAQI: number;
  hotspots: number;
  lastUpdated: string;
}
