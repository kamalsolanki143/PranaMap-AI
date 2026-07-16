import TopBar from "@/components/Common/TopBar";
import AIInsightBanner from "@/components/Common/AIInsightBanner";
import SourceBarChart from "@/components/Charts/SourceBarChart";
import ConfidenceGauge from "@/components/Charts/ConfidenceGauge";
import { fetchAttribution } from "@/services/api";

export default async function AttributionPage() {
  const data = await fetchAttribution();

  return (
    <>
      <TopBar title="Source Attribution" />
      <div className="flex-1 overflow-y-auto p-8">

        {/* ── Header bar ── */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-geist font-semibold" style={{ fontSize: "24px" }}>
              Emission Source Intelligence
            </h1>
            <p className="font-mono mt-1" style={{ fontSize: "11px", color: "rgba(185,202,202,0.5)", fontFamily: "'JetBrains Mono', monospace" }}>
              Station: {data.station} · {data.ward} · Wind: {data.wind_direction} @ {data.wind_speed_kmh} km/h
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ConfidenceGauge value={data.analysis_confidence} size={80} />
            <div>
              <p className="font-inter font-bold uppercase" style={{ fontSize: "9px", color: "rgba(185,202,202,0.4)", letterSpacing: "0.06em" }}>Analysis Confidence</p>
              <p className="font-mono font-bold" style={{ fontSize: "22px", color: "#00f5ff", fontFamily: "'JetBrains Mono', monospace" }}>
                {data.current_aqi} <span style={{ fontSize: "12px", opacity: 0.6 }}>AQI</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── AI Summary ── */}
        <AIInsightBanner
          text={data.ai_summary}
          confidence={data.analysis_confidence}
          actionLabel="Generate Enforcement Plan"
        />

        {/* ── Bar Chart ── */}
        <div
          className="p-6 rounded-xl mt-6 mb-6"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h3 className="font-inter font-bold uppercase mb-5" style={{ fontSize: "11px", color: "rgba(185,202,202,0.5)", letterSpacing: "0.08em" }}>
            EMISSION SOURCE BREAKDOWN (CONFIDENCE-WEIGHTED)
          </h3>
          <SourceBarChart sources={data.sources} />
        </div>

        {/* ── Source Evidence Cards ── */}
        <div className="grid md:grid-cols-2 gap-5">
          {data.sources.map((src) => (
            <div
              key={src.source}
              className="p-5 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                border: `1px solid ${src.color}20`,
                borderLeft: `4px solid ${src.color}`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded flex items-center justify-center"
                    style={{ background: `${src.color}15` }}
                  >
                    <span className="material-symbols-outlined text-base" style={{ color: src.color, fontVariationSettings: "'FILL' 1" }}>
                      {src.icon}
                    </span>
                  </div>
                  <div>
                    <p className="font-inter font-bold" style={{ fontSize: "13px" }}>{src.source}</p>
                    <p className="font-mono" style={{ fontSize: "10px", color: "rgba(185,202,202,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {src.tags[0]}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold" style={{ fontSize: "24px", color: src.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                    {src.impact_pct}%
                  </p>
                  <p style={{ fontSize: "9px", color: "rgba(185,202,202,0.4)" }}>IMPACT</p>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: "9px", color: "rgba(185,202,202,0.4)", fontFamily: "'Inter', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    CONFIDENCE
                  </span>
                  <span className="font-mono" style={{ fontSize: "9px", color: src.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {src.confidence_pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${src.confidence_pct}%`, background: src.color, boxShadow: `0 0 6px ${src.color}80` }} />
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {src.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded font-mono"
                    style={{
                      fontSize: "9px",
                      background: `${src.color}12`,
                      color: src.color,
                      border: `1px solid ${src.color}25`,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Evidence log */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
                <p className="font-inter font-bold uppercase mb-2" style={{ fontSize: "9px", color: "rgba(185,202,202,0.4)", letterSpacing: "0.06em" }}>
                  EVIDENCE LOG
                </p>
                <div className="space-y-2">
                  {src.evidence.map((e, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: src.color }} />
                      <p style={{ fontSize: "11px", color: "rgba(185,202,202,0.7)", lineHeight: "18px" }}>{e.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
