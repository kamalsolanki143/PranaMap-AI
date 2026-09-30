import { create } from 'zustand';
import { Ward, CityConfig, DataStatus } from '@/types';
import { DEFAULT_CITY } from '@/lib/cities';
import {
  IndiaState,
  IndiaDistrict,
  IndiaLocation,
  CAAQSStation,
  INDIA_STATES,
} from '@/lib/indiaGeography';

export type GeographyLevel = 'india' | 'state' | 'district' | 'location';
export type MapStyleMode = 'satellite' | 'hybrid' | 'streets';

interface AppState {
  // Legacy city support
  selectedCity: CityConfig;
  selectedWard: Ward | null;
  activeLayers: string[];
  theme: 'dark' | 'light';
  apiMode: 'mock' | 'live';
  dataStatus: DataStatus;
  language: 'en' | 'hi' | 'mr';

  // Point 1 Pan-India Geography Hierarchy
  geographyLevel: GeographyLevel;
  selectedState: IndiaState | null;
  selectedDistrict: IndiaDistrict | null;
  selectedLocation: IndiaLocation | null;
  selectedStation: CAAQSStation | null;
  mapStyleMode: MapStyleMode;

  // Actions
  setSelectedCity: (city: CityConfig) => void;
  setSelectedWard: (ward: Ward | null) => void;
  toggleLayer: (layerId: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setApiMode: (mode: 'mock' | 'live') => void;
  setDataStatus: (status: DataStatus) => void;
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void;

  // Geography Actions
  selectIndia: () => void;
  selectState: (state: IndiaState) => void;
  selectDistrict: (district: IndiaDistrict) => void;
  selectLocation: (loc: IndiaLocation) => void;
  setSelectedStation: (station: CAAQSStation | null) => void;
  setMapStyleMode: (mode: MapStyleMode) => void;
}

// Default to Rajasthan -> Jalore -> Raniwara or Delhi as initial state
const defaultState = INDIA_STATES.find(s => s.id === 'rajasthan') || INDIA_STATES[0];
const defaultDistrict = defaultState.districts.find(d => d.id === 'jalore') || defaultState.districts[0];
const defaultLocation = defaultDistrict.locations.find(l => l.id === 'raniwara') || defaultDistrict.locations[0];

export const useAppStore = create<AppState>((set) => ({
  selectedCity: DEFAULT_CITY,
  selectedWard: null,
  activeLayers: ['stations', 'spatialAqi', 'weather', 'wind'],
  theme: 'light',
  apiMode: 'live',
  dataStatus: 'LIVE',
  language: 'en',

  geographyLevel: 'location',
  selectedState: defaultState,
  selectedDistrict: defaultDistrict,
  selectedLocation: defaultLocation,
  selectedStation: null,
  mapStyleMode: 'satellite', // Default: SATELLITE FIRST

  setSelectedCity: (city) => set({ selectedCity: city, selectedWard: null }),
  setSelectedWard: (ward) => set({ selectedWard: ward }),
  toggleLayer: (layerId) => set((state) => ({
    activeLayers: state.activeLayers.includes(layerId)
      ? state.activeLayers.filter(id => id !== layerId)
      : [...state.activeLayers, layerId]
  })),
  setTheme: (theme) => set({ theme }),
  setApiMode: (mode) => set({ apiMode: mode }),
  setDataStatus: (status) => set({ dataStatus: status }),
  setLanguage: (lang) => set({ language: lang }),

  selectIndia: () => set({
    geographyLevel: 'india',
    selectedState: null,
    selectedDistrict: null,
    selectedLocation: null,
    selectedStation: null,
  }),
  selectState: (state) => set({
    geographyLevel: 'state',
    selectedState: state,
    selectedDistrict: state.districts[0] || null,
    selectedLocation: state.districts[0]?.locations[0] || null,
    selectedStation: null,
  }),
  selectDistrict: (district) => set({
    geographyLevel: 'district',
    selectedDistrict: district,
    selectedLocation: district.locations[0] || null,
    selectedStation: null,
  }),
  selectLocation: (loc) => set((state) => {
    // Also find parent state & district if not already matching
    let parentState = state.selectedState;
    let parentDistrict = state.selectedDistrict;
    if (!parentState || parentState.id !== loc.stateId) {
      parentState = INDIA_STATES.find(s => s.id === loc.stateId) || null;
    }
    if (parentState && (!parentDistrict || parentDistrict.id !== loc.districtId)) {
      parentDistrict = parentState.districts.find(d => d.id === loc.districtId) || null;
    }
    return {
      geographyLevel: 'location',
      selectedState: parentState,
      selectedDistrict: parentDistrict,
      selectedLocation: loc,
      selectedStation: null,
    };
  }),
  setSelectedStation: (station) => set({ selectedStation: station }),
  setMapStyleMode: (mode) => set({ mapStyleMode: mode }),
}));
