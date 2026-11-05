# Handbook preview interaction contract

Source: the user's knowledge-manual direction, full-design request, established local preview behavior, and canonical technical content in `../../handbook/chapters` and `../../web`. There is no account, billing, remote mutation, or permission workflow.

## Canonical UI Map

| Capability | Canonical owner                                       | Source of truth                     | Allowed variants                         | Verification                           |
| ---------- | ----------------------------------------------------- | ----------------------------------- | ---------------------------------------- | -------------------------------------- |
| Scrollbar  | Global src/handbook.css                               | DESIGN.md semantic tokens           | Article vertical, tables/code horizontal | full-sweep and runtime computed styles |
| Form       | No product form; canonical native experiment controls | Original handbook interaction logic | Checkboxes and range sliders             | full-interactions                      |
| Toast      | App bookmark-status live region                       | Local bookmark operation            | Visible storage failure, routine status  | full-interactions                      |
| CRUD       | Local bookmark toggle only                            | App state + localStorage            | Saved/unsaved; no delete confirmation    | full-interactions                      |

Date, select/listbox and table selection are not used by the rendered product. Unused registry examples are not application workflows.

## Navigation and route document title policy

`#home` and `#home/all` own the Atlas system view; `#home/saved` owns Notebook; `#concept/{concept-slug}` owns a shareable Concept entity view. Legacy `#home/{group-index}` links may resolve to the Atlas rather than preserving the old filter UI. `#map` owns the system and Agent reference architecture diagrams; `#read/{chapter-slug}/{section-id}` owns reading destinations. `#read` remains a compatibility route for chapter 02. The native browser Back button restores destinations. Titles follow the active Chinese/English locale and name Atlas, Notebook, System architecture, or the current chapter.

Every chapter uses the same reader. Previous/next chapter navigation lives at the end of the scrollable article and does not reserve a fixed bottom bar. Menu links, directory links, map links, search results and previous/next navigation enter this reader. All 12 active chapters are available; no ordinary reading action routes to the legacy shell. Article data loads per chapter with AbortController cancellation and a localized pending/error/retry region. An unknown chapter has a recovery screen and a contents link.

Architecture navigation scrolls to either complete diagram within the page. Related-chapter links inside system modules open the shared chapter reader. Architecture content and topology are derived from the original `web/index.html` via `scripts/sync-architecture.mjs`.

## Atlas, Notebook, and system orientation

Atlas is the primary home surface. It presents all four engineering layers in one Knowledge Spine: Model, Retrieval & RAG, Agent Engineering, and Evaluation & Production. Chapters are represented as connected nodes rather than isolated cards. Interactive chapters may expose a quiet lab affordance, but the chapter link remains the primary action. Atlas also exposes a compact Concept Index whose links open first-class concept routes. Selecting a chapter's Inspect control updates the contextual inspector without navigating; chapter titles still open Reader, while named Lab links deep-link to the mounted interactive lesson. Related chapter links are editorial pointers, not claims of formal prerequisites.

Concept routes are curated indexes over canonical handbook content, not independent knowledge articles. Each concept has one primary source, a short source-grounded summary, an ordered source trail into existing chapter/section routes, and optional related-concept links. A concept page must never become a competing technical source of truth; detailed explanations remain owned by the canonical chapters.

Notebook is the saved-knowledge surface backed by the existing local chapter-bookmark state. Phase 1 keeps bookmarks chapter-scoped; section and concept saves are future behavior and must not be implied as already available. Atlas and Notebook share the same chapter routes, locale, theme, and bookmark operations.

The architecture route remains a separate full-system view. Atlas may summarize or link to it, but must not duplicate the full topology or create a competing architecture source of truth.

Selecting a chapter's Inspect control still updates the contextual inspector **without navigating**; the 2026-11-05 editorial refinement changes only where that inspector sits (a flat full-width section below the Knowledge Spine, not a persistent right-hand rail). Its `id="atlas-inspector-selected"` focus target, the eight Concept Index links, the architecture entry and all inspector content remain reachable in the same DOM.

## Content and lookup

Canonical technical meanings, text, diagram topology, node order, and bilingual labels remain owned by the source handbook. The preview derives complete chapter and registered fragment content. Tables remain tables and horizontal comparison/code scrolling is keyboard reachable. Section search is a local transient dialog, so its editing query is intentionally not persisted in the URL; selected results are shareable chapter/section routes.

Search supports IME text entry; composition never activates Enter navigation or shortcuts. ArrowDown enters the result links; Tab navigates normally and Enter opens a result. Results use deterministic local relevance ranking. Concept entities whose current or alternate-language name matches the query appear before section results; exact concept-name matches outrank concept prefixes and contains matches. Section ranking then uses exact and prefix title matches above title contains, which outrank body matches; the active locale receives a modest ranking preference without hiding valid cross-language matches. Snippets come from the language that actually matched when the active-language body does not contain the query. The first result is identified as the best match, and visible match text may be highlighted without changing the underlying result text. Search has loading, failure/retry, no-results and clear states. Search data is lazy-loaded; it does not issue remote requests on each keystroke.

## Reading preferences and bookmarks

Locale, theme, text size and bookmarks are saved only in the current browser. Bookmarks are immediate and reversible, with one shared status live region. If persistence is unavailable, the current visit remains usable and the storage issue is stated honestly. No account/sync promise is made. Reading positions are neither saved nor restored; the directory has no continue-reading entry.

Focus reading hides persistent sidebar/table-of-contents chrome and preserves the same content, search, page navigation and reading controls. It has an explicit exit button in the Reader controls and a second always-reachable exit action in the top bar while focus mode is active. Chapters open at the beginning unless the URL specifies a section destination.

## Accessibility and responsive behavior

Search, mobile navigation, and mobile section navigation use the installed Radix Dialog owner with names, Escape, focus trapping, and focus restoration. Buttons and links retain native roles. Current chapter/section are exposed with aria-current; bookmark/focus selection use aria-pressed. An explicit skip link reaches the content region.

Scrollbars use one thin, neutral and transparent-track style across Reader, Atlas, Notebook, navigation, dialogs and nested technical code/table panes. A subtle 22%-foreground thumb is visible at rest; direct scroll activity or keyboard focus strengthens it to 45%, dragging to 64%. Hovering the thumb may strengthen the thumb, but merely hovering an ancestor must not light up all nested scrollbars. Preserve desktop stable gutters, touch scrollability, keyboard table/code scrolling and mobile full-width reading. Forced-colors restores native scrollbar width and system-color visibility. Browser regression must check the actual scroll surfaces, dark/light modes and high contrast; no layout shifts or horizontal overflow. The desktop sidebar can be hidden and restored using the top-left navigation button; the local collapsed preference does not affect the mobile navigation dialog. Reduced motion suppresses animation. Dark mode uses neutral reading surfaces; filled-button text comes from the semantic on-primary token. On phones the workspace is one scrolling page: toolbar, Atlas introduction, search, Knowledge Spine, Notebook, and architecture entry all scroll together. Reader headings and controls also scroll with the article; section jumps use the workspace as their scroll owner. Desktop keeps its bounded content panes. At narrow widths the sidebar becomes a navigation dialog, the TOC is a section dialog at every width, comparison tables scroll internally, and complex experiment panels stack at their available content width.

## Visualization V2 extension

- CH10 reuses canonical `#fig-10-1` and CH11 canonical `#data-plane` as stable insertion points; both expose `#concept-demo` for direct navigation from Atlas and Reader More menu after lazy load.
- Scenario changes only follow explicit native button input. Each choice updates an independently readable diagram (prefix token sequences / data boundary checks), decision explanation and a polite accessible outcome region.
- Green or status symbols alone cannot define a result: the diagnosis and subsequent action must be present in text. Explicit labels explain conditional cache hits and contract-dependent quarantine or access decisions.
- Preserve the canonical chapter in both locales without injecting new generated-source ownership. Failing diagrams must not hide or obstruct article material. Do not start timers, fetch files or execute tools from the educational diagrams.
- CH10 and CH11 visualization coverage is additive. The five existing interactive lessons remain supported and keep their separate lesson/quiz behavior.

## Decision Trace V2 · CH03, CH04 and CH08

The current lesson player owns `example` and `step`. Its source-grounded trace is a pure visual projection of that state: it cannot navigate, fetch, execute tools, change policy, or auto-advance. The existing four nodes, previous/next, opt-in playback and two-question practice remain unchanged. Stage selection in CH08's second retry round must stay within the second round.

- CH03 explains chosen versus skipped retrieval routes, an illustrative authorized candidate gate, and the *conditional* recovery route after insufficient evidence; changing the current frame updates which phases are checked/executed.
- CH04 maps its four teaching frames onto Gate 0 → Gates 1–2 → Gate 3 → Gates 4–5; conflicting/insufficient evidence explicitly blocks an unqualified claim and guides the safe decision.
- CH08 shows bounded Plan → Act → Observe → Check cycles, a conditional Retry edge only with remaining budget/permission, and distinct Verified Stop versus Incomplete Handoff.
- A trace contains no second live region: the existing lesson explanation remains the single polite step announcement. All meaningful states have textual labels, and visual structure remains legible with reduced motion and without color.
- Browser regression `npm run test:decision-traces` covers the three lessons at 390, 768, 1440 and 1728px, both locales and both themes. It verifies existing lab controls and practice still work.

## Article learning interactions

Chapters 03, 04, 06, 07 and 08 expose the existing interactive-diagram shortcut. Chapters 10 and 11 now offer an independent optional Visualization V2 scenario lab using the same Reader and Atlas deep-link contract. Chapter 06 adds three illustrative skill-routing scenarios with inspectable summary, instruction and reference layers; input or authorization failures never display a simulated tool execution. Chapter 07 adds preference, superseded-knowledge and permission-memory scenarios. These examples derive from the canonical chapters and do not issue model or file requests.

Each of the five diagrams has an optional two-question practice panel. Installed Collapsible, RadioGroup and Tabs primitives own disclosure and keyboard behavior. Checking an answer shows an explanation; selecting another answer clears stale feedback. Advancing or restarting clears the selection and focuses the question. Changing the diagram example resets practice. Answers remain in memory and are never persisted, logged or put in URLs. Theme, locale, direct section links, manual stepping and reduced-motion behavior follow the existing reader contract.

Run `npm run test:learning` for scenario boundaries, correct/incorrect feedback, keyboard behavior, canonical content preservation and automated accessibility at 390, 1440 and 1728 in both locales and themes. Reports default to `/tmp/handbook-learning-audit`; `LEARNING_AUDIT_DIR` overrides that path. `LEARNING_CAPTURE_SCRIPT` supplies the Better Design spacing capture script. `npm run test:concepts` covers the node diagrams, including chapter 07. Chapter 06 now uses `node evidence/bento/check.cjs` for its terminal simulator.



## Chapter 06 · Jev vs. Generative LLMs responsibility comparison

Figure 6.C4 is a Before/After **architectural responsibility** comparison, not two parallel execution timelines. The Before panel shows a single generative model used for planning, writing, routing, research, scoring, approval questions and completion/progress judgments. The After panel separates the Generative Model (open tasks), Jev (bounded typed probabilistic decisions), and Runtime (permission, budget, allowlist and execution enforcement).

The source-preserving fallback follows the same Before/After grouping without JavaScript. In the interactive rendition the three After responsibility cards are explicit keyboard-operable buttons with a visible selected state and `aria-pressed`. Selecting a role reveals a short, bilingual scope/boundary explanation in an `aria-live` region. Two Before arrows converge on Single LLM, and After arrows mark possible role handoffs, explicitly labeled as conditional bounded decision and runtime policy/permission gate. No flow playback controls or duration notices appear. The arrows remain static and the selected responsibility may emphasize its associated connector. The figure remains fully readable in reduced-motion mode. The arrows illustrate one possible architecture trace, not a universal Generative → Jev → Runtime chain. No network model call, claimed benchmark, role selection or animation grants authorization or executes tools.

The columns stay side by side only when the reading content width permits and stack responsively. At 390px there must be no horizontal page overflow; long role text must remain readable. Both locales and light/dark mode preserve this information hierarchy, and reduced-motion leaves all content/controls available.

Jev typed probabilities still require calibration, policy thresholds and evaluation; the Runtime remains the final authorization and side-effect boundary. The figure is not a statement that any model's judgments are automatically correct.


## Generated content boundary

Reader HTML and search payloads are generated presentation data. Internal authoring comments, separator markers, build notes, and other maintainer-only annotations are never user-facing content.

Verification-boundary blocks are rendered as native `details` disclosures with their existing title as `summary`. They are collapsed by default to preserve reading space, remain keyboard-operable, and reveal the complete authored boundary/source content when opened.

`scripts/sync-content.py` removes HTML comments before locale transformation and ignores BeautifulSoup `Comment` nodes during English conversion. Generated content must fail synchronization if a visible internal separator such as `===== CH7 =====` leaks into either locale.

Generated JSON under `public/content/` and the published copies under `web/site/content/` must not be hand-edited to hide a leak. Repair the derivation step and regenerate the outputs so preview and production remain equivalent.

## Verification and migration boundary

The reviewed Atlas is published as `web/site/`; its application source remains in `preview/handbook-custom`. Legacy chapter URLs redirect to the shared reader. Pull requests that touch the React preview or `DESIGN.md` must be compiled with `npm run build` before merging. Automatic GitHub Actions were retired, so validation is now run manually; older audit records do not substitute for a fresh build. A successful preview build verifies source compilation only; production-facing changes must also refresh `web/site/` with `npm run publish:web` before merge. Browser tests cover all chapters and representative theme/locale, desktop/mobile, keyboard, loading/error/retry and experimental-control states. Existing generated component registry demos are retained but are not imported into product routes.

The on-page contents never reserves a right-hand column. Reader places the visible chapter title and number in the slim topbar and keeps a screen-reader-only h1 within article content. There is no visible chapter cover or local action toolbar ahead of prose. On this page remains a direct topbar action that opens the existing section dialog with current-section highlighting, section jumps and return-to-top.

The Reader topbar shows chapter identity, optional current-section context, rounded reading percentage and the two-pixel progress trace. It remains **visible while reading** (no directional auto-hide) on desktop and phones. Reader does not resize its scroll owner or insert a second bar. At mobile widths (up to 767px), the fixed topbar is at most 48px high plus the progress hairline; the document reserves 56px of initial clearance. Its controls are a single row with minimum 44px hit targets, no horizontal overflow, and a truncated chapter title. The primary actions stay directly available: chapter menu, Search, On this page, locale and More. Secondary GitHub and dark-preset controls become **More** menu options on mobile only; their direct topbar variants remain visible on desktop. The mobile More menu must contain the actual three dark presets (Graphite / Ink black / Evergreen, localized), select them via the same persisted `preview-dark-preset` state and enable dark mode as on desktop; its GitHub link must open in a separate tab with `noopener noreferrer`. Focus mode retains an independently accessible topbar exit control, visually icon-sized on phones, as well as an exit in More.

Chapter pagination remains in the article flow, not a sticky footer: exactly one `.reader-bottom` landmark after chapter material with a chapter-count overline, previous/next *destination names* and real `chapterHref` links. On the first/last chapter, the missing neighbor is replaced by Back to Atlas. Both links use visible arrows/directions and full localized accessible destination names. The footer uses two columns at 320 / 390 / 768 / 1440px without horizontal scrolling; titles may wrap and keyboard focus must remain visible. Clicking a link changes the chapter while retaining the existing Reader routes, native browser Back and chapter loader.

**Regression evidence:** `evidence/reader-pagination-browser.cjs` checks 320/390/768/1440px, both locales/themes, 48px phone bar, visibility after deep scrolling, focus-mode exit, mobile secondary actions, exact previous/next destinations, link navigation and no horizontal overflow. Existing chapter source, scroll owner, headings, section anchors, labs, search, bookmark state, Notebook and Vercel build/publish path remain unchanged. Older directional-scroll logic notes further below are historical records and no longer the active Reader contract.

## Skills simulation controls

The supplied terminal reference replaces chapter 06's node-card player with a terminal/context split view. Scenario tabs reset running work and practice, and clear previous logs. Send starts an explicitly simulated 5-phase run; pause preserves the current transcript; single-step advances without a timer; reset clears the run. Missing inputs and authorization failures terminate at phase 2. A reset has no real-world effect. The component cancels stale timers on reset, scenario changes and unmount, and pauses when hidden or outside the visible reading area. Reduced motion keeps all controls usable and removes spatial animation.

Internal-context content is an authored teaching model, not private model reasoning. Input token and cache figures are illustrative; the cost panel states that there are no real API calls. Full original context-layer descriptions remain behind a disclosure. Archify overview thumbnails are height-limited visual previews rather than duplicate navigation links; a single explicit Open map action opens the viewer in a new tab and discloses that behavior. Full zoom, export and topology remain available in the viewer. Memory's English reader labels its current Chinese-only visualization explicitly.


## Structural decision labs · CH05 / CH09 / CH12

Each of these canonical Reader chapters exposes exactly one additional chapter-local, lazy-mounted `#concept-demo`. The main article and static figure remain independent; if the optional React module fails, source content remains readable. The selected scenario affects only this illustration and never calls real PDF, trace, SQL or order APIs.

- CH05 after `#fig-5-2`: three source-lineage scenarios reveal a valid source, a broken cross-page table, or unverified OCR/page provenance. A citation must resolve to the relevant source element and support the claim.
- CH09 after `#fig-9-1`: three failure diagnosis scenarios mark a first suspicious run child and its separate offline-test and release consequences. No aggregate score is fabricated.
- CH12 after the `#fde-framework` introduction: an editorial five-plane topology with seven named B1–B7 checks. Changes to canonical FDE semantics live in `handbook/chapters/12-fde-customer-delivery.md`, and the diagram states explicitly whether authorization or approval blocks the illustrative path.
- Use one native scenario selector per lab; selected state uses `aria-pressed`, changed decision is one polite announcement. Reader deep links wait until portal mounting. Keep keyboard navigation, no autoplay, and text state markers.
- Verify generated metadata from source, 12 registered Atlas labs, 4 viewport widths, both themes, both languages, 44px inputs, contrast and no clipping.
- **Deployment boundary:** Automatic GitHub Actions and Git-triggered Vercel deployments stay disabled; use the manual checks and publication workflow in `MAINTENANCE.md`.



## All-chapter Atlas Lab contract · context, permission, memory and data

Every canonical chapter 01–12 now exposes one primary `#concept-demo`, but **only** 01 and 02 are newly added here. Chapter 07 and Chapter 11 have their original primary lessons and a second optional `#concept-extension` mental-model view. New labs must be lazily mounted into existing authored sections and must not delete authored figures or canonical content.

- CH01 anchored to `#context-budget`: Context responsibility (not percentage), capacity vs effective use, omission of constraints during compression.
- CH02 anchored to `#fig-2-1`: Authorized candidate prefilter, retrieval, and resource-level ACL recheck under source permission churn.
- CH07 anchored to `#memory-promotion-compaction`: Write / Read lanes for consent, validity, conflict, scope; corrected explicit versions invalidate stale views.
- CH11 anchored to `#data-etl-cdc`: Independent source-order, ingestion-order and SCD2 sequence-domain tracks; dedup and delete semantics are conditional on the source contract.
- Keep a single primary deep-link target per chapter; custom ports are created with `createPortal` only after canonical content mounts. If an optional lab fails, article content remains readable.
- The Atlas metadata still originates in `src/atlas-metadata.json`, the generated `src/chapters.json` is an output of `sync-content`. Twelve authored `interactive=true` flags must survive regeneration.
- `test:mental-browser` covers 208 scenario state assertions at 390/768/1440/1728px, zh/en, light/dark. Automated source and Chromium tests do not replace manual screen-reader and touch review.
- Git integration to Vercel stays disabled (`web/vercel.json`); validation runs locally.



## Graph-first V3.3 Reader contracts

CH01/02/05/07/09/11/12 now use React HTML-node/SVG-edge graphs; existing canonical chapter text and earlier first-party Labs remain intact. CH07 and CH11 graph modules remain supplemental at `#concept-extension`; each canonical chapter has exactly one primary `#concept-demo`. Diagram modules are lazy portals anchored to source headings.

Each scenario must activate the **correct edges** and textual node states, not only a scenario caption. Browser tests check CH02 ACL vs fetch deny; CH05 document/structure failure forks; CH07 read denial and correction back-edge; CH09 culprit Trace Run and blocked release; CH11 source-arrival identity mapping and duplicate rejection; CH12 B4/B6 denied branches. CH01 output reserve is capacity, not an evidence flow merged into a prompt.

For dense graphs, nodes must remain absolutely aligned with SVG paths, including under Reader width changes; desktop CH02 flows horizontally, compact flows vertically. Offscreen and accessibility summaries must expose labeled nodes and directed connections even when the decorative SVG is hidden from assistive technology. The optional graph does not replace its underlying canonical article or create simulated execution.

Local scripts validate source contracts, TypeScript/Vite build, 144 CH05/09/12 scenario checks and 208 CH01/02/07/11 checks in Chromium across four widths, both locales and themes, with scoped WCAG audits on representative light/dark screenshots. Manual whole-page accessibility and visual reviews are separate. **No Vercel deployment** until intentionally released.



## Graph-first V3.4 interactions · CH03/04/06/08/10

The original `LessonPlayer` owns scenario/step/seek/autoplay/quiz for CH03, CH04 and CH08. CH06 is governed by its **separate SkillSimulator** with scenario tabs and phases (initial, discovery, access/input, instruction, reference, execution); the graph subscribes to that owner instead of inventing an independent LessonPlayer. All graphs are **pure views**, not a second step/state controller. CH10 retains its `PrefixGuide` scenario selector. A graph state must not claim a tool was actually run; examples are teaching simulations grounded in canonical chapter paragraphs.

- CH03: real route graph with only the chosen 2 of 5 paths selected once execution phase begins; candidate fusion feeds evidence gate.
- CH04: gates G0–G5 with blocked Claim Verification under CONFLICT and INSUFFICIENT; safe policy branches only at the policy frame.
- CH06: Skill Registry matching, input/access Gate, SKILL.md method loading and authorized Host tool simulation are distinct nodes, with CLARIFY / REJECT exits. Before discovery all nodes/edges are idle. At the boundary phase, rejected and incomplete requests mark the gate blocked and their incoming path active, while method/tool/verification remain idle. Reference loading never activates the tool; tool and result nodes activate only at the execution phase.
- CH08: round-aware node identities, selected retry back-edge only after permission/budget checks, separate verified STOP vs incomplete HANDOFF.
- CH10: cache key and namespace gate, exact-prefix matching, cached KV vs independent Prefill, still a Decode stage. Legacy token comparison and stages remain under disclosure.
- Preserve old technical detail panels in `<details>`, one chapter `#concept-demo`, evidence provenance notes and original optional quiz. Test expanded inspection as well as collapsed graph-first presentation.
- Browser test both node geometry and SVG `data-edge` semantics across 4 reader widths, 2 languages, both themes, reduced motion, keyboard; screenshots on compact zh/light and wide en/dark. A component axe scan is scoped, not whole-site certification.
- **Validation runs locally**; production-facing integration regenerates `web/site` with `publish:web` and retains manual Vercel deployment.



## CH04 parameterized selective-answering Lab · first implementation

The existing CH04 `#concept-demo` remains one mounted Reader destination. Its original evidence-gates graph, synchronized trace, selectable teaching examples, stage controls, decision outcomes, and two-question quiz remain available. After the takeaway, a secondary `#risk-coverage-lab` subsection exposes a controlled threshold experiment without creating another route or altering the canonical semantic chapter.

- The native range control moves in 0.01 increments from 0.00 through 1.00 and starts at 0.70; Reset restores 0.70. Changing it recomputes accepted cases, Coverage, Selective Risk and the current plot point immediately. It does not call a model, fetch, or change the canonical evidence gate.
- The fixed fixture has 8 authored illustrative records with a score and reference correctness label. The case ledger shows every record's current answer/abstain decision; wrong answers remain explicitly wrong rather than becoming corrected on abstention. The same filtered set drives all visual and text summaries.
- Coverage is accepted / 8. Selective Risk is incorrect among accepted / accepted. With no accepted cases, display an em dash and explicit “undefined” copy; never show 0%. The selected plot point is absent when risk is undefined. The historical operating-point curve is deterministic and is not a production ROC or calibrated guarantee.
- The copy is bilingual and explicitly separates invented values from calibrated confidence and observed production results. A separate boundary note preserves the other mandatory evidence/authorization/version/conflict/risk gates. Higher thresholds do not imply monotonically better risk.
- All status meanings are text-visible without color; SVG has a descriptive accessible label; input has a visible label, `aria-valuetext` and 44px hit area; Reset supports keyboard and visible focus; the metrics announce updates politely. The figure and case ledger stack on compact widths, with no page-level horizontal overflow. Reduced-motion users receive the same static-first teaching outcome.
- Module failure must be contained by the existing Reader `DiagramBoundary` without suppressing the canonical article. Direct Atlas `#concept-demo` navigation and original layout/scroll/reader-language contracts remain unchanged.

QA acceptance before merging: `npm run build`, `npm run test:concepts`, manual keyboard/locale/theme/reduced-motion checks at 390/768/1440/1728px, source and published asset parity via `npm run publish:web`, then Vercel Preview smoke test. Do not merge to `main` with an unrefreshed `web/site` build.

## CH03 + CH08 parameterized chapter experiments

The CH03 and CH08 lessons retain their one `#concept-demo`, original chapter and graph, step playback, per-example decision trace, two-question check, and source semantic boundaries. Their extra interactive teaching subsection appears after the takeaway and before the quiz. Neither introduces an Atlas route, new scroll owner, network call or new authority for handbook content.

**CH03 Route Budget / `#route-budget-lab`:**
- `#route-case-select` selects an authored query/evidence scenario; `#route-budget-range` sets at most 1–5 *planned* routes, not parallel execution. Five explicit retriever rows always appear (Exact, BM25, Dense, Graph, SQL) with human-readable selected/skipped/clarify state.
- The chosen route list is the deterministic top-N of the scenario's suitable routes; fixture-required evidence paths produce the covered/required count. Display unmet paths as unresolved; do not suggest they were retrieved or that a source is actually absent. Extra paths may increase planning breadth without adding necessary evidence.
- Missing referent always yields Clarify and zero planned routes. Every case displays authorization-first filtering and a conditional next action; selecting more paths never bypasses ACL, version, source recheck, RRF/rerank or CH04 evidence validation.
- No fabricated speed, cost, accuracy, recall or model confidence. Both the selected route list and evidence-requirement mapping are synthetic pedagogical cases.

**CH08 Agent Budget / `#agent-budget-lab`:**
- `#agent-case-select` selects first-pass success, targeted-retry recovery, persistent failure or blocked human approval. `#agent-attempt-limit` accepts 1–4 attempts; `#agent-work-budget` accepts 0–12 invented units. Each permitted attempt uses three artificial units; both remaining units and maximum attempts must allow the next complete attempt.
- The outcome shows verified STOP, incomplete HANDOFF or permission BLOCKED. The four-step ledger identifies failed, verified and never-executed attempts, with textual states. A success stops further attempts. Approval cannot be overridden by increasing either budget.
- Reset restores the recoverable scenario, three maximum attempts and nine units. Work units are not time, tokens or money; no tool call or external side effect is performed. Evidence, checkpoint reconciliation, authorization, bounded retries and external idempotency remain distinct.

**Acceptance:** native, visible label for each control; keyboard Home/End/Arrow and reset; polite live outcome; full bilingual copy; 44px control height and visible focus; no color-only status; no unbounded scrolling or mobile horizontal clipping. Regression: `evidence/parameterized-labs-browser.cjs` visits both routes at 390 / 768 / 1440 / 1728px with zh/en, light/dark, reduced motion; checks default and edge cases including Clarify, missing evidence, attempted/verified/unused retries, zero budget, approval block and reset. Preserve existing `test:concepts` coverage and verify the published `web/site` artifact before merging.

## V3.5 collapsed stage navigation

On the graph-first CH03, CH04 and CH08 Labs, the original `.concept-flow` four-stage button map is wrapped in `<details class="concept-step-inspector">` and **closed by default**. Readers may expand it to jump to a named stage; step highlights, round-two seek behavior, Next/Previous, reduced motion and quiz must remain unaffected. Native disclosure semantics give keyboard and screen reader access. The GraphCanvas is the only default visual topology; the old detailed evidence pane remains another intentionally optional inspection layer.

CH03 compact GraphCanvas stage height is 925px, down from 1140px in V3.4, without hiding any Retriever or the candidate-fusion/evidence nodes. Automated browser test asserts this limit and samples active SVG route/candidate connectors to verify they do not intersect unrelated HTML nodes. CH04/06/10 tail whitespace is reduced. Keep all source-authored chapter figures and optional standalone linked maps as separate evidence/deep-zoom content.


## Editorial clarity refinement · presentation-only (scope B)

The 2026-11-05 user decision adopts the "quiet, clear, fluid" direction of `learn-inference.com` for the **Atlas home and Reader only**, explicitly **without a book cover**. This section records the behavioral boundary: nothing in this refinement changes capability, state, routing, persistence, or content ownership.

- **No cover.** Atlas and Reader must not render a book cover, cover column, mock spine, cover shadow, or a decorative "try it" widget that looks like a live system. There is no new interactive demo on the home surface.
- **No borrowed branding.** No third-party logo, logomark, wordmark or icon arrangement may be copied, traced or approximated in the prototype, the product, or generated assets. Review screenshots of a reference site are comparison evidence only and must never be reused as product artwork. The home wordmark is typographic; the sidebar's licensed Iconoir `BookIcon` is a generic library glyph and stays as-is.
- **Unchanged capabilities.** `#home` / `#home/all` / `#home/saved` / `#concept/{slug}` / `#map` / `#read/{slug}/{section}` routes, native Back, chapter loading with AbortController and retry, per-chapter article data, unknown-chapter recovery, search dialog and IME-safe keyboard ranking, bookmarks and their shared live region, locale/theme/text-size/focus-reading persistence, section dialog, mobile navigation dialog, previous/next navigation, all twelve Labs and every decision/graph/terminal simulator keep their existing behavior.
- **Unchanged DOM contracts.** `.atlas-group` (4), `.atlas-node-row` (12), `.atlas-lab-link` (12), `.atlas-concept-index a` (8), `.header-search`, `.reader-top-title`, `.reader-top-section`, `.workspace.reader-chrome-hidden`, `.reader-bottom`, `.chapter-body` as the scroll owner and its 17px enlarged size, `.canonical-content`, and the screen-reader-only chapter `h1` remain present with the same semantics. The direction-aware 64px/104px/450ms chrome thresholds are not touched.
- **Layout change, not navigation change.** The desktop left navigation stays collapsible via the existing top-left button and `sidebar-collapsed` preference; the Atlas inspector moves from a persistent right rail into the page flow below the spine. On phones the workspace remains one scrolling page and the sidebar remains a dialog. Focus reading still hides persistent chrome without removing content.
- **Typography change, not content change.** The editorial serif applies only to the Atlas introduction and Reader prose/headings. Technical surfaces (tables, code, callouts, figures, labs, graph canvases, simulators) keep their sans/mono metrics so the geometry-sensitive browser audits still describe the same rendered nodes and edges.
- **Accessibility floor is unchanged or better.** 44px minimum touch targets, 4.5:1 ordinary text and 3:1 large text in both themes, visible focus, `prefers-reduced-motion`, zero page-level horizontal overflow at 390/768/1440/1728px, and both locales. The bright `--signal` green is never used behind text.
- **Verification.** `npm run build`, `test:ui`, `test:a11y`, `test:learning`, `test:concepts`, `node web/validate.mjs`, plus a four-width / two-theme / two-locale browser pass. `publish:web` remains the only way to refresh `web/site`; hosted deployment stays manual.

## Dark surface presets · presentation-only (2026-11-05)

User feedback: "我不是很喜欢背景的墨绿色 要不改成codex的深灰色，或者允许用户选择几个预设的颜色，黑色，墨绿，深灰等". The evergreen dark background is replaced by a neutral gray default, and three dark surfaces become user-selectable. This is a **presentation preference**, not a new capability.

- **Unchanged behavior.** The light/dark toggle, `preview-theme` storage, locale / text-size / focus-reading persistence, all routes, chapter loading with AbortController and retry, search, bookmarks, Notebook, Concept pages, all twelve Labs and every simulator keep their existing behavior. No new route, dialog flow, navigation state or content surface is introduced.
- **New preference.** `preview-dark-preset` accepts `graphite` (default), `ink`, `forest`; an invalid or missing value falls back to `graphite`. `data-dark-preset` is applied to `<html>` before first paint and on every change. Light mode ignores it entirely (`--page` stays `#ffffff`).
- **Control contract.** Exactly one `.appearance-picker` remains in the topbar DOM on every route, including Reader. Its visible `details/summary` ring swatch, three `aria-pressed` buttons, 44px targets and Escape behavior are preserved outside the compact mobile Reader. At Reader widths ≤767px the direct picker is visually hidden to keep the 48px header legible; the native More menu exposes all three equivalent preset choices with accessible labels and uses the same persisted state. Choosing any preset while in light mode switches to dark; the existing theme toggle is unchanged.
- **DOM contracts unchanged.** `.atlas-group` (4), `.atlas-node-row` (12), `.atlas-lab-link` (12), `.atlas-concept-index a` (8), `.header-search`, `.reader-top-title`, `.reader-top-section`, `.workspace.reader-chrome-hidden`, `.reader-bottom`, `.chapter-body` as scroll owner with its 17px enlarged size, `.canonical-content` and the screen-reader-only chapter `h1` keep their counts and semantics.
- **Accessibility floor unchanged or better.** 44px targets, 4.5:1 ordinary text and 3:1 large text in every preset and both locales, visible focus, zero page-level horizontal overflow at 390/768/1440/1728px, `prefers-reduced-motion`.
- **Verification.** `npm run build`, `test:ui`, `test:a11y`, `test:learning`, `test:concepts`, `node web/validate.mjs`, the 32-state browser sweep, and a 3-preset × 4-width sweep covering overflow, page errors, applied tokens, picker interaction, persistence and ESC.

## Canonical grid guard · layout bug fix (2026-11-05)

A screenshot of `#read/05-document-pdf-rag` showed the provenance Lab squeezed into a zero-width grid track. This is a **layout/mounting correction**, not a new capability or a content change.

- **Mounting contract.** `StructuralGuide` inserts `.structural-guide-slot` after the outermost grid ancestor of its anchor, bounded by `.canonical-content` / `.chapter-body`. The slot is therefore a full-width child of `section.ch` on CH05, CH09 and CH12 alike; it must never be a grid item. Anchors, chapter detection (`slug.slice(0, 2)`), the `/concept-demo` deep link, portal rendering, `onReady`, cleanup on unmount and locale-driven re-mounting are unchanged.
- **Unchanged Lab behavior.** `#concept-demo.structural-guide` keeps its id, headings, `struct-scenarios` buttons, CLAIM → SOURCE graph, captions, focus behavior, all three chapter variants and the existing browser assertions. Only the slot's parent and the containing grid's column count change.
- **Unchanged DOM contracts.** `.atlas-group` (4), `.atlas-node-row` (12), `.atlas-lab-link` (12), `.atlas-concept-index a` (8), `.header-search`, `.reader-top-title`, `.reader-top-section`, `.workspace.reader-chrome-hidden`, `.reader-bottom`, `.chapter-body` as scroll owner with its 17px enlarged size, `.canonical-content` and the screen-reader-only chapter `h1` keep their counts and semantics. No route, storage key, dialog, search, bookmark, Notebook or simulator behavior changes.
- **Accessibility floor unchanged or better.** 44px targets, 4.5:1 ordinary text, visible focus on the deep-linked Lab, zero page-level horizontal overflow at 390/768/1440/1728px in both themes and locales.
- **Verification.** `npm run build`, `test:ui`, `test:a11y` (28 routes / 0 violations), `test:learning`, `test:concepts`, `full-sweep.cjs`, `node web/validate.mjs`, plus CH05/CH07 browser measurement of grid tracks, slot width and `.chapter-body` scroll width.

## Similar-bug sweep · presentation-only layout fixes (2026-11-05)

User feedback: two screenshots with "fix similar bugs" (CH06 YAML grid and the dark simulator completion state). Every change below is geometry or class isolation; **no capability, content, route or state changes**.

- **Unchanged behavior.** The light/dark toggle, `preview-theme` / `preview-locale` / text-size / focus-reading / `preview-dark-preset` storage, locale switching, chapter loading with AbortController and retry, search, bookmarks, Notebook, Concept pages, all twelve Labs, all simulator scenarios/steps/controls, structural guides and their `/concept-demo` deep links keep their existing behavior. **No new storage key, route, dialog, control or DOM contract** is introduced.
- **Simulator contract unchanged.** `.sim-log` / `.sim-message` state modifiers (`user` / `process` / `result` / `blocked` / `tools` / `instruction` / `reference`), `.sim-json`, step count, reset, autoplay, pause, permissions, assets, metrics and knowledge checks keep their ids, roles and accessible names. Only their CSS `display` is insulated from the unrelated global `.result` search-result rule; the compact layout's breakpoint and the caption's reserved height change. Heights are now stable across all three scenarios and all nine verified steps at 390 / 1154 / 1440 / 1728px in both locales.
- **Layout contracts.** Wide plates remain top-level only (see `Canonical grid guard`); authored grids containing a plate stack to one column at the `60rem` container breakpoint; `.document-grid` stacks at the `40rem` container breakpoint instead of a `640px` viewport media query. `.chapter-body` remains the scroll owner and `container-type:inline-size` context.
- **DOM contracts unchanged.** `.atlas-group` (4), `.atlas-node-row` (12), `.atlas-lab-link` (12), `.atlas-concept-index a` (8), `.header-search`, `.reader-top-title`, `.reader-top-section`, `.workspace.reader-chrome-hidden`, `.reader-bottom`, `.canonical-content` and the screen-reader-only chapter `h1` keep their counts and semantics.
- **Accessibility floor unchanged or better.** 44px targets, 4.5:1 ordinary text, visible focus, `prefers-reduced-motion`, zero page-level horizontal overflow at 390/768/1024/1280/1440/1728px, and `test:a11y` 28 routes / 0 violations.
- **Verification.** `npm run build`, `test:ui`, `test:learning`, `test:concepts`, `test:a11y`, `test:structure-browser`, `test:simulator-layout`, the 144-state DOM/CSS matrix (before/after comparison against the pre-change build), `node web/validate.mjs`, `node web/sync-diagram-csp.mjs` and a non-destructive `web/site` sync with `content/*.json` preserved.

## Readable tables and code · presentation-only refinement (2026-11-05)

User feedback: two CH05 screenshots with "尽量减少类似的横向滚动 提高可读性". Every change below is CSS geometry only; **no capability, content, route, state or DOM change**.

- **Unchanged behavior.** The light/dark toggle, `preview-theme` / `preview-locale` / text-size / focus-reading / `preview-dark-preset` storage, locale switching, chapter loading with AbortController and retry, search, bookmarks, Notebook, Concept pages, all twelve Labs, all simulator scenarios / steps / controls, structural guides and their `/concept-demo` deep links keep their existing behavior. **No new storage key, route, dialog, control or DOM contract** is introduced; no chapter HTML, JSON or generated `content-base.css` is edited.
- **Reading geometry.** Top-level `.tsc` / `.table-scroll` / `.fig` wrappers are the wide plate; their inner `.tw` is not. Authored grids directly containing a table stack to one column at every width. Tables with at most four columns become fluid and wrap; five-plus-column diagram matrices keep their authored horizontal scroll. Prose `pre` wraps; diagram / simulator `pre` keeps its fixed line geometry. Compact table type applies below the `40rem` container breakpoint; first-column identifiers stop wrapping above it. `.chapter-body` remains the scroll owner and `container-type:inline-size` context.
- **Accessibility floor unchanged or better.** The `role="region"` / `aria-label="可横向滚动的对比表"` / `tabindex="0"` scroll wrappers stay in the DOM and stay keyboard-focusable; for 2–4 column tables they no longer need to scroll, so content is fully visible without pointer or keyboard horizontal navigation. Text wraps, never clamps, truncates or hides. `test:a11y` 28 routes / 0 violations; 44px targets, visible focus, `prefers-reduced-motion`, zero page-level horizontal overflow at 390/768/1024/1280/1440/1728px.
- **DOM contracts unchanged.** `.atlas-group` (4), `.atlas-node-row` (12), `.atlas-lab-link` (12), `.atlas-concept-index a` (8), `.header-search`, `.reader-top-title`, `.reader-top-section`, `.workspace.reader-chrome-hidden`, `.reader-bottom`, `.canonical-content` and the screen-reader-only chapter `h1` keep their counts and semantics.
- **Verification.** `npm run build`, `test:ui`, `test:a11y`, `test:learning`, `test:concepts`, `test:structure-browser`, `test:simulator-layout`, `node web/validate.mjs`, the 144-state horizontal-scroll matrix (`792 → 14`), the 144-state similar-bug matrix (unchanged `bad 6`, all pre-existing authored narrow cards), and a non-destructive `web/site` sync preserving `content/*.json`.

## Atlas default-selection semantics · behavior correction (2026-11-05)

A user asked why chapter 03's marker glowed green on a fresh home page and chose option "1": keep the Inspector's default chapter, remove the implied selection. This is a **state-semantics correction**, not a new capability, layout or content change.

- **Initial state.** `selectedAtlasSlug` starts as `""`. On first paint there is no `.atlas-node-row.is-selected`, no `.atlas-inspect-toggle[aria-pressed="true"]`, and no green marker. `defaultInspectSlug` (chapter 03) is only the Inspector's **preview fallback**: `#atlas-inspector-selected` still shows `INSPECT / 03` with the same title, decision, failure note, related chapters and chapter link. All Inspector content is unchanged on first paint.
- **Real selection.** Focusing a node link (`onFocus`) or clicking its Inspect control (`inspectAtlas`) sets `selectedAtlasSlug`, which then drives `.is-selected`, `aria-pressed="true"`, the point-sized green marker and the Inspector content. On stacked layouts an explicit Inspect still scrolls the Inspector into view and moves focus to `tabIndex={-1}` `#atlas-inspector-selected`. Hover and `:focus-visible` keep the existing transient green affordance but do not set selection and do not change the Inspector.
- **No persistence change.** Selection remains in-memory React state; no new or changed storage key (`preview-theme`, `preview-locale`, `preview-dark-preset`, bookmarks and text size are untouched). A reload returns to the unselected state. No progress, bookmark or last-read semantics are introduced.
- **Unchanged behavior and DOM.** `.atlas-group` (4), `.atlas-node-row` (12), `.atlas-lab-link` (12), `.atlas-concept-index a` (8), `.header-search`, `.reader-top-title`, `.reader-top-section`, `.workspace.reader-chrome-hidden`, `.reader-bottom`, `.canonical-content`, all twelve Labs, the simulator, search, bookmarks, Notebook, Concept pages, routes and `/concept-demo` deep links keep their counts and semantics. Generated `content-base.css`, chapter HTML / JSON, dark presets and the readable-tables geometry are untouched.
- **Accessibility floor unchanged or better.** `aria-pressed` now matches real state on all twelve Inspect controls (all `false` on first paint); 44px targets, 4.5:1 ordinary text, visible focus, `prefers-reduced-motion`, `test:a11y` 28 routes / 0 violations, zero page-level horizontal overflow at 390 / 768 / 1024 / 1280 / 1440 / 1728px.
- **Verification.** `npm run build`, all six evidence suites, `scripts/validate-atlas.mjs`, `node web/validate.mjs`, the 144-state horizontal-scroll matrix (`14`) and similar-bug matrix (`bad 6`), a three-state fresh / hover / Inspect check on the dev build and on `web/site`, and a non-destructive production sync preserving `content/*.json`.

## Readable cards & stacked tables · presentation-only enhancement (2026-11-05)

Two CH02 screenshots ("可读性很差") led to a Reader-only display enhancement. This is **not** a capability, content, route or state change.

- **Unchanged behavior.** Theme / locale / text-size / focus-reading / dark-preset storage, chapter loading with AbortController and retry, search, bookmarks, Notebook, Concept pages, all twelve Labs, simulator scenarios / steps / controls, structural guides, `/concept-demo` deep links, routes and dialogs keep their behavior. **No new storage key, route, dialog, control or DOM contract** is introduced; no chapter HTML / JSON or generated `content-base.css` is edited.
- **Reader table annotation.** After `html` is memoized, a `useEffect` walks `.canonical-content` tables, skips genuine diagram matrices (`.dg2-matrix`, `.dg2-pyramid`, `.bfs-g3` … `.bfs-g6`, `.cv-stats`), adds `.stack-table` to tables that have `thead > th`, and copies each header's `textContent` into the matching `td[data-label]`. It is idempotent (`!cell.getAttribute("data-label")`), re-runs on `[html, data, en, chapter.slug]`, and adds no persistent state. `.interp-matrix` is a scrollable comparison wrapper, not a diagram, so it is deliberately **not** excluded.
- **Layout contracts.** `.chapter-body` remains the scroll owner and the `container-type:inline-size` context. Card grids wrap with `auto-fit` inside the measure and restore authored 5 / 4 / 3 tracks at `@container (min-width: 60rem)`; plain comparison tables become hairline-separated labeled records at `@container (max-width: 38rem)` and return to normal tables above it. The first-column identifier guard applies only to `.tsc.interp-matrix` comparison tables above `38rem`, so diagram tables with fixed `min-width` keep their authored scroll behavior.
- **Accessibility floor unchanged or better.** Stacked records keep every cell visible without horizontal pointer or keyboard navigation; `th` text becomes visible `data-label` field captions, so no meaning is lost when `thead` is `display:none`. `test:a11y` 28 routes / 0 violations; 44px targets, 4.5:1 ordinary text, visible focus, `prefers-reduced-motion`, zero page-level horizontal overflow at 390 / 768 / 1024 / 1280 / 1440 / 1728px.
- **DOM contracts unchanged.** `.atlas-group` (4), `.atlas-node-row` (12), `.atlas-lab-link` (12), `.atlas-concept-index a` (8), `.header-search`, `.reader-top-title`, `.reader-top-section`, `.workspace.reader-chrome-hidden`, `.reader-bottom`, `.canonical-content` and the screen-reader-only chapter `h1` keep their counts and semantics.
- **Verification.** `npm run build`, all six evidence suites, `node web/validate.mjs`, CH02 geometry at four widths, the 144-state horizontal-scroll matrix (`10`) and similar-bug matrix (`bad 6`), `FINAL_FAIL=0`, plus a non-destructive `web/site` sync preserving `content/*.json`.

## Original favicon · head-only asset (2026-11-05)

A user asked to add an icon to the website. This is a **document-head asset addition only**; it introduces no capability, interaction, state or reader behavior change.

- **Unchanged behavior.** Theme / locale / text-size / focus-reading / dark-preset storage, chapter loading with AbortController and retry, search, bookmarks, Notebook, Concept pages, all twelve Labs, simulator scenarios / steps / controls, structural guides, `/concept-demo` deep links, routes, dialogs and the Reader's `.canonical-content` keep their behavior. **No new storage key, route, dialog, control, script or body DOM contract** is introduced; no chapter HTML / JSON, generated `content-base.css`, React source or stylesheet is edited.
- **Head contract.** The Vite entry document gains exactly one `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` after `<title>`. `public/favicon.svg` is copied unchanged to the build root and to `web/site/`. The icon is an original Knowledge Spine mark documented in `DESIGN.md` before the asset was created; no third-party mark is reused. The SVG contains no script, no external reference and no unscoped CSS (`svg.favicon-mark` scope only), so it cannot affect the application at runtime.
- **No full icon suite.** No ICO, `apple-touch-icon`, web manifest or `theme-color` meta in this pass. Browsers that do not read SVG icons fall back to their default tab glyph; that is an accepted, documented limitation, not a broken state.
- **Accessibility floor unchanged.** The SVG carries a `<title>` as its accessible name; 44px targets, 4.5:1 ordinary text, visible focus, `prefers-reduced-motion` and zero page-level horizontal overflow are unchanged. `test:a11y` 28 routes / 0 violations.
- **Verification.** `npm run build` (JS/CSS hashes unchanged), `test:ui` 17 groups, `test:a11y` 28 routes / 0 violations, `node web/validate.mjs` PASS, and a light/dark browser smoke check confirming the browser requests `/favicon.svg` with `200 image/svg+xml`, `pageOver 0`, 0 page errors. `diff -rq dist web/site` IDENTICAL; `content/*.json` unchanged.
