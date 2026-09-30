'use client';
import React from 'react';
import Header from '@/components/Navbar/Header';
import StatusBadge from '@/components/Common/StatusBadge';
import { DataSourceItem } from '@/types';
import {
  Database,
  ExternalLink,
  ShieldCheck,
  Radio,
  Satellite,
  CloudSun,
  Cpu,
  Server,
  Info,
  Map,
} from 'lucide-react';

const DATA_SOURCES: DataSourceItem[] = [
  {
    id: 'open-meteo-weather',
    name: 'Open-Meteo Synoptic Meteorological NWP',
    provider: 'European Centre for Medium-Range Weather Forecasts (ECMWF) & GFS',
    type: 'Meteorology',
    last_updated: 'Real-time Runtime API Query',
    status: 'LIVE',
    coverage: 'Pan-India coverage at 0.1° (~11 km) spatial grid resolution',
    update_frequency: 'Queried on demand per location',
    documentation_url: 'https://open-meteo.com/en/docs',
    description: 'Live surface temperature, relative humidity, 10m wind velocity and direction, surface pressure, and precipitation probability for any Indian coordinate.',
  },
  {
    id: 'open-meteo-cams',
    name: 'Copernicus CAMS & Open-Meteo Air Quality',
    provider: 'Copernicus Atmosphere Monitoring Service (CAMS) / ECMWF',
    type: 'Ground Sensor',
    last_updated: 'Real-time Runtime API Query',
    status: 'LIVE',
    coverage: 'Global & Indian subcontinent 0.1° atmospheric grid',
    update_frequency: 'Queried on demand per location',
    documentation_url: 'https://open-meteo.com/en/docs/air-quality-api',
    description: 'Live atmospheric chemical assimilation providing PM2.5, PM10, nitrogen dioxide (NO2), sulphur dioxide (SO2), ozone (O3), Saharan/Thar dust concentration, and 550nm Aerosol Optical Depth.',
  },
  {
    id: 'cpcb-caaqms',
    name: 'CPCB CAAQMS Ground Monitoring Network',
    provider: 'Central Pollution Control Board (Govt. of India) & State PCBs',
    type: 'Ground Sensor',
    last_updated: 'Verified Benchmark Reference',
    status: 'CACHED',
    coverage: '27 verified physical CAAQMS stations across Rajasthan, Delhi, Maharashtra, Gujarat, Karnataka, Tamil Nadu, UP, etc.',
    update_frequency: 'Station registry baseline',
    documentation_url: 'https://cpcb.nic.in',
    description: 'Physical monitoring station registry with verified geographic coordinates, station operators (RSPCB, DPCC, MPCB, GPCB, etc.), and reference pollutant baselines. Unmonitored towns calculate transparent Haversine distance to nearest verified monitor.',
  },
  {
    id: 'sentinel-5p',
    name: 'Copernicus Sentinel-5P TROPOMI & CAMS Assimilation',
    provider: 'European Space Agency (ESA) Copernicus Programme',
    type: 'Satellite',
    last_updated: 'NRT Daily Satellite Assimilation',
    status: 'MODELLED',
    coverage: 'Indian subcontinent sun-synchronous orbit (3.5 × 5.5 km native resolution)',
    update_frequency: 'Daily satellite overpass + hourly CAMS model run',
    documentation_url: 'https://sentinels.copernicus.eu',
    description: 'Tropospheric aerosol optical depth, carbon monoxide total column, and nitrogen dioxide vertical column density. Rendered through calibrated raster and spatial contour surfaces.',
  },
  {
    id: 'esri-imagery',
    name: 'Esri World Imagery (True-Color Optical Satellite)',
    provider: 'Esri, Maxar, Earthstar Geographics, USGS, IGN',
    type: 'Satellite',
    last_updated: 'Live Tile Server Delivery',
    status: 'LIVE',
    coverage: 'Pan-India and global high-resolution optical imagery (0.5m – 15m resolution)',
    update_frequency: 'Cached optical basemap tiles',
    documentation_url: 'https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9',
    description: 'Authentic orbital satellite imagery showing real topography, vegetation, rivers, urban expansion, and road networks under environmental overlays.',
  },
  {
    id: 'google-gemini',
    name: 'Google Gemini (Environmental Narrative Synthesis)',
    provider: 'Google Cloud Vertex AI & Google AI Studio',
    type: 'AI / GenAI',
    last_updated: 'On-Demand Generative Reasoning',
    status: 'MODELLED',
    coverage: 'Multilingual environmental synthesis in English, Hindi, and Marathi',
    update_frequency: 'Active when GEMINI_API_KEY is configured (fallback to calibrated templates)',
    documentation_url: 'https://ai.google.dev',
    description: 'Generates citizen health advisories and municipal executive briefings from validated numeric telemetry. Gemini does NOT generate factual sensor numbers; it interprets verified telemetry.',
  },
  {
    id: 'cloud-firestore',
    name: 'Application Persistence & Firestore Cache',
    provider: 'Google Cloud Firestore / In-Memory Local Cache',
    type: 'Cloud Database',
    last_updated: 'Continuous Local Synchronization',
    status: 'CACHED',
    coverage: 'High-availability telemetry cache with zero-downtime offline resiliency',
    update_frequency: 'Dual-mode: in-memory local cache active, Cloud Firestore on ADC configuration',
    documentation_url: 'https://cloud.google.com/firestore',
    description: 'Dual-mode cache engine: operates as in-memory state store locally for sub-10ms response times, and seamlessly connects to Google Cloud Firestore when GCP credentials are provided.',
  },
];

export default function DataSourcesPage() {
  const getTypeIcon = (type: DataSourceItem['type']) => {
    switch (type) {
      case 'Ground Sensor': return Radio;
      case 'Satellite': return Satellite;
      case 'Meteorology': return CloudSun;
      case 'AI / GenAI': return Cpu;
      case 'Cloud Database': return Server;
      default: return Database;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background text-text-primary">
      <Header />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider font-mono">
                Data Reality Audit & Provenance
              </span>
              <span className="text-border">•</span>
              <span className="text-[11px] text-brand-forest font-medium">Transparency Framework</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight mt-0.5">
              Data Feeds & Telemetric Source Registry
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Complete inventory of environmental, meteorological, and satellite pipelines powering PranaMap AI.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="px-3 py-1 rounded-full bg-brand-forest/10 border border-brand-forest/20 text-xs font-semibold text-brand-forest flex items-center gap-1.5 font-mono">
              <ShieldCheck size={14} />
              <span>Zero-Fabrication Policy Enforced</span>
            </span>
          </div>
        </div>

        {/* Audit Disclosure Banner */}
        <div className="p-4 rounded-xl border border-border/80 bg-surface shadow-xs space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-text-primary">
            <Info size={14} className="text-brand-forest" />
            <span>DATA INTEGRITY & STATUS DEFINITIONS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-200">
              <span className="font-bold text-emerald-800 block">LIVE</span>
              <span className="text-[11px] text-emerald-700">Real-time runtime API response verified during active session.</span>
            </div>
            <div className="p-2.5 rounded bg-amber-50/60 border border-amber-200">
              <span className="font-bold text-amber-800 block">CACHED</span>
              <span className="text-[11px] text-amber-700">Verified benchmark or historical sensor baseline preserved in storage.</span>
            </div>
            <div className="p-2.5 rounded bg-purple-50/60 border border-purple-200">
              <span className="font-bold text-purple-800 block">MODELLED</span>
              <span className="text-[11px] text-purple-700">Physical dispersion calculation or diurnal regression model output.</span>
            </div>
            <div className="p-2.5 rounded bg-sky-50/60 border border-sky-200">
              <span className="font-bold text-sky-800 block">SIMULATION</span>
              <span className="text-[11px] text-sky-700">Counterfactual scenario evaluation for municipal policy testing.</span>
            </div>
          </div>
        </div>

        {/* Source Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DATA_SOURCES.map((source) => {
            const Icon = getTypeIcon(source.type);
            return (
              <div
                key={source.id}
                className="panel p-5 space-y-3.5 border border-border shadow-xs hover:border-brand-forest/40 transition-all bg-surface"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-surfaceHover border border-border text-brand-forest">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-primary tracking-tight">
                        {source.name}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">{source.provider}</p>
                    </div>
                  </div>
                  <StatusBadge status={source.status} />
                </div>

                {/* Description */}
                <p className="text-xs text-text-secondary leading-relaxed">
                  {source.description}
                </p>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-border">
                  <div className="p-2 rounded bg-surfaceHover border border-border/60">
                    <span className="text-[10px] text-text-muted uppercase block">Coverage</span>
                    <span className="text-[11px] text-text-primary line-clamp-1">{source.coverage}</span>
                  </div>
                  <div className="p-2 rounded bg-surfaceHover border border-border/60">
                    <span className="text-[10px] text-text-muted uppercase block">Cadence / Refresh</span>
                    <span className="text-[11px] text-text-primary">{source.update_frequency}</span>
                  </div>
                  <div className="p-2 rounded bg-surfaceHover border border-border/60">
                    <span className="text-[10px] text-text-muted uppercase block">Last Verification</span>
                    <span className="text-[11px] text-text-primary">{source.last_updated}</span>
                  </div>
                  <div className="p-2 rounded bg-surfaceHover border border-border/60">
                    <span className="text-[10px] text-text-muted uppercase block">Truth Level</span>
                    <span className="text-[11px] font-semibold text-brand-forest">{source.status}</span>
                  </div>
                </div>

                {/* External link */}
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-text-muted">Type: {source.type}</span>
                  <a
                    href={source.documentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-brand-forest hover:underline flex items-center gap-1"
                  >
                    <span>Official Portal</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
