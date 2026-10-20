# Reviewed branch integration · 2026-10-20

Base: `3d6fdc994e1da1cefbdd04ed47be1a745830d4c8` (reviewed main).

This integration combines the useful material from PR71 (`29fd681`) and PR75 (`b96858d`). It preserves current main content and generated registry entries. The older Inspector branch is already represented in main and the navigation proposal has obsolete ten-chapter assumptions; neither is included.

## Knowledge and presentation

| Canonical owner | Presentation | Integration |
|---|---|---|
| CH01 §1.24 | `ch01-model-architecture-axes.html` | Distinguish model taxonomy axes; preserve the SONAR research boundary. |
| CH02 §2.10 | `ch02-enterprise-indexing-context.html` | Entity linkage, provenance, authorized evidence, freshness and false merges. |
| CH07 §7.13.11 | `ch07-validated-context-optimization.html` | Fold content-type compression and the handbook's Compaction Receipt into the existing budget owner. |
| CH09 §9.25 | `ch09-context-cost-benchmark.html` | Reuse §9.14 cost definitions; retain the 38% illustrative input reduction and four-arm experiment. |
| CH12 §12.11.2 | `ch12-order-investigation-capstone.html` and structural lab | Synchronize five responsibility planes and seven authored checks in both locales. |

All four new section numbers are unique. The manifest preserves existing main registrations and registers each addition once. `sync-content` and `publish:web` regenerate Reader/search and deployment artifacts; generated JSON is not hand-edited. Source claims remain separated from engineering synthesis and vendor-reported workload figures.

## Behavioral repairs

- CH06 graph nodes and incoming edges use the same simulator phase boundaries. Before discovery they are idle. Input/authorization failure reaches a blocked gate and selected CLARIFY/REJECT exit while method, tool and verification remain idle. Reference loading does not claim tool execution.
- Added per-phase browser assertions for successful, incomplete-input and unauthorized scenarios. The unrepaired graph fails the new idle-state assertion; the repaired graph passes all scenario phases.
- Corrected CH12 B4/B6 focus tuples to `[zh, en]`; exact focus-text assertions cover both languages.
- Removed the branch's automatic GitHub Actions workflow. Updated obsolete draft-only publishing statements to the existing manual workflow without enabling automatic Vercel deployment.
- Refreshed outdated test assumptions: twelve labs, actual Atlas lab-link selector, an explicit bookmark selector, a configurable test URL, and twelve-chapter surface coverage. Canonical article equality still compares every original node after excluding only optional lesson/mental-model portal containers.

## Executed validation

- `sync-content`: 12 chapters, 54 supplements, 146 searchable sections.
- `build`, `test:atlas`, `test:visualizations`, `test:structures`: passed.
- `test:structure-browser`: 144 scenarios, including corrected CH12 locale focus.
- `test:mental-browser`: 208 scenarios.
- `test:remaining-graphs`: 240 scenarios, including every CH06 phase.
- `test:decision-traces`: 144 scenarios.
- `test:concepts`: 96 responsive/theme/language/motion states plus playback, module failure/retry and lifecycle checks.
- `test:learning`: 60 states covering practice feedback, input/permission boundaries, exact canonical content preservation, keyboard and scoped accessibility.
- `test:ui`: 17 interaction/recovery groups.
- `surface-ui-audit`: 128 route/viewport/locale/theme layouts, Search/Notebook flows and six accessibility surfaces.
- Published artifact served locally: 20 chapter/locale/width cases across CH01/02/07/09/12, English text without CJK leakage in changed content, unique anchors, twelve labs and two search navigation cases.
- `web/validate.mjs`: 13 canonical semantic modules, 12 web chapters, 54 fragments, 73 HTML files; no duplicate IDs or broken local links.
- Syntax checks of legacy app/search/interactions/rebuild scripts and changed test files; `git diff --check`: passed.
- Two native review passes of the repaired content/runtime: no remaining actionable findings. Test-gate changes were inspected separately; no assertion of original article preservation was removed.

## Limits and delivery boundary

Better Design MCP tools are not available in this session. Its dedicated review/spacing protocol was not executed or claimed. Browser geometry, scoped axe checks and representative CH12 compact/desktop screenshots were inspected; these are not Better Design acceptance or manual screen-reader certification. Independent outside-model review was not performed.

The original working directory's tracked patch SHA-256 remains `a9ecc98ce9e9fc5c82697218028920e14ebab0ac4f8ec6d1b8f225ead3a0e87d`, identical before and after this isolated integration. Existing user work was not staged here.

This record covers an integration candidate, not a production release: main is unchanged and there is no deployment or production smoke-test claim. GBrain is unchanged; source synchronization remains a separate step after canonical review and mainline landing.
