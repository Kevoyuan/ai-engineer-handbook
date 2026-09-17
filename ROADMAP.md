# Roadmap

## Phase 1 — Reframe the project

- [x] Create general AI Engineer Handbook repository
- [x] Define 1–10 as the durable engineering knowledge spine
- [x] Move interview-specific material to a secondary archive model
- [x] Add a general design contract

## Phase 2 — Stabilize the current web edition

- [x] Publish the handbook as a multipage `web/` site rather than a single exported HTML artifact
- [x] Rename interview-first product copy to AI Engineer Handbook
- [x] Preserve the technical content, diagrams, bilingual mode, theme, search and responsive behavior
- [x] Keep historical interview/reference material outside the core 02–09 technical chapter navigation

## Phase 3 — Build the complete core knowledge spine

- [x] Add system-level `00 AI Engineering System Framework`
- [ ] Add Chapter 01: Model / API / Context Foundations
  - model selection by capability, modality, latency, cost, privacy and hosting constraints
  - prompting / structured outputs / tool-use baseline
  - adaptation decision path: prompt/context/retrieval vs fine-tuning / PEFT / LoRA
  - model/version evaluation before and after adaptation
- [x] Keep Chapters 02–09 as the current Applied AI / RAG / Agent production spine
- [ ] Add Chapter 10: Serving / Deployment / Security / AI Platform
  - inference serving: queueing, batching, KV/prefix cache, streaming, concurrency, rate limits, warm-up, capacity
  - deployment: registry, artifact lineage, environments, shadow/canary, rollback, config/version governance
  - security operations: identity, tenant isolation, secrets, prompt injection, sandbox/approval, exfiltration, audit
- [x] Split active Chapters 02–09 into maintainable canonical Markdown modules
- [x] Retire the manually maintained aggregate semantic manuscript as a compatibility index
- [x] Keep framework-specific details as implementation examples under general engineering principles
- [x] Add source / verification notes for claims that depend on current framework behavior

## Phase 4 — Engineering quality

- [x] Add automated validation for canonical chapter coverage, fragment-manifest integrity, duplicate IDs and broken local references
- [x] Add maintained JavaScript syntax checks to CI
- [x] Use one shared dynamic-fragment manifest across runtime injection, search and rebuild logic
- [x] Remove the stale shadow `web/DESIGN.md`; root `DESIGN.md` is the only design contract
- [ ] Add browser-based responsive regression checks at the DESIGN.md validation widths
- [ ] Add lightweight visual regression coverage for the architecture diagrams
- [ ] Add a generated aggregate/export pipeline if a single-file manuscript is needed again

## Coverage rule

The current 02–09 edition is strongest as a **production Applied AI / RAG / Agent Engineering** handbook. Do not claim complete AI Platform / Model Engineering coverage until Chapters 01 and 10 exist.

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
