'use client';
import React from 'react';
import Header from '@/components/Navbar/Header';
import AQILineChart from '@/components/Charts/AQILineChart';
import AIExplanationPanel from '@/components/Common/AIExplanationPanel';
import { useApiData } from '@/hooks/useApiData';
import { fetchForecast } from '@/services/api';
import { useTranslation } from '@/i18n/LanguageContext';
import { Thermometer, Wind, CloudRain, TrendingUp } from 'lucide-react';


export default function ForecastPage() {
  const { data, loading, refetch } = useApiData(fetchForecast);
  const { t } = useTranslation();

  if (loading || !data) {
    return (
      <div className="flex flex-col h-full w-full">
        <Header onRefresh={refetch} />
        <div className="flex-1 p-4 sm:p-6 space-y-6 animate-pulse">
          <div className="h-10 w-64 bg-surface rounded" />
          <div className="h-[400px] bg-surface rounded-xl" />
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
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">{t('forecast.title', 'Predictive Forecasting')}</h1>
            <p className="text-text-secondary text-xs sm:text-sm mt-1">{t('forecast.subtitle', '72-hour AI-driven air quality predictions')} — {data.ward}</p>
          </div>
          <div className="glass-panel px-4 py-2 flex gap-4 text-xs sm:text-sm font-medium">
            <span className="text-accent-cyan">{t('forecast.confidence', 'Confidence')}: {data.model_confidence}%</span>
            <span className="text-text-muted">|</span>
            <span className="flex items-center gap-1 text-aqi-sensitive"><TrendingUp size={14} /> {data.trend} {data.trend_pct}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Panel */}
          <div className="lg:col-span-2 panel flex flex-col min-h-[350px]">
            <div className="panel-header"><span>{t('forecast.chartHeader', 'AQI Trend (Next 24h)')}</span></div>
            <div className="flex-1 p-4 sm:p-6">
              <AQILineChart data={data.points} />
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="panel flex flex-col space-y-6">
            <div className="panel-header"><span>{t('forecast.summaryHeader', 'Forecast Summary')}</span></div>
            <div className="flex-1 p-4 sm:p-6 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-surfaceHover rounded-lg border border-border"><Wind className="text-accent-cyan" /></div>
                <div>
                  <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">{t('forecast.todayAvg', 'Today Average')}</p>
                  <p className="text-xl font-bold text-text-primary">{data.today_avg} <span className="text-sm font-normal text-text-secondary">AQI</span></p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-surfaceHover rounded-lg border border-border"><Thermometer className="text-aqi-sensitive" /></div>
                <div>
                  <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">{t('forecast.tomorrowPredicted', 'Tomorrow Predicted')}</p>
                  <p className="text-xl font-bold text-aqi-sensitive">{data.tomorrow_predicted} AQI</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-surfaceHover rounded-lg border border-border"><CloudRain className="text-accent-blue" /></div>
                <div>
                  <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">{t('forecast.peakTime', 'Peak Time')}</p>
                  <p className="text-xl font-bold text-text-primary">{data.points[data.points.length - 1]?.time || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Explainable AI Panel */}
            <div className="p-4 pt-0">
              <AIExplanationPanel confidence={data.model_confidence} compact={false} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

