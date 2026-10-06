#!/usr/bin/env python3
"""Rebuild content/bible/<translation>/ from a public-domain Bible in USFM.

Sources (all public domain):
    drb      github.com/BibleCorps/ENG-B-DRC1750-pd-PSFM   Challoner Douay-Rheims
    cpdv     github.com/BibleCorps/ENG-B-CPDV2009-pd-PSFM  Catholic Public Domain Version
    vulgate  ebible.org/Scriptures/latVUC_usfm.zip         Clementine Vulgate

Writes, per book, `<slug>.json` as {chapter: {verse: text}}: the shape the app
reads, and `index.json` (book order and chapter counts). Every translation
files its books under the Douay slugs, so one reference opens the same book in
any of them. The Douay-Rheims also gets `summaries.json`
({slug: {"intro": ..., "chapters": {chapter: Challoner's argument}}}).

Usage:
    python3 scripts/import-bible-usfm.py <translation> <dir with the USFM files>
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BIBLE = ROOT / "content" / "bible"

# USFM book code → (slug, Douay name, testament). The slugs and names are the
# Douay-Rheims ones the app has always used (Josue, 1–4 Kings, Paralipomenon…).
BOOKS = [
    ("GEN", "genesis", "Genesis", "ot"), ("EXO", "exodus", "Exodus", "ot"),
    ("LEV", "leviticus", "Leviticus", "ot"), ("NUM", "numbers", "Numbers", "ot"),
    ("DEU", "deuteronomy", "Deuteronomy", "ot"), ("JOS", "josue", "Josue", "ot"),
    ("JDG", "judges", "Judges", "ot"), ("RUT", "ruth", "Ruth", "ot"),
    ("1SA", "1-kings", "1 Kings", "ot"), ("2SA", "2-kings", "2 Kings", "ot"),
    ("1KI", "3-kings", "3 Kings", "ot"), ("2KI", "4-kings", "4 Kings", "ot"),
    ("1CH", "1-paralipomenon", "1 Paralipomenon", "ot"),
    ("2CH", "2-paralipomenon", "2 Paralipomenon", "ot"),
    ("EZR", "1-esdras", "1 Esdras", "ot"), ("NEH", "2-esdras", "2 Esdras", "ot"),
    ("TOB", "tobias", "Tobias", "ot"), ("JDT", "judith", "Judith", "ot"),
    ("EST", "esther", "Esther", "ot"), ("JOB", "job", "Job", "ot"),
    ("PSA", "psalms", "Psalms", "ot"), ("PRO", "proverbs", "Proverbs", "ot"),
    ("ECC", "ecclesiastes", "Ecclesiastes", "ot"),
    ("SNG", "canticles", "Canticle of Canticles", "ot"),
    ("WIS", "wisdom", "Wisdom", "ot"), ("SIR", "ecclesiasticus", "Ecclesiasticus", "ot"),
    ("ISA", "isaias", "Isaias", "ot"), ("JER", "jeremias", "Jeremias", "ot"),
    ("LAM", "lamentations", "Lamentations", "ot"), ("BAR", "baruch", "Baruch", "ot"),
    ("EZK", "ezechiel", "Ezechiel", "ot"), ("DAN", "daniel", "Daniel", "ot"),
    ("HOS", "osee", "Osee", "ot"), ("JOL", "joel", "Joel", "ot"),
    ("AMO", "amos", "Amos", "ot"), ("OBA", "abdias", "Abdias", "ot"),
    ("JON", "jonas", "Jonas", "ot"), ("MIC", "micheas", "Micheas", "ot"),
    ("NAM", "nahum", "Nahum", "ot"), ("HAB", "habacuc", "Habacuc", "ot"),
    ("ZEP", "sophonias", "Sophonias", "ot"), ("HAG", "aggeus", "Aggeus", "ot"),
    ("ZEC", "zacharias", "Zacharias", "ot"), ("MAL", "malachias", "Malachias", "ot"),
    ("1MA", "1-machabees", "1 Machabees", "ot"), ("2MA", "2-machabees", "2 Machabees", "ot"),
    ("MAT", "matthew", "Matthew", "nt"), ("MRK", "mark", "Mark", "nt"),
    ("LUK", "luke", "Luke", "nt"), ("JHN", "john", "John", "nt"),
    ("ACT", "acts", "Acts", "nt"), ("ROM", "romans", "Romans", "nt"),
    ("1CO", "1-corinthians", "1 Corinthians", "nt"),
    ("2CO", "2-corinthians", "2 Corinthians", "nt"),
    ("GAL", "galatians", "Galatians", "nt"), ("EPH", "ephesians", "Ephesians", "nt"),
    ("PHP", "philippians", "Philippians", "nt"), ("COL", "colossians", "Colossians", "nt"),
    ("1TH", "1-thessalonians", "1 Thessalonians", "nt"),
    ("2TH", "2-thessalonians", "2 Thessalonians", "nt"),
    ("1TI", "1-timothy", "1 Timothy", "nt"), ("2TI", "2-timothy", "2 Timothy", "nt"),
    ("TIT", "titus", "Titus", "nt"), ("PHM", "philemon", "Philemon", "nt"),
    ("HEB", "hebrews", "Hebrews", "nt"), ("JAM", "james", "James", "nt"),
    ("1PE", "1-peter", "1 Peter", "nt"), ("2PE", "2-peter", "2 Peter", "nt"),
    ("1JN", "1-john", "1 John", "nt"), ("2JN", "2-john", "2 John", "nt"),
    ("3JN", "3-john", "3 John", "nt"), ("JUD", "jude", "Jude", "nt"),
    ("REV", "apocalypse", "Apocalypse", "nt"),
]

# The canonical chapter count of each book, to fail loudly on a bad source.
CANON = {
    "genesis": 50, "exodus": 40, "leviticus": 27, "numbers": 36, "deuteronomy": 34,
    "josue": 24, "judges": 21, "ruth": 4, "1-kings": 31, "2-kings": 24, "3-kings": 22,
    "4-kings": 25, "1-paralipomenon": 29, "2-paralipomenon": 36, "1-esdras": 10,
    "2-esdras": 13, "tobias": 14, "judith": 16, "esther": 16, "job": 42, "psalms": 150,
    "proverbs": 31, "ecclesiastes": 12, "canticles": 8, "wisdom": 19, "ecclesiasticus": 51,
    "isaias": 66, "jeremias": 52, "lamentations": 5, "baruch": 6, "ezechiel": 48,
    "daniel": 14, "osee": 14, "joel": 3, "amos": 9, "abdias": 1, "jonas": 4, "micheas": 7,
    "nahum": 3, "habacuc": 3, "sophonias": 3, "aggeus": 2, "zacharias": 14, "malachias": 4,
    "1-machabees": 16, "2-machabees": 15, "matthew": 28, "mark": 16, "luke": 24, "john": 21,
    "acts": 28, "romans": 16, "1-corinthians": 16, "2-corinthians": 13, "galatians": 6,
    "ephesians": 6, "philippians": 4, "colossians": 4, "1-thessalonians": 5,
    "2-thessalonians": 3, "1-timothy": 6, "2-timothy": 4, "titus": 3, "philemon": 1,
    "hebrews": 13, "james": 5, "1-peter": 5, "2-peter": 3, "1-john": 5, "2-john": 1,
    "3-john": 1, "jude": 1, "apocalypse": 22,
}

# Per translation: `chapters` where its count rightly differs from the Douay
# canon, `renumber` for chapters where the source misnumbers a verse (the
# Douay's Wisdom 18 jumps from 24 to 26, for a chapter of 25 verses), which are
# renumbered in order, `names` when the book titles come from the source
# (`\\h`) rather than the Douay list, and `strip` for characters to drop.
TRANSLATIONS = {
    "drb": {"renumber": {("wisdom", "18")}, "summaries": True},
    # Conte prints Esther in the Greek order, its additions in place: 15 chapters.
    "cpdv": {"chapters": {"esther": 15}, "names": True},
    # The Clementine Text Project brackets its verse passages; the brackets are
    # typesetting, not text.
    "vulgate": {"strip": "[]"},
}

# Codes a source spells differently from the list above.
CODE_ALIASES = {"JAS": "JAM"}

# Paragraph and poetry markers that carry verse text on their own line.
TEXT_MARKERS = {"p", "m", "pi", "pi1", "q", "q1", "q2", "q3", "qm", "nb", "pc", "li", "li1", "d"}


def clean(text: str) -> str:
    text = re.sub(r"\\f .*?\\f\*", "", text)  # Challoner's annotations
    text = re.sub(r"\\x .*?\\x\*", "", text)  # cross-references
    text = re.sub(r"\\rq .*?\\rq\*", "", text)
    text = re.sub(r"\\vp .*?\\vp\*", "", text)  # alternate printed verse number
    text = re.sub(r"\\w ([^|\\]*)(\|[^\\]*)?\\w\*", r"\1", text)
    text = re.sub(r"\\\+?[a-z0-9]+\*?", "", text)  # any remaining character marker
    text = text.replace("¶", "")  # the CPDV marks its paragraphs in the text as well
    return re.sub(r"\s+", " ", text).strip()


def parse(path: Path) -> tuple[dict[str, dict[str, str]], str, dict[str, str], str]:
    chapters: dict[str, dict[str, str]] = {}
    summaries: dict[str, str] = {}
    intro: list[str] = []
    chapter = verse = None
    name = ""
    # Poetry opens a verse mid-line (`\\q1 \\v 2 …`): give each verse its own line.
    source = re.sub(r"[ \t]+\\v (?=\d)", "\n\\\\v ", path.read_text(encoding="utf-8-sig"))
    for raw in source.splitlines():
        line = raw.strip()
        if not line:
            continue
        marker, _, rest = line[1:].partition(" ") if line.startswith("\\") else ("", "", line)
        if marker == "h" and not name:
            name = rest.strip()
        elif marker == "c":
            chapter, verse = rest.strip(), None
            chapters[chapter] = {}
        elif marker == "cd" and chapter:
            summaries[chapter] = clean(rest)
        elif marker in ("im", "ip") and chapter is None:
            intro.append(clean(rest))
        elif marker == "v" and chapter:
            number, _, text = rest.partition(" ")
            verse = number.strip()
            chapters[chapter][verse] = clean(text)
        elif chapter and verse and (marker == "" or marker in TEXT_MARKERS):
            more = clean(rest)
            if more:
                chapters[chapter][verse] = f"{chapters[chapter][verse]} {more}".strip()
    # Ecclesiasticus prints its translator's prologue as "chapter 0"; it is
    # front matter, so it joins the book's introduction.
    prologue = chapters.pop("0", None)
    if prologue:
        intro.extend(prologue.values())
    return chapters, " ".join(p for p in intro if p), summaries, name


def book_code(path: Path) -> str:
    first = path.read_text(encoding="utf-8-sig").split("\n", 1)[0]
    code = first.removeprefix("\\id ").split()[0] if first.startswith("\\id ") else ""
    return CODE_ALIASES.get(code, code)


def main() -> None:
    if len(sys.argv) != 3 or sys.argv[1] not in TRANSLATIONS:
        sys.exit(__doc__)
    config = TRANSLATIONS[sys.argv[1]]
    out = BIBLE / sys.argv[1]
    out.mkdir(parents=True, exist_ok=True)
    source = Path(sys.argv[2])
    files = {book_code(p): p for p in [*source.glob("*.sfm"), *source.glob("*.usfm")]}
    index, summaries, gaps = [], {}, []
    for code, slug, name, testament in BOOKS:
        chapters, intro, args, own_name = parse(files[code])
        if config.get("names"):
            name = own_name
        expected = config.get("chapters", {}).get(slug, CANON[slug])
        if len(chapters) != expected:
            sys.exit(f"{slug}: {len(chapters)} chapters, expected {expected}")
        for number in list(chapters):
            if (slug, number) in config.get("renumber", ()):
                chapters[number] = {
                    str(i): text for i, text in enumerate(chapters[number].values(), start=1)
                }
            verses = chapters[number]
            keys = [int(v) for v in verses]
            # Contiguous, but not always from 1: Psalm 115 continues Psalm 114's
            # numbering (verses 10-19), as the Vulgate prints it.
            if not keys or keys != list(range(keys[0], keys[0] + len(keys))):
                gaps.append(f"{slug} {number}")
            for char in config.get("strip", ""):
                verses = chapters[number] = {v: t.replace(char, "").strip() for v, t in verses.items()}
            if any(not text for text in verses.values()):
                sys.exit(f"{slug} {number}: empty verse")
        (out / f"{slug}.json").write_text(
            json.dumps(chapters, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
        )
        index.append({"slug": slug, "name": name, "testament": testament, "chapters": len(chapters)})
        summaries[slug] = {"intro": intro, "chapters": args}
    (out / "index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8"
    )
    if config.get("summaries"):
        (out / "summaries.json").write_text(
            json.dumps(summaries, ensure_ascii=False, indent=1) + "\n", encoding="utf-8"
        )
    verses = sum(len(v) for b in index for v in json.loads((out / f"{b['slug']}.json").read_text()).values())
    if gaps:
        print("verse numbers skip in:", ", ".join(gaps))
    print(f"{len(index)} books, {sum(b['chapters'] for b in index)} chapters, {verses} verses")


if __name__ == "__main__":
    main()
