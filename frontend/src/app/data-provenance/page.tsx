'use client';

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  ShieldCheck,
  Radio,
  Clock,
  Eye,
  Sliders,
  Play,
  ArrowRight,
  Database,
  ArrowDown,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export default function DataProvenancePage() {
  const truthTiers = [
    {
      tier: 'LIVE',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: Radio,
      summary: 'Direct runtime API response received within the current session cycle.',
      details: 'Real-time telemetry retrieved via HTTPS from Open-Meteo Synoptic Weather or Copernicus CAMS services with zero synthetic interpolation.',
      evidence: 'Open-Meteo REST endpoint response with valid HTTP 200 and ISO timestamp.',
    },
    {
      tier: 'CACHED',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Clock,
      summary: 'Verified historical snapshot retrieved from Firestore or deterministic baseline fallback.',
      details: 'Authoritative data saved from previous successful live fetches, deployed gracefully when external endpoints experience rate-limits or network timeouts.',
      evidence: 'Google Cloud Firestore document snapshot timestamped within the last 24 hours.',
    },
    {
      tier: 'OBSERVED',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: Eye,
      summary: 'Physical in-situ sensor measurement from a certified CPCB CAAQMS monitoring station.',
      details: 'Direct chemical analyzer reading (Beta Attenuation Monitor for PM2.5, UV Fluorescence for SO2, Chemiluminescence for NO2) located at certified station coordinates.',
      evidence: 'CPCB CAAQMS Continuous Ambient Air Quality Monitoring Station identifier and exact coordinates.',
    },
    {
      tier: 'MODELLED',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: Sliders,
      summary: 'Mathematical or atmospheric physics estimation based on verified input vectors.',
      details: 'Derived value utilizing spatial distance-decay to the nearest verified station, coupled with synoptic wind vectors and planetary boundary layer height.',
      evidence: 'Inverse distance weighting (IDW) formula with explicitly disclosed input parameters and distance (e.g. Raniwara 64.2 km to Abu Road).',
    },
    {
      tier: 'SIMULATION',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: Play,
      summary: 'Hypothetical forward-looking scenario calculation illustrating potential intervention outcomes.',
      details: 'Mathematical projection estimating air quality improvements if specific municipal policy actions (e.g., commercial freight diversion) are enforced.',
      evidence: 'Simulation assumption parameters: baseline AQI, reduction percentage, and meteorological stability factor.',
    },
  ];

  const pipelineStages = [
    {
      step: '01',
      name: 'Source Ingestion',
      provider: 'CPCB, Open-Meteo, Copernicus CAMS',
      description: 'Raw particulate metrics, meteorological vectors (wind, temp, humidity, pressure), and atmospheric column data ingested over secure REST endpoints.',
    },
    {
      step: '02',
      name: 'Verification & Quality Filter',
      provider: 'PranaMap Ingestion Pipeline',
      description: 'Physical plausibility boundary checks (e.g., PM2.5 in [0, 999] ug/m3). Network dropouts gracefully route to cached Firestore document snapshots.',
    },
    {
      step: '03',
      name: 'Sub-Index & NAQI Interpolation',
      provider: 'Official CPCB NAQI Standard Formula',
      description: 'Linear interpolation across Indian National Air Quality Index breakpoints for all 6 criteria pollutants (PM2.5, PM10, NO2, SO2, CO, O3).',
    },
    {
      step: '04',
      name: 'Physical Atmospheric Coupling',
      provider: 'PranaMap Atmospheric Reasoner',
      description: 'Boundary layer ventilation index calculated from mixing height and synoptic wind velocity to evaluate dispersion and nocturnal inversion risks.',
    },
    {
      step: '05',
      name: 'Provenance Tagging & Delivery',
      provider: 'PranaMap Trust Registry',
      description: 'Every displayed metric is explicitly tagged with its exact Truth Tier (LIVE, CACHED, OBSERVED, MODELLED, or SIMULATION) and transmitted to users.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* Navigation Bar */}
      <header className="h-16 px-6 lg:px-12 flex items-center justify-between border-b border-border bg-surface sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-forestSecondary/10 border border-forestSecondary/20 flex items-center justify-center text-forestSecondary">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-text-primary">
              PRANAMAP AI
            </span>
            <span className="hidden sm:inline-block ml-2 text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-surfaceAlt border border-border text-text-secondary">
              Data Lineage & Truth Registry
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-md hover:bg-surfaceHover"
          >
            Observatory
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-white bg-forestSecondary hover:bg-forestPrimary px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-subtle"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs text-forestSecondary font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Scientific Transparency & Provenance Framework</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight">
          Every number has a source.
        </h1>

        <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          In climate and air-quality intelligence, trust is paramount. PranaMap AI explicitly
          classifies every observation, estimate, and forecast into five distinct truth tiers.
        </p>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 space-y-12">
        
        {/* Section 1: The 5 Truth Tiers */}
        <section className="space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-xl font-bold text-text-primary">
              The Five Data Truth Tiers
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Standards-based categorization to prevent modelled projections from being mistaken for physical ground truth.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {truthTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.tier}
                  className="bg-surface border border-border rounded-xl p-5 shadow-subtle space-y-2 hover:border-forestSecondary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${tier.badgeClass}`}>
                        {tier.tier}
                      </span>
                      <span className="text-xs font-semibold text-text-primary">
                        {tier.summary}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed pt-1">
                    {tier.details}
                  </p>

                  <div className="pt-2 border-t border-border flex items-center gap-2 text-[11px] text-text-muted">
                    <span className="font-semibold text-text-secondary">Verification standard:</span>
                    <span>{tier.evidence}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: Complete Data Lineage Pipeline */}
        <section className="space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-xl font-bold text-text-primary">
              End-to-End Lineage: From Sensor to Decision
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              How raw chemical and meteorological data travels through the PranaMap analytical engine.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-subtle space-y-6">
            <div className="space-y-4">
              {pipelineStages.map((stage, idx) => (
                <div key={stage.step} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-forestSecondary/10 border border-forestSecondary/20 text-forestSecondary font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {stage.step}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text-primary">{stage.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surfaceAlt text-text-muted border border-border">
                        {stage.provider}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Spatial Truth Case Study: Raniwara vs Anand Vihar */}
        <section className="space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-xl font-bold text-text-primary">
              Spatial Resolution Case Study
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Demonstrating the difference between direct observations and nearest verified stations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Anand Vihar */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-text-primary">Anand Vihar, Delhi</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200">
                  OBSERVED
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Direct in-situ monitoring station located on-site at coordinates [77.3153°E, 28.6469°N].
                Continuous CAAQMS BAM equipment reports particulate concentrations directly.
              </p>
              <div className="text-[11px] font-mono text-text-muted pt-2 border-t border-border">
                Distance to Station: 0.0 km (Direct Observation)
              </div>
            </div>

            {/* Raniwara */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-text-primary">Raniwara, Rajasthan</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                  MODELLED
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                No active CPCB station exists inside Raniwara town [72.2215°E, 24.7547°N].
                The platform transparently resolves the nearest verified station (Abu Road RIICO Area, 64.2 km)
                and modulates the index using Open-Meteo wind vectors and boundary layer height.
              </p>
              <div className="text-[11px] font-mono text-text-muted pt-2 border-t border-border">
                Distance to Nearest Station: 64.2 km (Nearest Verified Baseline)
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-border bg-surface text-center text-xs text-text-muted mt-auto">
        <span>PranaMap AI · Environmental Intelligence & Climate Resilience Platform · CPCB NAQI Standards</span>
      </footer>
    </div>
  );
}
