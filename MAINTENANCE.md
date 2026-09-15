# AI Engineer Handbook Maintenance Workflow

This document is the canonical operating procedure for maintaining this repository.

The goal is to keep durable engineering knowledge, presentation, validation, version control, and deployment in one reproducible workflow so handbook maintenance does not depend on chat history or a particular maintainer's memory.

## Source-of-truth hierarchy

Use this order when deciding what to trust:

1. **GitHub `main`** — current repository state and version history.
2. **`handbook/`** — canonical semantic knowledge and reusable engineering principles.
3. **`DESIGN.md`** — presentation, diagram, responsive, and interaction contract.
4. **`web/`** — derived interactive presentation of handbook knowledge.
5. **Vercel** — delivery layer for preview and production deployment.

A local HTML file, exported artifact, chat attachment, or old conversation is never the primary source of truth.

## Canonical workflow

```text
new article / paper / engineering lesson
        ↓
inspect latest GitHub main
        ↓
research + verify
        ↓
handbook/
semantic merge first
        ↓
decide text / diagram / table / interaction
        ↓
DESIGN.md contract
        ↓
web/ implementation
        ↓
i18n + search + responsive + JS / HTML QA
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

- read the latest relevant files from `main`;
- check whether the concept already exists in the canonical handbook;
- inspect related source-derived supplements before creating new material;
- read `DESIGN.md` before changing presentation or interaction;
- do not start from a stale local HTML export.

The first question is not “where should this new text be appended?” It is:

> What knowledge already exists, and what semantic gap does this source actually fill?

## 2. Research and verify

For each new source, distinguish explicitly between:

- **source fact** — directly supported by the article, paper, course, repository, or documentation;
- **handbook synthesis** — a reusable engineering abstraction derived from the source;
- **implementation example** — framework- or vendor-specific behavior that should not be mistaken for a universal architecture rule;
- **uncertain / time-sensitive claim** — something that should be verified against current primary documentation before inclusion.

When a source gives a product-specific limit, API name, workflow, or benchmark, preserve that provenance. Do not silently turn it into a general system-design law.

## 3. Semantic merge before presentation

`handbook/` owns meaning.

Do not append a new section merely because a new source uses new terminology. First decide whether the material:

- adds a genuinely new concept;
- deepens an existing concept;
- corrects an existing claim;
- provides a better implementation example;
- belongs only in a source-derived supplement;
- is interview-only material that belongs under `archive/interview/`.

Prefer the smallest appropriate semantic home.

### Merge rules

- Avoid duplicate explanations across chapters.
- Preserve cross-chapter canonical rules.
- Keep framework-specific details under general engineering principles.
- Separate architecture from product implementation.
- Preserve trade-offs, failure modes, metrics, control boundaries, and production implications.
- A production bad case is not automatically a regression test; curation and reproducibility are required.
- If the canonical handbook already expresses the reusable principle, deepen the relevant supplement instead of duplicating the core section.

## 4. Decide the right presentation form

Only after the semantic merge, decide how the concept should be presented.

Use `DESIGN.md` as the contract.

Typical mapping:

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

When supplemental fragments are used, ensure they are actually loaded by the chapter runtime and included in search behavior.

## 6. QA before merge

At minimum validate:

### Content

- canonical meaning matches `handbook/`;
- source facts remain distinguishable from handbook synthesis;
- no accidental duplicate section;
- no broken chapter numbering or navigation.

### i18n

- new visible content has valid English equivalents where the site is bilingual;
- English mode contains no unintended Chinese leakage;
- terminology remains semantically equivalent across languages.

### Search

- new content is discoverable by handbook search;
- supplemental fragments are included in the runtime search corpus or rebuilt static index as applicable.

### HTML / JS

- JavaScript syntax checks pass;
- no duplicate IDs;
- no broken anchors or asset references;
- existing interactions still initialize correctly.

### Responsive

Validate the breakpoints defined in `DESIGN.md`, especially narrow mobile widths. There must be no page-level horizontal overflow. Wide tables may scroll inside their own container.

## 7. Git workflow

Default maintenance path:

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
web/<topic>
```

Before merging, confirm that the diff contains only intended files and that automated checks pass.

## 8. CI and preview gates

A pull request should be considered ready only when applicable checks are green, including the repository's English-language audit and Vercel Preview deployment.

A green preview proves that deployment completed; it does not replace semantic review. Inspect the diff and confirm that the intended handbook knowledge is represented correctly.

## 9. Merge and production verification

After merge:

1. confirm `main` points to the expected merge commit;
2. confirm the Vercel production deployment succeeds;
3. verify the stable handbook URL loads;
4. smoke-check the changed chapter, language toggle, search, and responsive presentation when the change affects them.

The maintenance task is complete only after production delivery is verified.

## Repository responsibilities

```text
README.md
  project entry point

MAINTENANCE.md
  canonical maintenance SOP

handbook/
  semantic source of truth

DESIGN.md
  presentation contract

web/
  interactive derived presentation

archive/interview/
  interview-specific secondary material

.github/workflows/
  automated validation

Vercel
  preview + production delivery
```

## Canonical rule

> **Markdown owns meaning. DESIGN.md owns presentation rules. Web owns rendering. GitHub owns version history. Vercel owns delivery.**

And operationally:

> **Semantic merge first; presentation second; validation before merge; production verification last.**
