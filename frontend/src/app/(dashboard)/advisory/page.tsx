'use client';
import React, { useCallback } from 'react';
import Header from '@/components/Navbar/Header';
import { useApiData } from '@/hooks/useApiData';
import { fetchAdvisory } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/components/Common/Toast';
import { Send, FileText } from 'lucide-react';

export default function AdvisoryPage() {
  const { language, setLanguage } = useAppStore();
  const { showToast } = useToast();

  const fetchFn = useCallback((mode: 'live' | 'mock') => {
    const langMap: Record<string, string> = { en: 'ENGLISH', hi: 'HINDI', mr: 'MARATHI' };
    return fetchAdvisory(mode, langMap[language] || 'ENGLISH');
  }, [language]);

  const { data, loading } = useApiData(fetchFn, [language]);

  function handleBroadcastSMS(wardName: string) {
    showToast(`SMS broadcast queued for ${wardName}`, 'success');
  }

  function handleExportPDF() {
    window.print();
  }

  if (loading || !data) {
    return (
      <div className="flex flex-col h-full w-full">
        <Header />
        <div className="flex-1 p-6 space-y-6 animate-pulse">
          <div className="h-10 w-64 bg-surface rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-surface rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Citizen Health Advisories</h1>
            <p className="text-text-secondary text-sm mt-1">
              Reach: {data.total_sms} SMS • {data.app_reach} App • {data.delivery_rate}% delivery
            </p>
          </div>
          <div className="flex bg-surfaceHover border border-border rounded-lg p-1">
            <button onClick={() => setLanguage('en')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-surface text-text-primary shadow' : 'text-text-muted hover:text-text-secondary'}`}>English</button>
            <button onClick={() => setLanguage('hi')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${language === 'hi' ? 'bg-surface text-text-primary shadow' : 'text-text-muted hover:text-text-secondary'}`}>हिंदी</button>
            <button onClick={() => setLanguage('mr')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${language === 'mr' ? 'bg-surface text-text-primary shadow' : 'text-text-muted hover:text-text-secondary'}`}>मराठी</button>
          </div>
        </div>

        {/* Advisory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.advisories.map((adv) => (
            <div key={adv.id} className="panel p-6 flex flex-col gap-4 hover:border-accent-cyan/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-surfaceHover border border-border text-xs font-bold text-text-primary uppercase tracking-wider">{adv.ward}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  adv.status === 'Severe' ? 'bg-aqi-hazardous/10 text-aqi-hazardous border border-aqi-hazardous/20' :
                  adv.status === 'Very Poor' ? 'bg-aqi-veryUnhealthy/10 text-aqi-veryUnhealthy border border-aqi-veryUnhealthy/20' :
                  'bg-aqi-sensitive/10 text-aqi-sensitive border border-aqi-sensitive/20'
                }`}>
                  AQI {adv.aqi} • {adv.status}
                </span>
              </div>

              <div className="p-4 bg-surfaceHover/50 border border-border rounded-lg border-l-4 border-l-accent-cyan">
                <p className="text-sm text-text-primary leading-relaxed">{adv.ai_message}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {adv.audience_tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 font-bold uppercase">{tag}</span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>SMS: {adv.sms_status}</span>
                <span>•</span>
                <span>App: {adv.app_status}</span>
                <span>•</span>
                <span>{adv.updated_ago}</span>
              </div>

              <div className="mt-auto flex gap-3 pt-4 border-t border-border">
                <button onClick={handleExportPDF} className="flex-1 py-2 bg-surfaceHover hover:bg-border text-sm font-semibold text-text-primary rounded-lg transition-colors flex items-center justify-center gap-2">
                  <FileText size={14} /> Export PDF
                </button>
                <button onClick={() => handleBroadcastSMS(adv.ward)} className="flex-1 py-2 bg-accent-cyan/10 hover:bg-accent-cyan/20 text-sm font-semibold text-accent-cyan rounded-lg transition-colors border border-accent-cyan/20 flex items-center justify-center gap-2">
                  <Send size={14} /> Broadcast SMS
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Log */}
        <div className="panel">
          <div className="panel-header"><span>Activity Log</span></div>
          <div className="p-4 space-y-2">
            {data.log.map((entry, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-border last:border-0 text-sm">
                <span className={`w-2 h-2 rounded-full shrink-0 ${entry.result === 'SUCCESS' ? 'bg-aqi-good' : 'bg-aqi-sensitive'}`} />
                <span className="text-text-secondary flex-1">{entry.message}</span>
                <span className="text-text-muted text-xs">{entry.time}</span>
                <span className={`text-xs font-bold uppercase ${entry.result === 'SUCCESS' ? 'text-aqi-good' : 'text-aqi-sensitive'}`}>{entry.result}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
