'use client';
import React, { useMemo } from 'react';
import Map, { Source, Layer, NavigationControl, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { FeatureCollection, Feature, Polygon, GeoJsonProperties } from 'geojson';
import { useAppStore } from '@/store/useAppStore';
import { MOCK_WARDS, MOCK_HOTSPOTS } from '@/lib/mockData';

const DARK_MATTER_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// Helper to map severity to color
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'good': return '#10B981';
    case 'moderate': return '#F59E0B';
    case 'sensitive': return '#F97316';
    case 'unhealthy': return '#EF4444';
    case 'veryUnhealthy': return '#BE123C';
    case 'hazardous': return '#7F1D1D';
    default: return '#475569';
  }
};

export default function BaseMap() {
  const { activeLayers, selectedWard, setSelectedWard } = useAppStore();

  // Create mock GeoJSON for Wards from centroids for demo purposes
  const wardGeoJson = useMemo((): FeatureCollection<Polygon, GeoJsonProperties> => {
    return {
      type: 'FeatureCollection',
      features: MOCK_WARDS.map(ward => ({
        type: 'Feature',
        properties: { ...ward, color: getSeverityColor(ward.severity) },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [ward.centroid[0] - 0.02, ward.centroid[1] - 0.02],
            [ward.centroid[0] + 0.02, ward.centroid[1] - 0.02],
            [ward.centroid[0] + 0.02, ward.centroid[1] + 0.02],
            [ward.centroid[0] - 0.02, ward.centroid[1] + 0.02],
            [ward.centroid[0] - 0.02, ward.centroid[1] - 0.02]
          ]]
        }
      }))
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <Map
        initialViewState={{
          longitude: 72.8777,
          latitude: 19.0760,
          zoom: 10
        }}
        mapStyle={DARK_MATTER_STYLE}
        interactiveLayerIds={['wards-fill']}
        onClick={(e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const ward = MOCK_WARDS.find(w => w.id === feature.properties?.id);
            if (ward) setSelectedWard(ward);
          } else {
            setSelectedWard(null);
          }
        }}
        cursor="pointer"
      >
        <NavigationControl position="bottom-right" />

        {/* Wards Layer (Heatmap representation) */}
        {activeLayers.includes('heatmap') && (
          <Source id="wards" type="geojson" data={wardGeoJson}>
            <Layer 
              id="wards-fill" 
              type="fill" 
              paint={{
                'fill-color': ['get', 'color'],
                'fill-opacity': ['case',
                  ['boolean', ['feature-state', 'hover'], false], 0.6,
                  0.3
                ]
              }} 
            />
            <Layer 
              id="wards-line" 
              type="line" 
              paint={{
                'line-color': '#262B36',
                'line-width': 1
              }} 
            />
          </Source>
        )}

        {/* Selected Ward Highlight */}
        {selectedWard && (
          <Source id="selected-ward" type="geojson" data={{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [selectedWard.centroid[0] - 0.02, selectedWard.centroid[1] - 0.02],
                [selectedWard.centroid[0] + 0.02, selectedWard.centroid[1] - 0.02],
                [selectedWard.centroid[0] + 0.02, selectedWard.centroid[1] + 0.02],
                [selectedWard.centroid[0] - 0.02, selectedWard.centroid[1] + 0.02],
                [selectedWard.centroid[0] - 0.02, selectedWard.centroid[1] - 0.02]
              ]]
            }
          } as Feature<Polygon>}>
             <Layer id="selected-ward-line" type="line" paint={{'line-color': '#06B6D4', 'line-width': 3}} />
          </Source>
        )}

        {/* Hotspots Layer */}
        {activeLayers.includes('hotspots') && MOCK_HOTSPOTS.map(hotspot => (
          <Marker 
            key={hotspot.id} 
            longitude={hotspot.coordinates[0]} 
            latitude={hotspot.coordinates[1]}
            anchor="bottom"
          >
             <div className="flex flex-col items-center">
               <div className="w-4 h-4 bg-aqi-veryUnhealthy rounded-full animate-pulse shadow-[0_0_10px_rgba(190,18,60,0.8)] border-2 border-white" />
             </div>
          </Marker>
        ))}

      </Map>
    </div>
  );
}
