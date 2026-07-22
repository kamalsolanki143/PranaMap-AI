'use client';
import React, { useState, useEffect } from 'react';
import { MapPin, RefreshCw, Wind, AlertTriangle, Sun, Moon, Globe } from 'lucide-react';
import { useToast } from '@/components/Common/Toast';
import { healthCheck } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/ThemeContext';
import { useTranslation } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';

interface HeaderProps {
  onRefresh?: () => void;
  onToggleSidebar?: () => void;
}

export default function Header({ onRefresh }: HeaderProps) {
  const { showToast } = useToast();
  const { apiMode } = useAppStore();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    healthCheck().then(res => setIsBackendHealthy(res.healthy));
  }, []);

  function handleRefresh() {
    showToast(t('common.refresh', 'Refreshing live air quality data...'), 'info');
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  }

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 relative pl-14 lg:pl-6 transition-colors">
      {/* Location Context */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 text-text-primary bg-surfaceHover px-2.5 py-1.5 rounded-md border border-border">
          <MapPin size={16} className="text-accent-cyan shrink-0" />
          <span className="font-semibold text-xs sm:text-sm hidden sm:inline">{t('header.region', 'Delhi NCR Region')}</span>
          <span className="font-semibold text-xs sm:hidden">{t('header.regionShort', 'Delhi')}</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary text-xs sm:text-sm hidden xl:flex">
          <Wind size={16} />
          <span>NW 12 km/h</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Critical Alert Badge */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm bg-aqi-veryUnhealthy/10 border border-aqi-veryUnhealthy/30 px-2.5 py-1.5 rounded-md text-aqi-veryUnhealthy animate-pulse hidden md:flex">
          <AlertTriangle size={15} />
          <span className="font-medium">{t('header.criticalAlert', '2 Wards Critical')}</span>
        </div>

        {/* Quick Language Selector */}
        <div className="flex items-center gap-1 bg-surfaceHover/80 border border-border p-1 rounded-md text-xs">
          <Globe size={14} className="text-text-muted ml-1 hidden sm:inline" />
          {(['en', 'hi', 'mr'] as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                language === lang
                  ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-text-secondary hover:text-text-primary bg-surfaceHover/80 border border-border rounded-md transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-600" />}
        </button>

        {/* Connection & Refresh */}
        <div className="flex items-center gap-2 sm:gap-3 border-l border-border pl-3 sm:pl-4">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isBackendHealthy ? 'bg-aqi-good' : 'bg-aqi-sensitive'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isBackendHealthy ? 'bg-aqi-good' : 'bg-aqi-sensitive'}`} />
            </span>
            <span className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold hidden md:inline">
              {apiMode === 'live' ? (isBackendHealthy ? t('common.live', 'Live API') : t('common.fallback', 'Fallback')) : t('common.mock', 'Mock Engine')}
            </span>
          </div>
          <button onClick={handleRefresh} className="text-text-muted hover:text-text-primary transition-colors p-1" aria-label="Refresh data" title={t('common.refresh', 'Refresh Data')}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}


