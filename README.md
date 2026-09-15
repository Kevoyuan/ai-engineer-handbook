# AI Engineer Handbook

A practical, engineering-first handbook for building production AI systems.

**Live handbook:** https://kevoyuan-ai-handbook.vercel.app

This repository focuses on reusable AI engineering knowledge rather than interview-specific memorization. The core handbook is organized around system design, retrieval, RAG, agent orchestration, context engineering, reliability, evaluation, observability, and semantic systems.

## Core handbook

1. AI System Design Principles
2. Enterprise Retrieval
3. Hybrid Retrieval & Query Routing
4. RAG Reliability & Selective Answering
5. Document / PDF RAG
6. Skills & Routing
7. Memory & Context Engineering
8. Agent Orchestration
9. Reliability, Evaluation & Observability
10. Ontology & Operational Semantic Layer

## Repository layout

```text
ai-engineer-handbook/
├── README.md
├── MAINTENANCE.md             # Canonical repository maintenance SOP
├── handbook/                  # Core 1–10 knowledge map and future modular chapters
├── web/                       # Interactive handbook web assets
├── DESIGN.md                  # Design system / visualization contract
└── archive/interview/         # Interview-specific material kept as secondary reference
```

## Deployment

The public web handbook is deployed on **Vercel**. GitHub `main` is the repository source of truth, and Vercel publishes the `web/` directory automatically after accepted changes reach `main`.

Default delivery path:

```text
Handbook update
→ feature branch
→ pull request
→ CI + Vercel Preview
→ merge to main
→ Vercel production deployment
→ verify the stable public URL
```

The current interactive edition contains the eight completed technical chapters numbered 02–09. Chapters 01 and 10 remain in the core knowledge map until their standalone web chapters are authored.

## Maintenance

The canonical maintenance workflow lives in **[MAINTENANCE.md](./MAINTENANCE.md)**.

In short:

```text
New material
→ inspect latest main
→ research / verify
→ semantic merge into handbook/
→ choose diagram / table / interaction using DESIGN.md
→ update web/
→ validate i18n / search / responsive / JS / HTML
→ feature branch + pull request
→ CI + Vercel Preview
→ merge main
→ verify production deployment

Interview-only material
→ archive/interview
```

The guiding principle is: **engineering knowledge first; interview preparation is only one downstream use case.**
