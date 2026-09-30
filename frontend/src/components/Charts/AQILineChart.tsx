'use client';
import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

export interface ExtendedForecastPoint {
  time: string;
  aqi: number;
  pm25: number;
  lower: number;
  upper: number;
  isHistorical?: boolean;
}

interface AQILineChartProps {
  data: ExtendedForecastPoint[];
  peakWindow?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0]?.payload;
    return (
      <div className="px-3.5 py-2.5 rounded-lg shadow-md border border-border bg-white/95 backdrop-blur-xs text-xs text-text-primary">
        <p className="text-[10px] font-semibold text-text-muted mb-1 uppercase tracking-wider">{label} {d?.isHistorical ? '(Observed)' : '(Predicted)'}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-brand-forest tabular-nums">{d?.aqi}</span>
          <span className="text-[11px] text-text-muted">AQI</span>
        </div>
        <p className="text-[11px] text-text-secondary mt-0.5">
          PM2.5: <strong className="text-text-primary">{d?.pm25} μg/m³</strong>
        </p>
        {d?.lower !== undefined && d?.upper !== undefined && !d?.isHistorical && (
          <p className="text-[10px] text-text-muted mt-1 border-t border-border pt-1">
            Modelled Uncertainty Range: <span className="font-mono text-text-secondary">{d.lower} – {d.upper}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function AQILineChart({ data }: AQILineChartProps) {
  const axisColor = '#64748b';
  const gridColor = '#e2e8f0';

  return (
    <div className="h-[340px] sm:h-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 15, right: 20, left: -5, bottom: 5 }}>
          <defs>
            <linearGradient id="aqiAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#166534" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#166534" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="confidenceEnvelopeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.03} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="time"
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
            domain={[0, 'dataMax + 40']}
            tickCount={6}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Regulatory Threshold Lines */}
          <ReferenceLine y={200} stroke="#d97706" strokeDasharray="3 3" label={{ value: 'Poor (200)', position: 'insideTopLeft', fill: '#b45309', fontSize: 10 }} />
          <ReferenceLine y={300} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Very Poor (300)', position: 'insideTopLeft', fill: '#b91c1c', fontSize: 10 }} />
          <ReferenceLine y={400} stroke="#991b1b" strokeDasharray="3 3" label={{ value: 'Severe (400)', position: 'insideTopLeft', fill: '#7f1d1d', fontSize: 10 }} />

          {/* Upper Envelope for Confidence Band */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="url(#confidenceEnvelopeGrad)"
          />

          {/* Lower Envelope Mask */}
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="#ffffff"
          />

          {/* Main AQI Prediction Trajectory */}
          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#166534"
            strokeWidth={2.5}
            fill="url(#aqiAreaGrad)"
            activeDot={{ r: 5, fill: '#166534', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
