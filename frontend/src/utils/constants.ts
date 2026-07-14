export const AQI_LEVELS = [
  { range: [0, 50], label: 'Good', color: '#00E400' },
  { range: [51, 100], label: 'Satisfactory', color: '#FFFF00' },
  { range: [101, 200], label: 'Moderate', color: '#FF7E00' },
  { range: [201, 300], label: 'Poor', color: '#FF0000' },
  { range: [301, 400], label: 'Very Poor', color: '#8F3F97' },
  { range: [401, 500], label: 'Severe', color: '#7E0023' },
] as const;

export const DEFAULT_CENTER = { latitude: 28.6139, longitude: 77.209, zoom: 10 };
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
