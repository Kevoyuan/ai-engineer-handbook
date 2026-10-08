#!/usr/bin/env python3
"""Check the 167-topic FDE evidence audit against the canonical repository.

This validates provenance/location signals, NOT topical correctness or completeness.
No network, API credentials, Vercel deployment, or model judge required.
"""
from collections import Counter
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CROSSWALK = ROOT / "handbook/references/fde-2026-concept-crosswalk.md"
AUDIT = ROOT / "handbook/references/fde-2026-coverage-audit.md"
CHAPTERS = sorted((ROOT / "handbook/chapters").glob("*.md"))
CHAPTER_LINES = {p.name[:2]: p.read_text().splitlines() for p in CHAPTERS}

cross = CROSSWALK.read_text()
text = AUDIT.read_text()
source_rows = re.findall(r"^\| (.+?) \| CH(\d\d) —", cross, flags=re.M)
audit_rows = re.findall(
    r"^\| (.+?) \| (.+?) \| CH(\d\d) \| ([HBN]) \| (CHECK|—) \| (P0|P1) \| (.*?) \|$",
    text, flags=re.M,
)
assert len(source_rows) == 167, f"source inventory count {len(source_rows)}"
assert len(audit_rows) == 167, f"audit count {len(audit_rows)}"
seen = set()
grades = Counter()
for index, ((source_name, source_owner), (_, name, owner, grade, source_flag, priority, location)) in enumerate(
    zip(source_rows, audit_rows), start=1
):
    name = name.replace(r"\|", "|")
    source_name = source_name.replace(r"\|", "|")
    assert (name, owner) == (source_name, source_owner), (
        "crosswalk/coverage order mismatch", index, name, source_name,
    )
    assert name not in seen, f"duplicate FDE concept {name}"
    seen.add(name)
    grades[grade] += 1
    assert owner in CHAPTER_LINES, f"unknown owner {owner}"
    if grade in ("H", "B"):
        match = re.fullmatch(r"CH(\d\d) L(\d+) \((.*)\)", location)
        assert match, f"invalid source pointer for {name}: {location}"
        pointer_owner, line, term = match.groups()
        assert pointer_owner == owner
        line = int(line)
        assert 1 <= line <= len(CHAPTER_LINES[owner]), (name, line)
        source = CHAPTER_LINES[owner][line - 1]
        assert term.casefold() in source.casefold(), (name, line, term, source)
        if grade == "H":
            assert re.match(r"^#{2,6} ", source), (name, "not a heading")
    else:
        assert location == f"CH{owner} semantic/synonym review", (name, location)

assert grades == Counter({"H": 76, "B": 34, "N": 57}), grades
# Verify actual freshly-authored question sections in canonical owners.
for chapter, start, end in [
    ("10", 10, 16), ("11", 17, 23),
]:
    source = "\n".join(CHAPTER_LINES[chapter])
    for num in range(start, end + 1):
        assert f"Q{num} ·" in source, (chapter, num)

print("PASS 167/167 topic ownership and source pointers")
print(f"PASS grades H={grades['H']} B={grades['B']} N={grades['N']}")
print("PASS Q10–Q23 canonically routed to CH10 and CH11")
print("NOTE evidence-location scan only; no claim of conceptual completeness")
