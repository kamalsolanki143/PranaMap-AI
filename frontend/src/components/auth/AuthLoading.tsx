'use client';

import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

interface AuthLoadingProps {
  message?: string;
  className?: string;
}

export default function AuthLoading({
  message = 'Resolving authoritative environmental credentials...',
  className = '',
}: AuthLoadingProps) {
  return (
    <div className={`h-screen w-full flex flex-col items-center justify-center bg-background text-text-primary px-4 ${className}`}>
      <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 shadow-card flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-xl bg-forestSecondary/10 border border-forestSecondary/20 flex items-center justify-center text-forestSecondary mb-4">
          <Activity className="w-7 h-7 animate-pulse" />
        </div>

        <h2 className="text-lg font-semibold text-text-primary mb-1">
          PranaMap AI
        </h2>
        <p className="text-xs text-text-secondary uppercase tracking-wider font-mono mb-6">
          Environmental Intelligence Platform
        </p>

        <div className="w-full bg-surfaceAlt h-1.5 rounded-full overflow-hidden mb-4 border border-border">
          <div className="bg-forestSecondary h-full w-2/5 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full" />
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <ShieldCheck className="w-4 h-4 text-forestSecondary" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
