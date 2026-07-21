import React from "react";
import Link from "next/link";

const agents = [
  { icon: "cloud_download", label: "Data Ingestion", desc: "Real-time fusion of satellite, ground station, and mobile sensor feeds." },
  { icon: "timeline", label: "AQI Forecast", desc: "XGBoost/LightGBM models for 72-hour hyperlocal forecasting with 92%+ accuracy." },
  { icon: "analytics", label: "Source Attribution", desc: "Identifies specific polluters from industrial, traffic, or biomass sources." },
  { icon: "edit_notifications", label: "Enforcement Intel", desc: "Optimizes field officer routes for rapid GRAP compliance enforcement." },
  { icon: "campaign", label: "Citizen Advisory", desc: "Hyperlocal multilingual health alerts delivered via WhatsApp and SMS." },
  { icon: "model_training", label: "Impact Simulator", desc: "Tests policy 'what-if' scenarios in a digital twin city environment." },
];

const flowSteps = [
  { icon: "sensors", label: "Ingest", sub: "Satellite + IoT Fusion" },
  { icon: "model_training", label: "Predict", sub: "Multi-Model Ensemble" },
  { icon: "assignment_turned_in", label: "Attribute", sub: "Emission Source ID" },
  { icon: "smart_toy", label: "Recommend", sub: "Actionable Playbooks" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#101419", color: "#e0e2ea" }}>
      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20"
        style={{
          background: "rgba(16,20,25,0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded flex items-center justify-center"
            style={{ background: "rgba(0,245,255,0.12)", border: "1px solid rgba(0,245,255,0.25)" }}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ color: "#00f5ff", fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
          </div>
          <span
            className="font-geist font-bold tracking-tight"
            style={{ color: "#00f5ff", fontSize: "20px", textShadow: "0 0 12px rgba(0,245,255,0.4)" }}
          >
            PranaMap AI
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Platform", "Solutions", "Cities", "Advisory"].map((item, i) => (
            <a
              key={item}
              href="#"
              className="font-inter text-sm transition-colors hover:text-[#00f5ff]"
              style={{ color: i === 0 ? "#00f5ff" : "rgba(185,202,202,0.7)", borderBottom: i === 0 ? "2px solid #00f5ff" : "none", paddingBottom: i === 0 ? "4px" : "0" }}
            >
              {item}
            </a>
          ))}
        </div>
        <Link
          href="/login"
          className="font-inter font-bold uppercase text-xs px-6 py-3 rounded transition-all hover:brightness-110 active:scale-95"
          style={{
            background: "#00f5ff",
            color: "#003739",
            letterSpacing: "0.06em",
            boxShadow: "0 0 15px rgba(0,245,255,0.3)",
          }}
        >
          Launch Command Center
        </Link>
      </nav>

      {/* ── HERO ── */}
      <main className="relative pt-36 pb-20 min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,245,255,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-8 text-center">
          {/* Status pill */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(0,245,255,0.2)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-[#00f5ff] animate-pulse" />
            <span
              className="font-inter font-bold uppercase"
              style={{ fontSize: "10px", color: "#00f5ff", letterSpacing: "0.12em" }}
            >
              Active Intelligence: Delhi NCR Unit
            </span>
          </div>

          {/* Hero heading */}
          <h1
            className="font-geist font-bold leading-tight mb-8"
            style={{
              fontSize: "clamp(40px,7vw,80px)",
              letterSpacing: "-0.04em",
              background: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.55) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            We don&apos;t just measure pollution.{" "}
            <br />
            <span
              style={{
                WebkitTextFillColor: "#00f5ff",
                textShadow: "0 0 40px rgba(0,245,255,0.4)",
              }}
            >
              We prevent the crisis.
            </span>
          </h1>

          <p
            className="font-inter mb-10 max-w-2xl mx-auto"
            style={{ fontSize: "18px", lineHeight: "28px", color: "rgba(185,202,202,0.8)" }}
          >
            The first AI-driven urban intervention platform for Indian megacities. We predict atmospheric stagnation, attribute sources in real-time, and simulate policy impact before deployment.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded font-inter font-bold uppercase text-xs transition-all hover:brightness-110 active:scale-95 group"
              style={{
                background: "#00f5ff",
                color: "#003739",
                letterSpacing: "0.06em",
                boxShadow: "0 0 25px rgba(0,245,255,0.35)",
              }}
            >
              View Live Dashboard
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
            <button
              className="flex items-center justify-center gap-2 px-8 py-4 rounded font-inter font-bold uppercase text-xs transition-all hover:bg-white/5"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(0,245,255,0.25)",
                color: "#00f5ff",
                letterSpacing: "0.06em",
              }}
            >
              <span className="material-symbols-outlined text-sm">play_circle</span>
              Watch Demo
            </button>
          </div>
        </div>

        {/* Dashboard Mockup Preview */}
        <div className="relative mt-20 w-full max-w-6xl px-8" style={{ perspective: "2000px" }}>
          <div
            className="rounded-xl p-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
              backdropFilter: "blur(12px)",
              borderTop: "1px solid rgba(255,255,255,0.15)",
              borderLeft: "1px solid rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.08)",
              transform: "rotateX(12deg)",
              boxShadow: "0 60px 120px rgba(0,0,0,0.6), 0 0 40px rgba(0,245,255,0.08)",
            }}
          >
            {/* Window chrome */}
            <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex gap-2">
                {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                  <div key={c} className="w-3 h-3 rounded-full" style={{ background: c, opacity: 0.6 }} />
                ))}
              </div>
              <span className="font-mono text-xs" style={{ color: "rgba(0,245,255,0.5)", fontFamily: "'JetBrains Mono', monospace" }}>
                SIMULATION_MODE: PREDICTIVE_FALLBACK_V4
              </span>
            </div>
            {/* Mock dashboard grid */}
            <div className="grid grid-cols-12 gap-4" style={{ height: "320px" }}>
              <div
                className="col-span-8 rounded-lg relative overflow-hidden scanline"
                style={{ background: "#0a0e13", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                {/* Heatmap blobs */}
                <div className="absolute inset-0" style={{ opacity: 0.5 }}>
                  <div className="absolute rounded-full" style={{ top: "20%", left: "30%", width: "280px", height: "280px", background: "radial-gradient(circle, rgba(147,0,10,0.7) 0%, transparent 70%)" }} />
                  <div className="absolute rounded-full" style={{ top: "40%", left: "50%", width: "220px", height: "220px", background: "radial-gradient(circle, rgba(255,219,63,0.6) 0%, transparent 70%)" }} />
                </div>
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <div className="glass-panel px-3 py-2 rounded" style={{ border: "1px solid rgba(0,245,255,0.3)" }}>
                    <div className="font-inter font-bold uppercase" style={{ fontSize: "9px", color: "#00f5ff" }}>PREDICTED PEAK</div>
                    <div className="font-mono font-bold text-xl" style={{ fontFamily: "'JetBrains Mono', monospace" }}>412 AQI</div>
                  </div>
                  <div className="glass-panel px-3 py-2 rounded">
                    <div className="font-inter font-bold uppercase" style={{ fontSize: "9px", color: "rgba(185,202,202,0.5)" }}>CONFIDENCE</div>
                    <div className="font-mono font-bold text-xl" style={{ fontFamily: "'JetBrains Mono', monospace" }}>94.2%</div>
                  </div>
                </div>
              </div>
              <div className="col-span-4 flex flex-col gap-4">
                <div className="flex-1 glass-panel p-4 rounded-lg flex flex-col justify-between" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="font-inter font-bold uppercase" style={{ fontSize: "9px", color: "rgba(185,202,202,0.5)", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px" }}>RECOMMENDED INTERVENTION</div>
                  <div className="py-3">
                    <h4 className="font-geist font-semibold" style={{ color: "#00f5ff", fontSize: "14px", lineHeight: "20px" }}>Zone-4 Traffic Diversion</h4>
                    <p className="text-xs mt-1" style={{ color: "rgba(185,202,202,0.6)" }}>AI predicts a 12% reduction in NO₂ within 4 hours.</p>
                  </div>
                  <button className="w-full py-2 font-inter font-bold uppercase text-xs" style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.3)", color: "#00f5ff", letterSpacing: "0.08em", borderRadius: "2px", fontSize: "9px" }}>
                    EXECUTE SIMULATION
                  </button>
                </div>
                <div className="flex-1 glass-panel p-4 rounded-lg" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="font-inter font-bold uppercase" style={{ fontSize: "9px", color: "rgba(185,202,202,0.5)" }}>SOURCE ATTRIBUTION</div>
                  <div className="mt-3 space-y-2">
                    {[["Traffic", "#00f5ff", "84%"], ["Biomass", "#ffdb3f", "91%"]].map(([s, c, v]) => (
                      <div key={s} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: "rgba(185,202,202,0.7)" }}>{s}</span>
                        <span className="font-mono text-xs font-bold" style={{ color: c as string, fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glow under mockup */}
          <div
            className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-3/4 h-32 pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(0,245,255,0.12) 0%, transparent 70%)", filter: "blur(20px)" }}
          />
        </div>
      </main>

      {/* ── PROBLEM / SOLUTION ── */}
      <section className="py-24 px-8 relative" style={{ background: "#0a0e13" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="font-geist font-semibold mb-4" style={{ fontSize: "32px", letterSpacing: "-0.02em" }}>
                Breaking the Cycle of Reactive Management
              </h2>
              <p style={{ color: "rgba(185,202,202,0.8)", fontSize: "16px", lineHeight: "24px" }}>
                Current systems are designed to report on the past. PranaMap AI is designed to engineer the future.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Legacy */}
            <div className="glass-card p-10 rounded-xl relative overflow-hidden">
              <div className="absolute top-4 right-4 font-mono text-xs" style={{ color: "rgba(255,180,171,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>LEGACY_V2.0</div>
              <span className="material-symbols-outlined text-4xl mb-4 block" style={{ color: "rgba(185,202,202,0.5)" }}>history</span>
              <h3 className="font-geist font-semibold mb-3" style={{ fontSize: "22px" }}>Reactive Monitoring</h3>
              <p style={{ color: "rgba(185,202,202,0.7)", fontSize: "15px" }}>Static stations report bad air after people have already breathed it. Decision-makers operate with a 24-hour information lag.</p>
              <div className="mt-8 h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full bg-red-500 rounded-full" style={{ width: "33%" }} />
              </div>
            </div>
            {/* AI */}
            <div className="glass-card p-10 rounded-xl relative overflow-hidden glow-cyan" style={{ borderColor: "rgba(0,245,255,0.2)" }}>
              <div className="absolute top-4 right-4 font-mono text-xs" style={{ color: "#00f5ff", fontFamily: "'JetBrains Mono', monospace" }}>AI_ORCHESTRATOR_ACTIVE</div>
              <span className="material-symbols-outlined text-4xl mb-4 block" style={{ color: "#00f5ff", fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <h3 className="font-geist font-semibold mb-3" style={{ fontSize: "22px" }}>Predictive Intervention</h3>
              <p style={{ color: "rgba(185,202,202,0.7)", fontSize: "15px" }}>Anticipate pollution surges 72 hours in advance. Automate micro-level policy responses and alert specific ward stakeholders instantly.</p>
              <div className="mt-8 h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full w-full rounded-full" style={{ background: "#00f5ff", boxShadow: "0 0 10px rgba(0,245,255,1)" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MULTI-AGENT NETWORK ── */}
      <section className="py-24 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="font-geist font-semibold mb-4" style={{ fontSize: "32px", letterSpacing: "-0.02em" }}>
            Multi-Agent Intelligence Network
          </h2>
          <p style={{ color: "rgba(185,202,202,0.7)", fontSize: "16px" }}>
            Six specialized AI agents working in synchronization to manage urban air quality.
          </p>
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
          {agents.map((a) => (
            <div
              key={a.label}
              className="glass-card p-6 rounded-lg transition-all duration-300 hover:border-[rgba(0,245,255,0.3)] hover:-translate-y-1 cursor-default"
            >
              <div
                className="w-10 h-10 rounded flex items-center justify-center mb-4"
                style={{ background: "rgba(0,245,255,0.08)" }}
              >
                <span className="material-symbols-outlined" style={{ color: "#00f5ff" }}>{a.icon}</span>
              </div>
              <h4 className="font-inter font-bold uppercase mb-2" style={{ fontSize: "12px", color: "#00f5ff", letterSpacing: "0.06em" }}>{a.label}</h4>
              <p className="text-xs" style={{ color: "rgba(185,202,202,0.65)", lineHeight: "18px" }}>{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SYSTEM FLOW ── */}
      <section className="py-24 px-8" style={{ background: "#0a0e13" }}>
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="font-geist font-semibold" style={{ fontSize: "32px", letterSpacing: "-0.02em" }}>System Intelligence Flow</h2>
        </div>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-0">
          {flowSteps.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex-1 text-center group">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 transition-all duration-500 group-hover:glow-cyan"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: "#00f5ff" }}>{step.icon}</span>
                </div>
                <h4 className="font-inter font-bold uppercase mb-1" style={{ fontSize: "11px", letterSpacing: "0.06em" }}>{step.label}</h4>
                <p style={{ fontSize: "10px", color: "rgba(185,202,202,0.5)" }}>{step.sub}</p>
              </div>
              {i < flowSteps.length - 1 && (
                <div className="hidden md:block w-12 h-px" style={{ background: "rgba(255,255,255,0.15)" }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── FEATURES BENTO ── */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <h2
            className="font-geist font-semibold text-center mb-16"
            style={{
              fontSize: "32px",
              letterSpacing: "-0.02em",
              textDecoration: "underline",
              textDecorationColor: "#00f5ff",
              textUnderlineOffset: "8px",
            }}
          >
            Mission Critical Features
          </h2>
          <div className="grid md:grid-cols-3 gap-1">
            <div className="md:col-span-2 glass-card p-12 flex flex-col justify-between group" style={{ minHeight: "280px" }}>
              <div>
                <span className="font-mono" style={{ fontSize: "10px", color: "#00f5ff", letterSpacing: "0.12em", fontFamily: "'JetBrains Mono', monospace" }}>MODULE_01</span>
                <h3 className="font-geist font-semibold mt-2 mb-3" style={{ fontSize: "28px" }}>Hyperlocal Forecasting</h3>
                <p style={{ color: "rgba(185,202,202,0.7)", maxWidth: "420px" }}>Our models operate at 100m grid resolution, allowing ward-specific interventions that blanket policies often miss.</p>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <div className="h-0.5 flex-1 overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full bg-[#00f5ff] w-0 group-hover:w-3/4 transition-all duration-1000" />
                </div>
                <span className="font-mono text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>PRECISION 94.2%</span>
              </div>
            </div>
            <div className="glass-card p-12" style={{ background: "rgba(0,245,255,0.03)" }}>
              <span className="material-symbols-outlined text-4xl mb-5 block" style={{ color: "#00f5ff" }}>psychology_alt</span>
              <h3 className="font-geist font-semibold mb-3" style={{ fontSize: "22px" }}>Explainable AI</h3>
              <p className="text-sm" style={{ color: "rgba(185,202,202,0.7)" }}>We provide the &apos;Why&apos; behind every recommendation, detailing meteorological and emission factors.</p>
            </div>
            <div className="glass-card p-12">
              <h3 className="font-geist font-semibold mb-3" style={{ fontSize: "22px" }}>Multilingual Advisories</h3>
              <p className="text-sm" style={{ color: "rgba(185,202,202,0.7)" }}>Automated alerts in Hindi, Punjabi, Bengali, and English tailored to local AQI composition.</p>
            </div>
            <div className="md:col-span-2 glass-card p-12 flex items-center gap-8">
              <div className="w-1/2">
                <h3 className="font-geist font-semibold mb-3" style={{ fontSize: "22px" }}>Intervention Impact Simulation</h3>
                <p className="text-sm" style={{ color: "rgba(185,202,202,0.7)" }}>Simulate the effect of odd-even, construction bans, or cloud seeding before committing public resources.</p>
              </div>
              <div className="w-1/2 h-32 rounded flex items-center justify-center" style={{ background: "rgba(0,245,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-center">
                  <div className="flex items-center gap-3 justify-center mb-2">
                    <span className="font-mono font-bold text-2xl" style={{ color: "#ffb4ab", fontFamily: "'JetBrains Mono', monospace" }}>186</span>
                    <span className="material-symbols-outlined" style={{ color: "#00f5ff" }}>arrow_forward</span>
                    <span className="font-mono font-bold text-2xl" style={{ color: "#00f5ff", fontFamily: "'JetBrains Mono', monospace" }}>148</span>
                  </div>
                  <p className="font-inter font-bold uppercase" style={{ fontSize: "9px", color: "rgba(185,202,202,0.4)", letterSpacing: "0.08em" }}>AQI after intervention</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0a0e13", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div className="max-w-sm">
              <span className="font-geist font-bold mb-4 block" style={{ fontSize: "22px" }}>PranaMap AI</span>
              <p className="text-sm mb-5" style={{ color: "rgba(185,202,202,0.6)", lineHeight: "22px" }}>
                Empowering Indian smart cities with predictive environmental intelligence to ensure a breathable future for all citizens.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-12">
              {[["Platform", ["Privacy Protocol", "API Access", "Case Studies"]], ["Connect", ["City Onboarding", "Research Lab", "Contact Support"]]].map(([title, links]) => (
                <div key={title as string} className="flex flex-col gap-3">
                  <h5 className="font-inter font-bold uppercase" style={{ fontSize: "11px", color: "#00f5ff", letterSpacing: "0.06em" }}>{title as string}</h5>
                  {(links as string[]).map((l) => (
                    <a key={l} href="#" className="text-sm transition-colors hover:text-[#00dce5]" style={{ color: "rgba(185,202,202,0.6)" }}>{l}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-sm" style={{ color: "rgba(185,202,202,0.5)" }}>© 2024 PranaMap AI. Urban Intervention Systems for Indian Smart Cities.</p>
            <div className="font-mono" style={{ fontSize: "10px", color: "rgba(0,245,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
              LAT: 28.6139° N, LONG: 77.2090° E | SYSTEM_STABLE_GREEN
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
