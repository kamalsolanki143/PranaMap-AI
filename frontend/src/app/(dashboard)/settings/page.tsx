'use client';
import React, { useState, useEffect } from 'react';
import Header from '@/components/Navbar/Header';
import { useAppStore } from '@/store/useAppStore';
import { healthCheck } from '@/services/api';
import { Wifi, WifiOff, Activity } from 'lucide-react';

export default function SettingsPage() {
  const { apiMode, setApiMode } = useAppStore();
  const [backendStatus, setBackendStatus] = useState<{ healthy: boolean; latencyMs: number } | null>(null);
  const [checking, setChecking] = useState(false);

  async function checkConnection() {
    setChecking(true);
    const result = await healthCheck();
    setBackendStatus(result);
    setChecking(false);
  }

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">System Configuration</h1>
          <p className="text-text-secondary text-sm mt-1">Platform settings and operational modes</p>
        </div>

        {/* Connection Status */}
        <div className="panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">Backend Connection</h3>
          <div className="flex items-center gap-4">
            {backendStatus === null || checking ? (
              <div className="flex items-center gap-3 text-text-muted">
                <Activity size={18} className="animate-pulse" />
                <span className="text-sm">Checking connection...</span>
              </div>
            ) : backendStatus.healthy ? (
              <div className="flex items-center gap-3">
                <Wifi size={18} className="text-aqi-good" />
                <span className="text-sm text-aqi-good font-semibold">Connected — {backendStatus.latencyMs}ms latency</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <WifiOff size={18} className="text-aqi-sensitive" />
                <span className="text-sm text-aqi-sensitive font-semibold">Backend unreachable — using cached data</span>
              </div>
            )}
            <button onClick={checkConnection} className="ml-auto px-4 py-2 text-xs font-bold uppercase bg-surfaceHover border border-border rounded-lg hover:bg-border transition-colors text-text-primary">
              Re-check
            </button>
          </div>
          <p className="text-xs text-text-muted">Endpoint: {process.env.NEXT_PUBLIC_API_URL || 'https://pranamap-api-xxxx.onrender.com/api/v1'}</p>
        </div>

        {/* API Mode Toggle */}
        <div className="panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">Data Source Mode</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setApiMode('mock')}
              className={`flex-1 py-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                apiMode === 'mock' ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan shadow-glow' : 'bg-surfaceHover border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="font-bold text-lg">Mock Engine</span>
              <span className="text-xs">Offline demo mode</span>
            </button>
            <button
              onClick={() => setApiMode('live')}
              className={`flex-1 py-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                apiMode === 'live' ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan shadow-glow' : 'bg-surfaceHover border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="font-bold text-lg">Live API</span>
              <span className="text-xs">Connect to FastAPI backend</span>
            </button>
          </div>
          {apiMode === 'live' && backendStatus && !backendStatus.healthy && (
            <p className="text-xs text-aqi-sensitive flex items-center gap-2">
              ⚠️ Backend is unreachable. The app will gracefully fall back to cached data.
            </p>
          )}
          {apiMode === 'live' && backendStatus && backendStatus.healthy && (
            <p className="text-xs text-aqi-good flex items-center gap-2">
              ✓ Live API connected successfully. Data is being served from the backend.
            </p>
          )}
        </div>

        {/* Appearance */}
        <div className="panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">Appearance</h3>
          <p className="text-sm text-text-secondary">The application uses a Premium Dark Command-Center theme optimized for operational visibility.</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-6 bg-accent-cyan rounded-full flex items-center p-1">
              <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow" />
            </div>
            <span className="text-sm font-semibold text-text-primary">Dark Mode (Active)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
