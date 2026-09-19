#!/usr/bin/env python3
"""Check a markdown plan against the portable spec contract."""

from __future__ import annotations

import re
import sys
from pathlib import Path

REQUIRED_HEADINGS = [
    "Metadata",
    "Abstract",
    "Current State",
    "Plan Ledger",
    "Readiness",
    "Handoff",
    "Desired Outcome",
    "Scope",
    "Flow",
    "Decisions",
    "Detailed Plan",
    "Verification",
    "Open Questions",
]
VALID_STATUSES = {"planning", "ready", "implementing", "blocked", "done"}
ACTIVE_STATUSES = {"ready", "implementing", "done"}
PLACEHOLDERS = {"", "—", "-", "todo", "tbd", "[command or observable check]", "[artifact or change]"}
LEDGER_RE = re.compile(
    r"^- \[(?P<state>[ ~x!])\] "
    r"(?P<id>[A-Z][A-Z0-9]*\d+) — (?P<title>.+?) — "
    r"deliverable: (?P<deliverable>.+?); "
    r"verify: (?P<verify>.+?); "
    r"evidence: (?P<evidence>.+?)\s*$"
)


def field(text: str, name: str) -> str | None:
    match = re.search(rf"^- {re.escape(name)}:\s*(.+?)\s*$", text, re.MULTILINE | re.IGNORECASE)
    return match.group(1).strip() if match else None


def is_placeholder(value: str | None) -> bool:
    if value is None:
        return True
    normalized = value.strip().lower()
    return normalized in PLACEHOLDERS or (normalized.startswith("[") and normalized.endswith("]"))


def check(path: Path) -> list[str]:
    text = path.read_text()
    errors: list[str] = []

    if not re.search(r"^# .+", text, re.MULTILINE):
        errors.append("missing level-one title")

    for heading in REQUIRED_HEADINGS:
        if not re.search(rf"^## {re.escape(heading)}\s*$", text, re.MULTILINE):
            errors.append(f"missing required heading: ## {heading}")

    status = field(text, "Status")
    if status is None:
        errors.append("missing metadata field: Status")
    elif status.lower() not in VALID_STATUSES:
        errors.append(f"invalid Status: {status}")
    else:
        status = status.lower()

    for name in ("Owner", "Executor", "Updated", "Next action"):
        if field(text, name) is None:
            errors.append(f"missing metadata field: {name}")

    verdict = field(text, "Verdict")
    if verdict not in {"ready", "not-ready"}:
        errors.append("Readiness Verdict must be ready or not-ready")

    ledger_lines = [line for line in text.splitlines() if re.match(r"^- \[[ ~x!]\] ", line)]
    if not ledger_lines:
        errors.append("Plan Ledger has no rows")

    seen_ids: set[str] = set()
    active_count = 0
    incomplete_count = 0
    for line in ledger_lines:
        match = LEDGER_RE.match(line)
        if not match:
            errors.append(f"invalid ledger row: {line}")
            continue
        values = match.groupdict()
        row_id = values["id"]
        state = values["state"]
        if row_id in seen_ids:
            errors.append(f"duplicate ledger row ID: {row_id}")
        seen_ids.add(row_id)
        if is_placeholder(values["deliverable"]):
            errors.append(f"{row_id} has no concrete deliverable")
        if is_placeholder(values["verify"]):
            errors.append(f"{row_id} has no concrete verification")
        if state == "~":
            active_count += 1
        if state != "x":
            incomplete_count += 1
        if state == "x" and is_placeholder(values["evidence"]):
            errors.append(f"{row_id} is complete without verification evidence")

    if active_count > 1:
        errors.append("more than one ledger row is in progress")
    if status == "ready" and active_count:
        errors.append("ready spec cannot have an in-progress ledger row")
    if status == "implementing" and active_count != 1:
        errors.append("implementing spec must have exactly one in-progress ledger row")
    if status == "done" and incomplete_count:
        errors.append("done spec has incomplete ledger rows")
    if status in ACTIVE_STATUSES and verdict != "ready":
        errors.append(f"{status} spec must have Readiness Verdict: ready")
    if status in ACTIVE_STATUSES and re.search(r"\b(?:TODO|TBD)\b", text, re.IGNORECASE):
        errors.append(f"{status} spec contains unresolved TODO/TBD markers")

    return errors


def main() -> int:
    if len(sys.argv) != 2:
        print(f"usage: {Path(sys.argv[0]).name} SPEC.md", file=sys.stderr)
        return 2

    path = Path(sys.argv[1])
    if not path.is_file():
        print(f"error: not a file: {path}", file=sys.stderr)
        return 2

    errors = check(path)
    if errors:
        print(f"{path}: contract violations:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print(f"{path}: spec contract passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
