# Roadmap

## Phase 1 — Reframe the project

- [x] Create general AI Engineer Handbook repository
- [x] Define 1–10 as the durable engineering knowledge spine
- [x] Move interview-specific material to a secondary archive model
- [x] Add a general design contract

## Phase 2 — Migrate the current handbook

- [ ] Publish the latest interactive handbook as `web/AI_Engineer_Handbook.html`
- [ ] Rename interview-first product copy to AI Engineer Handbook
- [ ] Preserve the existing technical content, diagrams, bilingual mode, theme, search and responsive behavior
- [ ] Reclassify historical sections 11–19 as study/reference/archive material

## Phase 3 — Build the complete core knowledge spine

- [x] Add a system-level `00 AI Engineering System Framework` so local chapters share one architecture map
- [ ] Add Chapter 01: Model / API / Context Foundations
  - model selection by capability, modality, latency, cost, privacy and hosting constraints
  - prompting / structured outputs / tool-use baseline
  - adaptation decision path: prompt/context/retrieval vs fine-tuning / PEFT / LoRA
  - model/version evaluation before and after adaptation
- [ ] Keep Chapters 02–09 as the current Applied AI / RAG / Agent production spine
- [ ] Add Chapter 10: Serving / Deployment / Security / AI Platform
  - inference serving: queueing, batching, KV/prefix cache, streaming, concurrency, rate limits, warm-up, capacity
  - deployment: registry, artifact lineage, environments, shadow/canary, rollback, config/version governance
  - security operations: identity, tenant isolation, secrets, prompt injection, sandbox/approval, exfiltration, audit
- [ ] Split Chapters 01–10 into maintainable Markdown modules
- [ ] Keep framework-specific details as implementation examples under general engineering principles
- [ ] Add sources / verification notes for claims that depend on current framework behavior

## Phase 4 — Engineering quality

- [ ] Add validation for duplicate IDs and broken anchors
- [ ] Add HTML/JS checks
- [ ] Add responsive regression checks
- [ ] Add a lightweight contribution/update workflow

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
