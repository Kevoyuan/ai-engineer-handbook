# Core Handbook

The core handbook is the long-lived, reusable knowledge layer. It is intentionally separated from interview scripts, company-specific question banks, personal project positioning, and presentation-only website code.

## Canonical manuscript

`ai_engineer_handbook.md` is the **canonical semantic manuscript** for the currently active technical handbook, Chapters 02–09.

Repository responsibilities are deliberately split:

```text
handbook/ai_engineer_handbook.md
  = semantic source of truth
    concepts · architecture · trade-offs · failure modes · metrics · canonical rules · source notes

web/
  = presentation source of truth
    HTML · diagrams · interactions · bilingual runtime · search · responsive/mobile UI
```

GitHub `main` remains the repository-level source of truth. The Markdown manuscript does not replace the deployed HTML; it defines the technical meaning that the presentation layer must preserve.

## Active chapters

| # | Chapter | Scope |
|---|---|---|
| 02 | Enterprise Retrieval | Exact, BM25, dense retrieval, graph retrieval, metadata and authorization |
| 03 | Hybrid Retrieval & Query Routing | Routing, fusion, reranking, retrieval budgets, context packing |
| 04 | RAG Reliability & Selective Answering | Refusal, evidence sufficiency, abstention, grounded answers |
| 05 | Document / PDF RAG | Parsing, structure recovery, multimodal documents, provenance, grounded document agents, evaluation |
| 06 | Skills & Routing | Skill contracts, scalable routing, MCP boundaries, authorization, lifecycle and governance |
| 07 | Memory & Context Engineering | State, memory layers, promotion, compaction, provenance and permission isolation |
| 08 | Agent Orchestration | Artifact workflows, bounded loops, graphs, multi-agent boundaries, coding-agent engineering |
| 09 | Reliability, Evaluation & Observability | Harness design, validation, recovery, eval systems, traces, release gates, latency and cost/task |

The production handbook currently maintains Chapters **02–09 only**. Do not restore historical interview/personal sections as peer chapters in the core manuscript.

## Maintenance workflow

New knowledge should flow through the semantic layer before the presentation layer:

```text
research / verify
→ separate source facts from handbook synthesis
→ merge reusable engineering meaning into ai_engineer_handbook.md
→ update the corresponding web chapter / diagram / interaction
→ update bilingual/search behavior when needed
→ run syntax, language, responsive and navigation QA
→ push GitHub main
→ Vercel production deployment
```

Presentation-specific CSS, HTML structure, animation, or interaction state should not be copied into the Markdown manuscript unless it carries technical meaning.

If Markdown and `web/` disagree on **technical meaning**, re-check the original source/evidence and reconcile toward the canonical semantic intent in the manuscript. If they differ only in visual organization, `web/` owns the presentation decision.

## Rule for adding knowledge

A concept belongs in the core handbook when it remains useful outside a specific interview, company, framework version, or one-off project.

Framework-specific material should first be generalized into an engineering principle; the framework can then remain as an implementation example or source note.

Default product principle:

> **Book first, interaction second.** Interaction should serve understanding rather than turn the handbook into a dashboard.
