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
    let saved: Language | null = null;
    try {
      if (typeof window !== 'undefined') {
        saved = (localStorage.getItem('pranamap-language') || localStorage.getItem('pranamap_language')) as Language;
      }
    } catch {
      // Ignore localStorage exceptions in private browsing or constrained environments
    }

    if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
      setLangState(saved);
      setStoreLang(saved);
    } else if (storeLang && (storeLang === 'en' || storeLang === 'hi' || storeLang === 'mr')) {
      setLangState(storeLang);
    }
  }, [storeLang, setStoreLang]);

  const changeLanguage = useCallback((lang: Language) => {
    setLangState(lang);
    setStoreLang(lang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pranamap-language', lang);
        // Also keep legacy key synced
        localStorage.setItem('pranamap_language', lang);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [setStoreLang]);

  const t = useCallback((key: string, fallback?: string): string => {
    // 1. Try selected language (if mounted, otherwise use default 'en' to prevent SSR hydration mismatch)
    const activeLang = mounted ? language : 'en';
    const activeDict = translations[activeLang];
    if (activeDict && activeDict[key]) {
      return activeDict[key];
    }

    // 2. Fall back to English
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }

    // 3. Fall back to supplied fallback, or key itself. Never return undefined, null, or blank.
    if (fallback !== undefined && fallback !== null && fallback !== '') {
      return fallback;
    }
    return key;
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
