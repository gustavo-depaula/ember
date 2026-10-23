"""Rewrite the dots.mocr drafts of a one-column book from the model's layout JSON.

    ../denis-carthusian/.venv/bin/python drafts.py <book-id>...

run_volumes.py drafts a page with ocr_local.dots_markdown, which is written for
Denis's two-column folios: it sets narrow blocks aside as margin references. On
a one-column page the narrow blocks are the short last lines of paragraphs
("fulness of Christ."), so that would lose text. Here every block is kept, in
reading order: headings as `##`, footnotes as printed at the foot of the page.
Data lives under ~/ember-data/ocr-books (DENIS_DATA for the shared scripts).
"""

import json
import sys
from pathlib import Path

data = Path.home() / "ember-data" / "ocr-books"


def markdown(raw: str) -> str:
    blocks = []
    for cell in json.loads(raw):
        kind, text = cell.get("category"), cell.get("text", "").replace("\xad", "").strip()
        if kind in ("Page-header", "Page-footer", "Picture") or not text:
            continue
        blocks.append("## " + text.lstrip("# ") if kind in ("Section-header", "Title") else text)
    return "\n\n".join(blocks)


def main() -> None:
    for book in sys.argv[1:]:
        pages = sorted((data / "dots" / book).glob("*.raw.txt"))
        for raw in pages:
            raw.with_name(raw.name.replace(".raw.txt", ".md")).write_text(markdown(raw.read_text()) + "\n")
        print(f"{book}: {len(pages)} pages")


if __name__ == "__main__":
    main()
