# Core Handbook

The core handbook is the long-lived, reusable knowledge layer. It is intentionally separated from interview scripts, company-specific question banks, personal project positioning, and presentation-only website code.

## Canonical semantic source

As of 2026-09-17, **one canonical Markdown module per chapter under `handbook/chapters/` owns technical meaning**.

```text
handbook/chapters/
├── 00-ai-engineer-system-framework.md
├── 02-enterprise-retrieval.md
├── 03-hybrid-retrieval-query-routing.md
├── 04-rag-reliability-selective-answering.md
├── 05-document-pdf-rag.md
├── 06-skills-routing.md
├── 07-memory-context-engineering.md
├── 08-agent-orchestration.md
├── 09-reliability-evaluation-observability.md
└── 10-serving-deployment-ai-platform.md
```

`handbook/ai_engineer_handbook.md` is retained only as a compatibility entry point for old links. It is **not** a semantic manuscript and must not receive new handbook content.

Chapter 01 remains planned work. Chapter 10 is now active, beginning with inference serving and prefix-cache engineering; deployment lifecycle, security operations, and broader AI platform topics remain incremental work.

## Repository responsibilities

```text
GitHub main
  = repository state + version history

handbook/chapters/*.md
  = canonical semantic source
    concepts · architecture · trade-offs · failure modes · metrics · rules · source notes

DESIGN.md
  = presentation contract

web/
  = derived presentation
    HTML · diagrams · interactions · bilingual runtime · search · responsive UI

Vercel
  = delivery
```

If Markdown and `web/` disagree on **technical meaning**, re-check the original source/evidence and reconcile toward the canonical chapter. If they differ only in visual organization, `web/` owns the presentation decision.

## Active chapters

| # | Chapter | Scope |
|---|---|---|
| 00 | AI Engineering System Framework | Runtime, knowledge/state/capabilities, control plane, learning loop, platform foundation |
| 02 | Enterprise Retrieval | Exact, BM25, dense, graph, metadata, authorization |
| 03 | Hybrid Retrieval & Query Routing | Fusion, routing, budgets, conversational retrieval control |
| 04 | RAG Reliability & Selective Answering | Evidence sufficiency, abstention, claims, risk–coverage |
| 05 | Document / PDF RAG | Parsing, structure recovery, multimodal documents, provenance, grounded document agents |
| 06 | Skills / MCP / Tools | Capability contracts, routing, protocol boundary, authorization, host execution |
| 07 | Memory & Context Engineering | State, memory layers, promotion, compaction, provenance, permission isolation |
| 08 | Agent / Workflow / Orchestration | Artifacts, bounded loops, graphs, LangChain/LangGraph, coding-agent engineering |
| 09 | Reliability / Eval / Observability | Harness, datasets, traces, monitoring, experiments, security, cost, release gates |
| 10 | Serving / Deployment / Security / AI Platform | Inference serving, KV/prefix cache, cache isolation; deployment/security/platform sections expanding incrementally |

## Adding knowledge

New material follows:

```text
research / verify
→ inspect the relevant canonical chapter
→ separate source facts from handbook synthesis
→ merge reusable meaning into that chapter
→ keep framework/vendor behavior clearly labeled
→ update web presentation only after semantics are stable
→ validate i18n / search / responsive / structural QA
→ feature branch → PR → CI + Preview → merge → production verify
```

Do not create a new semantic supplement next to an existing canonical chapter merely because a source uses different terminology. Add a separate file only when it has an independent long-lived ownership boundary.

## Cross-chapter canonical rules

1. **Authorization before semantic similarity.**
2. **Evidence relevance ≠ evidence sufficiency.**
3. **Citation presence ≠ citation correctness.**
4. **Parsing quality sets the upper bound for retrieval.**
5. **Use the cheapest reliable route first.**
6. **Skill match is not authorization.**
7. **The model proposes; the host executes.**
8. **The transcript is not the state.**
9. **Use the least control-flow complexity necessary.**
10. **Fix the earliest incorrect decision.**
11. **Evaluators should produce repair instructions, not only scores.**
12. **Optimize cost per successful task.**
13. **Book first, interaction second.**
14. **Traces make failures visible; evals make them durable.**
15. **Monitoring must produce learning assets.**

## Product principle

> **Book first, interaction second.** Interaction should serve understanding rather than turn the handbook into a dashboard.
