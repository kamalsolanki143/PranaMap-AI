import TopBar from "@/components/Common/TopBar";
import AQIBadge from "@/components/Common/AQIBadge";
import MetricCard from "@/components/Common/MetricCard";
import { fetchAdvisory } from "@/services/api";
import { AdvisoryStatus } from "@/types";

const statusBadge: Record<AdvisoryStatus, { color: string; bg: string; label: string }> = {
  SENT: { color: "#4ade80", bg: "rgba(74,222,128,0.1)", label: "SENT" },
  PENDING: { color: "#eab308", bg: "rgba(234,179,8,0.1)", label: "PENDING" },
  QUEUED: { color: "rgba(185,202,202,0.5)", bg: "rgba(255,255,255,0.05)", label: "QUEUED" },
};

const languages = ["ENGLISH", "HINDI", "BENGALI", "PUNJABI"];

const logColors: Record<string, string> = {
  "primary-container": "#00f5ff",
  "tertiary-container": "#ffdb3f",
  "error": "#ffb4ab",
};

export default async function AdvisoryPage() {
  const data = await fetchAdvisory();

  return (
    <>
      <TopBar title="Citizen Advisory Portal" />
      <div className="flex-1 overflow-y-auto p-8">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <MetricCard label="SMS Delivered" value={data.total_sms} icon="sms" color="#00f5ff" iconBg="rgba(0,245,255,0.1)" />
          <MetricCard label="App Reach" value={data.app_reach} icon="smartphone" color="#4ade80" iconBg="rgba(74,222,128,0.1)" />
          <MetricCard label="Delivery Rate" value={`${data.delivery_rate}%`} icon="check_circle" color="#00f5ff" iconBg="rgba(0,245,255,0.1)" />
        </div>

        {/* ── Language Selector ── */}
        <div className="flex items-center gap-2 mb-8">
          <span className="font-inter font-bold uppercase mr-2" style={{ fontSize: "10px", color: "rgba(185,202,202,0.5)", letterSpacing: "0.06em" }}>
            LANGUAGE:
          </span>
          {languages.map((lang, i) => (
            <button
              key={lang}
              className="px-4 py-2 rounded font-inter font-bold uppercase text-xs transition-all"
              style={{
                letterSpacing: "0.06em",
                background: i === 0 ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.04)",
                border: i === 0 ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
                color: i === 0 ? "#00f5ff" : "rgba(185,202,202,0.6)",
              }}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">

          {/* ── Advisory Cards ── */}
          <div className="col-span-8 space-y-5">
            {data.advisories.map((adv) => (
              <div
                key={adv.id}
                className="p-6 rounded-xl transition-all hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="material-symbols-outlined text-base"
                        style={{ color: "#00f5ff", fontVariationSettings: "'FILL' 1" }}
                      >
                        location_on
                      </span>
                      <h3 className="font-geist font-semibold" style={{ fontSize: "16px" }}>{adv.ward}</h3>
                    </div>
                    <div className="flex items-center gap-3 ml-7">
                      <span className="font-mono" style={{ fontSize: "10px", color: "rgba(185,202,202,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>
                        {adv.ref_id}
                      </span>
                      <span className="font-mono" style={{ fontSize: "10px", color: "rgba(185,202,202,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>
                        UPDATED: {adv.updated_ago}
                      </span>
                    </div>
                  </div>
                  <AQIBadge aqi={adv.aqi} status={adv.status} size="sm" />
                </div>

                {/* AI Message */}
                <div
                  className="p-4 rounded-lg mb-4"
                  style={{
                    background: "rgba(0,245,255,0.04)",
                    border: "1px solid rgba(0,245,255,0.15)",
                    borderLeft: "3px solid #00f5ff",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-sm" style={{ color: "#00f5ff" }}>auto_awesome</span>
                    <span className="font-inter font-bold uppercase" style={{ fontSize: "9px", color: "#00f5ff", letterSpacing: "0.1em" }}>
                      AI-GENERATED ADVISORY MESSAGE
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "rgba(185,202,202,0.85)", lineHeight: "20px", fontStyle: "italic" }}>
                    &ldquo;{adv.ai_message}&rdquo;
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  {/* Audience Tags */}
                  <div className="flex flex-wrap gap-2">
                    {adv.audience_tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded font-mono"
                        style={{
                          fontSize: "9px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "rgba(185,202,202,0.6)",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Delivery status */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" style={{ color: "rgba(185,202,202,0.4)" }}>sms</span>
                      <span
                        className="px-2 py-1 rounded-full font-mono"
                        style={{
                          fontSize: "9px",
                          background: statusBadge[adv.sms_status].bg,
                          color: statusBadge[adv.sms_status].color,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {adv.sms_status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" style={{ color: "rgba(185,202,202,0.4)" }}>smartphone</span>
                      <span
                        className="px-2 py-1 rounded-full font-mono"
                        style={{
                          fontSize: "9px",
                          background: statusBadge[adv.app_status].bg,
                          color: statusBadge[adv.app_status].color,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {adv.app_status}
                      </span>
                    </div>
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 rounded font-inter font-bold uppercase text-xs transition-all hover:brightness-110"
                      style={{
                        background: "rgba(0,245,255,0.1)",
                        border: "1px solid rgba(0,245,255,0.25)",
                        color: "#00f5ff",
                        letterSpacing: "0.06em",
                      }}
                    >
                      <span className="material-symbols-outlined text-xs">send</span>
                      Broadcast
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── System Log ── */}
          <div className="col-span-4">
            <div
              className="p-5 rounded-xl h-full"
              style={{
                background: "rgba(10,14,19,0.8)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h3 className="font-inter font-bold uppercase mb-5" style={{ fontSize: "11px", color: "rgba(185,202,202,0.5)", letterSpacing: "0.08em" }}>
                BROADCAST ACTIVITY LOG
              </h3>
              <div className="space-y-4">
                {data.log.map((entry, i) => (
                  <div key={i} className="flex gap-3 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div
                      className="w-1 flex-shrink-0 rounded-full mt-1"
                      style={{ height: "100%", minHeight: "48px", background: logColors[entry.color] || "#00f5ff" }}
                    />
                    <div>
                      <p
                        className="font-inter font-bold uppercase mb-1"
                        style={{ fontSize: "9px", color: logColors[entry.color] || "#00f5ff", letterSpacing: "0.06em" }}
                      >
                        {entry.type}
                      </p>
                      <p style={{ fontSize: "12px", color: "rgba(185,202,202,0.8)", lineHeight: "18px" }}>
                        {entry.message}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="font-mono" style={{ fontSize: "10px", color: "rgba(185,202,202,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>
                          {entry.time}
                        </span>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: "9px",
                            color: entry.result === "SUCCESS" ? "#4ade80" : entry.result === "RETRIED" ? "#eab308" : "#00f5ff",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          ● {entry.result}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
