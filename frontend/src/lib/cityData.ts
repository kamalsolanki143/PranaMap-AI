import type { Ward, Hotspot, AQISeverity } from '../types/index.ts';

export interface CityDataProfile {
  cityId: string;
  cityName: string;
  state: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  overallAqi: number;
  overallStatus: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  sixHourTrend: string;
  trendPct: number;
  criticalZone: {
    wardName: string;
    wardId: string;
    aqi: number;
    pm25: number;
    pm10: number;
    drivers: string[];
    forecastText: string;
    trend: 'Increasing' | 'Stable' | 'Decreasing';
  };
  priorityAreas: {
    rank: string;
    name: string;
    wardId: string;
    aqi: number;
    risk: 'Critical' | 'High' | 'Moderate' | 'Low';
    driver: string;
    expectedImpact: string;
  }[];
  wards: Ward[];
  hotspots: Hotspot[];
}

export const CITY_DATA_PROFILES: Record<string, CityDataProfile> = {
  'delhi-ncr': {
    cityId: 'delhi-ncr',
    cityName: 'Delhi NCR',
    state: 'National Capital Territory',
    center: [77.2090, 28.6139],
    zoom: 11,
    overallAqi: 242,
    overallStatus: 'Poor',
    sixHourTrend: '↑ 12% over previous 6 hours',
    trendPct: 12,
    criticalZone: {
      wardName: 'Anand Vihar',
      wardId: 'ND-AV-402',
      aqi: 342,
      pm25: 218,
      pm10: 384,
      drivers: ['Traffic emissions', 'Low wind dispersion', 'ISBT fleet idling'],
      forecastText: 'Potential deterioration over next 4 hours due to nocturnal boundary layer collapse',
      trend: 'Increasing',
    },
    priorityAreas: [
      { rank: '01', name: 'Anand Vihar', wardId: 'ND-AV-402', aqi: 342, risk: 'Critical', driver: 'Traffic emissions', expectedImpact: 'Est. reduction: 18–24 AQI' },
      { rank: '02', name: 'Punjabi Bagh', wardId: 'ND-PB-115', aqi: 312, risk: 'Critical', driver: 'Heavy transport corridor', expectedImpact: 'Est. reduction: 14–20 AQI' },
      { rank: '03', name: 'Dwarka Sector 8', wardId: 'ND-DW-801', aqi: 271, risk: 'High', driver: 'Construction dust', expectedImpact: 'Est. reduction: 10–15 AQI' },
      { rank: '04', name: 'RK Puram', wardId: 'ND-RK-702', aqi: 238, risk: 'High', driver: 'Low wind dispersion', expectedImpact: 'Est. reduction: 8–12 AQI' },
      { rank: '05', name: 'Rohini Sector 7', wardId: 'ND-RO-412', aqi: 214, risk: 'High', driver: 'Localized biomass burning', expectedImpact: 'Est. reduction: 12–16 AQI' },
    ],
    wards: [
      { id: 'ND-AV-402', name: 'Anand Vihar', centroid: [77.3150, 28.6470], aqi: 342, severity: 'hazardous', population: 310000, area: 11.2 },
      { id: 'ND-PB-115', name: 'Punjabi Bagh', centroid: [77.1320, 28.6690], aqi: 312, severity: 'hazardous', population: 280000, area: 9.8 },
      { id: 'ND-DW-801', name: 'Dwarka Sector 8', centroid: [77.0710, 28.5720], aqi: 271, severity: 'veryUnhealthy', population: 420000, area: 18.5 },
      { id: 'ND-RK-702', name: 'RK Puram', centroid: [77.1750, 28.5660], aqi: 238, severity: 'unhealthy', population: 240000, area: 8.4 },
      { id: 'ND-RO-412', name: 'Rohini Sector 7', centroid: [77.1180, 28.7120], aqi: 214, severity: 'unhealthy', population: 520000, area: 21.0 },
      { id: 'ND-OK-104', name: 'Okhla Phase 3', centroid: [77.2730, 28.5350], aqi: 245, severity: 'veryUnhealthy', population: 390000, area: 14.1 },
      { id: 'ND-LG-100', name: 'Lodhi Garden', centroid: [77.2190, 28.5930], aqi: 62, severity: 'moderate', population: 95000, area: 6.2 },
    ],
    hotspots: [
      { id: 'H-AV-1', name: 'Anand Vihar ISBT Corridor', type: 'traffic', coordinates: [77.3160, 28.6480], intensity: 96, status: 'active', aqi: 342, source: 'CPCB CAAQMS Station (Anand Vihar)', truthTier: 'OBSERVED', timestamp: 'Live Synoptic Cycle', reason: 'High vehicular diesel emissions, ISBT inter-state bus idling, and nocturnal boundary layer trapping' },
      { id: 'H-OK-2', name: 'Okhla Industrial Cluster', type: 'industrial', coordinates: [77.2750, 28.5360], intensity: 84, status: 'active', aqi: 245, source: 'CPCB CAAQMS Station (Okhla Phase 2)', truthTier: 'OBSERVED', timestamp: 'Live Synoptic Cycle', reason: 'Industrial boiler emissions, unpaved secondary roads, and heavy commercial transit' },
      { id: 'H-DW-3', name: 'Dwarka Expressway Sector 8', type: 'construction', coordinates: [77.0680, 28.5740], intensity: 78, status: 'monitoring', aqi: 271, source: 'Copernicus CAMS Micro-Dispersion & Municipal Registry', truthTier: 'MODELLED', timestamp: 'Live Synoptic Cycle', reason: 'Unpaved excavation corridors, major expressway construction, and fugitive silt resuspension' },
      { id: 'H-GZ-4', name: 'Ghazipur Landfill Perimeter', type: 'waste', coordinates: [77.3290, 28.6240], intensity: 92, status: 'active', aqi: 330, source: 'Sentinel-5P TROPOMI & Spatial Dispersion Model', truthTier: 'MODELLED', timestamp: 'Live Synoptic Cycle', reason: 'Municipal solid waste degradation, sub-surface smoldering, and NH-24 traffic choke' },
    ],
  },
  'mumbai': {
    cityId: 'mumbai',
    cityName: 'Mumbai',
    state: 'Maharashtra',
    center: [72.8777, 19.0760],
    zoom: 11,
    overallAqi: 156,
    overallStatus: 'Moderate',
    sixHourTrend: '↑ 6% over previous 6 hours',
    trendPct: 6,
    criticalZone: {
      wardName: 'Chembur',
      wardId: 'MB-CH-201',
      aqi: 310,
      pm25: 182,
      pm10: 295,
      drivers: ['Industrial refining emissions', 'Port transit congestion'],
      forecastText: 'Expected moderate stagnation during sea breeze shift around 18:00',
      trend: 'Increasing',
    },
    priorityAreas: [
      { rank: '01', name: 'Chembur', wardId: 'MB-CH-201', aqi: 310, risk: 'Critical', driver: 'Refinery emissions', expectedImpact: 'Est. reduction: 16–22 AQI' },
      { rank: '02', name: 'Kurla', wardId: 'MB-KU-105', aqi: 280, risk: 'High', driver: 'Traffic bottlenecks', expectedImpact: 'Est. reduction: 12–18 AQI' },
      { rank: '03', name: 'Andheri East', wardId: 'MB-AN-304', aqi: 245, risk: 'High', driver: 'Metro construction dust', expectedImpact: 'Est. reduction: 10–14 AQI' },
      { rank: '04', name: 'Bandra Kurla Complex', wardId: 'MB-BKC-01', aqi: 185, risk: 'Moderate', driver: 'Commercial vehicular density', expectedImpact: 'Est. reduction: 8–12 AQI' },
    ],
    wards: [
      { id: 'MB-CH-201', name: 'Chembur', centroid: [72.8965, 19.0515], aqi: 310, severity: 'hazardous', population: 450000, area: 12.0 },
      { id: 'MB-KU-105', name: 'Kurla', centroid: [72.8777, 19.0728], aqi: 280, severity: 'veryUnhealthy', population: 900000, area: 15.3 },
      { id: 'MB-AN-304', name: 'Andheri East', centroid: [72.8662, 19.1136], aqi: 245, severity: 'unhealthy', population: 1500000, area: 24.5 },
      { id: 'MB-BKC-01', name: 'Bandra Kurla Complex', centroid: [72.8680, 19.0600], aqi: 185, severity: 'moderate', population: 340000, area: 8.1 },
      { id: 'MB-CO-001', name: 'Colaba', centroid: [72.8169, 18.9067], aqi: 112, severity: 'moderate', population: 120000, area: 4.5 },
      { id: 'MB-BO-502', name: 'Borivali', centroid: [72.8562, 19.2307], aqi: 95, severity: 'good', population: 800000, area: 18.2 },
    ],
    hotspots: [
      { id: 'HM-1', name: 'Deonar Landfill', type: 'waste', coordinates: [72.9234, 19.0558], intensity: 94, status: 'active', aqi: 295, source: 'Sentinel-5P TROPOMI & Ground Spatial Dispersion', truthTier: 'MODELLED', timestamp: 'Live Synoptic Cycle', reason: 'Municipal solid waste methane flares and fugitive particulate emissions' },
      { id: 'HM-2', name: 'Chembur Refinery Area', type: 'industrial', coordinates: [72.8986, 19.0287], intensity: 88, status: 'active', aqi: 310, source: 'CPCB / MPCB CAAQMS Station (Chembur)', truthTier: 'OBSERVED', timestamp: 'Live Synoptic Cycle', reason: 'Petrochemical refining point sources and port heavy transport idling' },
      { id: 'HM-3', name: 'WEH Andheri Flyover', type: 'traffic', coordinates: [72.8517, 19.1234], intensity: 76, status: 'active', aqi: 245, source: 'Copernicus CAMS Micro-Dispersion & Traffic Sensor', truthTier: 'MODELLED', timestamp: 'Live Synoptic Cycle', reason: 'Western Express Highway arterial choke and commercial transit exhaust' },
    ],
  },
  'ahmedabad': {
    cityId: 'ahmedabad',
    cityName: 'Ahmedabad',
    state: 'Gujarat',
    center: [72.5714, 23.0225],
    zoom: 11,
    overallAqi: 178,
    overallStatus: 'Moderate',
    sixHourTrend: '↑ 4% over previous 6 hours',
    trendPct: 4,
    criticalZone: {
      wardName: 'Narol Industrial Zone',
      wardId: 'AH-NR-101',
      aqi: 290,
      pm25: 165,
      pm10: 270,
      drivers: ['Textile processing boiler emissions', 'Heavy industrial transport'],
      forecastText: 'Elevated particulate concentration likely through midnight',
      trend: 'Stable',
    },
    priorityAreas: [
      { rank: '01', name: 'Narol Industrial', wardId: 'AH-NR-101', aqi: 290, risk: 'High', driver: 'Industrial emissions', expectedImpact: 'Est. reduction: 18–24 AQI' },
      { rank: '02', name: 'Vatva GIDC', wardId: 'AH-VT-202', aqi: 265, risk: 'High', driver: 'Chemical stack plumes', expectedImpact: 'Est. reduction: 14–20 AQI' },
      { rank: '03', name: 'Maninagar', wardId: 'AH-MN-303', aqi: 195, risk: 'Moderate', driver: 'Urban road dust', expectedImpact: 'Est. reduction: 8–12 AQI' },
    ],
    wards: [
      { id: 'AH-NR-101', name: 'Narol', centroid: [72.5850, 22.9650], aqi: 290, severity: 'veryUnhealthy', population: 320000, area: 14.5 },
      { id: 'AH-VT-202', name: 'Vatva', centroid: [72.6320, 22.9580], aqi: 265, severity: 'unhealthy', population: 280000, area: 16.0 },
      { id: 'AH-MN-303', name: 'Maninagar', centroid: [72.6020, 22.9980], aqi: 195, severity: 'moderate', population: 410000, area: 11.2 },
      { id: 'AH-ST-404', name: 'Satellite', centroid: [72.5280, 23.0310], aqi: 145, severity: 'moderate', population: 390000, area: 9.8 },
      { id: 'AH-BP-505', name: 'Bopal', centroid: [72.4680, 23.0350], aqi: 120, severity: 'moderate', population: 250000, area: 13.0 },
    ],
    hotspots: [
      { id: 'HA-1', name: 'Narol Textile Corridor', type: 'industrial', coordinates: [72.5870, 22.9660], intensity: 90, status: 'active', aqi: 290, source: 'GPCB Continuous Monitoring Station (Narol)', truthTier: 'OBSERVED', timestamp: 'Live Synoptic Cycle', reason: 'Textile processing coal boilers and high commercial freight concentration' },
      { id: 'HA-2', name: 'Vatva Chemical Estate', type: 'industrial', coordinates: [72.6340, 22.9590], intensity: 84, status: 'active', aqi: 265, source: 'GPCB Industrial Monitoring Station (Vatva GIDC)', truthTier: 'OBSERVED', timestamp: 'Live Synoptic Cycle', reason: 'Chemical manufacturing point emissions and industrial diesel generators' },
    ],
  },
  'jaipur': {
    cityId: 'jaipur',
    cityName: 'Jaipur',
    state: 'Rajasthan',
    center: [75.7873, 26.9124],
    zoom: 11,
    overallAqi: 188,
    overallStatus: 'Moderate',
    sixHourTrend: '↑ 5% over previous 6 hours',
    trendPct: 5,
    criticalZone: {
      wardName: 'Sitapura Industrial Area',
      wardId: 'JP-SP-101',
      aqi: 275,
      pm25: 158,
      pm10: 290,
      drivers: ['Fugitive mineral dust', 'Industrial diesel gensets'],
      forecastText: 'Dry arid winds forecast to keep PM10 elevated for next 12 hours',
      trend: 'Increasing',
    },
    priorityAreas: [
      { rank: '01', name: 'Sitapura Industrial', wardId: 'JP-SP-101', aqi: 275, risk: 'High', driver: 'Dust & Industrial', expectedImpact: 'Est. reduction: 14–20 AQI' },
      { rank: '02', name: 'Shastri Nagar', wardId: 'JP-SN-202', aqi: 230, risk: 'High', driver: 'High vehicular density', expectedImpact: 'Est. reduction: 10–14 AQI' },
      { rank: '03', name: 'Mansarovar', wardId: 'JP-MS-303', aqi: 190, risk: 'Moderate', driver: 'Road dust & construction', expectedImpact: 'Est. reduction: 8–12 AQI' },
    ],
    wards: [
      { id: 'JP-SP-101', name: 'Sitapura', centroid: [75.8320, 26.7820], aqi: 275, severity: 'veryUnhealthy', population: 210000, area: 18.0 },
      { id: 'JP-SN-202', name: 'Shastri Nagar', centroid: [75.7950, 26.9480], aqi: 230, severity: 'unhealthy', population: 340000, area: 8.5 },
      { id: 'JP-MS-303', name: 'Mansarovar', centroid: [75.7620, 26.8580], aqi: 190, severity: 'moderate', population: 480000, area: 15.2 },
      { id: 'JP-AN-404', name: 'Adarsh Nagar', centroid: [75.8280, 26.9020], aqi: 140, severity: 'moderate', population: 190000, area: 6.8 },
    ],
    hotspots: [
      { id: 'HJ-1', name: 'Sitapura GIDC', type: 'industrial', coordinates: [75.8350, 26.7840], intensity: 88, status: 'active', aqi: 275, source: 'RSPCB CAAQMS Station (Sitapura)', truthTier: 'OBSERVED', timestamp: 'Live Synoptic Cycle', reason: 'Mineral grinding, gem polishing units, and dry unpaved road dust' },
    ],
  },
  'lucknow': {
    cityId: 'lucknow',
    cityName: 'Lucknow',
    state: 'Uttar Pradesh',
    center: [80.9462, 26.8467],
    zoom: 11,
    overallAqi: 215,
    overallStatus: 'Poor',
    sixHourTrend: '↑ 8% over previous 6 hours',
    trendPct: 8,
    criticalZone: {
      wardName: 'Talkatora Industrial Area',
      wardId: 'LK-TK-101',
      aqi: 315,
      pm25: 195,
      pm10: 310,
      drivers: ['Industrial manufacturing', 'Localized biomass burning'],
      forecastText: 'Calm surface wind speeds causing trapping of ground-level pollutants',
      trend: 'Increasing',
    },
    priorityAreas: [
      { rank: '01', name: 'Talkatora Industrial', wardId: 'LK-TK-101', aqi: 315, risk: 'Critical', driver: 'Industrial emissions', expectedImpact: 'Est. reduction: 18–25 AQI' },
      { rank: '02', name: 'Lalbagh', wardId: 'LK-LB-202', aqi: 280, risk: 'High', driver: 'Traffic congestion', expectedImpact: 'Est. reduction: 12–16 AQI' },
      { rank: '03', name: 'Charbagh', wardId: 'LK-CB-303', aqi: 240, risk: 'High', driver: 'Station diesel transit', expectedImpact: 'Est. reduction: 10–14 AQI' },
    ],
    wards: [
      { id: 'LK-TK-101', name: 'Talkatora', centroid: [80.8950, 26.8280], aqi: 315, severity: 'hazardous', population: 310000, area: 12.0 },
      { id: 'LK-LB-202', name: 'Lalbagh', centroid: [80.9420, 26.8480], aqi: 280, severity: 'veryUnhealthy', population: 260000, area: 7.5 },
      { id: 'LK-CB-303', name: 'Charbagh', centroid: [80.9220, 26.8320], aqi: 240, severity: 'unhealthy', population: 350000, area: 9.0 },
      { id: 'LK-GN-404', name: 'Gomti Nagar', centroid: [80.9980, 26.8620], aqi: 185, severity: 'moderate', population: 520000, area: 22.0 },
    ],
    hotspots: [
      { id: 'HL-1', name: 'Talkatora Industrial Zone', type: 'industrial', coordinates: [80.8960, 26.8290], intensity: 92, status: 'active', aqi: 315, source: 'UPPCB CAAQMS Station (Talkatora)', truthTier: 'OBSERVED', timestamp: 'Live Synoptic Cycle', reason: 'Metal fabrication, foundry point emissions, and stagnant nocturnal boundary layer' },
    ],
  },
  'kolkata': {
    cityId: 'kolkata',
    cityName: 'Kolkata',
    state: 'West Bengal',
    center: [88.3639, 22.5726],
    zoom: 11,
    overallAqi: 164,
    overallStatus: 'Moderate',
    sixHourTrend: '↓ 3% over previous 6 hours',
    trendPct: -3,
    criticalZone: {
      wardName: 'Rabindra Bharati University',
      wardId: 'KL-RB-101',
      aqi: 265,
      pm25: 148,
      pm10: 255,
      drivers: ['Dense commercial vehicle idling on BT Road', 'Fugitive dust'],
      forecastText: 'River breeze circulation likely to assist night dispersion',
      trend: 'Decreasing',
    },
    priorityAreas: [
      { rank: '01', name: 'Rabindra Bharati', wardId: 'KL-RB-101', aqi: 265, risk: 'High', driver: 'BT Road Traffic', expectedImpact: 'Est. reduction: 14–18 AQI' },
      { rank: '02', name: 'Victoria Memorial Area', wardId: 'KL-VM-202', aqi: 220, risk: 'High', driver: 'Arterial transit', expectedImpact: 'Est. reduction: 8–12 AQI' },
      { rank: '03', name: 'Jadavpur', wardId: 'KL-JD-303', aqi: 190, risk: 'Moderate', driver: 'Construction activity', expectedImpact: 'Est. reduction: 6–10 AQI' },
    ],
    wards: [
      { id: 'KL-RB-101', name: 'Rabindra Bharati', centroid: [88.3750, 22.6280], aqi: 265, severity: 'veryUnhealthy', population: 380000, area: 11.0 },
      { id: 'KL-VM-202', name: 'Victoria Memorial Area', centroid: [88.3420, 22.5440], aqi: 220, severity: 'unhealthy', population: 210000, area: 8.5 },
      { id: 'KL-JD-303', name: 'Jadavpur', centroid: [88.3710, 22.4980], aqi: 190, severity: 'moderate', population: 490000, area: 14.5 },
      { id: 'KL-SL-404', name: 'Salt Lake Sector V', centroid: [88.4320, 22.5780], aqi: 140, severity: 'moderate', population: 310000, area: 16.0 },
    ],
    hotspots: [
      { id: 'HK-1', name: 'BT Road Transport Hub', type: 'traffic', coordinates: [88.3760, 22.6290], intensity: 86, status: 'active', aqi: 265, source: 'WBPCB CAAQMS Station (Rabindra Bharati)', truthTier: 'OBSERVED', timestamp: 'Live Synoptic Cycle', reason: 'Barrackpore Trunk Road heavy diesel bus transit and road shoulder dust' },
    ],
  },
  'bengaluru': {
    cityId: 'bengaluru',
    cityName: 'Bengaluru',
    state: 'Karnataka',
    center: [77.5946, 12.9716],
    zoom: 11,
    overallAqi: 92,
    overallStatus: 'Satisfactory',
    sixHourTrend: '↑ 2% over previous 6 hours',
    trendPct: 2,
    criticalZone: {
      wardName: 'Silk Board Junction',
      wardId: 'BLR-SB-101',
      aqi: 145,
      pm25: 78,
      pm10: 162,
      drivers: ['Chronic traffic gridlock', 'Ongoing flyover civil works'],
      forecastText: 'Steady plateauing through evening rush hours',
      trend: 'Stable',
    },
    priorityAreas: [
      { rank: '01', name: 'Silk Board Junction', wardId: 'BLR-SB-101', aqi: 145, risk: 'Moderate', driver: 'Traffic Congestion', expectedImpact: 'Est. reduction: 12–16 AQI' },
      { rank: '02', name: 'Peenya Industrial Area', wardId: 'BLR-PN-202', aqi: 135, risk: 'Moderate', driver: 'Metal and machine fabrication', expectedImpact: 'Est. reduction: 8–12 AQI' },
      { rank: '03', name: 'Whitefield IT Corridor', wardId: 'BLR-WF-303', aqi: 115, risk: 'Moderate', driver: 'Commercial vehicle flow', expectedImpact: 'Est. reduction: 6–10 AQI' },
    ],
    wards: [
      { id: 'BLR-SB-101', name: 'Silk Board', centroid: [77.6220, 12.9170], aqi: 145, severity: 'moderate', population: 390000, area: 9.5 },
      { id: 'BLR-PN-202', name: 'Peenya', centroid: [77.5180, 13.0280], aqi: 135, severity: 'moderate', population: 420000, area: 18.0 },
      { id: 'BLR-WF-303', name: 'Whitefield', centroid: [77.7490, 12.9690], aqi: 115, severity: 'moderate', population: 510000, area: 24.0 },
      { id: 'BLR-BTM-404', name: 'BTM Layout', centroid: [77.6080, 12.9120], aqi: 95, severity: 'satisfactory' as AQISeverity, population: 340000, area: 8.0 },
    ],
    hotspots: [
      { id: 'HB-1', name: 'Central Silk Board Flyover', type: 'traffic', coordinates: [77.6230, 12.9180], intensity: 74, status: 'active', aqi: 145, source: 'KSPCB CAAQMS Station (BTM / Silk Board)', truthTier: 'OBSERVED', timestamp: 'Live Synoptic Cycle', reason: 'Severe arterial traffic bottlenecks, construction machinery, and vehicle idling' },
    ],
  },
  'hyderabad': {
    cityId: 'hyderabad',
    cityName: 'Hyderabad',
    state: 'Telangana',
    center: [78.4867, 17.3850],
    zoom: 11,
    overallAqi: 124,
    overallStatus: 'Moderate',
    sixHourTrend: '↑ 3% over previous 6 hours',
    trendPct: 3,
    criticalZone: {
      wardName: 'Sanathnagar Industrial',
      wardId: 'HYD-SN-101',
      aqi: 195,
      pm25: 108,
      pm10: 215,
      drivers: ['Pharma cluster emissions', 'Interstate logistics'],
      forecastText: 'Moderate stagnation under low wind conditions',
      trend: 'Stable',
    },
    priorityAreas: [
      { rank: '01', name: 'Sanathnagar', wardId: 'HYD-SN-101', aqi: 195, risk: 'Moderate', driver: 'Pharma & Logistics', expectedImpact: 'Est. reduction: 12–16 AQI' },
      { rank: '02', name: 'Nehru Zoo Park Area', wardId: 'HYD-ZP-202', aqi: 180, risk: 'Moderate', driver: 'Old city transit congestion', expectedImpact: 'Est. reduction: 8–12 AQI' },
    ],
    wards: [
      { id: 'HYD-SN-101', name: 'Sanathnagar', centroid: [78.4420, 17.4580], aqi: 195, severity: 'moderate', population: 310000, area: 11.0 },
      { id: 'HYD-ZP-202', name: 'Zoo Park Area', centroid: [78.4520, 17.3480], aqi: 180, severity: 'moderate', population: 290000, area: 9.0 },
      { id: 'HYD-HC-303', name: 'Hitec City', centroid: [78.3780, 17.4420], aqi: 120, severity: 'moderate', population: 460000, area: 16.5 },
    ],
    hotspots: [
      { id: 'HH-1', name: 'Sanathnagar Industrial Hub', type: 'industrial', coordinates: [78.4430, 17.4590], intensity: 80, status: 'active', aqi: 195, source: 'TSPCB CAAQMS Station (Sanathnagar)', truthTier: 'OBSERVED', timestamp: 'Live Synoptic Cycle', reason: 'Pharmaceutical manufacturing plants, heavy logistics transit, and diesel emissions' },
    ],
  },
  'chennai': {
    cityId: 'chennai',
    cityName: 'Chennai',
    state: 'Tamil Nadu',
    center: [80.2707, 13.0827],
    zoom: 11,
    overallAqi: 86,
    overallStatus: 'Satisfactory',
    sixHourTrend: '↓ 4% over previous 6 hours',
    trendPct: -4,
    criticalZone: {
      wardName: 'Manali Petrochemical Corridor',
      wardId: 'CH-MN-101',
      aqi: 185,
      pm25: 98,
      pm10: 192,
      drivers: ['Petrochemical complexes', 'Thermal power plant dispersion'],
      forecastText: 'Coastal maritime winds maintaining dispersion away from central city',
      trend: 'Decreasing',
    },
    priorityAreas: [
      { rank: '01', name: 'Manali Industrial', wardId: 'CH-MN-101', aqi: 185, risk: 'Moderate', driver: 'Petrochemical stack', expectedImpact: 'Est. reduction: 14–20 AQI' },
      { rank: '02', name: 'Kodungaiyur', wardId: 'CH-KD-202', aqi: 165, risk: 'Moderate', driver: 'Solid waste management site', expectedImpact: 'Est. reduction: 10–14 AQI' },
    ],
    wards: [
      { id: 'CH-MN-101', name: 'Manali', centroid: [80.2620, 13.1680], aqi: 185, severity: 'moderate', population: 220000, area: 15.0 },
      { id: 'CH-KD-202', name: 'Kodungaiyur', centroid: [80.2580, 13.1380], aqi: 165, severity: 'moderate', population: 310000, area: 12.0 },
      { id: 'CH-VC-303', name: 'Velachery', centroid: [80.2180, 12.9780], aqi: 115, severity: 'moderate', population: 420000, area: 14.0 },
      { id: 'CH-AL-404', name: 'Alandur', centroid: [80.1980, 13.0020], aqi: 85, severity: 'satisfactory' as AQISeverity, population: 280000, area: 8.5 },
    ],
    hotspots: [
      { id: 'HC-1', name: 'Manali Petrochemical Complex', type: 'industrial', coordinates: [80.2640, 13.1690], intensity: 82, status: 'active', aqi: 185, source: 'TNPCB CAAQMS Station (Manali)', truthTier: 'OBSERVED', timestamp: 'Live Synoptic Cycle', reason: 'Petrochemical refinery flaring, thermal plant perimeter, and container freight' },
    ],
  },
};

export function getCityData(cityId: string): CityDataProfile {
  return CITY_DATA_PROFILES[cityId] || CITY_DATA_PROFILES['delhi-ncr'];
}
