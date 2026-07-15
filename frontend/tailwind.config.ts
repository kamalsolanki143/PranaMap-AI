import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0f15",
        surface: "#121820",
        surfaceHover: "#1a222d",
        border: "#202a37",
        text: {
          primary: "#f1f5f9",
          secondary: "#94a3b8",
          muted: "#475569",
        },
        aqi: {
          good: "#10b981",       // Muted Green
          moderate: "#fbbf24",   // Amber/Gold
          sensitive: "#f97316",  // Orange
          unhealthy: "#ef4444",  // Red
          veryUnhealthy: "#be123c", // Rose/Magenta-Red
          hazardous: "#7f1d1d",   // Deep Maroon
        },
        accent: {
          cyan: "#06b6d4",
          teal: "#14b8a6",
          blue: "#3b82f6",
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'panel': '0 8px 30px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 15px rgba(6, 182, 212, 0.2)',
      }
    },
  },
  plugins: [],
};

export default config;
