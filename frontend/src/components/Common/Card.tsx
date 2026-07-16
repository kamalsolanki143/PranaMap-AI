interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "panel" | "card" | "lowest";
  hover?: boolean;
  glow?: boolean;
  style?: React.CSSProperties;
}

const variants = {
  panel: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  card: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
    borderTop: "1px solid rgba(255,255,255,0.15)",
    borderLeft: "1px solid rgba(255,255,255,0.1)",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  lowest: {
    background: "rgba(10,14,19,0.8)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
};

export default function Card({
  children,
  className = "",
  variant = "panel",
  hover = false,
  glow = false,
  style,
}: CardProps) {
  return (
    <div
      className={`rounded-lg transition-all duration-300 ${hover ? "hover:-translate-y-0.5 hover:border-primary-container/30" : ""} ${className}`}
      style={{
        ...variants[variant],
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: glow ? "0 0 15px rgba(0,245,255,0.15)" : undefined,
        borderRadius: "8px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
