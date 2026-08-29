# Design

Visual system captured from the v5 codebase (Next.js 14 app router + Tailwind + React Three Fiber).

## Theme system

Runtime-switchable palettes live in `contexts/ThemeContext.tsx` and are applied as CSS variables on `:root`:

- `--theme-primary`, `--theme-secondary`, `--theme-text`, `--theme-background`, `--theme-accent`
- Tailwind exposes them as `bg-theme-primary`, `text-theme-text`, `text-theme-accent`, etc. (see `tailwind.config.ts`).
- Default theme is `monochrome`: near-black `#1A1A1A` / `#000` with white text and UMI orange accent `#FF671F`. Other palettes: default (orange-drenched), cute, night, forest, ocean, arctic, desert, neon, cog.
- Rule: never hardcode colors in components; always go through `--theme-*` variables so every theme works.

## Typography

- Display/headline: `forma-djr-banner` (Adobe/Typekit kit `qzy8qpi`, alongside `receipt-narrow` and `nickel-gothic-variable`) — used for the particle headlines and the `font-forma` Tailwind class. There is no `forma-djr-display` in the kit and no font files in `public/fonts/` (that directory holds three.js typeface JSONs only).
- Body/UI: `receipt-narrow` (`font-receipt` / `font-receipt-narrow` classes) — condensed receipt-printer feel, core to the terminal aesthetic.
- Mono/code + subheads: Monaspace Krypton (`font-monaspace-krypton`); also converted to a three.js typeface JSON for the 3D chrome nav.
- Variable font: `nickel-gothic-variable` (`.font-nickel`).
- Scale on the homepage: headline text-4xl→6xl responsive, subhead text-xl→3xl.

## Signature components / effects

- `ParticleText` — canvas particle headline with pointer interaction.
- `ChromeNav` — React Three Fiber 3D chrome text nav (Monaspace Krypton typeface). Desktop only by product rule; mobile must get a styled 2D nav.
- `CrtGrid` — CRT scanline/grid overlay, layered under content.
- `SmokeyBackground`, `SnowEffect`, `MatrixRain` — atmospheric canvas layers.
- `ScrambleIn` — text scramble-in reveal (uses @chenglou/pretext).
- `RetroWindow` — chrome-window framing for content blocks.
- `ThemeSelector` (draggable, desktop) / `InlineThemeSelector` (inline fallback).
- `MoonPhase` — desktop-only ambient widget.

## Motion

- Entrance: scramble-in text reveals, staggered.
- Tailwind keyframes: `shimmer`, `shimmer-sweep` for sheen sweeps.
- Effects are continuous ambient canvas/WebGL loops; they must pause when offscreen and respect device capability (DPR caps, reduced particle counts on mobile).

## Layout

- Homepage: single centered column `max-w-3xl`, generous `px-[5%]` gutters, effects absolutely positioned behind content (`z-10` effects, `z-20+` content).
- Content pages (blog, oracle, links) follow the same terminal-dark, theme-variable-driven styling.
