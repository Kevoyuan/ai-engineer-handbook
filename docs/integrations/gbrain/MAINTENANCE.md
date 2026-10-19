# GBrain local Source · Maintenance Runbook

Applies to: isolated keyless PGLite Source \`ai-engineer-handbook\`. Never replaces repository \`MAINTENANCE.md\`.

## 1. Normal change flow

\`\`\`text
Input (article / bug report / observed regression)
  → locate canonical chapter in main
  → verify first-party facts + source boundary
  → semantic PR
  → review + CI + merge main
  → record merged Git SHA
  → stage snapshot from that SHA (dry-run first)
  → apply snapshot and review external mirror diff
  → git commit mirror locally
  → gbrain sync --source ai-engineer-handbook --no-pull --no-embed --dry-run
  → explicit sync
  → review local mirror for any sync-created working-tree changes
  → source-scoped keyword and provenance readback
\`\`\`

No automatic GBrain-to-GitHub reverse sync is permitted. In particular, GBrain \`put\`, \`remember\`, and graph extraction outputs are *candidates* only and cannot become canonical content without normal chapter PR review.

## 2. Maintenance cadence

This integration creates **no recurring process**. A manual sync may be requested after a mainline knowledge merge; it is not a requirement for every website/CSS change.

When a future schedule is explicitly approved, run it on the one designated local brain owner, serialize DB access, and report:

- source revision and sync status;
- count of imported/updated/deleted/held/failed files;
- first-party source-scoped lookup results;
- drift, stale index and missing provenance;
- whether any unavailable capability is expected in deliberate keyless mode.

Do not silently enable \`autopilot --install\`, \`sync --watch\`, cloud embedding/extraction, automatic transcript capture, ambient hooks or multi-agent concurrent writers.

## 3. Review and conflict gates

| Condition | Action |
|---|---|
| Canonical chapter has been corrected | Export from new \`main\` commit, review diff, sync |
| Generated Web differs from canonical chapter | Fix content derivation in standard Handbook workflow, not GBrain |
| GBrain result contradicts current main | Mark stale; source of truth remains main |
| A chapter is renamed/deleted | Export reports \`stale_manual_review\`; manually review \`git rm\` and verify tombstone after sync |
| Staged file has local edits | Exporter refuses overwrite; compare source and preserve provenance |
| GBrain DB is locked | Wait/serialize; never remove live lock |
| Keyless doctor reports missing embedding provider | Expected capability limitation; do not create API key |
| Sync skips/holds/blocks a file | Inspect source status and diagnostics; no \`--skip-failed\` shortcut without documented exception |
| Tool/retrieval seems too permissive | Disable or narrow MCP surface; confirm Source routing and host permissions |

## 4. Negative tests and failure injection

Run against disposable local test data, **not** on the authoritative brain:

1. Untracked/private file in the Handbook checkout is not staged.
2. Uncommitted modification to a tracked chapter is not staged.
3. Symlinked destination path is rejected.
4. Output inside the checkout is rejected.
5. Locally edited staged page is not silently overwritten.
6. A stale chapter is reported for manual removal, never silently deleted.
7. Keyless state produces keyword hits without sending content to an embedding provider.
8. A wrong or missing \`--source\` does not count as a successful isolated Source verification.
9. A second process does not corrupt the brain via unsafe lock workarounds.

Run local pure-Python safety tests:

~~~bash
python3 -m unittest discover -s tests -p 'test_gbrain_stage_source.py' -v
~~~

## 5. Recovery

If local GBrain search misses an expected committed page, inspect in order:

~~~text
canonical Git SHA
→ exported source-manifest.json
→ mirror git status / commit
→ gbrain sources list + status
→ sync --source ... --no-pull --no-embed --dry-run
→ doctor --json
→ source-scoped search/readback
~~~

Never interpret a stale index as permission to synthesize an answer or alter the source of truth. Do not force schema migration, broad re-embedding or re-init to chase a green score. For PGLite WAL issues, inspect documented recovery and take a stopped-state backup before an approved repair.

## 6. Record template (local only; do not commit machine-specific metadata)

\`\`\`text
Handbook main SHA:
Exported document count:
Mirror commit SHA:
GBrain binary version / Bun version:
Brain engine / home: [redacted location or approved local identifier]
Source ID / federation setting:
Dry-run result:
Sync result:
Readback sample (query / slug / origin commit):
Excluded content audit:
Open holds / failures:
Owner review + date:
\`\`\`

The machine path, GBrain config, source mount details and logs can contain sensitive information; keep the record under local operator control.
