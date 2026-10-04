'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  PieChart,
  ShieldAlert,
  Megaphone,
  Globe2,
  Database,
  Settings,
  LogOut,
  Activity,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n/LanguageContext';
import { useAppStore } from '@/store/useAppStore';

interface NavigationSidebarProps {
  onCloseDrawer?: () => void;
}

interface NavItem {
  href: string;
  aliases?: string[];
  labelKey: string;
  fallback: string;
  icon: any;
  badge?: string;
  badgeKey?: string;
}

export default function NavigationSidebar({ onCloseDrawer }: NavigationSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { t } = useTranslation();
  const { selectedCity } = useAppStore();

  const navItems: NavItem[] = [
    { href: '/dashboard', aliases: ['/command-center'], labelKey: 'nav.overview', fallback: 'Overview', icon: LayoutDashboard },
    { href: '/analytics', aliases: ['/air-quality'], labelKey: 'nav.airQuality', fallback: 'Air Quality', icon: BarChart3 },
    { href: '/forecast', labelKey: 'nav.forecast', fallback: 'Forecast', icon: TrendingUp },
    { href: '/attribution', labelKey: 'nav.sources', fallback: 'Sources', icon: PieChart },
    { href: '/enforcement', aliases: ['/interventions'], labelKey: 'nav.interventions', fallback: 'Interventions', icon: ShieldAlert },
    { href: '/advisory', aliases: ['/advisories'], labelKey: 'nav.advisory', fallback: 'Advisories', icon: Megaphone },
    { href: '/cities', labelKey: 'nav.indiaNetwork', fallback: 'India Network', icon: Globe2, badge: '9 Cities' },
    { href: '/data-sources', labelKey: 'nav.dataSources', fallback: 'Data Sources', icon: Database },
    { href: '/data-provenance', labelKey: 'nav.dataProvenance', fallback: 'Data Provenance', icon: ShieldCheck, badgeKey: 'status.truthTiers' },
    { href: '/settings', labelKey: 'nav.settings', fallback: 'Settings', icon: Settings },
  ];

  async function handleSignOut() {
    try {
      await signOut();
      if (onCloseDrawer) onCloseDrawer();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  function handleNavClick() {
    if (onCloseDrawer) onCloseDrawer();
  }

  function isItemActive(item: NavItem): boolean {
    if (pathname === item.href) return true;
    if (item.aliases?.includes(pathname)) return true;
    if (item.href !== '/dashboard' && pathname?.startsWith(item.href)) return true;
    return false;
  }

  return (
    <aside
      className="w-64 h-full bg-surface border-r border-border flex flex-col shrink-0 select-none"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Brand & Platform Identity */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-border bg-stone-50">
        <Link href="/dashboard" onClick={handleNavClick} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-forestSecondary/10 border border-forestSecondary/20 flex items-center justify-center text-forestSecondary">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-text-primary flex items-center gap-1.5">
              PRANAMAP AI
            </span>
            <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block">
              GovTech Intelligence
            </span>
          </div>
        </Link>
      </div>

      {/* Selected Scope Indicator */}
      <div className="px-4 py-2.5 bg-surfaceAlt border-b border-border flex items-center justify-between text-xs">
        <span className="text-text-muted font-medium">{t('header.activeAirshed', 'Active Airshed')}</span>
        <span className="font-semibold text-text-primary flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-forestSecondary" />
          {selectedCity?.name || 'Delhi NCR'}
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isItemActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                active
                  ? 'bg-forestSecondary text-white shadow-2xs font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surfaceHover'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} className={active ? 'text-white' : 'text-text-muted'} />
                <span>{t(item.labelKey, item.fallback)}</span>
              </div>

              {(item.badgeKey || item.badge) && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-surfaceAlt text-text-muted border border-border'
                  }`}
                >
                  {item.badgeKey ? t(item.badgeKey, item.badge || 'Truth Tiers') : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Sign Out */}
      <div className="p-3 border-t border-border bg-stone-50/50">
        <div className="flex items-center justify-between px-2 py-1 mb-2">
          <div className="truncate pr-2">
            <span className="block text-xs font-semibold text-text-primary truncate">
              {user?.displayName || user?.email?.split('@')[0] || 'Officer'}
            </span>
            <span className="block text-[10px] text-text-muted font-mono truncate">
              {user?.email || 'officer@pranamap.gov.in'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="p-1.5 text-text-muted hover:text-criticalTone hover:bg-red-50 rounded-md transition-colors cursor-pointer"
            title={t('nav.signOut', 'Sign out of workspace')}
            aria-label={t('nav.signOut', 'Sign out')}
          >
            <LogOut size={15} />
          </button>
        </div>

        <div className="px-2 pt-1 border-t border-border/60 flex items-center justify-between text-[10px] text-text-muted font-mono">
          <span>CPCB CAAQMS v2.4</span>
          <span className="text-forestSecondary font-semibold">{t('common.verified', 'Verified')}</span>
        </div>
      </div>
    </aside>
  );
}
