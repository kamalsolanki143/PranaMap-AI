import TopBar from "@/components/Common/TopBar";
import PriorityBadge from "@/components/Common/PriorityBadge";
import MetricCard from "@/components/Common/MetricCard";
import { fetchEnforcement } from "@/services/api";
import Link from "next/link";

const priorityColors: Record<string, string> = {
  CRITICAL: "#ffb4ab", HIGH: "#f97316", MEDIUM: "#eab308", LOW: "#4ade80",
};

export default async function EnforcementPage() {
  const data = await fetchEnforcement();

  return (
    <>
      <TopBar title="Enforcement Planner" />
      <div className="flex-1 overflow-y-auto p-8">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          <MetricCard label="Total Wards" value={data.total_wards} icon="location_city" />
          <MetricCard label="Critical Zones" value={data.critical_zones} icon="warning" color="#ffb4ab" iconBg="rgba(255,180,171,0.1)" />
          <MetricCard label="Active Missions" value={data.active_missions} icon="edit_notifications" color="#00f5ff" iconBg="rgba(0,245,255,0.1)" />
          <MetricCard
            label="Projected Impact"
            value={`${data.projected_impact_pct}%`}
            icon="trending_down"
            color="#4ade80"
            iconBg="rgba(74,222,128,0.1)"
          />
        </div>

        {/* ── Ward Table ── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Table header */}
          <div
            className="grid gap-4 px-6 py-4"
            style={{
              gridTemplateColumns: "140px 1fr 100px 100px 1fr",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {["PRIORITY", "WARD / UID", "CURRENT AQI", "PROJECTED", "ROOT CAUSE"].map((h) => (
              <span
                key={h}
                className="font-inter font-bold uppercase"
                style={{ fontSize: "9px", color: "rgba(185,202,202,0.35)", letterSpacing: "0.06em" }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {data.wards.map((ward, idx) => (
            <details
              key={ward.id}
              className="group border-b"
              style={{ borderColor: "rgba(255,255,255,0.04)" }}
            >
              <summary
                className="grid gap-4 px-6 py-5 cursor-pointer transition-all hover:bg-white/[0.03] list-none"
                style={{
                  gridTemplateColumns: "140px 1fr 100px 100px 1fr",
                  borderLeft: `4px solid ${priorityColors[ward.priority]}`,
                }}
              >
                <div className="flex items-center">
                  <PriorityBadge priority={ward.priority} />
                </div>
                <div>
                  <p className="font-inter font-semibold" style={{ fontSize: "13px" }}>{ward.ward}</p>
                  <p className="font-mono" style={{ fontSize: "10px", color: "rgba(185,202,202,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {ward.uid}
                  </p>
                </div>
                <div>
                  <p
                    className="font-mono font-bold"
                    style={{
                      fontSize: "18px",
                      fontFamily: "'JetBrains Mono', monospace",
                      color: priorityColors[ward.priority],
                    }}
                  >
                    {ward.current_aqi}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ color: "#4ade80" }}>trending_down</span>
                  <span className="font-mono font-bold" style={{ fontSize: "16px", color: "#4ade80", fontFamily: "'JetBrains Mono', monospace" }}>{ward.projected_aqi}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ color: "rgba(185,202,202,0.4)", fontVariationSettings: "'FILL' 1" }}>
                      {ward.primary_source_icon}
                    </span>
                    <span style={{ fontSize: "12px", color: "rgba(185,202,202,0.7)" }}>{ward.primary_source}</span>
                  </div>
                  <span className="material-symbols-outlined text-sm group-open:rotate-180 transition-transform" style={{ color: "rgba(185,202,202,0.4)" }}>
                    expand_more
                  </span>
                </div>
              </summary>

              {/* Expanded Detail */}
              <div
                className="px-8 py-5"
                style={{
                  background: "rgba(0,0,0,0.2)",
                  borderLeft: `4px solid ${priorityColors[ward.priority]}`,
                }}
              >
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Root Cause */}
                  <div className="md:col-span-2">
                    <p className="font-inter font-bold uppercase mb-2" style={{ fontSize: "9px", color: "rgba(185,202,202,0.4)", letterSpacing: "0.06em" }}>
                      AI ROOT CAUSE ANALYSIS
                    </p>
                    <p style={{ fontSize: "13px", color: "rgba(185,202,202,0.8)", lineHeight: "20px" }}>{ward.root_cause}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {ward.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded font-mono"
                          style={{ fontSize: "9px", background: "rgba(255,255,255,0.06)", color: "rgba(185,202,202,0.6)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions + Assignment */}
                  <div>
                    <p className="font-inter font-bold uppercase mb-2" style={{ fontSize: "9px", color: "rgba(185,202,202,0.4)", letterSpacing: "0.06em" }}>
                      RECOMMENDED ACTIONS
                    </p>
                    <div className="space-y-2 mb-4">
                      {ward.actions.map((action, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-sm mt-px flex-shrink-0" style={{ color: "#00f5ff", fontVariationSettings: "'FILL' 1" }}>
                            check_circle
                          </span>
                          <p style={{ fontSize: "11px", color: "rgba(185,202,202,0.7)" }}>{action.label}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
                      <p className="font-inter font-bold uppercase mb-1" style={{ fontSize: "9px", color: "rgba(185,202,202,0.4)", letterSpacing: "0.06em" }}>
                        ASSIGNED TO
                      </p>
                      <p style={{ fontSize: "12px", color: "#e0e2ea" }}>{ward.lead}</p>
                      <p style={{ fontSize: "10px", color: "rgba(185,202,202,0.4)" }}>{ward.department}</p>
                    </div>
                  </div>
                </div>

                {/* Deploy Button */}
                <div className="mt-4 flex gap-3">
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 rounded font-inter font-bold uppercase text-xs transition-all hover:brightness-110"
                    style={{
                      background: "#00f5ff",
                      color: "#003739",
                      letterSpacing: "0.06em",
                      boxShadow: "0 0 15px rgba(0,245,255,0.25)",
                    }}
                  >
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                    Deploy Response Team
                  </button>
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 rounded font-inter font-bold uppercase text-xs transition-all hover:bg-white/10"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(185,202,202,0.7)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    <span className="material-symbols-outlined text-sm">description</span>
                    Generate Report
                  </button>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
