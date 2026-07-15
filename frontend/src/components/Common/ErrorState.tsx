import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ title = 'System Error', message = 'An error occurred while loading this module.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 h-full min-h-[200px] text-center bg-aqi-veryUnhealthy/5 rounded-xl border border-aqi-veryUnhealthy/20">
      <div className="w-12 h-12 rounded-full bg-aqi-veryUnhealthy/20 flex items-center justify-center mb-4 text-aqi-veryUnhealthy">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-secondary max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-xs font-semibold text-text-primary hover:bg-surfaceHover transition-colors"
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
