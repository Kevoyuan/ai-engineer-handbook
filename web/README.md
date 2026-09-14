# Interactive Web Handbook

This directory contains the presentation layer for the interactive AI Engineer Handbook.

Target artifact:

```text
web/AI_Engineer_Handbook.html
```

The current local study product originated as `AI_Engineer_Interview_Handbook_Master.html`. During migration, preserve its technical content, diagrams, bilingual support, theme switching, search, navigation, and responsive behavior, while changing the product framing from interview-first to engineering-reference-first.

## Mobile reader layer

The phone-first reading improvements are kept separately so they can be integrated into the final single-file artifact without losing the design contract:

```text
web/mobile-reader.css
web/mobile-reader.js
```

They provide:

- contextual mobile topbar
- 44px touch targets
- bottom Previous / Search / Focus / Next reading dock
- bottom-sheet full-text search
- safe-area support
- 2×2 mobile reading controls and cover statistics
- isolated horizontal scrolling for wide tables
- drawer/backdrop z-index rules

The source of truth for visual decisions is the repository root `DESIGN.md`.
