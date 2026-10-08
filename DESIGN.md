---
name: AI Engineering Atlas
description: An engineering knowledge atlas for exploring systems, learning deeply, and returning to evidence
last_updated: "2026-10-07"
status: "active"
colors:
  primary: "#2f6850"
  light-background: "#f4f6f3"
  light-foreground: "#18211d"
  light-card: "#fcfdfc"
  light-primary: "#2f6850"
  light-primary-foreground: "#f7faf8"
  light-secondary: "#e3e9e5"
  light-secondary-foreground: "#25332c"
  light-muted: "#eef2ef"
  light-muted-foreground: "#68736d"
  light-accent: "#dde9e2"
  light-accent-foreground: "#25332c"
  light-border: "#d7dfda"
  light-input: "#f8faf8"
  light-ring: "#2f6850"
  light-ring-inverted: "#98c7ac"
  dark-background: "#141718"
  dark-foreground: "#e7ebe8"
  dark-card: "#1b1f20"
  dark-popover: "#222728"
  dark-success: "#a9c5b5"
  dark-warning: "#d9ba86"
  dark-destructive: "#e1a19b"
  dark-destructive-foreground: "#291b1a"
  dark-primary: "#b8d0c0"
  dark-primary-foreground: "#19241e"
  dark-secondary: "#262c2a"
  dark-secondary-foreground: "#e0e4e2"
  dark-muted: "#222725"
  dark-muted-foreground: "#a8b0ac"
  dark-accent: "#2a3430"
  dark-accent-foreground: "#c6d9cd"
  dark-border: "#333a37"
  dark-input: "#181c1d"
  dark-ring: "#b8d0c0"
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

# AI Engineering Atlas Design System

## Overview
This is the active visual contract for the AI Engineering Atlas. The product is no longer framed as a conventional online handbook. It is an engineering knowledge instrument: readers should be able to see the system, locate a concept, understand its dependencies, inspect evidence, and then enter deep reading without losing orientation.

The visual North Star is **engineering workbench × technical manual × system topology**. The memorable signature is the Knowledge Spine: a visible trace from Model → Retrieval → Agent → Production that reappears as chapter nodes, section traces, and diagram connections. Everything around that signature stays restrained.

Avoid generic documentation-site patterns, SaaS dashboard cards, glassmorphism, gradient hero sections, decorative analytics, and scroll-reveal marketing motion. Dense technical content is the product. Visual structure must reveal relationships rather than decorate them.

Runtime tokens live in `preview/handbook-custom/src/handbook.css`; the published build lives in `web/site`. Routes, deep section anchors, bilingual content, technical meaning, diagrams, search, bookmarks, and accessibility behavior remain durable product contracts unless explicitly revised together with `UX-CONTRACT.md`.

The first cohesive Atlas system now covers all four primary surfaces plus the connective Concept Layer: Atlas establishes the Knowledge Spine, Reader exposes current-section trace and reading progress in the existing shell, Search behaves as a ranked local Knowledge Command, Notebook presents saved chapters as a return surface, and Concept routes connect canonical sources across chapters. Future work may extend concept coverage or add section/concept-level saves, but it must extend this system rather than introduce a second visual language.

## Colors
Light mode uses a pale mineral canvas (`#f4f6f3`), near-white reading surfaces (`#fcfdfc`), dark green-black ink (`#18211d`), and restrained gray-green secondary text. The primary `#2f6850` is a **signal**, not a wash: use it for current nodes, selected controls, links, focus, meaningful connectors, and system state.

Dark mode is a laboratory graphite system: canvas `#141718`, reading surface `#1b1f20`, raised/popover surface `#222728`, gray-white text, and muted sage signals. Never tint an entire reading surface green. Borders stay neutral; diagrams communicate hierarchy with structure and labels before color.

Semantic colors are allowed when they encode engineering meaning such as evidence, warnings, failures, or destructive actions, but they must not become decorative category colors. Meaning can never depend on color alone.

## Whole-site dark refinement

The whole-site dark refinement applies to Atlas, Notebook, Search, navigation dialogs, article tables/code/callouts, concept modules and architecture diagrams. Shared runtime tokens carry the Atlas graphite surfaces: navigation/canvas #141718, header/input #181c1d, reading #1b1f20, secondary #262c2a and popover #222728. Soft gray-green text and muted sage actions retain the existing identity. Elevation uses neutral dark shadows and a restrained top rim. Dark dialog scrims use black at 64% opacity instead of compositing a pale foreground wash over the page; the installed Dialog retains its behavior and reads semantic overlay/popover tokens. Focused search inputs retain their two-pixel component border without a duplicate outer outline.

Gain: clearer reading and consistent surface hierarchy across routes. Cost: lighter charcoal surfaces reduce the former deep-black appearance. Light-theme tokens and content are preserved. The terminal has a named dark variant that follows the same graphite material with a quiet peach primary action. Pretext prepare/layout reserve simulator explanation heights after fonts load; native wrapping stays visible and widths are remeasured on resize. No new permission or billing behavior is introduced.

## Typography
Use Geist Variable with Chinese system fallbacks for the current production implementation and Geist Mono Variable for code, metadata, chapter indices, system labels, and diagram annotations. The Atlas redesign deliberately increases the role of mono typography for structural metadata such as `03 / RETRIEVAL`, but prose remains sans-serif and calm.

A future IBM Plex Sans / IBM Plex Mono migration is acceptable only when the fonts are bundled locally and the runtime tokens, dependency manifest, and this file change together. Do not load remote web fonts just to match a mockup.

Article headings remain neutral. Do not create “AI-looking” display typography. Hierarchy should come from scale, weight, spacing, and system labels rather than ornamental type.

## Layout
The product has four primary mental surfaces: **Atlas** for system orientation, **Reader** for deep learning, **Search** for immediate retrieval, and **Notebook** for returning to saved knowledge. **Concept** is a connective entity layer between Atlas and Reader rather than a fifth top-level destination. Existing hash routes may continue to back these surfaces during migration.

The Atlas home begins with the system itself, not a marketing hero. Its dominant composition is a Knowledge Spine grouped into Model, Retrieval & RAG, Agent Engineering, and Evaluation & Production. Chapters render as nodes on a trace, with descriptions and optional interactive-lab affordances. A secondary inspector may summarize architecture or counts, but it must remain flat and subordinate to the spine.

Desktop chapter navigation may collapse. Mobile uses an overlay navigation dialog. The Reader must never gain a permanent right-column table of contents; on-page navigation opens on demand. Long-form content owns a single clear scroll context per viewport mode.

Previous/next navigation remains at the end of chapters in normal flow. Do not add fixed bottom bars, persistent mobile control bars, scroll hijacking, or decorative parallax. Wide tables and code scroll internally. Review widths remain 390, 768, 1440, and 1728px.

## Elevation & Depth
The default surface is flat. Use background tone, whitespace, thin rules, topology lines, and alignment before shadows. Chapter nodes and Atlas groups are not cards. Reserve meaningful elevation for transient UI such as Search, dialogs, popovers, and menus. Large soft shadows are never used merely to make static content feel “premium.”

## Shapes
Controls and topology nodes use restrained radii. The base radius remains `0.625rem`, architecture panels `0.75rem`, and concept-teaching panels `1rem`. Static content should not become a field of rounded rectangles.

The Knowledge Spine uses circles, fine connector rules, chapter indices, and aligned text rather than decorative badges. Avoid pill-shaped labels except where a true compact control or status requires them. Spacing continues to use the established 4/8/12/16/24/32/40/48/64/96/128px rhythm.

## Components
The complete edition covers Atlas, Notebook, the system framework and Agent reference architecture, every chapter and registered supplement, ranked section search, bookmarks, and local reading preferences. Desktop uses one bounded content scroller per route. On phones, the toolbar and route content scroll together. The architecture overview preserves the original execution core, domain connections, control plane, feedback loop and platform foundation; module links open the corresponding chapters. Wide comparison tables and code own their horizontal scrolling.

Runtime ownership is Model B: `preview/handbook-custom/src/handbook.css` owns semantic light/dark tokens; `preview/handbook-custom/src/index.css` maps them into Tailwind utilities; installed shared components consume those utilities. `preview/handbook-custom/src/content-base.css` is generated topology CSS with scoped selectors. The article adapter maps legacy `--paper`, `--ink`, `--mut`, `--line` into the same semantic tokens. Inline literal colors in derived content are normalized by the generator. DESIGN frontmatter mirrors runtime palette values.

Technical diagrams retain native, trusted document markup as a compatibility variant so their registered topology, bilingual content, and interactive labs remain complete. Diagram colors express technical roles sparingly; chapter surfaces and noninteractive headings remain neutral.

Immersive Reader uses a **content-first single-line topbar**. The chapter number and title appear visually only in this topbar; the article retains a screen-reader-only level-one heading for semantic document navigation. The topbar can also show the current section and rounded reading percentage with a two-pixel progress trace, truncating secondary context as width narrows. No large chapter cover or local action strip may precede the article.

Reader tools live in the existing topbar: Search and On this page are direct actions; font size, Focus, chapter bookmark, interactive diagram, theme, language, and GitHub are in an accessible overflow menu. Focus mode keeps a direct topbar exit affordance. Never convert these controls into a persistent bottom bar.

Scroll direction governs visibility: when reading down beyond a short threshold, the topbar hides; upward scrolling, reaching the top, keyboard Tab, or moving the pointer to the top edge reveals it. Ignore small scroll jitter and keep it shown while menus or dialogs are active. On desktop the hidden bar yields its layout height to the article; on mobile it is an overlay so hiding it does not reflow or jump the scroll owner. In reduced motion, visibility remains functional but transition animations are removed.

Search is a command surface, not a result-card gallery. Results remain flat, show chapter index and match language, identify the best deterministic match, and highlight literal match text with the accent token rather than a yellow marker.

Concept pages are indexes, not essays. Use one large concept name, one concise source-grounded summary, one canonical entry, a flat source trail, and a narrow related-concepts rail. Do not wrap each source in a card. Concept summaries may restate canonical chapter claims but must not introduce technical claims that are absent from their linked sources.

Keep the installed Better Design React components and assigned Iconoir icons. Theme semantic tokens instead of introducing per-component palettes. Search keeps its IME-safe keyboard contract while using deterministic relevance ranking and match-language snippets. Bookmarks and theme toggle retain their persistence behavior. The old category-filter toolbar is intentionally removed from Atlas; the system view always shows the full four-layer spine, while `#home/saved` is the Notebook surface.



## Generated content hygiene

Generated reader payloads are presentation outputs, not authoring surfaces. Internal HTML comments, separator markers, build notes, and other author-only annotations must never become visible Reader text.

The content-sync pipeline must remove HTML comments before locale transformation. Locale conversion must explicitly ignore comment nodes rather than treating them as ordinary text. Generated output must fail validation if an internal chapter separator such as `===== CH7 =====` becomes visible.

This rule applies to both `preview/handbook-custom/public/content/` and the published `web/site/content/` artifact. Fix leaks in the generator, not by hand-editing generated JSON.

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

Verification-boundary notes are supporting evidence metadata, not primary reading blocks. Render them as native `details/summary` disclosures collapsed by default, with a thin neutral rule and compact mono metadata. Closed state should stay around one control row tall; opening reveals the full boundary text and sources without changing semantic content.

Code keys, strings and numbers use theme-specific syntax tokens from `preview/handbook-custom/src/handbook.css`. Inline role fills use a subtle mixed surface with the normal text foreground. Filled and hovered controls always pair `--primary` with `--primary-foreground`; never override only one side. Verify actual computed contrast on both themes: at least 4.5:1 for ordinary text and 3:1 for large text.

## Cross-surface reading density and UI audit

The Atlas, Notebook, Concept, Architecture, Search, and all Reader chapters share one UI quality floor: content-first hierarchy, real semantic grouping, no accidental page-level horizontal overflow, and a 44px minimum touch target on actions. Review representative widths at 390, 768, 1440 and 1728px in both languages and themes; use actual browser geometry and keyboard/accessibility tests rather than CSS guesses.

**Vertical space is a budget.** Avoid fixed minimum heights on short explanations, unanswered practice feedback, and loaded-file preview panes. Concept node flows should remain visually connected but compact, with legible labels and visible directional arrows; mobile diagrams stack without oversized inter-node gutters. Do not change topology, source meaning, or make all different diagrams into generic cards.

**Archify overview is a preview, not a second full-page diagram.** Keep a height-bounded thumbnail and one clearly labeled Open map action. The full diagram remains accessible through the viewer, including zoom and export. Do not duplicate the same destination through redundant clickable thumbnail and button.

Across Atlas/Notebook/Concept routes, use a tighter vertical rhythm while preserving headings and the system spine's information hierarchy. Never compress interactive controls below 44px. Search's shortcut hint must describe both Ctrl+K and ⌘K since both are supported; screen layout must not imply a Mac-only binding.

## Interactive concept diagrams

Use interaction when it explains a decision, evidence relationship or feedback loop. Current examples are Query Routing (chapter 03), RAG evidence gates (04), progressive skill loading and authorization gates (06), governed memory retrieval (07) and bounded Agent loops (08). Place each teaching module beside the relevant original figure or after its owning section, retaining the full static diagram and article. A toolbar shortcut takes readers directly to the module.

Skill examples expose summary, instruction and reference layers through installed Tabs. Label loaded and unloaded states explicitly; inspection must not load a layer. Failed input or permission gates keep full instructions unloaded and tool execution blocked. These are illustrative sequences, not a universal runtime contract. Memory examples distinguish preferences, superseded facts and historical permission records; memory never grants authorization.

Each diagram includes an optional two-question practice panel, using installed Collapsible and RadioGroup components. Give explanations for correct and incorrect answers, clear stale feedback on answer changes, and focus the next question after advancing. Do not save answers. Keep option rows at least 48px high, action buttons at least 44px high, and reserve feedback space to limit layout jumps. Explicitly register these component sources with Tailwind's scoped source list.

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


## Jev vs. Generative LLMs responsibility comparison

Figure 6.C4 follows the **Before / After responsibility split** from the authored reference, not two mirrored five-step pipelines. The left column is a single generative model burdened with open-ended tasks and bounded decisions; the right column separates Generative Model (coding, research, planning, open generation), Jev (bounded routing, risk, progress and completion decisions with typed probabilities), and Runtime (permissions, budgets, allowlists and execution / block / retry). This is an architectural role comparison, not a model latency benchmark.

The visible composition is a neutral gray Before panel and lightly mint-tinted After panel. The Before side has one dark Single LLM anchor amid compact task pills. The After side has three vertically grouped responsibility cards, with a distinctive dark Jev marker and quiet green hierarchy. Each side ends with one concise verdict band. Treat these relationships and relative grouping as part of the figure's information design; do not replace them with repeated generic process cards.

Optional interaction includes selecting the three After roles to inspect their responsibility boundaries and explicitly triggering one finite arrow-trace demonstration. Two inward-pointing Before connectors show tasks converging on one LLM; two After connectors depict a possible handoff across generation, bounded decisions and deterministic runtime enforcement, with text labels making the contingent/permission-gated meaning clear. This is **not** a mandatory three-model call order. All connectors remain visible without animation; the trace runs once after the reader presses a named control, stops after 3.8 seconds (also on unmount, invisibility, or tab hide), and can be replayed. No perpetual motion or invented telemetry. With reduced motion, the animation button is disabled and static arrows, cards and role-selection controls remain functional. Keep an aligned two-column layout when the reading width permits and stack columns on narrow screens. Preserve an accessible static fallback when the interactive chunk cannot load.

## Skills terminal simulator

The requested bento terminal style owns chapter 06's teaching simulator only. Its charcoal, black terminal, terracotta action, mono metadata and asymmetric 1:2 panes follow the supplied visual reference; the reader retains Interior components and Iconoir icons. `skill-simulator.tsx` is the single editable React source, including scoped styling. Installed Button, Tabs, onboarding underline indicator and Collapsible/RadioGroup practice primitives own controls and keyboard behavior. The 5-stage rail describes a running teaching workflow, not a dashboard overview.

The premium polish retains this direction: a 30px serif title, 14px sans-serif explanations, and monospace logs and metadata distinguish reading from execution. Scoped `--sim-*` tokens own the charcoal canvas (#101112), recessed terminal (#0b0c0d), panel (#191b1e), raised surface (#202326), and terracotta primary action (#d97757). Semantic aliases feed the existing primitives; Badge owns the live state indicator. Scenario tabs use a quieter warm selected surface so the send action remains primary. The idle terminal previews the actual selected request. Status and stage count live in the context title bar, with the latest context message emphasized. Below 760px of available content width, panes stack to preserve readable type. The compact edition bounds the internally scrollable terminal to 16rem and context stream to 15rem on desktop, then 11rem and 13rem on narrow widths. Compact title bars, panels, assets and metrics reduce the simulator's footprint without shrinking 44px actions, hiding stages, dropping logs, or removing the existing teaching/permission boundaries. Internal scroll owners preserve access to older messages. Review evidence for this refinement lives in `preview/handbook-custom/evidence/premium-simulator/`.

Run, pause, single-step, reset and scenario switching control a bounded simulation. Missing-input and unauthorized scenarios stop after the boundary check; no instructions, references or tool results are injected afterward. Token figures and cache states are explicit demo values; no model billing, actual reasoning trace, real files or granted permissions are implied. Reduced motion removes visual animation and smooth scrolling while preserving explicitly requested timed playback and manual stepping. The nested panes are intentionally reserved for accumulating logs, as in the supplied reference. On narrow content widths they stack.

Archify workflow specifications live in `preview/handbook-custom/diagrams/`. Delivered HTML owns standalone diagram layout and viewer behavior; do not hand-edit it. Inline PNGs and SVGs are native exports of that exact checked HTML. Chapter 06 places the map behind its full-context disclosure; chapter 07 keeps its overview. Archify's independent delivery, browser and image review receipts live in `evidence/archify/`. The English Memory candidate failed readability after two focused repairs and is not published; the English reader explicitly labels its Chinese diagram fallback.

Before/after 390 and 1440 captures, a 1728 capture, runtime and accessibility checks, and measured spacing for the simulator live in `preview/handbook-custom/evidence/bento/`. `test:learning` covers all five lesson chapters and source-to-render canonical article preservation; `test:concepts` covers the four node diagrams. The terminal simulator additionally uses `node evidence/bento/check.cjs`.
