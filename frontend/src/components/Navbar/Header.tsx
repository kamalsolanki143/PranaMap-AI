import React from 'react';
import { MapPin, RefreshCw, CloudRain, Wind, AlertTriangle } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 z-10 relative">
      {/* Location Context */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-text-primary bg-surfaceHover px-3 py-1.5 rounded-md border border-border">
          <MapPin size={16} className="text-accent-cyan" />
          <span className="font-semibold text-sm">Mumbai Metropolitan Region</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary text-sm hidden md:flex">
          <CloudRain size={16} />
          <span>28°C, Humidity 76%</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary text-sm hidden md:flex">
          <Wind size={16} />
          <span>NW 12 km/h</span>
        </div>
      </div>

      {/* Right side: Alerts & Status */}
      <div className="flex items-center gap-6">
        {/* Active Alert Summary */}
        <div className="flex items-center gap-2 text-sm bg-aqi-veryUnhealthy/10 border border-aqi-veryUnhealthy/30 px-3 py-1.5 rounded-md text-aqi-veryUnhealthy animate-pulse">
          <AlertTriangle size={16} />
          <span className="font-medium">2 Wards Critical</span>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-3 border-l border-border pl-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqi-good opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-aqi-good"></span>
            </span>
            <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Live System</span>
          </div>
          
          <button className="text-text-muted hover:text-text-primary transition-colors p-1" title="Force Sync">
            <RefreshCw size={16} />
          </button>
        </div>
        
        {/* Placeholder for Profile/Admin */}
        <div className="w-8 h-8 rounded-full bg-accent-cyan/20 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan font-bold text-xs">
          OP
        </div>
      </div>
    </header>
  );
}
