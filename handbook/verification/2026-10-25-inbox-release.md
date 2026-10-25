# Inbox content release · 2026-10-25

Scope: publish the reviewed Todo List, RAG temporal-validity and Harness² material, preserving the Agent evaluation role map already merged in PR #84. The source branch incorporates current `main` `09085e1aad11f130b7c0d385f84d90aa84ab6e0f`. Unrelated local previews, Obsidian state and machine configuration are excluded.

## Canonical → Reader mapping

| Canonical owner | Bilingual presentation | Reader section |
|---|---|---|
| Chapter 02 §2.11 | `web/assets/ch02-rag-temporal-validity.html` | `rag-temporal-validity-title` |
| Chapter 08 §8.14.20 | `web/assets/ch08-task-list-state.html` | `task-list-state-title` |
| Chapter 09 §9.21.21–9.21.22 | `web/assets/ch09-harness-self-improvement.html` | `harness-self-improvement-title` |
| Chapter 09 §9.26, existing main | Existing `ch09-agent-eval-role-map.html` | Preserved without duplicate content |

All three additions are registered once in `web/assets/chapter-additions.json`. Each retains the canonical caveats, source boundaries and failure cases. The Harness² cost expression now counts actual probe, judging and reflection costs rather than implying that `k` alone determines execution count. Existing text components and styling are reused. Better Design MCP tools were unavailable in this session; no claim of a Better Design spacing or review pass is made.

## Validation

- `sync-content`: 12 chapters, 59 registered supplements and 151 searchable sections; generated chapter and search payloads updated.
- `npm run build`: TypeScript and Vite completed successfully.
- `npm run publish:web`: refreshed `web/site/` from the current app build and synchronized standalone-diagram CSP.
- `node web/validate.mjs`: 13 canonical modules, 12 web chapters, 59 registered fragments, 78 HTML files; no duplicate IDs or broken local references.
- JavaScript syntax checks passed for `web/assets/app.js`, `search.js`, `handbook-interactions.js` and `web/rebuild.mjs`.
- New generated sections exist in both locales, contain their substantive text, appear in the navigation/search indexes and have no CJK text in their English visible content.
- Chromium against the published artifact: 3 sections × 2 locales × 390/1440px = 12 rendered cases; no page errors or page-level horizontal overflow. This is focused content verification, not a claim of a full application regression run.
- `git diff --check`: passed. Raw inbox payload preservation was checked in the initial review record.

GitHub-hosted automatic checks remain retired under repository policy; this release uses the local checks above. The generated site has Git deployment disabled, so production delivery requires an explicit Vercel deployment of the merged revision. Production status, PR/merge revision and post-merge GBrain readback will be reported after delivery.
