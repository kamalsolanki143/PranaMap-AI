'use client';
import React from 'react';
import Header from '@/components/Navbar/Header';
import { MOCK_ADVISORY } from '@/lib/mockData';
import { useAppStore } from '@/store/useAppStore';

export default function AdvisoryPage() {
  const { language, setLanguage } = useAppStore();

  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold text-text-primary tracking-tight">Citizen Health Advisories</h1>
             <p className="text-text-secondary text-sm mt-1">Targeted multilingual alerts for vulnerable populations</p>
           </div>
           
           <div className="flex bg-surfaceHover border border-border rounded-lg p-1">
             <button onClick={() => setLanguage('en')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-surface text-text-primary shadow' : 'text-text-muted hover:text-text-secondary'}`}>English</button>
             <button onClick={() => setLanguage('hi')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${language === 'hi' ? 'bg-surface text-text-primary shadow' : 'text-text-muted hover:text-text-secondary'}`}>हिंदी</button>
             <button onClick={() => setLanguage('mr')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${language === 'mr' ? 'bg-surface text-text-primary shadow' : 'text-text-muted hover:text-text-secondary'}`}>मराठी</button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {MOCK_ADVISORY.map((adv, idx) => (
              <div key={idx} className="panel p-6 flex flex-col gap-4 hover:border-aqi-veryUnhealthy/30 transition-colors">
                 <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-surfaceHover border border-border text-xs font-bold text-text-primary uppercase tracking-wider">
                      {adv.audience === 'schools' ? 'School Children' : adv.audience === 'sensitive' ? 'Sensitive Groups' : adv.audience}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      adv.riskLevel === 'hazardous' ? 'bg-aqi-hazardous/10 text-aqi-hazardous border border-aqi-hazardous/20' :
                      'bg-aqi-veryUnhealthy/10 text-aqi-veryUnhealthy border border-aqi-veryUnhealthy/20'
                    }`}>
                      {adv.riskLevel} Risk
                    </span>
                 </div>
                 
                 <div className="p-4 bg-surfaceHover/50 border border-border rounded-lg border-l-4 border-l-aqi-veryUnhealthy">
                    <p className="text-lg text-text-primary font-medium leading-relaxed">
                      {language === 'en' ? adv.messageEn : language === 'hi' ? adv.messageHi : adv.messageMr}
                    </p>
                 </div>
                 
                 <div className="mt-auto flex gap-3 pt-4 border-t border-border">
                    <button className="flex-1 py-2 bg-surfaceHover hover:bg-border text-sm font-semibold text-text-primary rounded-lg transition-colors">
                      Export PDF
                    </button>
                    <button className="flex-1 py-2 bg-accent-cyan/10 hover:bg-accent-cyan/20 text-sm font-semibold text-accent-cyan rounded-lg transition-colors border border-accent-cyan/20">
                      Broadcast SMS
                    </button>
                 </div>
              </div>
           ))}
        </div>

      </div>
    </div>
  );
}
