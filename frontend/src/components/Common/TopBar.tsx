"use client";

interface TopBarProps {
  title?: string;
  showSearch?: boolean;
  children?: React.ReactNode;
}

export default function TopBar({ title, showSearch = true, children }: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-8 h-16 w-full"
      style={{
        background: "rgba(16,20,25,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-6">
        {title && (
          <h2 className="font-geist font-semibold" style={{ fontSize: "24px", color: "#00f5ff" }}>
            {title}
          </h2>
        )}
        {showSearch && !title && (
          <div
            className="flex items-center gap-3 px-4 py-2 rounded"
            style={{
              background: "rgba(10,14,19,0.8)",
              border: "1px solid rgba(255,255,255,0.1)",
              minWidth: "280px",
            }}
          >
            <span className="material-symbols-outlined text-base" style={{ color: "#00f5ff" }}>
              search
            </span>
            <input
              type="text"
              placeholder="Search ward, zone or sensor..."
              className="bg-transparent border-none outline-none text-sm w-full"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12px",
                color: "#e0e2ea",
              }}
            />
          </div>
        )}
        {children}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-white/10"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span className="material-symbols-outlined text-base" style={{ color: "rgba(185,202,202,0.7)" }}>
            notifications
          </span>
        </button>
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-white/10"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span className="material-symbols-outlined text-base" style={{ color: "rgba(185,202,202,0.7)" }}>
            cloud_done
          </span>
        </button>
        <div
          className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-geist font-bold text-sm"
          style={{
            background: "rgba(0,245,255,0.15)",
            border: "1px solid rgba(0,245,255,0.3)",
            color: "#00f5ff",
          }}
        >
          MY
        </div>
      </div>
    </header>
  );
}
