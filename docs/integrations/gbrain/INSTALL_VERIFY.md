# Safe local installation and verification · GBrain + PGLite (keyless)

**State of this repository:** integration is prepared only. Following this document is opt-in and runs on the operator's own durable computer. No GBrain install, DB initialization, MCP connection or background job is performed by the GitHub repository or CI.

## 0. Preconditions and threat model

- Read current upstream [INSTALL](https://github.com/garrytan/gbrain/blob/master/docs/INSTALL.md), [headless keyless](https://github.com/garrytan/gbrain/blob/master/docs/operations/headless-install.md), [multi-source](https://github.com/garrytan/gbrain/blob/master/docs/guides/multi-source-brains.md) and [memory-boundaries](https://github.com/garrytan/gbrain/blob/master/docs/guides/memory-boundaries.md).
- Use a trusted macOS/Linux computer, with Git, Python 3.10+ and **Bun >= 1.4**. Ensure enough persistent disk for the embedded PGLite database and the exported documents.
- GBrain is installed from \`github:garrytan/gbrain\`, **not** \`npm install -g gbrain\` (the npm package has a different owner).
- Inspect the upstream release/tag, package scripts and permissions before installing. Prefer a **reviewed immutable commit** instead of silently floating with \`latest-stable\`. Do not pipe network downloads to a shell.
- Do not inherit provider secrets, existing brain overrides, or hidden remote-MCP configuration into this local experiment. An existing GBrain installation must be inspected first; do not overwrite/adopt/force-init it.
- Never check the local brain, model API keys, \`.gbrain-source\`, transcript captures or mirror data into the public Handbook.

## 1. Prepare an external, committed, auditable Source mirror

**The exporter is safe to run before installation.** Choose real absolute paths, not literal placeholders. Example using your local Handbook checkout:

~~~bash
REPO="$HOME/src/ai-engineer-handbook"
MIRROR="$HOME/.local/share/ai-engineer-handbook-gbrain-source"

git -C "$REPO" status --short
git -C "$REPO" rev-parse HEAD
# Confirm the selected commit is reviewed main, not an unmerged feature branch.

python3 "$REPO/scripts/gbrain_stage_source.py" \
  --repo "$REPO" --dest "$MIRROR" --ref main

# Review the JSON plan; then explicitly approve local file writes:
python3 "$REPO/scripts/gbrain_stage_source.py" \
  --repo "$REPO" --dest "$MIRROR" --ref main --apply
~~~

Expected result: only \`chapters/00-*.md\` through current canonical chapter files plus \`source-manifest.json\`. Exported pages include immutable Git URLs. **Uncommitted work and archives are not exported.** Files marked \`stale_manual_review\` are never deleted automatically.

GBrain requires a Source path to be a Git checkout with **at least one committed tracked file**. Review and commit the isolated mirror yourself:

~~~bash
git -C "$MIRROR" init -b main           # only if this mirror isn't already a repo
git -C "$MIRROR" status --short
git -C "$MIRROR" diff -- chapters/
git -C "$MIRROR" add chapters/ source-manifest.json
git -C "$MIRROR" diff --cached --stat
git -C "$MIRROR" commit -m "index reviewed Handbook chapters"
git -C "$MIRROR" ls-tree -r --name-only HEAD
~~~

**Do not push this mirror to a remote by default.** Review \`git diff --cached\` before each later commit. The mirror is a derived index, not an edit surface.

## 2. Inspect and install GBrain explicitly (one-time, local)

This is the only step that downloads software. Verify the repository and the immutable commit before approving it.

~~~bash
command -v git
command -v bun
bun --version
# Read the exact upstream release and its installation/package scripts first:
git ls-remote https://github.com/garrytan/gbrain.git refs/tags/latest-stable

# After inspecting the reviewed version and its package scripts:
# bun install -g github:garrytan/gbrain#<REVIEWED_COMMIT>
#
# Official documented fallback (floating release; less reproducible):
# bun install -g github:garrytan/gbrain#latest-stable
~~~

Remove the leading \`#\` **only after reviewing the origin/version**. Do not run GBrain installation commands from CI for this integration. Do not use \`curl ... | bash\`. Do not use GBrain personal-agent bootstrap, auto capture, skillpack install, \`autopilot --install\`, or \`gbrain upgrade\` during initial source validation.

## 3. Initialize a new, isolated local PGLite brain

~~~bash
export GBRAIN_HOME="$HOME/.local/share/gbrain-handbook"
# STOP if that root already contains unrelated GBrain config or a database.
gbrain --version
gbrain init --pglite --no-embedding
gbrain doctor --json
gbrain sources list
~~~

Check the actual resolved config path reported by your pinned CLI. Confirm PGLite is local and embedding is disabled. Missing-provider warning in this deliberate keyless mode is **expected**, not an error that should trigger API-key setup. Do not use \`init --force\` to suppress it.

PGLite is **single-process** for its data directory. Do not run multiple \`serve\` processes and concurrent maintenance commands against the same brain. Close an active server before CLI maintenance, or use the upstream-supported delegation path; never remove a live lock file.

## 4. Register the named isolated source (no implicit federation)

~~~bash
gbrain sources --help
gbrain sources add ai-engineer-handbook --path "$MIRROR" --no-federated
gbrain sources list
gbrain sources status ai-engineer-handbook

# Inspect what would be indexed before allowing changes:
gbrain sync --source ai-engineer-handbook --no-pull --no-embed --dry-run

# After checking the plan and no unexpected paths:
gbrain sync --source ai-engineer-handbook --no-pull --no-embed
# Inspect the mirror Git worktree after sync; some GBrain modes can normalize source files.
git -C "$MIRROR" status --short
~~~

\`--no-federated\` and explicit \`--source\` prevent accidental **default search inclusion**, but **are not access-control enforcement**. Verify Source ID on results. Do not register a bare default brain source instead.

## 5. Readback / provenance / capability verification

~~~bash
gbrain doctor --json
gbrain sources list
gbrain sources status ai-engineer-handbook

# Use distinctive terms known to exist in current canonical chapters:
gbrain search "Agent Context Engineering" --source ai-engineer-handbook --json
gbrain search "KV cache" --source ai-engineer-handbook --json
gbrain search "RAG" --source ai-engineer-handbook --json
~~~

Verify:

1. At least one expected chapter result is returned, with \`source_id=ai-engineer-handbook\`.
2. The hit can be read back to its full staged chapter and cited Git commit.
3. \`source-manifest.json\` SHA-256 matches staged files; indexed pages come only from the committed mirror.
4. Results do **not** imply vector similarity, embedding coverage, external source extraction, or automatic memory capture.
5. A negative query using a name absent from the chapters does not spuriously claim a verified fact.
6. A second process trying to open the same PGLite brain must not be used as a normal operating pattern; any lock/busy warning is handled by serializing work, **not** deleting locks.
7. Changes to canonical \`main\` are **not** automatically pushed into GBrain; only a reviewed mirror commit + explicit sync makes them visible.

\`gbrain bootstrap verify\` may also report capabilities, but interpretation depends on whether a supported agent harness was configured; a CLI-only Source experiment must not be called failed because optional hooks/skills were not installed.

## 6. Optional coding-agent access — separate approval required

Do **not** automatically register a writable MCP server. GBrain's \`--surface verbs\` reduces tool exposure but still contains write verbs such as \`remember\` and \`forget\`; **keyless does not mean read-only**.

If a local coding-agent harness should use this brain later:

- inspect \`gbrain serve --help\`, GBrain's Codex/Claude setup docs, and the host's existing MCP ownership first;
- evaluate \`gbrain setup codex --dry-run\` where applicable, but do not run the write-enabled setup until approved;
- scope the intended Source explicitly with \`GBRAIN_SOURCE=ai-engineer-handbook\`; a user-global plugin may not honor per-checkout dotfiles;
- require operator approval for graph writes; do not let GBrain memories grant GitHub access, tool permissions or policy changes;
- verify one live source-scoped recall in the **actual harness** before claiming integration is active.

Prefer CLI-only source-scoped keyword search until MCP authorization and write boundaries are reviewed.

## 7. Safe upgrades, backup, removal and recovery

- **Before upgrade**: stop all active GBrain processes, preserve a stopped-state full PGLite DB backup and its config/manifest in protected local storage, record exact GBrain/Bun versions.
- **Upgrade review**: inspect upstream migrations and postinstall hooks. Memory-only no-daemon upgrade can use the upstream documented opt-outs: \`GBRAIN_NO_AUTOPILOT_INSTALL=1 GBRAIN_NO_REEMBED=1 gbrain upgrade --no-autopilot-install\`. Execute only after explicit approval and an available rollback plan.
- **Re-index**: regenerate the mirror from an immutable main commit; inspect staged diff, commit, run \`sync --dry-run\`, then apply \`sync --source ... --no-pull --no-embed\`.
- **PGLite corruption**: start with \`gbrain doctor\` and \`gbrain pglite-repair --dry-run\`; do not run \`--yes\`, \`--force\`, or \`reinit-pglite\` without verified backup and approval.
- **Uninstall**: first remove explicit harness registration if any, then stop servers and archive the DB; removing the CLI does not erase the brain or the mirror. Never \`rm -rf\` either path as an automatic cleanup.
- **Incident / accidental exposure**: revoke credentials at their issuing system, audit checkout/mirror/DB/logs/backups, then follow a documented retention/purge workflow. Treat \`forget\` as insufficient for physical deletion.

## Acceptance checklist

- [ ] Reviewed and pinned GBrain install source; no unrelated npm package
- [ ] Source staging dry-run and manual apply reviewed
- [ ] Mirror is committed in an external local Git repository
- [ ] Local PGLite + \`--no-embedding\`, no provider keys
- [ ] Named isolated Source registered; only committed canonical chapters
- [ ] Dry-run sync, actual sync, source-scoped search and provenance readback
- [ ] No remote service, daemon, cron, auto-capture or writable MCP installed
- [ ] Local database backup and restore procedure recorded

Only mark these as checked **after running and verifying them on the real local machine**.
