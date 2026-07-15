'use client';
import React from 'react';
import MapContainer from './MapContainer';

export default function AQIMap() {
  // AQIMap now simply renders the unified MapContainer.
  // We keep this file around so we don't break dashboard/page.tsx imports.
  return <MapContainer />;
}
