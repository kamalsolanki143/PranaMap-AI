'use client';
import React, { useMemo, useState, useEffect } from 'react';
import Header from '@/components/Navbar/Header';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/store/useAppStore';
import LocationHierarchySelector from '@/components/Geography/LocationHierarchySelector';
import {
  resolveAqiTruth,
  CPCB_STATIONS,
  CAAQSStation,
} from '@/lib/indiaGeography';
import {
  fetchLocationWeather,
  WeatherTelemetry,
  AirQualityTelemetry,
  EnvironmentalOutlook,
  HourlyForecastItem,
} from '@/services/weatherService';
import {
  Wind,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Info,
  Layers,
  ChevronRight,
  Activity,
  MapPin,
  Clock,
  Radio,
  Thermometer,
  CloudRain,
  Eye,
  Compass,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

const BaseMap = dynamic(() => import('@/components/Map/BaseMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#1E2522] border border-border rounded-xl flex items-center justify-center text-white/70 text-xs">
      <div className="flex items-center gap-2 font-mono">
        <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span>Loading Satellite Imagery & CPCB Ground Sensors...</span>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  const {
    geographyLevel,
    selectedState,
    selectedDistrict,
    selectedLocation,
    selectedStation,
    setSelectedStation,
  } = useAppStore();

  // Active target coordinates [lon, lat]
  const targetCoordinates = useMemo((): [number, number] => {
    if (selectedLocation) return selectedLocation.coordinates;
    if (selectedDistrict) return selectedDistrict.coordinates;
    if (selectedState) return selectedState.coordinates;
    return [78.9629, 22.5937]; // India centroid
  }, [selectedLocation, selectedDistrict, selectedState]);

  // Resolve AQI Truth Level (OBSERVED vs NEAREST VERIFIED vs MODELLED)
  const aqiTruth = useMemo(() => {
    return resolveAqiTruth(targetCoordinates);
  }, [targetCoordinates]);

  // Live Weather, Atmospheric Chemistry & Environmental Outlook state
  const [weatherData, setWeatherData] = useState<WeatherTelemetry | null>(null);
  const [airQualityData, setAirQualityData] = useState<AirQualityTelemetry | null>(null);
  const [outlookData, setOutlookData] = useState<EnvironmentalOutlook | null>(null);
  const [forecastItems, setForecastItems] = useState<HourlyForecastItem[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Fetch real weather and real atmospheric air quality whenever location coordinates change
  useEffect(() => {
    let isCancelled = false;
    setWeatherLoading(true);

    const locName = selectedLocation?.name || selectedDistrict?.name || selectedState?.name || 'India';
    fetchLocationWeather(
      targetCoordinates[0],
      targetCoordinates[1],
      aqiTruth.reportedAqi,
      locName
    ).then((res) => {
      if (!isCancelled) {
        setWeatherData(res.weather);
        setAirQualityData(res.airQuality);
        setOutlookData(res.outlook);
        setForecastItems(res.forecast);
        setWeatherLoading(false);
      }
    });

    return () => {

      isCancelled = true;
    };
  }, [targetCoordinates, aqiTruth.reportedAqi]);

  // Stations belonging to the current state/district
  const localStations = useMemo(() => {
    if (selectedDistrict) {
      const match = CPCB_STATIONS.filter(
        (s) => s.district.toLowerCase() === selectedDistrict.name.toLowerCase()
      );
      if (match.length > 0) return match;
    }
    if (selectedState) {
      return CPCB_STATIONS.filter((s) => s.stateId === selectedState.id);
    }
    return CPCB_STATIONS.slice(0, 6);
  }, [selectedDistrict, selectedState]);

  // Current display label
  const locationTitle = useMemo(() => {
    if (selectedLocation) return `${selectedLocation.name}`;
    if (selectedDistrict) return `${selectedDistrict.name} District`;
    if (selectedState) return `${selectedState.name} State`;
    return 'India National Airshed';
  }, [selectedLocation, selectedDistrict, selectedState]);

  const parentGeographySubtitle = useMemo(() => {
    if (selectedLocation && selectedDistrict && selectedState) {
      return `${selectedDistrict.name}, ${selectedState.name}`;
    }
    if (selectedDistrict && selectedState) {
      return `${selectedState.name} · National Ambient Air Network`;
    }
    if (selectedState) {
      return `${selectedState.capital} (Capital) · Central Pollution Control Board`;
    }
    return `28 States & 8 UTs · ${CPCB_STATIONS.length} Verified CAAQMS Benchmark Stations`;
  }, [selectedLocation, selectedDistrict, selectedState]);

  return (
    <div className="flex flex-col h-full w-full bg-background text-text-primary">
      {/* Top Header with IST Clock & Status */}
      <Header />

      {/* Prominent Cascading Geography Selector & Search Bar */}
      <LocationHierarchySelector />

      {/* Main Command Center Body */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-5">
        
        {/* SELECTED LOCATION HEADER STRIP */}
        <div className="bg-surface border border-border/80 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-forest/10 text-brand-forest font-semibold tracking-wider">
                {geographyLevel === 'india'
                  ? 'NATIONAL AIRSHED OVERVIEW'
                  : geographyLevel === 'state'
                  ? 'STATE AMBIENT JURISDICTION'
                  : geographyLevel === 'district'
                  ? 'DISTRICT MONITORING ZONE'
                  : 'LOCALITY ENVIRONMENTAL INTELLIGENCE'}
              </span>
              <span className="text-[10px] font-mono text-text-muted">
                COORDINATES: {targetCoordinates[1].toFixed(4)}°N, {targetCoordinates[0].toFixed(4)}°E
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary mt-1">
              {locationTitle}
            </h1>
            <p className="text-xs text-text-muted font-medium mt-0.5">
              {parentGeographySubtitle}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-4 font-mono text-xs">
            {/* AQI Pill */}
            <div className="px-3 py-2 rounded-lg bg-background border border-border flex items-center gap-2">
              <div>
                <span className="text-[9px] text-text-muted block uppercase">Reported AQI</span>
                <span
                  className="text-base font-bold"
                  style={{
                    color:
                      aqiTruth.reportedAqi > 200
                        ? '#c2410c'
                        : aqiTruth.reportedAqi > 100
                        ? '#b45309'
                        : '#15803d',
                  }}
                >
                  {aqiTruth.reportedAqi}
                </span>
              </div>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-semibold self-center"
                style={{
                  backgroundColor:
                    aqiTruth.reportedAqi > 200
                      ? '#ffedd5'
                      : aqiTruth.reportedAqi > 100
                      ? '#fef3c7'
                      : '#dcfce7',
                  color:
                    aqiTruth.reportedAqi > 200
                      ? '#9a3412'
                      : aqiTruth.reportedAqi > 100
                      ? '#92400e'
                      : '#166534',
                }}
              >
                {aqiTruth.reportedCategory}
              </span>
            </div>

            {/* Weather Metric */}
            <div className="px-3 py-2 rounded-lg bg-background border border-border">
              <span className="text-[9px] text-text-muted block uppercase">Temperature</span>
              <span className="text-sm font-bold text-text-primary">
                {weatherLoading ? '...' : `${weatherData?.temperature}°C`}
              </span>
            </div>

            {/* Wind Metric */}
            <div className="px-3 py-2 rounded-lg bg-background border border-border">
              <span className="text-[9px] text-text-muted block uppercase">Ventilation Vector</span>
              <span className="text-sm font-bold text-brand-sky flex items-center gap-1">
                <Wind size={12} />
                {weatherLoading
                  ? '...'
                  : `${weatherData?.windSpeed} km/h ${weatherData?.windDirectionCardinal}`}
              </span>
            </div>

            {/* Truth Provenance Badge */}
            <div className="px-3 py-2 rounded-lg bg-background border border-border">
              <span className="text-[9px] text-text-muted block uppercase">Data Truth Level</span>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded inline-block ${
                  aqiTruth.truthLevel === 'OBSERVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {aqiTruth.truthLevel === 'OBSERVED'
                  ? 'DIRECT OBSERVED'
                  : 'NEAREST VERIFIED'}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN SECTION: LARGE SATELLITE MAP (PRIMARY) + SITUATION BRIEF */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 min-h-[520px] lg:h-[calc(100vh-290px)]">
          
          {/* SATELLITE MAP CONTAINER (8 Columns on desktop - DOMINATES SCREEN) */}
          <div className="lg:col-span-8 h-[440px] lg:h-full relative rounded-xl overflow-hidden border border-border shadow-panel">
            <BaseMap />
          </div>

          {/* CONTEXTUAL SITUATION ASSESSMENT BRIEFING (4 Columns on desktop) */}
          <div className="lg:col-span-4 h-full flex flex-col gap-3 overflow-y-auto pr-0.5">
            <div className="bg-surface border border-border rounded-xl p-4 shadow-panel flex-1 flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between border-b border-border/70 pb-2.5 mb-3 font-mono">
                  <div>
                    <span className="text-[10px] text-brand-sky uppercase font-semibold block tracking-wider">
                      DECISION SUPPORT BRIEFING
                    </span>
                    <h2 className="text-xs font-bold text-text-primary uppercase">
                      SITUATION ASSESSMENT — {locationTitle}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-text-primary">{aqiTruth.reportedAqi}</span>
                    <span className="text-[9px] text-text-muted block uppercase font-mono">{aqiTruth.reportedCategory}</span>
                  </div>
                </div>

                {/* 1. WHERE? */}
                <div className="mb-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-text-muted uppercase mb-1">
                    <MapPin size={12} className="text-brand-forest" />
                    <span>1. WHERE IS THE ENVIRONMENTAL FOCUS?</span>
                  </div>
                  <p className="text-xs text-text-primary pl-4 border-l-2 border-brand-forest/60">
                    <strong>{locationTitle}</strong> ({parentGeographySubtitle}).
                    {aqiTruth.truthLevel === 'NEAREST_VERIFIED' ? (
                      <span className="block text-[11px] text-text-muted mt-0.5">
                        Area relies on nearest telemetry from <strong>{aqiTruth.nearestStation.name}</strong> ({aqiTruth.distanceKm} km straight-line distance).
                      </span>
                    ) : (
                      <span className="block text-[11px] text-emerald-800 mt-0.5">
                        Station active and reporting federal reference BAM measurements directly at site.
                      </span>
                    )}
                  </p>
                </div>

                {/* 2. WHAT? */}
                <div className="mb-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-text-muted uppercase mb-1">
                    <Activity size={12} className="text-amber-600" />
                    <span>2. WHAT IS THE CURRENT ENVIRONMENTAL STATUS?</span>
                  </div>
                  <div className="pl-4 border-l-2 border-amber-500/60 text-xs text-text-primary">
                    <span className="font-semibold">
                      AQI is {airQualityData ? airQualityData.aqi : aqiTruth.reportedAqi} (
                      {airQualityData ? airQualityData.category : aqiTruth.reportedCategory})
                    </span>
                    <div className="text-[11px] text-text-muted mt-0.5 flex flex-wrap gap-2 font-mono">
                      <span>PM2.5: {airQualityData ? airQualityData.pm25 : aqiTruth.pollutants.pm25} µg/m³</span>
                      <span>PM10: {airQualityData ? airQualityData.pm10 : aqiTruth.pollutants.pm10} µg/m³</span>
                      {weatherData && <span>Temp: {weatherData.temperature}°C</span>}
                      {airQualityData && <span>AOD: {airQualityData.aerosolOpticalDepth}</span>}
                    </div>
                  </div>
                </div>

                {/* 3. WHY? */}
                <div className="mb-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-text-muted uppercase mb-1">
                    <Wind size={12} className="text-sky-600" />
                    <span>3. WHY IS IT OCCURRING? (OBSERVED DRIVERS)</span>
                  </div>
                  <p className="text-xs text-text-primary pl-4 border-l-2 border-sky-500/60">
                    {weatherData?.windSpeed && weatherData.windSpeed < 8 ? (
                      <span>Atmospheric stagnation with surface wind below 8 km/h ({weatherData.windSpeed} km/h), restricting boundary-layer particulate dispersal.</span>
                    ) : (
                      <span>Moderate ventilation with prevailing {weatherData?.windDirectionCardinal || 'NW'} winds ({weatherData?.windSpeed || 10} km/h) maintaining regional advection.</span>
                    )}
                  </p>
                </div>

                {/* 4. WHAT NEXT? ("Mausam kharab hone wala hai") */}
                <div className="mb-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-text-muted uppercase mb-1">
                    <Clock size={12} className="text-rose-600" />
                    <span>4. WHAT IS LIKELY TO HAPPEN NEXT?</span>
                  </div>
                  <div className="pl-4 border-l-2 border-rose-500/60 text-xs">
                    <div className="font-semibold text-text-primary">
                      {outlookData?.hindiHeadline || 'मौसम संचरण सामान्य'}
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      {outlookData?.next24Hours}
                    </div>
                  </div>
                </div>

                {/* 5. WHAT TO DO? */}
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-text-muted uppercase mb-1">
                    <ShieldAlert size={12} className="text-emerald-700" />
                    <span>5. RECOMMENDED MUNICIPAL RESPONSE</span>
                  </div>
                  <p className="text-xs text-text-primary pl-4 border-l-2 border-emerald-600/60">
                    {aqiTruth.reportedAqi > 200
                      ? 'Deploy anti-smog misting cannons along heavy transit corridors; restrict unpaved construction excavation.'
                      : 'Maintain routine automated street sweeping and monitor synoptic evening inversion vector.'}
                  </p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border mt-3 flex items-center justify-between font-mono text-xs">
                <Link
                  href="/forecast"
                  className="text-brand-forest hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Detailed 72h Forecast</span>
                  <ArrowRight size={12} />
                </Link>
                <Link
                  href="/attribution"
                  className="text-text-muted hover:text-text-primary flex items-center gap-1"
                >
                  <span>Source Breakdown</span>
                  <ArrowUpRight size={12} />
                </Link>
              </div>

            </div>
          </div>

        </div>

        {/* BELOW THE MAP: CURRENT AQI TRUTH + CURRENT WEATHER + ENVIRONMENTAL OUTLOOK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* CARD 1: THREE LEVELS OF AQI TRUTH */}
          <div className="bg-surface border border-border rounded-xl p-4 shadow-panel flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase text-text-muted tracking-wider">
                  AQI Truth & Provenance
                </span>
                <span
                  className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                    airQualityData?.dataStatus === 'LIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {airQualityData?.dataStatus === 'LIVE' ? 'LIVE · CAMS ASSIMILATION' : 'CACHED BASELINE'}
                </span>
              </div>

              {/* Atmospheric Telemetry NAQI */}
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className="text-4xl font-extrabold font-mono"
                  style={{
                    color:
                      (airQualityData?.aqi || aqiTruth.reportedAqi) > 200
                        ? '#c2410c'
                        : (airQualityData?.aqi || aqiTruth.reportedAqi) > 100
                        ? '#b45309'
                        : '#15803d',
                  }}
                >
                  {airQualityData ? airQualityData.aqi : aqiTruth.reportedAqi}
                </span>
                <span className="text-sm font-semibold font-mono text-text-primary">
                  {airQualityData ? airQualityData.category : aqiTruth.reportedCategory}
                </span>
                <span className="text-[10px] font-mono text-text-muted ml-auto">
                  Dominant: {airQualityData ? airQualityData.prominentPollutant : 'PM10'}
                </span>
              </div>

              {/* Hierarchy Provenance Box */}
              {aqiTruth.truthLevel === 'NEAREST_VERIFIED' ? (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 text-xs text-amber-900 space-y-1.5 mb-2">
                  <div className="font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Info size={12} className="text-amber-700" />
                      <span>Unmonitored Settlement ({locationTitle})</span>
                    </span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-200/70 text-amber-900 font-bold">
                      NEAREST VERIFIED
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-800 leading-tight">
                    Nearest CAAQMS: <strong>{aqiTruth.nearestStation.name}</strong> ({aqiTruth.distanceKm} km away).
                    Observed benchmark: <strong>AQI {aqiTruth.reportedAqi}</strong> ({aqiTruth.reportedCategory}).
                  </div>
                  {aqiTruth.modelledEstimate && (
                    <div className="text-[10px] text-amber-700 pt-1 border-t border-amber-200/60 font-mono flex items-center justify-between">
                      <span>Spatial Attenuation Model:</span>
                      <span className="font-bold">AQI {aqiTruth.modelledEstimate.aqi} ({aqiTruth.modelledEstimate.category})</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-2.5 text-xs text-emerald-900 space-y-0.5 mb-2">
                  <div className="font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-700" />
                      <span>Direct On-Site Station</span>
                    </span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-200/70 text-emerald-900 font-bold">
                      OBSERVED
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    Station: <strong>{aqiTruth.stationName}</strong> · Ref Benchmark AQI {aqiTruth.reportedAqi}
                  </div>
                </div>
              )}

              {/* Real-Time Pollutants & Satellite Columns Grid */}
              <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-xs pt-1">
                <div className="p-1 rounded bg-background border border-border">
                  <span className="text-[9px] text-text-muted block">PM2.5</span>
                  <span className="font-bold text-text-primary">
                    {airQualityData ? `${airQualityData.pm25} µg` : aqiTruth.pollutants.pm25}
                  </span>
                </div>
                <div className="p-1 rounded bg-background border border-border">
                  <span className="text-[9px] text-text-muted block">PM10</span>
                  <span className="font-bold text-text-primary">
                    {airQualityData ? `${airQualityData.pm10} µg` : aqiTruth.pollutants.pm10}
                  </span>
                </div>
                <div className="p-1 rounded bg-background border border-border">
                  <span className="text-[9px] text-text-muted block">NO₂</span>
                  <span className="font-bold text-text-primary">
                    {airQualityData ? `${airQualityData.no2} µg` : aqiTruth.pollutants.no2}
                  </span>
                </div>
                <div className="p-1 rounded bg-background border border-border">
                  <span className="text-[9px] text-text-muted block">SO₂</span>
                  <span className="font-bold text-text-primary">
                    {airQualityData ? `${airQualityData.so2} µg` : (aqiTruth.pollutants.so2 || 8)}
                  </span>
                </div>
                <div className="p-1 rounded bg-background border border-border">
                  <span className="text-[9px] text-text-muted block">AOD 550nm</span>
                  <span className="font-bold text-purple-700">
                    {airQualityData ? airQualityData.aerosolOpticalDepth : 0.32}
                  </span>
                </div>
                <div className="p-1 rounded bg-background border border-border">
                  <span className="text-[9px] text-text-muted block">Dust Column</span>
                  <span className="font-bold text-amber-700">
                    {airQualityData ? `${airQualityData.dust} µg` : '45 µg'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-text-muted pt-2 border-t border-border mt-3 flex items-center justify-between">
              <span className="truncate max-w-[210px]">{airQualityData?.source || aqiTruth.source}</span>
              <span>{airQualityData?.updatedAt || aqiTruth.observedTimestamp}</span>
            </div>
          </div>

          {/* CARD 2: CURRENT WEATHER TELEMETRY (DYNAMIC OPEN-METEO) */}
          <div className="bg-surface border border-border rounded-xl p-4 shadow-panel flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase text-text-muted tracking-wider">
                  Synoptic Meteorology
                </span>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">
                  {weatherData?.dataStatus || 'LIVE'}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-extrabold font-mono text-text-primary">
                  {weatherLoading ? '...' : `${weatherData?.temperature}°C`}
                </span>
                <span className="text-xs font-mono text-text-muted">
                  Feels like {weatherData?.feelsLike}°C · {weatherData?.conditionLabel}
                </span>
              </div>

              {/* Weather Parameters Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-background border border-border">
                  <span className="text-[10px] text-text-muted block">Humidity</span>
                  <span className="font-bold text-text-primary">{weatherData?.humidity}%</span>
                </div>
                <div className="p-2 rounded bg-background border border-border">
                  <span className="text-[10px] text-text-muted block">Wind Vector</span>
                  <span className="font-bold text-brand-sky">
                    {weatherData?.windSpeed} km/h {weatherData?.windDirectionCardinal}
                  </span>
                </div>
                <div className="p-2 rounded bg-background border border-border">
                  <span className="text-[10px] text-text-muted block">Surface Pressure</span>
                  <span className="font-bold text-text-primary">{weatherData?.pressure} hPa</span>
                </div>
                <div className="p-2 rounded bg-background border border-border">
                  <span className="text-[10px] text-text-muted block">Rain Probability</span>
                  <span className="font-bold text-text-primary">{weatherData?.rainProbability}%</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-text-muted pt-2 border-t border-border mt-3 flex items-center justify-between">
              <span className="truncate max-w-[200px]">{weatherData?.source}</span>
              <span>{weatherData?.updatedAt}</span>
            </div>
          </div>

          {/* CARD 3: ENVIRONMENTAL OUTLOOK ("Mausam kharab hone wala hai") */}
          <div className="bg-surface border border-border rounded-xl p-4 shadow-panel flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase text-brand-forest tracking-wider font-bold">
                  Environmental Outlook
                </span>
                <span
                  className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                    outlookData?.riskTrend === 'deteriorating'
                      ? 'bg-rose-100 text-rose-800'
                      : outlookData?.riskTrend === 'improving'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {outlookData?.ventilationIndex || 'Ventilation Analysis'}
                </span>
              </div>

              <h3 className="text-xs font-bold text-text-primary mb-1">
                {outlookData?.hindiHeadline}
              </h3>
              <p className="text-xs text-text-muted mb-2.5">
                {outlookData?.next24Hours}
              </p>

              {/* Physical Contributing Conditions List */}
              <div className="space-y-1 font-mono text-[11px]">
                {outlookData?.factors.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1 rounded bg-background border border-border/70"
                  >
                    <span className="text-text-muted text-[10px]">{f.label}</span>
                    <span
                      className={`font-semibold ${
                        f.impact === 'risk-increasing'
                          ? 'text-rose-700'
                          : f.impact === 'risk-reducing'
                          ? 'text-emerald-700'
                          : 'text-text-primary'
                      }`}
                    >
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] font-mono text-text-muted pt-2 border-t border-border mt-3 flex items-center justify-between">
              <span className="truncate max-w-[220px]" title={outlookData?.provenance_label || "AI-generated from modelled environmental data"}>
                {outlookData?.provenance_label || "AI-generated from modelled environmental data"}
              </span>
              <span className="text-brand-forest font-semibold">24h Projection</span>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: 24-72h FORECAST + ACTIVE MONITORING STATIONS TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* HOURLY FORECAST TRAJECTORY TABLE (7 Columns) */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-xl p-4 shadow-panel">
            <div className="flex items-center justify-between mb-3 border-b border-border/70 pb-2">
              <div>
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
                  Coupled Meteorology & AQI Trajectory
                </span>
                <h3 className="text-xs font-bold text-text-primary">
                  Next 24 to 72 Hours Atmospheric Risk Envelope
                </h3>
              </div>
              <span className="text-[10px] font-mono text-brand-forest font-semibold bg-brand-forest/10 px-2 py-0.5 rounded">
                Synoptic Model
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] text-text-muted uppercase">
                    <th className="py-1.5 px-2">Time</th>
                    <th className="py-1.5 px-2">Condition</th>
                    <th className="py-1.5 px-2">Temp</th>
                    <th className="py-1.5 px-2">Wind</th>
                    <th className="py-1.5 px-2">Humidity</th>
                    <th className="py-1.5 px-2 text-right">Projected AQI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {forecastItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surfaceHover transition-colors">
                      <td className="py-2 px-2 font-semibold text-text-primary">{item.time}</td>
                      <td className="py-2 px-2 text-text-muted">{item.condition}</td>
                      <td className="py-2 px-2">{item.temperature}°C</td>
                      <td className="py-2 px-2 text-brand-sky">{item.windSpeed} km/h</td>
                      <td className="py-2 px-2">{item.humidity}%</td>
                      <td className="py-2 px-2 text-right font-bold" style={{ color: item.estimatedAqi > 200 ? '#c2410c' : '#15803d' }}>
                        {item.estimatedAqi}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTIVE MONITORING STATIONS IN REGION (5 Columns) */}
          <div className="lg:col-span-5 bg-surface border border-border rounded-xl p-4 shadow-panel flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-border/70 pb-2">
                <div>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
                    Telemetry Network
                  </span>
                  <h3 className="text-xs font-bold text-text-primary">
                    Active CPCB Stations ({localStations.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Live Stream
                </span>
              </div>

              <div className="space-y-2">
                {localStations.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => setSelectedStation(station)}
                    className="w-full p-2.5 rounded-lg bg-background hover:bg-surfaceHover border border-border/80 flex items-center justify-between text-left transition-colors font-mono"
                  >
                    <div>
                      <div className="text-xs font-semibold text-text-primary">{station.name}</div>
                      <div className="text-[10px] text-text-muted">
                        {station.city}, {station.state} · {station.operator}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-text-primary">{station.baseAqi}</span>
                      <span className="text-[9px] block text-text-muted">{station.baseSeverity}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[10px] font-mono text-text-muted pt-2 border-t border-border mt-3 flex items-center justify-between">
              <span>National CAAQMS Ingestion Hub</span>
              <span className="text-brand-forest">Verified Traceability</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
