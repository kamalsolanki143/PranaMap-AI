'use client';
import React, { useState, useEffect } from 'react';
import Header from '@/components/Navbar/Header';
import { useAppStore } from '@/store/useAppStore';
import { healthCheck } from '@/services/api';
import { useToast } from '@/components/Common/Toast';
import { useTheme } from '@/theme/ThemeContext';
import { useTranslation } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';
import { getApiBaseUrl } from '@/utils/constants';
import { Wifi, WifiOff, Activity, Sun, Moon, Globe } from 'lucide-react';

export default function SettingsPage() {
  const { apiMode, setApiMode } = useAppStore();
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const [backendStatus, setBackendStatus] = useState<{ healthy: boolean; latencyMs: number } | null>(null);
  const [checking, setChecking] = useState(false);

  async function checkConnection() {
    setChecking(true);
    const result = await healthCheck();
    setBackendStatus(result);
    setChecking(false);
    if (result.healthy) {
      showToast(`Connected to FastAPI backend (${result.latencyMs}ms)`, 'success');
    } else {
      showToast('Backend health check failed', 'error');
    }
  }

  useEffect(() => {
    checkConnection();
  }, []);

  const currentEndpoint = getApiBaseUrl();

  return (
    <div className="flex flex-col h-full w-full bg-background text-text-primary">
      <Header onRefresh={checkConnection} />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">{t('settings.title', 'System Configuration')}</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">{t('settings.subtitle', 'Platform settings and operational modes')}</p>
        </div>

        {/* Connection Status */}
        <div className="panel p-5 sm:p-6 space-y-4">
          <h3 className="text-xs sm:text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">{t('settings.connection', 'Backend Connection')}</h3>
          <div className="flex items-center gap-4 flex-wrap">
            {backendStatus === null || checking ? (
              <div className="flex items-center gap-3 text-text-muted">
                <Activity size={18} className="animate-pulse" />
                <span className="text-xs sm:text-sm">{t('settings.checking', 'Checking connection...')}</span>
              </div>
            ) : backendStatus.healthy ? (
              <div className="flex items-center gap-3">
                <Wifi size={18} className="text-aqi-good" />
                <span className="text-xs sm:text-sm text-aqi-good font-semibold">{t('settings.connected', 'Connected')} — {backendStatus.latencyMs}ms latency</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <WifiOff size={18} className="text-aqi-sensitive" />
                <span className="text-xs sm:text-sm text-aqi-sensitive font-semibold">{t('settings.unreachable', 'Backend unreachable — using cached data')}</span>
              </div>
            )}
            <button
              onClick={checkConnection}
              disabled={checking}
              className="ml-auto px-4 py-2 text-xs font-bold uppercase bg-surfaceHover border border-border rounded-lg hover:bg-border transition-colors text-text-primary"
            >
              {checking ? '...' : t('common.recheck', 'Re-check')}
            </button>
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted font-mono break-all">Endpoint: {currentEndpoint}</p>
        </div>

        {/* API Mode Toggle */}
        <div className="panel p-5 sm:p-6 space-y-4">
          <h3 className="text-xs sm:text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">{t('settings.dataSource', 'Data Source Mode')}</h3>
          <div className="flex items-center gap-4 flex-col sm:flex-row">
            <button
              onClick={() => {
                setApiMode('mock');
                showToast('Switched to Mock Engine (Offline Mode)', 'info');
              }}
              className={`w-full sm:flex-1 py-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                apiMode === 'mock' ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan shadow-glow' : 'bg-surfaceHover border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="font-bold text-base sm:text-lg">{t('settings.mockEngine', 'Mock Engine')}</span>
              <span className="text-xs">{t('settings.mockDesc', 'Offline demo mode')}</span>
            </button>
            <button
              onClick={() => {
                setApiMode('live');
                showToast('Switched to Live API Mode', 'success');
              }}
              className={`w-full sm:flex-1 py-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                apiMode === 'live' ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan shadow-glow' : 'bg-surfaceHover border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="font-bold text-base sm:text-lg">{t('settings.liveApi', 'Live API')}</span>
              <span className="text-xs">{t('settings.liveDesc', 'Connect to FastAPI backend')}</span>
            </button>
          </div>
        </div>

        {/* Appearance (Light / Dark Mode) */}
        <div className="panel p-5 sm:p-6 space-y-4">
          <h3 className="text-xs sm:text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">{t('settings.appearance', 'Appearance')}</h3>
          <p className="text-xs sm:text-sm text-text-secondary">{t('settings.appearanceDesc', 'Toggle between Dark Command-Center theme and Crisp Light theme.')}</p>
          <div className="flex items-center gap-4 flex-col sm:flex-row">
            <button
              onClick={() => {
                setTheme('dark');
                showToast('Activated Dark Mode', 'info');
              }}
              className={`w-full sm:flex-1 py-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                theme === 'dark' ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan shadow-glow' : 'bg-surfaceHover border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <Moon size={20} className="text-indigo-400" />
              <span className="font-bold text-sm sm:text-base">{t('settings.darkMode', 'Dark Mode')}</span>
            </button>
            <button
              onClick={() => {
                setTheme('light');
                showToast('Activated Light Mode', 'info');
              }}
              className={`w-full sm:flex-1 py-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                theme === 'light' ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan shadow-glow' : 'bg-surfaceHover border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <Sun size={20} className="text-amber-500" />
              <span className="font-bold text-sm sm:text-base">{t('settings.lightMode', 'Light Mode')}</span>
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="panel p-5 sm:p-6 space-y-4">
          <h3 className="text-xs sm:text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
            <Globe size={16} className="text-accent-cyan" />
            <span>{t('settings.languageSelect', 'System Language')}</span>
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary">{t('settings.languageDesc', 'Select preferred language for operational UI and citizen advisories.')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'en', label: 'English', sub: 'Default System Language' },
              { id: 'hi', label: 'हिंदी (Hindi)', sub: 'नागरिक एवं क्षेत्रीय भाषा' },
              { id: 'mr', label: 'मराठी (Marathi)', sub: 'प्रादेशिक भाषा' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => {
                  setLanguage(lang.id as Language);
                  showToast(`Language updated to ${lang.label}`, 'success');
                }}
                className={`py-3 px-4 rounded-xl border flex flex-col items-start gap-1 transition-all text-left ${
                  language === lang.id ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan shadow-xs font-bold' : 'bg-surfaceHover border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className="text-sm font-bold">{lang.label}</span>
                <span className="text-[11px] opacity-70 font-normal">{lang.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


