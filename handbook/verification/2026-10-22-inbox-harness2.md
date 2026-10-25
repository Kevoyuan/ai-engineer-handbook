# Inbox processing · Harness-level self-improvement (Harness²) · 2026-10-22

## Scope and provenance

Processed one user-supplied inbox note: `handbook/inbox/Google Open-Sources a Framework for Self-Improving Agent Harness.md`. The note is a newsletter summary (beehiiv referral links only). **No author, publication date or article URL was supplied**, so the claim-level authority is the upstream repository and paper, not the note. Its framing ("just open-sourced", benchmark headline numbers) was treated as a pointer, not as technical authority.

- Original: `65e2a20f2336d76f671e2d44f23e7eb0895a576c8d1578c78a39f22e788e9c84`
- Archived: `handbook/inbox/processed/Google Open-Sources a Framework for Self-Improving Agent Harness.md`
- Canonical chapter: `09-reliability-evaluation-observability` → new §9.21.21, plus three `Canonical rules` entries.
- Cross-reference only: `08-agent-orchestration` §8.14.13 (one pointer sentence; no second explanation of the mechanism).

## Semantic triage

The chapter already owned the learning loop: §9.20 (production learning loop), §9.21.1–9.21.20 (trace ≠ experience, candidate schema, promotion router, fast/slow path, promotion state machine, experience eval) and §9.13 (production harness control surface). A GBrain keyword lookup scoped to `ai-engineer-handbook` returned CH08 §8.14 and CH09 §9.13 / §9.21 as the only substantive owners; no chapter discussed *editing the harness itself as a search problem*.

The real gap was therefore narrow: **how candidate harness edits are produced and selected**, and **what a no-ground-truth comparison can and cannot prove**. That gap, not the framework announcement, is what §9.21.21 adds.

| Raw claim | Handling |
|---|---|
| "Google Research open-sourced a framework for self-improving agent harness" | Retained as provenance. README states it is a research release and "not an officially supported Google product"; recorded that way. |
| Four editable areas (instructions/guardrails, memory/skills, tool guidance/scripts, subagents/plugins) | Corrected to the README's **eight** components (system prompt, guardrails, memory, tool guidance, subagents, skills, scripts, plugins) grouped by four runtime roles. The note's four items are a grouping, not the component list. |
| Propose / Probe / Compose | Adopted as the core mechanism; labelled contrastive and ground-truth-free, per README. |
| "Saves lessons from those experiments" | Adopted, but renamed to the README's mechanism: persistent *improvement harness* updated by an *experience reflector*. |
| `EXPERIENCE.md` | **Not confirmed.** The file does not appear in the README. Recorded as an unconfirmed claim; the canonical text does not mention it. |
| Comparison "doesn't require a known correct answer" | Retained together with the note's own caveat, and promoted to a canonical rule: contrast proves behavior change, not correctness. |
| Reuse across tasks via a library | Adopted with the sharper distinction: promote the *evidence* behind a revision, not only the final configuration. |
| Benchmark gains 11.5 / 4.5 / 11.8pp | Retained as author-reported figures with model names and configuration count, explicitly marked as not independently reproduced. |
| "One refinement step improved every evaluated configuration" | Narrowed to the four model–harness configurations in the README; not generalised into a law. |
| Cost of additional refinement | Rewritten as an explicit budget → `cost per successful task` calculation, reusing §9.14's metric. |

## Primary-source verification

Checked on 2026-10-22 against the repository README (`google-research/harness2`, branch `main`) and the paper metadata it cites.

Confirmed:

- Apache-2.0 repository; self-described research release, not an officially supported Google product.
- Two-level recursion: task-level (Propose–Probe–Compose, no ground-truth feedback) and harnessing-level (persistent improvement harness + experience reflector).
- Eight editable components and their four runtime roles.
- Three benchmarks (JobBench, LAB, WorkBuddy-Bench), two executors (OpenCode, Codex), parallel and sequential recursion, `--k` as the task-level recursion budget.
- Reported gains: up to +11.5 (WorkBuddy-Bench), +4.5 (JobBench), +11.8 pp on LAB partial pass rate, for GLM-5 and Gemini 3.5 Flash across four model–harness configurations.
- Result artifacts include adopted harnesses and reflection notes.
- Reproducibility constraint: judge and report must match the refinement run's benchmark, executor, subset, `k`, mode and seed.

Not confirmed / bounded:

- `EXPERIENCE.md` — absent from the README.
- Benchmark numbers — author-reported, no independent replication found.
- **Evaluation validity caveat the note omits:** the README states executor network access is unrestricted, Codex runs with its sandbox disabled, and public benchmark rubrics may be reachable online, and requires configuring network restrictions before evaluation. This is recorded in §9.21.21 as a contamination risk that bounds any score claim.

## Knowledge → presentation mapping

- Canonical: `handbook/chapters/09-reliability-evaluation-observability.md` §9.21.21 (mechanism, two-level recursion, budget, three evaluation boundaries, authority split, interview answer), source-boundary entries under §9.21.22, and three rules under `## Canonical rules`.
- Cross-chapter: `handbook/chapters/08-agent-orchestration.md` §8.14.13 carries one pointer to §9.21.21 so the harness-evolution argument does not fork into a second owner.
- Presentation: **no fragment added.** The Reader presentation for chapter 09 (`web/chapters/09-.../index.html`) is a curated subset that does not carry §9.21 at all — verified by `grep -c "9.21"` returning 0 — so this addition changes canonical meaning without changing the rendered chapter. `sync-content.py` re-ran and produced identical payload counts, i.e. no derived diff.

## Validation

- **Original preservation:** PASS — archived payload matches the recorded SHA-256; the inbox copy was moved, not rewritten.
- **Canonical structure:** PASS — §9.21 subsections are contiguous `9.21.1 … 9.21.22`; §9.21.21 added once; the previous `Source boundary` heading was renumbered to §9.21.22 and now lists both inputs.
- **Code fences:** PASS — `~~~` 74 and ` ``` ` 110, both even.
- **Repository structure:** PASS — `node web/validate.mjs`: 13 canonical modules, 12 web chapters, 55 fragments, 74 HTML files; no duplicate IDs or broken local references.
- **Content derivation:** PASS (no-op) — `sync-content.py` reported 12 chapters, 55 supplements, 147 searchable sections, unchanged from the pre-edit baseline, and `git status` shows no generated diff. `sync-diagram-styles.mjs` and `sync-architecture.mjs` also ran clean.
- **Build / publish:** not run. No presentation input changed, so `web/site` would be byte-identical; a rebuild would only add noise to the diff.
- **Environment note:** `npm run sync-content` fails on this host because the default `python3` lacks `bs4`; the script was run with `/usr/local/bin/python3` (which has bs4 4.14.3). This is a local interpreter-selection issue, not a script defect, and was not "fixed" by editing the script.

Remaining delivery steps: review, feature branch, PR, then the normal merge. `web/site` does not need republishing for this change.

## GBrain status

The index was used for deduplication and not refreshed:

- `gbrain-handbook search` (source-scoped, `--match keyword`) located CH08 §8.14, CH09 §9.13 and §9.21 as the owning material. Keyword-only mode was in effect by design (`embedding_disabled`).
- The source mirror is at `dcfa251` (= `edbb50b`), one commit behind `main` `70f8c90`. That missing commit touched only `scripts/`, `tests/` and `docs/`, so chapter content in the index matches current `main`.
- Refreshing the index is a separate post-merge step per `docs/integrations/gbrain/MAINTENANCE.md`; this pass did not export, sync or write to the brain.
