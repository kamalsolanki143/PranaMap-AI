import React from 'react';
import Header from '@/components/Navbar/Header';
import KPICard from '@/components/Common/KPICard';
import AQIMap from '@/components/Map/AQIMap';
import ForecastChart from '@/components/Charts/ForecastChart';
import AlertBanner from '@/components/Alerts/AlertBanner';
import { Wind, Thermometer, Factory, Users } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Alerts Strip */}
        <AlertBanner />

        {/* Top Row: KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            title="City Avg AQI" 
            value="164" 
            trend="up" 
            trendValue="+12%" 
            icon={Wind} 
            severity="unhealthy" 
          />
          <KPICard 
            title="Hotspots Identified" 
            value="8" 
            trend="up" 
            trendValue="+2" 
            icon={Factory} 
            severity="sensitive" 
          />
          <KPICard 
            title="Vulnerable Pop." 
            value="1.2" 
            unit="M"
            trend="neutral" 
            trendValue="Stable" 
            icon={Users} 
            severity="neutral" 
          />
          <KPICard 
            title="Forecast Risk (72h)" 
            value="High" 
            trend="up" 
            trendValue="Severe Expected" 
            icon={Thermometer} 
            severity="veryUnhealthy" 
          />
        </div>

        {/* Middle Section: Map and Intelligence Panel */}
        <div className="flex flex-col lg:flex-row gap-6 h-[600px] xl:h-[700px]">
          {/* Dominant Map Container */}
          <div className="flex-1 min-w-0 panel overflow-hidden flex flex-col relative group">
             <div className="panel-header absolute top-0 w-full z-20 bg-surface/80 backdrop-blur-md border-b-0">
               <div>
                  <h2 className="text-text-primary">Live Geospatial Intelligence</h2>
                  <p className="text-xs text-text-muted normal-case font-normal mt-0.5">High-resolution PM2.5 & PM10 dispersion</p>
               </div>
               <div className="flex gap-2">
                 {/* Map controls placeholder */}
                 <span className="bg-surfaceHover border border-border px-2 py-1 rounded text-xs text-text-secondary cursor-pointer hover:text-text-primary">3D Terrain</span>
               </div>
             </div>
             
             {/* Actual Map Component */}
             <div className="flex-1 w-full h-full">
               <AQIMap />
             </div>
          </div>

          {/* Right side Intelligence Panel */}
          <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0">
            {/* Forecast Chart Panel */}
            <div className="panel flex flex-col h-1/2">
              <div className="panel-header">
                <h2>Predictive Forecast (72h)</h2>
              </div>
              <div className="flex-1 p-4">
                <ForecastChart />
              </div>
            </div>

            {/* Source Attribution Panel */}
            <div className="panel flex flex-col h-1/2">
              <div className="panel-header">
                <h2>Primary Sources</h2>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                 {/* SourceCard/AttributionList placeholder */}
                 <div className="space-y-3">
                   <div className="bg-surfaceHover border border-border p-3 rounded-lg flex justify-between items-center">
                     <div>
                       <p className="text-sm font-semibold text-text-primary">Vehicular Emissions</p>
                       <p className="text-xs text-text-muted mt-1">Major arterial roads congestion</p>
                     </div>
                     <span className="text-aqi-unhealthy font-bold tabular-nums">42%</span>
                   </div>
                   <div className="bg-surfaceHover border border-border p-3 rounded-lg flex justify-between items-center">
                     <div>
                       <p className="text-sm font-semibold text-text-primary">Industrial (Chem)</p>
                       <p className="text-xs text-text-muted mt-1">Zone B operations active</p>
                     </div>
                     <span className="text-aqi-sensitive font-bold tabular-nums">28%</span>
                   </div>
                   <div className="bg-surfaceHover border border-border p-3 rounded-lg flex justify-between items-center">
                     <div>
                       <p className="text-sm font-semibold text-text-primary">Construction Dust</p>
                       <p className="text-xs text-text-muted mt-1">Metro Phase 3 sites</p>
                     </div>
                     <span className="text-aqi-moderate font-bold tabular-nums">15%</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
