'use client';
import React, { useState, useEffect } from 'react';
import Header from '@/components/Navbar/Header';
import KPICard from '@/components/Common/KPICard';
import ForecastChart from '@/components/Charts/ForecastChart';
import AlertBanner from '@/components/Alerts/AlertBanner';
import AIExplanationPanel from '@/components/Common/AIExplanationPanel';
import { useApiData } from '@/hooks/useApiData';
import { fetchCommandCenter } from '@/services/api';
import { useTranslation } from '@/i18n/LanguageContext';
import { useAppStore } from '@/store/useAppStore';
import { Wind, Thermometer, Factory, Users, Activity, CheckCircle2, Clock, AlertTriangle, TrendingUp, Database } from 'lucide-react';
import dynamic from 'next/dynamic';

const AQIMap = dynamic(() => import('@/components/Map/AQIMap'), { ssr: false, loading: () => <div className="w-full h-full bg-surface animate-pulse rounded-lg" /> });

export default function DashboardPage() {
  const { data, loading, refetch } = useApiData(fetchCommandCenter);
  const { apiMode } = useAppStore();
  const { t } = useTranslation();
  const [lastUpdated, setLastUpdated] = useState('3:42 PM');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col h-full w-full">
        <Header onRefresh={refetch} />
        <div className="flex-1 p-4 sm:p-6 space-y-6 animate-pulse">
          <div className="h-16 bg-surface rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-surface rounded-xl" />)}
          </div>
          <div className="h-[400px] sm:h-[500px] bg-surface rounded-xl" />
        </div>
      </div>
    );
  }

  const hotspotCount = data.wards.filter(w => w.aqi > 200).length;
  const criticalCount = data.wards.filter(w => w.aqi > 300).length;

  return (
    <div className="flex flex-col h-full w-full bg-background text-text-primary">
      <Header onRefresh={refetch} />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <AlertBanner />

        {/* Command Center System Intelligence Status Bar */}
        <div className="panel p-3 sm:p-4 bg-surface/90 flex items-center justify-between flex-wrap gap-3 text-xs border-l-4 border-l-accent-cyan shadow-panel">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 font-mono text-text-secondary">
              <Clock size={14} className="text-accent-cyan" />
              <span>Last Updated: <strong className="text-text-primary font-bold">{lastUpdated}</strong></span>
            </div>
            <span className="text-border hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 font-semibold text-aqi-good">
              <CheckCircle2 size={14} />
              <span>API Status: <strong className="uppercase">Connected</strong></span>
            </div>
            <span className="text-border hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 font-semibold text-accent-cyan">
              <Activity size={14} />
              <span>System Health: <strong>Healthy (100%)</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-aqi-sensitive font-semibold">
              <AlertTriangle size={14} />
              <span>Active Alerts: <strong>2 Critical</strong></span>
            </div>
            <span className="text-border hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 text-aqi-veryUnhealthy font-semibold">
              <TrendingUp size={14} />
              <span>Trend: <strong>Increasing</strong></span>
            </div>
            <span className="text-border hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 bg-surfaceHover px-2.5 py-1 rounded-md border border-border font-bold uppercase tracking-wider text-text-secondary">
              <Database size={13} className="text-accent-cyan" />
              <span>Data Source: <strong className="text-accent-cyan">{apiMode === 'live' ? 'Live API' : 'Demo Mode'}</strong></span>
            </div>
          </div>
        </div>

        {/* KPIs from API */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title={t('dashboard.kpi.cityAqi', 'City Avg AQI')} value={data.live_aqi.toString()} trend="up" trendValue={`+${data.wards.length} wards`} icon={Wind} severity={data.live_aqi > 200 ? 'veryUnhealthy' : data.live_aqi > 150 ? 'unhealthy' : 'moderate'} />
          <KPICard title={t('dashboard.kpi.hotspots', 'Hotspots Identified')} value={hotspotCount.toString()} trend="up" trendValue={`${criticalCount} critical`} icon={Factory} severity="sensitive" />
          <KPICard title={t('dashboard.kpi.confidence', 'AI Confidence')} value={`${data.ai_confidence}%`} trend="neutral" trendValue="Model v4.2" icon={Users} severity="neutral" />
          <KPICard title={t('dashboard.kpi.peakForecast', 'Peak Forecast')} value={data.forecast_peak_time} trend="up" trendValue={data.avg_wind} icon={Thermometer} severity="veryUnhealthy" />
        </div>

        {/* Map + Intelligence Panel */}
        <div className="flex flex-col lg:flex-row gap-6 min-h-[500px] lg:h-[600px] xl:h-[680px]">
          <div className="flex-1 min-w-0 panel overflow-hidden flex flex-col relative group h-[380px] sm:h-[450px] lg:h-full">
            <div className="panel-header absolute top-0 w-full z-20 bg-surface/80 backdrop-blur-md border-b-0">
              <div>
                <h2 className="text-text-primary">{t('dashboard.subtitle', 'Live Geospatial Intelligence')}</h2>
                <p className="text-xs text-text-muted normal-case font-normal mt-0.5">{t('dashboard.mapSub', 'High-resolution PM2.5 & PM10 dispersion')}</p>
              </div>
            </div>
            <div className="flex-1 w-full h-full" aria-label="Air quality heatmap">
              <AQIMap />
            </div>
          </div>

          <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0 overflow-y-auto">
            <div className="panel flex flex-col min-h-[220px]">
              <div className="panel-header"><h2>{t('dashboard.predictive72h', 'Predictive Forecast (72h)')}</h2></div>
              <div className="flex-1 p-4"><ForecastChart /></div>
            </div>

            {/* Explainable AI Panel */}
            <AIExplanationPanel
              windDirection="North-West (12 km/h)"
              trafficPct={41}
              constructionPct={24}
              biomassPct={19}
              industrialPct={16}
              confidence={data.ai_confidence}
              compact={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


