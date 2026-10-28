#!/usr/bin/env python3
"""Rebuild content/bible/lectionary/ from the missal's lectionary.

The lectionary (content/missal/lectionary) holds every reading of the Mass, a
file to a day. This turns it around: for each chapter of the Bible, the days
whose Mass reads from it, so a verse can say when the Church hears it.

Writes `<book>.json` as {chapter: [{from, to, day, part, cycle?}]} in the order
of the verses. `day` is the lectionary entry's id, whose title the app reads
from the missal's calendar; `part` is the reading's place in the Mass; `cycle`
is the Sunday year (A, B, C) or the weekday year (I, II) where the day has one.
Only the days the calendar names are kept: the commons are a choice of
readings, not a day.

A reading is announced in Latin ("Léctio libri Isaíæ prophétæ") with its
verses beside it ("63, 16b-17. 19b; 64, 2b-7"); a passage is the run from the
first verse read to the last in each chapter. The psalms are numbered as the
Vulgate numbers them, which is the Douay-Rheims's numbering; the other books
as the Nova Vulgata does, moved where the Douay counts differently.

Usage:
    python3 scripts/build-lectionary-index.py
"""
from __future__ import annotations

import importlib.util
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MISSAL = ROOT / "content" / "missal"
OUT = ROOT / "content" / "bible" / "lectionary"

_spec = importlib.util.spec_from_file_location("clerus", ROOT / "scripts" / "build-clerus-index.py")
clerus = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(clerus)

# The book as its reading is announced, accents dropped, to the Douay slug.
# The first that matches is taken, so a longer name stands before a shorter.
BOOKS = [
    (r"secundum matthaeum", "matthew"), (r"secundum marcum", "mark"), (r"secundum lucam", "luke"),
    (r"secundum ioannem", "john"), (r"actuum", "acts"), (r"apocalypsis", "apocalypse"),
    (r"ad romanos", "romans"), (r"primae .*corinthios", "1-corinthians"),
    (r"secundae .*corinthios", "2-corinthians"), (r"galatas", "galatians"), (r"ephesios", "ephesians"),
    (r"philippenses", "philippians"), (r"colossenses", "colossians"),
    (r"primae .*thessalonicenses", "1-thessalonians"), (r"secundae .*thessalonicenses", "2-thessalonians"),
    (r"primae .*timotheum", "1-timothy"), (r"secundae .*timotheum", "2-timothy"), (r"ad titum", "titus"),
    (r"philemonem", "philemon"), (r"hebraeos", "hebrews"), (r"iacobi", "james"),
    (r"primae .*petri", "1-peter"), (r"secundae .*petri", "2-peter"), (r"primae .*ioannis", "1-john"),
    (r"secundae .*ioannis", "2-john"), (r"tertiae .*ioannis", "3-john"), (r"iudae", "jude"),
    (r"sabiduria", "wisdom"), (r"apocalipsis", "apocalypse"),  # two days are announced in Spanish
    (r"genesis", "genesis"), (r"exodi", "exodus"), (r"levitici", "leviticus"), (r"numeri", "numbers"),
    (r"deuteronomii", "deuteronomy"), (r"iosue", "josue"), (r"iudicum", "judges"), (r"ruth", "ruth"),
    (r"primi samuelis", "1-kings"), (r"secundi samuelis", "2-kings"), (r"primi regum", "3-kings"),
    (r"secundi regum", "4-kings"), (r"primi paralipomenon", "1-paralipomenon"),
    (r"secundi paralipomenon", "2-paralipomenon"), (r"esdrae", "1-esdras"), (r"nehemiae", "2-esdras"),
    (r"thobis", "tobias"), (r"iudith", "judith"), (r"esther", "esther"),
    (r"primi maccabaeorum", "1-machabees"), (r"secundi maccabaeorum", "2-machabees"), (r"libri iob", "job"),
    (r"proverbiorum", "proverbs"), (r"ecclesiastes", "ecclesiastes"), (r"cantici canticorum", "canticles"),
    (r"sapientiae", "wisdom"), (r"ecclesiastici", "ecclesiasticus"), (r"isaiae", "isaias"),
    (r"ieremiae", "jeremias"), (r"lamentationum", "lamentations"), (r"baruch", "baruch"),
    (r"ezechielis", "ezechiel"), (r"danielis", "daniel"), (r"osee", "osee"), (r"ioelis", "joel"),
    (r"amos", "amos"), (r"abdiae", "abdias"), (r"ionae", "jonas"), (r"michaeae", "micheas"),
    (r"nahum", "nahum"), (r"habacuc", "habacuc"), (r"sophoniae", "sophonias"), (r"aggaei", "aggeus"),
    (r"zachariae", "zacharias"), (r"malachiae", "malachias"),
]
PARTS = {"firstReading", "secondReading", "gospel", "psalm"}
ONE_CHAPTER = {"philemon", "2-john", "3-john", "jude", "abdias"}


def plain(text: str) -> str:
    text = text.replace("æ", "ae").replace("ǽ", "ae").replace("Æ", "Ae").replace("œ", "oe")
    return "".join(c for c in unicodedata.normalize("NFD", text) if not unicodedata.combining(c)).lower()


def book_of(announcement: str) -> str | None:
    said = plain(announcement)
    return next((slug for pattern, slug in BOOKS if re.search(pattern, said)), None)


def runs(cite: str, one_chapter: bool = False) -> list[tuple[int, int, int]]:
    """"63, 16b-17. 19b; 64, 2b-7" as (chapter, first verse, last verse) for
    each chapter read from. The refrain a psalm's citation ends with is not a
    reading."""
    cite = re.sub(r"\(.*?\)", "", cite)
    # Some name the book again ("1Jn 3, 18-24", "Ps Ps 7, …"), and the psalm
    # the Vulgate joins from two is cited by its half ("Ps 113 B, 1-2").
    cite = re.sub(r"^(?:cf\. )?(?:[1-3]?[A-Za-z]+ )*", "", cite.strip(), flags=re.I)
    cite = re.sub(r"^(\d+) [AB],", r"\1,", cite)
    numbers = [int(n) for n in re.findall(r"\d+", cite)]
    if one_chapter:
        return [(1, min(numbers), max(numbers))] if numbers else []
    if re.fullmatch(r"\d+", cite):
        return [(int(cite), 1, clerus.END)]
    out: list[tuple[int, int, int]] = []
    chapter = None
    for piece in cite.split(";"):
        # "1, 26 – 2, 3": on into the next chapter.
        across = re.match(r"\s*(\d+), (\d+)[a-z]*\s*[–—-]\s*(\d+), (\d+)", piece)
        if across:
            first, verse, last, end = (int(n) for n in across.groups())
            out.append((first, verse, clerus.END))
            out.extend((c, 1, clerus.END) for c in range(first + 1, last))
            out.append((last, 1, end))
            chapter = last
            continue
        opened = re.match(r"\s*(\d+), ?(.*)", piece)
        verses = piece
        if opened:
            chapter, verses = int(opened.group(1)), opened.group(2)
        numbers = [int(n) for n in re.findall(r"\d+", verses)]
        if chapter is not None and numbers:
            out.append((chapter, min(numbers), max(numbers)))
    return out


def words(lines: list) -> str:
    return " ".join(part if isinstance(part, str) else part.get("t", "") for line in lines for part in line)


def main() -> None:
    days = json.loads((MISSAL / "calendar.json").read_text(encoding="utf-8"))["lectionary"]
    by_book: dict[str, dict[str, list]] = {}
    unread: list[str] = []
    for path in sorted((MISSAL / "lectionary").glob("*.json")):
        day = path.stem
        if day not in days:
            continue
        for item in json.loads(path.read_text(encoding="utf-8"))["items"]:
            part = item.get("part")
            if part not in PARTS:
                continue
            for block in item.get("text", {}).get("la", []):
                if "cite" not in block:
                    continue
                slug = "psalms" if part == "psalm" else book_of(words(block["lines"]))
                # A canticle sung as the psalm names its own book ("Is 12, …").
                if part == "psalm" and not re.match(r"\s*(?:cf\. )?ps ", block["cite"], re.I):
                    continue
                found = runs(block["cite"], slug in ONE_CHAPTER) if slug else []
                if not found:
                    unread.append(f"{day} {part}: {words(block['lines'])!r} {block['cite']!r}")
                    continue
                for chapter, first, last in found:
                    placed = (
                        [(chapter, first, last, None)]
                        if slug == "psalms"
                        else clerus.douay(slug, chapter, first, last)
                    )
                    for douay_chapter, start, end, _label in placed:
                        entry = {"from": start, "to": end, "day": day, "part": part}
                        if item.get("cycle"):
                            entry["cycle"] = item["cycle"]
                        readings = by_book.setdefault(slug, {}).setdefault(str(douay_chapter), [])
                        if entry not in readings:
                            readings.append(entry)

    OUT.mkdir(parents=True, exist_ok=True)
    for slug, chapters in by_book.items():
        ordered = {
            c: sorted(chapters[c], key=lambda r: (r["from"], r["to"], r["day"])) for c in sorted(chapters, key=int)
        }
        (OUT / f"{slug}.json").write_text(
            json.dumps(ordered, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
        )
    readings = sum(len(r) for c in by_book.values() for r in c.values())
    print(f"{len(by_book)} books, {readings} readings, {len(unread)} not read")
    for line in unread:
        print("  ", line)


if __name__ == "__main__":
    main()
