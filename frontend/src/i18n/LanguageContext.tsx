'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, translations } from './translations';
import { useAppStore } from '@/store/useAppStore';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { language: storeLang, setLanguage: setStoreLang } = useAppStore();
  const [language, setLangState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('pranamap_language') as Language;
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
      setLangState(saved);
      setStoreLang(saved);
    } else {
      setLangState(storeLang || 'en');
    }
  }, [storeLang, setStoreLang]);

  const changeLanguage = useCallback((lang: Language) => {
    setLangState(lang);
    setStoreLang(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pranamap_language', lang);
    }
  }, [setStoreLang]);

  const t = useCallback((key: string, fallback?: string): string => {
    const activeLang = mounted ? language : 'en';
    const dict = translations[activeLang] || translations.en;
    return dict[key] || fallback || translations.en[key] || key;
  }, [language, mounted]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
