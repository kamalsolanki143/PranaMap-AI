'use client';
import React from 'react';
import Header from '@/components/Navbar/Header';
import { MOCK_ATTRIBUTION } from '@/lib/mockData';

export default function AttributionPage() {
  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold text-text-primary tracking-tight">Source Attribution</h1>
             <p className="text-text-secondary text-sm mt-1">Explainable AI pollution source identification</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="panel flex flex-col">
              <div className="panel-header">
                 <span>Primary Sources (City-Wide)</span>
              </div>
              <div className="flex-1 p-6 space-y-4">
                 {MOCK_ATTRIBUTION.map(attr => (
                    <div key={attr.source} className="bg-surfaceHover border border-border p-4 rounded-xl flex items-center justify-between">
                       <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                             <span className="font-semibold text-text-primary">{attr.source}</span>
                             <span className="text-accent-cyan font-bold tabular-nums">{attr.percentage}%</span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                             <div className="h-full bg-accent-cyan transition-all" style={{width: `${attr.percentage}%`}}></div>
                          </div>
                          <p className="text-xs text-text-muted mt-3">{attr.description} • Confidence: {attr.confidence}%</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="panel flex flex-col">
              <div className="panel-header">
                 <span>Evidence Analysis</span>
              </div>
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
                 <div className="w-24 h-24 rounded-full bg-surfaceHover border border-border flex items-center justify-center mb-4">
                    <span className="text-4xl">🛰️</span>
                 </div>
                 <h3 className="text-lg font-bold text-text-primary">Satellite & Sensor Corroboration</h3>
                 <p className="text-text-secondary max-w-md text-sm leading-relaxed">
                   Source attribution is calculated using a fusion of Sentinel-5P satellite NO2 data, local ground sensor PM2.5 ratios, and traffic congestion APIs. The current model shows 92% confidence in vehicular emissions dominance.
                 </p>
                 <button className="mt-4 px-6 py-2 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border border-accent-cyan/30 rounded-lg transition-colors text-sm font-semibold">
                   View Raw Evidence Logs
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
