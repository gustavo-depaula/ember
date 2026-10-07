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

Some commentaries have a file to a chapter (the Psalms, Isaiah, Romans): the
whole chapter is then the passage. Three have no marks (1 and 2 Corinthians,
Hebrews), only the words expounded; their lectures are placed by matching
those words to the Douay-Rheims, in order through the chapter, as
build-catena-commentary.py places the Catena's.

Usage:
    python3 scripts/build-aquinas-commentary.py
"""
from __future__ import annotations

import importlib.util
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOKS = ROOT / "content" / "books" / "aquinas-opera-omnia" / "biblical"
DRB = ROOT / "content" / "bible" / "drb"
OUT = ROOT / "content" / "bible" / "aquinas"

spec = importlib.util.spec_from_file_location("catena", Path(__file__).with_name("build-catena-commentary.py"))
catena = importlib.util.module_from_spec(spec)
spec.loader.exec_module(catena)

# The commentary's directory, to the Douay slug of the book it expounds.
COMMENTARIES = {
    "super-iob": "job", "super-psalmos": "psalms", "super-isaiam": "isaias",
    "super-ieremiam": "jeremias", "super-threnos": "lamentations",
    "super-matthaeum": "matthew", "super-iohannem": "john", "super-romanos": "romans",
    "super-galatas": "galatians", "super-ephesios": "ephesians",
    "super-philippenses": "philippians", "super-colossenses": "colossians",
    "super-1-thess": "1-thessalonians", "super-2-thess": "2-thessalonians",
    "super-1-tim": "1-timothy", "super-2-tim": "2-timothy", "super-titum": "titus",
    "super-philemonem": "philemon", "super-1-cor": "1-corinthians",
    "super-2-cor": "2-corinthians", "super-hebraeos": "hebrews",
}


def marked_spans(text: str, drb: dict) -> dict[int, list[int]]:
    """The verses a file marks, by chapter. A prologue quotes other books with
    the same marks, so a chapter named once among many is not this file's."""
    marks = [(c, v) for c, v in re.findall(r"\^(\d+):(\d+)\^", text) if v in drb.get(c, {})]
    named = Counter(c for c, _ in marks)
    spans: dict[int, list[int]] = {}
    for c, v in marks:
        if named[c] > 1 or len(marks) <= 3:
            spans.setdefault(int(c), []).append(int(v))
    return spans


def lemma(text: str) -> str:
    """The words a lecture expounds: what stands before its first paragraph of
    commentary, the first verse plain and the rest set as quotations."""
    words = []
    for n, block in enumerate(text.split("\n\n")[1:]):
        if n > 0 and not block.lstrip().startswith(">"):
            break
        words.append(block.strip().lstrip(">").strip().strip("*"))
    return " ".join(words)


def run_from(words: str, chapter: dict[str, str], start: int) -> int | None:
    """Where a lecture that begins at `start` ends: the run of verses whose
    wording covers the words expounded and adds least of its own. The
    commentary's English is a modern version, not the Douay, so the match is
    loose; a poor one places nothing."""
    last = max(int(v) for v in chapter)
    want = len(catena.words(words))
    best, end, text = 0.0, None, ""
    for verse in range(start, min(last, start + 30) + 1):
        text += " " + chapter.get(str(verse), "")
        have = len(catena.words(text))
        # Covered both ways: the lecture's words found in the run, the run's in the lecture's.
        score = catena.overlap(words, text) * min(1.0, want / have) if have else 0.0
        if score > best:
            best, end = score, verse
    return end if best >= 0.45 else None


def build(directory: str, slug: str) -> tuple[dict | None, str]:
    drb = json.loads((DRB / f"{slug}.json").read_text(encoding="utf-8"))
    book = json.loads((BOOKS / directory / "book.json").read_text(encoding="utf-8"))["id"]
    files = sorted(
        (BOOKS / directory / "en-US").glob("*.md"),
        key=lambda p: [int(n) for n in re.findall(r"\d+", p.stem)],
    )
    # An unmarked commentary's groups are its chapters, but not by number: the
    # prologue takes a group, and a long chapter can take two. Each group is the
    # chapter its opening lecture's words open, or else goes on with the last.
    group_chapter: dict[int, int] = {}
    previous = 0
    for path in files:
        opening = re.fullmatch(r"g(\d+)-c0*1", path.stem)
        if not opening:
            continue
        group = int(opening.group(1))
        words = lemma(path.read_text(encoding="utf-8"))

        def fit(chapter: int) -> float:
            verses = drb.get(str(chapter), {})
            return catena.overlap(" ".join(verses.get(str(v), "") for v in range(1, 3)), words)

        # The next chapter unless another plainly fits better: the commentary's
        # English is not the Douay's, and a loose match must not skip a chapter.
        fits = {c: fit(c) for c in range(max(1, previous), min(len(drb), group) + 1)}
        best = max(fits, key=fits.get, default=0)
        if fits.get(previous + 1, 0) >= 0.3 and fits[previous + 1] >= fits[best] - 0.2:
            best = previous + 1
        previous = best if best and fits[best] >= 0.3 else previous
        group_chapter[group] = previous
    chapters: dict[str, list] = {}
    lectures = by_words = unplaced = 0
    ends: dict[int, int] = {}
    for path in files:
        text = path.read_text(encoding="utf-8")
        spans = {c: (min(v), max(v)) for c, v in marked_spans(text, drb).items()}
        group = re.fullmatch(r"g(\d+)-c\d+", path.stem)
        if not spans and group and group_chapter.get(int(group.group(1))):
            # No marks: the lecture follows the last one placed in its chapter.
            chapter = group_chapter[int(group.group(1))]
            last = max(int(v) for v in drb[str(chapter)])
            start = ends.get(chapter, 0) + 1
            # A lecture takes up where the one before left off.
            end = run_from(lemma(text), drb[str(chapter)], start) if start <= last else None
            if end:
                spans = {chapter: (start, end)}
                by_words += 1
            else:
                unplaced += 1
        lectures += bool(spans)
        for chapter, (first, last_verse) in spans.items():
            ends[chapter] = max(ends.get(chapter, 0), last_verse)
            chapters.setdefault(str(chapter), []).append({"from": first, "to": last_verse, "lecture": path.stem})
    if not chapters:
        return None, "nothing placed"
    for passages in chapters.values():
        passages.sort(key=lambda p: (p["from"], p["to"]))
    ordered = dict(sorted(chapters.items(), key=lambda kv: int(kv[0])))
    covered = sum(
        len({v for p in passages for v in range(p["from"], p["to"] + 1)} & {int(v) for v in drb[c]})
        for c, passages in ordered.items()
    )
    total = sum(len(v) for v in drb.values())
    report = f"{lectures} lectures on {len(chapters)} of {len(drb)} chapters, {round(100 * covered / total)}% of the verses"
    if by_words or unplaced:
        report += f" ({by_words} placed by their words, {unplaced} not placed)"
    return {"book": book, "chapters": ordered}, report


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
