#!/usr/bin/env python3
"""Read-only inventory of content/libraries/ for the Hearth v2 rename pass.

Walks every library, lists every content item by proposed flat ID, detects
collisions across libraries, and prints a rename plan. Does not move any files.
"""
from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import NamedTuple

ROOT = Path(__file__).resolve().parent.parent
LIBRARIES_DIR = ROOT / "content" / "libraries"


class Item(NamedTuple):
    library: str
    kind: str            # prayer, practice, book, chapter, mass, of-ordinary, of-preface, of-eucharistic-prayer, of-data, asset
    sub_path: str        # path under the kind dir (e.g. "rosary" for practice, "tempore/holy-week/easter-vigil" for mass)
    source_path: Path    # full source path on disk
    proposed_id: str     # e.g. "prayer/our-father", "practice/rosary", "mass/of/tempore/holy-week/easter-vigil"


def slug(name: str) -> str:
    return name.replace(" ", "-").lower()


def walk_library(lib_dir: Path) -> list[Item]:
    items: list[Item] = []
    lib = lib_dir.name

    # prayers/<id>.json -> prayer/<id>
    prayers_dir = lib_dir / "prayers"
    if prayers_dir.is_dir():
        for f in sorted(prayers_dir.glob("*.json")):
            pid = f.stem
            items.append(Item(lib, "prayer", pid, f, f"prayer/{pid}"))

    # practices/<id>/ -> practice/<id>
    practices_dir = lib_dir / "practices"
    if practices_dir.is_dir():
        for d in sorted(p for p in practices_dir.iterdir() if p.is_dir()):
            items.append(Item(lib, "practice", d.name, d, f"practice/{d.name}"))

    # chapters/<id>/ -> chapter/<id>
    chapters_dir = lib_dir / "chapters"
    if chapters_dir.is_dir():
        for d in sorted(p for p in chapters_dir.iterdir() if p.is_dir()):
            items.append(Item(lib, "chapter", d.name, d, f"chapter/{d.name}"))

    # books/<id>/ -> book/<id>
    books_dir = lib_dir / "books"
    if books_dir.is_dir():
        for d in sorted(p for p in books_dir.iterdir() if p.is_dir()):
            items.append(Item(lib, "book", d.name, d, f"book/{d.name}"))

    # of/ tree (only in base) -> mass/of/..., of-ordinary/..., of-preface/..., etc.
    of_dir = lib_dir / "of"
    if of_dir.is_dir():
        # masses/<group>/<file>.json -> mass/of/<group>/<file>
        masses_dir = of_dir / "masses"
        if masses_dir.is_dir():
            for f in sorted(masses_dir.rglob("*.json")):
                rel = f.relative_to(masses_dir).with_suffix("")
                items.append(Item(lib, "mass", str(rel), f, f"mass/of/{rel.as_posix()}"))

        # library/{ordinary,preface,eucharistic-prayer}/<file>.json
        of_lib = of_dir / "library"
        if of_lib.is_dir():
            for kind_dir in sorted(p for p in of_lib.iterdir() if p.is_dir()):
                for f in sorted(kind_dir.rglob("*.json")):
                    rel = f.relative_to(kind_dir).with_suffix("")
                    items.append(Item(lib, f"of-{kind_dir.name}", str(rel), f, f"of/{kind_dir.name}/{rel.as_posix()}"))

        # calendar, saints, igmr, sacerdotale -> of-data/<...>
        for sub in ("calendar", "saints", "igmr", "sacerdotale"):
            sd = of_dir / sub
            if sd.is_dir():
                for f in sorted(sd.rglob("*.json")):
                    rel = f.relative_to(sd).with_suffix("")
                    items.append(Item(lib, "of-data", f"{sub}/{rel.as_posix()}", f, f"of-data/{sub}/{rel.as_posix()}"))

    # checkup, programs, sources, assets, fragments — anything else lives only in base for now
    # We capture them under their library dir name; can be re-shaped if needed.
    return items


def main() -> int:
    if not LIBRARIES_DIR.is_dir():
        print(f"error: {LIBRARIES_DIR} not found", file=sys.stderr)
        return 1

    libraries = sorted(p.name for p in LIBRARIES_DIR.iterdir() if p.is_dir())

    all_items: list[Item] = []
    counts_per_lib: dict[str, dict[str, int]] = {}
    for lib in libraries:
        items = walk_library(LIBRARIES_DIR / lib)
        all_items.extend(items)
        counts: dict[str, int] = defaultdict(int)
        for it in items:
            counts[it.kind] += 1
        counts_per_lib[lib] = dict(counts)

    # Detect collisions
    by_id: dict[str, list[Item]] = defaultdict(list)
    for it in all_items:
        by_id[it.proposed_id].append(it)
    collisions = {pid: items for pid, items in by_id.items() if len(items) > 1}

    # Print summary
    print("# Hearth v2 Content Inventory")
    print()
    print(f"Libraries: {len(libraries)}  |  Total items: {len(all_items)}  |  Unique IDs: {len(by_id)}")
    print()

    print("## Per-library counts")
    print()
    print("| Library | prayer | practice | chapter | book | mass | of-ord | of-pref | of-euch | of-data |")
    print("|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|")
    for lib in libraries:
        c = counts_per_lib[lib]
        row = [
            lib,
            str(c.get("prayer", 0)),
            str(c.get("practice", 0)),
            str(c.get("chapter", 0)),
            str(c.get("book", 0)),
            str(c.get("mass", 0)),
            str(c.get("of-ordinary", 0)),
            str(c.get("of-preface", 0)),
            str(c.get("of-eucharistic-prayer", 0)),
            str(c.get("of-data", 0)),
        ]
        print("| " + " | ".join(row) + " |")
    print()

    print("## Collisions")
    print()
    if not collisions:
        print("None — every proposed flat ID is unique. The rename pass can run mechanically.")
    else:
        print(f"{len(collisions)} colliding IDs. Each must be resolved before the rename:")
        print()
        for pid, items in sorted(collisions.items()):
            print(f"### `{pid}`")
            for it in items:
                print(f"- `{it.library}` → `{it.source_path.relative_to(ROOT)}`")
            print()

    # Per-library item dump (for inspecting later)
    out_path = ROOT / "scripts" / "_inventory.json"
    with out_path.open("w", encoding="utf-8") as f:
        json.dump({
            "libraries": libraries,
            "counts": counts_per_lib,
            "items": [
                {
                    "library": it.library,
                    "kind": it.kind,
                    "proposed_id": it.proposed_id,
                    "source_path": str(it.source_path.relative_to(ROOT)),
                }
                for it in all_items
            ],
            "collisions": {
                pid: [{"library": it.library, "source_path": str(it.source_path.relative_to(ROOT))} for it in items]
                for pid, items in collisions.items()
            },
        }, f, indent=2)
    print(f"\nWrote full inventory to `scripts/_inventory.json`.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
