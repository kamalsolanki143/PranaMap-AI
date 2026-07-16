"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

// Mock credentials (hackathon demo only)
const MOCK_EMAIL = "analyst@pranamap.ai";
const MOCK_PASSWORD = "prana2024";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  // If already authenticated, go straight to dashboard
  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate network delay for realism
    await new Promise((r) => setTimeout(r, 900));

    if (
      email.trim().toLowerCase() === MOCK_EMAIL &&
      password === MOCK_PASSWORD
    ) {
      login(email.trim().toLowerCase());
      router.push("/dashboard");
    } else {
      // Accept any non-empty credentials for easy demo access
      if (email.trim() && password.trim()) {
        login(email.trim());
        router.push("/dashboard");
      } else {
        setError("Please enter your credentials.");
      }
    }
    setLoading(false);
  }

  const inputStyle = (field: "email" | "password"): React.CSSProperties => ({
    width: "100%",
    padding: "14px 16px",
    paddingRight: field === "password" ? "48px" : "16px",
    background: "rgba(10,14,19,0.85)",
    border: `1px solid ${focusedField === field ? "rgba(0,245,255,0.5)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: "4px",
    color: "#e0e2ea",
    fontFamily: "'Inter', sans-serif",
    fontSize: "14px",
    outline: "none",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(0,245,255,0.08)" : "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box" as const,
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#101419" }}
    >
      {/* ── Ambient glows ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "600px",
          background: "radial-gradient(ellipse, rgba(0,245,255,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-100px",
          right: "-100px",
          width: "500px",
          height: "500px",
          background: "radial-gradient(ellipse, rgba(255,219,63,0.03) 0%, transparent 70%)",
        }}
      />

      {/* ── Grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,245,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: 0.6,
        }}
      />

      {/* ── Login Card ── */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Brand */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
            style={{
              background: "rgba(0,245,255,0.1)",
              border: "1px solid rgba(0,245,255,0.3)",
              boxShadow: "0 0 30px rgba(0,245,255,0.15)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                color: "#00f5ff",
                fontSize: "28px",
                fontVariationSettings: "'FILL' 1",
              }}
            >
              eco
            </span>
          </div>
          <h1
            className="font-geist font-bold tracking-tight text-center"
            style={{
              fontSize: "28px",
              color: "#00f5ff",
              textShadow: "0 0 20px rgba(0,245,255,0.4)",
              letterSpacing: "-0.02em",
            }}
          >
            PranaMap AI
          </h1>
          <p
            className="font-inter font-bold uppercase mt-1"
            style={{ fontSize: "10px", color: "rgba(185,202,202,0.45)", letterSpacing: "0.18em" }}
          >
            Urban Air Quality Intelligence
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(255,255,255,0.15)",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* Rainbow top bar */}
          <div
            className="h-0.5 w-full"
            style={{
              background: "linear-gradient(90deg, #00f5ff 0%, #ffdb3f 50%, #ffb4ab 100%)",
            }}
          />

          <div className="p-8">
            <h2
              className="font-geist font-semibold mb-1"
              style={{ fontSize: "20px", color: "#e0e2ea" }}
            >
              Secure Access Portal
            </h2>
            <p className="mb-8" style={{ fontSize: "13px", color: "rgba(185,202,202,0.55)" }}>
              Sign in to access the Command Center.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="block font-inter font-bold uppercase mb-2"
                  style={{ fontSize: "10px", color: "rgba(185,202,202,0.6)", letterSpacing: "0.08em" }}
                >
                  Email / Username
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="analyst@pranamap.ai"
                    style={inputStyle("email")}
                  />
                  <span
                    className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-base pointer-events-none"
                    style={{
                      color: focusedField === "email" ? "#00f5ff" : "rgba(185,202,202,0.3)",
                      transition: "color 0.2s",
                    }}
                  >
                    person
                  </span>
                </div>
              </div>

              {/* Password */}
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block font-inter font-bold uppercase mb-2"
                  style={{ fontSize: "10px", color: "rgba(185,202,202,0.6)", letterSpacing: "0.08em" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    style={inputStyle("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    tabIndex={-1}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    <span
                      className="material-symbols-outlined text-base"
                      style={{
                        color: focusedField === "password" ? "#00f5ff" : "rgba(185,202,202,0.3)",
                        transition: "color 0.2s",
                      }}
                    >
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-lg mb-5"
                  style={{
                    background: "rgba(255,180,171,0.08)",
                    border: "1px solid rgba(255,180,171,0.25)",
                  }}
                >
                  <span className="material-symbols-outlined text-sm" style={{ color: "#ffb4ab" }}>
                    error
                  </span>
                  <p style={{ fontSize: "13px", color: "#ffb4ab" }}>{error}</p>
                </div>
              )}

              {/* CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 font-inter font-bold uppercase transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  padding: "15px 24px",
                  background: loading ? "rgba(0,245,255,0.4)" : "#00f5ff",
                  color: "#003739",
                  fontSize: "13px",
                  letterSpacing: "0.1em",
                  borderRadius: "4px",
                  border: "none",
                  boxShadow: loading
                    ? "0 0 15px rgba(0,245,255,0.2)"
                    : "0 0 25px rgba(0,245,255,0.35), 0 4px 16px rgba(0,0,0,0.3)",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? (
                  <>
                    <div
                      className="w-4 h-4 rounded-full border-2 border-[#003739]/30 border-t-[#003739] animate-spin"
                      style={{ flexShrink: 0 }}
                    />
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1", flexShrink: 0 }}
                    >
                      lock_open
                    </span>
                    ACCESS COMMAND CENTER
                  </>
                )}
              </button>

              {/* Forgot password */}
              <div className="mt-5 text-center">
                <button
                  type="button"
                  className="font-inter transition-colors hover:text-[#00f5ff]"
                  style={{ fontSize: "12px", color: "rgba(185,202,202,0.4)", background: "none", border: "none", cursor: "pointer" }}
                >
                  Forgot password?
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Demo hint */}
        <div
          className="mt-6 px-4 py-3 rounded-lg flex items-start gap-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5" style={{ color: "#00f5ff" }}>
            info
          </span>
          <p
            className="font-mono"
            style={{ fontSize: "11px", color: "rgba(185,202,202,0.45)", lineHeight: "18px", fontFamily: "'JetBrains Mono', monospace" }}
          >
            DEMO: Enter any email + password to access.
            <br />
            Preset: <span style={{ color: "rgba(0,245,255,0.6)" }}>analyst@pranamap.ai</span>
          </p>
        </div>

        {/* Footer */}
        <p
          className="text-center mt-8 font-mono"
          style={{ fontSize: "10px", color: "rgba(185,202,202,0.25)", fontFamily: "'JetBrains Mono', monospace" }}
        >
          © 2024 PRANAMAP AI · SECURE SESSION · DELHI NCR UNIT
        </p>
      </div>
    </div>
  );
}
