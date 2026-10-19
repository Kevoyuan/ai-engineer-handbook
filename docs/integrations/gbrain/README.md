# GBrain local Source · AI Engineering Atlas

Status: **prepared, not installed** · Mode: **local PGLite, keyless / keyword-only** · Updated: 2026-10-19

This integration is a **derived, opt-in local retrieval projection** of the public AI Engineer Handbook. It does not change the published Atlas, create a cloud service, or give a model permission to edit canonical chapters.

## Ownership topology

```text
GitHub main (canonical authority)
  └── handbook/chapters/[00–12]-*.md
          │  read committed Git blobs only
          ▼
scripts/gbrain_stage_source.py   (dry-run by default)
          │  explicit --apply
          ▼
LOCAL external Git mirror          (not in this repo)
  ├── chapters/00-...md
  ├── chapters/07-...md
  └── source-manifest.json         (commit / sha256 / provenance)
          │  manually review + git commit
          ▼
GBrain Source: ai-engineer-handbook --no-federated
          │  explicit sync --source ... --no-pull --no-embed
          ▼
local keyless PGLite Brain (outside checkout)
          └── keyword lookup / saved facts (NO embeddings)
```

GBrain defines a **brain** (database) separately from a **source** (content repository inside that database). This integration chooses the source ID `ai-engineer-handbook`, not the default shared source. The source is **isolated** rather than federated, but that is a retrieval routing preference—not a security access-control boundary.

## Invariants

- GitHub `main` and `handbook/chapters/*.md` remain canonical; Chapter 07 owns memory/context semantics.
- Exports include **committed public canonical Markdown only**. Excluded: `archive/`, `examples/`, `preview/`, `web/`, files outside `handbook/chapters/`, untracked/uncommitted edits and dotfiles.
- Every exported page carries immutable repo/path/commit provenance; the mirror manifest records SHA-256. Nothing from GBrain is automatically pushed to GitHub.
- **No API keys, vector embeddings, paid extraction, automated transcript capture, hosted brain, daemon, cron, shell hooks or MCP registration** during preparation.
- No cross-source search by default. Use `--source ai-engineer-handbook` explicitly; verify in CLI and, if enabled later, in the actual host.
- No live data inside the public mirror; private notes and user-specific memories belong to a separately governed brain.
- Local GBrain state and mirror are outside the checkout, never committed or deployed via Vercel.

## Files

- [GOVERNANCE.md](./GOVERNANCE.md) — source authority, metadata, promotion, conflict, deletion, security.
- [INSTALL_VERIFY.md](./INSTALL_VERIFY.md) — opt-in local installation and readback validation; no commands are executed by the repository.
- [MAINTENANCE.md](./MAINTENANCE.md) — review, sync, rollback, incident and upgrade cadence.
- `scripts/gbrain_stage_source.py` — default read-only exporter with explicit `--apply`.
- `tests/test_gbrain_stage_source.py` — safety tests; standard-library only.

## Source-first maintenance

```text
new source / user lesson
→ verify + edit canonical chapter
→ PR + CI + merge to main
→ export local snapshot from reviewed commit
→ inspect diff + commit mirror
→ gbrain sync --source ai-engineer-handbook --no-pull --no-embed
→ test source-scoped keyword retrieval + provenance
```

**Never fix a Handbook knowledge error by only editing the GBrain database.**

## GBrain references

- [GBrain installation](https://github.com/garrytan/gbrain/blob/master/docs/INSTALL.md)
- [Keyless headless install](https://github.com/garrytan/gbrain/blob/master/docs/operations/headless-install.md)
- [Multi-source brains](https://github.com/garrytan/gbrain/blob/master/docs/guides/multi-source-brains.md)
- [Brains vs Sources](https://github.com/garrytan/gbrain/blob/master/docs/architecture/brains-and-sources.md)
- [Memory boundaries](https://github.com/garrytan/gbrain/blob/master/docs/guides/memory-boundaries.md)

Vendor behavior is version-specific. Check help output of the exact pinned installation before operating.
