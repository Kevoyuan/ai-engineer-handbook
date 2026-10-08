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

Every chapter uses the same reader. Previous/next chapter navigation lives at the end of the scrollable article and does not reserve a fixed bottom bar. Menu links, directory links, map links, search results and previous/next navigation enter this reader. All 10 chapters are available; no ordinary reading action routes to the legacy shell. Article data loads per chapter with AbortController cancellation and a localized pending/error/retry region. An unknown chapter has a recovery screen and a contents link.

Architecture navigation scrolls to either complete diagram within the page. Related-chapter links inside system modules open the shared chapter reader. Architecture content and topology are derived from the original `web/index.html` via `scripts/sync-architecture.mjs`.

## Atlas, Notebook, and system orientation

Atlas is the primary home surface. It presents all four engineering layers in one Knowledge Spine: Model, Retrieval & RAG, Agent Engineering, and Evaluation & Production. Chapters are represented as connected nodes rather than isolated cards. Interactive chapters may expose a quiet lab affordance, but the chapter link remains the primary action. Atlas also exposes a compact Concept Index whose links open first-class concept routes.

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

## Article learning interactions

Chapters 03, 04, 06, 07 and 08 expose the existing interactive-diagram shortcut. Chapter 06 adds three illustrative skill-routing scenarios with inspectable summary, instruction and reference layers; input or authorization failures never display a simulated tool execution. Chapter 07 adds preference, superseded-knowledge and permission-memory scenarios. These examples derive from the canonical chapters and do not issue model or file requests.

Each of the five diagrams has an optional two-question practice panel. Installed Collapsible, RadioGroup and Tabs primitives own disclosure and keyboard behavior. Checking an answer shows an explanation; selecting another answer clears stale feedback. Advancing or restarting clears the selection and focuses the question. Changing the diagram example resets practice. Answers remain in memory and are never persisted, logged or put in URLs. Theme, locale, direct section links, manual stepping and reduced-motion behavior follow the existing reader contract.

Run `npm run test:learning` for scenario boundaries, correct/incorrect feedback, keyboard behavior, canonical content preservation and automated accessibility at 390, 1440 and 1728 in both locales and themes. Reports default to `/tmp/handbook-learning-audit`; `LEARNING_AUDIT_DIR` overrides that path. `LEARNING_CAPTURE_SCRIPT` supplies the Better Design spacing capture script. `npm run test:concepts` covers the node diagrams, including chapter 07. Chapter 06 now uses `node evidence/bento/check.cjs` for its terminal simulator.



## Chapter 06 · Paired Jev / Generative LLM comparison

The paired flows compare the same task from shared input to the shared Runtime authorization gate. Path A shows prompted structured generation, sequential token decoding, result parsing/validation, and decision recovery. Path B shows predefined typed questions, independent decision sampling in one query, typed values/probabilities, and software thresholding. It is an illustrative process comparison, not an independent latency or accuracy benchmark.

The paired reader diagram remains visible without JavaScript through the registered fragment's static comparison. With the optional React player loaded, the replacement is a two-column, five-stage comparison. Playback starts only on explicit reader action and advances one stage every 2.8 seconds. Pause, replay, previous, next and direct stage selection use named 44px controls. The selected stage and connector change with finite 200ms visual feedback; illustrative sequential LLM tokens reveal one after another while independent Jev fields appear together. No unbounded animation runs.

Playback stops at the final stage, on route unmount, when the document is hidden, or when the comparison leaves the viewport. Reduced-motion preference disables autoplay and spatial transitions but preserves all stages and manual step controls. Manual explanations are announced via a polite status region; automatic playback does not repeatedly announce intermediate stages. The two columns stack in reading panes narrower than 830px and must not cause page-level overflow at 390px. Bilingual reader state comes from the existing locale contract.

The final gate is deterministic Runtime authorization, policy and host execution on both paths. Jev parallelism applies only to independent decisions over the same state, never to true upstream/downstream dependencies. The demo makes no external model calls, reports no measured speedup and does not turn model confidence into authorization.


## Generated content boundary

Reader HTML and search payloads are generated presentation data. Internal authoring comments, separator markers, build notes, and other maintainer-only annotations are never user-facing content.

Verification-boundary blocks are rendered as native `details` disclosures with their existing title as `summary`. They are collapsed by default to preserve reading space, remain keyboard-operable, and reveal the complete authored boundary/source content when opened.

`scripts/sync-content.py` removes HTML comments before locale transformation and ignores BeautifulSoup `Comment` nodes during English conversion. Generated content must fail synchronization if a visible internal separator such as `===== CH7 =====` leaks into either locale.

Generated JSON under `public/content/` and the published copies under `web/site/content/` must not be hand-edited to hide a leak. Repair the derivation step and regenerate the outputs so preview and production remain equivalent.

## Verification and migration boundary

The reviewed Atlas is published as `web/site/`; its application source remains in `preview/handbook-custom`. Legacy chapter URLs redirect to the shared reader. Pull requests that touch the React preview or `DESIGN.md` must compile the preview through `.github/workflows/preview-build.yml`; the older repository audits do not substitute for this build gate. A successful preview build verifies source compilation only; production-facing changes must also refresh `web/site/` with `npm run publish:web` before merge. Browser tests cover all chapters and representative theme/locale, desktop/mobile, keyboard, loading/error/retry and experimental-control states. Existing generated component registry demos are retained but are not imported into product routes.

The on-page contents never reserves a right-hand column. Reader places the visible chapter title and number in the slim topbar and keeps a screen-reader-only h1 within article content. There is no visible chapter cover or local action toolbar ahead of prose. On this page remains a direct topbar action that opens the existing section dialog with current-section highlighting, section jumps and return-to-top.

The topbar shows chapter identity, optional current-section context, rounded reading percentage, and the two-pixel progress trace. Search and section contents are direct actions; font sizing, Focus, chapter bookmark, interactive diagram, theme, locale, and GitHub are accessible through the overflow menu. Focus mode also retains a direct Exit focus action in the bar.

Scrolling down by a meaningful distance hides the bar once outside the top region; scrolling up reveals it. Small scroll changes do not toggle chrome. Keyboard Tab and pointer entry at the upper screen edge reveal it; opening Reader menus or dialogs keeps it visible. Desktop returns topbar height to the reader pane; mobile uses a fixed overlay rather than changing the scrolling workspace's layout height. Reduced-motion removes show/hide animation; routes, deep links, local preferences, keyboard focus, and dialogs continue working.


## Skills simulation controls

The supplied terminal reference replaces chapter 06's node-card player with a terminal/context split view. Scenario tabs reset running work and practice, and clear previous logs. Send starts an explicitly simulated 5-phase run; pause preserves the current transcript; single-step advances without a timer; reset clears the run. Missing inputs and authorization failures terminate at phase 2. A reset has no real-world effect. The component cancels stale timers on reset, scenario changes and unmount, and pauses when hidden or outside the visible reading area. Reduced motion keeps all controls usable and removes spatial animation.

Internal-context content is an authored teaching model, not private model reasoning. Input token and cache figures are illustrative; the cost panel states that there are no real API calls. Full original context-layer descriptions remain behind a disclosure. Archify viewer links open a new tab and disclose that behavior. Memory's English reader labels its current Chinese-only visualization explicitly.
