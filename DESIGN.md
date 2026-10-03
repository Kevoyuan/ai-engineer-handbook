---
name: AI Engineer Handbook
description: A knowledge manual for focused learning and quick reference
last_updated: "2026-10-03"
status: "active"
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
  architecture-panel: "0.75rem"
  concept-panel: "1rem"
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

# AI Engineer Handbook Design System

## Overview
This is the active design contract for the production knowledge manual and its preview. Help readers find a topic, understand it, and return to useful passages. Runtime tokens live in `preview/handbook-custom/src/handbook.css`; the published build lives in `web/site`. This contract replaces the earlier blue/orange reader design.

Apply targeted evolution rather than a new visual direction. Design variance 5, motion intensity 4 and visual density 5 describe the current concept-teaching enhancement. Preserve routes, anchors, technical content, bilingual labels and established diagram topology.

## Colors
Dark mode uses neutral charcoal surfaces, gray-white headings and body text, and gray secondary text. Use green sparingly for the brand mark, selected controls, links and focus. Never tint reading backgrounds, chapter headings, diagrams or borders green by default. The light palette keeps its established identity; secondary text is slightly darker to maintain AA contrast on secondary surfaces. Semantic aliases in the stylesheet govern components.

## Typography
Use Geist Variable with Chinese system fallbacks for prose, Geist Mono Variable for code. Preserve the existing readable article measure and heading hierarchy. Noninteractive headings stay neutral in dark mode.

## Layout
Desktop chapter navigation can collapse to give the reader more space; preserve the user's choice. On mobile, use a compact navigation dialog and let the toolbar scroll with the content. The page table of contents opens on demand in a dialog, never in a permanently reserved right column. Keep the GitHub link in the upper-right toolbar.

Previous/next navigation belongs at the end of the chapter in normal flow. Do not add fixed bottom bars, persistent mobile directory/filter bars or reading-position restoration. Font size, theme, language, bookmarks and sidebar preferences remain local. Scrollbars stay quiet and reveal on hover, focus or scrolling while retaining normal scrolling behavior.

Wide tables and code scroll inside their own containers. Table cells use a 128px minimum width and normal word wrapping so identifiers are not split into fragments. Avoid page-level horizontal overflow. Check desktop, tablet and phone layouts; principal review widths are 390, 768, 1440 and 1728px.

## Elevation & Depth
Distinguish surfaces through neutral tones and thin borders. Reserve the large dark shadow for the search dialog. Keep chapter rows flat.

## Shapes
Use the existing 0.625rem base radius for controls, inputs and diagram nodes. Architecture panels use 0.75rem; concept-teaching panels use 1rem. Keep these documented variants rather than inventing radii per component. Spacing uses 4/8/12/16/24/32/40/48/64/96/128px tokens.

## Components
The complete edition covers the directory, the system framework and Agent reference architecture, every chapter and registered supplement, section search, bookmarks, and local reading preferences. Desktop uses one bounded content scroller per route. On phones, the toolbar and route content scroll together. The architecture overview preserves the original execution core, domain connections, control plane, feedback loop and platform foundation; module links open the corresponding chapters. Wide comparison tables and code own their horizontal scrolling.

Runtime ownership is Model B: `preview/handbook-custom/src/handbook.css` owns semantic light/dark tokens; `preview/handbook-custom/src/index.css` maps them into Tailwind utilities; installed shared components consume those utilities. `preview/handbook-custom/src/content-base.css` is generated topology CSS with scoped selectors. The article adapter maps legacy `--paper`, `--ink`, `--mut`, `--line` into the same semantic tokens. Inline literal colors in derived content are normalized by the generator. DESIGN frontmatter mirrors runtime palette values.

Technical diagrams retain native, trusted document markup as a compatibility variant so their registered topology, bilingual content, and interactive labs remain complete. Diagram colors express technical roles sparingly; chapter surfaces and noninteractive headings remain neutral.

Keep the installed Better Design React components and assigned Iconoir icons. Theme semantic tokens instead of introducing per-component palettes. Search, chapter filters, bookmarks and theme toggle retain their current behavior.

## Do's and Don'ts
- Do keep prose and noninteractive headings gray-white in dark mode.
- Do distinguish page, card and selected surfaces with neutral charcoal values.
- Do use green only where it signals identity or interaction.
- Don't cover the page in green or reduce secondary-text contrast.
- Don't introduce viewport-specific palettes or low-contrast text.
- Don't make static article content wait for entrance animations or hide it until scrolling.
- Don't restore the old fixed reading controls or permanent page-contents column.

## Article color compatibility

Legacy article variables map into the shared semantic theme. `--blu` maps to the primary action token, not the previous blue palette. Amber aliases orange. Teal and the other technical role colors must remain defined in both themes so category markers do not disappear.

Callout headings stay in normal content flow with a transparent background, neutral container border and restrained semantic foreground. Use orange for essential points, green for tips and red for warnings. Do not reintroduce floating badges, saturated label backgrounds or inherited white text on pale fills. Callouts use 24px desktop inset and 16px on phones, with 24px vertical separation.

Code keys, strings and numbers use theme-specific syntax tokens from `preview/handbook-custom/src/handbook.css`. Inline role fills use a subtle mixed surface with the normal text foreground. Filled and hovered controls always pair `--primary` with `--primary-foreground`; never override only one side. Verify actual computed contrast on both themes: at least 4.5:1 for ordinary text and 3:1 for large text.

## Interactive concept diagrams

Use interaction when it explains a decision, evidence relationship or feedback loop. Current examples are Query Routing (chapter 03), RAG evidence gates (04) and bounded Agent loops (08). Place each teaching module beside the relevant original figure, retaining the full static diagram and article. A toolbar shortcut takes readers directly to the module.

Each module has one labelled example selector, a connected node diagram, one current explanation, playback controls and a concise takeaway. Label examples as illustrative; do not imply real tool execution or invent confidence scores, benchmark results or business policies. Preserve authorization, version, failure and stopping boundaries even in simplified diagrams.

Nodes use neutral surfaces and borders; the current node uses the shared accent surface, primary border and a textual current-state label. Meaning must not depend on color alone. Use installed Button components and Iconoir connector arrows. Nodes remain keyboard-operable, and clicking a node reveals its explanation immediately.

At reading-pane widths below 768px, the four nodes and arrows stack vertically. Panels use 24px desktop inset and 16px mobile inset; nodes use 16px inset, 32px connecting gaps, and minimum heights of 132px desktop / 96px compact. Transport controls use 16px horizontal inset and hit areas of at least 44 × 44px. Keep explanation space reserved to reduce jumps between stages.

## Motion and playback

Motion communicates the selected stage, information transfer or input feedback. Reading and navigation remain immediate. Avoid decorative loops, parallax, scroll hijacking, artificial loading delays and animations on static prose.

| Interaction | Current implementation |
|---|---|
| Explanation change | 200ms ease-out; opacity and 5px vertical translation |
| Connector feedback | Finite 1.4s ease-out opacity/scale marker during playback |
| Button press | 160ms ease-out; scale to 0.98 while pressed |
| Playback cadence | One explanation every 2.8s; stop after the final frame |

Playback starts only after an explicit reader action. Support pause, replay, previous/next and direct node selection. Pausing at the final frame preserves that frame. Changing examples stops playback and resets the explanation. Leaving the module or hiding the tab pauses it. Repeated input interrupts the current transition; never queue stale animations.

Honor `prefers-reduced-motion`: remove timed playback, animated connector markers and movement, but retain all examples, nodes, explanations and manual steps. The completed state must remain reachable. Announce manual explanation changes politely; do not continuously announce every explanation during playback.

Use the installed `motion/react` package in the isolated concept component. Animate transform and opacity, with discrete state updates only at stage changes. Do not drive continuous animation through React state or add animation scroll listeners. Clean up timers, observers, listeners and portal slots on unmount.

Load the concept module separately for its three chapters. Reserve the shortcut's place before loading to prevent toolbar shifts, and keep it disabled until the diagram mounts. Preserve requested deep links after insertion. A local error boundary must retain the article and offer reload if the optional module fails.

## Validation and ownership

- `preview/handbook-custom/src/handbook.css`: shared theme, article compatibility and concept layout.
- `preview/handbook-custom/src/architecture.css`: architecture diagram visual system.
- `preview/handbook-custom/src/concept-diagrams.tsx`: bilingual teaching examples, playback and reduced-motion behavior.
- `preview/handbook-custom/src/reader.tsx`: diagram placement, shortcut readiness, error isolation and section navigation.
- `preview/handbook-custom/src/content-base.css` and chapter payloads: generated content; edit their source generators rather than generated topology.

For diagram changes, run `npm run test:concepts` in `preview/handbook-custom` and review both themes, both languages, normal/reduced motion and phone/desktop layouts. Check playback interruption, completion, error recovery, keyboard access, deep links and container scrolling. Measure rendered spacing at 390/1440/1728px with equivalent components grouped separately, then inspect screenshots for hierarchy and readable labels. Run `node web/validate.mjs` from the repository root to catch broken published references.

The implementation and prior verification scope are recorded in [the concept diagram handoff](preview/handbook-custom/evidence/concept-diagrams.md). Performance and accessibility scores describe measured states, not universal compatibility guarantees. Document limitations honestly; real-device Safari and INP require separate measurement.


## Architecture diagram system

`preview/handbook-custom/src/architecture.css` is the shared visual owner for both reference diagrams. `diagram-panel` provides a neutral surface, one-pixel border, 0.75rem radius and consistent inset; `diagram-label` provides a quiet, compact role label. Content and connectivity remain generated from the original source by `preview/handbook-custom/scripts/sync-architecture.mjs`.

Role tokens are shared across both diagrams: `--diagram-evidence` (blue), `--diagram-state` (amber), `--diagram-action` (violet), and `--diagram-control` (sage). Dark variants brighten the accents without tinting the page. Use color for role labels and restrained emphasis on execution cores, not decorative borders on every module. `--diagram-rule` owns connectors and `--diagram-inset` owns module padding.

The execution sequence uses numbered circles along a continuous line. Dependencies connect laterally on wide screens; compact layouts stack the execution core and dependency groups. The Agent flow preserves vertical connections when its three planes stack. All headings and prose use the handbook sans family; monospace is reserved for numerical step identifiers. Chapter links retain focus outlines and 44px mobile targets. No diagram navigation is fixed over the content.
