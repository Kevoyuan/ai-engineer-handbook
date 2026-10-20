# Inbox processing · Rerank and context budget · 2026-10-20

## Scope and provenance

Processed the two user-created inbox notes. Original authors, platform URLs and publication dates were not supplied. Their interview/company attribution and popularity claims remain unverified; they are not technical authority. The original text is retained byte-for-byte after `## 原始材料（逐字保留）` in each archived file; SHA-256 values below cover the original bytes only.

- `Agent 上下文快要撑满了，该怎么办？.md`: `861a1960a0d2f4c2967ee3012a168fdc2ecf11f627bde8fca77dd9a3da81e6f2` → Chapter `07-memory-context-engineering`, §7.13.3、§7.13.7、§7.13.10.
- `Rerank面试非常重要.md`: `163a17969c2376b9b370a380f207f6793c140aad1d345dcaece4af7d4fe099e5` → Chapter `03-hybrid-retrieval-query-routing`, §3.1.1–3.1.2.

## Disposition: Rerank

| Raw claim | Handling |
|---|---|
| Bi-Encoder independent encoding / Cross-Encoder joint pair scoring | Retained as an architectural comparison; independent encoding does not mean it cannot learn relevance. |
| Reranking always equals Cross-Encoder | Corrected: ranking stage can use other rankers and LLMs. BERT token syntax is illustrative, not a universal wire format. |
| Every score is a true 0–1 relevance probability | Corrected: BGE exposes logits and optional sigmoid; normalization does not establish calibration or answer sufficiency. |
| Full-corpus Cross-Encoder is impossible; all enterprise RAG must rerank | Replaced with candidate-size, latency, quality and cost trade-offs; no universal requirement. |
| Hybrid fusion must normalize scores | Existing RRF retained as an alternative; weighted normalization requires validation. |
| Rerank automatically deduplicates and fixes hallucinations / lost-in-the-middle | Not adopted as guarantees; coverage, dedup and evidence checks are separate stages. |
| Top20–50 → Top3–5 is the standard | Kept only as an example experiment shape, not a prescribed capacity. |
| Rerank always destroys prefix cache | Corrected: changing suffix evidence need not invalidate an unchanged cacheable instruction prefix. |
| Domestic popularity / mandatory interview questions / millisecond performance | Unverified; omitted from canonical guidance. |

## Disposition: Context budget

Existing Chapter 07 §7.13 already covers compaction, offloading, state, provenance, costs and evaluation. Avoided duplicating its three-budget model or hot/warm/cold taxonomy.

| Raw claim | Handling |
|---|---|
| Removing the oldest history preserves prefix caching | Added a counterexample: `[System][A][B][C]` → `[System][B][C][D]`; same B/C order does not mean same prefix. Distinguished engine KV eviction. |
| Compaction / offloading always invalidate all KV | Retained existing earliest-change boundary; added rerank/retrieval suffix case. |
| Wait until 100% then truncate | Added pre-request admission budget with output reserve, incoming payload bounds and safe compaction headroom. 75–80% is not a universal threshold. |
| Drop arbitrary oldest / lowest-score history | Preserve current constraints and provider-required message structure; pause or narrow task when safe assembly fails. |
| Structured summaries guarantee lower hallucination | Not adopted; retained state fidelity evaluation and independent source evidence. |
| External memory enables infinite reliable operation; cache always saves memory | Not adopted as guarantees; retrieval, lifecycle, serving implementation and resource limits still apply. |

## Primary-source verification

Checked 2026-10-20; public documentation, not a local performance benchmark:

- [Sentence Transformers: Cross-Encoder](https://www.sbert.net/examples/cross_encoder/applications/README.html): independent embeddings versus joint pair scoring.
- [Retrieve & Re-Rank](https://www.sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html): candidate retrieval and second-stage ranking.
- [BAAI BGE reranker model card](https://huggingface.co/BAAI/bge-reranker-v2-m3): raw scores and explicit sigmoid normalization example. An older generic tutorial's 0–1 wording is not a guarantee for every model/configuration.
- [Elastic RRF](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion): rank-based fusion without comparing raw score scales.
- [Anthropic prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching): identical-prefix and changing-suffix boundary.
- [Anthropic context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows): input, output and cached-token window accounting.

Timeout policy, separate dedup/coverage checks, admission budget and safe pause are handbook engineering synthesis. No new claim of vendor-specific latency, accuracy or probability calibration.

## Knowledge → presentation mapping

- Chapter 03 §3.1.1–3.1.2 → registered `web/assets/ch03-rerank-boundaries.html`, anchor `rerank-boundaries`.
- Chapter 07 §7.13.3 / §7.13.7 → registered `web/assets/ch07-context-budget-guardrails.html`, anchor `context-budget-guardrails`.
- Both use existing prose styles and bilingual attributes. No layout, theme or interaction changes.
- Canonical Markdown is authoritative; fragments and Reader/search JSON are derived presentation.

## Validation

- **Original preservation:** PASS — both archived payloads match their original SHA-256; source notes and inbox links resolve. Originals are retained, not rewritten to hide mistakes.
- **Canonical structure:** PASS — added §3.1.1 / §3.1.2 once; retained Chapter 07 §7.13 numbering and balanced new code fences. No second semantic owner created.
- **Content derivation:** PASS — `npm run sync-content` from `preview/handbook-custom/` produced 12 reader chapters, 50 registered supplements and 142 searchable sections. Each new fragment is registered exactly once; preview and published chapter payloads match and the new anchors are in search.
- **Build:** PASS — `npx tsc -b` and `npm run publish:web` from `preview/handbook-custom/` compiled and refreshed the local `web/site/` artifact. This does not mean a remote deployment occurred.
- **Contracts:** PASS — `npm run test:atlas` and `npm run test:visualizations` from `preview/handbook-custom/`.
- **Repository structure:** PASS — `node web/validate.mjs`: 13 canonical modules, 12 web chapters, 50 fragments, 69 HTML files; no duplicate IDs or broken local references. Whitespace check passes for authored/derived files when original archived payloads are excluded. The retained Rerank source has one pre-existing trailing space in its empty `# ` heading; full-diff whitespace checking reports it. It was kept to preserve the recorded original bytes, not silently normalized.
- **Actual Reader:** PASS — local production preview on port 4189, both new sections at 390 and 1440 pixels in Chinese and English (8 checks). Correct substantive content, one instance per anchor, no Chinese characters in the new English sections, no horizontal overflow. Existing unrelated English sections were not re-audited.
- **Better Design:** not assessed — no Better Design callable tools were present, and plugin discovery did not return that provider. Its dedicated review/comprehension/spacing checks were not performed. This update adds bilingual prose using existing styles; no design-system, CSS, navigation or interaction changes were made.
- **Performance:** no retrieval/LLM benchmark, score calibration experiment or cache-hit experiment was run. Claims are bounded accordingly.

Remaining delivery steps: review/commit and normal release workflow; only after approved mainline integration should the GBrain chapter source be refreshed.

## Delivery boundary

Inbox processing itself did not publish. The user subsequently requested publication on 2026-10-20. A separate release worktree was built from origin/main, carrying only this content update, its archived originals and derived Reader/search payloads. Previously staged UI edits and local Obsidian settings were excluded. Baseline JavaScript/CSS asset hashes are unchanged.

Pre-landing native review found no issues; documentation and raw-payload SHA-256 audit passed. Fresh clean-worktree TypeScript/Vite build, Atlas/visualization contract checks, structural validation and all 8 Chinese/English Reader checks passed. The repository has no release VERSION source, so no version file was invented.

The generic gstack pregate mechanical checks (regeneration, secrets, stray files, literals, timing and guards) passed. Its inferred lane gate is unsupported by this repository's current manual-test configuration: no pregate mapping exists for derived HTML/JSON, and the tool inferred a Linux CI obligation. That tool verdict remains FAIL / not cleared, not a passing test claim. Publication uses the repository's explicit manual validation workflow in MAINTENANCE.md; no tests or workflows were weakened to turn the generic tool green.

Remote merge/deployment outcomes belong in the release report. GBrain remains at the last approved snapshot until a separately authorized source-mirror sync; no index or transcript writes are included in this release.
