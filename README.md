# AI Engineer Handbook

A practical, engineering-first handbook for building production AI systems.

**Live handbook:** https://ai-engineer-handbook-kevoyuans-projects.vercel.app

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
├── handbook/                  # Core 1–10 knowledge map and future modular chapters
├── web/                       # Interactive handbook web assets
├── DESIGN.md                  # Design system / visualization contract
└── archive/interview/         # Interview-specific material kept as secondary reference
```

## Deployment

The public web handbook is deployed on **Vercel**. GitHub remains the source repository; GitHub Pages is no longer the deployment target.

```text
Handbook update
→ validate HTML / mobile / JS
→ deploy production build to Vercel
→ stable public URL
```

## Maintenance principle

```text
New material
→ verify / research
→ extract reusable engineering knowledge
→ merge into the core handbook
→ update the interactive HTML
→ validate navigation, JS, responsive layout, and diagrams

Interview-only material
→ archive/interview
```

The guiding principle is: **engineering knowledge first; interview preparation is only one downstream use case.**
