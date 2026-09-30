'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Menu, X, ArrowRight, ShieldCheck, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { label: 'Overview', href: 'overview' },
  { label: 'Process', href: 'process' },
  { label: 'Resolution', href: 'resolution' },
  { label: 'India Network', href: 'network' },
  { label: 'Data Sources', href: 'sources' },
  { label: '3D Airshed', href: 'airshed-3d' },
  { label: 'Provenance', href: 'provenance' },
];

export default function LandingNavbar() {
  const { isAuthenticated, user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const sections = navItems
      .map((item) => document.getElementById(item.href))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  function scrollTo(id: string) {
    setActiveSection(id);
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 flex justify-between items-center px-4 sm:px-6 lg:px-10 h-16 border-b transition-all duration-200 ${
          scrolled
            ? 'bg-surface/95 backdrop-blur-md border-border shadow-subtle'
            : 'bg-surface border-border'
        }`}
        role="navigation"
        aria-label="Main landing navigation"
      >
        {/* Brand identity */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-forestSecondary/10 border border-forestSecondary/20 flex items-center justify-center text-forestSecondary">
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-text-primary flex items-center gap-1.5">
              PRANAMAP AI
            </span>
            <span className="text-[10px] text-text-muted leading-none hidden sm:inline font-mono">
              Environmental Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden lg:flex items-center gap-1 px-3 py-1 rounded-full bg-surfaceAlt border border-border text-xs font-medium text-text-secondary">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => scrollTo(item.href)}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeSection === item.href
                  ? 'bg-forestSecondary text-white font-semibold shadow-2xs'
                  : 'hover:text-text-primary hover:bg-surface'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right CTA / Auth Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            href="/data-provenance"
            className="text-xs font-medium text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg border border-border hover:bg-surfaceHover transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck size={14} className="text-forestSecondary" />
            <span>Data Provenance</span>
          </Link>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-white bg-forestSecondary hover:bg-forestPrimary px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-subtle"
            >
              <span>Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium text-text-primary hover:text-forestSecondary px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="text-xs font-semibold text-white bg-forestSecondary hover:bg-forestPrimary px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-subtle"
              >
                <span>Launch Platform</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg border border-border cursor-pointer"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-surface/98 backdrop-blur-md border-b border-border flex flex-col p-6 space-y-4 lg:hidden">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => scrollTo(item.href)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
                  activeSection === item.href
                    ? 'bg-forestSecondary text-white font-semibold'
                    : 'text-text-primary hover:bg-surfaceAlt'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <Link
              href="/data-provenance"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-border text-sm font-medium text-text-primary"
            >
              <ShieldCheck size={16} className="text-forestSecondary" />
              <span>Data Provenance & Truth Tiers</span>
            </Link>

            <Link
              href={isAuthenticated ? '/dashboard' : '/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-forestSecondary text-white text-sm font-semibold shadow-subtle"
            >
              <span>{isAuthenticated ? 'Go to Command Center' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
