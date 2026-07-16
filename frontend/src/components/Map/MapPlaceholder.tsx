// TODO: GIS teammate (Krrish) — wire Leaflet here.
// This component renders the map shell with AQI heatmap SVG overlay.
// Props are ready: pass ward boundaries, heatmap data, and layer toggle state.

interface MapPlaceholderProps {
  // Pass these down once Krrish wires Leaflet
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  heatmapData?: Array<{ lat: number; lng: number; aqi: number }>;
  showWeatherLayer?: boolean;
  showSatelliteLayer?: boolean;
}

export default function MapPlaceholder({
  center = [28.6139, 77.209], // Delhi NCR default
  zoom = 11,
}: MapPlaceholderProps) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0e13]">
      {/* Dark map background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* SVG Heatmap Overlay */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.45, mixBlendMode: "color-dodge" }}>
        <defs>
          <radialGradient id="heat-critical">
            <stop offset="0%" stopColor="#93000a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#93000a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-poor">
            <stop offset="0%" stopColor="#ffdb3f" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffdb3f" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-mod">
            <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00f5ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Anand Vihar — critical */}
        <circle cx="68%" cy="35%" r="160" fill="url(#heat-critical)" />
        {/* Rohini — very poor */}
        <circle cx="38%" cy="28%" r="200" fill="url(#heat-poor)" />
        {/* Okhla — very poor */}
        <circle cx="55%" cy="55%" r="180" fill="url(#heat-poor)" />
        {/* Dwarka — satisfactory */}
        <circle cx="22%" cy="65%" r="120" fill="url(#heat-mod)" />
      </svg>

      {/* Scanline overlay */}
      <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />

      {/* Map Controls */}
      <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
        <div
          className="p-1 rounded-xl flex flex-col gap-1"
          style={{
            background: "rgba(10,14,19,0.8)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
          }}
        >
          <button
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
            style={{ background: "#00f5ff", color: "#003739", boxShadow: "0 0 12px rgba(0,245,255,0.4)" }}
            title="Layers"
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              layers
            </span>
          </button>
          <button
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: "rgba(185,202,202,0.7)" }}
            title="Weather"
          >
            <span className="material-symbols-outlined text-base">thermostat</span>
          </button>
          <button
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: "rgba(185,202,202,0.7)" }}
            title="Wind"
          >
            <span className="material-symbols-outlined text-base">air</span>
          </button>
        </div>
      </div>

      {/* Coordinate watermark */}
      <div
        className="absolute bottom-4 left-6 font-mono"
        style={{ fontSize: "10px", color: "rgba(0,245,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}
      >
        LAT: 28.6139° N &nbsp;|&nbsp; LONG: 77.2090° E &nbsp;|&nbsp; ZOOM: {zoom}
      </div>

      {/* Leaflet integration point note */}
      <div
        className="absolute bottom-4 right-6 font-mono"
        style={{ fontSize: "9px", color: "rgba(185,202,202,0.2)", fontFamily: "'JetBrains Mono', monospace" }}
      >
        [MAP_ENGINE: STUB — GIS_TEAM_WIRE_HERE]
      </div>
    </div>
  );
}
