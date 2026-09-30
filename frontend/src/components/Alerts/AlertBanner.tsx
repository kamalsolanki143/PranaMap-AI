import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

export default function AlertBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-rose-50 to-surface border border-rose-200 rounded-lg p-3 flex items-start sm:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 bg-rose-100 rounded-md shrink-0">
          <ShieldAlert size={20} className="text-rose-700" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-text-primary uppercase tracking-wide">High Risk Alert: Ward A & B</h4>
          <p className="text-xs text-text-secondary mt-0.5">
            PM2.5 levels projected to exceed 250 AQI in the next 4 hours due to thermal inversion and stagnant winds.
            <span className="text-brand-forest ml-2 cursor-pointer hover:underline font-semibold">View Intervention Protocols</span>
          </p>
        </div>
      </div>
      <button className="text-text-muted hover:text-text-primary p-1 shrink-0 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
}
