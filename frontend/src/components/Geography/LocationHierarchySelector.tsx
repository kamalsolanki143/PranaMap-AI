'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  INDIA_STATES,
  IndiaState,
  IndiaDistrict,
  IndiaLocation,
  searchGeography,
  SearchItem,
} from '@/lib/indiaGeography';
import {
  ChevronRight,
  Search,
  MapPin,
  Globe,
  Radio,
  X,
  Compass,
  Check,
  Building,
} from 'lucide-react';

export default function LocationHierarchySelector() {
  const {
    geographyLevel,
    selectedState,
    selectedDistrict,
    selectedLocation,
    selectIndia,
    selectState,
    selectDistrict,
    selectLocation,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const [stateMenuOpen, setStateMenuOpen] = useState(false);
  const [districtMenuOpen, setDistrictMenuOpen] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);

  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setStateMenuOpen(false);
        setDistrictMenuOpen(false);
        setLocationMenuOpen(false);
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle instant search
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const hits = searchGeography(searchQuery);
      setSearchResults(hits);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSelectSearchResult = (hit: SearchItem) => {
    if (hit.type === 'state') {
      const found = INDIA_STATES.find(s => s.id === hit.id);
      if (found) selectState(found);
    } else if (hit.type === 'district' && hit.stateId) {
      const foundState = INDIA_STATES.find(s => s.id === hit.stateId);
      if (foundState) {
        const foundDist = foundState.districts.find(d => d.id === hit.id);
        if (foundDist) {
          selectState(foundState);
          selectDistrict(foundDist);
        }
      }
    } else if (hit.type === 'location' && hit.stateId && hit.districtId) {
      const foundState = INDIA_STATES.find(s => s.id === hit.stateId);
      if (foundState) {
        const foundDist = foundState.districts.find(d => d.id === hit.districtId);
        if (foundDist) {
          const foundLoc = foundDist.locations.find(l => l.id === hit.id);
          if (foundLoc) {
            selectState(foundState);
            selectDistrict(foundDist);
            selectLocation(foundLoc);
          }
        }
      }
    }
    setSearchQuery('');
    setSearchFocused(false);
  };

  const filteredStates = INDIA_STATES.filter(s =>
    s.name.toLowerCase().includes(stateFilter.toLowerCase())
  );

  const filteredDistricts = (selectedState?.districts || []).filter(d =>
    d.name.toLowerCase().includes(districtFilter.toLowerCase())
  );

  const filteredLocations = (selectedDistrict?.locations || []).filter(l =>
    l.name.toLowerCase().includes(locationFilter.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative w-full z-40 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* CASCADING GEOGRAPHY BREADCRUMB */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs font-mono">
          
          {/* Level 1: India */}
          <button
            onClick={() => {
              selectIndia();
              setStateMenuOpen(false);
              setDistrictMenuOpen(false);
              setLocationMenuOpen(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all font-semibold ${
              geographyLevel === 'india'
                ? 'bg-brand-forest text-white shadow-xs'
                : 'bg-surface hover:bg-surfaceHover text-text-primary border border-border/60'
            }`}
            title="Zoom out to India National Overview"
          >
            <Globe size={13} className="text-brand-earth" />
            <span>INDIA</span>
          </button>

          <ChevronRight size={13} className="text-text-muted opacity-60" />

          {/* Level 2: State Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setStateMenuOpen(!stateMenuOpen);
                setDistrictMenuOpen(false);
                setLocationMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all font-medium ${
                geographyLevel === 'state'
                  ? 'bg-brand-forest text-white shadow-xs'
                  : selectedState
                  ? 'bg-surface hover:bg-surfaceHover text-text-primary border border-border/70'
                  : 'bg-surface/50 text-text-muted border border-dashed border-border'
              }`}
            >
              <span>{selectedState ? selectedState.name : 'Select State'}</span>
              <span className="text-[10px] opacity-70">▼</span>
            </button>

            {/* State Dropdown Menu */}
            {stateMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-surface border border-border rounded-lg shadow-elevation p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="relative mb-2">
                  <Search size={12} className="absolute left-2.5 top-2.5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search state..."
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-background border border-border rounded focus:outline-none focus:border-brand-forest text-text-primary"
                    autoFocus
                  />
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5 text-xs">
                  {filteredStates.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        selectState(s);
                        setStateMenuOpen(false);
                        setStateFilter('');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors ${
                        selectedState?.id === s.id
                          ? 'bg-brand-forest/10 text-brand-forest font-semibold'
                          : 'hover:bg-surfaceHover text-text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-text-muted">{s.code}</span>
                        <span>{s.name}</span>
                      </div>
                      <span className="text-[10px] text-text-muted">{s.activeStations} stations</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedState && (
            <>
              <ChevronRight size={13} className="text-text-muted opacity-60" />

              {/* Level 3: District Selector */}
              <div className="relative">
                <button
                  onClick={() => {
                    setDistrictMenuOpen(!districtMenuOpen);
                    setStateMenuOpen(false);
                    setLocationMenuOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all font-medium ${
                    geographyLevel === 'district'
                      ? 'bg-brand-forest text-white shadow-xs'
                      : selectedDistrict
                      ? 'bg-surface hover:bg-surfaceHover text-text-primary border border-border/70'
                      : 'bg-surface/50 text-text-muted border border-dashed border-border'
                  }`}
                >
                  <span>{selectedDistrict ? selectedDistrict.name : 'Select District'}</span>
                  <span className="text-[10px] opacity-70">▼</span>
                </button>

                {/* District Dropdown Menu */}
                {districtMenuOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-60 bg-surface border border-border rounded-lg shadow-elevation p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="relative mb-2">
                      <Search size={12} className="absolute left-2.5 top-2.5 text-text-muted" />
                      <input
                        type="text"
                        placeholder="Search district..."
                        value={districtFilter}
                        onChange={(e) => setDistrictFilter(e.target.value)}
                        className="w-full pl-7 pr-3 py-1.5 text-xs bg-background border border-border rounded focus:outline-none focus:border-brand-forest text-text-primary"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto space-y-0.5 text-xs">
                      {filteredDistricts.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => {
                            selectDistrict(d);
                            setDistrictMenuOpen(false);
                            setDistrictFilter('');
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors ${
                            selectedDistrict?.id === d.id
                              ? 'bg-brand-forest/10 text-brand-forest font-semibold'
                              : 'hover:bg-surfaceHover text-text-primary'
                          }`}
                        >
                          <span>{d.name}</span>
                          <span className="text-[10px] text-text-muted">{d.locations.length} locations</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {selectedDistrict && (
            <>
              <ChevronRight size={13} className="text-text-muted opacity-60" />

              {/* Level 4: Location Selector */}
              <div className="relative">
                <button
                  onClick={() => {
                    setLocationMenuOpen(!locationMenuOpen);
                    setStateMenuOpen(false);
                    setDistrictMenuOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all font-semibold ${
                    geographyLevel === 'location'
                      ? 'bg-brand-forest text-white shadow-xs'
                      : selectedLocation
                      ? 'bg-surface hover:bg-surfaceHover text-text-primary border border-border/70'
                      : 'bg-surface/50 text-text-muted border border-dashed border-border'
                  }`}
                >
                  <MapPin size={12} className={geographyLevel === 'location' ? 'text-white' : 'text-brand-forest'} />
                  <span>{selectedLocation ? selectedLocation.name : 'Select Location'}</span>
                  <span className="text-[10px] opacity-70">▼</span>
                </button>

                {/* Location Dropdown Menu */}
                {locationMenuOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-64 bg-surface border border-border rounded-lg shadow-elevation p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="relative mb-2">
                      <Search size={12} className="absolute left-2.5 top-2.5 text-text-muted" />
                      <input
                        type="text"
                        placeholder="Search location / town..."
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full pl-7 pr-3 py-1.5 text-xs bg-background border border-border rounded focus:outline-none focus:border-brand-forest text-text-primary"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto space-y-0.5 text-xs">
                      {filteredLocations.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => {
                            selectLocation(l);
                            setLocationMenuOpen(false);
                            setLocationFilter('');
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors ${
                            selectedLocation?.id === l.id
                              ? 'bg-brand-forest/10 text-brand-forest font-semibold'
                              : 'hover:bg-surfaceHover text-text-primary'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{l.name}</span>
                          </div>
                          {l.hasDirectStation ? (
                            <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium">CAAQMS</span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded">Area</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* QUICK SEARCH AUTOCOMPLETE INPUT */}
        <div className="relative w-full md:w-80">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-text-muted" />
            <input
              type="text"
              placeholder="Search town, district or city (e.g. Raniwara)..."
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-background border border-border rounded-lg shadow-inner focus:outline-none focus:border-brand-forest focus:ring-1 focus:ring-brand-forest text-text-primary placeholder:text-text-muted"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-text-muted hover:text-text-primary"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Instant Search Results Dropdown */}
          {searchFocused && searchResults.length > 0 && (
            <div className="absolute right-0 top-full mt-1.5 w-full md:w-96 bg-surface border border-border rounded-lg shadow-elevation p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] font-mono text-text-muted px-2 py-1 uppercase tracking-wider border-b border-border/50 mb-1">
                Matched Geography ({searchResults.length})
              </div>
              <div className="space-y-0.5">
                {searchResults.map((hit) => (
                  <button
                    key={`${hit.type}-${hit.id}`}
                    onClick={() => handleSelectSearchResult(hit)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded text-left hover:bg-surfaceHover transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-background border border-border/70 text-brand-forest group-hover:bg-brand-forest group-hover:text-white transition-colors">
                        {hit.type === 'state' ? (
                          <Globe size={13} />
                        ) : hit.type === 'district' ? (
                          <Building size={13} />
                        ) : (
                          <MapPin size={13} />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-text-primary">{hit.name}</div>
                        <div className="text-[10px] text-text-muted">{hit.subtitle}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-background border border-border rounded text-text-muted">
                      {hit.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
