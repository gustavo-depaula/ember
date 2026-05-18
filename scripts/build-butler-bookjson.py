#!/usr/bin/env python3
"""Build content/books/butler-lives-of-saints/book.json from the crawl plan.

Reads content/books/butler-lives-of-saints/_plan.json (written by the crawler)
and emits a TOC organized as: 12 month groups + 1 "Lives of Certain Saints"
group, each containing the saint chapter leaves.
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOK_DIR = ROOT / "content" / "books" / "butler-lives-of-saints"
PLAN = BOOK_DIR / "_plan.json"
OUT = BOOK_DIR / "book.json"

MONTH_ID = {
    "January": "jan", "February": "feb", "March": "mar", "April": "apr",
    "May": "may", "June": "jun", "July": "jul", "August": "aug",
    "September": "sep", "October": "oct", "November": "nov", "December": "dec",
}


def main() -> None:
    plan = json.loads(PLAN.read_text())
    toc: list[dict] = []
    for sec in plan:
        section_name = sec["section"]
        if section_name == "Lives of Certain Saints":
            group_id = "lives-of-certain-saints"
            title = {"en-US": "Lives of Certain Saints"}
        else:
            group_id = MONTH_ID[section_name]
            title = {"en-US": section_name}
        children = []
        for e in sec["entries"]:
            children.append({
                "id": e["chapter_id"],
                "title": {"en-US": e["title"]},
            })
        toc.append({"id": group_id, "title": title, "children": children})

    book = {
        "id": "butler-lives-of-saints",
        "name": {
            "en-US": "Lives of the Saints",
        },
        "author": {
            "en-US": "Alban Butler",
        },
        "description": {
            "en-US": (
                "Capsule lives of Catholic saints arranged by the day of the "
                "year. The Benziger Brothers edition (1894), an imprimatur "
                "abridgment of Butler's 1756–1759 original, widely used by "
                "American Catholics at the turn of the 20th century. Each "
                "entry pairs the saint's life with a brief Reflection."
            ),
        },
        "composed": "1756–1759",
        "languages": ["en-US"],
        "sources": [
            {
                "language": "en-US",
                "url": "https://sacred-texts.com/chr/lots/index.htm",
                "description": (
                    "Internet Sacred Text Archive — Benziger Bros. ed. [1894], "
                    "abridgment by John Gilmary Shea."
                ),
            }
        ],
        "toc": toc,
    }
    OUT.write_text(json.dumps(book, indent=2, ensure_ascii=False) + "\n")
    leaves = sum(len(g["children"]) for g in toc)
    print(f"✓ Wrote {OUT}")
    print(f"  groups: {len(toc)}, leaves: {leaves}")


if __name__ == "__main__":
    main()
