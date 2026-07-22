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
import { useTheme } from "@/theme/ThemeContext";

interface AQILineChartProps {
  data: ForecastPoint[];
}

const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md"
        style={{
          background: isDark ? "rgba(18,24,32,0.95)" : "rgba(255,255,255,0.95)",
          borderColor: isDark ? "rgba(6,182,212,0.3)" : "rgba(6,182,212,0.5)",
          color: isDark ? "#f1f5f9" : "#0f172a",
        }}
      >
        <p className="text-[10px] mb-1 opacity-70">{label}</p>
        <p className="text-base font-bold text-accent-cyan">
          {payload[0]?.value} <span className="text-[10px] opacity-70">AQI</span>
        </p>
        <p className="text-[11px] opacity-80">
          PM2.5: {payload[0]?.payload?.pm25} μg/m³
        </p>
        <p className="text-[10px] opacity-60">
          Confidence: {payload[0]?.payload?.confidence}%
        </p>
      </div>
    );
  }
  return null;
};

export default function AQILineChart({ data }: AQILineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const axisColor = isDark ? "rgba(148, 163, 184, 0.6)" : "rgba(71, 85, 105, 0.7)";
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  return (
    <div className="h-[320px] sm:h-[360px] w-full chart-fade">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 350]}
            tickCount={5}
          />
          <Tooltip content={<CustomTooltip isDark={isDark} />} cursor={{ stroke: "rgba(6,182,212,0.3)", strokeWidth: 1 }} />
          <Area
            dataKey="upper"
            stroke="none"
            fill="url(#bandGrad)"
            fillOpacity={1}
          />
          <Area
            dataKey="aqi"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fill="url(#aqiGrad)"
            dot={false}
            activeDot={{ r: 6, fill: "#06b6d4", stroke: "rgba(6,182,212,0.4)", strokeWidth: 4 }}
          />
          <ReferenceLine y={200} stroke="rgba(245,158,11,0.5)" strokeDasharray="4 4" />
          <ReferenceLine y={300} stroke="rgba(239,68,68,0.5)" strokeDasharray="4 4" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

