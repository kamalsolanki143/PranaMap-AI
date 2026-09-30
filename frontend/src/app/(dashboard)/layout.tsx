'use client';
import React, { useState } from 'react';
import NavigationSidebar from '@/components/Sidebar/NavigationSidebar';
import { ToastProvider } from '@/components/Common/Toast';
import AuthGuard from '@/components/auth/AuthGuard';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <AuthGuard>
        <div className="h-screen w-full overflow-hidden flex relative bg-background text-text-primary">
          {/* Skip to content */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-forestSecondary focus:text-white focus:rounded-md shadow-card"
          >
            Skip to content
          </a>

          {/* Mobile / Tablet sidebar drawer toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed top-3 left-3 z-[60] p-2 bg-surface/90 backdrop-blur border border-border rounded-lg shadow-subtle text-text-primary hover:bg-surfaceHover transition-colors cursor-pointer"
            aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Sidebar drawer */}
          <div
            className={`${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 fixed lg:relative z-50 transition-transform duration-300 ease-in-out h-full shrink-0`}
          >
            <NavigationSidebar onCloseDrawer={() => setSidebarOpen(false)} />
          </div>

          {/* Overlay for mobile / tablet when drawer is open */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <main id="main-content" className="flex-1 flex flex-col h-full overflow-hidden w-full">
            {children}
          </main>
        </div>
      </AuthGuard>
    </ToastProvider>
  );
}
