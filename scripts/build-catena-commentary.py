#!/usr/bin/env python3
"""Rebuild content/bible/catena/ from the Catena Aurea books.

The Catena Aurea is in the corpus as four books (content/books/aquinas-opera-omnia/
catena-aurea/<gospel>), one file per lecture. A lecture comments a passage: a
clause, a verse, or a run of verses. This lays the English lectures against the
Bible's verses so the reader can show the Fathers beside the text.

Writes `<gospel>.json` as {chapter: [passage, ...]} in reading order, where a
passage is {from, to, lecture, voices: [{who, text}, ...]}: `from`/`to` are the
verses it covers, `lecture` the chapter id inside the book, and each voice one
Father's contribution (paragraphs joined by a blank line).

A lecture states its verses in one of three ways, by gospel and by transcriber:
"8. The neighbours…" lines, "^1:6^" marks, or only the words commented (a
lemma), sometimes not even that. The last two are placed by matching the words
against the Douay-Rheims, between the lectures on either side.

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

# How each transcription names the Fathers, to the name shown.
FATHERS = {
    "aug": "Augustine", "augustine": "Augustine", "pseudo-aug": "Pseudo-Augustine",
    "pseudo-augustine": "Pseudo-Augustine",
    "chrys": "Chrysostom", "chrysostom": "Chrysostom", "pseudo-chrys": "Pseudo-Chrysostom",
    "pseudo-chrysostom": "Pseudo-Chrysostom", "pseudo-chyrsostum": "Pseudo-Chrysostom",
    "psuedo-chrysostom": "Pseudo-Chrysostom",
    "greg": "Gregory the Great", "gregory": "Gregory the Great",
    "greg nyss": "Gregory of Nyssa", "gregory of nyssa": "Gregory of Nyssa",
    "greg naz": "Gregory Nazianzen",
    "jerome": "Jerome", "pseudo-jerome": "Pseudo-Jerome",
    "hilary": "Hilary", "origen": "Origen", "origin": "Origen",
    "gloss": "The Gloss", "remig": "Remigius", "remigius": "Remigius",
    "raban": "Rabanus Maurus", "ambrose": "Ambrose", "leo": "Leo the Great",
    "bede": "Bede", "alcuin": "Alcuin", "cyril": "Cyril of Alexandria",
    "theophyl": "Theophylact", "theophylact": "Theophylact", "theophlyact": "Theophylact",
    "theophyact": "Theophylact",
    "basil": "Basil", "pseudo-basil": "Pseudo-Basil", "greek ex": "A Greek expositor",
    "titus bost": "Titus of Bostra", "titus": "Titus of Bostra", "eusebius": "Eusebius",
    "athan": "Athanasius", "isidore peleus": "Isidore of Pelusium", "epiphan": "Epiphanius",
    "damascene": "John Damascene", "damas": "John Damascene",
    "maxim": "Maximus", "maximus": "Maximus", "cyprian": "Cyprian",
    "severianus": "Severianus", "haymo": "Haymo", "anselm": "Anselm", "dionysius": "Dionysius",
}
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


def parse_lecture(text: str) -> tuple[list[tuple[int | None, int]], str, list[dict]]:
    """The verses a lecture names, the words it comments, and its voices."""
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
            for c, v in re.findall(r"\^(\d+):(\d+)\^", p):
                refs.append((int(c), int(v)))
            for v in re.findall(r"(?:^|\s)\**(\d+)\. ", p):
                refs.append((None, int(v)))
            lemma.append(re.sub(r"\^[^^]*\^|[*_]|(?:^|\s)\d+\. ", " ", p))
            continue
        body = re.sub(r"\^[^^]*\^", "", body).strip()
        if who is None or (voices and voices[-1]["who"] == who and not NAME.match(p)):
            voices[-1]["text"] += "\n\n" + body
        else:
            voices.append({"who": who, "text": body})
    return refs, " ".join(lemma), voices


def place(lemma: str, chapter: dict[str, str], lo: int, hi: int) -> tuple[int, int] | None:
    """The run of verses in lo..hi whose words the lemma follows best."""
    best, span = 0.0, None
    for start in range(lo, hi + 1):
        text = ""
        for end in range(start, min(hi, start + 11) + 1):
            text += " " + chapter.get(str(end), "")
            # The lemma's words found in the run, less the run's words left over.
            score = overlap(lemma, text) - 0.15 * max(0, len(words(text)) - len(words(lemma))) / max(1, len(words(lemma)))
            if score > best:
                best, span = score, (start, end)
    return span if best >= 0.5 else None


def build(gospel: str) -> tuple[dict, list[str]]:
    book, pattern, chapter_of = GOSPELS[gospel]
    drb = json.loads((DRB / f"{gospel}.json").read_text(encoding="utf-8"))
    lectures = []
    for path in (BOOKS / gospel / "en-US").glob("*.md"):
        match = re.fullmatch(pattern, path.stem)
        if not match:
            continue
        group, n = int(match.group(1)), int(match.group(2))
        chapter = chapter_of(group)
        if str(chapter) not in drb:
            continue
        refs, lemma, voices = parse_lecture(path.read_text(encoding="utf-8"))
        if voices:
            lectures.append({"key": (chapter, n), "id": path.stem, "refs": refs, "lemma": lemma, "voices": voices})
    lectures.sort(key=lambda l: l["key"])

    problems: list[str] = []
    # First the lectures that say their verses.
    for lecture in lectures:
        chapter = lecture["key"][0]
        verses = [v for c, v in lecture["refs"] if (c is None or c == chapter) and str(v) in drb[str(chapter)]]
        lecture["span"] = (min(verses), max(verses)) if verses else None
    # Then those with words to match, each between the placed lectures around
    # it; last those with nothing to go by, in the verses left between.
    for by_words in (True, False):
        for i, lecture in enumerate(lectures):
            if lecture["span"] or (by_words and not lecture["lemma"].strip()):
                continue
            chapter = lecture["key"][0]
            last = max(int(v) for v in drb[str(chapter)])
            before = [l["span"][1] for l in lectures[:i] if l["key"][0] == chapter and l["span"]]
            after = [l["span"][0] for l in lectures[i + 1:] if l["key"][0] == chapter and l["span"]]
            lo = before[-1] if before else 1
            hi = after[0] if after else last
            if by_words:
                lecture["span"] = place(lecture["lemma"], drb[str(chapter)], lo, hi)
                continue
            free_lo = lo + 1 if before else 1
            free_hi = hi - 1 if after else last
            span = (free_lo, free_hi) if free_lo <= free_hi else (lo, lo) if before else (hi, hi)
            problems.append(f"{gospel} {chapter} {lecture['id']}: placed by position at {span[0]}-{span[1]}")
            lecture["span"] = span

    out: dict[str, list] = {}
    for lecture in lectures:
        chapter = lecture["key"][0]
        out.setdefault(str(chapter), []).append(
            {"from": lecture["span"][0], "to": lecture["span"][1], "lecture": lecture["id"], "voices": lecture["voices"]}
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
        print(f"{gospel}: {len(data['chapters'])} chapters, {len(passages)} passages, "
              f"{sum(len(p['voices']) for p in passages)} voices, {len(problems)} to check")
        for problem in problems:
            print("  ", problem)


if __name__ == "__main__":
    main()
