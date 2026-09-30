'use client';
import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';

export type RiskLevel = 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' | 'Critical' | 'High' | 'Low';

interface RiskBadgeProps {
  level?: RiskLevel | string;
  aqi?: number;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function getLevelFromAqi(aqi: number): RiskLevel {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export default function RiskBadge({ level, aqi, className = '', showIcon = true, size = 'md' }: RiskBadgeProps) {
  const resolvedLevel = level || (aqi !== undefined ? getLevelFromAqi(aqi) : 'Moderate');
  const normalized = resolvedLevel.toLowerCase();

  let styles = 'bg-stone-100 text-stone-800 border-stone-300';
  let Icon = Info;
  const text = resolvedLevel;

  if (normalized.includes('good')) {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    Icon = CheckCircle;
  } else if (normalized.includes('satisfactory')) {
    styles = 'bg-lime-50 text-lime-900 border-lime-300';
    Icon = CheckCircle;
  } else if (normalized.includes('moderate')) {
    styles = 'bg-amber-50 text-amber-900 border-amber-300';
    Icon = Info;
  } else if (normalized.includes('poor') && !normalized.includes('very')) {
    styles = 'bg-orange-50 text-orange-950 border-orange-300';
    Icon = AlertTriangle;
  } else if (normalized.includes('very poor') || normalized.includes('high')) {
    styles = 'bg-rose-50 text-rose-800 border-rose-300 font-semibold';
    Icon = AlertCircle;
  } else if (normalized.includes('severe') || normalized.includes('critical') || normalized.includes('hazardous')) {
    styles = 'bg-red-100 text-red-900 border-red-300 font-bold';
    Icon = ShieldAlert;
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm font-semibold',
  }[size];

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${sizeStyles} ${styles} ${className}`}
      role="status"
      aria-label={`Risk level: ${text}${aqi !== undefined ? `, AQI ${aqi}` : ''}`}
    >
      {showIcon && <Icon size={iconSizes} className="shrink-0" aria-hidden="true" />}
      <span>{text}</span>
      {aqi !== undefined && <span className="tabular-nums font-semibold ml-0.5">• {aqi}</span>}
    </span>
  );
}
