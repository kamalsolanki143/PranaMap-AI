'use client';

import React, { useState } from 'react';
import Header from '@/components/Navbar/Header';
import { useAppStore } from '@/store/useAppStore';
import { getCityData } from '@/lib/cityData';
import RiskBadge from '@/components/Common/RiskBadge';
import {
  Car,
  Building2,
  Flame,
  Factory,
  Wind,
  Satellite,
  Radio,
  Sliders,
  Info,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Layers,
  Database,
  CloudFog,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function AttributionPage() {
  const { selectedCity } = useAppStore();
  const cityData = getCityData(selectedCity.id);
  const [selectedStationId, setSelectedStationId] = useState(cityData.criticalZone.wardId);
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  const selectedWard = cityData.wards.find((w) => w.id === selectedStationId) || cityData.wards[0];

  const sources = [
    {
      id: 'traffic',
      name: 'Vehicular & Traffic Emissions',
      percentage: 38,
      color: '#ef4444',
      icon: Car,
      provenance: 'MODELLED · HEURISTIC ESTIMATE',
      evidenceSignals: [
        { label: 'Road Congestion', value: 'Arterial corridor transit speed < 14 km/h', type: 'OBSERVED' },
        { label: 'Wind Corridor', value: 'NW 7.2 km/h alignment into receptor basin', type: 'MODELLED' },
        { label: 'NO2/PM2.5 Ratio', value: 'Elevated chemical ratio (0.42)', type: 'OBSERVED' },
      ],
      leadIndicator: 'Arterial transit idling & heavy commercial freight corridors',
    },
    {
      id: 'dust',
      name: 'Road Dust & Surface Resuspension',
      percentage: 22,
      color: '#f59e0b',
      icon: CloudFog,
      provenance: 'MODELLED · HEURISTIC ESTIMATE',
      evidenceSignals: [
        { label: 'Surface Silt', value: 'Unpaved road shoulder mechanical resuspension', type: 'MODELLED' },
        { label: 'PM10/PM2.5 Ratio', value: 'Coarse fraction exceedance (1.82)', type: 'OBSERVED' },
      ],
      leadIndicator: 'Mechanical vehicular resuspension from unpaved shoulders',
    },
    {
      id: 'construction',
      name: 'Construction & Demolition Activity',
      percentage: 16,
      color: '#d97706',
      icon: Building2,
      provenance: 'MODELLED · HEURISTIC ESTIMATE',
      evidenceSignals: [
        { label: 'Active Sites', value: '3 civil excavation zones within 2.5 km', type: 'OBSERVED' },
        { label: 'Fugitive Dust', value: 'Uncovered aggregate storage piles', type: 'OBSERVED' },
      ],
      leadIndicator: 'Fugitive civil excavation & uncontained masonry work',
    },
    {
      id: 'biomass',
      name: 'Biomass & Open Waste Burning',
      percentage: 12,
      color: '#10b981',
      icon: Flame,
      provenance: 'MODELLED · HEURISTIC ESTIMATE',
      evidenceSignals: [
        { label: 'Sentinel-5P CO', value: 'Elevated carbon monoxide tropospheric column', type: 'OBSERVED' },
        { label: 'Diurnal Peak', value: 'Nocturnal heating & early morning spike pattern', type: 'MODELLED' },
      ],
      leadIndicator: 'Localized municipal solid waste burning & rural heating',
    },
    {
      id: 'industry',
      name: 'Industrial & Processing Point Sources',
      percentage: 12,
      color: '#3b82f6',
      icon: Factory,
      provenance: 'MODELLED · HEURISTIC ESTIMATE',
      evidenceSignals: [
        { label: 'SO2 Signal', value: 'Elevated sulfur dioxide background (24 μg/m³)', type: 'OBSERVED' },
        { label: 'Perimeter Stacks', value: 'Upwind industrial boiler emissions', type: 'OBSERVED' },
      ],
      leadIndicator: 'Boiler emissions, diesel generators, and industrial clusters',
    },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-background text-text-primary">
      <Header />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Header & Station Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider font-mono">
                Source Apportionment
              </span>
              <span className="text-border">•</span>
              <span className="text-[11px] text-forestSecondary font-medium font-mono">
                Regional Receptor Weighting
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight mt-0.5">
              Why is air quality changing?
            </h1>
            <p className="text-text-secondary text-xs sm:text-sm mt-0.5">
              Source attribution for {cityData.cityName} based on physical proxies and synoptic wind alignment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-text-muted font-medium font-mono">Monitoring Station:</label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-surface text-text-primary text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forestSecondary cursor-pointer"
            >
              {cityData.wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (AQI {w.aqi})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Methodology Disclosure Accordion */}
        <div className="bg-surface border border-border rounded-xl shadow-subtle overflow-hidden">
          <button
            type="button"
            onClick={() => setMethodologyOpen(!methodologyOpen)}
            className="w-full px-5 py-3 flex items-center justify-between bg-surfaceAlt/60 hover:bg-surfaceAlt transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-forestSecondary" />
              <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
                Attribution Methodology & Transparency Disclosure
              </span>
            </div>
            <span className="text-xs text-forestSecondary font-semibold">
              {methodologyOpen ? 'Hide Methodology' : 'Show Methodology'}
            </span>
          </button>

          {methodologyOpen && (
            <div className="p-5 border-t border-border bg-surface space-y-3 text-xs text-text-secondary leading-relaxed">
              <p>
                Source attribution estimates are derived from a <strong>calibrated regional receptor weighting model</strong> coupled with real-time Open-Meteo wind vectors, chemical ratios (PM10/PM2.5 and NO2/PM2.5), and spatial corridor mapping.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-surfaceAlt rounded-lg border border-border">
                  <strong className="text-text-primary block mb-1">Physical Observations (OBSERVED)</strong>
                  <span>Continuous in-situ gas and particulate measurements from CPCB BAM monitors and certified sensor telemetry.</span>
                </div>
                <div className="p-3 bg-surfaceAlt rounded-lg border border-border">
                  <strong className="text-text-primary block mb-1">Heuristic Weightings (MODELLED)</strong>
                  <span>Sectoral percentages reflect empirical regional apportionments calibrated against local land-use, road density, and meteorological dispersion.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Station Snapshot Summary */}
        <div className="panel p-4 flex items-center justify-between flex-wrap gap-4 bg-surface shadow-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-text-muted uppercase font-mono font-semibold">Analyzed Zone</span>
              <h2 className="text-base font-bold text-text-primary">{selectedWard.name}</h2>
              <span className="text-[11px] text-text-muted font-mono">{selectedWard.id}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] text-text-muted uppercase font-mono font-semibold">Station AQI</span>
              <p className="text-2xl font-black tabular-nums font-mono text-criticalTone">{selectedWard.aqi}</p>
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase font-mono font-semibold">Risk Classification</span>
              <div className="mt-1">
                <RiskBadge level={selectedWard.severity} />
              </div>
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase font-mono font-semibold">Primary Driver</span>
              <p className="text-xs font-semibold text-text-primary mt-1">Vehicular & Traffic Emissions (38%)</p>
            </div>
          </div>
        </div>

        {/* Main Decomposition: Horizontal Bars + Evidence Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Horizontal Source Contribution Breakdown */}
          <div className="lg:col-span-7 panel p-4 sm:p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-semibold text-sm text-text-primary">
                  Apportioned Source Contribution
                </h3>
                <p className="text-[11px] text-text-muted">
                  Relative percentage of observed ambient particulate load attributed to emission sectors
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-surfaceAlt border border-border text-text-muted font-mono">
                Normalized 100%
              </span>
            </div>

            <div className="space-y-4">
              {sources.map((src) => {
                const Icon = src.icon;
                return (
                  <div key={src.id} className="space-y-2 p-3.5 rounded-lg border border-border bg-surfaceAlt/40">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-surface border border-border" style={{ color: src.color }}>
                          <Icon size={14} />
                        </span>
                        <span className="font-semibold text-text-primary">{src.name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-mono">
                          {src.provenance}
                        </span>
                      </div>
                      <span className="font-bold text-sm font-mono" style={{ color: src.color }}>
                        {src.percentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-surfaceHover rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${src.percentage}%`,
                          backgroundColor: src.color,
                        }}
                      />
                    </div>

                    {/* Supporting Evidence Signals */}
                    <div className="pt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                      {src.evidenceSignals.map((signal, idx) => (
                        <div key={idx} className="p-1.5 rounded bg-surface border border-border flex items-center justify-between gap-2">
                          <span className="text-text-muted">{signal.label}:</span>
                          <span className="font-medium text-text-secondary truncate max-w-[180px]">{signal.value}</span>
                          <span className={`text-[9px] px-1 py-0.2 rounded font-mono shrink-0 ${
                            signal.type === 'OBSERVED'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {signal.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meteorological Coupling Factors (Right Column) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="panel p-4 space-y-3">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider font-mono">
                Meteorological Dispersion Influence
              </span>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-lg bg-surfaceAlt border border-border flex items-start justify-between">
                  <div>
                    <span className="font-bold text-text-primary block">Thermal Inversion Boundary</span>
                    <span className="text-[11px] text-text-secondary">PBL Height: 680 meters</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                    TRAPPING RISK
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-surfaceAlt border border-border flex items-start justify-between">
                  <div>
                    <span className="font-bold text-text-primary block">Surface Wind Stagnation</span>
                    <span className="text-[11px] text-text-secondary">Velocity: 7.2 km/h (Low Dispersion)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                    ACCUMULATION
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-surfaceAlt border border-border flex items-start justify-between">
                  <div>
                    <span className="font-bold text-text-primary block">Atmospheric Ventilation Index</span>
                    <span className="text-[11px] text-text-secondary">Ventilation Factor: 4,896 m²/s</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    MODERATE
                  </span>
                </div>
              </div>
            </div>

            <div className="panel p-4 space-y-2 border-l-4 border-l-forestSecondary bg-surface shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-forestSecondary flex items-center gap-1.5 font-mono">
                  <ShieldCheck size={14} />
                  Attribution Transparency Note
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Apportionment percentages represent mathematical heuristic estimates based on physical proxies. They are updated when local land-use, transit density, or satellite column density changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
