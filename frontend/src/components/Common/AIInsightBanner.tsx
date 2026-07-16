interface AIInsightBannerProps {
  text: string;
  confidence: number;
  onAction?: () => void;
  actionLabel?: string;
}

export default function AIInsightBanner({
  text,
  confidence,
  onAction,
  actionLabel = "PLAN RESPONSE",
}: AIInsightBannerProps) {
  return (
    <div
      className="rounded-xl overflow-hidden flex-shrink-0"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Gradient top bar */}
      <div
        className="h-1 w-full"
        style={{
          background: "linear-gradient(90deg, #00f5ff 0%, #ffdb3f 50%, #ffb4ab 100%)",
        }}
      />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="material-symbols-outlined"
            style={{ color: "#00f5ff", animation: "pulse-cyan 2s ease-in-out infinite", fontSize: "18px" }}
          >
            auto_awesome
          </span>
          <span
            className="font-inter font-bold uppercase"
            style={{ fontSize: "10px", color: "#00f5ff", letterSpacing: "0.2em" }}
          >
            AI Predictive Insight
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "#e0e2ea", fontFamily: "'Inter', sans-serif" }}>
          {text}
        </p>
        <div
          className="mt-4 flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span
            className="font-mono"
            style={{ fontSize: "10px", color: "rgba(185,202,202,0.5)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            CONFIDENCE: {confidence}%
          </span>
          {onAction && (
            <button
              onClick={onAction}
              className="flex items-center gap-1 font-inter font-bold uppercase hover:underline transition-all"
              style={{ fontSize: "10px", color: "#00f5ff", letterSpacing: "0.06em" }}
            >
              {actionLabel}
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
