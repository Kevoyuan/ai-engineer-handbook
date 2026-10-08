# AI Engineering Atlas Maintenance Workflow

This document is the canonical operating procedure for maintaining the repository.

The goal is to keep semantic knowledge, presentation, generated content, application behavior, validation, version control, and deployment in one reproducible workflow so maintenance does not depend on chat history or a particular maintainer's memory.

## Source-of-truth hierarchy

Use this order when deciding what to trust:

1. **GitHub `main`** — current repository state and version history.
2. **`handbook/chapters/*.md`** — canonical technical meaning, one active semantic owner per chapter.
3. **`DESIGN.md`** — visual, diagram, responsive, and presentation contract.
4. **`preview/handbook-custom/UX-CONTRACT.md`** — observable application behavior.
5. **`preview/handbook-custom/`** — React application source and content-derivation logic.
6. **`web/site/`** — generated deployment artifact.
7. **Vercel** — preview and production delivery.

`web/chapters/*`, registered fragments, generated JSON, standalone exports, old conversations, and legacy aggregate manuscripts can be derivation inputs or compatibility artifacts, but they are never independent semantic sources of truth.

## Canonical workflow

```text
new article / paper / engineering lesson
        ↓
inspect latest GitHub main
        ↓
identify owning canonical chapter
        ↓
research + verify
        ↓
handbook/chapters/<chapter>.md
semantic merge first
        ↓
choose prose / table / diagram / interaction
        ↓
DESIGN.md + UX-CONTRACT.md when behavior changes
        ↓
update derived chapter presentation / registered fragments as needed
        ↓
npm run sync-content
        ↓
preview/handbook-custom React source + generated content
        ↓
npm run build + interaction/accessibility checks
        ↓
npm run publish:web
        ↓
web/site generated artifact
        ↓
feature branch + pull request
        ↓
locally run preview build + structural validation + English audit; Vercel Preview if available
        ↓
merge main
        ↓
Vercel production deployment
        ↓
production smoke check
```

## 1. Inspect latest `main` first

Before editing:

- read the latest relevant canonical chapter;
- inspect related presentation fragments and web chapter material already representing the concept;
- check whether the concept already exists under different terminology;
- read `DESIGN.md` before presentation changes;
- read `UX-CONTRACT.md` before route, search, Reader, Notebook, focus, bookmark, or other interaction changes;
- do not start from a stale local export or legacy aggregate manuscript.

The first question is:

> What knowledge already exists, which canonical chapter owns it, and what semantic gap does this source actually fill?

## 2. Research and verify

For each new source, distinguish explicitly between:

- **source fact** — directly supported by the source;
- **handbook synthesis** — reusable engineering abstraction derived from the source;
- **implementation example** — framework- or vendor-specific behavior;
- **uncertain / time-sensitive claim** — something that requires current primary-source verification.

When a source provides a product-specific API, workflow, limit, benchmark, model name, or protocol behavior, preserve provenance. Do not silently turn it into a universal rule.

Verification notes may appear in the Reader when they materially bound a claim, but internal authoring markers or build notes must never appear as reader content.

## 3. Semantic merge before presentation

`handbook/chapters/*.md` owns technical meaning.

Do not create a peer supplement merely because a source introduces a new label. Decide whether the material:

- adds a genuinely new concept;
- deepens an existing concept;
- corrects an existing claim;
- provides a better implementation example;
- belongs as a source/verification note in the owning chapter;
- is interview-only material that belongs under `archive/interview/`.

Prefer the smallest appropriate semantic home.

### Merge rules

- One active chapter has one canonical semantic file.
- Avoid duplicate explanations across chapter files.
- Preserve cross-chapter canonical rules.
- Keep framework-specific detail under general engineering principles.
- Separate architecture from product implementation.
- Preserve trade-offs, failure modes, metrics, control boundaries, and production implications.
- A production bad case is not automatically a regression test; curation and reproducibility are required.
- Concept pages may index and summarize canonical sources but must never become a second technical owner.

## 4. Decide the presentation form

Only after the semantic merge, decide how the concept should be presented.

Use root `DESIGN.md` as the only visual contract.

| Knowledge structure | Preferred presentation |
|---|---|
| Short sequence | numbered flow / compact track |
| Comparison | table / matrix |
| Hierarchy | tree / pyramid |
| State transition | state machine / state patch flow |
| Architecture | layered system diagram |
| Branch / join orchestration | explicit topology |
| Dense reference material | prose + table |
| Cross-chapter concept | Concept index + canonical source trail |
| Optional explanation | disclosure only when core meaning stays visible |

Diagrams and structural UI must express real knowledge relationships rather than decorate the page.

### Reference fidelity when improving diagrams

A supplied article image or reference diagram is evidence for the *information structure*, not merely its colors. Before changing a diagram, record and check:

- the true relationship: Before/After comparison, branch/join, hierarchy, state transition or sequence;
- what each box means, and whether arrow direction represents input, output, possible handoff or a mandatory order;
- which visual groups, prominent nodes, labels, source caveats and authorization boundaries are essential;
- what can become selectable or animated without inventing a mechanism, score or real-world result.

**Do not turn a comparison into parallel numbered timelines or omit informative arrows just to make layouts uniform.** Prefer responsive faithful structure over visual template reuse. Animation may clarify a relationship, but static content and keyboard interaction must preserve its meaning under reduced motion. Keep a useful fallback if an optional dynamic module fails.

## 5. Implement through the current application pipeline

The current UI source is `preview/handbook-custom/`. The deployed artifact is `web/site/`.

### Content path

Current chapter presentation inputs and registered fragments are transformed into bilingual Reader/search payloads by:

```text
preview/handbook-custom/scripts/sync-content.py
```

Run from `preview/handbook-custom/`:

```bash
npm run sync-content
```

Use this after chapter/presentation content changes.

### UI path

Modify React/CSS/interaction code under:

```text
preview/handbook-custom/src/
```

Keep behavior aligned with `UX-CONTRACT.md` and visual choices aligned with `DESIGN.md`.

### Publishing path

A successful source build does **not** update production output.

Before a production-facing merge, run:

```bash
npm run publish:web
```

This rebuilds the app and replaces:

```text
web/site/
```

with the current production artifact. Vercel serves `web/site/` because `web/vercel.json` configures `outputDirectory: "site"`.

## 6. Generated content hygiene

Internal authoring comments are not reader content.

The content-sync generator must:

- remove HTML comments before locale conversion;
- skip BeautifulSoup `Comment` nodes during English transformation;
- reject leaked visible separator markers such as `===== CH7 =====`;
- keep preview payloads and published payloads equivalent.

Never fix a generation leak by editing `preview/handbook-custom/public/content/*.json` or `web/site/content/*.json` by hand. Fix the generator or source presentation and regenerate.

This prevents comments such as:

```html
<!-- ======================= CH7 ======================= -->
```

from becoming visible Reader text after locale conversion.

## 7. Dynamic chapter fragments

Runtime supplemental presentation fragments are registered once in:

```text
web/assets/chapter-additions.json
```

The fragment manifest is a presentation registry, not a semantic source. Every fragment must map back to meaning already owned by the corresponding canonical chapter.

Do not register the same fragment independently in multiple scripts.

## 8. QA before merge

### Content

- canonical meaning lives in the owning `handbook/chapters/*.md`;
- source facts remain distinguishable from synthesis;
- Concept summaries remain grounded in linked canonical sections;
- no accidental duplicate semantic owner;
- no leaked authoring comments or internal separators;
- no broken chapter numbering or navigation.

### i18n

- visible bilingual content has valid equivalents;
- English mode contains no unintended Chinese leakage;
- Chinese and English remain semantically equivalent;
- locale conversion does not expose comments or build metadata.

### Search

- new content is discoverable;
- Concept matches behave according to `UX-CONTRACT.md`;
- dynamic fragments are registered once;
- generated search indexes are refreshed when content changes.

### React application

From `preview/handbook-custom/`:

```bash
npm run build
npm run test:ui
npm run test:a11y
npm run test:concepts
npm run test:learning
```

Run the tests relevant to the changed surface at minimum; substantial UI changes should exercise the full set.

### Repository / published structure

From repository root:

```bash
node web/validate.mjs
node --check web/rebuild.mjs
```

### Responsive

Validate the widths defined in `DESIGN.md`, especially 390, 768, 1440, and 1728px. There must be no page-level horizontal overflow. Wide tables and code may scroll within their own containers.

### Cross-surface UI regression

For broad visual/interaction changes, start the local React server from `preview/handbook-custom/` and run the cross-surface browser test in a second terminal:

```bash
npm run dev -- --port 4180
# in a separate terminal, same directory
node evidence/surface-ui-audit.cjs
```

This script checks Atlas, Notebook, Concept, system architecture and chapters 01–10 at 390/768/1440/1728px across two locale/theme states (112 route × viewport × state combinations), plus search and Notebook interaction flows and six representative automated accessibility surfaces. It is a **manual regression tool, not currently a mandatory CI gate**; do not treat its earlier pass as proof that a later change remains correct.

For affected specialty components also run:

```bash
node evidence/jev-flow-comparison.cjs  # Before/After semantics, connectors, finite animation and accessibility
node evidence/bento/check.cjs         # Chapter 06 skill simulator and state boundaries
```

Before accepting UI work, review the rendered figure against any supplied source graphic. Check both themes and languages, readable node/connector labels, reduced motion, keyboard access, focus, and any content that collapses or scrolls. Verify compactness does **not** truncate meaning or shrink actions below the `DESIGN.md` touch targets. Automated geometry/a11y passes do not substitute for a source-fidelity visual review.

## 9. Git workflow

```text
main
  ↓
feature branch
  ↓
focused commits
  ↓
pull request
  ↓
review source + generated diff
  ↓
local validation + review (+ Vercel Preview if available)
  ↓
merge
  ↓
main
```

Use focused branch names such as:

```text
content/<topic>
docs/<topic>
fix/<topic>
refactor/<topic>
web/<topic>
```

Generated artifacts are expected when the production build changes, but inspect them intentionally rather than treating them as noise.

## 10. Manual validation and Vercel preview

**GitHub Actions automatic workflows were retired at the user's request.** No GitHub-hosted React, English or structural audit automatically runs on pushes or pull requests. Their underlying local scripts and generated artifacts remain available. Before merging a changed UI or chapter, run the relevant checks yourself:

```bash
# From the repository root
node web/validate.mjs
node --check web/assets/app.js
node --check web/assets/search.js
node --check web/assets/handbook-interactions.js
node --check web/rebuild.mjs
node --check web/validate.mjs

# From preview/handbook-custom/
npm install --no-audit --no-fund
npm run build
# For changed Reader/interactive UI, run the relevant browser tests
# with `npm run dev -- --port 4180` running separately:
npm run test:ui
```

The English HTML audit formerly embedded in `.github/workflows/english-language-audit.yml` does not have a standalone local replacement yet: manually review English-mode text and translated artifacts for English-only output (including labels, placeholders and metadata) until this check is extracted into a script. Do not claim language validation passed unless you actually performed it.

Review the PR diff and, when available, Vercel Preview independently. A green React build proves only compilation, not that `web/site` was refreshed. Vercel's build quota and deployment status are unrelated to GitHub Actions. A blocked Vercel preview/production deployment cannot be cleared merely by disabling GitHub Actions.

## 11. Merge and production verification

After merge:

1. confirm `main` points to the expected merge commit;
2. confirm Vercel production deployment succeeds;
3. verify the stable handbook URL loads;
4. smoke-check the changed route/chapter;
5. check language switching when content changed;
6. check search when indexed content changed;
7. check narrow responsive layout when UI changed;
8. confirm generated-content fixes are present in production, not only in preview source.

The maintenance task is complete only after production delivery is verified.

## 12. Fast path by change type

### Semantic/content change

```text
edit canonical chapter
→ update derived presentation if required
→ npm run sync-content
→ validate generated content/search
→ npm run build
→ npm run publish:web
→ PR / manual validation / preview if available
```

### React UI-only change

```text
inspect current DESIGN.md + UX-CONTRACT.md + source figure (when applicable)
→ edit preview/handbook-custom/src
→ update DESIGN.md / UX-CONTRACT.md only if durable contracts changed
→ npm run build + relevant browser tests
→ run evidence/surface-ui-audit.cjs for cross-surface changes
→ inspect source-faithful visual output
→ npm run publish:web and commit web/site
→ PR / manual validation / preview if available
```

### Generator bug

```text
fix sync/publish generator
→ regenerate outputs
→ verify preview and web/site
→ add regression guard
→ PR / manual validation / preview if available
```

Always fix derivation bugs at their source rather than patching generated output.
