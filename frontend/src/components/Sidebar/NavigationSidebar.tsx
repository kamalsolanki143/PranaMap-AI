import React from 'react';
import { LayoutDashboard, Map, Activity, Bell, Settings, Layers, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function NavigationSidebar() {
  return (
    <aside className="w-64 h-full bg-surface border-r border-border flex flex-col shrink-0">
      {/* Brand / Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-cyan flex items-center justify-center shadow-glow">
            <Activity className="w-5 h-5 text-surface font-bold" />
          </div>
          <span className="font-bold tracking-wider text-lg text-text-primary">PranaMap<span className="text-accent-cyan">AI</span></span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        <div className="space-y-2">
          <p className="px-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Intelligence</p>
          <NavItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Command Center" />
          <NavItem href="/forecast" icon={<Activity size={18} />} label="Forecasting" />
          <NavItem href="/attribution" icon={<Map size={18} />} label="Attribution" />
          <NavItem href="/enforcement" icon={<Bell size={18} />} label="Enforcement" />
          <NavItem href="/advisory" icon={<Search size={18} />} label="Advisories" />
        </div>

        {/* Quick Filters / Wards */}
        <div className="space-y-3">
          <p className="px-2 text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>Ward Filters</span>
            <Search size={14} className="text-text-muted hover:text-text-primary cursor-pointer transition-colors" />
          </p>
          <div className="flex flex-col gap-1 px-2">
            <div className="flex items-center gap-2 py-1.5 text-sm text-text-secondary hover:text-text-primary cursor-pointer transition-colors group">
              <div className="w-2 h-2 rounded-full bg-aqi-veryUnhealthy group-hover:shadow-[0_0_8px_rgba(190,18,60,0.6)] transition-shadow"></div>
              <span>Ward A (South)</span>
            </div>
            <div className="flex items-center gap-2 py-1.5 text-sm text-text-secondary hover:text-text-primary cursor-pointer transition-colors group">
              <div className="w-2 h-2 rounded-full bg-aqi-unhealthy group-hover:shadow-[0_0_8px_rgba(239,68,68,0.6)] transition-shadow"></div>
              <span>Ward C (Central)</span>
            </div>
            <div className="flex items-center gap-2 py-1.5 text-sm text-text-secondary hover:text-text-primary cursor-pointer transition-colors group">
              <div className="w-2 h-2 rounded-full bg-aqi-moderate group-hover:shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-shadow"></div>
              <span>Ward D (West)</span>
            </div>
          </div>
        </div>

        {/* Compact Layer Control (Placeholder) */}
        <div className="space-y-3">
          <p className="px-2 text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>Active Layers</span>
            <Filter size={14} className="text-text-muted" />
          </p>
          <div className="px-2 space-y-2">
            <LayerToggle label="AQI Heatmap" active />
            <LayerToggle label="Industrial Zones" active />
            <LayerToggle label="Traffic Density" />
          </div>
        </div>
      </nav>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-border">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surfaceHover rounded-md transition-colors">
          <Settings size={18} />
          <span>System Settings</span>
        </Link>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${active ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20' : 'text-text-secondary hover:bg-surfaceHover hover:text-text-primary'}`}>
      {icon}
      <span className="font-medium text-sm">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-glow" />}
    </Link>
  );
}

function LayerToggle({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm group cursor-pointer">
      <span className={`${active ? 'text-text-primary' : 'text-text-secondary'} group-hover:text-text-primary transition-colors`}>{label}</span>
      <div className={`w-7 h-4 rounded-full flex items-center p-0.5 transition-colors ${active ? 'bg-accent-cyan' : 'bg-border'}`}>
        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${active ? 'translate-x-3' : 'translate-x-0'}`} />
      </div>
    </div>
  );
}
