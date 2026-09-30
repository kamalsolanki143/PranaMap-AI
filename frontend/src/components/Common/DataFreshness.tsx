'use client';
import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';

interface DataFreshnessProps {
  lastUpdated?: string;
  sourceLabel?: string;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function DataFreshness({
  lastUpdated,
  sourceLabel = 'CPCB CAAQMS & Open-Meteo Feed',
  onRefresh,
  loading = false,
}: DataFreshnessProps) {
  const [timeAgo, setTimeAgo] = useState('Just now');

  useEffect(() => {
    if (lastUpdated) {
      setTimeAgo(lastUpdated);
    } else {
      const now = new Date();
      setTimeAgo(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    }
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-2 text-xs text-text-secondary">
      <Clock size={13} className="text-text-muted shrink-0" />
      <span>Updated: <strong className="text-text-primary font-medium">{timeAgo}</strong></span>
      <span className="text-border">•</span>
      <span className="text-text-muted hidden sm:inline truncate max-w-[200px]" title={sourceLabel}>{sourceLabel}</span>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="p-1 text-text-secondary hover:text-text-primary rounded hover:bg-surfaceHover transition-colors ml-1"
          title="Refresh environmental data"
          aria-label="Refresh data"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-brand-forest' : ''} />
        </button>
      )}
    </div>
  );
}
