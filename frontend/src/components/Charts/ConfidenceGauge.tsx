interface ConfidenceGaugeProps {
  value: number; // 0-100
  size?: number;
}

export default function ConfidenceGauge({ value, size = 96 }: ConfidenceGaugeProps) {
  const radius = (size / 2) * 0.83;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={6}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#00f5ff"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s ease-out",
            filter: "drop-shadow(0 0 6px rgba(0,245,255,0.6))",
          }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-geist font-semibold"
        style={{ color: "#00f5ff", fontSize: size > 80 ? "22px" : "16px" }}
      >
        {value}%
      </div>
    </div>
  );
}
