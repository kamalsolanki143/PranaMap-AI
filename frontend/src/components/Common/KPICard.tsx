import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: LucideIcon;
  severity?: 'good' | 'moderate' | 'sensitive' | 'unhealthy' | 'veryUnhealthy' | 'hazardous' | 'neutral';
}

const severityColors = {
  good: 'text-aqi-good bg-aqi-good/10 border-aqi-good/20',
  moderate: 'text-aqi-moderate bg-aqi-moderate/10 border-aqi-moderate/20',
  sensitive: 'text-aqi-sensitive bg-aqi-sensitive/10 border-aqi-sensitive/20',
  unhealthy: 'text-aqi-unhealthy bg-aqi-unhealthy/10 border-aqi-unhealthy/20',
  veryUnhealthy: 'text-aqi-veryUnhealthy bg-aqi-veryUnhealthy/10 border-aqi-veryUnhealthy/20',
  hazardous: 'text-aqi-hazardous bg-aqi-hazardous/10 border-aqi-hazardous/20',
  neutral: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
};

export default function KPICard({ title, value, unit, trend, trendValue, icon: Icon, severity = 'neutral' }: KPICardProps) {
  const colorClass = severityColors[severity];

  return (
    <div className="panel flex flex-col p-5 group hover:shadow-glow transition-all duration-300">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">{title}</h3>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorClass} transition-colors`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-1 mt-auto">
        <span className="text-3xl font-bold text-text-primary tabular-nums tracking-tight">{value}</span>
        {unit && <span className="text-sm font-medium text-text-secondary">{unit}</span>}
      </div>

      {trend && trendValue && (
        <div className="flex items-center gap-1.5 mt-3 text-xs font-medium">
          {trend === 'up' && <TrendingUp size={14} className="text-aqi-unhealthy" />}
          {trend === 'down' && <TrendingDown size={14} className="text-aqi-good" />}
          {trend === 'neutral' && <Minus size={14} className="text-text-muted" />}
          <span className={trend === 'up' ? 'text-aqi-unhealthy' : trend === 'down' ? 'text-aqi-good' : 'text-text-muted'}>
            {trendValue}
          </span>
          <span className="text-text-muted ml-1">vs last 24h</span>
        </div>
      )}
    </div>
  );
}
