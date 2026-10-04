'use client';
import React from 'react';
import { DataStatus } from '@/types';
import { useTranslation } from '@/i18n/LanguageContext';

interface StatusBadgeProps {
  status: DataStatus;
  lastUpdated?: string;
  className?: string;
}

export default function StatusBadge({ status, lastUpdated, className = '' }: StatusBadgeProps) {
  const { t } = useTranslation();

  const config = {
    LIVE: {
      label: t('status.live', 'LIVE'),
      dot: 'bg-emerald-600',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      description: 'Connected to real-time runtime API & telemetric feed',
    },
    CACHED: {
      label: t('status.cached', 'CACHED'),
      dot: 'bg-amber-600',
      badge: 'bg-amber-50 text-amber-800 border-amber-300',
      description: 'Serving verified cached / benchmark reference telemetry',
    },
    MODELLED: {
      label: t('status.modelled', 'MODELLED'),
      dot: 'bg-purple-600',
      badge: 'bg-purple-50 text-purple-800 border-purple-300',
      description: 'Generated via physical / statistical boundary-layer model',
    },
    SIMULATION: {
      label: t('status.simulation', 'SIMULATION'),
      dot: 'bg-sky-600',
      badge: 'bg-sky-50 text-sky-800 border-sky-300',
      description: 'Scenario simulation & policy intervention impact',
    },
    DEMO: {
      label: t('status.mock', 'DEMO'),
      dot: 'bg-stone-500',
      badge: 'bg-stone-100 text-stone-800 border-stone-300',
      description: 'Demo dataset for testing',
    },
    UNAVAILABLE: {
      label: t('common.error', 'UNAVAILABLE'),
      dot: 'bg-rose-600',
      badge: 'bg-rose-50 text-rose-800 border-rose-300',
      description: 'Source currently unavailable in this runtime environment',
    },
  }[status] || {
    label: status,
    dot: 'bg-stone-400',
    badge: 'bg-stone-100 text-stone-800 border-stone-300',
    description: '',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium tracking-wide ${config.badge} ${className}`} title={config.description}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${status === 'LIVE' ? 'animate-pulse' : ''}`} />
      <span className="font-semibold uppercase tracking-wider">{config.label}</span>
      {lastUpdated && (
        <span className="text-[11px] opacity-75 font-normal ml-1">({lastUpdated})</span>
      )}
    </div>
  );
}
