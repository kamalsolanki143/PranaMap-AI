import { create } from 'zustand';
import { Ward } from '@/types';

interface AppState {
  selectedWard: Ward | null;
  activeLayers: string[];
  theme: 'dark' | 'light';
  apiMode: 'mock' | 'live';
  language: 'en' | 'hi' | 'mr';
  
  setSelectedWard: (ward: Ward | null) => void;
  toggleLayer: (layerId: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setApiMode: (mode: 'mock' | 'live') => void;
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedWard: null,
  activeLayers: ['heatmap', 'hotspots'],
  theme: 'dark',
  apiMode: 'live',
  language: 'en',
  
  setSelectedWard: (ward) => set({ selectedWard: ward }),
  toggleLayer: (layerId) => set((state) => ({
    activeLayers: state.activeLayers.includes(layerId)
      ? state.activeLayers.filter(id => id !== layerId)
      : [...state.activeLayers, layerId]
  })),
  setTheme: (theme) => set({ theme }),
  setApiMode: (mode) => set({ apiMode: mode }),
  setLanguage: (lang) => set({ language: lang })
}));
