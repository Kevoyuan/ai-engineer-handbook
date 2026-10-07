# Published Web Artifact

This directory contains the deployment-facing outputs and legacy/derived presentation inputs for the AI Engineering Atlas.

## Production

The live site is deployed on **Vercel**:

https://kevoyuan-ai-handbook.vercel.app

The Vercel project root is `web/`, and `web/vercel.json` sets:

```json
{
  "outputDirectory": "site"
}
```

Therefore the production artifact is **`web/site/`**, not the React source tree itself.

The React application source lives in:

```text
preview/handbook-custom/
```

The publishing path is:

```text
preview/handbook-custom
  ↓ npm run build
dist/
  ↓ npm run publish:web
web/site/
  ↓
Vercel
```

A successful `npm run build` does not refresh production by itself. UI/content changes intended for deployment must regenerate `web/site/` before merge.

## Content generation

Reader/search payloads are generated from the maintained web chapter presentation inputs and registered fragments:

```text
web/chapters/*
web/assets/chapter-additions.json
        ↓
preview/handbook-custom/scripts/sync-content.py
        ↓
preview/handbook-custom/public/content/*.json
preview/handbook-custom/src/search-index.json
        ↓
React build
        ↓
web/site/content/*
```

Run from `preview/handbook-custom/`:

```bash
npm run sync-content
npm run build
npm run publish:web
```

`publish:web` also runs `web/sync-diagram-csp.mjs` so standalone diagram CSP hashes remain aligned with generated diagram content.

## Generated content hygiene

Internal authoring comments are not reader content.

`sync-content.py` strips HTML comments before locale conversion and skips BeautifulSoup `Comment` nodes explicitly. It also rejects leaked visible chapter separators such as:

```text
======================= CH7 =======================
```

Do not patch generated JSON by hand. If authoring-only material appears in Reader output, fix the generator and regenerate both preview content and `web/site`.

## Directory roles

```text
web/
├── chapters/                    # derived chapter presentation inputs
├── assets/
│   ├── chapter-additions.json   # registered supplemental fragments
│   └── ...
├── diagrams/                    # standalone diagram sources/exports
├── site/                        # generated Vercel deployment artifact
├── vercel.json                  # Vercel project config, outputDirectory=site
├── validate.mjs                 # structural validation
└── sync-diagram-csp.mjs         # published diagram CSP synchronization
```

Legacy scripts and presentation assets under `web/` remain part of the derivation pipeline where referenced, but `web/site/` is the only directory Vercel serves as the built application output.

## Source ownership

```text
../handbook/chapters/*.md
= canonical technical meaning

../DESIGN.md
= visual and presentation contract

../preview/handbook-custom/UX-CONTRACT.md
= observable application behavior

../preview/handbook-custom/
= React application source + generated reader/search inputs

site/
= generated deployment artifact
```

Generated files do not become independent sources of truth.

## Dynamic chapter fragments

Supplemental presentation fragments are registered once in:

```text
assets/chapter-additions.json
```

The registry is a presentation mechanism, not a semantic owner. Every fragment must map back to technical meaning already owned by the canonical chapter.

## Validation

For UI/runtime work, run from `preview/handbook-custom/`:

```bash
npm run sync-content   # when chapter/presentation content changed
npm run build
npm run test:ui
npm run test:a11y
npm run test:concepts
npm run test:learning
npm run publish:web    # before a production-facing merge
```

For repository/published-asset checks, run from the repository root:

```bash
node web/validate.mjs
node --check web/rebuild.mjs
```

Pull requests that touch the React preview are also gated by `.github/workflows/preview-build.yml`. Structural and English-language audits remain separate checks.

## Publishing rule

Before merging a production-facing React change:

1. regenerate content if necessary;
2. compile the React preview;
3. refresh `web/site/`;
4. inspect the PR diff for generated artifacts;
5. require preview build, structural audit, English audit, and Vercel Preview to succeed;
6. after merge, verify the stable production URL.

Do not assume that a green source build means the deployed artifact has changed.
