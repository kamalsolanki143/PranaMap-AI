'use client';
import React from 'react';

/**
 * MapPlaceholder — shown while the actual map component loads.
 * Uses a stylized loading state matching the dark command-center theme.
 */
export default function MapPlaceholder() {
  return (
    <div className="w-full h-full bg-surface border border-border rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Pulsing center indicator */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-2xl text-accent-cyan">map</span>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-text-primary">Loading Geospatial Data</p>
          <p className="text-xs text-text-muted mt-1">Initializing map tiles and ward overlays...</p>
        </div>
      </div>

      {/* Simulated heatmap blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-aqi-veryUnhealthy/10 blur-xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full bg-aqi-sensitive/10 blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
    </div>
  );
}
