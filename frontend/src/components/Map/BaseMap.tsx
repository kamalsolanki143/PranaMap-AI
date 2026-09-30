'use client';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import Map, { Source, Layer, NavigationControl, Marker, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { FeatureCollection, Feature, Polygon, GeoJsonProperties } from 'geojson';
import { useAppStore } from '@/store/useAppStore';
import {
  CPCB_STATIONS,
  CAAQSStation,
  resolveAqiTruth,
  calculateDistanceKm,
} from '@/lib/indiaGeography';
import {
  Layers,
  X,
  Wind,
  Compass,
  MapPin,
  Activity,
  Satellite,
  Eye,
  Sliders,
  Info,
  Check,
  CloudRain,
  Thermometer,
} from 'lucide-react';

// MapLibre Style Definitions
const SATELLITE_STYLE = {
  version: 8,
  sources: {
    'esri-imagery': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [
    {
      id: 'satellite-tiles',
      type: 'raster',
      source: 'esri-imagery',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const HYBRID_STYLE = {
  version: 8,
  sources: {
    'esri-imagery': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics',
    },
    'carto-labels': {
      type: 'raster',
      tiles: [
        'https://basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: 'satellite-tiles',
      type: 'raster',
      source: 'esri-imagery',
      minzoom: 0,
      maxzoom: 19,
    },
    {
      id: 'labels-tiles',
      type: 'raster',
      source: 'carto-labels',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const STREETS_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

const getAqiColor = (aqi: number) => {
  if (aqi <= 50) return '#15803d'; // Good - Natural Green
  if (aqi <= 100) return '#4d7c0f'; // Satisfactory
  if (aqi <= 200) return '#b45309'; // Moderate - Amber
  if (aqi <= 300) return '#c2410c'; // Poor - Terracotta
  if (aqi <= 400) return '#b91c1c'; // Very Poor - Red
  return '#7f1d1d'; // Severe - Deep Crimson
};

export default function BaseMap() {
  const mapRef = useRef<MapRef>(null);

  const {
    geographyLevel,
    selectedState,
    selectedDistrict,
    selectedLocation,
    selectedStation,
    setSelectedStation,
    mapStyleMode,
    setMapStyleMode,
    activeLayers,
    toggleLayer,
  } = useAppStore();

  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [stationDrawerOpen, setStationDrawerOpen] = useState(false);

  // Compute active target coordinate
  const activeCoordinates = useMemo((): [number, number] => {
    if (selectedLocation) return selectedLocation.coordinates;
    if (selectedDistrict) return selectedDistrict.coordinates;
    if (selectedState) return selectedState.coordinates;
    return [78.9629, 22.5937]; // India centroid
  }, [selectedLocation, selectedDistrict, selectedState]);

  // Compute active zoom level
  const activeZoom = useMemo((): number => {
    if (selectedLocation) return selectedLocation.zoom || 12;
    if (selectedDistrict) return selectedDistrict.zoom || 9.5;
    if (selectedState) return selectedState.zoom || 6.8;
    return 4.6; // India level
  }, [selectedLocation, selectedDistrict, selectedState]);

  // Smooth camera transitions when geography changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: activeCoordinates,
        zoom: activeZoom,
        duration: 1800,
        essential: true,
      });
    }
  }, [activeCoordinates, activeZoom]);

  // Selected station zoom
  useEffect(() => {
    if (selectedStation && mapRef.current) {
      mapRef.current.flyTo({
        center: selectedStation.coordinates,
        zoom: 13.5,
        duration: 1400,
      });
      setStationDrawerOpen(true);
    }
  }, [selectedStation]);

  // Resolved station truth at current location
  const stationResolution = useMemo(() => {
    if (selectedLocation) {
      return resolveAqiTruth(selectedLocation.coordinates);
    }
    return null;
  }, [selectedLocation]);

  // Active Map Style
  const currentMapStyle = useMemo(() => {
    if (mapStyleMode === 'streets') return STREETS_STYLE;
    if (mapStyleMode === 'hybrid') return HYBRID_STYLE as any;
    return SATELLITE_STYLE as any;
  }, [mapStyleMode]);

  // Spatial AQI dispersion surface polygon
  const spatialAqiGeoJson = useMemo((): FeatureCollection<Polygon, GeoJsonProperties> => {
    const features: Feature<Polygon, GeoJsonProperties>[] = [];

    CPCB_STATIONS.forEach((st) => {
      const segments = 12;
      const radiusX = 0.08;
      const radiusY = 0.07;
      const points: [number, number][] = [];

      for (let i = 0; i <= segments; i++) {
        const angle = (i * 2 * Math.PI) / segments;
        const rX = radiusX * (1 + 0.12 * Math.sin(angle * 2));
        const rY = radiusY * (1 + 0.12 * Math.cos(angle * 3));
        points.push([st.coordinates[0] + rX * Math.cos(angle), st.coordinates[1] + rY * Math.sin(angle)]);
      }

      features.push({
        type: 'Feature',
        properties: {
          id: st.id,
          name: st.name,
          aqi: st.baseAqi,
          color: getAqiColor(st.baseAqi),
        },
        geometry: {
          type: 'Polygon',
          coordinates: [points],
        },
      });
    });

    return {
      type: 'FeatureCollection',
      features,
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#1E2522]">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: activeCoordinates[0],
          latitude: activeCoordinates[1],
          zoom: activeZoom,
        }}
        mapStyle={currentMapStyle}
        cursor="crosshair"
      >
        <NavigationControl position="bottom-right" showCompass={true} />

        {/* SPATIAL AQI HEAT SURFACE LAYER */}
        {activeLayers.includes('spatialAqi') && (
          <Source id="spatial-aqi-surface" type="geojson" data={spatialAqiGeoJson}>
            <Layer
              id="spatial-aqi-fill"
              type="fill"
              paint={{
                'fill-color': ['get', 'color'],
                'fill-opacity': 0.42,
              }}
            />
            <Layer
              id="spatial-aqi-contour"
              type="line"
              paint={{
                'line-color': ['get', 'color'],
                'line-width': 1.5,
                'line-dasharray': [2, 2],
                'line-opacity': 0.65,
              }}
            />
          </Source>
        )}

        {/* MONITORING STATIONS LAYER */}
        {activeLayers.includes('stations') &&
          CPCB_STATIONS.map((station) => {
            const isSelected = selectedStation?.id === station.id;
            const aqiColor = getAqiColor(station.baseAqi);

            return (
              <Marker
                key={station.id}
                longitude={station.coordinates[0]}
                latitude={station.coordinates[1]}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedStation(station);
                  setStationDrawerOpen(true);
                }}
              >
                <div className="group cursor-pointer flex flex-col items-center transition-transform duration-200 hover:scale-110">
                  {/* Station AQI Label Badge */}
                  <div
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-white shadow-md border flex items-center gap-1 transition-all ${
                      isSelected ? 'ring-2 ring-white scale-105' : ''
                    }`}
                    style={{
                      backgroundColor: aqiColor,
                      borderColor: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{station.baseAqi}</span>
                  </div>

                  {/* Pin Pointer Arrow */}
                  <div
                    className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px]"
                    style={{ borderTopColor: aqiColor }}
                  />

                  {/* Hover tooltip */}
                  <div className="hidden group-hover:block absolute bottom-full mb-1 px-2 py-1 bg-surface/95 backdrop-blur border border-border text-text-primary text-[10px] rounded shadow-elevation whitespace-nowrap z-50">
                    <div className="font-semibold">{station.name}</div>
                    <div className="text-text-muted">
                      AQI {station.baseAqi} · {station.baseSeverity}
                    </div>
                  </div>
                </div>
              </Marker>
            );
          })}

        {/* SELECTED LOCATION PIN (FOR UNMONITORED TOWNS LIKE RANIWARA) */}
        {selectedLocation && !selectedLocation.hasDirectStation && (
          <Marker
            longitude={selectedLocation.coordinates[0]}
            latitude={selectedLocation.coordinates[1]}
            anchor="bottom"
          >
            <div className="flex flex-col items-center animate-bounce">
              <div className="px-2.5 py-1 rounded bg-white text-text-primary border-2 border-brand-forest shadow-elevation text-[11px] font-bold flex items-center gap-1.5">
                <MapPin size={12} className="text-brand-forest fill-brand-forest" />
                <span>{selectedLocation.name}</span>
                <span className="text-[9px] font-mono font-normal text-amber-700 bg-amber-50 px-1 rounded">
                  Nearby Est.
                </span>
              </div>
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-brand-forest" />
            </div>
          </Marker>
        )}

        {/* DISTANCE VECTOR FROM LOCATION TO NEAREST STATION (RANIWARA TEST) */}
        {selectedLocation && !selectedLocation.hasDirectStation && stationResolution && (
          <Source
            id="distance-vector-line"
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  selectedLocation.coordinates,
                  stationResolution.nearestStation.coordinates,
                ],
              },
            }}
          >
            <Layer
              id="vector-line"
              type="line"
              paint={{
                'line-color': '#166534',
                'line-width': 2,
                'line-dasharray': [3, 2],
                'line-opacity': 0.8,
              }}
            />
          </Source>
        )}
      </Map>

      {/* TOP-LEFT FLOATING MAP CONTROLS: STYLE SWITCHER & SATELLITE BADGE */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
        {/* Style mode switcher */}
        <div className="bg-surface/90 backdrop-blur-md border border-border/80 rounded-lg p-1 shadow-elevation flex items-center gap-1 text-xs font-mono">
          <button
            onClick={() => setMapStyleMode('satellite')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              mapStyleMode === 'satellite'
                ? 'bg-brand-forest text-white shadow-xs'
                : 'text-text-muted hover:text-text-primary hover:bg-surfaceHover'
            }`}
          >
            SATELLITE
          </button>
          <button
            onClick={() => setMapStyleMode('hybrid')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              mapStyleMode === 'hybrid'
                ? 'bg-brand-forest text-white shadow-xs'
                : 'text-text-muted hover:text-text-primary hover:bg-surfaceHover'
            }`}
          >
            HYBRID
          </button>
          <button
            onClick={() => setMapStyleMode('streets')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              mapStyleMode === 'streets'
                ? 'bg-brand-forest text-white shadow-xs'
                : 'text-text-muted hover:text-text-primary hover:bg-surfaceHover'
            }`}
          >
            STREETS
          </button>
        </div>

        {/* Current Camera / Jurisdiction Breadcrumb Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-surface/90 backdrop-blur-md border border-border/80 rounded-lg shadow-elevation text-xs font-mono text-text-primary">
          <Compass size={13} className="text-brand-forest" />
          <span className="font-semibold">
            {selectedLocation
              ? `${selectedLocation.name}, ${selectedDistrict?.name}`
              : selectedDistrict
              ? `${selectedDistrict.name}, ${selectedState?.name}`
              : selectedState
              ? `${selectedState.name} State`
              : 'Pan-India Overview'}
          </span>
        </div>
      </div>

      {/* TOP-RIGHT MAP LAYER CONTROLLER */}
      <div className="absolute top-3 right-3 z-30">
        <button
          onClick={() => setLayerMenuOpen(!layerMenuOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-elevation text-xs font-mono font-medium transition-all ${
            layerMenuOpen
              ? 'bg-brand-forest text-white border-brand-forest'
              : 'bg-surface/90 backdrop-blur-md text-text-primary border-border/80 hover:bg-surfaceHover'
          }`}
        >
          <Layers size={13} />
          <span>LAYERS</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </button>

        {/* Layer Dropdown Panel */}
        {layerMenuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-64 bg-surface/95 backdrop-blur-md border border-border rounded-lg shadow-elevation p-3 z-40 text-xs">
            <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider mb-2 border-b border-border/60 pb-1 flex items-center justify-between">
              <span>Environmental Layers</span>
              <button onClick={() => setLayerMenuOpen(false)}>
                <X size={12} className="text-text-muted hover:text-text-primary" />
              </button>
            </div>

            <div className="space-y-1.5 font-mono">
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-surfaceHover cursor-pointer">
                <div className="flex items-center gap-2">
                  <Activity size={13} className="text-emerald-700" />
                  <span>AQI Stations (CPCB)</span>
                </div>
                <input
                  type="checkbox"
                  checked={activeLayers.includes('stations')}
                  onChange={() => toggleLayer('stations')}
                  className="rounded text-brand-forest focus:ring-brand-forest"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-surfaceHover cursor-pointer">
                <div className="flex items-center gap-2">
                  <Activity size={13} className="text-amber-600" />
                  <span>AQI Spatial Heat</span>
                </div>
                <input
                  type="checkbox"
                  checked={activeLayers.includes('spatialAqi')}
                  onChange={() => toggleLayer('spatialAqi')}
                  className="rounded text-brand-forest focus:ring-brand-forest"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-surfaceHover cursor-pointer">
                <div className="flex items-center gap-2">
                  <Wind size={13} className="text-sky-600" />
                  <span>Wind & Dispersion</span>
                </div>
                <input
                  type="checkbox"
                  checked={activeLayers.includes('wind')}
                  onChange={() => toggleLayer('wind')}
                  className="rounded text-brand-forest focus:ring-brand-forest"
                />
              </label>

              <div className="pt-1 border-t border-border/50 text-[10px] text-text-muted font-mono uppercase">
                Satellite Indicators
              </div>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-surfaceHover cursor-pointer">
                <div className="flex items-center gap-2">
                  <Satellite size={13} className="text-purple-600" />
                  <span>Sentinel-5P NO₂</span>
                </div>
                <input
                  type="checkbox"
                  checked={activeLayers.includes('satelliteNo2')}
                  onChange={() => toggleLayer('satelliteNo2')}
                  className="rounded text-brand-forest focus:ring-brand-forest"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-surfaceHover cursor-pointer">
                <div className="flex items-center gap-2">
                  <Satellite size={13} className="text-rose-600" />
                  <span>Aerosol Index (UVAI)</span>
                </div>
                <input
                  type="checkbox"
                  checked={activeLayers.includes('aerosol')}
                  onChange={() => toggleLayer('aerosol')}
                  className="rounded text-brand-forest focus:ring-brand-forest"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* SATELLITE LAYER INFO PILL (WHEN SATELLITE INDICATOR IS ACTIVE) */}
      {activeLayers.includes('satelliteNo2') && (
        <div className="absolute bottom-4 left-4 z-30 bg-surface/95 backdrop-blur border border-border rounded-lg shadow-elevation p-2.5 max-w-xs text-xs font-mono animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between font-bold text-text-primary mb-1">
            <span className="flex items-center gap-1.5">
              <Satellite size={12} className="text-purple-700" />
              Satellite NO₂ Column
            </span>
            <span className="text-[9px] px-1 bg-purple-100 text-purple-800 rounded">NRT</span>
          </div>
          <div className="text-[10px] text-text-muted mb-2">
            Copernicus Sentinel-5P TROPOMI Tropospheric Vertical Column (µmol/m²)
          </div>
          <div className="flex items-center gap-1 text-[9px]">
            <span className="text-emerald-700 font-bold">LOW</span>
            <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-600" />
            <span className="text-rose-700 font-bold">HIGH</span>
          </div>
        </div>
      )}

      {/* NEAREST VERIFIED OBSERVATION DISCLOSURE PILL (E.G. RANIWARA -> SIROHI) */}
      {selectedLocation && !selectedLocation.hasDirectStation && stationResolution && (
        <div className="absolute bottom-4 right-16 z-30 bg-surface/95 backdrop-blur border-2 border-amber-500/80 rounded-lg shadow-elevation p-3 max-w-sm text-xs font-mono">
          <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
            <Info size={13} className="text-amber-600" />
            <span>NEAREST VERIFIED OBSERVATION</span>
          </div>
          <p className="text-[11px] text-text-muted mb-1.5">
            No direct CAAQMS monitoring station exists at <strong>{selectedLocation.name}</strong>. Showing nearest verified ground telemetry:
          </p>
          <div className="bg-background/80 p-2 rounded border border-border text-[10px] space-y-0.5">
            <div className="flex justify-between">
              <span className="text-text-muted">Nearest Station:</span>
              <span className="font-semibold text-text-primary">{stationResolution.nearestStation.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Straight-Line Distance:</span>
              <span className="font-semibold text-amber-700">{stationResolution.distanceKm} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Observed AQI:</span>
              <span className="font-semibold text-emerald-700">{stationResolution.reportedAqi} ({stationResolution.reportedCategory})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Provenance:</span>
              <span className="text-text-primary">{stationResolution.source}</span>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE STATION POPUP / DETAIL DRAWER */}
      {stationDrawerOpen && selectedStation && (
        <div className="absolute top-14 right-3 z-40 w-80 bg-surface border border-border rounded-xl shadow-elevation p-4 text-xs animate-in fade-in slide-in-from-right-2">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                OBSERVED · CAAQMS
              </span>
              <h3 className="text-sm font-bold text-text-primary mt-1">{selectedStation.name}</h3>
              <p className="text-[10px] text-text-muted">
                {selectedStation.city}, {selectedStation.state} · {selectedStation.operator}
              </p>
            </div>
            <button
              onClick={() => setStationDrawerOpen(false)}
              className="p-1 rounded hover:bg-surfaceHover text-text-muted"
            >
              <X size={14} />
            </button>
          </div>

          {/* AQI Big Metric */}
          <div className="p-3 rounded-lg bg-background border border-border/80 flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] font-mono text-text-muted uppercase">Station NAQI</div>
              <div
                className="text-2xl font-bold font-mono"
                style={{ color: getAqiColor(selectedStation.baseAqi) }}
              >
                {selectedStation.baseAqi}
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-xs font-semibold px-2 py-0.5 rounded font-mono"
                style={{
                  backgroundColor: `${getAqiColor(selectedStation.baseAqi)}20`,
                  color: getAqiColor(selectedStation.baseAqi),
                }}
              >
                {selectedStation.baseSeverity}
              </div>
              <div className="text-[10px] text-text-muted font-mono mt-1">
                Updated {selectedStation.lastUpdated}
              </div>
            </div>
          </div>

          {/* Pollutants Breakdown (Only displaying real non-zero values) */}
          <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider mb-1.5">
            Active Pollutant Sensors (µg/m³)
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-3 font-mono text-xs">
            {selectedStation.pollutants.pm25 && (
              <div className="p-1.5 bg-background border border-border rounded text-center">
                <span className="text-[10px] text-text-muted block">PM2.5</span>
                <span className="font-bold text-text-primary">{selectedStation.pollutants.pm25}</span>
              </div>
            )}
            {selectedStation.pollutants.pm10 && (
              <div className="p-1.5 bg-background border border-border rounded text-center">
                <span className="text-[10px] text-text-muted block">PM10</span>
                <span className="font-bold text-text-primary">{selectedStation.pollutants.pm10}</span>
              </div>
            )}
            {selectedStation.pollutants.no2 && (
              <div className="p-1.5 bg-background border border-border rounded text-center">
                <span className="text-[10px] text-text-muted block">NO₂</span>
                <span className="font-bold text-text-primary">{selectedStation.pollutants.no2}</span>
              </div>
            )}
            {selectedStation.pollutants.so2 && (
              <div className="p-1.5 bg-background border border-border rounded text-center">
                <span className="text-[10px] text-text-muted block">SO₂</span>
                <span className="font-bold text-text-primary">{selectedStation.pollutants.so2}</span>
              </div>
            )}
            {selectedStation.pollutants.co && (
              <div className="p-1.5 bg-background border border-border rounded text-center">
                <span className="text-[10px] text-text-muted block">CO (mg)</span>
                <span className="font-bold text-text-primary">{selectedStation.pollutants.co}</span>
              </div>
            )}
            {selectedStation.pollutants.o3 && (
              <div className="p-1.5 bg-background border border-border rounded text-center">
                <span className="text-[10px] text-text-muted block">O₃</span>
                <span className="font-bold text-text-primary">{selectedStation.pollutants.o3}</span>
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-text-muted border-t border-border pt-2 flex items-center justify-between">
            <span>Network: CPCB Real-time Ingestion</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Verified Sensor
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
