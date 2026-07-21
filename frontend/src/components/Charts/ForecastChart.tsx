'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const DEFAULT_DATA = [
  { time: '00:00', aqi: 150 },
  { time: '04:00', aqi: 145 },
  { time: '08:00', aqi: 180 },
  { time: '12:00', aqi: 195 },
  { time: '16:00', aqi: 170 },
  { time: '20:00', aqi: 155 },
  { time: '24:00', aqi: 160 },
];

interface ForecastChartProps {
  data?: { time: string; aqi: number }[];
}

export default function ForecastChart({ data }: ForecastChartProps) {
  const chartData = data || DEFAULT_DATA;
  const peak = Math.max(...chartData.map(d => d.aqi));

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wider flex justify-between">
        <span>Timeline (Next 24h)</span>
        <span className="text-aqi-sensitive">Peak: {peak} AQI</span>
      </div>
      <div className="flex-1 w-full min-h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 20', 'dataMax + 20']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#11141A', borderColor: '#262B36', borderRadius: '8px', color: '#E2E8F0', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.5)' }}
              itemStyle={{ color: '#F97316', fontWeight: 'bold' }}
              labelStyle={{ color: '#94A3B8', marginBottom: '4px' }}
            />
            <ReferenceLine y={150} stroke="#EF4444" strokeDasharray="3 3" opacity={0.5} />
            <Line type="monotone" dataKey="aqi" stroke="#F97316" strokeWidth={3} dot={{ r: 4, fill: '#11141A', strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0, fill: '#F97316' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
