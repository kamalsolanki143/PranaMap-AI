export interface HourlyForecast {
  hour: string;
  aqi: number;
  pm25: number;
  confidence: number;
}

export interface DailyForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
}

export interface ForecastData {
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  generatedAt: string;
}
