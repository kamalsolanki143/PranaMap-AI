'use client';
import React from 'react';
import Header from '@/components/Navbar/Header';
import ForecastChart from '@/components/Charts/ForecastChart';
import { useAppStore } from '@/store/useAppStore';
import { MOCK_FORECAST } from '@/lib/mockData';
import { Thermometer, Wind, CloudRain } from 'lucide-react';

export default function ForecastPage() {
  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold text-text-primary tracking-tight">Predictive Forecasting</h1>
             <p className="text-text-secondary text-sm mt-1">72-hour AI-driven air quality predictions</p>
           </div>
           <div className="glass-panel px-4 py-2 flex gap-4 text-sm font-medium">
              <span className="text-aqi-sensitive">Confidence Score: 92%</span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
           {/* Chart Panel */}
           <div className="lg:col-span-2 panel flex flex-col">
             <div className="panel-header">
               <span>City-Wide AQI Trend (Next 24h)</span>
             </div>
             <div className="flex-1 p-6">
                <ForecastChart />
             </div>
           </div>

           {/* Metrics Panel */}
           <div className="panel flex flex-col">
             <div className="panel-header">
               <span>Meteorological Factors</span>
             </div>
             <div className="flex-1 p-6 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-surfaceHover rounded-lg border border-border"><Wind className="text-accent-cyan" /></div>
                   <div>
                     <p className="text-sm text-text-muted font-semibold uppercase tracking-wider">Wind Speed</p>
                     <p className="text-xl font-bold text-text-primary">12 km/h <span className="text-sm font-normal text-text-secondary ml-1">NW</span></p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-surfaceHover rounded-lg border border-border"><Thermometer className="text-aqi-sensitive" /></div>
                   <div>
                     <p className="text-sm text-text-muted font-semibold uppercase tracking-wider">Temperature Inversion</p>
                     <p className="text-xl font-bold text-aqi-sensitive">High Risk</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-surfaceHover rounded-lg border border-border"><CloudRain className="text-accent-blue" /></div>
                   <div>
                     <p className="text-sm text-text-muted font-semibold uppercase tracking-wider">Precipitation Chance</p>
                     <p className="text-xl font-bold text-text-primary">10% <span className="text-sm font-normal text-text-secondary ml-1">No Rain Expected</span></p>
                   </div>
                </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
