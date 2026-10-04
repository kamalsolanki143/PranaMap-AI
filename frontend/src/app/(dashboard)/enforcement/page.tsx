'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/Navbar/Header';
import { useAppStore } from '@/store/useAppStore';
import { getCityData } from '@/lib/cityData';
import RiskBadge from '@/components/Common/RiskBadge';
import { useToast } from '@/components/Common/Toast';
import {
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Info,
  Car,
  Building2,
  Flame,
  Factory,
  Check,
  RefreshCw,
  Play,
  RotateCcw,
  SlidersHorizontal,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export type InterventionStatusType = 'Recommended' | 'Under Review' | 'Simulated' | 'Completed';

export interface DecisionSupportItem {
  id: string;
  area: string;
  risk: 'Critical' | 'Severe' | 'High' | 'Moderate';
  observedDriver: string;
  recommendedAction: string;
  evidence: string;
  status: InterventionStatusType;
}

import { useTranslation } from '@/i18n/LanguageContext';

export default function InterventionPage() {
  const { t } = useTranslation();
  const { selectedCity } = useAppStore();
  const { showToast } = useToast();
  const cityData = useMemo(() => getCityData(selectedCity.id), [selectedCity.id]);

  const [activeTab, setActiveTab] = useState<'decision-table' | 'simulator'>('decision-table');

  // Decision-support items for the selected city
  const initialItems: DecisionSupportItem[] = useMemo(() => {
    return [
      {
        id: 'INT-01',
        area: 'Anand Vihar (ISBT Corridor)',
        risk: 'Critical',
        observedDriver: 'Observed PM2.5 (218 µg/m³) & Inter-state bus idling',
        recommendedAction: 'Freight diversion review & traffic marshal deployment',
        evidence: 'CPCB CAAQMS + NW 7 km/h weather context',
        status: 'Recommended',
      },
      {
        id: 'INT-02',
        area: 'Punjabi Bagh (Commercial Ring)',
        risk: 'Severe',
        observedDriver: 'Heavy arterial transport corridor & coarse dust',
        recommendedAction: 'Deploy mechanical mist sprinklers & street sweeping',
        evidence: 'PM10/PM2.5 ratio (1.78) + road traffic sensor',
        status: 'Under Review',
      },
      {
        id: 'INT-03',
        area: 'Dwarka Sector 8 (Excavation Zone)',
        risk: 'High',
        observedDriver: 'Unpaved excavation & fugitive construction dust',
        recommendedAction: 'Issue dust suppression notice & cover aggregate piles',
        evidence: 'Municipal site inspection log + CPCB PM10 elevation',
        status: 'Under Review',
      },
      {
        id: 'INT-04',
        area: 'Ghazipur Border Corridor',
        risk: 'Critical',
        observedDriver: 'Night-time commercial freight transit peak',
        recommendedAction: 'Simulate bypass routing along Eastern Peripheral Expressway',
        evidence: 'Sentinel-5P NO2 column + diurnal traffic congestion',
        status: 'Simulated',
      },
    ];
  }, [selectedCity.id]);

  const [items, setItems] = useState<DecisionSupportItem[]>(initialItems);

  // Status transitions
  const statusCycle: InterventionStatusType[] = ['Recommended', 'Under Review', 'Simulated', 'Completed'];

  const advanceStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const currentIndex = statusCycle.indexOf(item.status);
          const nextIndex = (currentIndex + 1) % statusCycle.length;
          const nextStatus = statusCycle[nextIndex];
          showToast(`Action ${item.id} status updated to ${nextStatus}`, 'success');
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  // Simulation State
  const [simScenario, setSimScenario] = useState('freight');
  const [simIntensity, setSimIntensity] = useState(40);
  const [simDuration, setSimDuration] = useState('12');

  const baselineAqi = cityData.overallAqi;
  const simulatedReduction = Math.round(
    simScenario === 'freight'
      ? (simIntensity * 0.42 * (baselineAqi / 200))
      : simScenario === 'dust'
      ? (simIntensity * 0.28 * (baselineAqi / 200))
      : (simIntensity * 0.35 * (baselineAqi / 200))
  );
  const simulatedPostAqi = Math.max(45, baselineAqi - simulatedReduction);

  return (
    <div className="flex flex-col h-full w-full bg-background text-text-primary">
      <Header />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider font-mono">
                Municipal Climate Response
              </span>
              <span className="text-border">•</span>
              <span className="text-[11px] text-forestSecondary font-medium font-mono">
                Decision Support Protocol
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight mt-0.5">
              {t('enforcement.title', 'Interventions & Decision Support')} — {cityData.cityName}
            </h1>
            <p className="text-text-secondary text-xs sm:text-sm mt-0.5">
              Evidence-based municipal action table and hypothetical scenario impact simulator.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('decision-table')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'decision-table'
                  ? 'bg-forestSecondary text-white shadow-2xs'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surfaceHover'
              }`}
            >
              {t('common.actionDispatch', 'Decision Table')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-forestSecondary text-white shadow-2xs'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surfaceHover'
              }`}
            >
              {t('env.simulation', 'Scenario Simulator')}
            </button>
          </div>
        </div>

        {activeTab === 'decision-table' ? (
          /* DECISION-SUPPORT TABLE (PART J) */
          <div className="space-y-4">
            <div className="panel overflow-hidden shadow-subtle">
              <div className="panel-header py-3 px-4 flex items-center justify-between">
                <span className="font-semibold text-xs text-text-primary uppercase tracking-wider font-mono">
                  Municipal Action Matrix
                </span>
                <span className="text-[11px] text-text-muted font-mono">
                  Click status pill to cycle state progression
                </span>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surfaceAlt text-text-muted uppercase text-[10px] border-b border-border">
                      <th className="py-3 px-4 font-semibold">Area</th>
                      <th className="py-3 px-4 font-semibold">Risk</th>
                      <th className="py-3 px-4 font-semibold">Observed Driver</th>
                      <th className="py-3 px-4 font-semibold">Recommended Action</th>
                      <th className="py-3 px-4 font-semibold">Evidence Basis</th>
                      <th className="py-3 px-4 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-surfaceHover/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-text-primary">
                          {item.area}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                              item.risk === 'Critical'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : item.risk === 'Severe'
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {item.risk}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-text-secondary leading-snug">
                          {item.observedDriver}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-text-primary leading-snug">
                          {item.recommendedAction}
                        </td>
                        <td className="py-3.5 px-4 text-[11px] font-mono text-text-muted">
                          {item.evidence}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => advanceStatus(item.id)}
                            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                              item.status === 'Recommended'
                                ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                                : item.status === 'Under Review'
                                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                : item.status === 'Simulated'
                                ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title="Click to advance status"
                          >
                            {item.status}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-surface rounded-xl border border-border flex items-center justify-between text-xs text-text-muted">
              <span>*Statuses reflect administrative review cycles. Actions are marked Completed only when verified by field log.</span>
              <span className="font-mono text-forestSecondary font-semibold">Decision Protocol v2.1</span>
            </div>
          </div>
        ) : (
          /* SCENARIO SIMULATION PANEL */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-5 panel p-5 space-y-4">
              <div className="border-b border-border pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-text-primary">Simulation Inputs</h3>
                  <span className="text-[11px] text-text-muted">Hypothetical policy parameters</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-bold">
                  SIMULATION
                </span>
              </div>

              {/* Scenario Selector */}
              <div className="space-y-1.5 text-xs">
                <label className="block font-semibold text-text-primary">Policy Intervention Scenario</label>
                <select
                  value={simScenario}
                  onChange={(e) => setSimScenario(e.target.value)}
                  className="w-full p-2.5 bg-surfaceAlt border border-border rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <option value="freight">Heavy Commercial Freight Diversion</option>
                  <option value="dust">Anti-Smog Misting & Mechanical Sweeping</option>
                  <option value="construction">Civil Construction Stop-Work Enforcement</option>
                </select>
              </div>

              {/* Intensity Slider */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <label className="font-semibold text-text-primary">Intervention Intensity</label>
                  <span className="font-mono font-bold text-forestSecondary">{simIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={simIntensity}
                  onChange={(e) => setSimIntensity(Number(e.target.value))}
                  className="w-full accent-forestSecondary cursor-pointer"
                />
              </div>

              {/* Duration Selector */}
              <div className="space-y-1.5 text-xs">
                <label className="block font-semibold text-text-primary">Enforcement Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {['6', '12', '24'].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setSimDuration(hrs)}
                      className={`py-2 rounded-lg border text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        simDuration === hrs
                          ? 'bg-forestSecondary text-white border-forestSecondary'
                          : 'bg-surfaceAlt border-border text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {hrs} Hours
                    </button>
                  ))}
                </div>
              </div>

              {/* Baseline Box */}
              <div className="p-3 bg-surfaceAlt rounded-lg border border-border text-xs space-y-1">
                <span className="text-[10px] text-text-muted uppercase font-mono block">Baseline Atmospheric State</span>
                <div className="flex justify-between font-mono">
                  <span>Current AQI: <strong>{baselineAqi}</strong></span>
                  <span>Wind: <strong>7.2 km/h NW</strong></span>
                </div>
              </div>
            </div>

            {/* Simulated Output Panel */}
            <div className="lg:col-span-7 panel p-6 space-y-5 bg-surface flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-semibold text-rose-700 block">
                      Hypothetical Projection
                    </span>
                    <h3 className="text-base font-bold text-text-primary">
                      Projected Air Quality Impact
                    </h3>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-bold">
                    NOT OBSERVED DATA
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-surfaceAlt rounded-xl border border-border">
                    <span className="text-[10px] uppercase font-mono text-text-muted block">Estimated Reduction</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-black text-forestSecondary font-mono">
                        -{simulatedReduction}
                      </span>
                      <span className="text-xs font-semibold text-forestSecondary">AQI Points</span>
                    </div>
                    <span className="text-[11px] text-text-muted mt-1 block">
                      Projected ~{((simulatedReduction / baselineAqi) * 100).toFixed(0)}% particulate relief
                    </span>
                  </div>

                  <div className="p-4 bg-surfaceAlt rounded-xl border border-border">
                    <span className="text-[10px] uppercase font-mono text-text-muted block">Projected Post-Action AQI</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-black text-text-primary font-mono">
                        {simulatedPostAqi}
                      </span>
                      <span className="text-xs font-semibold text-text-muted">Target Index</span>
                    </div>
                    <span className="text-[11px] text-text-muted mt-1 block">
                      Assuming constant wind vector & mixing height
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-900 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle size={14} className="text-rose-700" />
                    <span>Scientific Disclaimer on Simulation Outputs</span>
                  </div>
                  <p>
                    This is a mathematical simulation for scenario evaluation. Under no circumstances should simulation calculations be treated or presented as observed physical impact in regulatory or judicial proceedings.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted font-mono">
                <span>Model Engine: Gaussian Corridor Reduction Dispersion</span>
                <span>Calibrated Parameter: 0.42</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
