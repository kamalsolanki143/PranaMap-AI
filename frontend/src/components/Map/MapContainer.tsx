'use client';
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import BaseMap to avoid SSR issues with maplibre-gl window reference
const DynamicMap = dynamic(() => import('./BaseMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-border border-t-accent-cyan rounded-full animate-spin" />
        <p className="text-text-secondary text-sm animate-pulse">Loading Geospatial Intelligence...</p>
      </div>
    </div>
  ),
});

export default function MapContainer() {
  return (
    <div className="w-full h-full relative isolate">
      <DynamicMap />
      
      {/* Floating Legend */}
      <div className="absolute bottom-6 right-16 glass-panel p-4 z-30 min-w-[200px] pointer-events-none">
        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">AQI Legend (PM2.5)</h4>
        <div className="space-y-2">
          <LegendRow label="Good" range="0-50" color="bg-aqi-good" />
          <LegendRow label="Moderate" range="51-100" color="bg-aqi-moderate" />
          <LegendRow label="Sensitive" range="101-150" color="bg-aqi-sensitive" />
          <LegendRow label="Unhealthy" range="151-200" color="bg-aqi-unhealthy" />
          <LegendRow label="Very Unhealthy" range="201-300" color="bg-aqi-veryUnhealthy" />
          <LegendRow label="Hazardous" range="300+" color="bg-aqi-hazardous" />
        </div>
      </div>
    </div>
  );
}

function LegendRow({ label, range, color }: { label: string; range: string; color: string }) {
  return (
    <div className="flex items-center justify-between text-xs font-medium">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${color}`}></span>
        <span className="text-text-primary">{label}</span>
      </div>
      <span className="text-text-muted tabular-nums">{range}</span>
    </div>
  );
}
