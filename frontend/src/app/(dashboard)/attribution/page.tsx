'use client';
import React, { useState } from 'react';
import Header from '@/components/Navbar/Header';
import SourceBarChart from '@/components/Charts/SourceBarChart';
import AIExplanationPanel from '@/components/Common/AIExplanationPanel';
import { useApiData } from '@/hooks/useApiData';
import { fetchAttribution } from '@/services/api';
import { useTranslation } from '@/i18n/LanguageContext';

export default function AttributionPage() {
  const { data, loading, refetch } = useApiData(fetchAttribution);
  const { t } = useTranslation();
  const [showEvidence, setShowEvidence] = useState(false);

  if (loading || !data) {
    return (
      <div className="flex flex-col h-full w-full">
        <Header onRefresh={refetch} />
        <div className="flex-1 p-4 sm:p-6 space-y-6 animate-pulse">
          <div className="h-10 w-64 bg-surface rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[400px] bg-surface rounded-xl" />
            <div className="h-[400px] bg-surface rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background text-text-primary">
      <Header onRefresh={refetch} />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">{t('attribution.title', 'Source Attribution')}</h1>
            <p className="text-text-secondary text-xs sm:text-sm mt-1">{t('attribution.station', 'Station')} {data.station} — {data.ward} — AQI {data.current_aqi}</p>
          </div>
          <div className="glass-panel px-4 py-2 text-xs sm:text-sm">
            <span className="text-accent-cyan font-semibold">{t('attribution.confidence', 'Analysis Confidence')}: {data.analysis_confidence}%</span>
          </div>
        </div>

        {/* Explainable AI Panel */}
        <AIExplanationPanel
          windDirection={`${data.wind_direction} (${data.wind_speed_kmh} km/h)`}
          trafficPct={41}
          constructionPct={24}
          biomassPct={19}
          industrialPct={16}
          confidence={data.analysis_confidence}
          reasonText={data.ai_summary}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source Breakdown */}
          <div className="panel flex flex-col">
            <div className="panel-header"><span>{t('attribution.sourcesHeader', 'Primary Sources')}</span></div>
            <div className="flex-1 p-4 sm:p-6">
              <SourceBarChart sources={data.sources} />
            </div>
          </div>

          {/* Evidence Panel */}
          <div className="panel flex flex-col min-h-[350px]">
            <div className="panel-header"><span>{t('attribution.evidenceHeader', 'Evidence Analysis')}</span></div>
            <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
              {!showEvidence ? (
                <div className="flex flex-col items-center justify-center text-center h-full space-y-4 py-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surfaceHover border border-border flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">🛰️</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-text-primary">{t('attribution.corroboration', 'Satellite & Sensor Corroboration')}</h3>
                  <p className="text-text-secondary max-w-md text-xs sm:text-sm leading-relaxed">
                    Wind: {data.wind_direction} at {data.wind_speed_kmh} km/h. {data.nodes_active} sensor nodes active. Network latency: {data.network_latency_ms}ms.
                  </p>
                  <button
                    onClick={() => setShowEvidence(true)}
                    className="mt-4 px-5 py-2 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border border-accent-cyan/30 rounded-lg transition-colors text-xs sm:text-sm font-semibold"
                  >
                    {t('attribution.viewLogs', 'View Raw Evidence Logs')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button onClick={() => setShowEvidence(false)} className="text-xs text-accent-cyan hover:underline">{t('attribution.backSummary', '← Back to Summary')}</button>
                  {data.sources.map(src => (
                    <div key={src.source} className="bg-surfaceHover border border-border p-4 rounded-lg">
                      <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-sm" style={{ color: src.color }}>{src.icon}</span>
                        {src.source} — {src.impact_pct}% {t('attribution.impact', 'impact')}
                      </h4>
                      <ul className="space-y-1">
                        {src.evidence.map((ev, i) => (
                          <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                            <span className="text-accent-cyan mt-0.5">•</span>
                            {ev.label}
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {src.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-text-muted">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


