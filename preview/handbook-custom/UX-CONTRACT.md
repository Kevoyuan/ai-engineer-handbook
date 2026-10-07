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

## Verification and migration boundary

The reviewed redesign is published as `web/site/`; its application source remains in `preview/handbook-custom`. Legacy chapter URLs redirect to the shared reader. Browser tests cover all chapters and representative theme/locale, desktop/mobile, keyboard, loading/error/retry and experimental-control states. Existing generated component registry demos are retained but are not imported into product routes.

The on-page contents never reserves a right-hand column. The reader toolbar opens the shared section dialog on desktop and mobile; current-section highlighting, section jumps and return-to-top remain available. Reader scroll state also drives a lightweight shell trace: desktop shows chapter, current section, and rounded reading percentage in the existing top bar, while mobile keeps the chapter context and a two-pixel progress line without adding persistent navigation chrome.


## Skills simulation controls

The supplied terminal reference replaces chapter 06's node-card player with a terminal/context split view. Scenario tabs reset running work and practice, and clear previous logs. Send starts an explicitly simulated 5-phase run; pause preserves the current transcript; single-step advances without a timer; reset clears the run. Missing inputs and authorization failures terminate at phase 2. A reset has no real-world effect. The component cancels stale timers on reset, scenario changes and unmount, and pauses when hidden or outside the visible reading area. Reduced motion keeps all controls usable and removes spatial animation.

Internal-context content is an authored teaching model, not private model reasoning. Input token and cache figures are illustrative; the cost panel states that there are no real API calls. Full original context-layer descriptions remain behind a disclosure. Archify viewer links open a new tab and disclose that behavior. Memory's English reader labels its current Chinese-only visualization explicitly.
