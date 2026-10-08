# AI Engineering Atlas

A practical, engineering-first knowledge atlas for building and operating production AI systems.

**Live site:** https://kevoyuan-ai-handbook.vercel.app

The repository keeps durable AI engineering knowledge in canonical chapter files and publishes it through an interactive Atlas. The product is organized around system orientation, deep reading, concept lookup, retrieval/RAG, agent engineering, reliability, evaluation, observability, and production platform concerns.

## Product surfaces

The interactive product has four primary surfaces plus one connective layer:

- **Atlas** — the four-layer Knowledge Spine: Model → Retrieval & RAG → Agent → Production.
- **Reader** — long-form chapter reading with current-section trace, progress, section navigation, focus mode, and interactive teaching modules.
- **Search / Knowledge Command** — local ranked search across concepts and chapter sections.
- **Notebook** — browser-local saved chapters.
- **Concept Layer** — shareable concept indexes that connect canonical sources across chapters without becoming a second source of technical truth.

## Core knowledge spine

1. Model / API / Context Foundations
2. Enterprise Retrieval
3. Hybrid Retrieval & Query Routing
4. RAG Reliability & Selective Answering
5. Document / PDF RAG
6. Skills / MCP / Tools
7. Memory & Context Engineering
8. Agent / Workflow / Orchestration
9. Reliability / Evaluation / Observability
10. Serving / Deployment / Security / AI Platform

A system-level Chapter 00 provides the architecture map shared by the active chapters.

## Repository layout

```text
ai-engineer-handbook/
├── README.md
├── MAINTENANCE.md
├── DESIGN.md
├── ROADMAP.md
├── handbook/
│   ├── README.md
│   ├── ai_engineer_handbook.md
│   └── chapters/                    # canonical semantic source
├── preview/handbook-custom/         # React application source
│   ├── src/
│   ├── public/content/              # generated reader/search payloads
│   └── scripts/
│       ├── sync-content.py
│       └── publish-web.mjs
├── web/
│   ├── chapters/                    # derived presentation inputs
│   ├── assets/                      # registered fragments / legacy presentation assets
│   ├── site/                        # generated production deployment artifact
│   └── vercel.json
└── archive/interview/               # interview-specific secondary reference
```

## Canonical semantic chapters

The active semantic modules are:

```text
handbook/chapters/00-ai-engineer-system-framework.md
handbook/chapters/01-model-api-context-foundations.md
handbook/chapters/02-enterprise-retrieval.md
handbook/chapters/03-hybrid-retrieval-query-routing.md
handbook/chapters/04-rag-reliability-selective-answering.md
handbook/chapters/05-document-pdf-rag.md
handbook/chapters/06-skills-routing.md
handbook/chapters/07-memory-context-engineering.md
handbook/chapters/08-agent-orchestration.md
handbook/chapters/09-reliability-evaluation-observability.md
handbook/chapters/10-serving-deployment-ai-platform.md
```

The public edition contains chapters 01–10. Chapter 00 remains the shared system architecture source.

## Source-of-truth and build model

```text
GitHub main
   ↓
handbook/chapters/*.md
canonical technical meaning
   ↓
web/chapters/* + registered presentation fragments
derived presentation inputs
   ↓
preview/handbook-custom/scripts/sync-content.py
generated bilingual chapter/search payloads
   ↓
preview/handbook-custom
React Atlas / Reader / Search / Notebook / Concept UI
   ↓
npm run publish:web
   ↓
web/site
generated deployment artifact
   ↓
Vercel
```

`DESIGN.md` is the single visual/presentation contract. `preview/handbook-custom/UX-CONTRACT.md` owns observable product behavior. Generated JSON and `web/site` are outputs, not independent semantic sources.

Internal authoring comments are not reader content. The content-sync pipeline strips HTML comments before locale transforms and rejects leaked chapter markers such as `===== CH7 =====`.

## Local build and publish

From `preview/handbook-custom/`:

```bash
npm run sync-content
npm run build
npm run publish:web
```

Use `sync-content` after canonical/presentation content changes. `build` verifies the React application. `publish:web` rebuilds the app and replaces `web/site/` with the production artifact.

## Deployment

Vercel deploys `web/site/` with `web/` as the configured project root.

```text
change
→ feature branch
→ pull request
→ locally run React build + structural validation + English audit
→ review published web/site artifact (+ Vercel Preview if available)
→ merge to main
→ Vercel production deployment
→ smoke-check the stable public URL
```

A successful React build does not update `web/site` by itself. Production-facing UI changes must include a refreshed published artifact before merge.

## Maintenance

The canonical operating procedure lives in **[MAINTENANCE.md](./MAINTENANCE.md)**.

The guiding principle remains: **engineering knowledge first; interview preparation is only one downstream use case.**
