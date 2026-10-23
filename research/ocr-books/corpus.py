"""Cut an assembled book (assemble.py) into a corpus book under content/books/.

    ../denis-carthusian/.venv/bin/python corpus.py <book-id>...

The reading file holds the whole scan: library stamps, the title and copyright
pages, a contents page, indexes keyed to printed page numbers. `books` says, for
each, where the text starts and ends, what to leave out, and which headings open
a chapter (and a part, for the table of contents). A chapter's title is its
heading with the subtitle printed under it ("Chapter I: Some General Principles").
"""

import json
import re
import sys
from pathlib import Path

data = Path.home() / "ember-data" / "ocr-books"
repo = Path(__file__).resolve().parents[2]

books = {
    "bruyere-spiritual-life-and-prayer": {
        "start": r"^## AUTHOR'S PREFACE$",
        # The reprint's printer's colophon and back cover; the last chapter's notes follow them.
        "drop": [(r"^CPSIA information", r"^\[\^1\]: In capite libri")],
        "chapter": r"^## (AUTHOR'S PREFACE|CHAPTER [IVXL]+)$",
        "meta": {
            "id": "bruyere-spiritual-life-and-prayer",
            "cover": "classic",
            "name": {"en-US": "The Spiritual Life and Prayer", "pt-BR": "A Vida Espiritual e a Oração"},
            "author": {"en-US": "Cécile Bruyère, O.S.B.", "pt-BR": "Cécile Bruyère, O.S.B."},
            "description": {
                "en-US": "The Spiritual Life and Prayer according to Holy Scripture and Monastic Tradition, by the first abbess of Sainte-Cécile de Solesmes, translated by the nuns of Stanbrook Abbey (1900).",
                "pt-BR": "A vida espiritual e a oração segundo a Sagrada Escritura e a tradição monástica, da primeira abadessa de Sainte-Cécile de Solesmes, na tradução inglesa das monjas de Stanbrook (1900).",
            },
            "composed": 1885,
            "sources": [{
                "language": "en-US",
                "url": "https://archive.org/details/isbn_9781953746382",
                "description": "The Stanbrook translation (London and Leamington, 1900), as reprinted by Mediatrix Press (2016). Text read from the scans with dots.mocr and proofread page by page by Claude against them (research/ocr-books).",
            }],
        },
    },
    "frost-art-of-mental-prayer": {
        "start": r"^## DEDICATED$",
        "end": r"^## BIBLIOGRAPHY$",  # a list of books in print in 1935, with prices; then the indexes
        "drop": [(r"^## CONTENTS$", r"^## PART I$")],
        "chapter": r"^## (DEDICATED|PREFACE|PREFACE TO (SECOND|THIRD) EDITION|INTRODUCTION|CHAPTER [IVX]+|APPENDIX)$",
        "part": r"^## PART (I|II|III)$",
        "meta": {
            "id": "frost-art-of-mental-prayer",
            "cover": "classic",
            "name": {"en-US": "The Art of Mental Prayer", "pt-BR": "A Arte da Oração Mental"},
            "author": {"en-US": "Bede Frost", "pt-BR": "Bede Frost"},
            "description": {
                "en-US": "The methods of mental prayer of the Catholic schools (Ignatian, Franciscan, Carmelite, Salesian, Liguorian, Oratorian, Eudist), with their difficulties and the direction of souls in prayer, gathered for Anglicans by a monk of the Anglican Benedictine community of Nashdom. Revised edition, 1935.",
                "pt-BR": "Os métodos de oração mental das escolas católicas (inaciana, franciscana, carmelita, salesiana, liguoriana, oratoriana, eudista), com as suas dificuldades e a direção das almas na oração, reunidos para anglicanos por um monge da comunidade beneditina anglicana de Nashdom. Edição revista, 1935.",
            },
            "composed": 1931,
            "sources": [{
                "language": "en-US",
                "description": "The Art of Mental Prayer, revised edition (London: Philip Allan, 1935), from a scan of the University of Chicago Library's copy. Text read from the scans with dots.mocr and proofread page by page by Claude against them (research/ocr-books).",
            }],
        },
    },
}


def title_case(heading: str) -> str:
    """'CHAPTER XVIII' → 'Chapter XVIII'; 'AUTHOR'S PREFACE' → 'Author's Preface'."""
    words = heading.split()
    return " ".join(w if re.fullmatch(r"[IVXL]+", w) else w.lower() if i and w in ("TO", "OF", "THE") else w[:1] + w[1:].lower()
                    for i, w in enumerate(words))


def main() -> None:
    for book in sys.argv[1:]:
        rules = books[book]
        lines = (data / f"{book}.md").read_text().splitlines()
        first = next(i for i, l in enumerate(lines) if re.match(rules["start"], l))
        last = next((i for i, l in enumerate(lines) if "end" in rules and re.match(rules["end"], l)), len(lines))
        keep = [True] * len(lines)
        for a, b in rules.get("drop", []):
            i = next(i for i, l in enumerate(lines) if re.match(a, l))
            j = next(j for j, l in enumerate(lines) if j > i and re.match(b, l))
            keep[i:j] = [False] * (j - i)
        text = [l for i, l in enumerate(lines) if first <= i < last and keep[i]]

        chapters, toc, part = [], [], None
        i = 0
        while i < len(text):
            line = text[i]
            if rules.get("part") and (m := re.match(rules["part"], line)):
                j = i + 1
                name = text[j].strip() if j < len(text) and text[j].strip() and not text[j].startswith("#") else ""
                part = {"id": f"part-{m.group(1).lower()}", "title": {"en-US": f"Part {m.group(1)}" + (f": {name.title()}" if name else "")}, "children": []}
                toc.append(part)
                i = j + 1 if name else j
                continue
            if re.match(rules["chapter"], line):
                heading = line[3:].strip()
                # The subtitle under a chapter heading: an italic line, or a heading of its own.
                j = i + 1
                while j < len(text) and not text[j].strip():
                    j += 1
                subtitle = ""
                if heading.startswith(("CHAPTER", "APPENDIX")) and j < len(text):
                    if m := re.fullmatch(r"\*(.+)\*", text[j].strip()):
                        subtitle, i = m.group(1), j
                    elif text[j].startswith("## ") and not re.match(rules["chapter"], text[j]):
                        subtitle, i = text[j][3:].strip(), j
                title = ("Dedication" if heading == "DEDICATED" else title_case(heading)) + (f": {subtitle}" if subtitle else "")
                chapter = {"id": "", "title": title, "lines": []}
                chapters.append(chapter)
                (part["children"] if part and heading.startswith("CHAPTER") else toc).append(chapter)
                if not heading.startswith("CHAPTER"):
                    part = None
                i += 1
                continue
            if chapters:
                chapters[-1]["lines"].append(line)
            i += 1

        out = repo / "content" / "books" / book
        (out / "en-US").mkdir(parents=True, exist_ok=True)
        for old in (out / "en-US").glob("*.md"):
            old.unlink()
        for n, c in enumerate(chapters, 1):
            c["id"] = f"c{n:02d}"
            body = re.sub(r"\n{3,}", "\n\n", "\n".join(c["lines"])).strip()
            (out / "en-US" / f"{c['id']}.md").write_text(f"# {c['title']}\n\n{body}\n")

        def node(n: dict) -> dict:
            if "children" in n:
                return {"id": n["id"], "title": n["title"], "children": [node(c) for c in n["children"]]}
            return {"id": n["id"], "title": {"en-US": n["title"]}}

        meta = {**rules["meta"], "languages": ["en-US"], "toc": [node(n) for n in toc]}
        (out / "book.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n")
        words = sum(len(" ".join(c["lines"]).split()) for c in chapters)
        print(f"{book}: {len(chapters)} chapters, {words:,} words")
        for c in chapters:
            print("   ", c["id"], c["title"][:90], len(" ".join(c["lines"]).split()))


if __name__ == "__main__":
    main()
