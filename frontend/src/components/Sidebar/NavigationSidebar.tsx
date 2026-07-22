'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Map, Activity, Bell, Search, Settings, LogOut, Filter } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/i18n/LanguageContext';

interface NavigationSidebarProps {
  onCloseDrawer?: () => void;
}

export default function NavigationSidebar({ onCloseDrawer }: NavigationSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const { t } = useTranslation();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('nav.commandCenter', 'Command Center') },
    { href: '/forecast', icon: Activity, label: t('nav.forecasting', 'Forecasting') },
    { href: '/attribution', icon: Map, label: t('nav.attribution', 'Attribution') },
    { href: '/enforcement', icon: Bell, label: t('nav.enforcement', 'Enforcement') },
    { href: '/advisory', icon: Search, label: t('nav.advisories', 'Advisories') },
  ];

  function handleSignOut() {
    logout();
    if (onCloseDrawer) onCloseDrawer();
    router.push('/');
  }

  function handleNavClick() {
    if (onCloseDrawer) onCloseDrawer();
  }

  return (
    <aside className="w-64 h-full bg-surface border-r border-border flex flex-col shrink-0" role="navigation" aria-label="Dashboard navigation">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/dashboard" onClick={handleNavClick} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-cyan flex items-center justify-center shadow-glow">
            <Activity className="w-5 h-5 text-surface font-bold" />
          </div>
          <span className="font-bold tracking-wider text-lg text-text-primary">PranaMap<span className="text-accent-cyan">AI</span></span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        <div className="space-y-2">
          <p className="px-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{t('nav.section.intelligence', 'Intelligence')}</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                    : 'text-text-secondary hover:bg-surfaceHover hover:text-text-primary'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-glow" />}
              </Link>
            );
          })}
        </div>

        {/* Ward Filters */}
        <div className="space-y-3">
          <p className="px-2 text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>{t('nav.section.wardFilters', 'Ward Filters')}</span>
            <Filter size={14} className="text-text-muted" />
          </p>
          <div className="flex flex-col gap-1 px-2">
            <div className="flex items-center gap-2 py-1.5 text-sm text-text-secondary hover:text-text-primary cursor-pointer transition-colors group">
              <div className="w-2 h-2 rounded-full bg-aqi-veryUnhealthy group-hover:shadow-[0_0_8px_rgba(190,18,60,0.6)] transition-shadow" />
              <span>Ward A (South)</span>
            </div>
            <div className="flex items-center gap-2 py-1.5 text-sm text-text-secondary hover:text-text-primary cursor-pointer transition-colors group">
              <div className="w-2 h-2 rounded-full bg-aqi-unhealthy group-hover:shadow-[0_0_8px_rgba(239,68,68,0.6)] transition-shadow" />
              <span>Ward C (Central)</span>
            </div>
            <div className="flex items-center gap-2 py-1.5 text-sm text-text-secondary hover:text-text-primary cursor-pointer transition-colors group">
              <div className="w-2 h-2 rounded-full bg-aqi-moderate group-hover:shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-shadow" />
              <span>Ward D (West)</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-1">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-md mb-2 bg-surfaceHover/50">
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-accent-cyan/15 border border-accent-cyan/30 text-accent-cyan text-xs font-bold">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text-primary truncate">{user.name}</p>
              <p className="text-[10px] text-text-muted truncate">{user.email}</p>
            </div>
          </div>
        )}
        <Link
          href="/settings"
          onClick={handleNavClick}
          aria-current={pathname === '/settings' ? 'page' : undefined}
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
            pathname === '/settings' ? 'text-accent-cyan bg-accent-cyan/10' : 'text-text-secondary hover:text-text-primary hover:bg-surfaceHover'
          }`}
        >
          <Settings size={18} />
          <span>{t('nav.settings', 'Settings')}</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors w-full"
          aria-label="Sign out"
        >
          <LogOut size={18} />
          <span>{t('nav.signOut', 'Sign Out')}</span>
        </button>
      </div>
    </aside>
  );
}

