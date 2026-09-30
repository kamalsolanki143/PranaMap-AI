'use client';
import React, { useState } from 'react';
import Header from '@/components/Navbar/Header';
import { INDIAN_CITIES } from '@/lib/cities';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import RiskBadge from '@/components/Common/RiskBadge';
import {
  MapPin,
  Globe2,
  Radio,
  Check,
  ArrowRight,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  ShieldAlert,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { CityConfig } from '@/types';

interface CityNetworkData extends CityConfig {
  basin: string;
  trend: 'deteriorating' | 'stable' | 'improving';
  trendValue: string;
  freshness: string;
  stationAvailability: string;
  svgX: number;
  svgY: number;
}

export default function CitiesPage() {
  const { selectedCity, setSelectedCity } = useAppStore();
  const router = useRouter();
  const [hoveredCityId, setHoveredCityId] = useState<string | null>(null);

  // Enriched network dataset with geographic basins and accurate SVG coordinates for India map projection
  const networkCities: CityNetworkData[] = [
    {
      ...INDIAN_CITIES.find((c) => c.id === 'delhi-ncr') || INDIAN_CITIES[0],
      basin: 'Indo-Gangetic Basin',
      trend: 'deteriorating',
      trendValue: '+14% / 6h',
      freshness: 'CACHED · Benchmark Reference',
      stationAvailability: 'Verified CAAQMS Network',
      svgX: 180,
      svgY: 130,
    },
    {
      ...INDIAN_CITIES.find((c) => c.id === 'lucknow') || INDIAN_CITIES[0],
      basin: 'Indo-Gangetic Basin',
      trend: 'deteriorating',
      trendValue: '+9% / 6h',
      freshness: 'CACHED · Benchmark Reference',
      stationAvailability: 'Verified CAAQMS Network',
      svgX: 250,
      svgY: 155,
    },
    {
      ...INDIAN_CITIES.find((c) => c.id === 'jaipur') || INDIAN_CITIES[0],
      basin: 'Thar-Aravalli Corridor',
      trend: 'stable',
      trendValue: '±2% / 6h',
      freshness: 'CACHED · Benchmark Reference',
      stationAvailability: 'Verified CAAQMS Network',
      svgX: 150,
      svgY: 165,
    },
    {
      ...INDIAN_CITIES.find((c) => c.id === 'ahmedabad') || INDIAN_CITIES[0],
      basin: 'Western Industrial Basin',
      trend: 'stable',
      trendValue: '±3% / 6h',
      freshness: 'CACHED · Benchmark Reference',
      stationAvailability: 'Verified CAAQMS Network',
      svgX: 120,
      svgY: 220,
    },
    {
      ...INDIAN_CITIES.find((c) => c.id === 'mumbai') || INDIAN_CITIES[0],
      basin: 'Konkan Coastal Airshed',
      trend: 'improving',
      trendValue: '-6% / 6h',
      freshness: 'CACHED · Benchmark Reference',
      stationAvailability: 'Verified CAAQMS Network',
      svgX: 130,
      svgY: 295,
    },
    {
      ...INDIAN_CITIES.find((c) => c.id === 'kolkata') || INDIAN_CITIES[0],
      basin: 'Lower Ganges Delta',
      trend: 'stable',
      trendValue: '+1% / 6h',
      freshness: 'CACHED · Benchmark Reference',
      stationAvailability: 'Verified CAAQMS Network',
      svgX: 350,
      svgY: 225,
    },
    {
      ...INDIAN_CITIES.find((c) => c.id === 'hyderabad') || INDIAN_CITIES[0],
      basin: 'Deccan Plateau Airshed',
      trend: 'stable',
      trendValue: '-2% / 6h',
      freshness: 'CACHED · Benchmark Reference',
      stationAvailability: 'Verified CAAQMS Network',
      svgX: 210,
      svgY: 310,
    },
    {
      ...INDIAN_CITIES.find((c) => c.id === 'bengaluru') || INDIAN_CITIES[0],
      basin: 'Mysore Plateau Airshed',
      trend: 'improving',
      trendValue: '-8% / 6h',
      freshness: 'CACHED · Benchmark Reference',
      stationAvailability: 'Verified CAAQMS Network',
      svgX: 190,
      svgY: 380,
    },
    {
      ...INDIAN_CITIES.find((c) => c.id === 'chennai') || INDIAN_CITIES[0],
      basin: 'Coromandel Coastal Airshed',
      trend: 'improving',
      trendValue: '-5% / 6h',
      freshness: 'CACHED · Benchmark Reference',
      stationAvailability: 'Verified CAAQMS Network',
      svgX: 230,
      svgY: 385,
    },
  ];

  function handleSelectCity(city: CityConfig) {
    setSelectedCity(city);
    router.push('/dashboard');
  }

  const getAqiRisk = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Satisfactory';
    if (aqi <= 200) return 'Moderate';
    if (aqi <= 300) return 'Poor';
    if (aqi <= 400) return 'Very Poor';
    return 'Severe';
  };

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#34d399';
    if (aqi <= 200) return '#f59e0b';
    if (aqi <= 300) return '#f97316';
    if (aqi <= 400) return '#ef4444';
    return '#b91c1c';
  };

  const activeNetworkCity = networkCities.find((c) => c.id === selectedCity.id) || networkCities[0];

  return (
    <div className="flex flex-col h-full w-full bg-background text-text-primary">
      <Header />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Top Header & Telemetry Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider font-mono">
                National Airshed Network
              </span>
              <span className="text-border">•</span>
              <span className="text-[11px] text-brand-forest font-medium font-mono">
                9 Indian Megacities
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight mt-0.5">
              Pan-India Environmental Intelligence Network
            </h1>
            <p className="text-text-secondary text-xs sm:text-sm mt-0.5">
              Multi-airshed atmospheric monitoring, cross-basin transport corridors, and synchronized municipal decision support
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="panel px-3.5 py-2 flex items-center gap-2.5 bg-surface border-border">
              <Radio size={14} className="text-brand-forest animate-pulse" />
              <div>
                <span className="text-[10px] text-text-muted uppercase font-mono font-semibold block">
                  Ground Telemetry
                </span>
                <span className="text-xs font-bold font-mono text-emerald-700">
                  27 / 27 Verified Monitors Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Network Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="panel p-3 border-l-4 border-l-brand-forest">
            <span className="text-[10px] font-mono text-text-muted uppercase block">Monitored Basins</span>
            <span className="text-base font-bold font-mono text-text-primary mt-0.5 block">5 Major Basins</span>
            <span className="text-[10px] text-text-secondary">Indo-Gangetic, Western, Deccan, Coast</span>
          </div>

          <div className="panel p-3 border-l-4 border-l-red-500">
            <span className="text-[10px] font-mono text-text-muted uppercase block">Exceedance Airsheds</span>
            <span className="text-base font-bold font-mono text-rose-700 mt-0.5 block">2 Critical Zones</span>
            <span className="text-[10px] text-rose-700/80">Delhi NCR (242), Lucknow (215)</span>
          </div>

          <div className="panel p-3 border-l-4 border-l-amber-500">
            <span className="text-[10px] font-mono text-text-muted uppercase block">National Mean AQI</span>
            <span className="text-base font-bold font-mono text-amber-700 mt-0.5 block">173 AQI</span>
            <span className="text-[10px] text-text-muted">Moderate cross-basin burden</span>
          </div>

          <div className="panel p-3 border-l-4 border-l-emerald-600">
            <span className="text-[10px] font-mono text-text-muted uppercase block">Active Jurisdiction</span>
            <span className="text-base font-bold text-emerald-800 mt-0.5 block truncate">
              {selectedCity.name}
            </span>
            <span className="text-[10px] text-emerald-700/80 font-mono">Current Platform Context</span>
          </div>
        </div>

        {/* Geographic Network Representation + Active Airshed Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pan-India Geographic Schematic Map */}
          <div className="lg:col-span-7 panel p-4 flex flex-col justify-between overflow-hidden border-border bg-white shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Globe2 size={15} className="text-brand-forest" />
                <h3 className="font-semibold text-xs text-text-primary uppercase tracking-wider font-mono">
                  Pan-India Airshed Corridor Topology
                </h3>
              </div>
              <span className="text-[10px] font-mono text-text-muted">
                Interactive: Click Node to Switch
              </span>
            </div>

            {/* SVG India Airshed Network Visualization */}
            <div className="relative w-full h-[380px] sm:h-[440px] flex items-center justify-center my-2">
              <svg className="w-full h-full max-w-[460px]" viewBox="0 0 460 480" fill="none">
                {/* Background India simplified outline bounds */}
                <path
                  d="M 180 40 L 220 80 L 270 110 L 320 140 L 370 170 L 410 180 L 380 230 L 330 260 L 290 320 L 250 410 L 220 450 L 190 410 L 140 330 L 110 270 L 90 220 L 120 160 L 150 110 Z"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  fill="#F1F5F0"
                  opacity="1"
                />

                {/* Major Inter-Basin Atmospheric Transport Corridors */}
                {/* 1. Indo-Gangetic Transport Corridor (NW to SE) */}
                <line x1="180" y1="130" x2="250" y2="155" stroke="#ef4444" strokeWidth="2.5" strokeOpacity="0.4" strokeDasharray="4 4" />
                <line x1="250" y1="155" x2="350" y2="225" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.4" strokeDasharray="4 4" />

                {/* 2. Thar-Aravalli to Northern Plain */}
                <line x1="150" y1="165" x2="180" y2="130" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.3" />

                {/* 3. Western Industrial Belt to Konkan */}
                <line x1="120" y1="220" x2="130" y2="295" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.35" />

                {/* 4. Deccan Plateau to Southern Coromandel */}
                <line x1="210" y1="310" x2="190" y2="380" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.3" />
                <line x1="190" y1="380" x2="230" y2="385" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.3" />

                {/* Render Each City Node */}
                {networkCities.map((city) => {
                  const isSelected = city.id === selectedCity.id;
                  const isHovered = city.id === hoveredCityId;
                  const color = getAqiColor(city.avgAqi);

                  return (
                    <g
                      key={city.id}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => handleSelectCity(city)}
                      onMouseEnter={() => setHoveredCityId(city.id)}
                      onMouseLeave={() => setHoveredCityId(null)}
                    >
                      {/* Active Ring Pulse */}
                      {isSelected && (
                        <circle
                          cx={city.svgX}
                          cy={city.svgY}
                          r="18"
                          fill="none"
                          stroke={color}
                          strokeWidth="1.5"
                          opacity="0.8"
                          className="animate-ping"
                        />
                      )}

                      {/* Node Outer Halo */}
                      <circle
                        cx={city.svgX}
                        cy={city.svgY}
                        r={isSelected ? 10 : 8}
                        fill={color}
                        fillOpacity="0.25"
                        stroke={color}
                        strokeWidth={isSelected ? 2 : 1.2}
                      />

                      {/* Node Core */}
                      <circle cx={city.svgX} cy={city.svgY} r={isSelected ? 5 : 4} fill={color} />

                      {/* City Name & AQI Callout Label */}
                      <text
                        x={city.svgX + 12}
                        y={city.svgY + 4}
                        fill={isSelected ? '#14532D' : '#334155'}
                        fontSize={isSelected ? '11' : '10'}
                        fontWeight={isSelected ? 'bold' : '600'}
                        fontFamily="ui-sans-serif, system-ui"
                      >
                        {city.name}
                      </text>
                      <text
                        x={city.svgX + 12}
                        y={city.svgY + 15}
                        fill={color}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="ui-monospace, monospace"
                      >
                        AQI {city.avgAqi}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Severe (400+)
                <span className="w-2 h-2 rounded-full bg-amber-500 ml-2" /> Moderate (101-200)
                <span className="w-2 h-2 rounded-full bg-emerald-600 ml-2" /> Satisfactory (&lt;100)
              </span>
              <span>Coordinates: WGS84 Geographic</span>
            </div>
          </div>

          {/* Active Jurisdiction Spotlight Card */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div className="panel p-5 space-y-4 border border-brand-forest/20 bg-surface shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-brand-forest uppercase font-mono font-bold tracking-wider block">
                    Active Platform Jurisdiction
                  </span>
                  <h2 className="text-xl font-bold text-text-primary mt-0.5">{activeNetworkCity.name}</h2>
                  <p className="text-xs text-text-muted">
                    {activeNetworkCity.state} • {activeNetworkCity.basin}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black font-mono text-text-primary tabular-nums">
                    {activeNetworkCity.avgAqi}
                  </span>
                  <div className="mt-1">
                    <RiskBadge level={getAqiRisk(activeNetworkCity.avgAqi)} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-border text-xs">
                <div className="p-2.5 rounded bg-surfaceHover border border-border">
                  <span className="text-[10px] text-text-muted uppercase font-mono block">6h Trajectory</span>
                  <span className="font-mono font-bold text-xs mt-1 flex items-center gap-1 text-rose-700">
                    <TrendingUp size={13} />
                    {activeNetworkCity.trendValue}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-surfaceHover border border-border">
                  <span className="text-[10px] text-text-muted uppercase font-mono block">Station Density</span>
                  <span className="font-mono font-bold text-xs mt-1 text-emerald-700 flex items-center gap-1">
                    <Radio size={13} />
                    {activeNetworkCity.stationAvailability}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-surfaceHover border border-border">
                  <span className="text-[10px] text-text-muted uppercase font-mono block">Lead Pollutant</span>
                  <span className="font-mono font-bold text-xs mt-1 text-atmo-blue">
                    {activeNetworkCity.dominantPollutant}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-surfaceHover border border-border">
                  <span className="text-[10px] text-text-muted uppercase font-mono block">Data Stream</span>
                  <span className="font-mono font-bold text-xs mt-1 text-text-primary">
                    {activeNetworkCity.freshness}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-stone-50 space-y-1.5 text-xs text-text-secondary">
                <span className="text-[10px] font-mono font-semibold text-text-muted uppercase block">
                  Airshed Context & Inversion Risk
                </span>
                <p className="text-xs leading-relaxed">
                  Continuous CPCB CAAQMS stations feed verified particulate indices into the 72-hour atmospheric dispersion engine. Interventions are coordinated through the municipal dispatch pipeline.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full py-2.5 rounded-lg bg-forestSecondary hover:bg-forestPrimary text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <span>Launch {activeNetworkCity.name} Command Center</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Operational Multi-City Network Matrix Table */}
        <div className="panel overflow-hidden border border-border shadow-xs">
          <div className="panel-header py-3 px-4 flex items-center justify-between border-b border-border bg-stone-50">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-forestSecondary" />
              <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-text-primary">
                National Airshed Telemetry Matrix — 9 Indian Megacities
              </h3>
            </div>
            <span className="text-[11px] text-text-muted font-mono">
              Synchronized Hourly CPCB Cycle
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-text-muted uppercase text-[10px] font-mono bg-surfaceHover/50 border-b border-border">
                  <th className="py-2.5 px-4 font-semibold">City / Jurisdiction</th>
                  <th className="py-2.5 px-4 font-semibold">Regional Basin</th>
                  <th className="py-2.5 px-4 font-semibold">Current NAQI</th>
                  <th className="py-2.5 px-4 font-semibold">Risk Classification</th>
                  <th className="py-2.5 px-4 font-semibold">6h Trend</th>
                  <th className="py-2.5 px-4 font-semibold">Ground Stations</th>
                  <th className="py-2.5 px-4 font-semibold">Data Freshness</th>
                  <th className="py-2.5 px-4 font-semibold">Lead Factor</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Switch Jurisdiction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-sans">
                {networkCities.map((city) => {
                  const isSelected = city.id === selectedCity.id;
                  const riskLevel = getAqiRisk(city.avgAqi);

                  return (
                    <tr
                      key={city.id}
                      className={`hover:bg-surfaceHover/60 transition-colors cursor-pointer ${
                        isSelected ? 'bg-brand-forest/5 font-medium' : ''
                      }`}
                      onClick={() => handleSelectCity(city)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className={isSelected ? 'text-brand-forest' : 'text-text-muted'} />
                          <div>
                            <span className="font-semibold text-text-primary">{city.name}</span>
                            <span className="text-[10px] text-text-muted block">{city.state}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-text-secondary text-[11px]">
                        {city.basin}
                      </td>

                      <td className="py-3 px-4 font-bold font-mono text-sm text-text-primary">
                        {city.avgAqi}
                      </td>

                      <td className="py-3 px-4">
                        <RiskBadge level={riskLevel} />
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        {city.trend === 'deteriorating' && (
                          <span className="text-rose-700 flex items-center gap-1 font-semibold">
                            <TrendingUp size={12} /> {city.trendValue}
                          </span>
                        )}
                        {city.trend === 'stable' && (
                          <span className="text-text-muted flex items-center gap-1">
                            <Minus size={12} /> {city.trendValue}
                          </span>
                        )}
                        {city.trend === 'improving' && (
                          <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                            <TrendingDown size={12} /> {city.trendValue}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-text-secondary">
                        {city.stationAvailability}
                      </td>

                      <td className="py-3 px-4 font-mono text-[10px] text-emerald-700">
                        {city.freshness}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-atmo-blue">
                        {city.dominantPollutant}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-forest/10 text-brand-forest text-[11px] font-semibold border border-brand-forest/20">
                            <Check size={12} />
                            <span>Active</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCity(city);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border hover:bg-surfaceHover text-text-primary text-[11px] font-medium transition-colors"
                          >
                            <span>Select</span>
                            <ChevronRight size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
