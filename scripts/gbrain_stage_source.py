#!/usr/bin/env python3
"""Stage an auditable GBrain Source mirror from committed handbook chapters.

Read-only by default. Never installs software, contacts a network, or touches a brain DB.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

SOURCE_ID = "ai-engineer-handbook"
ORIGIN = "Kevoyuan/ai-engineer-handbook"
CHAPTER = re.compile(r"handbook/chapters/[0-9]{2}-[a-z0-9-]+\.md\Z")
MAX_BYTES = 2 * 1024 * 1024


class StageError(Exception):
    pass


def git(repo: Path, *args: str) -> bytes:
    p = subprocess.run(["git", "-C", str(repo), *args], capture_output=True)
    if p.returncode:
        raise StageError(f"git {' '.join(args[:2])} failed: {p.stderr.decode(errors='replace').strip()}")
    return p.stdout


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def ensure_safe_destination(repo: Path, dest: Path) -> None:
    if not dest.is_absolute():
        raise StageError("--dest must be an absolute, external directory")
    resolved = dest.resolve()
    repo_real = repo.resolve()
    if resolved in (Path("/"), Path.home().resolve(), repo_real):
        raise StageError("Refusing a root, home, or source checkout as destination")
    if resolved.is_relative_to(repo_real):
        raise StageError("Destination must be outside the source repository")
    for path in (dest, *dest.parents):
        if path.is_symlink():
            raise StageError(f"Destination path contains symlink: {path}")
    if dest.exists() and not dest.is_dir():
        raise StageError("Destination exists but is not a directory")


def source_docs(repo: Path, revision: str) -> tuple[list[tuple[str, bytes]], str]:
    commit = git(repo, "rev-parse", "--verify", f"{revision}^{{commit}}").decode().strip()
    listing = git(repo, "ls-tree", "-r", "-z", "--full-tree", commit, "handbook/chapters/")
    docs = []
    for entry in listing.split(b"\0"):
        if not entry:
            continue
        meta, name = entry.split(b"\t", 1)
        mode, kind, oid = meta.decode().split()
        path = name.decode("utf-8")
        if not CHAPTER.fullmatch(path):
            continue
        if mode not in ("100644", "100755") or kind != "blob":
            raise StageError(f"Refusing non-regular Git entry: {path} ({mode})")
        body = git(repo, "cat-file", "blob", oid)
        if not body or len(body) > MAX_BYTES:
            raise StageError(f"Invalid chapter size: {path} ({len(body)} bytes)")
        try:
            body.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise StageError(f"Non-UTF8 chapter: {path}") from exc
        rel = "chapters/" + Path(path).name
        reference = f"https://github.com/{ORIGIN}/blob/{commit}/{path}"
        prefix = (
            "> **Indexed copy — not an authoritative editing surface.**  \n"
            f"> Source: [{path}]({reference})  \n"
            f"> Git commit: {commit} · Source ID: {SOURCE_ID}  \n"
            "> Changes must be reviewed and merged in the canonical Handbook first.\n\n"
        ).encode("utf-8")
        docs.append((rel, prefix + body))
    if not docs:
        raise StageError("No committed canonical chapters found at the selected revision")
    return sorted(docs), commit


def stage(repo: Path, dest: Path, revision: str, apply: bool) -> dict:
    ensure_safe_destination(repo, dest)
    top = Path(git(repo, "rev-parse", "--show-toplevel").decode().strip()).resolve()
    if top != repo.resolve():
        raise StageError("--repo must be the Git repository root")
    documents, commit = source_docs(repo, revision)
    manifest_file = dest / "source-manifest.json"
    old: dict[str, str] = {}
    if manifest_file.exists():
        if manifest_file.is_symlink():
            raise StageError("Refusing symlinked manifest")
        previous = json.loads(manifest_file.read_text(encoding="utf-8"))
        if previous.get("source_id") != SOURCE_ID:
            raise StageError("Destination belongs to another source; refusing overwrite")
        for row in previous.get("documents", []):
            name = row.get("path", "")
            if not re.fullmatch(r"chapters/[0-9]{2}-[a-z0-9-]+\.md", name):
                raise StageError("Malformed previous manifest path")
            old[name] = row.get("staged_sha256", "")
    manifest = {
        "source_id": SOURCE_ID,
        "origin": ORIGIN,
        "source_commit": commit,
        "mode": "local-keyless-pglite-keyword-only",
        "documents": [{"path": name, "staged_sha256": sha(body)} for name, body in documents],
    }
    updates = []
    for name, body in documents:
        target = dest / name
        if target.is_symlink():
            raise StageError(f"Refusing symlinked target: {name}")
        if target.exists():
            if not target.is_file():
                raise StageError(f"Refusing non-file target: {name}")
            existing_hash = sha(target.read_bytes())
            if existing_hash == sha(body):
                status = "unchanged"
            elif old.get(name) == existing_hash:
                status = "update"
            else:
                raise StageError(f"Local edits or unowned target detected: {name}; reconcile manually")
        else:
            status = "add"
        updates.append({"path": name, "status": status})
    stale = sorted(set(old) - {name for name, _ in documents})
    # No automatic deletions: old pages require review, git rm, commit and sync.
    if apply:
        dest.mkdir(parents=True, exist_ok=True)
        (dest / "chapters").mkdir(exist_ok=True)
        for name, body in documents:
            if next(x for x in updates if x["path"] == name)["status"] != "unchanged":
                (dest / name).write_bytes(body)
        manifest_file.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return {
        "applied": apply,
        "source_id": SOURCE_ID,
        "source_commit": commit,
        "document_count": len(documents),
        "operations": updates,
        "stale_manual_review": stale,
        "next": "Review and git commit in the external mirror, then sync the named GBrain Source explicitly" if apply else "Rerun with --apply after reviewing this plan",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", required=True, type=Path, help="Absolute path to canonical Git checkout root")
    parser.add_argument("--dest", required=True, type=Path, help="Absolute path to an external local Source mirror")
    parser.add_argument("--ref", default="HEAD", help="Committed Git revision (default: HEAD)")
    parser.add_argument("--apply", action="store_true", help="Write staged documents; never install, sync, or commit")
    args = parser.parse_args()
    try:
        result = stage(args.repo, args.dest, args.ref, args.apply)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except (StageError, OSError, ValueError, TypeError) as exc:
        print(f"GBrain Source staging refused: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
