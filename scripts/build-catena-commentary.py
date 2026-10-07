#!/usr/bin/env python3
"""Rebuild content/bible/catena/ from the Catena Aurea books.

The Catena Aurea is in the corpus as four books (content/books/aquinas-opera-omnia/
catena-aurea/<gospel>), one file per lecture. A lecture comments a passage: a
clause, a verse, or a run of verses. This lays the English lectures against the
Bible's verses so the reader can show the Fathers beside the text.

Writes `<gospel>.json` as {book, chapters: {chapter: [passage, ...]}} in reading
order, where a passage is {from, to, lecture}: the verses it covers and the
chapter id of its lecture inside the book. The text stays in the book, where
the app reads it; `fathers.json` beside these (kept by hand) names the Fathers
as each transcription abbreviates them.

A lecture states its verses in one of three ways, by gospel and by transcriber:
"8. The neighbours…" lines, "^1:6^" marks, or only the words commented,
sometimes not even that. Those with only words are placed by their likeness to
the Douay-Rheims, in order, each from where the one before it ended; those with
nothing, in the verses left between their neighbours. The numbers are the King
James's and are moved a verse where the Douay counts differently.

Usage:
    python3 scripts/build-catena-commentary.py
"""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOKS = ROOT / "content" / "books" / "aquinas-opera-omnia" / "catena-aurea"
DRB = ROOT / "content" / "bible" / "drb"
OUT = ROOT / "content" / "bible" / "catena"

# How each transcription names the Fathers, to the name shown. The app reads the
# same table to set a lecture's voices, so the two always divide a lecture alike.
FATHERS: dict[str, str] = json.loads((OUT / "fathers.json").read_text(encoding="utf-8"))
ALIASES = sorted(FATHERS, key=len, reverse=True)
NAME = re.compile(
    r"(?:\*\*(?P<bold>[^*]+?)\*\*|(?P<plain>" + "|".join(re.escape(a).replace(r"\ ", r"\.? ") for a in ALIASES) + r"))"
    r"(?=[\s.,;:])[.,;:]*\s+",
    re.I,
)

GOSPELS = {
    # gospel: (book id, lecture file → (group, lecture), group → chapter)
    "matthew": ("aquinas-catena-aurea-matthew", r"g(\d+)-c(\d+)", lambda g: g - 2),
    "mark": ("aquinas-catena-aurea-mark", r"ch(\d+)-l(\d+)", lambda g: g),
    "luke": ("aquinas-catena-aurea-luke", r"g(\d+)-c(\d+)", lambda g: g - 1),
    "john": ("aquinas-catena-aurea-john", r"g(\d+)-c(\d+)", lambda g: g - 1),
}


def words(text: str) -> list[str]:
    return re.findall(r"[a-z]+", text.lower())


def overlap(lemma: str, verse: str) -> float:
    """How much of the lemma's wording the verse carries (0–1). The Catena's
    English is not the Douay's, so word order is not held to."""
    a, b = words(lemma), Counter(words(verse))
    if not a or not b:
        return 0.0
    hits = 0
    for w in a:
        if b[w] > 0:
            b[w] -= 1
            hits += 1
    return hits / len(a)


def voice_of(paragraph: str) -> tuple[str | None, str]:
    match = NAME.match(paragraph)
    if not match:
        return None, paragraph
    name = match.group("bold") or match.group("plain")
    # A sentence can open with a Father's name in ordinary prose; the
    # transcriptions set an attribution in capitals, bold, or abbreviated.
    key = re.sub(r"[.,;:]", "", name).strip().lower()
    key = re.sub(r"\s+", " ", key)
    if key not in FATHERS:
        base = re.split(r",| in | de ", key)[0].strip()
        if base not in FATHERS:
            return None, paragraph
        key = base
    return FATHERS[key], paragraph[match.end():].strip()


def parse_lecture(text: str) -> tuple[list[tuple[int | None, int]], list[str], list[dict]]:
    """The verses a lecture names, the words it comments (a paragraph to a
    verse, as a rule), and its voices."""
    refs: list[tuple[int | None, int]] = []
    lemma: list[str] = []
    voices: list[dict] = []
    for block in text.split("\n\n")[1:]:
        p = re.sub(r"\s+", " ", block.strip().lstrip(">").strip())
        if not p:
            continue
        who, body = voice_of(p)
        if not voices and who is None:
            # Still the passage itself.
            # "^6:2^ …", "6:2. …" and "8. …": chapter and verse, or the verse alone.
            numbered = re.match(r"\**(?:\^(\d+):(\d+)\^|(\d+):(\d+)\.|(\d+)\.) ", p)
            for c, v in re.findall(r"\^(\d+):(\d+)\^", p):
                refs.append((int(c), int(v)))
            if numbered and numbered.group(3):
                refs.append((int(numbered.group(3)), int(numbered.group(4))))
            for v in re.findall(r"(?:^|\s)\**(\d+)\. ", p):
                refs.append((None, int(v)))
            lemma.append(re.sub(r"\^[^^]*\^|[*_]|(?:^|\s)\d+(?::\d+)?\. ", " ", p))
            continue
        body = re.sub(r"\^[^^]*\^", "", body).strip()
        if who is None or (voices and voices[-1]["who"] == who and not NAME.match(p)):
            voices[-1]["text"] += "\n\n" + body
        else:
            voices.append({"who": who, "text": body})
    return refs, [part for part in lemma if part.strip()], voices


def likeness(a: str, b: str) -> float:
    """How far two wordings are the same words (0–1), each way: neither may
    carry much the other lacks."""
    x, y = words(a), words(b)
    if not x or not y:
        return 0.0
    left = Counter(y)
    hits = 0
    for w in x:
        if left[w] > 0:
            left[w] -= 1
            hits += 1
    return 2 * hits / (len(x) + len(y))


def place_run(parts: list[str], chapter: dict[str, str], after: int, limit: int) -> tuple[int, int] | None:
    """The verses a lecture comments, given only their words and where the
    lecture before it ended. It takes up at the next verse or shares the last
    one, and runs about a verse to a paragraph; among such runs, the one whose
    wording is most like the lecture's. The commentaries' English is never the
    Douay's, so a poor likeness places nothing."""
    text = " ".join(parts)
    best, span = 0.0, None
    for start in (after + 1, after, after + 2):
        if start < 1 or start > limit:
            continue
        run = ""
        for end in range(start, min(limit, start + max(12, len(parts) + 3)) + 1):
            run += " " + chapter.get(str(end), "")
            score = likeness(text, run) + 0.04 * (start == after + 1) + 0.08 * (end - start + 1 == len(parts))
            if score > best:
                best, span = score, (start, end)
    return span if best >= 0.45 else None


def shift(lecture_words: str, chapter: dict[str, str], first: int, last: int) -> int:
    """The Catena numbers verses as the King James does, which runs a verse
    behind or ahead of the Douay in places (John 6 from verse 52). Where the
    lecture's words sit plainly better a verse along, that is where it is."""
    def at(d: int) -> float:
        return likeness(lecture_words, " ".join(chapter.get(str(v), "") for v in range(first + d, last + d + 1)))

    best = max((0, 1, -1), key=at)
    return best if at(best) > at(0) + 0.08 else 0


def build(gospel: str) -> tuple[dict, list[str]]:
    book, pattern, chapter_of = GOSPELS[gospel]
    drb = json.loads((DRB / f"{gospel}.json").read_text(encoding="utf-8"))
    lectures = []
    for path in (BOOKS / gospel / "en-US").glob("*.md"):
        match = re.fullmatch(pattern, path.stem)
        if not match:
            continue
        group, n = int(match.group(1)), int(match.group(2))
        refs, parts, voices = parse_lecture(path.read_text(encoding="utf-8"))
        # A lecture that marks its verses "^6:2^" says its chapter itself; a
        # group can run past the end of its chapter (Matthew's fifth, into 6).
        named = Counter(c for c, _ in refs if c is not None and str(c) in drb)
        chapter = named.most_common(1)[0][0] if named else chapter_of(group)
        if str(chapter) in drb and voices:
            lectures.append(
                {"order": (group, n), "chapter": chapter, "id": path.stem, "refs": refs, "parts": parts}
            )
    lectures.sort(key=lambda l: l["order"])

    problems: list[str] = []
    # First the lectures that say their verses.
    for lecture in lectures:
        chapter = lecture["chapter"]
        verses = [v for c, v in lecture["refs"] if (c is None or c == chapter) and str(v) in drb[str(chapter)]]
        lecture["span"] = (min(verses), max(verses)) if verses else None
        if verses:
            d = shift(" ".join(lecture["parts"]), drb[str(chapter)], min(verses), max(verses))
            if d and str(max(verses) + d) in drb[str(chapter)] and min(verses) + d >= 1:
                lecture["span"] = (min(verses) + d, max(verses) + d)
    # Then those with words to match, in order, each from where the one before
    # ended; last those with nothing to go by, in the verses left between.
    for by_words in (True, False):
        for i, lecture in enumerate(lectures):
            if lecture["span"] or (by_words and not lecture["parts"]):
                continue
            chapter = lecture["chapter"]
            last = max(int(v) for v in drb[str(chapter)])
            before = [l["span"][1] for l in lectures[:i] if l["chapter"] == chapter and l["span"]]
            after = [l["span"][0] for l in lectures[i + 1:] if l["chapter"] == chapter and l["span"]]
            lo = before[-1] if before else 0
            hi = after[0] if after else last
            if by_words:
                lecture["span"] = place_run(lecture["parts"], drb[str(chapter)], lo, hi)
                continue
            free_lo = lo + 1
            free_hi = hi - 1 if after else last
            span = (free_lo, free_hi) if free_lo <= free_hi else (lo, lo) if before else (hi, hi)
            problems.append(f"{gospel} {chapter} {lecture['id']}: placed by position at {span[0]}-{span[1]}")
            lecture["span"] = span

    out: dict[str, list] = {}
    for lecture in lectures:
        chapter = lecture["chapter"]
        out.setdefault(str(chapter), []).append(
            {"from": lecture["span"][0], "to": lecture["span"][1], "lecture": lecture["id"]}
        )
    for chapter, passages in out.items():
        for a, b in zip(passages, passages[1:]):
            if b["from"] < a["from"]:
                problems.append(f"{gospel} {chapter} {b['lecture']}: {b['from']}-{b['to']} follows {a['from']}-{a['to']}")
        covered = {v for p in passages for v in range(p["from"], p["to"] + 1)}
        missing = [int(v) for v in drb[chapter] if int(v) not in covered]
        if missing:
            problems.append(f"{gospel} {chapter}: no lecture on {missing}")
    return {"book": book, "chapters": out}, problems


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for gospel in GOSPELS:
        data, problems = build(gospel)
        (OUT / f"{gospel}.json").write_text(
            json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
        )
        passages = [p for c in data["chapters"].values() for p in c]
        print(f"{gospel}: {len(data['chapters'])} chapters, {len(passages)} passages, {len(problems)} to check")
        for problem in problems:
            print("  ", problem)


if __name__ == "__main__":
    main()
