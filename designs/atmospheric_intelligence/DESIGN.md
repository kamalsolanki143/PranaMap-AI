---
name: Atmospheric Intelligence
colors:
  surface: '#101419'
  surface-dim: '#101419'
  surface-bright: '#36393f'
  surface-container-lowest: '#0a0e13'
  surface-container-low: '#181c21'
  surface-container: '#1c2025'
  surface-container-high: '#262a30'
  surface-container-highest: '#31353b'
  on-surface: '#e0e2ea'
  on-surface-variant: '#b9caca'
  inverse-surface: '#e0e2ea'
  inverse-on-surface: '#2d3136'
  outline: '#849495'
  outline-variant: '#3a494a'
  surface-tint: '#00dce5'
  primary: '#e9feff'
  on-primary: '#003739'
  primary-container: '#00f5ff'
  on-primary-container: '#006c71'
  inverse-primary: '#00696e'
  secondary: '#c1c6d7'
  on-secondary: '#2a303d'
  secondary-container: '#434957'
  on-secondary-container: '#b3b8c8'
  tertiary: '#fff9f0'
  on-tertiary: '#3a3000'
  tertiary-container: '#ffdb3f'
  on-tertiary-container: '#736000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#63f7ff'
  primary-fixed-dim: '#00dce5'
  on-primary-fixed: '#002021'
  on-primary-fixed-variant: '#004f53'
  secondary-fixed: '#dde2f3'
  secondary-fixed-dim: '#c1c6d7'
  on-secondary-fixed: '#161c27'
  on-secondary-fixed-variant: '#414754'
  tertiary-fixed: '#ffe16c'
  tertiary-fixed-dim: '#e7c427'
  on-tertiary-fixed: '#221b00'
  on-tertiary-fixed-variant: '#544600'
  background: '#101419'
  on-background: '#e0e2ea'
  surface-variant: '#31353b'
typography:
  display-xl:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 32px
  gutter: 24px
  sidebar-width: 360px
  control-height: 40px
---

## Brand & Style
The design system is engineered for mission-critical urban intervention. It conveys an aura of technical authority and real-time precision, catering to urban planners, environmental scientists, and city officials. The aesthetic leans heavily into **High-Fidelity Glassmorphism** and **Technical Minimalism**, evoking the feeling of a sophisticated "Command Center."

The UI prioritizes data clarity above all else, using deep spatial layering to separate global telemetry from local intervention tools. Expect high-contrast interactions against a light-absorbing backdrop, where the AI is represented not by a character, but by an ethereal electric cyan glow that illuminates the dark interface.

## Colors
The palette is rooted in a "Deep Space" charcoal (`#0B0F14`) to ensure the map and data visualizations remain the primary focus. 

- **Primary Accent:** Electric Cyan (`#00F5FF`) is reserved for AI-suggested interventions, active states, and primary CTAs. It should feel like it is emitting light.
- **Data Spectrum:** A strictly defined AQI scale is used for environmental telemetry. These colors must always appear against dark backgrounds to maintain their neon-like vibrance.
- **Surface Tiers:** Use varying levels of opacity rather than solid grays to create depth. Base surfaces use a 4% - 8% white overlay on the primary background.

## Typography
The typographic hierarchy balances modern engineering with data density. 

- **Headlines:** Geist provides a sharp, geometric precision that feels "built." Use it for page titles and high-level metric headers.
- **Body:** Inter is the workhorse for all descriptive text, ensuring high legibility even at reduced opacities.
- **Data & Metrics:** JetBrains Mono is utilized for all numerical readings and coordinate data. Its monospaced nature prevents "jumping" during real-time data updates and reinforces the technical narrative.
- **Styling:** Use `label-caps` for section headers within sidebars to maintain a disciplined, professional structure.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. Navigation and analytical sidebars are fixed-width to ensure data integrity, while the central Map/Visualization area is fluid.

- **Grid:** A 12-column grid is used for dashboard views, but the primary interface is a "Canvas" layout where modules float over the map background.
- **Safe Zones:** Always maintain a 32px margin from the edge of the viewport for floating glass containers.
- **Density:** High data density is encouraged. Use the 4px base unit for tight internal component spacing (e.g., 8px between a label and its value).

## Elevation & Depth
Depth is created through **Subtractive Layering** and **Glassmorphism** rather than traditional drop shadows.

- **Base Layer:** The map or primary data visualization.
- **Surface Layer:** 1px borders with 10% white opacity (`rgba(255,255,255,0.1)`). Backgrounds are blurred at 20px (Backdrop Filter) with a 6% white tint.
- **Active Layer:** When a module is selected or an AI intervention is active, apply a subtle outer glow using the Primary Cyan (`#00F5FF`) with a 20% opacity and 15px spread.
- **Shadows:** Avoid black shadows. If depth is required, use a "Hard Stop" shadow—a 1px offset line that mimics a physical edge highlight.

## Shapes
The shape language is **Soft-Technical**. We avoid the friendliness of fully rounded "pills" in favor of disciplined, tight radii that feel architectural.

- **Components:** Standard buttons and input fields use a 0.25rem (4px) radius.
- **Containers:** Large glass modules use 0.5rem (8px) to soften the "Command Center" aesthetic just enough to remain sophisticated.
- **Interactive States:** Hover states should not change the shape, but rather the border intensity and backdrop-blur strength.

## Components
- **Primary Buttons:** Solid Electric Cyan with black text. On hover, add a subtle cyan glow. No gradients.
- **Glass Cards:** Semi-transparent containers with a top-down 1px border gradient (White 15% to White 5%). 
- **Data Readouts:** Large monospaced numbers with a 1px tracking label above them. Use the AQI status colors for the numerical value itself.
- **AI Intervention Toggle:** A custom switch component that, when active, triggers a "pulse" animation on the map to indicate AI-driven simulation.
- **Inputs:** Darker than the background (`#05070A`) with a subtle inner shadow to feel "recessed" into the hardware.
- **Status Badges:** Small, rectangular badges with a subtle background tint and a high-contrast dot of the status color.