import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        surfaceHover: "rgb(var(--surface-hover) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
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
        'panel': '0 8px 30px var(--shadow-panel-color)',
        'glow': '0 0 15px rgba(6, 182, 212, 0.2)',
      }
    },
  },
  plugins: [],
};

export default config;

