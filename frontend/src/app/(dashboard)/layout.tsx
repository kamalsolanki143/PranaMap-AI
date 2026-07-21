'use client';
import React, { useState } from 'react';
import NavigationSidebar from '@/components/Sidebar/NavigationSidebar';
import { ToastProvider } from '@/components/Common/Toast';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="h-screen w-full overflow-hidden flex relative">
        {/* Skip to content */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-accent-cyan focus:text-surface focus:rounded">
          Skip to content
        </a>

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-[60] p-2 bg-surface border border-border rounded-lg shadow-panel"
          aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
        >
          {sidebarOpen ? <X size={20} className="text-text-primary" /> : <Menu size={20} className="text-text-primary" />}
        </button>

        {/* Sidebar - hidden on mobile by default */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-50 transition-transform duration-300 ease-in-out h-full`}>
          <NavigationSidebar />
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main id="main-content" className="flex-1 flex flex-col h-full overflow-hidden">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
