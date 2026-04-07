<!--
File purpose: capture the current visual direction for the landing page after researching Awwwards-style recommendations.
Why this exists: to keep a shared design brief for future sections, refinements, and responsive tuning.
What it does: summarizes the actionable design patterns we are using now and links them back to the current implementation.
Connected to: `src/styles/global.css`, `src/widgets/header/ui/Header.astro`, `src/widgets/hero/ui/Hero.astro`, and future design iterations.
-->

# Awwwards-Style Design Direction

## Chosen UI kit

- Preline UI is the primary kit direction.
- Reason: it gives us a large set of ready-made, polished landing-page patterns that work well with Astro and Tailwind.
- We are using its compositional logic and visual language rather than copying a specific template one-to-one.

## What we are borrowing

- Typography-heavy composition with editorial rhythm.
- Minimal layout structure with a strong central narrative.
- Asymmetry instead of strict grid symmetry.
- Soft window/shadow overlays to create depth and materiality.
- Glows and light blooms around key focal points.
- Compact, high-contrast UI controls.
- Subtle motion, only where it reinforces focus.

## Why this fits the landing page

The Minpromtorg service is trust-sensitive and document-heavy. A premium editorial layout helps the page feel:

- more credible;
- less templated;
- calmer and more deliberate;
- easier to scan;
- closer to a high-end product than a generic lead-gen site.

## Design decisions in the current build

- `Arial` is used globally to keep the interface blunt, clear, and corporate.
- The page is full-width with tight outer spacing.
- The first screen is the only hero block, so the message stays focused.
- The hero uses layered cards, glows, and a compact trust band to create depth without clutter.
- Motion is subtle and respects reduced-motion preferences.
- The current implementation is rebuilt around Tailwind 4 and Preline-style utility composition.

## Sources

- Awwwards: Typography-Heavy Web Design
  - https://www.awwwards.com/typography-heavy-design.html
- Awwwards: Editorial Layout
  - https://www.awwwards.com/inspiration/editorial-layout
- Webflow: 6 web design trends to watch in 2025
  - https://webflow.com/blog/web-design-trends-2025
- Preline: Official documentation
  - https://preline.co/docs/index.html
