import { Ward, Hotspot, ForecastData, SourceContribution, EnforcementAction, Advisory } from '@/types';

export const MOCK_WARDS: Ward[] = [
  { id: 'W001', name: 'Colaba', centroid: [72.8169, 18.9067], aqi: 112, severity: 'sensitive', population: 120000, area: 4.5 },
  { id: 'W002', name: 'Dadar', centroid: [72.8426, 19.0176], aqi: 165, severity: 'unhealthy', population: 250000, area: 6.2 },
  { id: 'W003', name: 'Bandra', centroid: [72.8347, 19.0596], aqi: 185, severity: 'unhealthy', population: 340000, area: 8.1 },
  { id: 'W004', name: 'Andheri', centroid: [72.8362, 19.1136], aqi: 245, severity: 'veryUnhealthy', population: 1500000, area: 24.5 },
  { id: 'W005', name: 'Kurla', centroid: [72.8777, 19.0728], aqi: 280, severity: 'veryUnhealthy', population: 900000, area: 15.3 },
  { id: 'W006', name: 'Chembur', centroid: [72.8965, 19.0515], aqi: 310, severity: 'hazardous', population: 450000, area: 12.0 },
  { id: 'W007', name: 'Borivali', centroid: [72.8562, 19.2307], aqi: 95, severity: 'moderate', population: 800000, area: 18.2 },
];

export const MOCK_HOTSPOTS: Hotspot[] = [
  { id: 'H1', name: 'Deonar Dumping Ground', type: 'waste', coordinates: [72.9234, 19.0558], intensity: 95, status: 'active' },
  { id: 'H2', name: 'Chembur Refinery', type: 'industrial', coordinates: [72.8986, 19.0287], intensity: 88, status: 'active' },
  { id: 'H3', name: 'WEH Traffic Junction', type: 'traffic', coordinates: [72.8517, 19.1234], intensity: 75, status: 'active' },
  { id: 'H4', name: 'Metro Line 3 Site', type: 'construction', coordinates: [72.8258, 18.9431], intensity: 60, status: 'monitoring' },
];

export const MOCK_FORECAST: ForecastData[] = [
  { time: '00:00', aqi: 150 },
  { time: '04:00', aqi: 145 },
  { time: '08:00', aqi: 180 },
  { time: '12:00', aqi: 210 },
  { time: '16:00', aqi: 195 },
  { time: '20:00', aqi: 175 },
  { time: '24:00', aqi: 160 },
];

export const MOCK_ATTRIBUTION: SourceContribution[] = [
  { source: 'Vehicular Emissions', percentage: 42, confidence: 92, description: 'Heavy congestion on arterial roads' },
  { source: 'Industrial Activity', percentage: 28, confidence: 88, description: 'Chemical and refining zones' },
  { source: 'Construction Dust', percentage: 15, confidence: 75, description: 'Major infra projects' },
  { source: 'Waste Burning', percentage: 10, confidence: 65, description: 'Open burning in localized pockets' },
  { source: 'Others', percentage: 5, confidence: 50, description: 'Sea salt, biogenic, etc.' },
];

export const MOCK_ENFORCEMENT: EnforcementAction[] = [
  { id: 'E1', wardId: 'W006', priority: 'critical', action: 'Halt all non-essential construction activities.', targetReduction: 15, status: 'pending' },
  { id: 'E2', wardId: 'W005', priority: 'high', action: 'Deploy anti-smog guns and mechanical sweepers.', targetReduction: 8, status: 'active' },
  { id: 'E3', wardId: 'W004', priority: 'medium', action: 'Reroute heavy commercial vehicles.', targetReduction: 12, status: 'pending' },
];

export const MOCK_ADVISORY: Advisory[] = [
  {
    wardId: 'W006',
    audience: 'schools',
    riskLevel: 'hazardous',
    messageEn: 'All schools must suspend outdoor activities immediately. Keep windows closed.',
    messageHi: 'सभी स्कूलों को तुरंत बाहरी गतिविधियों को निलंबित करना चाहिए। खिड़कियां बंद रखें।',
    messageMr: 'सर्व शाळांनी बाहेरील उपक्रम तत्काळ थांबवावेत. खिडक्या बंद ठेवा.'
  },
  {
    wardId: 'W004',
    audience: 'sensitive',
    riskLevel: 'veryUnhealthy',
    messageEn: 'People with respiratory issues should stay indoors. Use N95 masks if stepping out.',
    messageHi: 'सांस की समस्या वाले लोगों को घर के अंदर रहना चाहिए। बाहर जाने पर N95 मास्क का प्रयोग करें।',
    messageMr: 'श्वसनाचा त्रास असलेल्या लोकांनी घरातच राहावे. बाहेर जाताना N95 मास्क वापरा.'
  }
];
