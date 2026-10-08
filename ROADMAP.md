# Roadmap

## Phase 1 — Reframe the project

- [x] Create general AI Engineer Handbook repository
- [x] Define 1–10 as the durable engineering knowledge spine
- [x] Move interview-specific material to a secondary archive model
- [x] Add a general design contract

## Phase 2 — Stabilize the web delivery pipeline

- [x] Move away from a single exported HTML artifact
- [x] Preserve technical content, diagrams, bilingual mode, theme, search and responsive behavior
- [x] Keep historical interview/reference material outside the core technical navigation
- [x] Establish `preview/handbook-custom/` as the React application source
- [x] Establish `web/site/` as the generated Vercel deployment artifact
- [x] Establish a React build check for pull requests (historical; GitHub Actions workflows retired by choice, build remains a manual pre-merge check)
- [x] Document that `npm run publish:web` is required to refresh the deployable artifact

## Phase 3 — Build the complete core knowledge spine

- [x] Add system-level `00 AI Engineering System Framework`
- [x] Add Chapter 01: Model / API / Context Foundations
  - model selection by capability, modality, latency, cost, privacy and hosting constraints
  - prompting / structured outputs / tool-use baseline
  - adaptation decision path: prompt/context/retrieval vs fine-tuning / PEFT / LoRA
  - model/version evaluation before and after adaptation
- [x] Keep Chapters 02–09 as the current Applied AI / RAG / Agent production spine
- [ ] Complete Chapter 10: Serving / Deployment / Security / AI Platform
  - [x] inference serving foundation: Prefill/Decode, KV cache, cross-request prefix reuse, SGLang RadixAttention, vLLM APC, semantic-cache boundary, multi-tenant cache isolation
  - [ ] inference serving expansion: queueing, continuous batching, streaming, concurrency, rate limits, warm-up, capacity, prefill/decode disaggregation
  - [ ] deployment: registry, artifact lineage, environments, shadow/canary, rollback, config/version governance
  - [ ] security operations: identity, tenant isolation, secrets, prompt injection, sandbox/approval, exfiltration, audit
- [x] Split active Chapters 02–09 into maintainable canonical Markdown modules
- [x] Retire the manually maintained aggregate semantic manuscript as a compatibility index
- [x] Keep framework-specific details as implementation examples under general engineering principles
- [x] Add source / verification notes for claims that depend on current framework behavior

## Phase 4 — Engineering quality

- [x] Add automated validation for canonical chapter coverage, fragment-manifest integrity, duplicate IDs and broken local references
- [x] Add maintained JavaScript syntax checks (historically in GitHub Actions; now executed manually before release)
- [x] Use one shared dynamic-fragment manifest across runtime injection, search and rebuild logic
- [x] Remove the stale shadow `web/DESIGN.md`; root `DESIGN.md` is the only design contract
- [x] Add browser-based responsive regression checks at the DESIGN.md validation widths (390 / 768 / 1440 / 1728) via `evidence/surface-ui-audit.cjs`
- [ ] Reconsider an optional, sustainable automated quality gate if needed; cross-surface browser regression remains runnable manually
- [ ] Add source-figure visual parity checks for complex teaching diagrams (compare topology, labels, connectors, not only bounding boxes)
- [ ] Add lightweight visual regression coverage for the architecture diagrams
- [ ] Add a generated aggregate/export pipeline if a single-file manuscript is needed again



## Phase 5 — AI Engineering Atlas product model

- [x] Reframe the UI from a conventional handbook shell into the AI Engineering Atlas
- [x] Add the four-layer Knowledge Spine: Model → Retrieval & RAG → Agent → Production
- [x] Add dedicated Atlas, Reader, Search / Knowledge Command, and Notebook surfaces
- [x] Add source-grounded Concept routes that connect canonical sections across chapters
- [x] Add concept-first deterministic local search ranking and bilingual match-aware snippets
- [x] Add Reader current-section trace, reading progress, and always-reachable Focus exit
- [x] Keep the full visible chapter identity in the compact auto-hiding topbar, with a screen-reader-only article h1 and no duplicated visible chapter cover
- [x] Strip internal HTML comments before locale transforms and reject leaked `===== CHn =====` markers
- [ ] Extend Notebook from chapter-level saves to section/concept-level saves
- [ ] Expand Concept coverage and relationship visualization without creating a second semantic source

## Coverage rule

The current 01–10 edition now includes the Model / API / Context foundation plus the production Applied AI / RAG / Agent spine. Broader AI Platform coverage is still incomplete until the remaining Chapter 10 serving, deployment, and security-platform sections are complete.

The durable system map is:

```text
Product / Task Outcome
        ↓
Controlled Runtime
  Route · Context · Model/Tools · Validate · Action
        ↓
Knowledge / State / Capabilities
        ↓
Control Plane
  Security · Eval · Observability · Cost · Release
        ↓
Production Learning Loop
        ↓
Platform Foundation
  Model Adaptation · Serving · Deployment · Registry · CI/CD
```

## Core principle

> Build a reusable AI engineering knowledge base first. Interview preparation, company question banks, and recall notes are derived views of that knowledge—not the primary ontology of the repository.
