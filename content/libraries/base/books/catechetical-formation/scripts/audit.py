#!/usr/bin/env python3
"""Audit each session for title/Pius X/commentary alignment.

For each session, prints:
  - Order, ID, title
  - First and last Pius X question text
  - Aquinas chapter + (sliced sections, if any)
  - Trent chapter + (sliced sections, if any)

Look for sessions where the title doesn't match the Pius X content, or where
the commentary slice covers a different topic than the Pius X questions.
"""

import json
import re
from pathlib import Path

BOOK_DIR = Path(__file__).resolve().parent.parent      # the book folder
BOOKS_DIR = BOOK_DIR.parent                            # content/libraries/base/books/
SESSIONS = json.loads((BOOK_DIR / "sessions.json").read_text())["sessions"]

PX_DIR = BOOKS_DIR / "catechism-pius-x-1912/en-US"

Q_PAT = re.compile(r"^\*\*(\d+)\.\*\*\s*(.+)$")


def load_pius_x_qs(chapter: str) -> dict[int, str]:
    """Return {Q_number: question_text} for a Pius X chapter."""
    text = (PX_DIR / f"{chapter}.md").read_text(encoding="utf-8")
    out = {}
    for line in text.splitlines():
        m = Q_PAT.match(line)
        if m:
            out[int(m.group(1))] = m.group(2).strip()
    return out


# Cache
_cache: dict[str, dict[int, str]] = {}
def qs_for(chapter: str) -> dict[int, str]:
    if chapter not in _cache:
        _cache[chapter] = load_pius_x_qs(chapter)
    return _cache[chapter]


def fmt_ref(ref) -> str:
    if isinstance(ref, str):
        return f"{ref} (full)"
    if isinstance(ref, dict):
        ch = ref.get("chapter", "?")
        secs = ref.get("sections")
        if not secs:
            return f"{ch} (full)"
        return f"{ch}: {' / '.join(secs)}"
    return "—"


for s in SESSIONS:
    print(f"━━━ s{s['order']:03d} — {s['title']['en-US']} ━━━")

    px_lines = []
    for ref in s.get("pius_x", []):
        qs = qs_for(ref["chapter"])
        for n in range(ref["from"], ref["to"] + 1):
            if n in qs:
                px_lines.append(f"  Q{n}. {qs[n][:90]}")
    if not px_lines:
        print("  (no Pius X)")
    else:
        print(px_lines[0])
        if len(px_lines) > 2:
            print(f"  … ({len(px_lines) - 2} more)")
        if len(px_lines) > 1:
            print(px_lines[-1])

    aq_refs = s.get("aquinas", [])
    if aq_refs:
        for ref in aq_refs:
            print(f"  📜 Aquinas → {fmt_ref(ref)}")
    else:
        print(f"  📜 Aquinas → (none)")

    tr_ref = s.get("trent")
    if tr_ref:
        print(f"  📖 Trent   → {fmt_ref(tr_ref)}")
    else:
        print(f"  📖 Trent   → (none)")
    print()
