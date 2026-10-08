# Visualization V2 · chapter coverage and visual audit (source review)

**Source snapshot:** `handbook/chapters/*.md`, `web/chapters/*/index.html`, `preview/handbook-custom/src/` on 2026-10-09.
**Audit method:** static markup/source inspection. This is **not** a browser screenshot review, contrast measurement or usability study.

## Inventory and staged priorities

| Chapter | Current reader visuals found in source | This iteration | Next improvement |
|---|---|---|---|
| 01 Model / API / Context | tables and prose; no inline SVG in chapter HTML | keep | Context budget/trade-off matrix from authored sections |
| 02 Enterprise Retrieval | retrieval comparison table | keep | Evidence path topology with ACL boundary |
| 03 Hybrid Retrieval & Routing | authored routing diagram + interactive Query Router lesson | keep | clearer explicit fork / selected vs unselected retrieval paths |
| 04 RAG Reliability | evidence-gate explanation + interactive lesson | keep | evidence-support vs answer decision fan-out |
| 05 PDF RAG | workflow prose/figure-like layouts | keep | document structure and citation lineage |
| 06 Skills | interactive simulator + Jev role comparison | keep | permission/failure contrast audit |
| 07 Memory | memory diagram + interactive lesson | keep | short-lived state vs long-term retrieval ownership |
| 08 Agent | Agent orchestration interactive lesson | keep | action loop vs deterministic runtime/approval boundary |
| 09 Evaluation | evaluation tables / material | keep | failure taxonomy and feedback path |
| 10 Serving / KV Cache | authored static Fig.10.1 about prefix reuse | **new** compare-and-decide lab after Fig.10.1 | serving-control-plane diagrams separate from KV cache |
| 11 Data / SQL | pipeline code block + tables | **new** contract-boundary scenario lab in §11.1 | temporal SCD2 and SQL authorization extensions |
| 12 FDE Delivery | contract-oriented tables and prose | keep | discovery → acceptance → rollout/rollback evidence trail |

The inline `<svg>` count above is **not** a measure of diagram quality: HTML/CSS diagrams and lazy React teaching modules also exist.

## Design intent

- **Different topology for different problems:** CH10 depicts pairwise compatible prefixes and conditional reuse; CH11 shows stage-specific data contract outcomes. Neither diagram is a generic static four-box pipeline.
- **Static-first and intentional interaction:** scenario buttons change the diagram state; no time-based autoplay, unrelated analytics, or invented throughput/latency numbers.
- **Invariant boundaries:** shared prefix ≠ shared mutable Agent session; Prefix Cache ≠ Semantic Cache; Bronze/Silver/Gold ≠ exactly-once effects; retrieval checks ≠ DB permissions.
- **Traceability:** CH10 content derives from canonical CH10 §§10.2–10.8, CH11 from §§11.1–11.8. Examples are labeled teaching decisions rather than executed traces.
- **Presentation:** existing DESIGN.md neutrals, primary green, mono metadata, flat one-pixel dividers, 44px input targets, readable without color.
- **Fallback:** diagrams are optional and mounted after static canonical content. If a lazy React chunk fails, the full chapter stays readable.

## Verification gates

1. `npm run sync-content` and `npm run test:atlas` — must retain Atlas metadata through regeneration.
2. `npm run test:visualizations` — verify canonical anchors and scenario controls.
3. `npm run test:concepts`, `npm run test:learning`, `npm run test:ui`, `npm run test:a11y`, `npm run build`.
4. Manual browser QA at **390 / 768 / 1440 / 1728px**, both themes, both languages, keyboard, focus, reduced motion.
5. Test direct `#read/10-serving-deployment-ai-platform/concept-demo` and `#read/11-data-sql-engineering/concept-demo`, loading from a fresh tab.
6. Run `npm run publish:web` then `node web/validate.mjs` and verify deployment preview.
7. Record screenshots and any blocked checks; do **not** merge based solely on source inspection.

## Reviewer rubric — Keep / Fix / Quick wins

- **Keep** the authored static figure in CH10; the new compare-and-decide lab complements it.
- **Fix** confusing Prefix Cache vs final answer cache, duplicate-event reapply, and read authorization as explicit *failure boundaries*.
- **Quick win** supply the new Lab anchors via the already implemented Atlas node actions, without adding extra global navigation.

## Scope and limitations

Implemented now: **2 new chapter-local interactive modules**, **7 decision scenarios total**, and contract tests. Coverage audit: all 12 chapters. Remaining redesign proposals are **not implemented**. No new benchmark, tool call, cache hit or database operation was actually performed.
