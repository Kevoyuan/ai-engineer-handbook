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

`#home/{filter}` owns chapter-filter state; `#map` owns the system and Agent reference architecture diagrams; `#read/{chapter-slug}/{section-id}` owns reading destinations. `#read` remains a compatibility route for chapter 02. The native browser Back button restores destinations. Titles follow the active Chinese/English locale and name the current chapter or page.

Every chapter uses the same reader. Previous/next chapter navigation lives at the end of the scrollable article and does not reserve a fixed bottom bar. Menu links, directory links, map links, search results and previous/next navigation enter this reader. All 9 chapters are available; no ordinary reading action routes to the legacy shell. Article data loads per chapter with AbortController cancellation and a localized pending/error/retry region. An unknown chapter has a recovery screen and a contents link.

Architecture navigation scrolls to either complete diagram within the page. Related-chapter links inside system modules open the shared chapter reader. Architecture content and topology are derived from the original `web/index.html` via `scripts/sync-architecture.mjs`.

## Content and lookup

Canonical technical meanings, text, diagram topology, node order, and bilingual labels remain owned by the source handbook. The preview derives complete chapter and registered fragment content. Tables remain tables and horizontal comparison/code scrolling is keyboard reachable. Section search is a local transient dialog, so its editing query is intentionally not persisted in the URL; selected results are shareable chapter/section routes.

Search supports IME text entry; composition never activates Enter navigation or shortcuts. ArrowDown enters the result links; Tab navigates normally and Enter opens a result. Search has loading, failure/retry, no-results and clear states. Search data is lazy-loaded; it does not issue remote requests on each keystroke.

## Reading preferences and bookmarks

Locale, theme, text size and bookmarks are saved only in the current browser. Bookmarks are immediate and reversible, with one shared status live region. If persistence is unavailable, the current visit remains usable and the storage issue is stated honestly. No account/sync promise is made. Reading positions are neither saved nor restored; the directory has no continue-reading entry.

Focus reading hides persistent sidebar/table-of-contents chrome and preserves the same content, search, page navigation and reading controls. It has an explicit exit button. Chapters open at the beginning unless the URL specifies a section destination.

## Accessibility and responsive behavior

Search, mobile navigation, and mobile section navigation use the installed Radix Dialog owner with names, Escape, focus trapping, and focus restoration. Buttons and links retain native roles. Current chapter/section are exposed with aria-current; bookmark/focus selection use aria-pressed. An explicit skip link reaches the content region.

Scrollbars retain their gutters while their thumbs stay transparent at rest. Scrolling reveals the thumb for one second; pointer hover and keyboard focus also reveal it. Forced-colors retains native visible scrollbars. The desktop sidebar can be hidden and restored using the top-left navigation button; the local collapsed preference does not affect the mobile navigation dialog. Reduced motion suppresses animation. Dark mode uses neutral reading surfaces; filled-button text comes from the semantic on-primary token. On phones the workspace is one scrolling page: toolbar, introduction, search, filters, chapter list and architecture entry all scroll together. Reader headings and controls also scroll with the article; section jumps use the workspace as their scroll owner. Desktop keeps its bounded content panes. At narrow widths the sidebar becomes a navigation dialog, the TOC is a section dialog at every width, comparison tables scroll internally, and complex experiment panels stack at their available content width.

## Verification and migration boundary

The reviewed redesign is published as `web/site/`; its application source remains in `preview/handbook-custom`. Legacy chapter URLs redirect to the shared reader. Browser tests cover all chapters and representative theme/locale, desktop/mobile, keyboard, loading/error/retry and experimental-control states. Existing generated component registry demos are retained but are not imported into product routes.

The on-page contents never reserves a right-hand column. The reader toolbar opens the shared section dialog on desktop and mobile; current-section highlighting, section jumps and return-to-top remain available.
