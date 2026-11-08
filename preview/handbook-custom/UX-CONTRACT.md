# AI Engineering Atlas · Active Reader / UI Contract

**Status:** current as of 2026-11-08. This file describes actual product behavior and verification commitments, not the timeline of design revisions. The preceding 60KB specification is preserved **verbatim** at [UX-CONTRACT history](../../docs/design-history/UX-CONTRACT-full-2026-11-06.md). For current visual decisions use the root [DESIGN.md](../../DESIGN.md), then this contract. Historical notes explain context but do not override the running app.

The product is an education-oriented, source-first Reader. There is no account, checkout, remote record mutation, permission system or real autonomous tool execution. Local bookmarks are the only persisted user content. Educational examples are deterministic projections of authored cases unless explicitly shown otherwise.

## Navigation and reading

| Destination | Canonical route | Invariant |
| --- | --- | --- |
| Atlas / Knowledge Spine | `#home`, `#home/all` | Four engineering groups, 12 chapter links, separate optional lab affordances |
| Notebook | `#home/saved` | Return to locally saved chapters; storage errors have usable feedback |
| Concept | `#concept/{slug}` | Source-grounded relationship summary and chapter navigation |
| Reader | `#read/{chapter-slug}/{section-id}` | Stable chapter/section deep link, native browser Back |
| Architecture | `#map` | Source-derived system architecture reference |

Reader loads canonical chapter content per chapter, cancels stale fetch requests with AbortController, and exposes a localized loading/error/retry or unknown-chapter recovery state. Chapter heading is screen-reader-available; the single visually dominant chapter identity is in the topbar. Deep links, TOC jumps, search hits and chapter navigation all use the active scroll owner and preserve browser history.

**Reader topbar:** always visible during reading. Mobile ≤767px is a single 48px surface with 56px initial article clearance; controls must have minimum 44px tap areas without forcing chapter names into a second row. The title truncates; chapter menu, Search, TOC, locale and More remain directly usable. Mobile More preserves GitHub, graphite/ink/forest preset selection, theme toggle, font size, focus mode, bookmarks and diagram navigation. Desktop keeps its direct GitHub and surface-picker actions. A focus-mode exit must always remain accessible.

**Chapter footer:** exactly one in-flow `.reader-bottom` nav after article content. Show destination titles, directional arrows, a chapter count, real `chapterHref` links and Atlas fallback at both bookends. Never use a fixed bottom toolbar. Mobile Reader uses the workspace as its single page scroll; desktop uses the bounded chapter scroll pane. Never introduce a second Reader-wide scroll owner when a figure reflows.

**Atlas/Notebook/Search:** keep the existing editorial introduction, grouped chapter spine and subservient flat inspector; Notebook opens from saved local state. Search is a local ranked knowledge command, not a dynamic remote AI service. No new account or billing surfaces. Search dialogs, mobile navigation and on-page TOC must trap/release focus correctly and remain keyboard accessible.

## Source-aligned lesson and diagram contract

Exactly **12 primary `#concept-demo` lessons**, with canonical chapter anchors and at most one primary lab per chapter. Existing chapter source, bilingual text, diagrams, graph-first layers, DecisionTrace and two-question checks remain readable; optional secondary explanations can exist with separate anchors. A lab link is distinct from the canonical chapter link. Source-authored HTML changes only for presentation classes or with an explicitly reviewed factual change.

The chapter semantics must stay correct:
- CH01 context capacity is not guaranteed attention budget; CH02 authorization gates precede retrieval and may require a fresh source recheck.
- CH03 Query Routing selects/suppresses Exact/BM25/Dense/Graph/SQL paths; missing identifiers/referents clarify first; route planning is not measured recall.
- CH04 evidence/selective answering keeps the G0–G5 interpretation. Coverage = answered/total; Selective Risk = wrong/answered and is undefined when no cases are answered.
- CH05 PDF citations must resolve to version/page/evidence elements. CH06 Skill Contract, MCP protocol and Host execution are distinct; capability matching does not authorize a side effect.
- CH07 write, read and correction lifetimes are distinguished; CH08 Plan–Act–Observe–Verify has bounded retries, explicit verified STOP, incomplete HANDOFF and human approval gate.
- CH09 evaluates real acceptance evidence rather than imaginary success. CH10 exact-prefix cache eligibility and tenant/trust boundaries are distinct. CH11 CDC order and SCD2 version/arrival/business time are separate. CH12 capstone maintains source-authored five-plane and seven-boundary checks.

**Existing interactive experiments:** CH03 query type + planned-route budget, CH04 synthetic abstention threshold and Risk–Coverage chart, CH08 scenario + attempted-run/work budget controls. All fixtures are illustrative, never real tool calls, real costs, measured model latency or universal policy guarantees. Explicit controls update case outcomes, per-case text evidence and next recommended action; meaningful state never relies on color alone. Checkboxes, sliders, select menus, Reset, transport/playback and frame selection stay native/accessible. Reduced-motion mode disables unnecessary motion. No autorun, hidden network request, permission escalation or external side effect.

## Figure Shell and authored responsive figures

The shared design-system class `atlas-figure-shell` is present on seven source-authored CH06/08/10 figure roots, and is styled solely by `src/teaching-figures.css`. It standardizes figure-local sizing, readable heading/summary hierarchy, source copy wrapping, neutral line/surface tokens and compact typography. The rule is **visual only**; it must never mutate the authored technical claim or simulation state.

- **CH06:** `#fig-6-a1`, `#fig-6-b2` retain five-/three-stage ledgers and original bilingual content. `#capability-architecture-title` continues to link to the primary Skill Simulator.
- **CH08:** static `#fig-8-loop-vs-graph` and the adjacent `[data-architecture-explorer]` figure share the shell. The Explorer still owns seven inputs, `loop`, `gated`, `graph`, Reset, output state and original Loop/Graph diagrams. Under 54rem of *figure width* controls precede the result, below 40rem the outer graph becomes a node/arrow column, below 32rem the bounded loop also stacks. No diagram may overlap a panel.
- **CH10:** `#fig-10-r1`, `#fig-10-r2`, `#fig-10-t1`. Role and tenant ledgers keep ordered stage semantics; runtime prerequisites are a *parallel inventory*. Do not make the inventory appear sequential. Ledgers switch to single-column below 38rem. Inventory is 1/2/3 columns below 46rem / 46–70rem / ≥70rem of **its own width**.
- **CH09 parity:** the Cost-per-Success simulator keeps its original `.lab` model and quantitative controls; operands and multiplication/division symbols remain in order when stacked at narrow widths. It shares layout mechanics without being rewritten as a CH08 decision model.

The interactive CH08 structure signals remain readable at mobile widths (at least 14px primary labels, 13px secondary text and 44px touch targets), with checked text and outcome fully visible.\n\nDo not extract React `GraphCanvas` or change decision/permission models merely because the figure frames look similar. Label nodes and edges in text; keep graph edges aligned with authored HTML nodes and preserve explicit blocked, return and optional-edge semantics. The user can select examples and inspect evidence with keyboard input. Avoid a duplicate static topology that overwhelms a primary interactive graph unless it offers an independently useful view.

## Presentation, accessibility and responsive constraints

**All controls** retain visible keyboard focus and meaningful names. Actual touch targets should be ≥44px. Light/dark/graphite/ink/forest must preserve semantic contrast; text ≥4.5:1, large headings ≥3:1. No color-only blocked or selected state. Respect reduced motion and forced-colors native system controls; the scrollbar is a thin, neutral, transparent-track indicator whose active state reflects real scrolling/focus.

**Reader text** is a 38rem serif measure (source prose), while diagrams/controls use sans and code/system labels use mono. Technical identifiers must remain intact. At 320/390/768/1152/1440/1728px, verify element rectangles: no Graph node, title, stage, table or equation operator outside its parent. Wide data tables may scroll internally if explicit; responsive diagrams may not solve overlap by adding an invisible sideways scroll pane.

**Source provenance:** authored chapter HTML and Markdown are the semantic authority. `sync-content` creates generated Reader payload and `src/content-base.css`; do not hand-edit those outputs for presentation. `src/handbook.css` owns app shell and global tokens; `src/teaching-figures.css` owns shared teaching figure presentation; source classes identify already-authored patterns. The published `web/site` must match the verified source build.

## Regression and release gate

Run source sync, TypeScript/Vite build, static `publish:web`, all existing Reader/teaching/browser checks, and the **Figure Shell regression** against a real Chromium Reader. Test 320/390/768/1440/1728px, both locales, light/dark, visible figure heading/summary, the seven migrated `atlas-figure-shell` instances, CH08 selection/reset and three chapter links. Screenshot at least CH06, CH08, CH10 mobile/desktop; check that the active Figure Shell CSS really loaded, not merely that a class exists. Review the screenshot in an actual file, not a guessed thumbnail. Existing CH03/04/08/09, scrollbar, pagination and CH06/10 architecture regressions must still pass.

Git auto-deployment is disabled. CI first builds and exercises in read-only mode, then an isolated write job commits tested `web/site` assets to the PR branch only after a successful run and a stale-head check. The merged `main` commit still requires an explicit, authorized Vercel production deployment and alias + homepage/static-resource verification. Report Draft / merged / deployed as different statuses.

## Historical reference and update policy

The source-preserving prior full UX contract is in `../../docs/design-history/UX-CONTRACT-full-2026-11-06.md`, with its matching visual contract in `../../docs/design-history/DESIGN-full-2026-11-06.md`. They are **read-only background**. Keep new active instructions here and in root DESIGN, not as dated overrides appended to the end of a monolithic file. Domain-specific further detail can live alongside its component or test; this concise contract defines the shared behavior.
