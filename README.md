# AI Engineer Handbook

A practical, engineering-first handbook for building production AI systems.

**Live handbook:** https://kevoyuan-ai-handbook.vercel.app

This repository focuses on reusable AI engineering knowledge rather than interview-specific memorization. The core handbook is organized around system design, retrieval, RAG, agent orchestration, context engineering, reliability, evaluation, observability, and semantic systems.

## Core knowledge spine

1. Model / API / Context Foundations *(planned)*
2. Enterprise Retrieval
3. Hybrid Retrieval & Query Routing
4. RAG Reliability & Selective Answering
5. Document / PDF RAG
6. Skills / MCP / Tools
7. Memory & Context Engineering
8. Agent / Workflow / Orchestration
9. Reliability / Evaluation / Observability
10. Serving / Deployment / Security / AI Platform *(planned)*

A system-level Chapter 00 provides the architecture map shared by the active chapters.

## Repository layout

```text
ai-engineer-handbook/
├── README.md
├── MAINTENANCE.md             # Canonical maintenance SOP
├── DESIGN.md                  # Single design / visualization contract
├── ROADMAP.md
├── handbook/
│   ├── README.md
│   ├── ai_engineer_handbook.md # Legacy compatibility index only
│   └── chapters/              # Canonical semantic source: one file per active chapter
├── web/                       # Derived interactive handbook
└── archive/interview/         # Interview-specific secondary reference
```

## Canonical semantic chapters

The currently active semantic modules are:

```text
handbook/chapters/00-ai-engineer-system-framework.md
handbook/chapters/02-enterprise-retrieval.md
handbook/chapters/03-hybrid-retrieval-query-routing.md
handbook/chapters/04-rag-reliability-selective-answering.md
handbook/chapters/05-document-pdf-rag.md
handbook/chapters/06-skills-routing.md
handbook/chapters/07-memory-context-engineering.md
handbook/chapters/08-agent-orchestration.md
handbook/chapters/09-reliability-evaluation-observability.md
```

The public web edition currently contains chapters 02–09. Chapters 01 and 10 remain roadmap gaps and are intentionally not represented by empty placeholders.

## Source-of-truth model

```text
GitHub main
→ handbook/chapters/*.md     technical meaning
→ DESIGN.md                  presentation contract
→ web/                       interactive rendering
→ Vercel                     delivery
```

Do not maintain a second aggregate manuscript or a second design spec.

## Deployment

The public web handbook is deployed on **Vercel**. GitHub `main` is the repository source of truth, and Vercel publishes the `web/` directory after accepted changes reach `main`.

```text
Handbook update
→ feature branch
→ pull request
→ structural + language CI
→ Vercel Preview
→ merge to main
→ Vercel production deployment
→ verify the stable public URL
```

## Maintenance

The canonical maintenance workflow lives in **[MAINTENANCE.md](./MAINTENANCE.md)**.

```text
New material
→ inspect latest main
→ identify owning canonical chapter
→ research / verify
→ semantic merge into handbook/chapters/<chapter>.md
→ choose presentation using DESIGN.md
→ update web/
→ validate i18n / search / structural / responsive behavior
→ feature branch + PR
→ CI + Vercel Preview
→ merge main
→ verify production

Interview-only material
→ archive/interview
```

The guiding principle is: **engineering knowledge first; interview preparation is only one downstream use case.**
