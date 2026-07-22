'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const navItems = [
  { label: "Platform", href: "platform" },
  { label: "Solutions", href: "solutions" },
  { label: "Cities", href: "cities" },
  { label: "Advisory", href: "advisory" },
];

export default function LandingNavbar() {
  const [activeSection, setActiveSection] = useState("platform");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track which section is in view using IntersectionObserver
  useEffect(() => {
    const sections = navItems.map(item => document.getElementById(item.href)).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );

    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <nav
        className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20"
        role="navigation"
        aria-label="Main navigation"
        style={{
          background: "rgba(16,20,25,0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded flex items-center justify-center"
            style={{ background: "rgba(0,245,255,0.12)", border: "1px solid rgba(0,245,255,0.25)" }}
          >
            <span className="material-symbols-outlined text-lg" style={{ color: "#00f5ff", fontVariationSettings: "'FILL' 1" }}>eco</span>
          </div>
          <span className="font-bold tracking-tight" style={{ color: "#00f5ff", fontSize: "20px", textShadow: "0 0 12px rgba(0,245,255,0.4)" }}>PranaMap AI</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.href)}
              className="font-inter text-sm transition-colors hover:text-[#00f5ff] bg-transparent border-none cursor-pointer"
              style={{
                color: activeSection === item.href ? "#00f5ff" : "rgba(185,202,202,0.7)",
                borderBottom: activeSection === item.href ? "2px solid #00f5ff" : "2px solid transparent",
                paddingBottom: "4px",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
        </button>

        <Link
          href="/login"
          className="hidden md:inline-flex font-bold uppercase text-xs px-6 py-3 rounded transition-all hover:brightness-110 active:scale-95"
          style={{ background: "#00f5ff", color: "#003739", letterSpacing: "0.06em", boxShadow: "0 0 15px rgba(0,245,255,0.3)" }}
        >
          Launch Command Center
        </Link>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed top-20 left-0 right-0 z-40 md:hidden p-4" style={{ background: "rgba(16,20,25,0.95)", backdropFilter: "blur(20px)" }}>
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => { scrollTo(item.href); setMobileMenuOpen(false); }}
                className="text-left text-sm py-2 hover:text-[#00f5ff] bg-transparent border-none cursor-pointer"
                style={{ color: activeSection === item.href ? "#00f5ff" : "rgba(255,255,255,0.7)" }}
              >
                {item.label}
              </button>
            ))}
            <Link href="/login" className="mt-2 text-center font-bold uppercase text-xs px-6 py-3 rounded" style={{ background: "#00f5ff", color: "#003739" }}>
              Launch Command Center
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
