"""Lay out each corrected page as a draft of its own, for a second proofreading pass.

    ../denis-carthusian/.venv/bin/python second_pass.py <book>...
    # then, from ../denis-carthusian:
    DENIS_DATA=~/ember-data/ocr-books .venv/bin/python check_pages.py --volume <book> --leaves 0000-9999 \\
        --drafts ~/ember-data/ocr-books/dots2/<book> --out ~/ember-data/ocr-books/checked2/<book> --prompt ../ocr-books/fix-prompt.md

The first pass leaves what it missed, and fixes it could not place (an italic
run whose words occur twice on the page). A second check of the corrected page
catches both; assemble.py applies its fixes after the first pass's.
"""

import json
import shutil
import sys

from assemble import data, first_pass

for book in sys.argv[1:]:
    out = data / "dots2" / book
    out.mkdir(parents=True, exist_ok=True)
    pages = sorted((data / "dots" / book).glob("*.md"))
    for draft in pages:
        (out / draft.name).write_text(first_pass(book, draft.stem) + "\n")
        shutil.copy(draft.with_suffix(".raw.txt"), out / f"{draft.stem}.raw.txt")
    print(f"{book}: {len(pages)} pages")
