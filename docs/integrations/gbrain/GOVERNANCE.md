# GBrain Source Knowledge Governance

Owner: AI Engineer Handbook maintainers · Authority: GitHub `main` canonical chapters · Mode: **derived read-only projection**.

## 1. Source-of-truth matrix

| Content | Authority / write path | GBrain treatment |
|---|---|---|
| Canonical engineering concepts, decision rules, failure modes | `handbook/chapters/*.md` through PR | **Include**, copied from committed revision |
| Chapter 00 system map | Canonical `handbook/chapters/00-*.md` | Include |
| Product UI, diagrams, React/Vite assets | `DESIGN.md`, `preview/`, `web/` | Exclude; no duplicated semantic owner |
| Interview questions, transcripts, pasted source materials | `archive/` and external sources | Exclude by default; can cite from a chapter's vetted source note |
| GitHub PRs, issues, work logs | GitHub | Not ingested by default |
| Personal preferences, access grants, credentials, local MCP setup | local trusted configuration | **Never** included in public source |
| GBrain-generated facts and agent suggestions | ephemeral candidates / separate local lane | Never overwrite canonical text automatically |

A Source is not a tenant boundary or a secret store. `--no-federated` limits default search inclusion; application-level authorization and data classification must still be enforced.

## 2. Provenance schema

Each exported Markdown document retains the complete canonical text and receives a short leading citation:

```text
source_id       ai-engineer-handbook
origin          Kevoyuan/ai-engineer-handbook
origin_path     handbook/chapters/07-memory-context-engineering.md
origin_commit   full 40-character immutable Git SHA
origin_url      github.com/.../blob/<commit>/<path>
source_sha256   digest of staged Markdown (source-manifest.json)
```

This is **origin evidence**, not proof that every claim in the chapter is externally verified. Chapter-level source notes remain required for vendor-specific facts. The manifest contains no local absolute paths, user identifiers, tokens or secrets.

## 3. Knowledge lifecycle

```text
SOURCE (paper / doc / lesson)
→ verify facts separately from synthesis
→ choose one canonical semantic owner
→ PR review: meaning, evidence, provenance, safety
→ merge to main
→ generate committed Source snapshot
→ review manifest + staged Git diff
→ GBrain explicit Source sync
→ validate readback with expected chapter and source ID
→ detect drift / supersede / retire through later Git commits
```

Promotion gate for any proposed memory/fact:

- evidence: exact canonical path + revision and first-party source when warranted;
- owner: owning chapter / maintainer;
- status: proposed / verified / disputed / superseded / retired;
- temporal validity: effective date / revision / known expiration when applicable;
- scope: public-handbook only (not user-private and not host policy);
- conflicts: preserve both positions until evidence or authoritative edit resolves them;
- permission: no model-authored memory changes can expand tool permissions.

Do not silently promote a GBrain confidence score into fact, business authorization, or a repository edit.

## 4. Conflict, correction and deletion

1. If a GBrain retrieval result conflicts with current `main`, **`main` wins**. Record source SHA and explain staleness.
2. Correct the owning chapter in a PR, including its source note; do not directly patch the GBrain mirror or a database page.
3. Re-stage from the new immutable revision. Existing staged files may only be overwritten when their hash matches the previously generated manifest; local manual edits cause staging to refuse.
4. Deleted / renamed chapters appear as `stale_manual_review`. The exporter **does not delete** them. Review the diff, remove old files with `git rm`, commit, then sync; confirm that search no longer serves removed content. If index tombstone handling is uncertain, do not claim deletion complete.
5. Privacy removal has a larger scope than `forget`: audit source Git history, the mirror history, GBrain database/history/backups, generated indexes and caches, under the relevant retention policy. Do not assume removing a Markdown file is an adequate privacy purge.
6. Do not run graph repair, automatic capture or extraction solely to remove warnings from a keyless install.

## 5. Quality gates

For each maintenance snapshot, verify:

- **Completeness**: number of staged canonical chapter pages equals tracked canonical chapter count.
- **Traceability**: each search hit has source_id, chapter path, Git revision and can be traced to the exact commit.
- **No drift**: snapshot reflects the intended reviewed `main` commit; no uncommitted files were indexed.
- **Isolation**: `--source ai-engineer-handbook` returns expected results; cross-source searches require explicit opt-in.
- **Correctness**: sample three test questions tied to Chapter 01, Chapter 07 and Chapter 10, including one negative/non-match query.
- **Safety**: no credential files, session transcripts, PGLite DB, local paths, generated website assets, or unreviewed external notes inside the mirror.
- **Recovery**: old committed mirror and a stopped-state local DB backup can be restored; verify with readback, not just existence.

## 6. What keyless does and does not mean

`--no-embedding` intentionally runs keyword search without a cloud embedding model. It does **not** guarantee zero network activity if the operator installs packages, runs `git pull`, enables a remote MCP, or invokes other network-enabled operations. Installation requires reviewing upstream package provenance; synchronization here explicitly uses local `--no-pull --no-embed`.

No API key also does not equal a read-only tool permission. Do not enable a broad writable GBrain MCP surface without separate host-side authorization and explicit owner approval.

## References

- [GBrain Source attribution](https://github.com/garrytan/gbrain/blob/master/docs/guides/source-attribution.md)
- [Brains and Sources](https://github.com/garrytan/gbrain/blob/master/docs/architecture/brains-and-sources.md)
- [GBrain memory boundaries](https://github.com/garrytan/gbrain/blob/master/docs/guides/memory-boundaries.md)
- Internal semantic owner: `handbook/chapters/07-memory-context-engineering.md`.
