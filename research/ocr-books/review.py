"""Lay out the pages still worth a look, for a review against the scans by hand (or by an agent).

    ../denis-carthusian/.venv/bin/python review.py <book>...

Writes ~/ember-data/ocr-books/review/<book>/<leaf>.md (the page after both
proofreading passes), <leaf>.jpg (the scan) and flags.json: for each page, the
spots that look wrong. A reviewer writes its fixes, in the proofreader's format
(fix-prompt.md), to checked3/<book>/<leaf>.jsonl; assemble.py applies them last.

The flags: a word no English or French word list knows (an OCR misreading;
a paragraph with three or more is taken for Latin and skipped), a paragraph that
starts in lower case (a paragraph split where the print has none), and a fix
the proofreading passes could not place (an italic run whose words occur twice
on the page).
"""

import io
import json
import re
import sys
import zipfile

from PIL import Image
from wordfreq import zipf_frequency

from assemble import data, first_pass, fixed


def unplaced(book: str, leaf: str) -> list[str]:
    """The fixes of either pass that apply() could not place, as it reports them."""
    out = io.StringIO()
    stdout, sys.stdout = sys.stdout, out
    try:
        final(book, leaf)
    finally:
        sys.stdout = stdout
    return [line.split("fix not applied, ", 1)[1] for line in out.getvalue().splitlines() if "fix not applied" in line]


def final(book: str, leaf: str) -> str:
    return fixed(book, leaf, first_pass(book, leaf) + "\n", "checked2").strip()


def unknown(paragraph: str) -> list[str]:
    words = re.findall(r"(?<![\w’'-])[a-zA-Zæœéèàâêîôûç’'-]{4,}(?![\w’'-])", paragraph.replace("*", ""))
    return [w for w in words if not w[0].isupper() and (bare := w.strip("’'-").lower())
            and max(zipf_frequency(bare, "en"), zipf_frequency(bare, "fr")) == 0]


def flags(text: str, unplaced: list[str]) -> list[str]:
    found = [f"proofreader's fix could not be placed: {u}" for u in unplaced]
    paragraphs = [p for p in text.split("\n\n") if p.strip()]
    for p in paragraphs:
        words = unknown(p)
        if len(set(words)) < 3:
            found += [f"unknown word: {w}" for w in sorted(set(words))]
    for p in paragraphs[1:]:
        if re.match(r"\**[a-z]", p) and not re.match(r"\**(e\.g|i\.e|cf|ibid|vide)\b", p):
            found.append(f"paragraph starts in lower case: {p[:60]!r}")
    return found


def main() -> None:
    for book in sys.argv[1:]:
        out = data / "review" / book
        out.mkdir(parents=True, exist_ok=True)
        zf = zipfile.ZipFile(data / "zips" / f"{book}_tif.zip")
        flagged = {}
        for draft in sorted((data / "dots" / book).glob("*.md")):
            leaf = draft.stem
            text = final(book, leaf)
            found = flags(text, unplaced(book, leaf))
            if not found:
                continue
            flagged[leaf] = found
            (out / f"{leaf}.md").write_text(text + "\n")
            image = Image.open(io.BytesIO(zf.read(f"{book}_{leaf}.tif"))).convert("L")
            image.resize((round(image.width * 1600 / image.height), 1600)).save(out / f"{leaf}.jpg", quality=85)
        (out / "flags.json").write_text(json.dumps(flagged, ensure_ascii=False, indent=1) + "\n")
        print(f"{book}: {len(flagged)} pages flagged, {sum(map(len, flagged.values()))} flags")


if __name__ == "__main__":
    main()
