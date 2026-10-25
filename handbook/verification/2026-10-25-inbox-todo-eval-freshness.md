# Inbox review · Todo list, Agent evaluation roles, RAG temporal validity

Date: 2026-10-25. Three user-supplied raw notes were reviewed against current canonical chapters. GBrain MCP reported `lock_held` by another live `gbrain serve`; the index was not queried or modified. Canonical chapter inspection and `rg` were the documented fallback. The raw source files had no independently verifiable original publication metadata except the evaluation note's Douyin link; original bytes are retained after the header in each processed copy.

| Raw note | Original SHA-256 | Disposition |
|---|---|---|
| `Agent 的 Todo List 有什么用？.md` | `7aa1b4753ea34ad309e7ec146c73d5700e84841e11094b90e383cc70fc66618a` | Integrated into Chapter 08 §8.14.20 with vendor-specific claims checked against DeepSeek's own code and package README. |
| `Agent评测岗位.md` | `9b544ad3205ccd4610ef4793ba21353027ecf8c173dea595531920ce548a28e8` | Reviewed, no canonical addition. The latest main already owns the role map in Chapter 09 §9.26 (PR #84); the release reuses it. Employer examples, salary, scarcity and hiring trend were not verified and were not promoted. |
| `如何从根源上保障RAG系统的知识时效性.md` | `b47b3c233a60c067fc7eec595ffe360d61774c89f8645cf7f4eba2f432f99c5b` | Integrated the missing distinction between index freshness and business validity into Chapter 02 §2.11. Interview rhetoric and vendor-independent implementation claims were not promoted. |

## Source and correction boundaries

- DeepSeek's [`todo_write` implementation](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/todo/tool-todo/src/index.ts), [package reference](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/todo/tool-todo/README.md) and [todo subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/todo.md) support whole-list replacement, the two-field item, three statuses, validation, explicit parallelism choice, per-session ownership and event projection. They do not establish that all Agent todo tools use this API. The raw note's checkpoint template and categorical “Plan mode should not use Todo” rule were not independently confirmed and are omitted.
- [Manus's own article](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus) describes repeatedly updating `todo.md` to keep goals recent. It is a reported design rationale, not a measured universal effect.
- The RAG note supplied no original author, URL, date or primary technical source. Chapter 02's additions are explicit handbook synthesis: `as_of` validity, source authority, supersession, query and answer checks, and failure cases. A “temporal vector database” and a cross-system atomic transaction are not prerequisites. Whether transactionality exists depends on the chosen source, event stream and index.
- The Agent evaluation hiring note has a secondary short-video link only. The four job functions are a useful taxonomy but do not add a new engineering rule beyond Chapter 09. No salary or market claim was verified.

## GBrain and publication

After the initial review, the user authorized stopping the lock-owning GBrain sessions and updating the index. The mirror was exported from committed `main` `70f8c901b52a9510eff81abab53c5dd3472c7a5a`, reviewed, and committed locally as `e9342392f997a5d8d1f65f79c48aba188c2ec1d3` (13 chapters; no stale paths). Explicit source-scoped sync completed: 13 modified, 412 chunks created, 0 added/deleted. `sources status` confirmed `source_id=ai-engineer-handbook`, federation disabled, 13 pages, 412 chunks, 0 embedded chunks, no failures, and last sync at `2026-10-25T10:24:17.790Z`. Keyword readback for `revocation-to-denial SLI` returned Chapter 02 with the expected source ID and a keyword exact hit; `KV cache` returned current chapter content carrying origin commit `70f8c901b52a9510eff81abab53c5dd3472c7a5a`. The external mirror worktree is clean.

GBrain indexes committed `main` only. Therefore this pass's new local edits to Chapters 02 and 08 are intentionally not in the snapshot; they can be indexed after review and merge. The raw inbox and verification records remain excluded. GBrain reported existing chapter-size warnings and a 100-fence parsing cap on some large chapters; the sync succeeded, but those limits may affect completeness of individual chunk excerpts.

Publication follow-through is recorded in `2026-10-25-inbox-release.md`, including the bilingual Reader mapping, validation and delivery status.
