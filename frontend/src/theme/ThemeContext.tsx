'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme: storeTheme, setTheme: setStoreTheme } = useAppStore();
  const [theme, setThemeState] = useState<Theme>('dark');

  const applyThemeClass = (targetTheme: Theme) => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    if (targetTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('pranamap_theme') as Theme;
    if (saved === 'dark' || saved === 'light') {
      setThemeState(saved);
      setStoreTheme(saved);
      applyThemeClass(saved);
    } else {
      setThemeState(storeTheme || 'dark');
      applyThemeClass(storeTheme || 'dark');
    }
  }, [storeTheme, setStoreTheme]);

  const changeTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    setStoreTheme(newTheme);
    applyThemeClass(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pranamap_theme', newTheme);
    }
  }, [setStoreTheme]);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    changeTheme(next);
  }, [theme, changeTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
