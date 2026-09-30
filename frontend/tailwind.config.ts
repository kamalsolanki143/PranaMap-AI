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
        background: "rgb(var(--background) / <alpha-value>)",
        backgroundSubtle: "rgb(var(--background-subtle) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        surfaceAlt: "rgb(var(--surface-alt) / <alpha-value>)",
        surfaceHover: "rgb(var(--surface-hover) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        borderStrong: "rgb(var(--border-strong) / <alpha-value>)",
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },
        forestPrimary: "#14532D",
        forestSecondary: "#166534",
        atmoBlue: "#3B82A0",
        naturalGreen: "#4F8F62",
        terracotta: "#B66A45",
        amberTone: "#D89B2B",
        criticalTone: "#C94B4B",
        stone: {
          50: "#FAFAF7",
          100: "#F7F8F4",
          200: "#EEF1EA",
          300: "#DDE4DB",
          400: "#C6CFC3",
          500: "#828E86",
          600: "#66736A",
          700: "#4B564E",
          800: "#2B332E",
          900: "#17201A",
        },
        brand: {
          DEFAULT: "#166534",
          forest: "#166534",
          forestDark: "#14532D",
          forestLight: "#4F8F62",
          forestSubtle: "#F0FDF4",
          teal: "#166534",
          tealLight: "#4F8F62",
          cyan: "#3B82A0",
          blue: "#3B82A0",
          dark: "#17201A",
        },
        accent: {
          forest: "#166534",
          teal: "#166534",
          cyan: "#3B82A0",
          blue: "#3B82A0",
        },
        atmo: {
          blue: "#3B82A0",
          blueLight: "#4F91B8",
          blueSoft: "#EBF3F7",
        },
        earth: {
          terracotta: "#B66A45",
          terracottaLight: "#C47A52",
          soft: "#F7EFEA",
        },
        natural: {
          green: "#4F8F62",
          greenLight: "#5FA66A",
        },
        aqi: {
          good: "#4F8F62",          // Natural Green
          moderate: "#D89B2B",      // Amber
          sensitive: "#B66A45",     // Terracotta
          unhealthy: "#D85A4F",     // Controlled Coral
          veryUnhealthy: "#C94B4B", // Critical
          hazardous: "#A33030",     // Controlled Crimson
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'panel': '0 1px 3px 0 rgba(23, 32, 26, 0.05), 0 1px 2px -1px rgba(23, 32, 26, 0.03)',
        'subtle': '0 1px 3px 0 rgba(23, 32, 26, 0.05)',
        'card': '0 2px 6px 0 rgba(23, 32, 26, 0.06)',
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '0.85rem' }],
      }
    },
  },
  plugins: [],
};

export default config;
