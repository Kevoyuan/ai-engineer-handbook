# AI Engineer Handbook Maintenance Workflow

This document is the canonical operating procedure for maintaining this repository.

The goal is to keep durable engineering knowledge, presentation, validation, version control, and deployment in one reproducible workflow so maintenance does not depend on chat history or a particular maintainer's memory.

## Source-of-truth hierarchy

Use this order when deciding what to trust:

1. **GitHub `main`** — current repository state and version history.
2. **`handbook/chapters/*.md`** — canonical semantic knowledge, one module per chapter.
3. **`DESIGN.md`** — presentation, diagram, responsive, and interaction contract.
4. **`web/`** — derived interactive presentation of handbook knowledge.
5. **Vercel** — delivery layer for preview and production deployment.

`handbook/ai_engineer_handbook.md` is a compatibility index only. A local HTML export, old conversation, standalone supplement, or generated artifact is never the primary source of truth.

## Canonical workflow

```text
new article / paper / engineering lesson
        ↓
inspect latest GitHub main
        ↓
identify the owning canonical chapter
        ↓
research + verify
        ↓
handbook/chapters/<chapter>.md
semantic merge first
        ↓
decide text / diagram / table / interaction
        ↓
DESIGN.md contract
        ↓
web/ implementation
        ↓
i18n + search + structural + responsive QA
        ↓
feature branch
        ↓
pull request
        ↓
CI + Vercel Preview
        ↓
merge to main
        ↓
Vercel production deployment
        ↓
production smoke check
```

## 1. Inspect latest `main` first

Before editing:

- read the latest relevant canonical chapter;
- inspect related web fragments and source notes already represented in the chapter;
- check whether the concept already exists under different terminology;
- read `DESIGN.md` before changing presentation or interaction;
- do not start from a stale local HTML export or legacy aggregate manuscript.

The first question is not “where should this text be appended?” It is:

> What knowledge already exists, which chapter owns it, and what semantic gap does this source actually fill?

## 2. Research and verify

For each new source, distinguish explicitly between:

- **source fact** — directly supported by the article, paper, course, repository, or documentation;
- **handbook synthesis** — reusable engineering abstraction derived from the source;
- **implementation example** — framework- or vendor-specific behavior that should not be mistaken for a universal architecture rule;
- **uncertain / time-sensitive claim** — something that should be verified against current primary documentation before inclusion.

When a source gives a product-specific limit, API name, workflow, or benchmark, preserve that provenance. Do not silently turn it into a general system-design law.

## 3. Semantic merge before presentation

`handbook/chapters/*.md` owns meaning.

Do not create a new peer supplement merely because a source introduces a new label. First decide whether the material:

- adds a genuinely new concept;
- deepens an existing concept;
- corrects an existing claim;
- provides a better implementation example;
- belongs as a source note inside the owning chapter;
- is interview-only material that belongs under `archive/interview/`.

Prefer the smallest appropriate semantic home.

### Merge rules

- One active chapter has one canonical semantic file.
- Avoid duplicate explanations across chapter files.
- Preserve cross-chapter canonical rules.
- Keep framework-specific details under general engineering principles.
- Separate architecture from product implementation.
- Preserve trade-offs, failure modes, metrics, control boundaries, and production implications.
- A production bad case is not automatically a regression test; curation and reproducibility are required.
- If a framework-specific source is useful, preserve its provenance in a source note inside the canonical chapter instead of creating a second semantic owner.

## 4. Decide the right presentation form

Only after the semantic merge, decide how the concept should be presented.

Use the **root `DESIGN.md`** as the only design contract. Do not create a second `web/DESIGN.md` shadow specification.

| Knowledge structure | Preferred presentation |
|---|---|
| Short sequence | numbered flow / compact track |
| Comparison | table / matrix |
| Hierarchy | tree / pyramid |
| State transition | state machine / state patch flow |
| Architecture | layered system diagram |
| Branch / join orchestration | explicit topology |
| Dense reference material | prose + table, not decorative cards |
| Optional explanation | expandable reference note only when core meaning remains visible |

Diagrams express knowledge structure; they are not decoration.

## 5. Implement in `web/`

The web layer is derived from handbook semantics.

Requirements:

- preserve Chinese / English semantic equivalence;
- reuse existing visual tokens and diagram grammar;
- do not introduce a new visual system for one source;
- do not hide core content behind interactions;
- preserve technical node order, control boundaries, and failure semantics;
- keep vendor names clearly labeled as examples when appropriate.

### Dynamic chapter fragments

Runtime chapter fragments are registered once in:

```text
web/assets/chapter-additions.json
```

`app.js`, `search.js`, and `rebuild.mjs` consume the same manifest. Do not add a fragment path independently to multiple JavaScript files.

The fragment manifest is a **presentation registry**, not a semantic source. Every fragment must map back to meaning already owned by the corresponding canonical chapter.

## 6. QA before merge

At minimum validate:

### Content

- canonical meaning lives in the owning `handbook/chapters/*.md` file;
- source facts remain distinguishable from handbook synthesis;
- no accidental duplicate semantic owner;
- no broken chapter numbering or navigation.

### i18n

- new visible content has valid English equivalents where the site is bilingual;
- English mode contains no unintended Chinese leakage;
- terminology remains semantically equivalent across languages.

### Search

- new content is discoverable by handbook search;
- dynamic fragments are registered in `chapter-additions.json`;
- build-time and runtime search use the same fragment registry.

### Structural QA

Run:

```text
node web/validate.mjs
```

The structural audit checks canonical chapter coverage, manifest integrity, duplicate IDs across base pages + injected fragments, and broken local asset/page references.

### JavaScript

Run syntax checks for maintained scripts (`app.js`, `search.js`, `rebuild.mjs`, `validate.mjs`, interaction scripts).

### Responsive

Validate the breakpoints defined in `DESIGN.md`, especially narrow mobile widths. There must be no page-level horizontal overflow. Wide tables may scroll inside their own container.

## 7. Git workflow

```text
main
  ↓
feature branch
  ↓
commits
  ↓
pull request
  ↓
review diff
  ↓
CI + Vercel Preview
  ↓
merge
  ↓
main
```

Use a focused branch name such as:

```text
content/<topic>
docs/<topic>
fix/<topic>
refactor/<topic>
web/<topic>
```

Before merging, confirm that the diff contains only intended files and automated checks pass.

## 8. CI and preview gates

A pull request is ready only when applicable checks are green, including:

- English-language audit;
- repository structural audit;
- Vercel Preview deployment.

A green preview proves deployment completed; it does not replace semantic review or visual inspection.

## 9. Merge and production verification

After merge:

1. confirm `main` points to the expected merge commit;
2. confirm Vercel production deployment succeeds;
3. verify the stable handbook URL loads;
4. smoke-check the changed chapter, language toggle, search, and responsive presentation when affected.

The maintenance task is complete only after production delivery is verified.
