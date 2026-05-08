#!/usr/bin/env python3
"""Normalize practice category/tag synonyms in manifest.json files.

The audit revealed obvious synonyms used inconsistently
(eucharist vs eucharistic, liturgy vs liturgical, sacrament vs sacramental,
devotional vs devotion). Pick a canonical form, rewrite manifests.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRACTICES = ROOT / "content" / "practices"

# Canonical form -> list of synonyms. Synonyms get rewritten to the canonical.
CANONICAL = {
    "eucharistic": ["eucharist"],
    "liturgical": ["liturgy"],
    "sacramental": ["sacrament"],
    "devotion": ["devotional"],
    "saints": ["saint"],
}

REWRITE = {alias: canon for canon, aliases in CANONICAL.items() for alias in aliases}


def normalize_list(items):
    if not items:
        return items
    seen = set()
    out = []
    for it in items:
        canon = REWRITE.get(it, it)
        if canon not in seen:
            seen.add(canon)
            out.append(canon)
    return out


def main() -> int:
    changed = 0
    for f in sorted(PRACTICES.glob("*/manifest.json")):
        with f.open(encoding="utf-8") as fh:
            data = json.load(fh)
        before = json.dumps(data, ensure_ascii=False)
        if "tags" in data:
            data["tags"] = normalize_list(data["tags"])
        if "categories" in data:
            data["categories"] = normalize_list(data["categories"])
        after = json.dumps(data, ensure_ascii=False)
        if before != after:
            changed += 1
            with f.open("w", encoding="utf-8") as fh:
                # Preserve indentation style — most use tabs; check the original.
                pass
            # Re-read original text to detect indentation
            original_text = f.read_text(encoding="utf-8")
            indent = "\t" if "\t" in original_text else "  "
            with f.open("w", encoding="utf-8") as fh:
                json.dump(data, fh, ensure_ascii=False, indent=indent)
                fh.write("\n")
            print(f"  rewrote {f.relative_to(ROOT)}")
    print(f"normalized {changed} manifest(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
