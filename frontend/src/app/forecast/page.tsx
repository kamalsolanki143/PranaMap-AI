import TopBar from "@/components/Common/TopBar";
import AQILineChart from "@/components/Charts/AQILineChart";
import ConfidenceGauge from "@/components/Charts/ConfidenceGauge";
import AIInsightBanner from "@/components/Common/AIInsightBanner";
import { fetchForecast } from "@/services/api";
import Link from "next/link";

const wards = [
  "Dwarka Ward 34", "Rohini Sector 7", "Anand Vihar",
  "Punjabi Bagh", "Lodhi Garden", "Okhla Ph-3",
];

const GRAP_THRESHOLDS = [
  { label: "GRAP I", aqi: "0–200", color: "#4ade80" },
  { label: "GRAP II", aqi: "201–300", color: "#eab308" },
  { label: "GRAP III", aqi: "301–400", color: "#f97316" },
  { label: "GRAP IV", aqi: "401+", color: "#ef4444" },
];

export default async function ForecastPage() {
  const data = await fetchForecast();

  return (
    <>
      <TopBar>
        <select
          className="px-4 py-2 rounded font-inter font-bold text-xs uppercase tracking-wide border-0 outline-none transition-all"
          style={{
            background: "rgba(10,14,19,0.8)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#00f5ff",
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "0.04em",
          }}
          defaultValue="Dwarka Ward 34"
        >
          {wards.map((w) => (
            <option key={w} value={w} style={{ background: "#1c2025" }}>
              {w}
            </option>
          ))}
        </select>
      </TopBar>

      <div className="flex-1 overflow-y-auto p-8">
        {/* ── Page Header ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-geist font-semibold mb-1" style={{ fontSize: "28px", color: "#e0e2ea" }}>
              AQI Forecast Explorer
            </h1>
            <p style={{ fontSize: "13px", color: "rgba(185,202,202,0.6)", fontFamily: "'JetBrains Mono', monospace" }}>
              {data.ward} · Generated: {new Date(data.generated_at).toLocaleString("en-IN")} · Trend:{" "}
              <span style={{ color: data.trend === "Rising" ? "#ffb4ab" : "#4ade80", fontWeight: 700 }}>
                ▲ {data.trend_pct}% {data.trend}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="font-inter font-bold uppercase" style={{ fontSize: "9px", color: "rgba(185,202,202,0.4)", letterSpacing: "0.06em" }}>Today Avg</p>
              <p className="font-mono font-bold" style={{ fontSize: "22px", fontFamily: "'JetBrains Mono', monospace" }}>{data.today_avg}</p>
            </div>
            <div style={{ width: "1px", height: "40px", background: "rgba(255,255,255,0.08)" }} />
            <div className="text-center">
              <p className="font-inter font-bold uppercase" style={{ fontSize: "9px", color: "rgba(185,202,202,0.4)", letterSpacing: "0.06em" }}>Tomorrow</p>
              <p className="font-mono font-bold" style={{ fontSize: "22px", color: "#ffb4ab", fontFamily: "'JetBrains Mono', monospace" }}>{data.tomorrow_predicted}</p>
            </div>
          </div>
        </div>

        {/* ── Main Chart Card ── */}
        <div
          className="p-6 rounded-xl mb-6"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-inter font-bold uppercase" style={{ fontSize: "11px", color: "rgba(185,202,202,0.5)", letterSpacing: "0.08em" }}>
                72-HOUR PREDICTIVE FORECAST WITH CONFIDENCE BAND
              </h2>
              <p className="font-mono mt-1" style={{ fontSize: "10px", color: "rgba(185,202,202,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
                XGBoost + LightGBM Ensemble · NCUM Meteorological Integration
              </p>
            </div>
            <ConfidenceGauge value={data.model_confidence} size={80} />
          </div>
          <AQILineChart data={data.points} />

          {/* Timeline track */}
          <div className="mt-4 h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full"
              style={{ width: "62%", background: "linear-gradient(90deg, #00f5ff 0%, #ffdb3f 50%, #ffb4ab 100%)" }}
            />
          </div>
        </div>

        {/* ── Hourly Data Table + GRAP + AI Insight ── */}
        <div className="grid grid-cols-12 gap-6">
          {/* Hourly Points */}
          <div
            className="col-span-7 p-5 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h3 className="font-inter font-bold uppercase mb-4" style={{ fontSize: "11px", color: "rgba(185,202,202,0.5)", letterSpacing: "0.08em" }}>
              HOURLY BREAKDOWN
            </h3>
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-4 pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["TIME", "AQI", "PM2.5", "CONFIDENCE"].map((h) => (
                  <span key={h} className="font-inter font-bold uppercase" style={{ fontSize: "9px", color: "rgba(185,202,202,0.35)", letterSpacing: "0.06em" }}>
                    {h}
                  </span>
                ))}
              </div>
              {data.points.map((p) => (
                <div
                  key={p.time}
                  className="grid grid-cols-4 gap-4 py-2 rounded transition-all hover:bg-white/5 px-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                >
                  <span className="font-mono" style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }}>{p.time}</span>
                  <span
                    className="font-mono font-bold"
                    style={{
                      fontSize: "12px",
                      fontFamily: "'JetBrains Mono', monospace",
                      color: p.aqi > 300 ? "#ef4444" : p.aqi > 200 ? "#ffb4ab" : p.aqi > 100 ? "#ffdb3f" : "#00f5ff",
                    }}
                  >
                    {p.aqi}
                  </span>
                  <span className="font-mono" style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "rgba(185,202,202,0.7)" }}>
                    {p.pm25}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-full bg-[#00f5ff] rounded-full" style={{ width: `${p.confidence}%` }} />
                    </div>
                    <span className="font-mono" style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#00f5ff" }}>
                      {p.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="col-span-5 flex flex-col gap-5">
            {/* AI Insight */}
            <AIInsightBanner
              text={`${data.ward} is predicted to reach ${data.tomorrow_predicted} AQI by tomorrow — a ${data.trend_pct}% ${data.trend.toLowerCase()} trend. Primary driver: construction activity on the western sector and light north-westerly winds trapping particulates.`}
              confidence={data.model_confidence}
              actionLabel="See Attribution"
            />

            {/* GRAP Reference */}
            <div
              className="p-5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3 className="font-inter font-bold uppercase mb-4" style={{ fontSize: "11px", color: "rgba(185,202,202,0.5)", letterSpacing: "0.08em" }}>
                GRAP STAGE REFERENCE
              </h3>
              <div className="space-y-3">
                {GRAP_THRESHOLDS.map((g) => (
                  <div key={g.label} className="flex items-center justify-between py-2 px-3 rounded" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="font-inter font-bold" style={{ fontSize: "12px", color: g.color }}>{g.label}</span>
                    <span className="font-mono" style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "rgba(185,202,202,0.7)" }}>AQI {g.aqi}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick link to attribution */}
            <Link
              href="/attribution"
              className="p-5 rounded-xl flex items-center justify-between transition-all hover:bg-white/[0.07] group"
              style={{
                background: "rgba(0,245,255,0.04)",
                border: "1px solid rgba(0,245,255,0.2)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div>
                <p className="font-inter font-bold uppercase" style={{ fontSize: "10px", color: "#00f5ff", letterSpacing: "0.06em" }}>INVESTIGATE CAUSES</p>
                <p className="text-sm mt-1" style={{ color: "rgba(185,202,202,0.6)" }}>Source Attribution Engine →</p>
              </div>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ color: "#00f5ff" }}>
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
