#!/usr/bin/env python3
"""Compact row data for the inventory review page, with what was imported.

    uv run --with olefile --with beautifulsoup4 --with lxml python research/magisterium/build_review_data.py OUT.json

Each row: [status, date, author, type, title, langs, sources, ds, reason, book_id, imported_langs].
book_id and imported_langs are empty when nothing was imported.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "scripts" / "magisterium"))
from import_documents import BOOKS, COUNCIL_AUTHORS, assign_ids  # noqa: E402


def main() -> None:
    inv = json.loads((HERE / "inventory.json").read_text())
    importable = [d for d in inv if d["status"] == "include" and d["langs"] and d["author"] not in COUNCIL_AUTHORS]
    assign_ids(importable)
    rows = []
    for d in inv:
        bid = d.get("id")
        if d["author"] in COUNCIL_AUTHORS:
            bid = f"council-{d['author']}"
        meta = BOOKS / (bid or "-") / "book.json"
        langs = json.loads(meta.read_text())["languages"] if bid and meta.exists() else []
        rows.append([d["status"][0], d["date"] or "", d["author"], d["type"] or "", d["title"], d["langs"],
                     d["sources"], d.get("ds", []), d["reason"], bid if langs else "", langs])
    Path(sys.argv[1]).write_text(json.dumps(rows, ensure_ascii=False, separators=(",", ":")))
    print(f"{len(rows)} rows, {sum(1 for r in rows if r[9])} imported")


if __name__ == "__main__":
    main()
