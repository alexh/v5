# Product

## Register

brand

## Users

Visitors to alexhaynes.org: recruiters, engineering peers, collaborators, and people arriving from UMI / OuterSignal / blog links. They come to get a read on who Alex is (software engineer + creative in NYC) and browse the blog, generative AI art (Oracle), and links. Many arrive on phones from social/chat links, so mobile is a first-class entry point, not an afterthought.

## Product Purpose

Personal portfolio and playground (v5 of alexhaynes.org). The design IS the product: it demonstrates creative engineering ability through interactive effects (particle text, 3D chrome nav, CRT grid, themes, smoke/snow). Success = a visitor immediately senses craft and personality, and everything stays fast and smooth on any device.

## Brand Personality

Maximalist, playful, technically confident. Refined retro-terminal / CRT aesthetic with switchable themes (default monochrome-with-orange-accent; the orange #FF671F ties to Utility Materials). Effects should feel intentional and engineered, never gimmicky or laggy.

## Anti-references

- Generic dev portfolio: card grids of projects, skill badges, timeline resumes, Inter-on-dark template feel.
- Corporate/minimal: sterile whitespace-minimalism with no personality.
- Broken jank: anything laggy, overflowing, misaligned, or layout-shifting. Jank is the one thing that kills the maximalism.

## Design Principles

- Effects earn their frame budget: every visual flourish must hold 60fps on mid-range mobile, or it gets tuned down (particle counts, DPR caps, offscreen pause) for that context.
- Mobile constraint: the 3D chrome nav text is ALWAYS removed on mobile; replace with a styled non-3D nav. Other effects are tuned, not stripped.
- Personality over convention, precision over polish-by-subtraction: fix jank by engineering, not by deleting character.
- Theme-proof: every surface must work across all ThemeContext palettes, driven by the --theme-* CSS variables, never hardcoded colors.

## Accessibility & Inclusion

Best-effort only. Don't constrain the art; fix egregious issues (unreadable text, broken tap targets) when encountered, but no formal WCAG target.
