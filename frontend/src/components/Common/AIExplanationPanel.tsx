'use client';
import React from 'react';
import { Cpu, CheckCircle2, Wind, Car, Building2, Flame, Factory } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

interface AIExplanationPanelProps {
  windDirection?: string;
  trafficPct?: number;
  constructionPct?: number;
  biomassPct?: number;
  industrialPct?: number;
  confidence?: number;
  reasonText?: string;
  compact?: boolean;
}

export default function AIExplanationPanel({
  windDirection = 'North-West (12 km/h)',
  trafficPct = 41,
  constructionPct = 24,
  biomassPct = 19,
  industrialPct = 16,
  confidence = 94,
  reasonText = 'High confidence due to persistent wind direction, traffic congestion, and satellite PM2.5 observations.',
  compact = false,
}: AIExplanationPanelProps) {
  const { t } = useTranslation();

  const factors = [
    { label: 'Traffic Contribution', pct: trafficPct, color: '#ef4444', icon: Car },
    { label: 'Construction Dust', pct: constructionPct, color: '#f59e0b', icon: Building2 },
    { label: 'Biomass Burning', pct: biomassPct, color: '#10b981', icon: Flame },
    { label: 'Industrial Emissions', pct: industrialPct, color: '#3b82f6', icon: Factory },
  ];

  return (
    <div className={`panel p-4 sm:p-5 space-y-4 border-l-4 border-l-accent-cyan shadow-panel transition-all`} style={{ backgroundColor: 'rgb(var(--surface) / 0.9)' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-border">
        <div className="flex items-center gap-2 text-accent-cyan">
          <Cpu size={18} className="animate-pulse" />
          <h3 className="text-sm font-bold text-text-primary tracking-tight">
            Why did AI make this prediction?
          </h3>
        </div>
        <div className="flex items-center gap-1.5 bg-accent-cyan/10 border border-accent-cyan/20 px-2.5 py-1 rounded-full text-xs font-semibold text-accent-cyan">
          <CheckCircle2 size={13} />
          <span>AI Confidence: {confidence}%</span>
        </div>
      </div>

      {/* Wind Info & Key Reason */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-text-secondary bg-surfaceHover px-3 py-2 rounded-lg border border-border">
          <Wind size={14} className="text-accent-cyan shrink-0" />
          <span>Wind Direction: <strong className="text-text-primary font-semibold">{windDirection}</strong></span>
        </div>

        <div className="p-3 rounded-lg border border-border" style={{ backgroundColor: 'rgb(var(--surface-hover) / 0.5)' }}>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
            <strong className="text-text-primary font-semibold">Reason: </strong>
            {reasonText}
          </p>
        </div>
      </div>

      {/* Contribution Breakdown Bars */}
      {!compact && (
        <div className="space-y-3 pt-1">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Feature Attribution Breakdown</p>
          <div className="space-y-2.5">
            {factors.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <Icon size={13} style={{ color: item.color }} />
                      {item.label}
                    </span>
                    <span className="font-bold tabular-nums" style={{ color: item.color }}>
                      {item.pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surfaceHover rounded-full overflow-hidden" style={{ border: '1px solid rgb(var(--border) / 0.4)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${item.pct}%`,
                        backgroundColor: item.color,
                        boxShadow: `0 0 8px ${item.color}60`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
