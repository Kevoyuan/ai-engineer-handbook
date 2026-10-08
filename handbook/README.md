# Core Handbook

The core handbook is the long-lived, reusable knowledge layer. It is intentionally separated from interview scripts, company-specific question banks, personal project positioning, and presentation-only website code.

## Canonical semantic source

As of 2026-09-17, **one canonical Markdown module per chapter under `handbook/chapters/` owns technical meaning**.

```text
handbook/chapters/
├── 00-ai-engineer-system-framework.md
├── 01-model-api-context-foundations.md
├── 02-enterprise-retrieval.md
├── 03-hybrid-retrieval-query-routing.md
├── 04-rag-reliability-selective-answering.md
├── 05-document-pdf-rag.md
├── 06-skills-routing.md
├── 07-memory-context-engineering.md
├── 08-agent-orchestration.md
├── 09-reliability-evaluation-observability.md
├── 10-serving-deployment-ai-platform.md
├── 11-data-sql-engineering.md
└── 12-fde-customer-delivery.md
```

`handbook/ai_engineer_handbook.md` is retained only as a compatibility entry point for old links. It is **not** a semantic manuscript and must not receive new handbook content.

Chapter 01 is now active and owns model/API/context foundations, adaptation and inference fundamentals. Chapter 10 remains active for deeper serving, deployment, security operations, and broader AI platform concerns.

## Repository responsibilities

```text
GitHub main
  = repository state + version history

handbook/chapters/*.md
  = canonical semantic source
    concepts · architecture · trade-offs · failure modes · metrics · rules · source notes

DESIGN.md
  = visual / presentation contract

preview/handbook-custom/UX-CONTRACT.md
  = observable application behavior

preview/handbook-custom/
  = React Atlas source + content sync / search generation

web/
  = derived presentation inputs + generated production artifact
    web/site/ is the deployable output

Vercel
  = delivery
```

If Markdown and the rendered product disagree on **technical meaning**, re-check the original source/evidence and reconcile toward the canonical chapter. Visual organization follows `DESIGN.md`; observable interaction behavior follows `UX-CONTRACT.md`. Generated JSON and `web/site/` must be regenerated rather than hand-edited.

## Active chapters

| # | Chapter | Scope |
|---|---|---|
| 00 | AI Engineering System Framework | Runtime, knowledge/state/capabilities, control plane, learning loop, platform foundation |
| 01 | Model / API / Context Foundations | Generation, Transformer, tokenization, context, sampling, embeddings, adaptation, structured output, latency/caching, model selection and migration |
| 02 | Enterprise Retrieval | Exact, BM25, dense, graph, metadata, authorization |
| 03 | Hybrid Retrieval & Query Routing | Fusion, routing, budgets, conversational retrieval control |
| 04 | RAG Reliability & Selective Answering | Evidence sufficiency, abstention, claims, risk–coverage |
| 05 | Document / PDF RAG | Parsing, structure recovery, multimodal documents, provenance, grounded document agents |
| 06 | Skills / MCP / Tools | Capability contracts, routing, protocol boundary, authorization, host execution |
| 07 | Memory & Context Engineering | State, memory layers, promotion, compaction, provenance, permission isolation |
| 08 | Agent / Workflow / Orchestration | Artifacts, bounded loops, graphs, LangChain/LangGraph, coding-agent engineering |
| 09 | Reliability / Eval / Observability | Harness, datasets, traces, monitoring, experiments, security, cost, release gates |
| 10 | Serving / Deployment / Security / AI Platform | Inference serving, KV/prefix cache, cache isolation; deployment/security/platform sections expanding incrementally |
| 11 | Data & SQL Engineering | ETL/ELT, CDC, idempotent pipelines, Delta/Lakehouse, Spark, temporal SQL, safe Text-to-SQL |
| 12 | FDE Customer Delivery | Discovery, scope, walking skeleton, acceptance metrics, stakeholder trade-offs, live demo recovery, handoff |

## Adding knowledge

New material follows:

```text
research / verify
→ inspect the relevant canonical chapter
→ separate source facts from handbook synthesis
→ merge reusable meaning into that chapter
→ keep framework/vendor behavior clearly labeled
→ update derived presentation only after semantics are stable
→ npm run sync-content
→ validate React / i18n / search / responsive / structural QA
→ npm run publish:web
→ feature branch → PR → CI + Vercel Preview → merge → production verify
```

Do not create a new semantic supplement next to an existing canonical chapter merely because a source uses different terminology. Add a separate file only when it has an independent long-lived ownership boundary.

## Cross-chapter canonical rules

1. **Authorization before semantic similarity.**
2. **Evidence relevance ≠ evidence sufficiency.**
3. **Citation presence ≠ citation correctness.**
4. **Parsing quality constrains text-only retrieval; original-page or image retrieval can recover information lost during parsing.**
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
16. **Sampling controls variability; it does not create truth.**
17. **A long context window is capacity; evidence utilization is empirical.**
18. **Syntax validity is not semantic validity, and semantic validity is not authorization.**

## Product principle

> **Book first, interaction second.** Interaction should serve understanding rather than turn the handbook into a dashboard.

## 知识核验

[2026-09-28 全章节资料核验报告](verification/2026-09-28.md)：逐节覆盖、修正记录、来源和未验证边界。

## FDEInterviews concept ownership (2026-10-08)

The [167-concept routing inventory](references/fde-2026-concept-crosswalk.md) preserves the source's ten tracks and maps each item to exactly one of chapters 01–12. A mapping is a knowledge ownership plan, **not** an audited completeness claim. New CH11 owns the data plane; new CH12 owns the customer delivery process. Continue deepening existing chapters instead of duplicating their knowledge in the new files.


## Independently researched FDE practice and 167-concept audit

The public FDEInterviews topic catalog is a **scope/index** only; the handbook does not claim access to paid answer keys. Independent answer explanations are canonical chapter content, with product-specific claims verified against first-party sources and fictional scenarios labeled.

- [Q1–Q9 source and verification limits](references/fde-2026-verified-answer-ledger.md): CH02 access-aware retrieval, CH09 evals, CH10 idempotency/retries.
- [Q10–Q23 source and verification limits](references/fde-2026-answers-02-04-provenance.md): CH10 production FDE system design (§10.26), CH11 Databricks/Data & SQL (§11.10).
- [Q40–Q64 independently sourced topic-gap answers](references/fde-2026-answers-07-provenance.md): manual reconciliation of the previous 37 unlocated topics across CH01/02/03/06/07/10/11; H136/B31/N0 is **name-location evidence, not depth certification**.
- [Q24–Q39 source and verification limits](references/fde-2026-answers-05-06-provenance.md): CH01 model/ML foundations, CH09 statistical evals, CH11 coding/data integrity, CH08 graph/tool tests.
- [Runnable deterministic ML/coding mini-lab](../examples/fde-interview-engineering/): self-contained Python stdlib negative/positive tests.
- [167 FDE topics → one canonical chapter each](references/fde-2026-concept-crosswalk.md).
- [167-item heading/body/no-direct-signal evidence audit](references/fde-2026-coverage-audit.md): 2026-10-08 review-branch baseline updated to H136/B31/N0 after stages 05–06; **not a readiness/completion score**.
- [Auditable evidence-pointer verifier](../scripts/verify_fde_coverage.py): no external service or paid content required.

The delivery case remains in CH12 §12.11. Public-facing content changes still require generated bilingual assets plus the separate release process. A feature-branch push is **not** Vercel production publication.
