import React from 'react';

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full min-h-[400px]">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-20"></span>
        <div className="w-10 h-10 border-4 border-border border-t-accent-cyan rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-sm font-semibold text-text-secondary uppercase tracking-widest animate-pulse">
        Initializing Intelligence...
      </p>
    </div>
  );
}
