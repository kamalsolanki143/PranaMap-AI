'use client';
import React from 'react';
import Header from '@/components/Navbar/Header';
import KPICard from '@/components/Common/KPICard';
import ForecastChart from '@/components/Charts/ForecastChart';
import AlertBanner from '@/components/Alerts/AlertBanner';
import { useApiData } from '@/hooks/useApiData';
import { fetchCommandCenter } from '@/services/api';
import { Wind, Thermometer, Factory, Users } from 'lucide-react';
import dynamic from 'next/dynamic';

const AQIMap = dynamic(() => import('@/components/Map/AQIMap'), { ssr: false, loading: () => <div className="w-full h-full bg-surface animate-pulse rounded-lg" /> });

export default function DashboardPage() {
  const { data, loading } = useApiData(fetchCommandCenter);

  if (loading || !data) {
    return (
      <div className="flex flex-col h-full w-full">
        <Header />
        <div className="flex-1 p-6 space-y-6 animate-pulse">
          <div className="h-16 bg-surface rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-surface rounded-xl" />)}
          </div>
          <div className="h-[500px] bg-surface rounded-xl" />
        </div>
      </div>
    );
  }

  const hotspotCount = data.wards.filter(w => w.aqi > 200).length;
  const criticalCount = data.wards.filter(w => w.aqi > 300).length;

  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AlertBanner />

        {/* KPIs from API */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="City Avg AQI" value={data.live_aqi.toString()} trend="up" trendValue={`+${data.wards.length} wards`} icon={Wind} severity={data.live_aqi > 200 ? 'veryUnhealthy' : data.live_aqi > 150 ? 'unhealthy' : 'moderate'} />
          <KPICard title="Hotspots Identified" value={hotspotCount.toString()} trend="up" trendValue={`${criticalCount} critical`} icon={Factory} severity="sensitive" />
          <KPICard title="Confidence" value={`${data.ai_confidence}%`} trend="neutral" trendValue="Model v4.2" icon={Users} severity="neutral" />
          <KPICard title="Peak Forecast" value={data.forecast_peak_time} trend="up" trendValue={data.avg_wind} icon={Thermometer} severity="veryUnhealthy" />
        </div>

        {/* Map + Intelligence Panel */}
        <div className="flex flex-col lg:flex-row gap-6 h-[600px] xl:h-[700px]">
          <div className="flex-1 min-w-0 panel overflow-hidden flex flex-col relative group">
            <div className="panel-header absolute top-0 w-full z-20 bg-surface/80 backdrop-blur-md border-b-0">
              <div>
                <h2 className="text-text-primary">Live Geospatial Intelligence</h2>
                <p className="text-xs text-text-muted normal-case font-normal mt-0.5">High-resolution PM2.5 & PM10 dispersion</p>
              </div>
            </div>
            <div className="flex-1 w-full h-full" aria-label="Air quality heatmap">
              <AQIMap />
            </div>
          </div>

          <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0">
            <div className="panel flex flex-col h-1/2">
              <div className="panel-header"><h2>Predictive Forecast (72h)</h2></div>
              <div className="flex-1 p-4"><ForecastChart /></div>
            </div>
            <div className="panel flex flex-col h-1/2">
              <div className="panel-header"><h2>Primary Sources</h2></div>
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-3">
                  {data.wards.slice(0, 4).map(ward => (
                    <div key={ward.sensor_id} className="bg-surfaceHover border border-border p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{ward.name}</p>
                        <p className="text-xs text-text-muted mt-1">Sensor: {ward.sensor_id}</p>
                      </div>
                      <span className={`font-bold tabular-nums ${ward.aqi > 300 ? 'text-aqi-hazardous' : ward.aqi > 200 ? 'text-aqi-veryUnhealthy' : 'text-aqi-sensitive'}`}>{ward.aqi}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
