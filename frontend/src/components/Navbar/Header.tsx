'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RefreshCw, Globe, User, LogOut, Settings, ShieldCheck, ChevronDown } from 'lucide-react';
import { useToast } from '@/components/Common/Toast';
import { healthCheck } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';
import { useAuth } from '@/context/AuthContext';
import CitySelector from '@/components/Common/CitySelector';
import StatusBadge from '@/components/Common/StatusBadge';

interface HeaderProps {
  onRefresh?: () => void;
  onToggleSidebar?: () => void;
}

export default function Header({ onRefresh }: HeaderProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { dataStatus, setDataStatus } = useAppStore();
  const { language, setLanguage, t } = useTranslation();
  const { user, signOut } = useAuth();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST'
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    healthCheck().then((res) => {
      if (res.healthy) {
        setDataStatus('LIVE');
      } else {
        setDataStatus('CACHED');
      }
    });
  }, [setDataStatus]);

  async function handleRefresh() {
    setIsRefreshing(true);
    showToast(t('common.refresh', 'Refreshing environmental sensor telemetry...'), 'info');
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      router.push('/login');
    } catch (err) {
      showToast('Error signing out', 'error');
    }
  }

  // User display metadata
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Officer';
  const displayEmail = user?.email || 'officer@pranamap.gov.in';
  const providerId = user?.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email/Password';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-3 sm:px-5 shrink-0 z-10 relative pl-14 lg:pl-5 transition-colors">
      {/* City Selector & Jurisdictional Scope */}
      <div className="flex items-center gap-3">
        <CitySelector />
        {currentTime && (
          <span className="text-xs text-text-muted font-mono hidden md:inline border-l border-border pl-3">
            {currentTime}
          </span>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time Data Freshness Badge */}
        <StatusBadge status={dataStatus} />

        {/* Multilingual Selector */}
        <div
          className="flex items-center gap-0.5 border border-border p-0.5 rounded-md text-xs bg-surfaceAlt"
          role="group"
          aria-label="Language options"
        >
          <Globe size={13} className="text-text-muted ml-1.5 hidden sm:inline" aria-hidden="true" />
          {([
            { code: 'en', label: 'EN', name: 'English' },
            { code: 'hi', label: 'हि', name: 'Hindi' },
            { code: 'mr', label: 'मराठी', name: 'Marathi' },
          ] as { code: Language; label: string; name: string }[]).map(({ code, label, name }) => (
            <button
              key={code}
              type="button"
              onClick={() => setLanguage(code)}
              aria-label={`Switch to ${name}`}
              aria-pressed={language === code}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                language === code
                  ? 'bg-forestSecondary text-white shadow-2xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title={`Switch language to ${name}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1.5 text-text-secondary hover:text-text-primary border border-border rounded-md hover:bg-surfaceHover transition-colors cursor-pointer"
          title="Refresh environmental telemetry"
          aria-label="Refresh telemetry"
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-forestSecondary' : ''} />
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 pr-2 py-1 rounded-lg border border-border hover:bg-surfaceHover transition-colors cursor-pointer"
            aria-label="User profile options"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                className="w-6 h-6 rounded-full object-cover border border-forestSecondary/30"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-forestSecondary/15 text-forestSecondary font-bold text-xs flex items-center justify-center border border-forestSecondary/30">
                {initial}
              </div>
            )}
            <span className="text-xs font-semibold text-text-primary max-w-[100px] truncate hidden sm:inline">
              {displayName}
            </span>
            <ChevronDown size={13} className="text-text-muted" />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-card p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 border-b border-border mb-1">
                <p className="text-xs font-bold text-text-primary truncate">{displayName}</p>
                <p className="text-[11px] text-text-muted truncate font-mono">{displayEmail}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surfaceAlt border border-border text-forestSecondary font-semibold">
                    {providerId} Auth
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">Verified</span>
                </div>
              </div>

              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surfaceHover transition-colors"
              >
                <Settings size={14} />
                <span>{t('nav.settings', 'Settings')}</span>
              </Link>

              <Link
                href="/data-provenance"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surfaceHover transition-colors"
              >
                <ShieldCheck size={14} />
                <span>{t('nav.dataProvenance', 'Data Provenance')}</span>
              </Link>

              <div className="border-t border-border my-1" />

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-criticalTone hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>{t('nav.signOut', 'Sign Out')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
