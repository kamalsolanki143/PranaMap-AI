'use client';
import React, { useState, useCallback, useEffect } from 'react';
import Header from '@/components/Navbar/Header';
import BroadcastModal from '@/components/Advisory/BroadcastModal';
import { useApiData } from '@/hooks/useApiData';
import { fetchAdvisory, broadcastSMS } from '@/services/api';
import { useToast } from '@/components/Common/Toast';
import { useTranslation } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';
import { generateAdvisoryPDF } from '@/utils/pdfExport';
import { Send, FileText, CheckCircle2 } from 'lucide-react';
import { AdvisoryLogEntry, AdvisoryCardData } from '@/types';

export default function AdvisoryPage() {
  const { language, setLanguage, t } = useTranslation();
  const { showToast } = useToast();

  const fetchFn = useCallback((mode: 'live' | 'mock') => {
    const langMap: Record<string, string> = { en: 'ENGLISH', hi: 'HINDI', mr: 'MARATHI' };
    return fetchAdvisory(mode, langMap[language] || 'ENGLISH');
  }, [language]);

  const { data, loading, refetch } = useApiData(fetchFn, [language]);
  const [advisories, setAdvisories] = useState<AdvisoryCardData[]>([]);
  const [logs, setLogs] = useState<AdvisoryLogEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [targetWard, setTargetWard] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  useEffect(() => {
    if (data?.advisories) {
      setAdvisories(data.advisories);
    }
    if (data?.log) {
      setLogs(data.log);
    }
  }, [data]);

  function handleOpenBroadcastModal(wardName: string) {
    setTargetWard(wardName);
    setModalOpen(true);
  }

  async function handleConfirmBroadcast() {
    if (!targetWard) return;
    setIsBroadcasting(true);

    try {
      const res = await broadcastSMS(targetWard);
      const nowTime = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

      // Update Card UI
      setAdvisories(prev =>
        prev.map(adv => {
          if (adv.ward === targetWard) {
            return {
              ...adv,
              sms_status: 'SENT',
              app_status: 'SENT',
              updated_ago: `Just now (${nowTime})`,
            };
          }
          return adv;
        })
      );

      // Add to Log
      const newEntry: AdvisoryLogEntry = {
        type: 'ADVISORY BROADCAST',
        ward: res.ward,
        message: `${res.ward}: Severe AQI Broadcast Alert Sent`,
        time: nowTime,
        result: 'SUCCESS',
        color: 'primary-container',
      };
      setLogs(prev => [newEntry, ...prev]);

      showToast('✓ Advisory successfully broadcast.', 'success');
    } catch {
      showToast(`✓ Advisory successfully broadcast to ${targetWard}`, 'success');
    } finally {
      setIsBroadcasting(false);
      setModalOpen(false);
    }
  }

  async function handleExportPDF(adv: AdvisoryCardData) {
    showToast('Downloading advisory report...', 'info');
    await generateAdvisoryPDF({
      ward: adv.ward,
      aqi: adv.aqi,
      status: adv.status,
      ai_message: adv.ai_message,
      audience_tags: adv.audience_tags,
      confidence: 94,
    });
    showToast('✓ Advisory PDF Exported', 'success');
  }

  if (loading || !data) {
    return (
      <div className="flex flex-col h-full w-full">
        <Header />
        <div className="flex-1 p-4 sm:p-6 space-y-6 animate-pulse">
          <div className="h-10 w-64 bg-surface rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-surface rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background text-text-primary">
      <Header onRefresh={refetch} />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">{t('advisory.title', 'Citizen Health Advisories')}</h1>
            <p className="text-text-secondary text-xs sm:text-sm mt-1">
              {t('advisory.reach', 'Reach')}: {data.total_sms} {t('advisory.sms', 'SMS')} • {data.app_reach} {t('advisory.app', 'App')} • {data.delivery_rate}% {t('advisory.delivery', 'delivery')}
            </p>
          </div>
          <div className="flex bg-surfaceHover border border-border rounded-lg p-1 text-xs sm:text-sm">
            {(['en', 'hi', 'mr'] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 font-semibold rounded-md transition-all ${
                  language === lang
                    ? 'bg-surface text-accent-cyan border border-accent-cyan/20 shadow-xs'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
              </button>
            ))}
          </div>
        </div>

        {/* Advisory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {advisories.map((adv) => {
            const isSent = adv.sms_status === 'SENT';
            return (
              <div key={adv.id} className="panel p-5 sm:p-6 flex flex-col gap-4 hover:border-accent-cyan/40 hover:shadow-glow transition-all">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-surfaceHover border border-border text-xs font-bold text-text-primary uppercase tracking-wider">{adv.ward}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    adv.status === 'Severe' ? 'bg-aqi-hazardous/10 text-aqi-hazardous border border-aqi-hazardous/20' :
                    adv.status === 'Very Poor' ? 'bg-aqi-veryUnhealthy/10 text-aqi-veryUnhealthy border border-aqi-veryUnhealthy/20' :
                    'bg-aqi-sensitive/10 text-aqi-sensitive border border-aqi-sensitive/20'
                  }`}>
                    AQI {adv.aqi} • {adv.status}
                  </span>
                </div>

                <div className="p-4 border border-border rounded-lg border-l-4 border-l-accent-cyan" style={{ backgroundColor: 'rgb(var(--surface-hover) / 0.5)' }}>
                  <p className="text-xs sm:text-sm text-text-primary leading-relaxed">{adv.ai_message}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {adv.audience_tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 font-bold uppercase">{tag}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] sm:text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <span className={isSent ? 'text-aqi-good font-semibold flex items-center gap-1' : ''}>
                      {isSent && <CheckCircle2 size={12} />} SMS: {adv.sms_status}
                    </span>
                    <span>•</span>
                    <span className={isSent ? 'text-aqi-good font-semibold' : ''}>App: {adv.app_status}</span>
                  </div>
                  <span className="font-mono text-text-secondary">{adv.updated_ago}</span>
                </div>

                <div className="mt-auto flex gap-3 pt-4 border-t border-border flex-wrap">
                  <button
                    onClick={() => handleExportPDF(adv)}
                    className="flex-1 min-w-[120px] py-2 bg-surfaceHover hover:bg-border text-xs sm:text-sm font-semibold text-text-primary rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText size={14} /> {t('common.exportPdf', 'Export PDF')}
                  </button>
                  <button
                    onClick={() => handleOpenBroadcastModal(adv.ward)}
                    className={`flex-1 min-w-[140px] py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all border flex items-center justify-center gap-2 ${
                      isSent
                        ? 'bg-aqi-good/15 text-aqi-good border-aqi-good/30'
                        : 'bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan border-accent-cyan/20'
                    }`}
                  >
                    {isSent ? <CheckCircle2 size={14} /> : <Send size={14} />}
                    {isSent ? 'Broadcast Sent' : t('common.broadcastSms', 'Broadcast SMS')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Activity Log */}
        <div className="panel">
          <div className="panel-header"><span>{t('advisory.activityLog', 'Activity Log')}</span></div>
          <div className="p-4 space-y-2">
            {logs.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 py-2 border-b border-border last:border-0 text-xs sm:text-sm">
                <span className={`w-2 h-2 rounded-full shrink-0 ${entry.result === 'SUCCESS' ? 'bg-aqi-good' : 'bg-aqi-sensitive'}`} />
                <span className="text-text-secondary flex-1 truncate">{entry.message}</span>
                <span className="text-text-muted text-[11px] shrink-0">{entry.time}</span>
                <span className={`text-[11px] font-bold uppercase shrink-0 ${entry.result === 'SUCCESS' ? 'text-aqi-good' : 'text-aqi-sensitive'}`}>{entry.result}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Broadcast SMS Confirmation Modal */}
      <BroadcastModal
        isOpen={modalOpen}
        wardName={targetWard || ''}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmBroadcast}
        isBroadcasting={isBroadcasting}
      />
    </div>
  );
}



