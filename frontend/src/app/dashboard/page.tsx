import TopBar from "@/components/Common/TopBar";
import AQIBadge, { getAQIColor } from "@/components/Common/AQIBadge";
import AIInsightBanner from "@/components/Common/AIInsightBanner";
import MapPlaceholder from "@/components/Map/MapPlaceholder";
import { fetchCommandCenter } from "@/services/api";
import Link from "next/link";

const statusColors: Record<string, string> = {
  Good: "#4ade80", Satisfactory: "#00f5ff", Moderate: "#eab308",
  Poor: "#ffdb3f", "Very Poor": "#ffb4ab", Severe: "#ef4444",
};

export default async function CommandCenterPage() {
  const data = await fetchCommandCenter();

  return (
    <>
      <TopBar title="Command Center" />
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>

        {/* ── LEFT PANEL ── */}
        <aside
          className="flex flex-col gap-5 p-6 overflow-y-auto"
          style={{ width: "380px", minWidth: "380px", borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Current AQI */}
          <div
            className="p-6 rounded-xl relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="h-1 absolute top-0 left-0 right-0" style={{ background: "linear-gradient(90deg, #00f5ff 0%, #ffdb3f 50%, #ffb4ab 100%)" }} />
            <p className="font-inter font-bold uppercase mb-3" style={{ fontSize: "10px", color: "rgba(185,202,202,0.5)", letterSpacing: "0.08em" }}>
              CURRENT AQI — {data.region}
            </p>
            <div className="flex items-end gap-4">
              <div>
                <span
                  className="font-mono font-bold leading-none block"
                  style={{ fontSize: "72px", color: getAQIColor(data.live_status), fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 30px ${getAQIColor(data.live_status)}60` }}
                >
                  {data.live_aqi}
                </span>
                <span
                  className="font-inter font-bold uppercase tracking-widest"
                  style={{ fontSize: "12px", color: getAQIColor(data.live_status) }}
                >
                  {data.live_status}
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontSize: "9px", color: "rgba(185,202,202,0.4)", fontFamily: "'Inter', sans-serif" }}>FORECAST PEAK</p>
                <p style={{ fontSize: "14px", color: "#e0e2ea", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{data.forecast_peak_time}</p>
              </div>
              <div className="p-3 rounded" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontSize: "9px", color: "rgba(185,202,202,0.4)", fontFamily: "'Inter', sans-serif" }}>AVG WIND</p>
                <p style={{ fontSize: "14px", color: "#e0e2ea", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{data.avg_wind}</p>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <AIInsightBanner
            text={data.ai_insight}
            confidence={data.ai_confidence}
            actionLabel="View Enforcement"
          />

          {/* Ward Rankings */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-inter font-bold uppercase" style={{ fontSize: "11px", color: "rgba(185,202,202,0.7)", letterSpacing: "0.06em" }}>Top Critical Wards</h3>
              <Link href="/enforcement" className="font-inter font-bold uppercase hover:text-[#00f5ff] transition-colors" style={{ fontSize: "10px", color: "rgba(185,202,202,0.4)" }}>
                SEE ALL
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {data.wards.slice(0, 7).map((ward, i) => (
                <div
                  key={ward.sensor_id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg transition-all hover:bg-white/5 cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="font-mono font-bold"
                      style={{ fontSize: "11px", color: "rgba(185,202,202,0.35)", width: "16px", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-inter font-semibold" style={{ fontSize: "12px" }}>{ward.name}</p>
                      <p className="font-mono" style={{ fontSize: "10px", color: "rgba(185,202,202,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
                        {ward.sensor_id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <AQIBadge aqi={ward.aqi} status={ward.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── MAIN MAP ── */}
        <main className="flex-1 relative">
          <MapPlaceholder />

          {/* Floating quick links */}
          <div className="absolute bottom-6 left-6 flex gap-3 z-10">
            {[
              { href: "/forecast", icon: "timeline", label: "Forecast" },
              { href: "/attribution", icon: "analytics", label: "Attribution" },
              { href: "/enforcement", icon: "edit_notifications", label: "Enforce" },
              { href: "/advisory", icon: "campaign", label: "Advisory" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-inter font-bold uppercase text-xs transition-all hover:brightness-110"
                style={{
                  background: "rgba(10,14,19,0.85)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(0,245,255,0.3)",
                  color: "#00f5ff",
                  fontSize: "10px",
                  letterSpacing: "0.06em",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </main>
      </div>

      {/* ── STATUS BAR ── */}
      <footer
        className="flex items-center justify-between px-6 h-10 flex-shrink-0"
        style={{
          background: "#0a0e13",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" style={{ boxShadow: "0 0 6px rgba(74,222,128,0.8)" }} />
          <span className="font-mono" style={{ fontSize: "10px", color: "rgba(185,202,202,0.5)", fontFamily: "'JetBrains Mono', monospace" }}>
            ALL SYSTEMS OPERATIONAL
          </span>
        </div>
        <span className="font-mono" style={{ fontSize: "10px", color: "rgba(185,202,202,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
          1,242 ACTIVE NODES | LATENCY: 4ms
        </span>
        <span className="font-mono" style={{ fontSize: "10px", color: "rgba(185,202,202,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
          © 2024 PRANAMAP AI
        </span>
      </footer>
    </>
  );
}
