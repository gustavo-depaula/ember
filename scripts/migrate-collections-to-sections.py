#!/usr/bin/env python3
"""One-off migration: flat `items[]` collections → sectioned shape.

Each existing collection in content/collections/*.json is rewritten so its
former flat list becomes a single anonymous section. The legacy `items` key
is removed; the new `sections` key carries one section with one item-block
per former entry.

Run once after the new manifest type ships, then never again.

Usage:
    python3 scripts/migrate-collections-to-sections.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COLLECTIONS = ROOT / "content" / "collections"


SECTION_TITLE = {"en-US": "All entries", "pt-BR": "Todos os itens"}


def migrate_one(path: Path) -> bool:
    """Rewrite one file. Returns True if changed."""
    with path.open(encoding="utf-8") as fh:
        data = json.load(fh)

    if "sections" in data and "items" not in data:
        return False  # already migrated

    items = data.get("items", [])
    blocks = []
    for it in items:
        if not isinstance(it, dict) or "ref" not in it:
            continue
        block = {"kind": "item", "ref": it["ref"]}
        if "label" in it:
            block["label"] = it["label"]
        blocks.append(block)

    section = {
        "id": "all",
        "title": SECTION_TITLE,
        "blocks": blocks,
    }

    out: dict = {}
    for k, v in data.items():
        if k == "items":
            continue
        out[k] = v
    out["sections"] = [section]

    with path.open("w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    return True


def main(argv: list[str]) -> int:
    if not COLLECTIONS.is_dir():
        print(f"error: {COLLECTIONS} not found", file=sys.stderr)
        return 1

    changed = 0
    skipped = 0
    for f in sorted(COLLECTIONS.glob("*.json")):
        if migrate_one(f):
            print(f"  migrated: {f.name}")
            changed += 1
        else:
            print(f"  skipped (already sectioned): {f.name}")
            skipped += 1

    print()
    print(f"[migrate-collections] migrated: {changed}, skipped: {skipped}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
