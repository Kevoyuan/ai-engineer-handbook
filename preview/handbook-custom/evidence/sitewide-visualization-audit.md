# 全站概念图与结构表达审计 · Source-first / 2026-10-09

**Scope:** all 12 canonical `web/chapters/*/index.html`, their reader React lab registrations, `handbook/chapters/*.md`, and `DESIGN.md` on branch `design/structural-atlas-ch05-09-12-20261009`. Static source audit; not a claim that every legacy canvas has been inspected on all devices. User requested maximum clarity while preserving production deployment quota.

## Outcome and invariants

The current source branch provides **12/12 primary Atlas Lab entries** after adding CH01/CH02. CH07 and CH11 have a **second explanatory view** (`#concept-extension`) without duplicating `#concept-demo`. CH05, CH09, CH12 are newly implemented chapter-local topology labs in the same draft PR.

`web/vercel.json` intentionally retains `git.deploymentEnabled=false`. This work has no Vercel deployment, no production rebuild, and no generated `web/site` change. A newly registered Atlas Lab is not visible on production until a future deliberate site build + manual Vercel deployment.

### Canonical model: one visual structure per reasoning problem

| Chapter | Primary concept need | Visual form | Source anchor / entry | Implementation in draft | Remaining review |
|---|---|---|---|---|---|
| 01 · Model & Context | Usable budget is not model context size | Responsibility allocation rail | `#context-budget` | **New 3-case primary Lab** | Verify confusion between “capacity” and “attention” |
| 02 · Retrieval | Permission is checked before retrieval and again on fetch | Trusted authorization funnel | `#fig-2-1` | **New 3-case primary Lab** | Evaluate domain-specific ACL cache revalidation |
| 03 · Query Routing | When to select / skip a retrieval path | Branch selection / failure recovery | `#concept-demo` | Existing V2 decision trace retained | Legacy BFS + branch tree need screenshot-density review |
| 04 · Evidence Gates | Six gates vs response/abstention | Six-gate decision tree | `#concept-demo` | Existing V2 retained | Verify conditional block color contrast |
| 05 · PDF RAG | Claim citation must resolve to a source element | Five-stage provenance lineage | `#fig-5-2` → `#concept-demo` | **New V3 primary Lab** | Audit static figures `fig-5-1..5` for redundant captions |
| 06 · Skills & MCP | Capability match ≠ authorization | Control / policy / tool boundary | `#concept-demo` | Existing simulator / concept diagrams retained | Separate Tool Protocol vs Skill method vs runtime policy |
| 07 · Memory | Different ownership and lifetime of write / read / correction | Dual governance lanes | `#memory-promotion-compaction` → `#concept-extension` | **New supplemental 3-case mental model**, old Lab intact | Audit long Archify memory canvas and overlap with six-layer memory |
| 08 · Agent | Retry and stop must be bounded | Round-aware transition trace | `#concept-demo` | Existing V2 retained | Visual check against static `fig-8-*` alternatives |
| 09 · Evaluation | Diagnose first failed Run before release decision | Trace tree beside Eval/Release loop | `#fig-9-1` → `#concept-demo` | **New V3 primary Lab** | Review legacy dense `fig-9-1/2/4/5` hierarchy for duplicates |
| 10 · Serving | Prefix KV ≠ semantic or session cache | Prefix divergence / cache-key decision | `#fig-10-1` → `#concept-demo` | Existing V2 cache Lab retained | Sandbox threat/permission boundary remains a separate diagram candidate |
| 11 · Data & SQL | CDC arrival order ≠ mutation order ≠ business time | Parallel sequence and history tracks | `#data-etl-cdc` → `#concept-extension` | **New supplemental 4-case timeline**, old data contract Lab intact | Add separate Text-to-SQL query plan / authorization view only if not duplicative |
| 12 · FDE Delivery | Which plane owns each side effect and evidence | Five planes + B1–B7 trust checks | `#fde-framework` → `#concept-demo` | **New V3 primary Lab**, corrected canonical wording | Map checks to incident / human approval controls in a future review |

## Keep / Fix / Quick Wins

**KEEP** authored chapter figures as the semantic fallbacks, the one-primary-Lab-per-chapter route contract, full chapter text, bilingual/dark design tokens, and explicit examples instead of fake performance figures.

**FIX FIRST (now implemented)** missing CH01/02 primary Lab coverage, missing Memory read-vs-write contract, missing CDC source-vs-ingest order, inaccurate CH12 “four planes” heading, and CH09 selected-state text contrast.

**QUICK WINS (not yet implemented):**
1. Deduplicate figures that repeat exactly the same concept immediately before/after an interactive lesson; preserve one static summary and one optional deep interaction.
2. Visually regroup very dense authored BFS canvases in CH03, CH05, CH06, CH08 and CH09 using neutral surface tokens, not by changing their factual content.
3. Improve CH10 sandbox trust-boundary figure and CH11 Text-to-SQL authority/SQL plan figure where the current chapter prose is notably denser than accompanying drawings.
4. Consolidate static chart/table captions and source provenance; avoid claiming that a ranked similarity score proves a Claim.
5. Browser-verify keyboard navigation, screen-reader heading order, zoom 200%, RTL-safe connectors, long translations and mobile drawer interaction across the *whole* reader (the current component-scoped axe scans do not certify entire-page WCAG conformance).

## Grounding boundaries

These diagrams are **teaching projections of authored sections**, not an executed pipeline, a measured benchmark, a customer production incident or a universal product contract. CH07 Ledger + Views is a recommended audit design, not mandatory. CH11 sequence-domain SCD2 intervals must not be read as physical timestamps. CH12 seven checks are authored capstone review criteria rather than a standardized service-to-service contract.

## Verification

- `npm run sync-content`: chapter metadata / actual article source
- `npm run test:atlas`: 12 canonical chapters, 12 primary Lab flags
- `npm run test:visualizations` / `test:structures`: source contracts
- `npm run build`: TypeScript and Vite
- `npm run test:structure-browser`: 144 prior V3 scenario assertions
- `npm run test:mental-browser`: 208 new V3.1 scenario assertions
- Recorded 390, 768, 1440, 1728px, both locales and themes for scope; 390 zh/light and 1440 en/dark screenshot/axe cases for each chapter
- Never run `publish:web` for these code-only changes.
