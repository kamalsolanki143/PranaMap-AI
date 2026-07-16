"use client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { ForecastPoint } from "@/types";

interface AQILineChartProps {
  data: ForecastPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-4 py-3 rounded-lg"
        style={{
          background: "rgba(26,32,37,0.95)",
          border: "1px solid rgba(0,245,255,0.3)",
          backdropFilter: "blur(12px)",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <p style={{ color: "rgba(185,202,202,0.7)", fontSize: "10px", marginBottom: 4 }}>{label}</p>
        <p style={{ color: "#00f5ff", fontSize: "16px", fontWeight: 700 }}>
          {payload[0]?.value} <span style={{ fontSize: "10px", opacity: 0.6 }}>AQI</span>
        </p>
        <p style={{ color: "rgba(185,202,202,0.6)", fontSize: "10px" }}>
          PM2.5: {payload[0]?.payload?.pm25} μg/m³
        </p>
        <p style={{ color: "rgba(185,202,202,0.5)", fontSize: "10px" }}>
          Confidence: {payload[0]?.payload?.confidence}%
        </p>
      </div>
    );
  }
  return null;
};

export default function AQILineChart({ data }: AQILineChartProps) {
  return (
    <div className="h-[360px] w-full chart-fade">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.06} />
              <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: "rgba(185,202,202,0.4)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(185,202,202,0.4)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 350]}
            tickCount={5}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(0,245,255,0.2)", strokeWidth: 1 }} />
          {/* Confidence band upper */}
          <Area
            dataKey="upper"
            stroke="none"
            fill="url(#bandGrad)"
            fillOpacity={1}
            legendType="none"
          />
          {/* Main AQI line */}
          <Area
            dataKey="aqi"
            stroke="#00f5ff"
            strokeWidth={2}
            fill="url(#aqiGrad)"
            dot={false}
            activeDot={{ r: 6, fill: "#00f5ff", stroke: "rgba(0,245,255,0.4)", strokeWidth: 4 }}
          />
          {/* AQI threshold lines */}
          <ReferenceLine y={200} stroke="rgba(255,219,63,0.3)" strokeDasharray="4 4" />
          <ReferenceLine y={300} stroke="rgba(255,180,171,0.3)" strokeDasharray="4 4" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
