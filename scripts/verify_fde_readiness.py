#!/usr/bin/env python3
"""Audit structural traceability of manually reviewed FDE core-36 evidence.

This verifier checks inventory ownership, row references and rubric integrity,
not whether subjective grade levels are fair or candidate interview readiness.
No customer systems, web APIs or paid course access are involved.
"""
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / "handbook/references/fde-2026-readiness-core36.json").read_text())
crosswalk = (ROOT / "handbook/references/fde-2026-concept-crosswalk.md").read_text()
report = (ROOT / "handbook/references/fde-2026-readiness-core36.md").read_text()
registry = json.loads((ROOT / "web/assets/chapter-additions.json").read_text())
html = (ROOT / "web/assets/ch12-fde-interview-readiness.html").read_text()
chapters = sorted((ROOT / "handbook/chapters").glob("*.md"))
owners = {p.name[:2]: p.read_text().splitlines() for p in chapters}

assert data["schema_version"] == 1
assert len(data["items"]) == 36
assert len({x["id"] for x in data["items"]}) == 36
assert len({x["concept"] for x in data["items"]}) == 36

groups = Counter()
profiles = [Counter() for _ in range(6)]
for i, item in enumerate(data["items"], start=1):
    assert item["id"] == f"R{i:02d}", item["id"]
    name = item["concept"]
    owner = item["owner"]
    assert f"| {name} | CH{owner} —" in crosswalk, (name, owner)
    assert owner in owners, owner
    assert item["track"] in {
        "MODEL", "RETRIEVAL", "AGENT", "EVAL", "PRODUCTION", "DATA", "DELIVERY"
    }, item["track"]
    assert len(item["grades"]) == 6, item["id"]
    assert all(isinstance(v, int) and not isinstance(v, bool)
               and v in (0, 1, 2) for v in item["grades"]), item["id"]
    for key in ("heading_contains", "gap_zh", "drill_zh", "drill_en",
                "pass_zh", "pass_en"):
        assert len(item[key].strip()) > 8, (item["id"], key)
    locs = [(j + 1, line) for j, line in enumerate(owners[owner])
            if re.match(r"^#{2,4} ", line)
            and item["heading_contains"].casefold() in line.casefold()]
    assert locs, (item["id"], owner, item["heading_contains"])
    assert f"CH{owner} L{locs[0][0]}" in report, (item["id"], "source location")
    assert f"{item['id']} · {name}" in report, (item["id"], "report row")
    assert f"{item['id']} · {name}" in html, (item["id"], "HTML detail")
    for j, score in enumerate(item["grades"]):
        profiles[j][score] += 1
    groups[item["track"]] += 1

assert groups == {
    "MODEL": 3, "RETRIEVAL": 6, "AGENT": 5, "EVAL": 6,
    "PRODUCTION": 7, "DATA": 6, "DELIVERY": 3
}, groups
assert profiles[0] == {2: 33, 1: 3}, profiles[0]
assert profiles[1] == {2: 18, 1: 18}, profiles[1]
assert profiles[2] == {2: 36}, profiles[2]
assert profiles[3] == {2: 15, 1: 21}, profiles[3]
assert profiles[4] == {2: 5, 1: 31}, profiles[4]
assert profiles[5] == {2: 14, 1: 18, 0: 4}, profiles[5]
assert html.count("<details") == 40, "36 concept drills + 4 rounds"
for round_name in ("Round A", "Round B", "Round C", "Round D"):
    assert round_name in report, round_name
assert "131" in report and "131" in html, "unscored scope disclaimer"
assert any(x["id"] == "fde-readiness-audit-08"
           for x in registry["12-fde-customer-delivery"])
print("PASS: all 36 auditable source pointers and six-level evidence dimensions")
print("PASS: 4 mock interview rounds, 40 UI disclosure panels and reader registry")
print("NOTE: grades are provisional editorial judgments, not tests of knowledge or services")
