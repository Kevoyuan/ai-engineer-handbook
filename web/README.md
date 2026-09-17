# Interactive Web Handbook

This directory contains the derived interactive presentation of the canonical handbook semantics in `../handbook/chapters/`.

## Production

The handbook is deployed on **Vercel**:

https://kevoyuan-ai-handbook.vercel.app

GitHub `main` is the repository source of truth. Vercel publishes this `web/` directory after accepted changes reach `main`.

## Site structure

```text
web/
├── index.html
├── chapters/                  # one page per active web chapter
├── search/
├── assets/
│   └── chapter-additions.json # single registry for dynamic chapter fragments
├── rebuild.mjs
├── validate.mjs
├── search-index.json
└── vercel.json
```

The current web edition contains chapters 02–09. Preserve their technical content, diagrams, bilingual support, theme switching, search, navigation, and responsive behavior.

## Source ownership

```text
../handbook/chapters/*.md
= technical meaning

../DESIGN.md
= the only presentation/design contract

web/
= HTML / CSS / JS rendering
```

Do not add a second `web/DESIGN.md` or treat a presentation fragment as a semantic source.

## Dynamic chapter fragments

Supplemental presentation fragments such as the Chapter 08 LangChain/LangGraph diagram or Chapter 09 monitoring diagrams are registered once in:

```text
assets/chapter-additions.json
```

`app.js`, `search.js`, and `rebuild.mjs` consume that same manifest. This avoids the previous duplicated hard-coded registries.

## Validation

Run from the repository root:

```bash
node web/validate.mjs
node --check web/assets/app.js
node --check web/assets/search.js
node --check web/rebuild.mjs
```

The repository CI runs the structural audit and the existing English-language audit on pull requests.
