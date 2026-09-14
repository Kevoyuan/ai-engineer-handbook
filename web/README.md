# Interactive Web Handbook

This directory contains the interactive handbook web assets.

## Production

The handbook is deployed on **Vercel**:

https://ai-engineer-handbook-kevoyuans-projects.vercel.app

GitHub remains the source repository. GitHub Pages is no longer used for production deployment, and the temporary `.pages-payload` transport files have been removed.

## Target artifact

```text
web/AI_Engineer_Handbook.html
```

The current local study product originated as `AI_Engineer_Interview_Handbook_Master.html`. During migration, preserve its technical content, diagrams, bilingual support, theme switching, search, navigation, and responsive behavior, while changing the product framing from interview-first to engineering-reference-first.

Mobile behavior is maintained through the reader rules in `mobile-reader.css` and `mobile-reader.js`. Responsive work must not change the established palette unless a palette redesign is explicitly requested.

The source of truth for visual decisions is the repository root `DESIGN.md`.
