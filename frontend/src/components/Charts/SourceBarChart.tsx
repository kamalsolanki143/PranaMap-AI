"use client";
import { SourceAttribution } from "@/types";

interface SourceBarChartProps {
  sources: SourceAttribution[];
}

export default function SourceBarChart({ sources }: SourceBarChartProps) {
  return (
    <div className="space-y-5">
      {sources.map((src) => (
        <div key={src.source} className="space-y-2">
          <div className="flex justify-between items-center">
            <span
              className="font-mono text-sm"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "#e0e2ea" }}
            >
              {src.source === "Traffic" && "Vehicular Emissions (Primary Traffic)"}
              {src.source === "Biomass" && "Biomass Burning (Agricultural & Waste)"}
              {src.source === "Construction" && "Fugitive Dust (Construction & Demolition)"}
              {src.source === "Industrial" && "Industrial Stack Emissions"}
            </span>
            <span
              className="font-mono font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: src.color, fontSize: "14px" }}
            >
              {src.impact_pct}%
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${src.impact_pct}%`,
                background: src.color,
                boxShadow: `0 0 8px ${src.color}60`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
