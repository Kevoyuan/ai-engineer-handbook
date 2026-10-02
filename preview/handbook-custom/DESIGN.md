---
name: AI Engineer Handbook Preview
description: A knowledge manual for focused learning and quick reference
colors:
  primary: "#285a47"
  light-background: "#f4f6f4"
  light-foreground: "#25352f"
  light-card: "#fdfefd"
  light-primary: "#285a47"
  light-primary-foreground: "#f7faf8"
  light-secondary: "#e9eeea"
  light-secondary-foreground: "#354c40"
  light-muted: "#edf1ed"
  light-muted-foreground: "#59645c"
  light-accent: "#e5eee7"
  light-accent-foreground: "#285a47"
  light-border: "#dce3dd"
  light-input: "#f8faf8"
  light-ring: "#367657"
  light-ring-inverted: "#98c7ac"
  dark-background: "#141517"
  dark-foreground: "#e7e7e9"
  dark-card: "#1a1b1e"
  dark-primary: "#a0bfaf"
  dark-primary-foreground: "#16221c"
  dark-secondary: "#242529"
  dark-secondary-foreground: "#dedee2"
  dark-muted: "#202125"
  dark-muted-foreground: "#a5a6ad"
  dark-accent: "#292b2e"
  dark-accent-foreground: "#a0bfaf"
  dark-border: "#35363b"
  dark-input: "#1d1e21"
  dark-ring: "#a0bfaf"
  dark-ring-inverted: "#7ba78e"
typography:
  body:
    fontFamily: "Geist Variable, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "1rem"
  observed-0:
    fontSize: "0.625rem"
  observed-1:
    fontSize: "0.6875rem"
  observed-2:
    fontSize: "0.75rem"
  observed-3:
    fontSize: "0.8125rem"
  observed-4:
    fontSize: "0.875rem"
  observed-5:
    fontSize: "0.9375rem"
  observed-6:
    fontSize: "1.125rem"
  observed-7:
    fontSize: "1.25rem"
  observed-8:
    fontSize: "1.875rem"
  observed-9:
    fontSize: "1rem"
  observed-10:
    fontSize: "2.25rem"
  observed-11:
    fontSize: "2.625rem"
  observed-12:
    fontSize: "2rem"
rounded:
  base: "0.625rem"
  observed-0: "0rem"
  observed-1: "10px"
  observed-2: "4px"
  observed-4: "6px"
  observed-5: "8px"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
---

## Overview
The knowledge manual is the established direction. Help readers find a topic, understand it, and return to useful passages. This document describes only the standalone preview; runtime tokens live in `src/handbook.css`.

## Colors
Dark mode uses neutral charcoal surfaces, gray-white headings and body text, and gray secondary text. Use green sparingly for the brand mark, selected controls, links and focus. Never tint reading backgrounds, chapter headings, diagrams or borders green by default. The light palette keeps its established identity; secondary text is slightly darker to maintain AA contrast on secondary surfaces. Semantic aliases in the stylesheet govern components.

## Typography
Use Geist Variable with Chinese system fallbacks for prose, Geist Mono Variable for code. Preserve the existing readable article measure and heading hierarchy. Noninteractive headings stay neutral in dark mode.

## Layout
Keep persistent chapter navigation on desktop and a compact navigation dialog on mobile. The directory supports browsing and the reader pairs article content with a table of contents. Tested viewport widths: 390, 1440 and 1728 pixels.

## Elevation & Depth
Distinguish surfaces through neutral tones and thin borders. Reserve the large dark shadow for the search dialog. Keep chapter rows flat.

## Shapes
Use the existing 0.625rem base radius and component variants; retain established row and input shapes.

## Components
The complete edition covers the directory, the system framework and Agent reference architecture, every chapter and registered supplement, section search, bookmarks, and local reading preferences. Desktop uses one bounded content scroller per route. On phones, the toolbar and route content scroll together. The architecture overview preserves the original execution core, domain connections, control plane, feedback loop and platform foundation; module links open the corresponding chapters. Wide comparison tables and code own their horizontal scrolling.

Runtime ownership is Model B: `src/handbook.css` owns semantic light/dark tokens; `src/index.css` maps them into Tailwind utilities; installed shared components consume those utilities. `src/content-base.css` is generated topology CSS with scoped selectors. The article adapter maps legacy `--paper`, `--ink`, `--mut`, `--line` into the same semantic tokens. Inline literal colors in derived content are normalized by the generator. DESIGN frontmatter mirrors runtime palette values.

Technical diagrams retain native, trusted document markup as a compatibility variant so their registered topology, bilingual content, and interactive labs remain complete. Diagram colors express technical roles sparingly; chapter surfaces and noninteractive headings remain neutral.

Keep the installed Better Design React components and assigned Iconoir icons. Theme semantic tokens instead of introducing per-component palettes. Search, chapter filters, bookmarks and theme toggle retain their current behavior.

## Do's and Don'ts
- Do keep prose and noninteractive headings gray-white in dark mode.
- Do distinguish page, card and selected surfaces with neutral charcoal values.
- Do use green only where it signals identity or interaction.
- Don't cover the page in green or reduce secondary-text contrast.
- Don't introduce viewport-specific palettes or low-contrast text.


## Architecture diagram system

`src/architecture.css` is the shared visual owner for both reference diagrams. `diagram-panel` provides a neutral surface, one-pixel border, 0.75rem radius and consistent inset; `diagram-label` provides a quiet, compact role label. Content and connectivity remain generated from the original source by `scripts/sync-architecture.mjs`.

Role tokens are shared across both diagrams: `--diagram-evidence` (blue), `--diagram-state` (amber), `--diagram-action` (violet), and `--diagram-control` (sage). Dark variants brighten the accents without tinting the page. Use color for role labels and restrained emphasis on execution cores, not decorative borders on every module. `--diagram-rule` owns connectors and `--diagram-inset` owns module padding.

The execution sequence uses numbered circles along a continuous line. Dependencies connect laterally on wide screens; compact layouts stack the execution core and dependency groups. The Agent flow preserves vertical connections when its three planes stack. All headings and prose use the handbook sans family; monospace is reserved for numerical step identifiers. Chapter links retain focus outlines and 44px mobile targets. No diagram navigation is fixed over the content.
