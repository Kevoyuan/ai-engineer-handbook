# AI Engineer Handbook · Legacy Aggregate Entry Point

> Compatibility file retained so existing repository links do not break.
>
> **Do not add or edit handbook knowledge here.**

As of 2026-09-17, the canonical semantic source has moved to one module per chapter under [`handbook/chapters/`](./chapters/).

The previous aggregate manuscript mixed two maintenance models: Chapters 02–09 lived in this file while newer source-derived material lived in separate `handbook/chapters/*.md` supplements. That created duplicate ownership and made it unclear which file should be edited.

The canonical structure is now:

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

Chapter 01 remains planned work. Chapter 10 is now active with inference-serving coverage and will expand incrementally.

## Source-of-truth rule

```text
GitHub main
→ handbook/chapters/*.md     canonical technical meaning
→ DESIGN.md                  presentation contract
→ web/                       derived interactive presentation
→ Vercel                     delivery
```

Framework-, vendor-, course-, or article-specific material should be merged into the relevant canonical chapter as either:

- a reusable engineering principle;
- a clearly labeled implementation example;
- a source note with provenance.

Do not recreate a second aggregate semantic manuscript. If an aggregate export is needed in the future, generate it from `handbook/chapters/` rather than maintaining it by hand.
