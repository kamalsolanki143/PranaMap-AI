'use client';
import React, { useState } from 'react';
import Header from '@/components/Navbar/Header';
import { useApiData } from '@/hooks/useApiData';
import { fetchEnforcement, deployEnforcementAction } from '@/services/api';
import { useToast } from '@/components/Common/Toast';
import { useTranslation } from '@/i18n/LanguageContext';
import { Shield, TrendingDown, Send } from 'lucide-react';

export default function EnforcementPage() {
  const { data, loading, refetch } = useApiData(fetchEnforcement);
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [dispatching, setDispatching] = useState<string | null>(null);

  async function handleDeployAction(targetId: string, ward: string, actionLabel: string, department: string) {
    setDispatching(targetId);
    try {
      const res = await deployEnforcementAction(targetId, ward, actionLabel, department);
      showToast(res.message, 'success');
    } catch {
      showToast(`Action dispatched for ${ward}`, 'info');
    } finally {
      setDispatching(null);
    }
  }

  if (loading || !data) {
    return (
      <div className="flex flex-col h-full w-full">
        <Header />
        <div className="flex-1 p-4 sm:p-6 space-y-6 animate-pulse">
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
    <div className="flex flex-col h-full w-full bg-background text-text-primary">
      <Header onRefresh={refetch} />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">{t('enforcement.title', 'Enforcement Planner')}</h1>
            <p className="text-text-secondary text-xs sm:text-sm mt-1">{t('enforcement.subtitle', 'Priority-ranked actionable interventions')}</p>
          </div>
          <div className="flex gap-3 sm:gap-4 flex-wrap">
            <div className="glass-panel px-3 sm:px-4 py-2 text-xs sm:text-sm flex items-center gap-2">
              <Shield size={16} className="text-accent-cyan shrink-0" />
              <span className="text-text-primary font-semibold">{data.active_missions} {t('enforcement.activeMissions', 'Active Missions')}</span>
            </div>
            <div className="glass-panel px-3 sm:px-4 py-2 text-xs sm:text-sm flex items-center gap-2">
              <TrendingDown size={16} className="text-aqi-good shrink-0" />
              <span className="text-aqi-good font-semibold">{data.projected_impact_pct}% {t('enforcement.projectedImpact', 'Projected Impact')}</span>
            </div>
          </div>
        </div>

        {/* Enforcement Table */}
        <div className="panel">
          <div className="panel-header">
            <span>{t('enforcement.pipeline', 'Intervention Pipeline')} — {data.critical_zones} {t('enforcement.criticalZones', 'Critical Zones')}</span>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wider" style={{ backgroundColor: 'rgb(var(--surface-hover) / 0.5)' }}>
                  <th className="p-3 sm:p-4">{t('enforcement.col.priority', 'Priority')}</th>
                  <th className="p-3 sm:p-4">{t('enforcement.col.ward', 'Ward')}</th>
                  <th className="p-3 sm:p-4">{t('enforcement.col.aqi', 'Current AQI')}</th>
                  <th className="p-3 sm:p-4">{t('enforcement.col.source', 'Source')}</th>
                  <th className="p-3 sm:p-4">{t('enforcement.col.projected', 'Projected')}</th>
                  <th className="p-3 sm:p-4">{t('enforcement.col.lead', 'Lead Officer')}</th>
                  <th className="p-3 sm:p-4 text-right">{t('enforcement.col.action', 'Action Dispatch')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.wards.map(ward => {
                  const firstAction = ward.actions && ward.actions.length > 0 ? ward.actions[0].label : 'Deploy Team';
                  return (
                    <tr key={ward.id} className="transition-colors text-xs sm:text-sm" style={{ cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover) / 0.3)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                      <td className="p-3 sm:p-4">
                        <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold border uppercase tracking-wide ${priorityColor[ward.priority] || ''}`}>
                          {ward.priority}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <p className="font-medium text-text-primary">{ward.ward}</p>
                        <p className="text-[11px] text-text-muted">{ward.uid}</p>
                      </td>
                      <td className="p-3 sm:p-4 font-bold tabular-nums text-aqi-unhealthy">{ward.current_aqi}</td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-text-muted">{ward.primary_source_icon}</span>
                          <span className="text-text-secondary">{ward.primary_source}</span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 font-bold tabular-nums text-accent-cyan">{ward.projected_aqi}</td>
                      <td className="p-3 sm:p-4 text-text-secondary">{ward.lead}</td>
                      <td className="p-3 sm:p-4 text-right">
                        <button
                          onClick={() => handleDeployAction(ward.id, ward.ward, firstAction, ward.department)}
                          disabled={dispatching === ward.id}
                          className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/30 text-accent-cyan rounded-md text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                        >
                          <Send size={12} />
                          {dispatching === ward.id ? 'Dispatching...' : firstAction}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


