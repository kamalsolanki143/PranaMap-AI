interface MetricCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  iconBg?: string;
}

export default function MetricCard({
  label,
  value,
  icon,
  color = "#e0e2ea",
  iconBg = "rgba(255,255,255,0.06)",
}: MetricCardProps) {
  return (
    <div
      className="p-4 rounded-xl flex items-center justify-between"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div>
        <p
          className="font-inter font-bold uppercase"
          style={{ fontSize: "10px", color: "rgba(185,202,202,0.7)", letterSpacing: "0.06em" }}
        >
          {label}
        </p>
        <p
          className="font-mono font-bold mt-1"
          style={{ fontSize: "24px", color, fontFamily: "'JetBrains Mono', monospace" }}
        >
          {value}
        </p>
      </div>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: iconBg }}
      >
        <span className="material-symbols-outlined text-lg" style={{ color }}>
          {icon}
        </span>
      </div>
    </div>
  );
}
