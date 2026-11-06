---
name: AI Engineering Atlas
description: An engineering knowledge atlas for exploring systems, learning deeply, and returning to evidence
last_updated: "2026-11-05"
status: "active"
colors:
  primary: "#007a35"
  signal: "#00a544"
  signal-ink: "#087a37"
  light-background: "#ffffff"
  light-page: "#ffffff"
  light-plate: "#f8f8f5"
  light-foreground: "#0c0c09"
  light-card: "#f8f8f5"
  light-primary: "#007a35"
  light-primary-foreground: "#ffffff"
  light-secondary: "#f4f4f0"
  light-secondary-foreground: "#0c0c09"
  light-muted: "#f4f4f0"
  light-muted-foreground: "#6b6f63"
  light-accent: "#edf4ee"
  light-accent-foreground: "#0c0c09"
  light-border: "#deded8"
  light-input: "#f8f8f5"
  light-ring: "#007a35"
  light-ring-inverted: "#98c7ac"
  dark-background: "#171717"
  dark-page: "#212121"
  dark-plate: "#1c1c1c"
  dark-foreground: "#ececec"
  dark-card: "#2b2b2b"
  dark-popover: "#303030"
  dark-success: "#a9c5b5"
  dark-warning: "#d9ba86"
  dark-destructive: "#e1a19b"
  dark-destructive-foreground: "#291b1a"
  dark-primary: "#ebebeb"
  dark-primary-foreground: "#1a1a1a"
  dark-secondary: "#2b2b2b"
  dark-secondary-foreground: "#e9e9e9"
  dark-muted: "#262626"
  dark-muted-foreground: "#a9a9a9"
  dark-accent: "#333333"
  dark-accent-foreground: "#e2e2e2"
  dark-border: "#3a3a3a"
  dark-input: "#1c1c1c"
  dark-ring: "#ebebeb"
  dark-ring-inverted: "#8a8a8a"
  dark-signal: "#3ddc84"
  dark-signal-ink: "#5de29c"
  dark-surface-presets: "graphite (default) | ink | forest"
  dark-surface-storage: "preview-dark-preset"
typography:
  body:
    fontFamily: "Geist Variable, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "1rem"
  editorial:
    fontFamily: "Songti SC, Noto Serif CJK SC, Source Han Serif SC, Iowan Old Style, Georgia, serif"
    roles: "Atlas introduction heading and lede; Reader chapter/section headings and prose"
    chapterBody: "1rem / 1.85 (38rem measure; geometry-stable)"
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

The visual North Star is **engineering workbench × technical manual × system topology**, delivered with an **editorial reading clarity**: a single calm column, one hairline rule, one point-sized green signal, and a serif layer reserved for prose. The memorable signature is the Knowledge Spine: a visible trace from Model → Retrieval → Agent → Production that reappears as chapter nodes, section traces, and diagram connections. Everything around that signature stays restrained.

Avoid generic documentation-site patterns, SaaS dashboard cards, glassmorphism, gradient hero sections, decorative analytics, and scroll-reveal marketing motion. Avoid a book-cover hero: the product is a knowledge atlas, not a mock physical book. Dense technical content is the product. Visual structure must reveal relationships rather than decorate them.

Runtime tokens live in `preview/handbook-custom/src/handbook.css`; the published build lives in `web/site`. Routes, deep section anchors, bilingual content, technical meaning, diagrams, search, bookmarks, and accessibility behavior remain durable product contracts unless explicitly revised together with `UX-CONTRACT.md`.

The first cohesive Atlas system now covers all four primary surfaces plus the connective Concept Layer: Atlas establishes the Knowledge Spine, Reader exposes current-section trace and reading progress in the existing shell, Search behaves as a ranked local Knowledge Command, Notebook presents saved chapters as a return surface, and Concept routes connect canonical sources across chapters. Future work may extend concept coverage or add section/concept-level saves, but it must extend this system rather than introduce a second visual language.

## Colors
Surfaces come from one lightness ladder. Every step must be wide enough to perceive (ΔL\* ≈ 3–5); below 3 the eye reads two planes as one, which is why an earlier three-value ladder looked flat even though three surfaces existed.

| Role | Token | Light | Dark (default `graphite` preset) |
| --- | --- | --- | --- |
| Rail / canvas | `--background` | `#ffffff` | `#171717` |
| Page | `--page` | `#ffffff` | `#212121` |
| Plate (figure well) | `--plate` | `#f8f8f5` | `#1c1c1c` |
| Raised block | `--card` | `#f8f8f5` | `#2b2b2b` |
| Floating | `--popover` | `#ffffff` | `#303030` |

The Dark column is the default. The `ink` and `forest` presets substitute only this surface ladder; every other dark token (signals, semantic colors, typography, hairline) is shared.

The rail and the page are never the same value: the rail is the navigation canvas, the page is the reading surface. A plate is always one step from the page toward the rail — a well in dark mode, a faint tint in light mode. Raised blocks sit above the page, never below it. In light mode raised blocks are tinted rather than outlined, so a border is not the only thing making a card visible.

Light mode now uses **one flat white plane** (`#ffffff` for both rail and page), a single near-white secondary surface (`#f8f8f5`) for wells and transient controls, neutral ink (`#0c0c09`), and restrained gray-olive secondary text (`#6b6f63`, 5.15:1 on white). The rail is separated by a hairline, not by a second color plane; the earlier mineral rail / tinted card ladder was retired because it read as a dashboard rather than a clear page. The primary `#007a35` remains a **signal**, not a wash: use it for current nodes, selected controls, links, focus, meaningful connectors, and system state. The brighter `--signal` `#00a544` is reserved for non-text point signals (dots, current-node markers, progress ticks); it is 3.25:1 on white and must never carry body text. Text-bearing green uses `--signal-ink` `#087a37` (5.46:1). Dark mode now defaults to a neutral gray lightness ladder (graphite) and keeps the same hairline, signal and editorial-typography refinements; two alternate dark surfaces are available as user presets.

Dark mode is a **neutral graphite** system by default: rail `#171717`, page `#212121`, raised `#2b2b2b`, popover `#303030`, near-white text and neutral gray muted ink. The formerly evergreen (green-tinted) surfaces are no longer the default. Users may choose `ink` (near-black) or `forest` (the old evergreen ladder) from the topbar appearance picker; all three presets share the same hairline, signal, typography and contrast rules. Never tint an entire reading surface green. Borders stay neutral; diagrams communicate hierarchy with structure and labels before color.

Semantic colors are allowed when they encode engineering meaning such as evidence, warnings, failures, or destructive actions, but they must not become decorative category colors. Meaning can never depend on color alone.

## Whole-site dark refinement

The whole-site dark refinement applies to Atlas, Notebook, Search, navigation dialogs, article tables/code/callouts, concept modules and architecture diagrams. Shared runtime tokens carry the Atlas dark surfaces. The default graphite ladder is navigation/canvas `#171717`, page and header `#212121`, figure plate `#1c1c1c`, raised blocks `#2b2b2b`, secondary `#2b2b2b` and popover `#303030`; the `ink` and `forest` presets substitute the same ladder with different values. Text and actions are neutral in every preset — no sage-green wash. Elevation uses neutral dark shadows only — no inset top rim, since a light rim on a low-lightness surface reads as a plastic edge. The **Reader** topbar stays a solid page-coloured surface with a hairline rule; it must not use backdrop blur or a translucent wash, because article text bleeding through the direction-aware chrome looks unfinished. On the non-Reader surfaces (Atlas, Notebook, Concept, Architecture) the topbar may use a light 12px backdrop blur over an 88% page wash with a 1px hairline — that is the one sanctioned translucent surface and it never applies while `reader-workspace` is active. Dark dialog scrims use black at 64% opacity instead of compositing a pale foreground wash over the page; the installed Dialog retains its behavior and reads semantic overlay/popover tokens. Focused search inputs retain their two-pixel component border without a duplicate outer outline.

Gain: clearer reading and consistent surface hierarchy across routes. Cost: lighter charcoal surfaces reduce the former deep-black appearance. Light-theme tokens and content are preserved. The terminal has a named dark variant that follows the same graphite material with a quiet peach primary action. Pretext prepare/layout reserve simulator explanation heights after fonts load; native wrapping stays visible and widths are remeasured on resize. No new permission or billing behavior is introduced.

## Typography
Three font roles, each with one job. **Geist Variable** (with Chinese system fallbacks) owns UI: controls, tables, diagrams, labs, toolbar and navigation. **Geist Mono Variable** owns code, metadata, chapter indices, system labels, and diagram annotations. A third **editorial serif** role owns prose and headings only: the Atlas introduction heading and lede, and Reader chapter titles, section headings and running text. Its stack is local-only — `Songti SC`, `Noto Serif CJK SC`, `Source Han Serif SC`, `Iowan Old Style`, `Georgia`, `serif` — so no remote font is fetched and Chinese copy actually renders as serif.

The serif layer is **inherited, then reset**: apply it to the reading container and explicitly restore sans/mono on every technical surface (tables, code, callouts, figures, labs, graph canvases, simulators, and all descendants of those). This keeps the geometry-sensitive teaching diagrams on the same metrics they were tested with. Editor-facing UI labels, buttons and numeric readouts never become serif.

A future IBM Plex Sans / IBM Plex Mono migration is acceptable only when the fonts are bundled locally and the runtime tokens, dependency manifest, and this file change together. Do not load remote web fonts just to match a mockup.

Article headings remain neutral in weight and color. Do not create “AI-looking” display typography: no extreme tracking, no gradient text, no oversized hero numerals. Hierarchy comes from scale, whitespace, hairlines, and quiet system labels rather than ornamental type. The Atlas heading is deliberately modest (about 2–2.75rem, serif, normal weight), never the earlier 4.75rem sans display.

## Layout
The product has four primary mental surfaces: **Atlas** for system orientation, **Reader** for deep learning, **Search** for immediate retrieval, and **Notebook** for returning to saved knowledge. **Concept** is a connective entity layer between Atlas and Reader rather than a fifth top-level destination. Existing hash routes may continue to back these surfaces during migration.

The Atlas home opens with a **calm editorial introduction**, then the system itself. The introduction is a single column inside a `min(100%, 64rem)` measure: one mono eyebrow, one modest serif heading, one short lede, one primary text CTA into chapter 01, a quiet search affordance, and a compact metadata line. There is **no book cover, no cover column, no hero illustration, no stat-card row, and no decorative demo widget**. The Knowledge Spine remains the dominant composition below it, grouped into Model, Retrieval & RAG, Agent Engineering, and Evaluation & Production; chapters still render as nodes on a trace with descriptions and optional interactive-lab affordances.

The composition is **one column**, not a persistent three-column workbench. The contextual inspector is no longer a right-hand rail: it flows below the spine as a flat, hairline-separated section holding the selected chapter's decision/failure boundary, the architecture entry, and the eight-link Concept Index. It stays subordinate to the spine and never presents editorial relationships as guaranteed prerequisites. Separate, labeled lab links may open the Reader at the existing interactive lesson anchor; the canonical chapter link remains distinct. All existing `.atlas-group`, `.atlas-node-row`, `.atlas-lab-link` and `.atlas-concept-index a` selectors and their counts are preserved — the redesign is presentation-only.

Desktop chapter navigation may collapse. Mobile uses an overlay navigation dialog. The Reader must never gain a permanent right-column table of contents; on-page navigation opens on demand. Long-form content owns a single clear scroll context per viewport mode. Review widths remain 390, 768, 1440, and 1728px with zero page-level horizontal overflow.

Previous/next navigation remains at the end of chapters in normal flow. Do not add fixed bottom bars, persistent mobile control bars, scroll hijacking, or decorative parallax. Wide tables and code scroll internally. Review widths remain 390, 768, 1440, and 1728px.

## Elevation & Depth
The default surface is flat. Use background tone, whitespace, thin rules, topology lines, and alignment before shadows. Chapter nodes and Atlas groups are not cards. Reserve meaningful elevation for transient UI such as Search, dialogs, popovers, and menus. Large soft shadows are never used merely to make static content feel “premium.”

## Shapes
Controls and topology nodes use restrained radii. The base radius remains `0.625rem`, architecture panels `0.75rem`, and concept-teaching panels `1rem`. Static content should not become a field of rounded rectangles.

The Knowledge Spine uses circles, fine connector rules, chapter indices, and aligned text rather than decorative badges. Avoid pill-shaped labels except where a true compact control or status requires them. Spacing continues to use the established 4/8/12/16/24/32/40/48/64/96/128px rhythm.

## Scrollbars · quiet editorial interaction

Scrollbar styling is part of the reading surface, not a colored UI component. Use **one global rule** for Reader, Atlas, Notebook, chapter rail, search/dialog contents, and scrollable code or wide matrices. The thumb is a thin rounded neutral trace (7px desktop, 5px pointer-coarse for browsers honoring WebKit width; native `scrollbar-width: thin` otherwise), on a fully transparent track. Derive thumb values from `--foreground` using `color-mix` so light, graphite, ink and forest surfaces preserve one visual grammar; the thumb is low-opacity at rest (22%), more visible when the **actual** scroll owner is actively scrolling or focused (45%), and stronger when dragged (64%). Never use the primary-green action color for a scrollbar.

**No blanket ancestor `:hover` reveal.** Hovering an article must not light up the chapter scroller plus every code block and matrix at once. Only hovering the thumb, direct scroll activity (`data-scrolling`) or keyboard focus of a scroll container changes the thumb. Preserve `scrollbar-gutter: stable` on desktop scroll owners so document widths do not jump, and retain the mobile single-page scroll geometry and horizontal overflow capability of technical content. Scrollbar styling may not hide a necessary control, block touch/wheel/keyboard navigation, or change deep-link placement. Forced-colors mode restores the platform's native-width, system-color scrollbar; a11y overrides take priority over appearance.

Change scrollbars only in `preview/handbook-custom/src/handbook.css` and document the interaction contract in `preview/handbook-custom/UX-CONTRACT.md`. Validate Reader / Atlas / nested scroll panes at 320, 390, 768 and 1440px, light/dark/forest and forced-colors. Screenshots should show the actual scroller without inventing a themed dashboard.

## Components
The complete edition covers Atlas, Notebook, the system framework and Agent reference architecture, every chapter and registered supplement, ranked section search, bookmarks, and local reading preferences. Desktop uses one bounded content scroller per route. On phones, the toolbar and route content scroll together. The architecture overview preserves the original execution core, domain connections, control plane, feedback loop and platform foundation; module links open the corresponding chapters. Wide comparison tables and code own their horizontal scrolling.

Runtime ownership is Model B: `preview/handbook-custom/src/handbook.css` owns semantic light/dark tokens; `preview/handbook-custom/src/index.css` maps them into Tailwind utilities; installed shared components consume those utilities. `preview/handbook-custom/src/content-base.css` is generated topology CSS with scoped selectors. The article adapter maps legacy `--paper`, `--ink`, `--mut`, `--line` into the same semantic tokens. Inline literal colors in derived content are normalized by the generator. DESIGN frontmatter mirrors runtime palette values.

Technical diagrams retain native, trusted document markup as a compatibility variant so their registered topology, bilingual content, and interactive labs remain complete. Diagram colors express technical roles sparingly; chapter surfaces and noninteractive headings remain neutral.

Immersive Reader uses a **persistent, content-first single-line topbar**. The chapter number/title appear visually only in this topbar; the article retains a screen-reader-only level-one heading. Optional current section, reading percent, and a two-pixel progress trace are retained; secondary context truncates or disappears at narrower widths. A persistent Reader header must **not** auto-hide on scroll, oscillate on upward/downward gestures, or reserve a second toolbar row. On desktop it overlays the stable bounded Reader scroll pane; on mobile it is a fixed 48px-high surface, with only 56px of initial clearance in the unified page scroll. Keyboard, dialogs, and deep-link jumps continue to work without changing the scroll owner. Do not insert a large chapter cover or a fixed bottom toolbar.

Prioritize the mobile header for **chapter identity + primary navigation**, not for showing every desktop shortcut at once. Keep the chapter menu, Search, On this page, language switch, and accessible More menu as 44px tap targets on one row at 320–390px. Chapter title must truncate instead of forcing overflow or a second row. GitHub and the dark-surface preset selector move into **More only at mobile Reader widths**, where they remain reachable as native link/menu actions. Desktop Reader retains the direct GitHub and three-preset picker in its header; other routes retain their existing picker. Theme toggle, text sizing, focus mode, bookmarks and chapter diagram shortcut remain in More. An icon-sized Exit focus remains directly in the mobile header with its accessible name; no action is abandoned to save horizontal space.

**Bottom chapter navigation is in-flow editorial wayfinding**, inspired by the reading-continuity pattern of a technical book rather than adjacent bright/outlined CTA buttons. It appears once after canonical chapter content, not fixed while scrolling. One hairline separates content and footer; a small mono chapter count sits above two quiet previous/next links. Every link displays its **destination chapter title**, directional label and arrow, including Back to Atlas at first/last boundary. The two columns must fit 320–390px without horizontal scroll; titles may wrap, and keyboard focus is clearly visible. Retain real `chapterHref` routing, both locales, and semantic `nav` with full accessible destination names. The footer must not compete with diagrams or paragraph text for primary visual emphasis.

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
- Don't add a book cover, cover column, or any mock physical-book hero on Atlas or Reader.
- Don't copy or trace a third party's logo, logomark, or icon arrangement; use the typographic wordmark.
- Don't put `--signal` green behind text; use `--signal-ink` or `--primary` for text-bearing green.
- Don't make a green-tinted (evergreen) dark surface the default; dark backgrounds stay neutral, with `graphite` as the default and `ink` / `forest` only when the user chooses them.

## Article color compatibility

Legacy article variables map into the shared semantic theme. `--blu` maps to the primary action token, not the previous blue palette. Amber aliases orange. Teal and the other technical role colors must remain defined in both themes so category markers do not disappear.

Callout headings stay in normal content flow with a transparent background, neutral container border and restrained semantic foreground. Use orange for essential points, green for tips and red for warnings. Do not reintroduce floating badges, saturated label backgrounds or inherited white text on pale fills. Callouts use 24px desktop inset and 16px on phones, with 24px vertical separation.

Verification-boundary notes are supporting evidence metadata, not primary reading blocks. Render them as native `details/summary` disclosures collapsed by default, with a thin neutral rule and compact mono metadata. Closed state should stay around one control row tall; opening reveals the full boundary text and sources without changing semantic content.

Code keys, strings and numbers use theme-specific syntax tokens from `preview/handbook-custom/src/handbook.css`. Inline role fills use a subtle mixed surface with the normal text foreground. Filled and hovered controls always pair `--primary` with `--primary-foreground`; never override only one side. Verify actual computed contrast on both themes: at least 4.5:1 for ordinary text and 3:1 for large text.

## Cross-surface reading density and UI audit

The Atlas, Notebook, Concept, Architecture, Search, and all Reader chapters share one UI quality floor: content-first hierarchy, real semantic grouping, no accidental page-level horizontal overflow, and a 44px minimum touch target on actions. Review representative widths at 390, 768, 1440 and 1728px in both languages and themes; use actual browser geometry and keyboard/accessibility tests rather than CSS guesses.

**Source reference fidelity comes first.** When reproducing an authored figure, keep its group hierarchy, comparison/branch/state topology, arrow semantics, and critical qualifications. A screenshot is evidence for meaning as well as appearance; do not translate a Before/After responsibility split into an arbitrary five-stage animation. The static version must remain legible and informative when reduced motion disables playback.

**Vertical space is a budget.** Avoid fixed minimum heights on short explanations, unanswered practice feedback, and loaded-file preview panes. Concept node flows should remain visually connected but compact, with legible labels and visible directional arrows; mobile diagrams stack without oversized inter-node gutters. Do not change topology, source meaning, or make all different diagrams into generic cards.

**Archify overview is a preview, not a second full-page diagram.** Keep a height-bounded thumbnail and one clearly labeled Open map action. The full diagram remains accessible through the viewer, including zoom and export. Do not duplicate the same destination through redundant clickable thumbnail and button.

Across Atlas/Notebook/Concept routes, use a tighter vertical rhythm while preserving headings and the system spine's information hierarchy. Never compress interactive controls below 44px. Search's shortcut hint must describe both Ctrl+K and ⌘K since both are supported; screen layout must not imply a Mac-only binding.

## Visualization V2 decision labs

Chapter 10 and chapter 11 add optional, *static-first*, keyboard-operable decision diagrams beside canonical chapter material. CH10 compares token-compatible prefix reuse, early divergence and cache isolation; CH11 compares valid updates, duplicate deliveries, stale-version arrivals and unauthorized reads. Treat each scenario as a pedagogical model, not a production trace, cache-hit metric or database execution.

The two diagrams use the existing paper/card/border, primary-green selection signal, monochrome metadata and restrained radius. Avoid newly invented role colors, invented latency or cost figures, decorative progress animation and generic four-box workflows. A selected scenario must alter the visible **decision and boundary state**, not simply its title. State is conveyed by explicit text and status marks in addition to color. Prefer controlled native buttons with `aria-pressed`, 44px targets, and `aria-live="polite"` for outcome changes; no automatic playback. Honor reduced motion.

CH10's shared prefix tokens are only **eligible** to reuse subject to model/tokenizer/adapter identity, engine cache behavior, current cache availability and trust boundary. Different cache salt/namespace must not imply cross-tenant reuse. Never conflate Prefix KV with response or semantic caching. CH11 must show where duplicate effects are suppressed, stale versions blocked under a declared ordering contract, and read permissions enforced by the database rather than an LLM instruction.

Both diagrams are lazy, inserted after stable canonical anchors (`#fig-10-1` and `#data-plane`), and share the Reader's `#concept-demo` direct-lab target. Canonical article HTML must remain readable if the optional chunk fails; neither lab may replace, edit or change its source meaning.

## Parameterized teaching experiments · CH04 Risk–Coverage (first implementation)

The CH04 Evidence Gates lesson adds a **secondary, genuinely parameterized teaching experiment** after its existing synchronized decision trace and takeaway. It is mounted **inside** the existing `#concept-demo`; it must not introduce a second lab route, replace the source-authored six gates, remove the two-question knowledge check, or change the canonical prose. The module is `preview/handbook-custom/src/reliability-lab.tsx`, with a local stylesheet `reliability-lab.css`.

**Interaction grammar** (the candidate pattern for future reusable experiments): one question in plain language → one labeled control → immediate, deterministic outcome visualization → readable per-case explanation → engineering boundary. The selected parameter must change the underlying computed result, not merely the caption, selected color, or animation. The default state is informative without interaction; all cases and curve nodes remain discernible with reduced motion. A reset control returns to a documented baseline.

**CH04 model and integrity:** use eight **explicitly synthetic** fixed records with example scores and reference correctness labels. Threshold (\tau) accepts cases with score ≥ `\tau`. Coverage = answered / all; Selective Risk = incorrect among answered / answered. When no cases are answered, Selective Risk is **undefined**, never zero. Connect the eight distinct nonempty answer-set operating points into the Risk–Coverage curve, and highlight the current point. Explicitly show each case's score and outcome (correctly answered, incorrectly answered, abstained) in text. The curve can be non-monotonic: raising a threshold does not guarantee risk reduction. The invented values must never be described as model confidence, a calibrated probability, evidence-gate success, a benchmark, real-time metrics, or a validated production threshold.

**Governance boundary:** a score gate is a *pedagogical isolation* of selective answering, not a substitute for ACL, source freshness, version authority, citation/claim verification, conflict resolution, risk-aware policy or human escalation. This experiment demonstrates the mathematical tradeoff only; the original CH04 six-gate diagram remains the authoritative decision architecture. No API, uploaded user file, model inference, or external request is made.

**Visual and interaction rules:** reuse the neutral page / hairline / plate palette, Geist UI typography, mono numerals and small green selected-point signal. Do not introduce colorful dashboards, decorative metric cards, invented latency figures, a persistent inspector, or auto-running animation. Use a native range input with a visible label, keyboard-accessible 44px hit area, meaningful output text, reset control, and text-first outcome states. The plot may use SVG, but the same values and individual decisions must be available as native text. On compact Reader widths the figure and case ledger stack; no page-level horizontal overflow. Use the Reader's existing lazy module boundary and error fallback.

**Extraction policy:** this is the first parameterized pattern, not a license to refactor every existing lesson. Extract a shared `InteractiveFigure` shell only after at least three teaching experiments prove the same control/outcome/explanation grammar. Preserve each diagram's topology, domain-specific metric semantics, case provenance and failure boundaries.

## Teaching figures · reusable container-first composition (CH08 + CH09)

**Root cause.** The CH08 Architecture Explorer screenshot showed a roughly 38rem lab with a two-track grid and an outer topology wider than the result column. Existing `@container (max-width: 48rem)` checks were using the wide Reader pane, not the actual lab width. Never mask this with clipping or a hidden scrollbar.

**Extracted visual grammar.** Existing source-authored teaching labs already share `.lab-grid`, `.lab-controls`, `.lab-result` and `.lab-node`. Their geometry, neutral surfaces, visible focus and checked-state signals are now owned together in `preview/handbook-custom/src/handbook.css`. The `.lab` establishes `container-type: inline-size` and child grids use `minmax(0, ...)`. The Reader's 38rem text measure remains the default; top-level labs may expand into the already-established wide-plate space, but never when nested inside an authored multi-column grid or another figure.

**Responsive model.** At lab widths below 54rem, present controls → interpretation → topology as a single reading column; above 54rem, allow two columns if both can show their content. Below 40rem, the 7-stage explicit graph becomes a vertical node/arrow flow; below 32rem the 5-step local loop also stacks vertically. The CH09 three-operand cost equation likewise stacks its mathematical operators between the source-authored stages below 40rem; never let the multiplication/division symbols float above the formula. No overlapping nodes, truncated required labels, extra sideways scroll panes, or viewport-only breakpoints. All illustrated branches remain visible, including when not selected.

**Information hierarchy.** One outer plate, then quiet hairline separation between controls and result; avoid nested decorative boxes. A selected case gets subtle token-derived emphasis, not a new saturated palette. This takes the explanatory principle of learn-inference.com's Three Layers—separate responsibilities and tradeoffs before illustrating connections—without copying that project's design or replacing the canonical handbook's technical content.

**Extraction boundary.** The two existing legacy `.lab` experiences (CH08 architecture, CH09 cost) share a CSS grammar but have distinct decision and calculation models; do not introduce a premature generic React abstraction. CH03/04/08 React teaching experiments remain domain-specific until a dedicated review proves one cross-chapter interaction contract in at least three uses. Source-authored HTML and generated `src/content-base.css` are not edit targets for this presentation-only repair.

**Acceptance.** Real browsers at 320, 390, 768, 1152, 1440 and 1728px must check the element rectangles of controls, result, graph, branch nodes and loop nodes against the lab frame in both languages and themes. Test CH08 seven signals, gated/graph changes, Reset, CH09 slider recomputation, forced-colors and keyboard focus. Continue to build, regenerate and publish `web/site` from source, and preserve mobile topbar, chapter pagination and scroll ownership.

## Parameterized teaching experiments · CH03 routing and CH08 bounded execution

After the first CH04 Risk–Coverage experiment, CH03 and CH08 extend the **same instructional grammar** without replacing their canonical graph-first diagrams, decision traces, article content, accessible playback, or knowledge checks. Both are mounted after the lesson takeaway inside the existing chapter-local `#concept-demo`. The experiments remain optional **authored deterministic fixtures**, never inferred execution traces or silent claims about a particular vendor/system.

**CH03 · Query routing / evidence-path budget** (`src/query-route-lab.tsx`):

- One native query-shape selector and a 1–5 maximum **planned retrieval route** control. Examples cover exact identifier, semantic process question, relation traversal, mixed identifier + explanation, and unresolved conversation referent.
- Explicitly show query, required evidence, the authorization-first boundary, per-route SELECTED / SKIPPED decision, fixed fixture evidence coverage, and the conditional recovery path. Selected planned routes do not imply parallel execution, server calls, retrieval results or correct answers. The synthetic “required” route set demonstrates planning, not true ground-truth retrievability.
- A missing referent must yield CLARIFY / no route, regardless of route allowance. More route budget cannot bypass tenant/role/ACL, fix an omitted authorized source, establish document authority, or skip CH04 evidence verification. Missing coverage is an *unresolved teaching case*, not proof of a live retrieval failure.
- Deliberately **do not** chart unmeasured accuracy, P95 latency or cost. The meaningful quantitative relationship is selected paths versus fixture-required paths, not invented production metrics.

**CH08 · Bounded agent loop / work budget** (`src/agent-retry-lab.tsx`):

- One fixed feedback/authorization scenario, one 1–4 maximum-attempt control, and one 0–12 abstract **work-unit** budget control. Each illustrative attempt consumes exactly three invented work units. The current outcome, trace of attempted/unused rounds, work consumed and remaining, and reset action must update deterministically.
- Scenarios include first-attempt verification success, success only after a targeted retry, persistent failure, and missing human approval. Approval blocks *all* execution independently of work/attempt limits. An attempt may be executed only if permission, per-attempt capacity and attempt ceiling all allow it.
- Verified STOP occurs only after the fixture's acceptance condition passes. If work/attempt limits bind before success, show **HANDOFF / incomplete**, never success. STOP must prevent needless additional calls even if capacity remains. Failed attempts and unexecuted attempts must be distinguished in text, not color.
- Work units are not real API cost, time, tokens, or model success probabilities. No tool side effects are performed. Production retries require authorization, checkpoint/ledger reconciliation, idempotency and human approval where appropriate; a state checkpoint alone cannot make external actions transactional.

**Common presentation contract:** `src/parameterized-labs.css` owns the two new experiments' neutral paper/hairline layout and only reuses existing `--page`, `--plate`, `--foreground`, `--hairline`, `--primary`, `--signal-ink` and monospace numeric roles. CH04 retains its already-reviewed independent chart implementation and CSS while the three experiments are assessed for future extraction of a shared `InteractiveFigure` / control-output shell; avoid an early sweeping refactor of preexisting labs. Focus the reader on question → input → computed outcome → per-case evidence / trace → recovery/engineering boundary. Use native select, range and reset controls with 44px target height, visible labels/focus, bilingual copy, live outcome text, reduced-motion compatibility, and responsive vertical flow at compact reading widths; no invented dashboard cards, autoplay or independent scroll context.

The source of truth is always the relevant canonical chapter (`handbook/chapters/03-*.md`, `04-*.md`, `08-*.md`). These demonstrations augment the semantics; they must never overwrite source-authored technical meanings or claim that toy planning evidence is empirical evidence. Each change must pass real-browser regression checks under the inherited Reader shell and article anchors, then verify generated `web/site` publication parity before merge.

## Decision-trace extensions · CH03 / CH04 / CH08

The existing canonical four-node lessons remain the primary reading and playback interaction. Chapters 03, 04 and 08 may add a secondary, step-synchronized **Decision Trace** directly after the explanation and playback controls. It is a technical diagnosis layer, not another autonomous simulator. Use the same example and current-frame state; do not create duplicate selectors, timers, independent scroll views, invented percentages, or a separate content authority.

- **CH03 Query Routing:** distinguish the *query evidence shape* from chosen retrievers. Display exactly which path is selected, which is skipped and why. Authorization/ACL filtering precedes retrieval. Show a fallback boundary (alias or query revision, alternative route, clarify or stop) as a *contingency*, never as an action that was executed in a successful scenario.
- **CH04 Evidence Gates:** render all six canonical gates **0–5**, even though the existing lesson groups them into four explanatory frames. Make `SUPPORT`, `CONFLICT` and `INSUFFICIENT` explicit. Conflict or insufficiency must not show `Claim Verification` as passed; the final policy distinguishes answer, version resolution/escalation, and retrieve-more/abstain.
- **CH08 Agent Loop:** distinguish visited/current/future steps and (when the lesson revisits them) the first and second execution rounds. Render a *conditional* feedback edge only when the retry scenario reaches the budget gate. STOP requires verification; HANDOFF means incomplete after budget exhaustion. Never suggest retries are infinite or that a local loop is equivalent to a graph.
- **Presentation:** neutral cards, fine border connectors and primary-green selected state only. Every visual state has textual meaning without reliance on color. Keep playback controls adjacent to frame explanation; mobile traces stack without horizontal clipping. Preserve the canonical article, original scenario selector, native keyboard-accessible node controls, two-question knowledge check and reduced-motion behavior.

## Interactive concept diagrams

Use interaction when it explains a decision, evidence relationship or feedback loop. Current examples are Query Routing (chapter 03), RAG evidence gates (04), progressive skill loading and authorization gates (06), governed memory retrieval (07) and bounded Agent loops (08). Place each teaching module beside the relevant original figure or after its owning section, retaining the full static diagram and article. A toolbar shortcut takes readers directly to the module.

Skill examples expose summary, instruction and reference layers through installed Tabs. Label loaded and unloaded states explicitly; inspection must not load a layer. Failed input or permission gates keep full instructions unloaded and tool execution blocked. These are illustrative sequences, not a universal runtime contract. Memory examples distinguish preferences, superseded facts and historical permission records; memory never grants authorization.

Each diagram includes an optional two-question practice panel, using installed Collapsible and RadioGroup components. Give explanations for correct and incorrect answers, clear stale feedback on answer changes, and focus the next question after advancing. Do not save answers. Keep option rows at least 48px high and action buttons at least 44px high. Let unanswered feedback stay compact instead of reserving a tall blank box; preserve readable explanatory feedback when it appears and keep focus/scroll stable. Explicitly register these component sources with Tailwind's scoped source list.

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

Optional interaction is limited to selecting the three After roles to inspect their responsibility boundaries. Two inward-pointing Before connectors show tasks converging on one LLM; two After connectors depict possible handoffs across generation, bounded decisions and deterministic runtime enforcement, with text labels clarifying conditional/permission-gated meaning. This is **not** a mandatory three-model call order. Keep arrows visible statically; selecting a role highlights the relevant handoff without introducing playback buttons, timing labels or automatic animations. The figure stays fully meaningful with reduced motion. Keep an aligned two-column layout when reading width permits and stack columns on narrow screens. Preserve an accessible static fallback when the interactive chunk cannot load.

## Skills terminal simulator

The requested bento terminal style owns chapter 06's teaching simulator only. Its charcoal, black terminal, terracotta action, mono metadata and asymmetric 1:2 panes follow the supplied visual reference; the reader retains Interior components and Iconoir icons. `skill-simulator.tsx` is the single editable React source, including scoped styling. Installed Button, Tabs, onboarding underline indicator and Collapsible/RadioGroup practice primitives own controls and keyboard behavior. The 5-stage rail describes a running teaching workflow, not a dashboard overview.

The premium polish retains this direction: a 30px serif title, 14px sans-serif explanations, and monospace logs and metadata distinguish reading from execution. Scoped `--sim-*` tokens own the charcoal canvas (#101112), recessed terminal (#0b0c0d), panel (#191b1e), raised surface (#202326), and terracotta primary action (#d97757). Semantic aliases feed the existing primitives; Badge owns the live state indicator. Scenario tabs use a quieter warm selected surface so the send action remains primary. The idle terminal previews the actual selected request. Status and stage count live in the context title bar, with the latest context message emphasized. Below 760px of available content width, panes stack to preserve readable type. The compact edition bounds the internally scrollable terminal to 16rem and context stream to 15rem on desktop, then 11rem and 13rem on narrow widths. Compact title bars, panels, assets and metrics reduce the simulator's footprint without shrinking 44px actions, hiding stages, dropping logs, or removing the existing teaching/permission boundaries. Internal scroll owners preserve access to older messages. Review evidence for this refinement lives in `preview/handbook-custom/evidence/premium-simulator/`.

Run, pause, single-step, reset and scenario switching control a bounded simulation. Missing-input and unauthorized scenarios stop after the boundary check; no instructions, references or tool results are injected afterward. Token figures and cache states are explicit demo values; no model billing, actual reasoning trace, real files or granted permissions are implied. Reduced motion removes visual animation and smooth scrolling while preserving explicitly requested timed playback and manual stepping. The nested panes are intentionally reserved for accumulating logs, as in the supplied reference. On narrow content widths they stack.

Archify workflow specifications live in `preview/handbook-custom/diagrams/`. Delivered HTML owns standalone diagram layout and viewer behavior; do not hand-edit it. Inline PNGs and SVGs are native exports of that exact checked HTML. Chapter 06 places the map behind its full-context disclosure; chapter 07 keeps its overview. Archify's independent delivery, browser and image review receipts live in `evidence/archify/`. The English Memory candidate failed readability after two focused repairs and is not published; the English reader explicitly labels its Chinese diagram fallback.

Before/after 390 and 1440 captures, a 1728 capture, runtime and accessibility checks, and measured spacing for the simulator live in `preview/handbook-custom/evidence/bento/`. `test:learning` covers all five lesson chapters and source-to-render canonical article preservation; `test:concepts` covers the four node diagrams. The terminal simulator additionally uses `node evidence/bento/check.cjs`.


## Structural Visualization V3 · Evidence, diagnosis and responsibility

CH05, CH09 and CH12 use three **different topologies** while retaining the same Knowledge Spine aesthetic, responsive text scale and semantic green signal.

- **CH05 · Provenance lineage:** five source-grounded checks (`document → structure → evidence chunk → claim alignment → resolvable citation`). Display the earliest broken link, not a reassuring citation icon when the source cannot be reconstructed. A matching text span is not sufficient evidence for a table cell's row, unit or version.
- **CH09 · Diagnostic trace tree plus evaluation return loop:** the root run contains observable child runs; trace storage is not the same as an offline golden dataset. Show first-fault investigation, privacy review, labeled regression, release policy and the conditional return of production evidence. A critical authorization regression blocks release regardless of average score.
- **CH12 · Five responsibility planes plus B1–B7 review checks:** Customer / Workflow, Control, Data, Execution and Evidence / Operations. The previous markdown heading said "four" while its illustration named five. The revised chapter explicitly calls out the five names and enumerates B1–B7 as an authored capstone checklist, **not** universal interfaces.
- Each chapter retains existing canonical figures. New teaching diagrams are optional lazy-mounted Reader elements and use the shared `#concept-demo` deep link. No second top-level app, no invented datasets or measured latency, and no live retrieval, parsing or execution.
- Responsive geometry uses the *Reader content container*, not only viewport width. Each scenario control is a real, keyboard-accessible button with selected state, at least 44px high. Color never stands alone; reduced motion, light/dark, zh/en, static text, and readable source notes are required.
- Keep the current Vercel policy `web/vercel.json → git.deploymentEnabled=false`. Production-facing integration must refresh `web/site` with `publish:web` after validation, as required by `MAINTENANCE.md`; hosted deployment remains manual.



## Concept Atlas V3.1 · 12/12 chapter labs and dual-layer diagrams

The canonical Atlas now registers **a primary Lab in every chapter**. The two remaining gaps are CH01 and CH02. CH07 and CH11 also gain separate, narrowly scoped **supplemental** visual models; these must not duplicate the original `#concept-demo` anchor.

- **CH01**: A context-responsibility rail, not a fake token-percentage meter. Preserve system/developer constraints and output reserve; identify compressible history, retrieved evidence and durable working state. The Lost-in-the-Middle effect is contextual and requires measurement, not a guaranteed ranking rule.
- **CH02**: Trust-boundary funnel `Trusted Identity → Candidate ACL → Retrieve/Rerank → Fetch ACL Recheck → Evidence`. When the indexed ACL is stale, fail at source fetch; when tenants differ, reject before the candidate set enters search. The model never grants permission.
- **CH07**: Two distinct governance lanes, `Write / Promotion` and `Read / Context`. An explicit correction can supersede a scoped version. Inferred facts must never casually override an explicit user constraint; audit/retention policy determines event storage.
- **CH11**: Three visually distinct rows for source logical sequence, observed arrival order, and SCD2 version intervals. The sequence domain is deliberately *not* presented as physical event time. Duplicate deliveries, out-of-order changes and tombstones each trigger different contract behavior.

Use distinctive geometry for each mental model instead of reusing the generic four-stage timeline. All visual cases are illustrative, with source notes from chapter section numbers; no fabricated benchmark, real customer order or live API call. Keep existing Chapter 07 and 11 Labs untouched while adding second views at `#concept-extension` with no new global Atlas link. New CH01 and 02 Labs use `#concept-demo` and existing Reader deep-link readiness. Enforce 44px controls, labels alongside color, scoped WCAG checks, light/dark, Chinese/English, keyboard and reduced motion. Preserve `git.deploymentEnabled=false`; validate locally and generate `web/site` before a production-facing merge.



## Graph-first Architecture V3.3 · node/edge readability contract

User-directed upgrade from cardinal teaching panels to **architecture node-edge graphs**. Graphs should explain actual causal, authorization and evidence relationships, not paint decorative arrows between cards.

- Reuse `GraphCanvas`, HTML `GraphNodeData` and directed SVG `GraphEdgeData` from `preview/handbook-custom/src/graph-primitives.tsx` with source-scoped layouts from `graph-models.tsx` and `structural-graph-models.tsx`. Keep nodes and SVG edges on the **same authored viewBox coordinate grid**; node CSS must remain `position:absolute`. Different geometry for desktop and compact Reader containers; never merely shrink wide topology.
- Edge semantics: forward sequence, conditional branch, denied/blocked path, cross-lane identity mapping, and explicit feedback. Active states highlight **both nodes and edges**; an optional/unselected edge remains visible but subordinate. A blocked edge does not certify a call occurred. Unknown or not-highlighted nodes must not be described as “not executed” without evidence.
- CH01: input task → context allocator → five allocation policy branches, with **one separate assembly spine**. Output reserve is not an extra prompt evidence source; removing all five fake converging “include” arrows both improves readability and prevents a wrong mental model. No quantitative token shares.
- CH02: Trusted identity → candidate ACL gate → authorized set → retrieval → source-level recheck → evidence in context, with separate rejection branches at candidate and fetch authorization.
- CH05: PDF version/page → structure → evidence element → claim support → resolvable citation. Broken table and uncertain OCR cases lead to explicit source repair/review, not invented citations.
- CH07: Memory promotion and permission-filtered read are distinct connected lanes. The versioned store connects read/write; explicit correction returns to versioned memory and forces view re-evaluation.
- CH09: A root trace with four possible diagnostic child Runs leads through trace triage, privacy-reviewed dataset curation, slice regression and a release gate. Safety regressions **block**; no failed gate may enter Shadow / Canary. “Not highlighted” does not assert an unobserved execution step was skipped.
- CH11: Source version/sequence, observed ingestion order and SCD2 **sequence-domain** history are three independent lanes. Use identity-matched curved mapping edges for out-of-order events instead of overlaying ambiguous mid-lane elbow lines; duplicate delivery has a rejection edge, tombstone follows the documented delete contract.
- CH12: Five canonical responsibility planes and two visible trust gates B4 (tenant-scoped read) / B6 (write approval) form a graph; seven B1–B7 review checks remain readable below it. Separate the real feedback edge from any imagined host write authorization.
- For every diagram verify 390/768/1440/1728px and zh/en, both themes, keyboard scenario controls, 44px minimum touch targets, 0 horizontal clipping. Use actual screenshot review **in addition to** component-scoped axe checks; a passing DOM test alone does not guarantee aligned edges. Annotate invented scenarios as instructional, not live events.
- Preserve `web/vercel.json` with `git.deploymentEnabled=false`. Follow the manual validation, generated-artifact and deployment workflow in `MAINTENANCE.md`.



## Graph-first V3.4 · Remaining architecture chapters

All 12 chapters retain one primary Lab; **CH03, CH04, CH06, CH08 and CH10 now expose graph-node/edge topology** on the existing primary interactive lesson, building on the earlier seven-chapter graph-first upgrade. Use the same system GraphCanvas, CSS tokens, responsive viewBox layouts and accessible HTML node labels. The graph appears first; previous high-density inspection panels are preserved **inside native details/summary disclosures**, not deleted or exposed as a redundant second main graphic.

- **CH03 / Query Routing:** Query analysis → trusted ACL/tenant/version scope → route planner. Five optional paths (Exact, BM25, Dense, Graph, source documents) lead into candidate fusion, then evidence validation. Scenario selection highlights exactly two relevant branches; raw BM25 and cosine scores cannot be added, and RRF ranking does not prove any claim.
- **CH04 / Six Evidence Gates:** G0–G5 connect to separate ANSWER, RESOLVE/ESCALATE, and RETRIEVE_MORE/ABSTAIN outcomes. With CONFLICT or INSUFFICIENT evidence, **G4 Claim Verification remains blocked**; G5 policy may still choose a safe non-answer decision. Do not depict those cases as verified claims.
- **CH06 / Skill, Tool and MCP:** Task → Skill Registry match → trusted input/ACL Gate → on-demand SKILL.md → authorized Host tool (MCP only when applicable) → verification. Missing input goes to CLARIFY; cross-tenant attempts to REJECT before loading instructions or invoking tools. Skill matching ≠ authorization; skill method ≠ API/tool protocol.
- **CH08 / Bounded Agent Loop:** Show Plan → Act → Observe → Check with actual controlled retry/back-edge for the scenario with a second round; graph tracks existing lesson step. STOP requires verified criteria; budget exhaustion leads to HANDOFF, not fictitious success. Retried tools always require remaining budget and authorization.
- **CH10 / Prefix KV Serving:** Request tokens → cache namespace/key Gate → exact token prefix → cached prefix KV blocks (if present) → suffix Prefill → independent Decode. In isolated-tenant scenarios, deny cache cross-scope reuse and use independent Prefill. Prefix cache is not cross-user mutable Agent session state.
- **Visual truth:** Nodes must align with SVG edge endpoints and remain within the stage at 390/768/1440/1728px across zh/en and light/dark. Use text alongside edge style; show blocked, pending and alternative routes distinctly. Browser audits must inspect **specific edge IDs** and selected states—not merely count card elements. Preserve source terms, correct step timing, keyboard/motion/44px controls, chapter anchors and quiz.
- **Release:** Keep `web/vercel.json` `git.deploymentEnabled: false`. Run local checks and `publish:web` before a production-facing merge; publish Vercel only within an authorized release.



## Graph-first V3.5 · density and duplication review

Visual review of 390px Reader screenshots found CH03 routing's compact stage unnecessarily tall (1140px), with unused air between five route choices and fusion. The refined compact stage is **925px**; all five choices, exactly two selected routes, authorization scope, candidate fusion, and evidence verification stay readable with left/right edge corridors. CH04, CH06 and CH10 trim unused canvas tails as their authored layouts allow. This is visual density improvement, not measured runtime performance.

Avoid a second large node/card diagram immediately above a GraphCanvas teaching the same stages. On CH03/CH04/CH08 the old four-stage seek cards remain usable inside native `concept-step-inspector` disclosures, closed by default. Their step/next/previous/autoplay/round-two seeking logic remains owned by the original LessonPlayer; don't duplicate that state. Claim, provenance, token, and trust-boundary **detail panels remain available** via their established disclosures. Keep CH06/CH07 optional zoomable Archify maps; those are a distinct source-backed deep-inspection experience, not disposable duplicate assets.

For compact branching graphs, test the actual **selected SVG edge segments** against the bounding boxes of unrelated HTML nodes, not only horizontal overflow. A clear flow needs whitespace around boundaries, not arbitrary whitespace between every node. V3.5 evidence and chapter-by-chapter disposition: `preview/handbook-custom/evidence/graph-duplication-audit.md`. Automatic hosted deployment remains disabled; release follows `MAINTENANCE.md`.


## Editorial clarity refinement · scope B (no book cover)

User-directed change following the 2026-11-05 `/design-review` against `learn-inference.com`. The goal is the reference's **quiet, clear, fluid reading feel**, not its content and not its book-cover hero. The user explicitly rejected the cover as "太刻意" (too contrived). Scope is **Atlas home + Reader presentation only**; routes, content, labs, diagrams, search ranking, Notebook, Concept pages and all interaction contracts are unchanged.

- **No book cover.** Neither the prototype nor the product may render a cover image, cover column, spine shadow, or fake physical-book affordance. The one shadow in the reference existed only on its cover; with the cover removed, static content carries **no shadow at all**.
- **No borrowed branding.** Do not copy, trace, or approximate a third party's logo, logomark, wordmark, or icon arrangement. The reference site's mark is evidence only, never an asset. Our home surfaces use a **pure typographic wordmark** (serif name plus an optional mono tag); the existing product sidebar keeps its licensed Iconoir `BookIcon`, which is a generic library glyph, not a reproduction of any site's identity. Any future brand mark must be original and documented here first.
- **One plane, one hairline.** Light mode collapses the rail/page pair to a single `#ffffff` plane; separation comes from a `#deded8` 1px rule. Secondary wells use one `#f8f8f5` surface. Dark mode defaults to the neutral graphite ladder (`ink` / `forest` remain selectable presets) and adopts the same hairline and signal discipline.
- **One point signal.** `--signal` `#00a544` (dark `#3ddc84`) appears only on dots, current-node markers, progress ticks and hover accents; `--primary` `#007a35` remains the accessible text/button green; `--signal-ink` `#087a37` is the only bright green allowed on text (5.46:1).
- **Three font roles.** Sans UI / serif editorial prose / mono numerals. `--font-serif` is now the local Chinese-capable stack above. Serif is inherited into `.canonical-content` and explicitly reset on all technical surfaces so diagram geometry stays on tested metrics.
- **Contrast guard for generated plates.** Generated chapter CSS tints some surfaces with `color-mix(..., var(--blu) 6%)`. With the more saturated `--primary`, an 11px `--mut` label on that tint drops to 4.43:1, below WCAG AA. Flatten tinted plates to the well + one hairline rather than darkening the global muted ink; re-run `test:a11y` after any `--primary` or `--muted-foreground` change.
- **Wordmark in the fixed rail.** The 264px sidebar must not clip the English wordmark. Allow the mono subtitle to wrap; keep the 44px brand hit area. Chinese stays on one line.
- **Atlas home.** `64rem` single column; modest serif heading (~2.25–2.75rem, weight 400–500); one lede; one calm primary CTA; hairline-separated chapter rows; inspector demoted to a flat full-width section below the spine; 64–65px sticky topbar with a 1px hairline and a 12px blur on non-Reader routes only.
- **Reader.** Chapter/section headings and prose move to the editorial serif (`1.85` line-height on direct-child paragraphs); filled callouts and tinted step plates lose their extra fills in favor of hairlines. **The reading measure stays `38rem` and the body size stays `16px`**: generated diagram containers compute their wide-surface offsets from `var(--measure)`, so widening it would move every GraphCanvas relative to the prose. The screen-reader-only `h1`, slim topbar, direction-aware chrome hiding, progress trace, focus reading, font sizing, section dialog, previous/next footer and all lab deep links remain exactly as specified above.
- **Preserved by construction.** `.atlas-group` = 4, `.atlas-node-row` = 12, `.atlas-lab-link` = 12, `.atlas-concept-index a` = 8; `.header-search`, `.reader-top-title`, `.reader-top-section`, `.workspace.reader-chrome-hidden`, `.reader-bottom`, `.chapter-body` scroll owner and its 17px enlarged font size; bilingual and dual-theme behavior; 44px touch targets; `prefers-reduced-motion`.
- **Validation.** `npm run build`, `test:ui`, `test:a11y`, `test:learning`, `test:concepts`, `node web/validate.mjs`; browser review at 390/768/1440/1728px in zh/en and light/dark for overflow, page errors, contrast and alignment. Production artifacts refresh with `npm run publish:web`; hosted deployment stays manual.

## Dark surface presets · user-directed (2026-11-05)

User feedback: "我不是很喜欢背景的墨绿色 要不改成codex的深灰色，或者允许用户选择几个预设的颜色，黑色，墨绿，深灰等". Both halves are implemented: the default dark background is now a Codex-like neutral gray, **and** the user can pick among three dark surfaces.

- **Default.** `graphite` — neutral, no green cast: `--background #171717`, `--page #212121`, `--plate #1c1c1c`, `--card #2b2b2b`, `--popover #303030`, `--foreground #ececec`, `--muted-foreground #a9a9a9`, `--border #3a3a3a`, `--primary #ebebeb`.
- **Presets.** `ink` (near-black, `#101010` page) and `forest` (the former evergreen ladder, `#181c1a` page) remain available. Only the `--ds-*` surface ladder changes between presets; semantic colors, signals, typography, geometry and all DOM contracts stay identical. `.dark` itself carries the neutral default, so the page is neutral even if JavaScript never runs.
- **Persistence.** `preview-dark-preset` in localStorage. `public/theme-init.js` applies `data-dark-preset` before first paint to avoid a flash of the wrong surface; `main.tsx` re-applies it on state changes.
- **Control.** One canonical 44px topbar `details/summary` picker remains in the DOM on every route (Atlas, Notebook, Concept, Search, Reader): visible on non-mobile Reader routes with its ring swatch, three options, `aria-pressed` and Escape dismissal. **At ≤767px in the Reader only**, the header's direct preset picker is visually hidden to preserve the chapter-title measure; identical dark-preset choices remain accessible in the Reader More menu. Both surfaces update the same persisted preset and switch light mode to dark when a preset is chosen. The existing theme toggle keeps its behavior.
- **Light mode is unaffected** — `--page` stays `#ffffff` in every preset.
- **Contrast floor.** Body / muted / action ratios: graphite `11.99 / 6.02 / 14.6`, ink `15.99 / 7.22 / 17`, forest `13.25 / 7.19 / 9.77` — all above 4.5:1. `test:a11y` stays at 28 routes / 0 violations.
- **Prototype parity.** `preview/design-review-2026-11-05/prototype.html` offers the same three presets from its topbar and persists the choice, so the sample and the product can be compared surface-for-surface.
- **Verification.** `npm run build`, `test:ui`, `test:a11y`, `test:learning`, `test:concepts`, the 32-state browser sweep, a 3-preset × 4-width sweep (0 overflow / 0 page errors), and `node web/validate.mjs`. See `preview/design-review-2026-11-05/verification.md`.


## Canonical grid guard · screenshot-driven fix (2026-11-05)

A user screenshot of CH05 showed the Reader's main column mostly blank while the CH05 provenance Lab collapsed into a ~50px strip, with every CJK glyph stacked vertically. Root cause: the wide-plate rule (top-level figures get `width: calc(100cqw - 2rem)` plus negative `margin-inline`) also matched `.bfs-canvas` figures authored **inside** canonical `.two` grids. The oversized first item made `1fr 1fr` resolve to `608px 0px` (CH05) or `1037px 1037px` (CH07), and `StructuralGuide` mounted its `.structural-guide-slot` as a sibling of `#fig-5-2`, making the Lab a grid item in that zero-width track.

- **Wide plates stay top-level only.** A `.bfs-canvas` that is a direct child of a canonical `.two` grid keeps `width: auto`, `max-inline-size: 100%` and `margin-inline: 0`; that grid resolves to a single `1fr` column at the wide-plate container breakpoint. Figures then sit inside the `38rem` measure instead of escaping it. This is a geometry guard in `handbook.css`, not a change to generated `content-base.css` or chapter HTML.
- **Structural guides are full-width blocks.** `.structural-guide-slot` is mounted after the outermost grid ancestor of its anchor, so CH05 matches CH09 / CH12 (`section.ch` as parent, `38rem` wide). The Lab's `#concept-demo` id, headings, scenario buttons, graph, captions and deep link are unchanged.
- **No new visual language.** No new surfaces, colors, shadows, fonts or tokens; no book cover and no borrowed branding. The `.two` figure and its explanatory bullets stay together in reading order, with the Lab following them.
- **No page-level overflow.** At 1440px both CH05 and CH07 keep `.chapter-body` `scrollWidth === clientWidth` (`1101px`), and no element taller than 300px is narrower than 120px in the CH05 article. Re-run `test:a11y`, `full-sweep.cjs` and a CH05/CH07 browser check after any change to the wide-plate rule or guide mounting.


## Authored-grid and simulator guards · screenshot-driven sweep (2026-11-05)

Two further user screenshots ("fix similar bugs") showed the same failure shape beyond CH05: a CH06 YAML `.two` whose right-hand callouts wrapped one glyph per line, and the dark Skill Simulator with `TOOL RESULT` / JSON squeezed into a ~16px column. A 12-chapter × 2-locale sweep found four independent root causes, all presentation geometry. No content, route, state, token or branding change.

- **Wide plates never apply inside authored grids.** The `@container (min-width: 60rem)` plate rule now excludes *any descendant* of `.two/.g2/.g3/.g4/.g5/.qa-grid/.qwall/.wheel-wrap/.lane3/.cover/.cap-stack/.harness-wrap`, not just direct children: CH09 nests `.tw` / `pre` one level deeper (`.grid.g2 > .tsc > .tw`). An authored grid directly containing a plate stacks to one `minmax(0, 1fr)` column at that breakpoint, and those plates keep `width:auto`, `max-inline-size:100%`, `margin-inline:0`. This stops `1fr 1fr` from resolving to `608px 0px` (CH06) and stops 1037px plates from spilling out of 297px tracks (CH03 / CH04 / CH09).
- **Simulator state classes are isolated.** The global search-results stylesheet owns the bare `.result` class (`display:grid; 2.25rem / 1fr / 1rem`). The simulator uses `.result` as a state modifier on `.sim-log` / `.sim-message`, so `.chapter-body .skill-terminal :is(.sim-log, .sim-message) { display:block; }` keeps log text and `pre.sim-json` out of that grid. The 16px × 756px JSON column is gone at every viewport.
- **Breakpoints follow the container, not the viewport.** Reader plates are keyed to `.chapter-body` (`container-type:inline-size`), but two legacy rules used viewport media queries. The simulator compact layout now starts at `@container (max-width: 59.99rem)` — the exact point where its wide plate deactivates — instead of `600px`; `.document-grid` stacks at `@container (max-width: 40rem)` instead of `@media (max-width: 640px)`. At a 768px viewport the reading column is only 453px, so the old three-track grid (~586px of min-content) pushed `.chapter-body` 184px into horizontal scrolling in English; it is now a single 347px column with `bodyOver 0`.
- **Reserved caption geometry.** Scenario captions differ in length, so switching tabs rewrapped `.atlas-graph-caption` and shifted the whole simulator 19.53px (390px) / 28.08px (1024–1280px). Reserve the measured maximum while the compact layout is active (`4.75rem`; `6rem` Chinese / `8rem` English at `<=25rem`, split with `:lang()`). The wide layout fits every caption on one line and needs no reservation. No text is clamped, truncated or hidden.
- **No new visual language or branding.** No book cover, no copied logo / logomark / wordmark, no new tokens, surfaces, fonts or controls. Generated `content-base.css`, chapter HTML / JSON, DOM counts, routes, storage keys and dark presets are untouched.
- **Verification.** `npm run build`, all six evidence suites, a 144-state (12 chapters × 5 widths × 2 locales × 2 themes) DOM/CSS matrix, `node web/validate.mjs`, `node web/sync-diagram-csp.mjs`, and a non-destructive production sync. See `preview/design-review-2026-11-05/verification.md` §10.


## Readable tables and code · screenshot-driven refinement (2026-11-05)

User feedback: two more CH05 screenshots with "尽量减少类似的横向滚动 提高可读性" — the "信息类型 / 索引路径" table clipped inside a narrow grid column, and the `EvidenceChunk` three-column table cut off with a visible horizontal scrollbar. The cause is generated: `content-base.css` gives every table `min-width:560px` (720px / 640px inside `.tsc` at smaller viewports), `th`/`td` `white-space:nowrap` and wide cell minimums, and every `pre` / `.tw` `overflow-x:auto`. Inside the `38rem` reading measure that turns ordinary 2–4 column tables and short JSON examples into sideways-scrolling panes by default. A 144-state sweep (12 chapters × 6 widths × 2 locales, dark) counted **792 internal scroll surfaces** before the change.

- **The wrapper is the plate, not its inner scroller.** `.tsc` / `.table-scroll` / `.fig` join the top-level wide-plate selector at `@container (min-width: 60rem)`; their inner `.tw` is excluded. Previously the inner `.tw` was widened to `calc(100cqw - 2rem)` while its `.tsc` parent stayed at `608px` — exactly the clipped-table screenshot. Top-level tables now get the same full-bleed measure as figures; tables inside authored grids stay in the reading measure.
- **Authored grids with a table give the table the whole measure.** `.two/.g2/.g3/…` that directly contain a `.tsc/.tw/.table-scroll/.fig` table stack to one `minmax(0, 1fr)` column at every width. A three-column table in a `293px` grid item is scrollable but not readable. Grids authored inside `.bfs-canvas` / React concept demos keep their diagram topology.
- **Tables with at most four columns are fluid.** `width:100%`, `min-width:0`, `table-layout:auto`, `white-space:normal`, `overflow-wrap:anywhere` on `th`/`td`. All generated table rules use zero-specificity `:where()` selectors, so no `!important` is needed. Five-plus-column matrices — mostly inside `.bfs-canvas` diagrams — keep their authored horizontal scroll; shrinking them destroys the matrix.
- **Code examples wrap.** Prose `pre` uses `white-space:pre-wrap` + `overflow-wrap:anywhere`; `pre` inside `.bfs-canvas`, `.concept-demo` and `.skill-terminal` keeps its fixed line geometry.
- **Compact type, then intact field names.** At `@container (max-width: 40rem)` table cells use `0.78rem` and inline `code` `0.75rem`. At `@container (min-width: 40rem)` first-column `code` uses `white-space:nowrap`, so `document_id` / `parser_provenance` stay on one line once the reading column can afford it; below that breakpoint they wrap so the two prose columns do not collapse. Both are container queries, not viewport media queries.
- **No new visual language or branding.** No book cover, no copied logo / logomark / wordmark, no new tokens, surfaces, fonts or controls. Generated `content-base.css`, chapter HTML / JSON, DOM counts, routes, storage keys, dark presets and the wide-plate geometry guards are untouched. `role="region"` / `aria-label` / `tabindex="0"` wrappers remain in the DOM and keyboard-focusable; they simply no longer need to scroll for 2–4 column tables. No text is clamped, truncated or hidden.
- **Verification.** `npm run build`, all six evidence suites, `node web/validate.mjs`, the 144-state horizontal-scroll matrix (`792 → 14`; the 14 remaining are all `.bfs-canvas` diagram internals), the 144-state similar-bug matrix (still `bad 6`, all pre-existing `.bfs-card-desc` narrow cards), `pageOver 0` in every state, and a non-destructive production sync. See `preview/design-review-2026-11-05/verification.md` §11.


## Atlas default-selection semantics · user-directed (2026-11-05)

A user asked why chapter 03's Knowledge Spine marker glowed green on a fresh dark home page. It was not reading progress, a bookmark or a completed state: `selectedAtlasSlug` was hard-seeded to chapter 03 so the Inspector would have content on first paint. That single state also drove `.atlas-node-row.is-selected`, `aria-pressed="true"` on the Inspect control, and the `var(--signal)` point marker (`#3ddc84` in dark). A visitor who had interacted with nothing was therefore shown a selection that did not exist. The user chose option 1: keep the Inspector's default chapter, remove the implied selection.

- **A preview is not a selection.** `selectedAtlasSlug` now starts empty; `defaultInspectSlug` keeps the Inspector's representative chapter at 03 only as a preview fallback. First paint is visually unchanged in the flat Inspector section, but no node is highlighted, no Inspect button claims `aria-pressed`, and no marker is green. Focusing a node link or clicking Inspect creates the real selection.
- **The point signal is reserved for real state.** Hover and `:focus-visible` keep the existing one-point green affordance as a transient pointer/keyboard hint; they do not set `selected`, do not set `aria-pressed`, and do not change the Inspector. An explicit Inspect sets all three and updates the Inspector to that chapter. `--signal` / `--signal-ink`, the three dark surface presets and the B-scheme "one point-sized green signal" rule are untouched.
- **No new visual language or branding.** No new tokens, surfaces, fonts, controls, storage keys, routes or DOM. No book cover, no copied logo / logomark / wordmark. The typographic wordmark, hairlines, `38rem` measure and the 12 / 4 / 12 / 8 Atlas DOM counts are unchanged.
- **Accessibility.** `aria-pressed` now reflects actual state on all twelve Inspect controls (all `false` on first paint), so assistive technology is no longer told a chapter is pressed without user action. Keyboard focus still creates a selection and updates the Inspector. 4.5:1 ordinary text, 44px targets and visible focus are unchanged; the green remains a non-text point signal.
- **Verification.** `npm run build`, all six evidence suites, `scripts/validate-atlas.mjs`, `node web/validate.mjs`, the 144-state horizontal-scroll matrix (still `14`) and similar-bug matrix (still `bad 6`), plus a fresh / hover / Inspect three-state check on both the dev build and the production preview. See `preview/design-review-2026-11-05/verification.md` §12.


## Readable cards & stacked tables · screenshot-driven fix (2026-11-05)

Two CH02 "企业检索基础" screenshots showed one readability failure in two forms: the `.grid.g5` capability row (EXACT / BM25 / DENSE / GRAPH / META) was crushed to about 120px per card inside the 38rem measure and `overflow-wrap:anywhere` split `BM25` into `BM/25`; the `#comparison` four-column table was crushed to ~110px columns at 768px, splitting `Exact` into `Ex/act` and stacking its header vertically. The reference editor uses a wider plate plus vertical semantic blocks with hairlines — never more columns than the measure can actually hold.

- **Card grids wrap inside the measure, keep their authored count on the wide plate.** `:is(.g3, .g4, .g5, .lane3):has(> .cd)` uses `repeat(auto-fit, minmax(min(100%, 9.5rem), 1fr))` so five capabilities wrap into 2–3 comfortable columns instead of five crushed ones; `.cd { min-width: 0 }` and `.cd small { overflow-wrap: normal; word-break: normal }` stop mid-token breaks. At `@container (min-width: 60rem)` the card plate spans the full width and restores the authored 5 / 4 / 3 tracks. **This container block must stay after the auto-fit rule**: the two selectors have identical specificity, so source order decides the winner. Placed earlier it was a dead rule and left a collapsed `0px` track in the computed grid.
- **Plain comparison tables become labeled records on narrow containers.** `reader.tsx` marks header-row tables outside the genuine diagram matrices with `.stack-table` and copies each `th` text into the matching `td[data-label]`. At `@container (max-width: 38rem)` the table becomes `display:block`, `thead` is hidden, each `tr` is a hairline card, the first `td` is the title and the rest render `::before { content: attr(data-label) }`. `.interp-matrix` is **not** a diagram matrix: it is the `.tsc` wrapper of the CH02 / CH03 scrollable comparison tables (four occurrences in total), so it must be stacked too. Excluding it was the reason `#comparison` stayed crushed.
- **Intact identifiers without reopening scroll surfaces.** The generic fluid-table rule sets `overflow-wrap:anywhere` on every cell; at 1440px that still split `Metadata` into `Metad/ata`. A narrowly scoped `@container (min-width: 38rem)` rule restores `overflow-wrap:normal` on **only the first column of `.tsc.interp-matrix > .tw > table.stack-table`**. Applying it to every `.stack-table` cell also reached CH09 / CH10 diagram tables with fixed `min-width` and reopened four horizontal scroll surfaces (matrix `14 → 18`); the scoped rule brought the count to `10`.
- **No new visual language or behavior.** No new tokens, surfaces, fonts, controls, storage keys, routes, dialogs or DOM contracts; no chapter HTML, JSON or generated `content-base.css` edits. Header labels are read from the already-locale-correct DOM, so Chinese and English stacked records stay correct in both locales. The `role="region"` / `aria-label` / `tabindex="0"` scroll wrappers remain in the DOM and keyboard-focusable; they simply no longer need to scroll for stacked records.
- **Verification.** `npm run build`, all six evidence suites (`test:ui` 17, `test:a11y` 28 routes / 0 violations, `test:learning` 60, `test:concepts` 96, `test:structure-browser` 144 assertions, `test:simulator-layout` 8 baselines × 9 steps), `node web/validate.mjs`, CH02 geometry at 1440 / 1024 / 768 / 390px (5 active columns × 196px; `stacked=true` at 768 / 390; `pageOver 0`; no crushed elements; 0 page errors), the 144-state horizontal-scroll matrix (`10`, down from baseline `14`) and similar-bug matrix (`bad 6`, unchanged), and a non-destructive production sync. See `preview/design-review-2026-11-05/verification.md` §13.


## Original favicon · Knowledge Spine mark (2026-11-05)

The deployed root is `web/site/` (`web/vercel.json` sets `outputDirectory: "site"`), and it shipped with **no favicon at all**: no icon asset and no `<link rel="icon">` in the entry document. The legacy static site still has `web/favicon.svg` (a full green plate with a white "A"), but that file sits outside the published output directory and its green wash contradicts the current one-plane / one-point-signal discipline. The "No borrowed branding" rule requires any future brand mark to be original and documented here **before** the asset is created, so this section precedes the SVG.

- **Concept.** The mark is the Knowledge Spine — this project's own signature, "a visible trace from Model → Retrieval → Agent → Production that reappears as chapter nodes, section traces, and diagram connections". Four nodes on one horizontal hairline spine; exactly **one** node is a point-sized green signal (the first node, the sequence origin), the other three are neutral ink. No letterform, no book cover, and no third-party logo, logomark, wordmark or icon arrangement is copied, traced or approximated. It is deliberately different from the legacy white "A" mark.
- **Tokens only.** Every value comes from the frontmatter token table: light `plate #ffffff`, `border #deded8`, `foreground #0c0c09`, `signal #00a544`; dark `page #212121`, `border #3a3a3a`, `foreground #ececec`, `signal #3ddc84`. The green is never a wash behind text and never a full plate — it stays one dot, per "one point-sized green signal" and "never tint an entire reading surface green".
- **Small-size legibility.** One 64×64 SVG with deliberately heavy geometry (8-unit node diameter on 13.3-unit spacing — a 5.3-unit visible spine segment between nodes — plus a 3-unit spine and a 14-unit corner radius) so the trace reads as a connected spine, not four loose beads, even at 16px tab size. The spine uses `foreground` at 50% opacity rather than the very light `border` token, so the connection survives downsampling. An in-SVG `prefers-color-scheme` rule swaps to the dark token set (the plate edge uses `foreground` at 18% opacity there, since `#3a3a3a` disappears against a dark tab strip); user agents that ignore it fall back to the white plate, which stays legible on both tab strips. A `<title>` gives the mark an accessible name, and all CSS is scoped to `svg.favicon-mark` so inlining the asset cannot leak styles into the host document.
- **Scope.** One asset at `/favicon.svg` plus one `<link rel="icon" type="image/svg+xml">` in the Vite entry document. No ICO, apple-touch-icon, web manifest or `theme-color` meta in this pass; no new tokens, fonts, surfaces, controls, routes, storage keys or DOM contracts. The legacy `web/favicon.svg` is left untouched and is not served from the deployed `web/site/` root.
- **Verification.** `npm run build` (JS/CSS hashes unchanged: `index-B30BLWRa.js` / `index-Dh1xlw27.css`), `test:ui` 17 groups, `test:a11y` 28 routes / 0 violations, `node web/validate.mjs` PASS, and a two-scheme browser smoke check that the browser actually requests `/favicon.svg` with `200 image/svg+xml` in both light and dark color schemes, with `pageOver 0` and 0 page errors. Rendered 16 / 32 / 64px previews were inspected in both schemes for both inline-SVG and `<img>` loading paths; the dark `prefers-color-scheme` rule applies to both. `diff -rq dist web/site` is IDENTICAL and `content/*.json` is unchanged. See `preview/design-review-2026-11-05/verification.md` §14.

## Reusable architecture reading diagrams · CH06 / CH10 (2026-11-06)

**Audience and reference.** Readers learn the difference between a capability, protocol, execution host, policy gate, runtime environment and tenant isolation. Borrow the explanatory structure—not the brand styling—from Learn Inference's layered technical lessons: separate duties first, clarify boundary order, then show connections. Do not copy screenshots or write new factual claims not present in the chapter.

**Shared pattern A — ordered stage ledger.** Four existing source-authored diagrams (`fig-6-a1`, `fig-6-b2`, `fig-10-r2`, `fig-10-t1`) use the semantic class `atlas-stage-ledger`. Their `.bfs-flow-container > .bfs-card` rows become a quiet, hairline-separated vertical timeline. A single neutral rail connects stages; each stage's original `.bfs-stage-pill`, title and description remain fully visible in reading order. At a *figure-local* width above 38rem, use label and explanation columns. Below 38rem, stack label → title → detail without hiding or truncating anything. No colorful per-step cards, dashboard chrome, false performance metrics, or new interactions.

**Shared pattern B — environment inventory.** CH10 `fig-10-r1` uses `atlas-context-matrix` for six existing runtime prerequisites. It renders as an open, flat list at narrow widths, two columns at figure widths ≥46rem, and three columns at ≥70rem. Never collapse six independent facts into a visually implied execution sequence. This layout is a *parallel inventory*, not a dependency graph.

**Owner and extraction.** The five relevant source fragments in `web/assets/` supply authoritative chapter text and explicit semantic classes. Their shared presentation lives in `preview/handbook-custom/src/handbook.css` and not in generated `content-base.css`. Existing Reader wide-plate, fonts, dark presets, progress, chapter navigation, search, checkpoints and diagram tutorials remain intact. Because four ledgers share the exact intent, one reusable CSS grammar is warranted; no React component is introduced for HTML-only source diagrams.

**Validation.** Verify the actual boxes for all five figures at 320/390/768/1152/1440/1728px, both locales and light/dark surfaces. Stage labels, headings, descriptions and markers must remain inside the owning figure. At 390px the ledger is one column and the inventory is one column; at sufficiently large figure widths, the inventory gains columns only when its own width allows them. Test no page horizontal overflow, no hover transform, and no missing stage. Native forced-colors and reduced-motion behavior must remain usable. CI synchronizes authoritative HTML, builds and tests, and commits the exact verified static output before review.

