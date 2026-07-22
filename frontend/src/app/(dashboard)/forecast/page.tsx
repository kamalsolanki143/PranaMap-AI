'use client';
import React from 'react';
import Header from '@/components/Navbar/Header';
import AQILineChart from '@/components/Charts/AQILineChart';
import { useApiData } from '@/hooks/useApiData';
import { fetchForecast } from '@/services/api';
import { Thermometer, Wind, CloudRain, TrendingUp } from 'lucide-react';

export default function ForecastPage() {
  const { data, loading } = useApiData(fetchForecast);

  if (loading || !data) {
    return (
      <div className="flex flex-col h-full w-full">
        <Header />
        <div className="flex-1 p-6 space-y-6 animate-pulse">
          <div className="h-10 w-64 bg-surface rounded" />
          <div className="h-[400px] bg-surface rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Predictive Forecasting</h1>
            <p className="text-text-secondary text-sm mt-1">72-hour AI-driven air quality predictions — {data.ward}</p>
          </div>
          <div className="glass-panel px-4 py-2 flex gap-4 text-sm font-medium">
            <span className="text-accent-cyan">Confidence: {data.model_confidence}%</span>
            <span className="text-text-muted">|</span>
            <span className="flex items-center gap-1 text-aqi-sensitive"><TrendingUp size={14} /> {data.trend} {data.trend_pct}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Panel */}
          <div className="lg:col-span-2 panel flex flex-col">
            <div className="panel-header"><span>AQI Trend (Next 24h)</span></div>
            <div className="flex-1 p-6">
              <AQILineChart data={data.points} />
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="panel flex flex-col">
            <div className="panel-header"><span>Forecast Summary</span></div>
            <div className="flex-1 p-6 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-surfaceHover rounded-lg border border-border"><Wind className="text-accent-cyan" /></div>
                <div>
                  <p className="text-sm text-text-muted font-semibold uppercase tracking-wider">Today Average</p>
                  <p className="text-xl font-bold text-text-primary">{data.today_avg} <span className="text-sm font-normal text-text-secondary">AQI</span></p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-surfaceHover rounded-lg border border-border"><Thermometer className="text-aqi-sensitive" /></div>
                <div>
                  <p className="text-sm text-text-muted font-semibold uppercase tracking-wider">Tomorrow Predicted</p>
                  <p className="text-xl font-bold text-aqi-sensitive">{data.tomorrow_predicted} AQI</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-surfaceHover rounded-lg border border-border"><CloudRain className="text-accent-blue" /></div>
                <div>
                  <p className="text-sm text-text-muted font-semibold uppercase tracking-wider">Peak Time</p>
                  <p className="text-xl font-bold text-text-primary">{data.points[data.points.length - 1]?.time || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
