# AI Engineering Atlas — React application

This is the maintained React source for the AI Engineering Atlas: **10 public chapters (01–10)**, Atlas system orientation, a long-form Reader, local Knowledge Command search, Notebook bookmarks, shareable Concept routes, and a system architecture viewer. Chapter 00 is the shared system framework rather than an eleventh Reader chapter.

The application includes bilingual Chinese/English content, light/dark themes, current-section tracking, keyboard search, section dialogs, focus reading, interactive teaching diagrams, bounded simulation scenarios, and optional practice. Not every chapter has an interactive exercise; technical content remains owned by `../../handbook/chapters/*.md`, not by React components.

## Where to change things

- `src/`: React runtime, navigation, interactive components, UI styles and current theme tokens.
- `public/content/`, `src/chapters.json`, `src/search-index.json`: generated chapter/search data.
- `scripts/sync-content.py`: content derivation; `scripts/publish-web.mjs`: deployed artifact generation.
- `evidence/`: browser/a11y/interaction regression tests and historical review receipts.
- `../../web/site/`: generated Vercel delivery artifact, **not** a second editable UI source.

The authoritative contracts are `../../DESIGN.md` for visual composition and diagram semantics, `UX-CONTRACT.md` for observable behavior, and `../../MAINTENANCE.md` for the full source → validation → publication workflow.

## Local development

Install Node dependencies, then run:

```bash
npm install
npm run dev
npm run build
```

To change chapter presentation, fragments or generated search payloads, Python 3 and BeautifulSoup are also needed:

```bash
python3 -m pip install -r scripts/requirements.txt
npm run sync-content
npm run build
```

Before merging any production-facing React change:

```bash
npm run publish:web
```

This refreshes and must be committed with `../../web/site/`. A successful source build **does not** change the production website on its own.

## Browser verification

With Chromium installed (`npx playwright install chromium`), use two terminals:

```bash
# Terminal 1, from preview/handbook-custom/
npm run dev -- --port 4180

# Terminal 2, from the same directory
node evidence/surface-ui-audit.cjs
```

The cross-surface audit covers Atlas, Notebook, Concept, system architecture and all ten Reader chapters: **14 routes × four viewport widths (390/768/1440/1728) × two paired language/theme states = 112 layout checks**, plus search/Notebook flows and representative WCAG checks. This is an explicit, runnable browser regression script; it is **not yet a required permanent CI gate**.

For deeper behavior checks, run the relevant scripts:

```bash
npm run test:ui
npm run test:a11y
npm run test:concepts
npm run test:learning
node evidence/bento/check.cjs
node evidence/jev-flow-comparison.cjs
```

These tests also require the running local development server and Playwright browser. Use a matching runtime/port or set `HANDBOOK_URL` where supported.

## Design and content rules

The Atlas identity is **engineering workbench × technical manual × system topology**. Treat visual information structure as authored knowledge: architecture, comparisons, branch decisions and state machines are different relationships and should not all become generic numbered cards. Keep source-backed arrows and authorization boundaries accurate, avoid duplicate controls and fixed blank panes, and preserve touch/keyboard accessibility and reduced-motion behavior.

For a user-provided reference figure, compare original grouping, visual hierarchy, connectors, conditional flow and labels before implementing motion. The portable figure should still communicate the core meaning with animation disabled. Generated HTML/JSON/site bundles are outputs: correct a problem in canonical sources, presentation fragments, generators or React, then regenerate; never patch published output directly.

Historical evidence files can describe an earlier product revision (including nine-chapter snapshots). Their names or measurements are not current product guarantees. Re-run the relevant checks after changes rather than quoting historical results as fresh validation.
