#!/usr/bin/env python3
"""Stamp each book.json with the day each of its languages arrived.

`arrived` maps a language to the date its text first entered the repository:
the earliest is the day the book arrived, a later one the day it became
readable in that language. The Books screen's "Recém-chegados" reads it.

The dates live in the book rather than being read from git at build time,
because CI checks out a shallow history and would date everything to the last
few commits. Run this after importing a book or a translation: a language
already stamped keeps its date, a new one gets the date of its first commit,
or today when it isn't committed yet.

    python3 scripts/stamp-book-arrivals.py
"""

from __future__ import annotations

import json
import subprocess
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOKS = ROOT / "content" / "books"


def first_commit_dates() -> dict[str, str]:
    """Each language folder of each book → the date of the first commit adding a file in it.

    A rename counts as an addition: folders moved in a restructure otherwise
    have no first commit at all.
    """
    log = subprocess.run(
        [
            "git", "log", "--diff-filter=AR", "--name-only", "--format=@%as",
            "--reverse", "--", "content/books",
        ],
        cwd=ROOT, capture_output=True, text=True, check=True,
    ).stdout
    dates: dict[str, str] = {}
    day = ""
    for line in log.splitlines():
        if line.startswith("@"):
            day = line[1:]
        elif line:
            folder = str(Path(line).parent)
            dates.setdefault(folder, day)
    return dates


def main() -> None:
    dates = first_commit_dates()
    today = date.today().isoformat()
    changed = 0
    for meta_path in sorted(BOOKS.rglob("book.json")):
        book_dir = meta_path.parent
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        arrived = dict(meta.get("arrived") or {})
        for lang in meta.get("languages") or []:
            if lang in arrived or not (book_dir / lang).is_dir():
                continue
            folder = str((book_dir / lang).relative_to(ROOT))
            arrived[lang] = dates.get(folder, today)
        if arrived == meta.get("arrived"):
            continue
        stamped = dict(sorted(arrived.items(), key=lambda kv: (kv[1], kv[0])))
        if "arrived" in meta:
            meta["arrived"] = stamped
            text = json.dumps(meta, ensure_ascii=False, indent=2) + "\n"
        else:
            # Appended as text, so a hand-formatted book.json keeps its layout.
            raw = meta_path.read_text(encoding="utf-8").rstrip()
            field = json.dumps(stamped, ensure_ascii=False, indent=2).replace("\n", "\n  ")
            text = f'{raw[:-1].rstrip()},\n  "arrived": {field}\n}}\n'
        meta_path.write_text(text, encoding="utf-8")
        changed += 1
    print(f"stamped {changed} books")


if __name__ == "__main__":
    main()
