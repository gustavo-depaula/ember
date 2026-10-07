#!/usr/bin/env python3
"""Rebuild content/bible/aquinas/ from St Thomas's commentaries on Scripture.

The commentaries are in the corpus as books (content/books/aquinas-opera-omnia/
biblical/super-*), a file to a lecture. A lecture opens with the verses it
expounds, each marked "^9:8^". This lays the lectures against the Bible's
verses, so the reader can offer the lecture on the verse in hand.

Writes `<book>.json` as {book, chapters: {chapter: [{from, to, lecture}]}}: the
verses a lecture covers in that chapter, and its chapter id inside the book.
Only the index is written; the lecture is read in the book. `index.json` lists
the books that have one.

A commentary is left out when its marks do not hold up against the Douay-
Rheims (the Latin's verse numbers, in some of the Pauline ones, are not the
Bible's), or when it has one file to a chapter, which places nothing.

Usage:
    python3 scripts/build-aquinas-commentary.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOKS = ROOT / "content" / "books" / "aquinas-opera-omnia" / "biblical"
DRB = ROOT / "content" / "bible" / "drb"
OUT = ROOT / "content" / "bible" / "aquinas"

# The commentary's directory, to the Douay slug of the book it expounds.
COMMENTARIES = {
    "super-iob": "job", "super-psalmos": "psalms", "super-isaiam": "isaias",
    "super-ieremiam": "jeremias", "super-threnos": "lamentations",
    "super-matthaeum": "matthew", "super-iohannem": "john", "super-romanos": "romans",
    "super-galatas": "galatians", "super-ephesios": "ephesians",
    "super-philippenses": "philippians", "super-colossenses": "colossians",
    "super-1-thess": "1-thessalonians", "super-2-thess": "2-thessalonians",
    "super-1-tim": "1-timothy", "super-2-tim": "2-timothy", "super-titum": "titus",
    "super-philemonem": "philemon",
}


def build(directory: str, slug: str) -> tuple[dict | None, str]:
    drb = json.loads((DRB / f"{slug}.json").read_text(encoding="utf-8"))
    book = json.loads((BOOKS / directory / "book.json").read_text(encoding="utf-8"))["id"]
    chapters: dict[str, list] = {}
    marks = strays = lectures = 0
    for path in sorted((BOOKS / directory / "en-US").glob("*.md")):
        spans: dict[int, list[int]] = {}
        for chapter, verse in re.findall(r"\^(\d+):(\d+)\^", path.read_text(encoding="utf-8")):
            marks += 1
            if verse in drb.get(chapter, {}):
                spans.setdefault(int(chapter), []).append(int(verse))
            else:
                strays += 1
        lectures += bool(spans)
        for chapter, verses in spans.items():
            chapters.setdefault(str(chapter), []).append(
                {"from": min(verses), "to": max(verses), "lecture": path.stem}
            )
    if marks == 0:
        return None, "no verse marks"
    if strays > marks * 0.05:
        return None, f"{strays} of {marks} marks name verses the Douay-Rheims lacks"
    if lectures < 1.5 * len(chapters):
        return None, f"{lectures} files for {len(chapters)} chapters: a file to a chapter"
    for passages in chapters.values():
        passages.sort(key=lambda p: (p["from"], p["to"]))
    ordered = dict(sorted(chapters.items(), key=lambda kv: int(kv[0])))
    return {"book": book, "chapters": ordered}, f"{lectures} lectures on {len(chapters)} of {len(drb)} chapters"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.json"):
        old.unlink()
    indexed = []
    for directory, slug in COMMENTARIES.items():
        data, report = build(directory, slug)
        if data:
            indexed.append(slug)
            (OUT / f"{slug}.json").write_text(
                json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
            )
        print(f"{slug:16} {'' if data else 'left out: '}{report}")
    (OUT / "index.json").write_text(json.dumps(indexed) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
