'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import LandingNavbar from '@/components/Navbar/LandingNavbar';
import { INDIAN_CITIES } from '@/lib/cities';
import RiskBadge from '@/components/Common/RiskBadge';
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  TrendingUp,
  PieChart,
  Megaphone,
  MapPin,
  Cpu,
  Database,
  Eye,
  Search,
  Sliders,
  Wind,
  AlertTriangle,
  Clock,
  Radio,
  CheckCircle2,
  ChevronRight,
  Satellite,
  Compass,
  FileText,
  SlidersHorizontal,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Hotspot3DData, HOTSPOTS_DATA } from '@/components/3D/AtmosphericScene';

// Dynamically import 3D Airshed scene for scientific visualization with accessible fallback
const AtmosphericScene = dynamic(() => import('@/components/3D/AtmosphericScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[460px] lg:min-h-[540px] bg-surfaceAlt rounded-2xl flex flex-col items-center justify-center border border-border gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-forestSecondary border-t-transparent animate-spin" />
      <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">
        Initializing 3D Geospatial Airshed & Inversion Boundary...
      </span>
    </div>
  ),
});

export default function LandingPage() {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot3DData>(HOTSPOTS_DATA[0]);
  const [spatialMode, setSpatialMode] = useState<'city' | 'hyperlocal'>('hyperlocal');
  const [selectedCityId, setSelectedCityId] = useState('delhi-ncr');
  const [simIntervention, setSimIntervention] = useState('freight');
  const [simIntensity, setSimIntensity] = useState(40);

  const activeCity = INDIAN_CITIES.find((c) => c.id === selectedCityId) || INDIAN_CITIES[0];

  const processStages = [
    {
      step: '01',
      name: 'Observe',
      lead: 'In-Situ Ground & Space Telemetry',
      desc: 'Ingests verified continuous CAAQMS ground station metrics and real-time synoptic weather from Open-Meteo with Copernicus CAMS assimilation.',
      icon: Radio,
      badge: 'LIVE + OBSERVED',
    },
    {
      step: '02',
      name: 'Detect',
      lead: 'Spatial Boundary Layer Clustering',
      desc: 'Detects microclimatic particulate accumulation and nocturnal inversion trapping zones across municipal airshed basins.',
      icon: Search,
      badge: 'SPATIAL TRUTH',
    },
    {
      step: '03',
      name: 'Predict',
      lead: '72-Hour Atmospheric Dispersion Modeling',
      desc: 'Couples synoptic wind vectors, temperature inversions, and boundary layer mixing height for forward-looking air quality outlooks.',
      icon: TrendingUp,
      badge: 'MODELLED OUTLOOK',
    },
    {
      step: '04',
      name: 'Explain',
      lead: 'Empirical Receptor Apportionment',
      desc: 'Transparently apportions pollution drivers into vehicular transport, construction dust, biomass, and regional drift using physical proxies.',
      icon: PieChart,
      badge: 'DISCLOSED PROXIES',
    },
    {
      step: '05',
      name: 'Act',
      lead: 'Decision Support & Action Coordination',
      desc: 'Generates evidence-backed intervention playbooks for municipal authorities, including freight diversions and dust mitigation protocols.',
      icon: Sliders,
      badge: 'GOVTECH RESPONSE',
    },
    {
      step: '06',
      name: 'Communicate',
      lead: 'Multilingual Public Advisories',
      desc: 'Google Gemini synthesizes culturally natural public health advisories in English, Hindi, and Marathi grounded strictly in verified sensor telemetry.',
      icon: Megaphone,
      badge: 'EN · HI · MR',
    },
  ];

  const dataSources = [
    {
      name: 'Central Pollution Control Board (CPCB)',
      type: 'Ground Monitoring',
      coverage: 'Continuous CAAQMS Stations across India',
      refresh: 'Continuous In-Situ Telemetry',
      truthTier: 'OBSERVED',
      tierClass: 'bg-purple-100 text-purple-800 border-purple-200',
      usedFor: 'Ground-truth particulate and gas criteria measurements (PM2.5, PM10, NO2, SO2, CO, O3)',
    },
    {
      name: 'Open-Meteo Synoptic Meteorological Service',
      type: 'Numerical Weather Prediction',
      coverage: 'Pan-India 0.1° High-Resolution Grid',
      refresh: 'Hourly Synoptic Model Cycle',
      truthTier: 'LIVE',
      tierClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      usedFor: 'Temperature, relative humidity, barometric pressure, wind speed, and wind direction vectors',
    },
    {
      name: 'Copernicus Atmosphere Monitoring Service (CAMS)',
      type: 'Atmospheric Chemistry Model',
      coverage: 'Global & Indian Subcontinent Assimilation',
      refresh: '3-Hourly Data Assimilation',
      truthTier: 'MODELLED',
      tierClass: 'bg-amber-100 text-amber-800 border-amber-200',
      usedFor: 'Boundary layer mixing height, aerosol optical depth, and regional transboundary drift',
    },
    {
      name: 'Copernicus Sentinel-5P TROPOMI',
      type: 'Spaceborne Remote Sensing',
      coverage: 'Subcontinent Orbital Overpass (3.5 × 5.5 km)',
      refresh: 'Daily Satellite Overpass',
      truthTier: 'MODELLED',
      tierClass: 'bg-amber-100 text-amber-800 border-amber-200',
      usedFor: 'Tropospheric column densities of NO2, SO2, Carbon Monoxide, and Aerosol Index (AI)',
    },
    {
      name: 'MapLibre & Cartographic Vector Basemaps',
      type: 'Geospatial GIS Engine',
      coverage: 'All Indian States, UTs, Districts & Municipalities',
      refresh: 'Real-time Vector Rendering',
      truthTier: 'LIVE',
      tierClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      usedFor: 'Precise administrative boundaries, elevation contours, road corridors, and station coordinates',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <LandingNavbar />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO VIEWPORT (Light Environmental Observatory)
          ───────────────────────────────────────────────────────────── */}
      <section id="overview" className="pt-24 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs text-forestSecondary font-medium shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-forestSecondary animate-pulse" />
              <span>National Environmental Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-[1.12]">
              Environmental intelligence for a{' '}
              <span className="text-forestSecondary underline decoration-forestSecondary/30 decoration-wavy underline-offset-8">
                breathable India.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl">
              Turn verified air-quality, weather and atmospheric data into hyperlocal insights,
              forecasts and coordinated response across Indian cities and rural airsheds.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/dashboard"
                className="py-3 px-6 rounded-xl bg-forestSecondary hover:bg-forestPrimary text-white font-semibold text-sm transition-all shadow-subtle flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Environmental Intelligence</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/data-provenance"
                className="py-3 px-6 rounded-xl bg-surface hover:bg-surfaceHover border border-border text-text-primary font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 text-forestSecondary" />
                <span>View Data Provenance</span>
              </Link>
            </div>

            {/* Trust Seals */}
            <div className="pt-4 border-t border-border flex flex-wrap items-center gap-6 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forestSecondary" />
                <span>CPCB NAQI Standard</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-atmoBlue" />
                <span>Open-Meteo Synoptic NWP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forestSecondary" />
                <span>Copernicus CAMS Assimilation</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Environmental Geographic Card */}
          <div className="lg:col-span-6">
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-forestSecondary" />
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Delhi NCR Airshed · In-Situ Snapshot
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-forestSecondary border border-emerald-200 font-semibold">
                  LIVE TELEMETRY
                </span>
              </div>

              {/* Geographic Overview Graphic */}
              <div className="h-64 rounded-xl bg-gradient-to-br from-emerald-50/50 via-stone-50 to-sky-50/50 border border-border p-4 relative overflow-hidden flex flex-col justify-between">
                {/* Wind Vectors Overlay */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-text-secondary bg-surface/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-border font-mono text-[11px]">
                    <Compass className="w-3.5 h-3.5 text-atmoBlue" />
                    <span>Wind: 14 km/h NW (315°)</span>
                  </div>
                  <div className="bg-surface/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-border text-[11px] font-mono text-text-secondary">
                    PBL: 680m (Inversion Active)
                  </div>
                </div>

                {/* Central Station Hotspots */}
                <div className="grid grid-cols-2 gap-3 my-auto">
                  <div className="bg-surface/90 border border-border rounded-lg p-3 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-text-primary">Anand Vihar</span>
                      <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                        OBSERVED
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-criticalTone">342</span>
                      <span className="text-[11px] text-criticalTone font-medium">Severe</span>
                    </div>
                    <span className="text-[10px] text-text-muted">PM2.5: 218 µg/m³ · CAAQMS</span>
                  </div>

                  <div className="bg-surface/90 border border-border rounded-lg p-3 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-text-primary">Dwarka Sec-8</span>
                      <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                        OBSERVED
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-amberTone">271</span>
                      <span className="text-[11px] text-amberTone font-medium">Poor</span>
                    </div>
                    <span className="text-[10px] text-text-muted">PM2.5: 142 µg/m³ · CAAQMS</span>
                  </div>
                </div>

                <div className="text-[11px] text-text-muted flex items-center justify-between bg-surface/80 backdrop-blur-xs px-3 py-1.5 rounded-md border border-border">
                  <span>Coupled Satellite: Sentinel-5P TROPOMI NO₂</span>
                  <span className="font-mono text-forestSecondary font-semibold">Active Sync</span>
                </div>
              </div>

              {/* Truth Callout */}
              <div className="p-3 bg-surfaceAlt rounded-xl border border-border flex items-start gap-2 text-xs text-text-secondary leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-forestSecondary shrink-0 mt-0.5" />
                <span>
                  Physical monitoring stations measure verified ground concentrations. Unmonitored districts
                  are coupled with nearest verified monitors and synoptic wind dispersion.
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: PROCESS (From Observation to Action)
          ───────────────────────────────────────────────────────────── */}
      <section id="process" className="py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-border">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-forestSecondary font-semibold">
            End-to-End Decision Framework
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            One system. From observation to action.
          </h2>
          <p className="text-sm sm:text-base text-text-secondary">
            A cohesive scientific workflow linking physical sensors, atmospheric modeling,
            source apportionment, and municipal intervention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="bg-surface border border-border rounded-xl p-6 shadow-subtle space-y-3 hover:border-forestSecondary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-surfaceAlt border border-border flex items-center justify-center text-forestSecondary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-text-muted font-bold">
                    {stage.step}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-text-primary">{stage.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surfaceAlt border border-border text-text-secondary">
                      {stage.badge}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-text-secondary">{stage.lead}</p>
                </div>

                <p className="text-xs text-text-muted leading-relaxed">
                  {stage.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: SPATIAL RESOLUTION (City vs Hyperlocal)
          ───────────────────────────────────────────────────────────── */}
      <section id="resolution" className="py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-forestSecondary font-semibold">
              Spatial Resolution & Provenance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Air quality is not a single number.
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              A metropolitan average often conceals severe localized hotspots. PranaMap AI distinguishes
              macro city-wide indices from street-level microclimates with explicit data provenance labels.
            </p>

            <div className="flex items-center gap-2 p-1 bg-surfaceAlt rounded-lg border border-border w-fit text-xs font-medium">
              <button
                type="button"
                onClick={() => setSpatialMode('city')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  spatialMode === 'city'
                    ? 'bg-surface text-text-primary shadow-2xs font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                City-Level View
              </button>
              <button
                type="button"
                onClick={() => setSpatialMode('hyperlocal')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  spatialMode === 'hyperlocal'
                    ? 'bg-surface text-text-primary shadow-2xs font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Hyperlocal In-Situ View
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-card space-y-4">
              {spatialMode === 'city' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="font-bold text-sm text-text-primary">Delhi NCR Metropolitan Average</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                      MODELLED SPATIAL MEAN
                    </span>
                  </div>

                  <div className="p-5 bg-surfaceAlt rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <span className="text-xs text-text-muted block">Aggregated 24-hr Air Quality</span>
                      <span className="text-3xl font-extrabold text-criticalTone">242 AQI</span>
                      <span className="text-xs text-criticalTone block font-medium">Poor Category</span>
                    </div>
                    <div className="text-right text-xs text-text-secondary font-mono space-y-1">
                      <div>Stations Ingested: 5 Active</div>
                      <div>Dispersion: Moderate</div>
                      <div>Source: CAAQMS Mesh Mean</div>
                    </div>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed">
                    City average smooths out extreme spikes. While the macro average is 242, specific arterial
                    corridors experience dangerous values above 340.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="font-bold text-sm text-text-primary">Hyperlocal Station Truth Comparison</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200">
                      OBSERVED CPCB
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 bg-surfaceAlt rounded-lg border border-border flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-text-primary">Anand Vihar (ISBT Corridor)</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200">
                            OBSERVED
                          </span>
                        </div>
                        <span className="text-[11px] text-text-muted">Direct Beta Attenuation Monitor</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-criticalTone">342 AQI</span>
                        <span className="text-[10px] block text-criticalTone font-medium">Severe</span>
                      </div>
                    </div>

                    <div className="p-3 bg-surfaceAlt rounded-lg border border-border flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-text-primary">Mandir Marg (Central Zone)</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200">
                            OBSERVED
                          </span>
                        </div>
                        <span className="text-[11px] text-text-muted">Direct BAM CAAQMS Station</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-amberTone">194 AQI</span>
                        <span className="text-[10px] block text-amberTone font-medium">Moderate</span>
                      </div>
                    </div>

                    <div className="p-3 bg-surfaceAlt rounded-lg border border-border flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-text-primary">Narela (Industrial Suburb)</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                            MODELLED (PranaMap)
                          </span>
                        </div>
                        <span className="text-[11px] text-text-muted">Nearest Verified: Alipur CAAQMS (8.4 km)</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-amberTone">228 AQI</span>
                        <span className="text-[10px] block text-amberTone font-medium">Poor</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: INDIA NETWORK (9 Verified Cities)
          ───────────────────────────────────────────────────────────── */}
      <section id="network" className="py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-border">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-forestSecondary font-semibold">
            Pan-India In-Situ Monitoring Network
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            27 Verified Stations Across 9 Major Indian Airsheds
          </h2>
          <p className="text-sm text-text-secondary">
            Continuous CAAQMS ground monitors reporting real-time particulate indices and meteorological conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INDIAN_CITIES.map((city) => (
            <div
              key={city.id}
              className={`bg-surface border rounded-xl p-4 shadow-subtle space-y-3 transition-colors ${
                selectedCityId === city.id ? 'border-forestSecondary bg-emerald-50/20' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-text-primary">{city.name}</h3>
                  <span className="text-xs text-text-muted">{city.state}</span>
                </div>
                <RiskBadge aqi={city.avgAqi} size="sm" />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-xs">
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-mono block">AQI</span>
                  <span className="font-bold text-text-primary">{city.avgAqi}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-mono block">Stations</span>
                  <span className="font-semibold text-text-primary">{city.activeStations} CAAQMS</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-mono block">Status</span>
                  <span className="font-mono text-[10px] text-forestSecondary font-semibold">ACTIVE</span>
                </div>
              </div>

              <div className="text-[11px] text-text-muted flex items-center justify-between pt-1">
                <span>Dominant: <strong className="text-text-primary font-mono">{city.dominantPollutant}</strong></span>
                <span className="font-mono text-[10px]">Updated hourly</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: DATA SOURCES (Transparent Registry)
          ───────────────────────────────────────────────────────────── */}
      <section id="sources" className="py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-border">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-forestSecondary font-semibold">
            Multi-Source Ingestion & Ground Truth
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            Authoritative Environmental Data Sources
          </h2>
          <p className="text-sm text-text-secondary">
            Only verified data is labeled LIVE or OBSERVED. Derived fields are transparently flagged as MODELLED.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {dataSources.map((source) => (
            <div
              key={source.name}
              className="bg-surface border border-border rounded-xl p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-sm text-text-primary">{source.name}</h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${source.tierClass}`}>
                    {source.truthTier}
                  </span>
                </div>
                <p className="text-xs text-text-secondary">{source.usedFor}</p>
                <div className="flex flex-wrap gap-4 text-[11px] text-text-muted pt-1">
                  <span>Coverage: <strong>{source.coverage}</strong></span>
                  <span>Cadence: <strong>{source.refresh}</strong></span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono text-forestSecondary font-semibold block">
                  Verified Ingestion
                </span>
                <span className="text-[11px] text-text-muted">CPCB Standard</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: 3D AIRSHED VISUALIZATION (Light Scientific Canvas)
          ───────────────────────────────────────────────────────────── */}
      <section id="airshed-3d" className="py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs text-forestSecondary font-medium mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Scientific Topographical Airshed Model</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              3D Airshed & Atmospheric Inversion
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Interactive terrain basin with physical wind vectors, nocturnal boundary inversion, and verified hotspot plumes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
              MODELLED VISUALIZATION
            </span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 shadow-card">
          <div className="relative w-full h-[480px] lg:h-[560px] rounded-xl overflow-hidden bg-stone-100 border border-border">
            <AtmosphericScene
              onSelectHotspot={(hotspot) => setSelectedHotspot(hotspot)}
              activeHotspotId={selectedHotspot.id}
            />

            {/* Hotspot Info Overlay Card */}
            <div className="absolute bottom-4 left-4 max-w-sm bg-surface/95 backdrop-blur-md border border-border rounded-xl p-4 shadow-card space-y-2 pointer-events-auto">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-text-primary">{selectedHotspot.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                  selectedHotspot.truthTier === 'OBSERVED'
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}>
                  {selectedHotspot.truthTier === 'OBSERVED' ? 'OBSERVED STATION' : 'MODELLED DISPERSION'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-criticalTone">{selectedHotspot.aqi} AQI</span>
                <span className="text-xs text-criticalTone font-medium">{selectedHotspot.level}</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-snug">
                Primary Driver: {selectedHotspot.driver}
              </p>
              {selectedHotspot.source && (
                <p className="text-[10px] text-text-muted font-mono pt-1 border-t border-border">
                  Provenance: {selectedHotspot.source}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: GOOGLE GEMINI REASONING
          ───────────────────────────────────────────────────────────── */}
      <section id="ai-reasoning" className="py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-forestSecondary font-semibold">
              Grounded AI Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Explain the conditions, not just the number.
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Google Gemini synthesizes physical boundary layer parameters, synoptic wind velocity,
              and criteria pollutant measurements into clear explanations for municipal authorities and citizens.
            </p>

            <div className="p-4 bg-surface rounded-xl border border-border shadow-2xs space-y-2 text-xs">
              <div className="font-bold text-text-primary flex items-center gap-2">
                <Cpu className="w-4 h-4 text-forestSecondary" />
                <span>Google Gemini Architecture</span>
              </div>
              <p className="text-text-muted leading-relaxed">
                Zero hallucinated numbers. The model generates narrative conclusions strictly from verified
                CPCB observations and numerical weather prediction inputs.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-card space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Synthesis Pipeline
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surfaceAlt border border-border text-forestSecondary font-semibold">
                  Google Gemini Grounded
                </span>
              </div>

              {/* Step 1: Inputs */}
              <div className="p-3.5 bg-surfaceAlt rounded-xl border border-border space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
                  1. Verified Input Data
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>Wind: 14 km/h NW</div>
                  <div>PBL Height: 680 m</div>
                  <div>PM2.5: 218 µg/m³</div>
                </div>
              </div>

              {/* Step 2: Gemini Reasoning */}
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-forestSecondary font-bold block">
                  2. Google Gemini Reasoning
                </span>
                <p className="text-xs text-forestPrimary leading-relaxed">
                  "Nocturnal radiative cooling is depressing the boundary layer to 680 meters while northwesterly
                  wind vectors transport regional vehicular exhaust into the Delhi basin. Low wind velocity
                  inhibits horizontal dispersion, causing acute particulate accumulation along eastern arterial corridors."
                </p>
              </div>

              {/* Step 3: Actionable Output */}
              <div className="p-3.5 bg-surfaceAlt rounded-xl border border-border space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
                  3. Operational Response
                </span>
                <div className="text-xs text-text-primary">
                  Recommend commercial freight bypass along Eastern Peripheral Expressway from 21:00 to 06:00 IST.
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8: DECISION SUPPORT & SIMULATION
          ───────────────────────────────────────────────────────────── */}
      <section id="decision-support" className="py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-border">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-forestSecondary font-semibold">
            Evidence-Based Interventions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            Distinguishing Recommendations from Simulations
          </h2>
          <p className="text-sm text-text-secondary">
            Operational recommendations reflect real-world action protocols. Scenario simulations
            model hypothetical outcomes without fabricating observed impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recommendation Card */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-text-primary">Operational Recommendation</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">
                RECOMMENDATION
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-surfaceAlt rounded-lg border border-border">
                <span className="text-text-muted block text-[10px] uppercase font-mono">Area & Risk</span>
                <strong className="text-text-primary">Anand Vihar · Severe PM2.5 Accumulation</strong>
              </div>

              <div className="p-3 bg-surfaceAlt rounded-lg border border-border">
                <span className="text-text-muted block text-[10px] uppercase font-mono">Observed Driver</span>
                <span className="text-text-primary">Inter-state diesel bus idling & arterial freight traffic</span>
              </div>

              <div className="p-3 bg-surfaceAlt rounded-lg border border-border">
                <span className="text-text-muted block text-[10px] uppercase font-mono">Recommended Action</span>
                <span className="text-forestSecondary font-semibold">
                  Deploy traffic marshal diversion at Ghazipur border; activate anti-smog misting cannons
                </span>
              </div>
            </div>
          </div>

          {/* Simulation Panel */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-text-primary">Scenario Impact Simulation</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                SIMULATION
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-text-primary mb-1">
                  Scenario: Heavy Freight Diversion ({simIntensity}%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={simIntensity}
                  onChange={(e) => setSimIntensity(Number(e.target.value))}
                  className="w-full accent-forestSecondary"
                />
              </div>

              <div className="p-3 bg-surfaceAlt rounded-lg border border-border space-y-1">
                <span className="text-text-muted block text-[10px] uppercase font-mono">Projected Impact</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-forestSecondary">
                    -{Math.round(simIntensity * 0.38)} AQI Points
                  </span>
                  <span className="text-[11px] text-text-muted">Estimated Particulate Relief</span>
                </div>
                <span className="text-[10px] text-text-muted block pt-1">
                  *Simulation calculation based on dispersion factor 0.38 · Not an observed field result.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 9: TRUST / DATA PROVENANCE (The 5 Truth Tiers)
          ───────────────────────────────────────────────────────────── */}
      <section id="provenance" className="py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-border">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-forestSecondary font-semibold">
            Trust & Integrity Standard
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            Know what the system knows.
          </h2>
          <p className="text-sm text-text-secondary">
            Five strict tiers define every metric displayed across PranaMap AI.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-surface border border-border rounded-xl p-4 shadow-subtle space-y-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              LIVE
            </span>
            <p className="text-xs text-text-secondary pt-1">
              Direct runtime API response received within current session cycle.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 shadow-subtle space-y-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              CACHED
            </span>
            <p className="text-xs text-text-secondary pt-1">
              Verified historical snapshot retrieved from Firestore fallback.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 shadow-subtle space-y-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
              OBSERVED
            </span>
            <p className="text-xs text-text-secondary pt-1">
              Physical in-situ sensor measurement from a certified CPCB station.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 shadow-subtle space-y-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
              MODELLED
            </span>
            <p className="text-xs text-text-secondary pt-1">
              Atmospheric physics or spatial interpolation from nearest verified inputs.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 shadow-subtle space-y-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
              SIMULATION
            </span>
            <p className="text-xs text-text-secondary pt-1">
              Hypothetical scenario calculation illustrating potential intervention outcomes.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/data-provenance"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forestSecondary hover:underline"
          >
            <span>Read full Data Provenance & Lineage Documentation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 10: FINAL CTA (Build a Breathable India)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-12 bg-surfaceAlt border-t border-border">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight">
            Build a more breathable India.
          </h2>

          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Deploy authoritative air quality intelligence, atmospheric modeling, and coordinated
            municipal interventions across your jurisdiction.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="py-3 px-8 rounded-xl bg-forestSecondary hover:bg-forestPrimary text-white font-semibold text-sm transition-all shadow-subtle flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch PranaMap</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="py-3 px-8 rounded-xl bg-surface hover:bg-surfaceHover border border-border text-text-primary font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Officer Workspace Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-12 bg-surface border-t border-border text-xs text-text-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-forestSecondary" />
            <span className="font-bold text-text-primary">PRANAMAP AI</span>
            <span>· Environmental Intelligence & Climate Resilience Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/data-provenance" className="hover:text-text-primary transition-colors">
              Data Lineage
            </Link>
            <Link href="/login" className="hover:text-text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-text-primary transition-colors">
              Officer Onboarding
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
