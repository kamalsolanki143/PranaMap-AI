'use client';
import React from 'react';
import { MapPin, RefreshCw, Wind, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/Common/Toast';

export default function Header() {
  const { showToast } = useToast();

  function handleRefresh() {
    showToast('Data refreshed from latest sensors', 'info');
    // Trigger a page-level refetch by reloading
    window.location.reload();
  }

  return (
    <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 shrink-0 z-10 relative">
      {/* Location Context */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-text-primary bg-surfaceHover px-3 py-1.5 rounded-md border border-border">
          <MapPin size={16} className="text-accent-cyan" />
          <span className="font-semibold text-sm hidden sm:inline">Delhi NCR Region</span>
          <span className="font-semibold text-sm sm:hidden">Delhi</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary text-sm hidden lg:flex">
          <Wind size={16} />
          <span>NW 12 km/h</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-2 text-sm bg-aqi-veryUnhealthy/10 border border-aqi-veryUnhealthy/30 px-3 py-1.5 rounded-md text-aqi-veryUnhealthy animate-pulse hidden sm:flex">
          <AlertTriangle size={16} />
          <span className="font-medium">2 Wards Critical</span>
        </div>

        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqi-good opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-aqi-good" />
            </span>
            <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold hidden md:inline">Live</span>
          </div>
          <button onClick={handleRefresh} className="text-text-muted hover:text-text-primary transition-colors p-1" aria-label="Refresh data">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
