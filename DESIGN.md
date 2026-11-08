---
name: AI Engineering Atlas
description: An engineering knowledge atlas for exploring systems, learning deeply, and returning to evidence
last_updated: "2026-11-08"
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

# AI Engineering Atlas · Current Design Contract

This is the **active design contract** for the published Atlas. It deliberately describes the current product rather than a chronological record of experiments. The complete, unmodified prior contract is preserved in [the design history](docs/design-history/DESIGN-full-2026-11-06.md); the matching historical interaction contract is in [the UX archive](docs/design-history/UX-CONTRACT-full-2026-11-06.md). New implementation follows **this document first**, then the active [Reader interaction contract](preview/handbook-custom/UX-CONTRACT.md). Archived decisions explain history but never override active behavior.

## 1. Purpose and visual direction

**Product:** an engineering knowledge instrument: locate a concept, inspect system relationships, learn the technical constraints, check evidence, and return to a saved place. Primary use mode is **Read**, with Operate-like controls inside optional teaching experiments.

**Visual north star:** *engineering workbench × technical manual × system topology, with editorial reading clarity*. The signature is a restrained Knowledge Spine connecting Model → Retrieval → Agent → Production. The interface has one readable narrative column, one neutral hairline, a point-sized green signal for meaningful system states, and serif typography for prose. Use geometry and labels to communicate engineering responsibility, not decorative card palettes.

Do not introduce a book-cover hero, SaaS dashboard cards, fake measured KPIs, gradient text, glassmorphism, colorful dividers, marketing animations or a persistent right TOC. No arbitrary second visual system for new chapters.

## 2. Tokens, surfaces and contrast

The runtime source of truth is `preview/handbook-custom/src/handbook.css` (light/dark tokens); this table describes their roles, not a second implementation.

| Role | Runtime token | Light | Graphite dark (default) |
| --- | --- | --- | --- |
| Navigation canvas | `--background` | `#ffffff` | `#171717` |
| Reading page | `--page` | `#ffffff` | `#212121` |
| Diagram well | `--plate` | `#f8f8f5` | `#1c1c1c` |
| Raised control | `--card` | `#f8f8f5` | `#2b2b2b` |
| Overlay | `--popover` | `#ffffff` | `#303030` |
| Body text | `--foreground` | `#0c0c09` | `#ececec` |
| Secondary copy | `--muted-foreground` | `#6b6f63` | `#a9a9a9` |
| Text-bearing green | `--signal-ink` | `#087a37` | `#5de29c` |

The neutral border is `--hairline`; controls use `--ring`. `--primary` denotes actionable selection, not a green-washed surface. The brighter `--signal` is for nontext markers only (light `#00a544`, insufficient as body text). Text contrast targets ≥4.5:1; large type ≥3:1; meaning must not depend on hue. Warning/destructive colors are acceptable only for genuine technical state and need corresponding text.

The three persisted dark surface presets are **graphite** (default), **ink** and **forest** (storage `preview-dark-preset`). They change surface lightness, not document semantics, interaction permissions or typographic roles. The Reader topbar stays solid page-colored (no backdrop blur); non-Reader shells may use the already-established subtle backdrop. The dark dialog scrim stays neutral.

## 3. Typography, spacing and reading geometry

- **UI and diagrams:** local Geist Variable plus CJK system sans fallbacks (`--font-sans`). **Code, system metadata, chapter numerals and trace labels:** Geist Mono Variable (`--font-mono`). **Reading prose and editorial headings:** local `Songti SC / Noto Serif CJK SC / Source Han Serif SC / Iowan Old Style / Georgia` stack (`--font-serif`). Do not fetch remote fonts or apply serif to technical diagrams.
- Canonical Reader prose measure is **38rem**, with approximately `1rem / 1.85` body rhythm. Technical figures, tables and authored wide plates can extend within the existing Reader constraints **only when they are top-level**; never let a plate inside another authored grid claim full Reader width.
- Use the existing space steps of 0.5, 1, 1.5 and 2rem; 1px hairlines and subtle tonal separation before shadows. Card corners are restrained (roughly 6–12px); figures do not inherit a decorative dashboard grid.
- Headings use neutral weights, distinct whitespace, balanced line breaks and readable long English / Chinese strings. Avoid breaking technical identifiers into individual glyphs, ellipsizing required evidence, or shrinking nodes until they fit.
- Tables and code use fluid small-column layouts or their own explicit horizontal scroll when necessary. Never create an extra horizontal scroll owner for a diagram that can instead reflow. Preserve source/citation identity in code and data displays.

## 4. Product shells and navigation

**Atlas** is the one-column home with the Knowledge Spine, four groups, a compact introduction, search and a secondary inspector below the spine. **Reader** is the canonical deep reading view. **Search** is a ranked local Knowledge Command, **Notebook** holds saved chapter return points, **Concept** connects related canonical sources. **Architecture** is the source-derived system reference; it does not silently become a fifth home destination.

Reader route and deep-link semantics are stable: `#read/{chapter-slug}/{section-id}`, `#concept/{concept-slug}`, `#home/all`, `#home/saved`, `#map`. Browser Back, search results, on-page TOC, bookmark state and all 12 chapter destinations must keep working. The active language controls document titles, labels and headings.

**Persistent topbar:** Reader header never hides on scrolling. Mobile (≤767px) is a single 48px row with a 56px content clearance, one truncated chapter title and accessible 44px tap targets. Search, chapter menu, section TOC, language and More remain accessible. GitHub and dark surface presets move into More on mobile Reader only; desktop keeps direct affordances. Focus mode must expose a visible exit. Do not create a second toolbar row or a sticky bottom bar.

**Reader pagination:** in-flow at the end of the article; two quiet links show the destination chapter names, arrows and a mono chapter count. First/last chapter links return to Atlas. On mobile, the workspace is the single scrolling page; desktop has its bounded scroll pane. Keep section anchors, keyboard focus and scroll-position restoration intact.

**Scrollbars:** one transparent track, neutral 7px WebKit thumb (5px coarse pointer) and standards `scrollbar-width:thin`; idle/engaged/dragging visibility is derived from foreground, not green. No ancestor-hover glare. Preserve desktop stable gutters, touch/wheel/keyboard scroll and forced-colors platform overrides.

## 5. Shared Figure Design System

The consolidated CSS owner is **`preview/handbook-custom/src/teaching-figures.css`**, loaded *after* `handbook.css` and before `architecture.css`. Use the semantic class **`.atlas-figure-shell`** on genuine, source-authored teaching figures. The shell currently has **seven explicit CH06/08/10 instances**: CH06 `fig-6-a1` and `fig-6-b2`; CH08 static `fig-8-loop-vs-graph` and interactive `[data-architecture-explorer]`; CH10 `fig-10-r1`, `fig-10-r2`, `fig-10-t1`. Additional CH09 cost `.lab` continues to reuse the existing layout rules without a semantic migration of its calculation model.

The common shell owns only:
- **Figure-local** `container-type:inline-size`, min-width safety and neutral token aliases for surface/ink/hairline/spacing.
- Coherent sans figure titles, supporting explanatory summary, and readable **mobile** type (≥18px titles and ~15px summaries when figure width ≤40rem). Only real source-authored summaries qualify as teaching takeaways. Do not manufacture a score, verified result or newly asserted claim as decoration.
- Natural line wrapping and clear separation between context, example/control, result/flow and engineering boundary. Current stage-ledger and context-inventory diagrams keep their source-authored heading/body and outcome; no generic card redesign.

**Domain-specific layouts are *not* interchangeable.** Four CH06/CH10 `.atlas-stage-ledger` views are ordered role/boundary timelines: at figure width ≤38rem, the stage label, title and explanation stack; above that, use a two-column rail. CH10 `.atlas-context-matrix` is a *parallel inventory*, with 1/2/3 columns at figure widths 0–46rem / 46–70rem / ≥70rem; never suggest that independent runtime prerequisites form a process sequence.

CH08 `.lab[data-architecture-explorer]` is a decision input → interpretation → bounded loop / outer graph teaching simulator. It stacks controls and results below 54rem lab width. Its outer Graph stacks below 40rem and local loop below 32rem, retaining seven original signals, exact `loop/gated/graph` state transitions and Reset. CH09 cost teaching formula is an independently authored quantitative case whose three operands and two operators must remain in mathematical reading order on narrow screens. Keep selected state distinguishable with text, not color alone.

CH08 structure-signal choices use readable ~14px labels, ~13px explanatory text and at least 44px activation height at compact widths; they must remain keyboard accessible.\n\n**Extraction threshold:** a shared Figure Shell is justified by ≥3 instances with the same reading/semantic intent. Preserve GraphCanvas's node/edge, DecisionTrace's frame control and chapter-specific simulation logic as separate APIs. Do not turn domain logic into an overly generic React component merely because boxes share a border.

## 6. Educational experiments, evidence and safety

Twelve primary chapter-local `#concept-demo` labs, original chapter anchors, synchronized graph / decision trace, two-question check and canonical authored chapter prose remain stable. CH03, CH04 and CH08 additionally contain deterministic controlled experiments:
- **CH03:** query/evidence shape + planned route budget (Exact/BM25/Dense/Graph/SQL). Missing referent → clarify, zero tool calls; planned coverage is not retrieval recall, authorization or a correct answer.
- **CH04:** synthetic threshold → coverage, selective risk and abstention; risk is **undefined** at zero answered cases, not zero. Do not claim increasing the threshold monotonically improves risk.
- **CH08:** bounded retries with a synthetic work budget and approval gate. Only evidence-verified completion is STOP; budget exhaustion is HANDOFF, absent authorization is BLOCKED. Checkpointing does not make external effects transactional.

Do not introduce invented production numbers, fake execution traces or silent network operations. RAG permission gates and source rechecks, human approval, external idempotency and cost/evaluation semantics belong to the canonical chapters. Source-authored architecture figures are **teaching projections**, not a policy standard or a customer incident.

## 7. Accessibility and interaction quality

Visible focus, native keyboard controls, text status alongside color, effective 44px tap targets, meaningful heading order, reduced-motion compatibility, high contrast and readable zoom are mandatory. Source panel labels must never be clipped, collapsed or drawn over adjacent text. Test both Chinese/English, the light theme and each of graphite/ink/forest as components change. A theme variant is not a separate design system.

Preserve one explicit scroll owner per mode. At 320/390/768/1152/1440/1728px, inspect **element rectangles**, not just document `scrollWidth`: no node/card/label may leave its own component. Prefer a real browser fixture over guessing from CSS. A passing Chromium suite is not a substitute for full manual Safari, screen-reader or physical device certification; report coverage honestly.

## 8. Source ownership, testing and release

| Ownership | Canonical source | Do not overwrite with hand edits |
| --- | --- | --- |
| Product visual tokens / Reader shell | `src/handbook.css`, `src/index.css` | generated chapter payload |
| Shared teaching figure grammar | `src/teaching-figures.css` | `src/content-base.css` |
| Graph topology | `src/graph-primitives.*`, authored per-chapter graph models | generated SVG screenshots |
| Teaching decision fixtures | `src/query-route-lab.tsx`, `src/reliability-lab.tsx`, `src/agent-retry-lab.tsx` | canonical chapter claims |
| Chapter HTML fragments and language strings | `web/assets/*.html`, `handbook/chapters/*.md` | `src/content-base.css` or the final `web/site` |
| Product behavior | active `preview/handbook-custom/UX-CONTRACT.md` | archived history |
| Deployment | verified `web/site` generated by CI | stale or manually copied JS/CSS |

Run `npm run sync-content`, `npm run build`, `npm run publish:web` inside `preview/handbook-custom`, then browser tests for current chapters and legacy regressions. Collect representative screenshot evidence at mobile/desktop in light/dark, check the actual result and render boundaries, and sync the exact verified `web/site` output into the PR branch **before** merge.

Vercel Git autodeployment is disabled: merging `main` **does not** mean publication. An explicitly requested release requires a Vercel `production` deployment from the merged SHA and an alias/asset smoke check. Do not call a Draft PR or a ready preview a published version.

## 9. Change policy and archives

For visual enhancements, reuse the current Atlas tokens and shared components first. Modify **only the smallest authoritative layer**: content for factual text, teaching figure module for figure layout, Reader CSS for shells, graph model for edges, contract for intentional behavior changes. Avoid endless bottom-of-file override layers. A domain-specific new module is allowed when its intent is genuinely different; don't abstract one-off code.

Prior design decisions, historical test notes, V2/V3 evolution and temporary screenshot bug fixes are retained verbatim in [DESIGN history](docs/design-history/DESIGN-full-2026-11-06.md) and [UX history](docs/design-history/UX-CONTRACT-full-2026-11-06.md). They are context for why current choices exist, not a second active instruction set. Future dated changes should update this active contract in place and add a concise history note in `docs/design-history/` when a past rationale matters.
