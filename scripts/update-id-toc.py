#!/usr/bin/env python3
"""
Update book.json TOC titles from the cleaned markdown files.
Run this after cleanup agents have processed the markdown.
"""

import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
BOOK_DIR = BASE / "content/libraries/carmelite/books/intimita-divina"
IT_DIR = BOOK_DIR / "it"
BOOK_JSON = BOOK_DIR / "book.json"

book = json.loads(BOOK_JSON.read_text())

updated = 0
for vol in book["toc"]:
    for entry in vol.get("children", []):
        md_file = IT_DIR / f"{entry['id']}.md"
        if md_file.exists():
            first_line = md_file.read_text().split("\n")[0]
            # Extract title from "## N — TITLE"
            match = re.match(r'^## \d+ — (.+)$', first_line)
            if match:
                new_title = match.group(1).strip()
                old_title = entry["title"].get("it", "")
                if new_title != old_title:
                    entry["title"]["it"] = new_title
                    updated += 1

BOOK_JSON.write_text(json.dumps(book, ensure_ascii=False, indent=2))
print(f"Updated {updated} titles in book.json")
