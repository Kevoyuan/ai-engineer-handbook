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

## Content and lookup

Canonical technical meanings, text, diagram topology, node order, and bilingual labels remain owned by the source handbook. The preview derives complete chapter and registered fragment content. Tables remain tables and horizontal comparison/code scrolling is keyboard reachable. Section search is a local transient dialog, so its editing query is intentionally not persisted in the URL; selected results are shareable chapter/section routes.

Search supports IME text entry; composition never activates Enter navigation or shortcuts. ArrowDown enters the result links; Tab navigates normally and Enter opens a result. Results use deterministic local relevance ranking. Concept entities whose current or alternate-language name matches the query appear before section results; exact concept-name matches outrank concept prefixes and contains matches. Section ranking then uses exact and prefix title matches above title contains, which outrank body matches; the active locale receives a modest ranking preference without hiding valid cross-language matches. Snippets come from the language that actually matched when the active-language body does not contain the query. The first result is identified as the best match, and visible match text may be highlighted without changing the underlying result text. Search has loading, failure/retry, no-results and clear states. Search data is lazy-loaded; it does not issue remote requests on each keystroke.

## Reading preferences and bookmarks

Locale, theme, text size and bookmarks are saved only in the current browser. Bookmarks are immediate and reversible, with one shared status live region. If persistence is unavailable, the current visit remains usable and the storage issue is stated honestly. No account/sync promise is made. Reading positions are neither saved nor restored; the directory has no continue-reading entry.

Focus reading hides persistent sidebar/table-of-contents chrome and preserves the same content, search, page navigation and reading controls. It has an explicit exit button in the Reader controls and a second always-reachable exit action in the top bar while focus mode is active. Chapters open at the beginning unless the URL specifies a section destination.

## Accessibility and responsive behavior

Search, mobile navigation, and mobile section navigation use the installed Radix Dialog owner with names, Escape, focus trapping, and focus restoration. Buttons and links retain native roles. Current chapter/section are exposed with aria-current; bookmark/focus selection use aria-pressed. An explicit skip link reaches the content region.

Scrollbars retain their gutters while their thumbs stay transparent at rest. Scrolling reveals the thumb for one second; pointer hover and keyboard focus also reveal it. Forced-colors retains native visible scrollbars. The desktop sidebar can be hidden and restored using the top-left navigation button; the local collapsed preference does not affect the mobile navigation dialog. Reduced motion suppresses animation. Dark mode uses neutral reading surfaces; filled-button text comes from the semantic on-primary token. On phones the workspace is one scrolling page: toolbar, Atlas introduction, search, Knowledge Spine, Notebook, and architecture entry all scroll together. Reader headings and controls also scroll with the article; section jumps use the workspace as their scroll owner. Desktop keeps its bounded content panes. At narrow widths the sidebar becomes a navigation dialog, the TOC is a section dialog at every width, comparison tables scroll internally, and complex experiment panels stack at their available content width.

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

The topbar shows chapter identity, optional current-section context, rounded reading percentage, and the two-pixel progress trace. Search, section contents, locale switching and GitHub are direct topbar actions. Font sizing, Focus, chapter bookmark, interactive diagram and theme remain in the overflow menu. Locale and GitHub must not also be repeated in the menu. Focus mode also retains a direct Exit focus action in the bar.

Downward movement must accumulate a meaningful distance before hiding the bar; upward movement reveals it with a separate threshold. Reversal only changes visibility after sustained intent (currently 64px downward / 104px upward), with a 450ms transition cooldown; small reversals, inertial jitter and pointer motion already at the screen edge do not repeatedly toggle chrome. The initial chapter clearance scrolls away with the document; desktop and mobile topbars overlay a **stable scroll owner** and never animate height, flex-basis or content padding. Chrome transitions use only transform/opacity, so hiding it does not resize the document or create synthetic scroll reversals. Keyboard Tab and top-edge pointer motion reveal it; open menus/dialogs keep it visible. Programmatic section jumps reset directional intent and reveal the topbar. Reduced motion removes transitions, while routes, deep links, local preferences, focus and dialogs continue working.


## Skills simulation controls

The supplied terminal reference replaces chapter 06's node-card player with a terminal/context split view. Scenario tabs reset running work and practice, and clear previous logs. Send starts an explicitly simulated 5-phase run; pause preserves the current transcript; single-step advances without a timer; reset clears the run. Missing inputs and authorization failures terminate at phase 2. A reset has no real-world effect. The component cancels stale timers on reset, scenario changes and unmount, and pauses when hidden or outside the visible reading area. Reduced motion keeps all controls usable and removes spatial animation.

Internal-context content is an authored teaching model, not private model reasoning. Input token and cache figures are illustrative; the cost panel states that there are no real API calls. Full original context-layer descriptions remain behind a disclosure. Archify overview thumbnails are height-limited visual previews rather than duplicate navigation links; a single explicit Open map action opens the viewer in a new tab and discloses that behavior. Full zoom, export and topology remain available in the viewer. Memory's English reader labels its current Chinese-only visualization explicitly.


## Structural decision labs · CH05 / CH09 / CH12

Each of these canonical Reader chapters exposes exactly one additional chapter-local, lazy-mounted `#concept-demo`. The main article and static figure remain independent; if the optional React module fails, source content remains readable. The selected scenario affects only this illustration and never calls real PDF, trace, SQL or order APIs.

- CH05 after `#fig-5-2`: three source-lineage scenarios reveal a valid source, a broken cross-page table, or unverified OCR/page provenance. A citation must resolve to the relevant source element and support the claim.
- CH09 after `#fig-9-1`: three failure diagnosis scenarios mark a first suspicious run child and its separate offline-test and release consequences. No aggregate score is fabricated.
- CH12 after the `#fde-framework` introduction: an editorial five-plane topology with seven named B1–B7 checks. Changes to canonical FDE semantics live in `handbook/chapters/12-fde-customer-delivery.md`, and the diagram states explicitly whether authorization or approval blocks the illustrative path.
- Use one native scenario selector per lab; selected state uses `aria-pressed`, changed decision is one polite announcement. Reader deep links wait until portal mounting. Keep keyboard navigation, no autoplay, and text state markers.
- Verify generated metadata from source, 10 registered Atlas labs, 4 viewport widths, both themes, both languages, 44px inputs, contrast and no clipping.
- **Deployment boundary:** Git automatic Vercel deployment stays disabled; building in GitHub CI is not a Vercel publication.



## All-chapter Atlas Lab contract · context, permission, memory and data

Every canonical chapter 01–12 now exposes one primary `#concept-demo`, but **only** 01 and 02 are newly added here. Chapter 07 and Chapter 11 have their original primary lessons and a second optional `#concept-extension` mental-model view. New labs must be lazily mounted into existing authored sections and must not delete authored figures or canonical content.

- CH01 anchored to `#context-budget`: Context responsibility (not percentage), capacity vs effective use, omission of constraints during compression.
- CH02 anchored to `#fig-2-1`: Authorized candidate prefilter, retrieval, and resource-level ACL recheck under source permission churn.
- CH07 anchored to `#memory-promotion-compaction`: Write / Read lanes for consent, validity, conflict, scope; corrected explicit versions invalidate stale views.
- CH11 anchored to `#data-etl-cdc`: Independent source-order, ingestion-order and SCD2 sequence-domain tracks; dedup and delete semantics are conditional on the source contract.
- Keep a single primary deep-link target per chapter; custom ports are created with `createPortal` only after canonical content mounts. If an optional lab fails, article content remains readable.
- The Atlas metadata still originates in `src/atlas-metadata.json`, the generated `src/chapters.json` is an output of `sync-content`. Twelve authored `interactive=true` flags must survive regeneration.
- `test:mental-browser` covers 208 scenario state assertions at 390/768/1440/1728px, zh/en, light/dark. Automated source and Chromium tests do not replace manual screen-reader and touch review.
- Git integration to Vercel stays disabled (`web/vercel.json`); CI is *not* a release workflow.

