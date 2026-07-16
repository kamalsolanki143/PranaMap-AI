import { Priority } from "@/types";

interface PriorityBadgeProps {
  priority: Priority;
}

const config: Record<Priority, { color: string; bg: string; border: string }> = {
  CRITICAL: { color: "#ffb4ab", bg: "rgba(255,180,171,0.1)", border: "rgba(255,180,171,0.25)" },
  HIGH: { color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)" },
  MEDIUM: { color: "#eab308", bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.25)" },
  LOW: { color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.25)" },
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const c = config[priority];
  return (
    <span
      className="inline-block px-2 py-1 font-inter font-bold tracking-widest"
      style={{
        fontSize: "10px",
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: "2px",
      }}
    >
      {priority}
    </span>
  );
}
