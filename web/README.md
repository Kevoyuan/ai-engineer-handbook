# Interactive Web Handbook

This directory contains the interactive handbook web assets.

## Production

The handbook is deployed on **Vercel**:

https://kevoyuan-ai-handbook.vercel.app

GitHub `main` is the source of truth. Vercel watches this repository and publishes this `web/` directory to production after each push.

## Site structure

```text
web/
├── index.html
├── chapters/       # one independent page per technical chapter
├── search/
├── assets/
├── search-index.json
└── vercel.json
```

The current web edition contains chapters 02–09. Preserve their technical content, diagrams, bilingual support, theme switching, search, navigation, and responsive behavior.

The source of truth for visual decisions is `web/DESIGN.md`, derived from the repository design system for the current Quiet Editorial edition.
