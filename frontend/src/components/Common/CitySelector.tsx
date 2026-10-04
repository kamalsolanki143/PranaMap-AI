'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { INDIAN_CITIES } from '@/lib/cities';
import { INDIA_STATES } from '@/lib/indiaGeography';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/i18n/LanguageContext';
import { CityConfig } from '@/types';

interface CitySelectorProps {
  className?: string;
  onCityChange?: (city: CityConfig) => void;
}

export default function CitySelector({ className = '', onCityChange }: CitySelectorProps) {
  const { t } = useTranslation();
  const {
    selectedCity,
    setSelectedCity,
    selectState,
    selectDistrict,
    selectLocation,
  } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(city: CityConfig) {
    setSelectedCity(city);
    setIsOpen(false);

    // Synchronize Pan-India geography hierarchy
    const cityStateMap: Record<string, { stateId: string; districtId?: string; locId?: string }> = {
      'delhi-ncr': { stateId: 'delhi', districtId: 'east-delhi', locId: 'anand-vihar' },
      'mumbai': { stateId: 'maharashtra', districtId: 'mumbai-suburban', locId: 'bandra-kurla-complex' },
      'ahmedabad': { stateId: 'gujarat', districtId: 'ahmedabad', locId: 'maninagar' },
      'jaipur': { stateId: 'rajasthan', districtId: 'jaipur', locId: 'jaipur-mansarovar' },
      'lucknow': { stateId: 'uttar-pradesh', districtId: 'lucknow', locId: 'lalbagh' },
      'kolkata': { stateId: 'west-bengal', districtId: 'kolkata', locId: 'victoria-memorial' },
      'bengaluru': { stateId: 'karnataka', districtId: 'bengaluru-urban', locId: 'btm-layout' },
      'hyderabad': { stateId: 'telangana', districtId: 'hyderabad', locId: 'sanathnagar' },
      'chennai': { stateId: 'tamil-nadu', districtId: 'chennai', locId: 'alandur' },
    };

    const target = cityStateMap[city.id];
    if (target) {
      const stateObj = INDIA_STATES.find(s => s.id === target.stateId);
      if (stateObj) {
        selectState(stateObj);
        if (target.districtId) {
          const distObj = stateObj.districts.find(d => d.id === target.districtId);
          if (distObj) {
            selectDistrict(distObj);
            if (target.locId) {
              const locObj = distObj.locations.find(l => l.id === target.locId);
              if (locObj) selectLocation(locObj);
            }
          }
        }
      }
    }

    if (onCityChange) onCityChange(city);
  }

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (aqi <= 100) return 'text-lime-400 bg-lime-500/10 border-lime-500/20';
    if (aqi <= 200) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (aqi <= 300) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surfaceHover text-text-primary text-xs sm:text-sm font-medium transition-colors shadow-sm"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <MapPin size={15} className="text-brand-forest shrink-0" />
        <span className="font-semibold">{selectedCity.name}</span>
        <span className="text-text-muted text-xs hidden md:inline">({selectedCity.state})</span>
        <ChevronDown size={14} className={`text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full mt-1.5 w-72 max-h-96 overflow-y-auto rounded-lg border border-border bg-surface shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100"
          role="listbox"
          aria-label="Select Indian City"
        >
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted border-b border-border mb-1">
            {t('nav.indiaNetwork', 'National Clean Air Network')} ({INDIAN_CITIES.length} {t('loc.city', 'Cities')})
          </div>
          {INDIAN_CITIES.map((city) => {
            const isSelected = city.id === selectedCity.id;
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => handleSelect(city)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs text-left transition-colors ${
                  isSelected ? 'bg-brand-forest/10 text-brand-forest font-semibold' : 'text-text-secondary hover:bg-surfaceHover hover:text-text-primary'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex items-center gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary truncate">{city.name}</p>
                    <p className="text-[11px] text-text-muted truncate">{city.state} • {city.activeStations} {t('loc.monitoringStation', 'stations')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] border font-mono tabular-nums ${getAqiColor(city.avgAqi)}`}>
                    {t('env.aqi', 'AQI')} {city.avgAqi}
                  </span>
                  {isSelected && <Check size={14} className="text-brand-forest" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
