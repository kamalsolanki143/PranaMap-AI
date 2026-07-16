import { AQIReading } from "@/types";

interface AQIBadgeProps {
  aqi: number;
  status: AQIReading["status"];
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<AQIReading["status"], { color: string; bg: string; border: string }> = {
  Good: { color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.25)" },
  Satisfactory: { color: "#00f5ff", bg: "rgba(0,245,255,0.1)", border: "rgba(0,245,255,0.25)" },
  Moderate: { color: "#eab308", bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.25)" },
  Poor: { color: "#ffdb3f", bg: "rgba(255,219,63,0.1)", border: "rgba(255,219,63,0.25)" },
  "Very Poor": { color: "#ffb4ab", bg: "rgba(255,180,171,0.1)", border: "rgba(255,180,171,0.25)" },
  Severe: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
};

export function getAQIColor(status: AQIReading["status"]): string {
  return statusConfig[status]?.color ?? "#e0e2ea";
}

export default function AQIBadge({ aqi, status, size = "md" }: AQIBadgeProps) {
  const config = statusConfig[status];
  const textSize = size === "sm" ? "14px" : size === "lg" ? "24px" : "18px";
  const labelSize = size === "sm" ? "9px" : "10px";

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <span
        className="font-mono font-bold"
        style={{ fontSize: textSize, color: config.color, fontFamily: "'JetBrains Mono', monospace" }}
      >
        {aqi}
      </span>
      <span
        className="font-inter font-bold uppercase"
        style={{ fontSize: labelSize, color: config.color, letterSpacing: "0.04em" }}
      >
        {status}
      </span>
    </div>
  );
}

export { statusConfig };
