# PranaMap AI — UI & Visual Design System Specification

## 1. Design Philosophy & Direction

PranaMap AI is India's flagship Environmental Intelligence & Climate Resilience Platform.
The user experience has been intentionally architected to embody:
- **Light-First**: Crisp, high-contrast, paper-and-canvas aesthetic reflecting an Environmental Observatory.
- **GovTech & ClimateTech**: Authoritative, transparent, clean, and accessible to state environmental boards, municipal commissioners, researchers, and citizens alike.
- **Geographic Clarity**: Map-first workflows with geospatial hierarchy (India &rarr; State &rarr; District &rarr; Hyperlocal Station).
- **Absolute Purge of Cyberpunk / Sci-Fi Elements**: No black/purple backgrounds, glowing neon cards, fake floating pills, or decorative space orbital graphics.

---

## 2. Color System & Design Tokens

PranaMap AI strictly enforces a single, unified light color palette across all interfaces. Dark mode has been completely removed.

### Primary Color Tokens
| Token | Hex Value | Semantic Role |
| :--- | :--- | :--- |
| **Primary Background** | `#F7F8F4` | Clean ecru canvas for all page viewports |
| **Secondary Background** | `#FAFAF7` | Contrast background for sidebars and headers |
| **Surface** | `#FFFFFF` | Primary card, modal, and panel background |
| **Soft Surface** | `#EEF1EA` | Secondary card fills, badge backdrops, subtle groupings |
| **Border** | `#DDE4DB` | Restrained card borders, dividers, table borders |
| **Primary Forest** | `#14532D` | Primary brand accent, primary CTA buttons, active tabs |
| **Secondary Forest** | `#166534` | Hover states, secondary accents, environmental badges |
| **Atmospheric Blue** | `#3B82A0` | Meteorological layers, wind/weather metrics, satellites |
| **Natural Green** | `#4F8F62` | 'Good' AQI band (0-50), positive indicators, vegetation |
| **Terracotta** | `#B66A45` | 'Moderate' AQI band (101-200), dust & soil attribution |
| **Amber** | `#D89B2B` | 'Satisfactory' (51-100) / 'Poor' (201-300), warnings |
| **Critical Red** | `#C94B4B` | 'Very Poor' (301-400) / 'Severe' (401-500), emergencies |
| **Primary Text** | `#17201A` | High contrast headings and body text |
| **Muted Text** | `#66736A` | Metadata, timestamps, units, secondary labels |

### Prohibited Aesthetic Tokens
- **No `#000000`** as primary background
- **No neon purple, neon cyan, or neon orange**
- **No dark glassmorphism or cyber gradients**
- **No box-shadow glows (`0 0 20px ...`)**

---

## 3. Typography Hierarchy

PranaMap AI relies on a clean, modern sans-serif typeface (`Inter` / `system-ui`) with generous line-heights and legible weights.

| Element | Desktop Size | Mobile Size | Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | 48–72px | 36–44px | Bold / 700–800 | 1.15 |
| **Page Title** | 32–42px | 28–32px | Bold / 700 | 1.25 |
| **Section Title** | 24–32px | 20–24px | Semibold / 600 | 1.3 |
| **Card Title** | 16–20px | 15–18px | Semibold / 600 | 1.4 |
| **Body Text** | 14–16px | 14–15px | Normal / 400 | 1.6 |
| **Metadata & Badges** | 12–13px | 11–12px | Medium / 500 | 1.4 |

---

## 4. Layout & Application Shell

### A. Public Navigation (Landing & Informational)
- **Brand**: PranaMap AI logomark with Govt/National observatory framing.
- **Navigation Links**: Overview, Air Quality, Forecast, Attribution, Interventions, Advisories, India Network, Data Sources, Data Provenance.
- **Actions**: "Sign In", "Launch Command Center" CTA.

### B. Authenticated Application Shell (Command Center & Dashboards)
- **Top Header**:
  - Live backend connection badge (Latency in ms or `CACHED` status).
  - Search / Hyperlocal station picker.
  - National notification drawer.
  - **User Profile Menu**: Display name, email address, authentication provider pill (Email / Google), direct link to `/settings`, and Firebase `signOut()` trigger.
- **Left Navigation Sidebar**:
  - Compact or expanded view with semantic icons and status indicators.
  - Links: Command Center (`/dashboard`), Air Quality (`/analytics`), Forecast (`/forecast`), Attribution (`/attribution`), Interventions (`/enforcement`), Advisories (`/advisory`), India Network (`/cities`), Data Sources (`/data-sources`), Data Provenance (`/data-provenance`), Settings (`/settings`).

---

## 5. Component Principles & Scientific Truth Tiers

Every metric, card, map layer, and chart in PranaMap AI communicates its data origin using standard truth tier badges:

| Truth Tier | Visual Style | Definition |
| :--- | :--- | :--- |
| **`LIVE`** | Forest Green badge with pulse dot | Real-time ground sensor measurement or hourly meteorological API fetch |
| **`CACHED`** | Amber badge with clock icon | Verified official observation from the latest available operational cache |
| **`OBSERVED`** | Forest Green outline badge | Direct physical sensor measurement (e.g. CPCB Continuous Ambient Air Quality Monitoring Station) |
| **`MODELLED`** | Atmospheric Blue badge | Numerical forecast or physics-based spatial dispersion (e.g. Copernicus CAMS, Open-Meteo) |
| **`SIMULATION`** | Terracotta badge | Counterfactual policy scenario projection (e.g. 30% diesel freight diversion) |

### Anti-Deception Rules
1. **Never show fake confidence percentages** (e.g. "94% AI Accuracy" is strictly prohibited; replaced by statistical metrics or "Directional Modelled Outlook").
2. **Never claim physical measurement for modelled forecasts**.
3. **Never claim SMS/Broadcast delivery** unless an active telecom gateway confirmed receipt.
4. **Preserve spatial integrity**: Unmonitored rural locations (e.g. Raniwara) state `NEAREST_VERIFIED` with distance (64.2 km to Abu Road RIICO Area) rather than fabricating a local ground sensor.

---

## 6. Responsive Breakpoints

PranaMap AI layout adaptively flexes across six core device tiers:
- **1440px+**: Full multi-column dashboard with persistent sidebar and wide map split.
- **1280px**: Standard desktop layout with collapsible inspector drawers.
- **1024px**: Tablet landscape mode with adaptive 2-column card grids.
- **768px**: Tablet portrait mode with slide-out navigation drawer.
- **390px / 375px**: Mobile viewports with bottom navigation bar, horizontally scrollable tabs, stacked KPI cards, and zero horizontal page overflow (`overflow-x: hidden`).
