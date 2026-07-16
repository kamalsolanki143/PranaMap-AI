'use client';
import React from 'react';
import Header from '@/components/Navbar/Header';
import { useAppStore } from '@/store/useAppStore';

export default function SettingsPage() {
  const { apiMode, setApiMode } = useAppStore();

  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto">
        
        <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold text-text-primary tracking-tight">System Configuration</h1>
             <p className="text-text-secondary text-sm mt-1">Platform settings and operational modes</p>
           </div>
        </div>

        <div className="panel p-6 space-y-8">
           
           {/* API Mode Toggle */}
           <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-border pb-2">Data Source Mode</h3>
              <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setApiMode('mock')}
                   className={`flex-1 py-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                     apiMode === 'mock' 
                     ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan shadow-glow' 
                     : 'bg-surfaceHover border-border text-text-secondary hover:text-text-primary'
                   }`}
                 >
                    <span className="font-bold text-lg">Mock Engine</span>
                    <span className="text-xs">Offline hackathon mode</span>
                 </button>
                 
                 <button 
                   onClick={() => setApiMode('live')}
                   className={`flex-1 py-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                     apiMode === 'live' 
                     ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan shadow-glow' 
                     : 'bg-surfaceHover border-border text-text-secondary hover:text-text-primary'
                   }`}
                 >
                    <span className="font-bold text-lg">Live API</span>
                    <span className="text-xs">Connect to FastAPI backend</span>
                 </button>
              </div>
              {apiMode === 'live' && (
                <p className="text-xs text-aqi-sensitive mt-3 flex items-center gap-2">
                  ⚠️ Live APIs are currently disconnected. The application will fall back to cached data.
                </p>
              )}
           </div>

           {/* Appearance */}
           <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-border pb-2">Appearance</h3>
              <p className="text-sm text-text-secondary mb-3">The application is currently locked to the Premium Dark Command-Center theme for optimal visualization contrast.</p>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-6 bg-accent-cyan rounded-full flex items-center p-1">
                   <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow"></div>
                 </div>
                 <span className="text-sm font-semibold text-text-primary">Dark Mode (Forced)</span>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
