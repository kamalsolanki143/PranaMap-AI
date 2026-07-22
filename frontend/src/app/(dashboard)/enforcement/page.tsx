'use client';
import React from 'react';
import Header from '@/components/Navbar/Header';
import { useApiData } from '@/hooks/useApiData';
import { fetchEnforcement } from '@/services/api';
import { Shield, TrendingDown } from 'lucide-react';

export default function EnforcementPage() {
  const { data, loading } = useApiData(fetchEnforcement);

  if (loading || !data) {
    return (
      <div className="flex flex-col h-full w-full">
        <Header />
        <div className="flex-1 p-6 space-y-6 animate-pulse">
          <div className="h-10 w-64 bg-surface rounded" />
          <div className="h-[500px] bg-surface rounded-xl" />
        </div>
      </div>
    );
  }

  const priorityColor: Record<string, string> = {
    CRITICAL: 'bg-aqi-hazardous/10 text-aqi-hazardous border-aqi-hazardous/20',
    HIGH: 'bg-aqi-veryUnhealthy/10 text-aqi-veryUnhealthy border-aqi-veryUnhealthy/20',
    MEDIUM: 'bg-aqi-sensitive/10 text-aqi-sensitive border-aqi-sensitive/20',
    LOW: 'bg-aqi-good/10 text-aqi-good border-aqi-good/20',
  };

  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Enforcement Planner</h1>
            <p className="text-text-secondary text-sm mt-1">Priority-ranked actionable interventions</p>
          </div>
          <div className="flex gap-4">
            <div className="glass-panel px-4 py-2 text-sm flex items-center gap-2">
              <Shield size={16} className="text-accent-cyan" />
              <span className="text-text-primary font-semibold">{data.active_missions} Active Missions</span>
            </div>
            <div className="glass-panel px-4 py-2 text-sm flex items-center gap-2">
              <TrendingDown size={16} className="text-aqi-good" />
              <span className="text-aqi-good font-semibold">{data.projected_impact_pct}% Projected</span>
            </div>
          </div>
        </div>

        {/* Enforcement Table */}
        <div className="panel">
          <div className="panel-header">
            <span>Intervention Pipeline — {data.critical_zones} Critical Zones</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-surfaceHover/50 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  <th className="p-4">Priority</th>
                  <th className="p-4">Ward</th>
                  <th className="p-4">Current AQI</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Projected</th>
                  <th className="p-4">Lead</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.wards.map(ward => (
                  <tr key={ward.id} className="hover:bg-surfaceHover/30 transition-colors">
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wide ${priorityColor[ward.priority] || ''}`}>
                        {ward.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-text-primary">{ward.ward}</p>
                      <p className="text-xs text-text-muted">{ward.uid}</p>
                    </td>
                    <td className="p-4 font-bold tabular-nums text-aqi-unhealthy">{ward.current_aqi}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-text-muted">{ward.primary_source_icon}</span>
                        <span className="text-sm text-text-secondary">{ward.primary_source}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold tabular-nums text-accent-cyan">{ward.projected_aqi}</td>
                    <td className="p-4 text-sm text-text-secondary">{ward.lead}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
