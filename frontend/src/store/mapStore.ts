import { create } from 'zustand';

interface MapState {
  viewState: { latitude: number; longitude: number; zoom: number };
  selectedLayer: string | null;
  setViewState: (viewState: MapState['viewState']) => void;
  setSelectedLayer: (layer: string | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  viewState: { latitude: 28.6139, longitude: 77.209, zoom: 10 },
  selectedLayer: null,
  setViewState: (viewState) => set({ viewState }),
  setSelectedLayer: (selectedLayer) => set({ selectedLayer }),
}));
