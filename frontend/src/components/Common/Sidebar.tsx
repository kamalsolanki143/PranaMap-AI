"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Command Center" },
  { href: "/forecast", icon: "timeline", label: "Forecast Explorer" },
  { href: "/attribution", icon: "analytics", label: "Source Attribution" },
  { href: "/enforcement", icon: "edit_notifications", label: "Enforcement Planner" },
  { href: "/advisory", icon: "campaign", label: "Citizen Advisory" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  function handleSignOut() {
    logout();
    router.push("/");
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col py-8 px-6 border-r border-white/5 z-50"
      style={{
        width: "360px",
        background: "rgba(10,14,19,0.6)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "1px 0 0 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* ── Brand ── */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,245,255,0.12)", border: "1px solid rgba(0,245,255,0.25)" }}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ color: "#00f5ff", fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
          </div>
          <h1
            className="font-geist font-bold tracking-tight leading-none"
            style={{ color: "#00f5ff", fontSize: "20px", textShadow: "0 0 12px rgba(0,245,255,0.4)" }}
          >
            PranaMap AI
          </h1>
        </div>
        <p
          className="font-inter uppercase tracking-widest"
          style={{ fontSize: "10px", color: "rgba(185,202,202,0.5)", marginLeft: "48px" }}
        >
          Delhi NCR Division
        </p>
      </div>

      {/* ── Nav Links ── */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 py-3 px-4 rounded transition-all duration-200"
              style={
                isActive
                  ? {
                      background: "rgba(0,245,255,0.1)",
                      color: "#00f5ff",
                      borderRight: "4px solid #00f5ff",
                      boxShadow: "0 0 15px rgba(0,245,255,0.15)",
                      transform: "translateX(4px)",
                    }
                  : {
                      color: "rgba(185,202,202,0.65)",
                      borderRight: "4px solid transparent",
                    }
              }
            >
              <span
                className="material-symbols-outlined text-xl flex-shrink-0"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span
                className="font-inter font-bold uppercase tracking-wider"
                style={{ fontSize: "11px" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom Section ── */}
      <div className="mt-auto">
        {/* Trigger Intervention CTA */}
        <button
          className="w-full py-3 px-4 mb-5 rounded font-inter font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95"
          style={{
            background: "#00f5ff",
            color: "#003739",
            boxShadow: "0 0 20px rgba(0,245,255,0.25)",
          }}
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            bolt
          </span>
          Trigger Intervention
        </button>

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }} className="flex flex-col gap-1">
          {/* User info */}
          {user && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded mb-1"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-geist font-bold flex-shrink-0"
                style={{
                  background: "rgba(0,245,255,0.15)",
                  border: "1px solid rgba(0,245,255,0.3)",
                  color: "#00f5ff",
                  fontSize: "11px",
                }}
              >
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-inter font-semibold truncate" style={{ fontSize: "12px", color: "#e0e2ea" }}>
                  {user.name}
                </p>
                <p className="font-mono truncate" style={{ fontSize: "9px", color: "rgba(185,202,202,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {user.email}
                </p>
              </div>
            </div>
          )}

          <Link
            href="/settings"
            className="flex items-center gap-4 py-2 px-4 rounded text-xs transition-all hover:bg-white/5"
            style={{ color: "rgba(185,202,202,0.55)" }}
          >
            <span className="material-symbols-outlined text-base">settings_heart</span>
            <span className="font-inter font-bold uppercase tracking-wider" style={{ fontSize: "10px" }}>
              System Status
            </span>
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-4 py-2 px-4 rounded text-xs transition-all hover:bg-white/5"
            style={{ color: "rgba(185,202,202,0.55)" }}
          >
            <span className="material-symbols-outlined text-base">settings</span>
            <span className="font-inter font-bold uppercase tracking-wider" style={{ fontSize: "10px" }}>
              Settings
            </span>
          </Link>

          {/* ── Sign Out ── */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-4 py-2 px-4 rounded text-xs transition-all hover:bg-red-500/10 group w-full mt-1"
            style={{
              color: "rgba(255,180,171,0.55)",
              border: "none",
              background: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span className="material-symbols-outlined text-base group-hover:text-[#ffb4ab] transition-colors">
              logout
            </span>
            <span className="font-inter font-bold uppercase tracking-wider group-hover:text-[#ffb4ab] transition-colors" style={{ fontSize: "10px" }}>
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
