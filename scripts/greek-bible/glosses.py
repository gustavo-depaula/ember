#!/usr/bin/env python3
"""Add an English interlinear gloss to every word of the Greek New Testaments.

Turns each entry of content/bible/greek-<edition>/words/<slug>.json from
[lemma, morph] into [lemma, morph, gloss]. The gloss is a short contextual
English rendering for an interlinear line ("In [the]", "beginning", "was");
"" where the Berean leaves a word untranslated (most articles before a noun).

Source: the Berean Interlinear Bible (BIB) glosses as aligned to the Nestle
1904 by github.com/biblicalhumanities/Nestle1904 (glosses/berean-interlinear-
glosses.xml, the BIB spreadsheet's "Biblos_Gloss" column ordered by its
"Nestle_1904_sort" column). The BIB was "Copyright ©2016 by Bible Hub, used by
permission"; Bible Hub dedicated the Berean Bible texts to the public domain on
30 April 2023 (berean.bible/terms.htm: "All uses are freely permitted"), as
that repo's glosses/README.md records.

  nestle-1904                 the Berean's gloss for the same word. The XML's
                              verse ids follow the KJV and its sort numbers
                              drift, so its Greek is aligned to the Nestle
                              CSV book by book on the bare letters instead.
  sblgnt, tischendorf,        each verse is aligned to the Nestle verse at the
  byzantine                   same shared (Vulgate) address, by lemma + morph,
                              then by lemma alone for what is left, and an
                              aligned word takes the Nestle word's gloss.

A word left unaligned takes the most common Berean gloss for its lemma and
morph across the NT, else for its lemma, else the first sense of its Dodson
`gloss` (content/bible/lexicon/dodson), else "".

Order (each step reads what the one before wrote, and each can be rerun):
    python3 -I scripts/greek-bible/nt.py <edition> ...   for every edition
    python3 -I scripts/greek-bible/glosses.py /tmp/greek-src/Nestle1904
    python3 -I scripts/greek-bible/concordance.py
The Nestle1904 directory is the one nt.py nestle-1904 reads.
"""
from __future__ import annotations

import json
import sys
import xml.etree.ElementTree as ET
from collections import Counter
from difflib import SequenceMatcher
from pathlib import Path

# -I drops the script's directory from sys.path; nt.py and the key live beside us.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lexicon_key import lexicon_key, shard_of  # noqa: E402
from nt import BIBLE, BOOKS, bare, letters, read_nestle_rows  # noqa: E402

EDITIONS = ["sblgnt", "tischendorf", "byzantine"]
Words = dict[str, dict[str, list[list[str]]]]


def read_words(edition: str, slug: str) -> Words:
    return json.loads((BIBLE / f"greek-{edition}" / "words" / f"{slug}.json").read_text(encoding="utf-8"))


def read_text(edition: str, slug: str) -> dict[str, dict[str, str]]:
    return json.loads((BIBLE / f"greek-{edition}" / f"{slug}.json").read_text(encoding="utf-8"))


def write_words(edition: str, slug: str, words: Words) -> None:
    (BIBLE / f"greek-{edition}" / "words" / f"{slug}.json").write_text(
        json.dumps(words, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )


def matched_pairs(a: list, b: list) -> list[tuple[int, int]]:
    # autojunk would discard καί and ὁ as "popular" and misalign around them.
    pairs = []
    for i, j, n in SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        pairs.extend((i + k, j + k) for k in range(n))
    return pairs


# --- Nestle 1904 ← Berean ---------------------------------------------------


def berean_by_book(nestle_dir: Path) -> dict[str, list[tuple[str, str]]]:
    """(bare Greek, gloss) per OSIS book, in the XML's (Greek) word order."""
    root = ET.parse(nestle_dir / "glosses" / "berean-interlinear-glosses.xml").getroot()
    books: dict[str, list[tuple[str, str]]] = {}
    book = ""
    for w in root.iter("w"):
        # Two words have no osisId; they sit inside the book of the word before.
        book = (w.get("osisId") or book).split(".")[0]
        gloss = (w.findtext("gloss") or "").strip()
        # "-" is the Berean's mark for a word it leaves untranslated.
        books.setdefault(book, []).append((bare(w.findtext("greek") or ""), "" if gloss == "-" else gloss))
    return books


def nestle_glosses(nestle_dir: Path) -> dict[tuple[str, str, str], list[str | None]]:
    """Each Nestle verse's glosses, one per word of words/ (None: unaligned)."""
    berean = berean_by_book(nestle_dir)
    rows: dict[str, list[tuple[str, str, str, str]]] = {}
    for ref, text, *_ in read_nestle_rows(nestle_dir):
        book, cv = ref.split(" ")
        # nt.py leaves out Mark "16:99" and folds letterless tokens into a
        # neighbour, so neither has an entry of its own in words/.
        if cv == "16:99" or not letters(text):
            continue
        rows.setdefault(book, []).append((*cv.split(":"), bare(text)))
    out: dict[tuple[str, str, str], list[str | None]] = {}
    for slug, _, osis, *_ in BOOKS:
        greek = [r[2] for r in rows[osis]]
        glosses: list[str | None] = [None] * len(greek)
        for i, j in matched_pairs(greek, [g for g, _ in berean[osis]]):
            glosses[i] = berean[osis][j][1]
        for (chapter, verse, _), gloss in zip(rows[osis], glosses):
            out.setdefault((slug, chapter, verse), []).append(gloss)
    return out


# --- fallbacks ----------------------------------------------------------------


def dodson_gloss(lemma: str, cache: dict[str, dict]) -> str:
    key = lexicon_key(lemma)
    shard = shard_of(key)
    if shard not in cache:
        path = BIBLE / "lexicon" / "dodson" / f"{shard}.json"
        cache[shard] = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    entries = cache[shard].get(key, [])
    # Homographs share a key; prefer the entry spelled exactly as the lemma.
    entry = next((e for e in entries if e["lemma"] == lemma), entries[0] if entries else {})
    return entry.get("gloss", "").split(",")[0].strip()


def fallback(glossed: list[tuple[str, str, str]]):
    """A gloss for a word no alignment reached, from the Nestle's Berean glosses."""
    by_form = {}
    by_lemma = {}
    for lemma, morph, gloss in glossed:
        by_form.setdefault((lexicon_key(lemma), morph), Counter())[gloss] += 1
        by_lemma.setdefault(lexicon_key(lemma), Counter())[gloss] += 1
    dodson: dict[str, dict] = {}

    def gloss_of(lemma: str, morph: str) -> str:
        for counts in (by_form.get((lexicon_key(lemma), morph)), by_lemma.get(lexicon_key(lemma))):
            if counts:
                return counts.most_common(1)[0][0]
        return dodson_gloss(lemma, dodson)

    return gloss_of


# --- the other editions -------------------------------------------------------


def shared_address(edition: str) -> dict[str, dict[str, str | None]]:
    path = BIBLE / f"greek-{edition}" / "versification.json"
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def nestle_verse_for(edition: str, nestle: dict[str, Words]):
    """Map an edition's own "c:v" to the Nestle "c:v" at the same shared address."""
    own = shared_address(edition)
    nestle_map = shared_address("nestle-1904")
    by_shared = {
        slug: {nestle_map.get(slug, {}).get(f"{c}:{v}", f"{c}:{v}"): f"{c}:{v}" for c in words for v in words[c]}
        for slug, words in nestle.items()
    }

    def lookup(slug: str, cv: str) -> str | None:
        shared = own.get(slug, {}).get(cv, cv)
        # A verse the Vulgate lacks (null) is looked for under its own number.
        if shared is None:
            c, v = cv.split(":")
            return cv if v in nestle[slug].get(c, {}) else None
        return by_shared[slug].get(shared)

    return lookup


def align_verse(keys: list[list], nestle_keys: list[list], nestle_glosses: list[str]) -> list[str | None]:
    """Each word's gloss from the Nestle word it aligns with (None: none).

    keys[n][i] is word i's key for pass n. Each pass aligns only within the
    gaps the passes before it left, between their anchors, so a looser key
    never pulls a word away from a closer match.
    """
    out: list[str | None] = [None] * len(keys[0])

    def fill(passes: list[int], lo: int, hi: int, nlo: int, nhi: int) -> None:
        if not passes or lo >= hi or nlo >= nhi:
            return
        n, rest = passes[0], passes[1:]
        pairs = matched_pairs(keys[n][lo:hi], nestle_keys[n][nlo:nhi])
        for i, j in pairs:
            out[lo + i] = nestle_glosses[nlo + j]
        bounds = [(-1, -1), *pairs, (hi - lo, nhi - nlo)]
        for (i0, j0), (i1, j1) in zip(bounds, bounds[1:]):
            fill(rest, lo + i0 + 1, lo + i1, nlo + j0 + 1, nlo + j1)

    fill(list(range(len(keys))), 0, len(keys[0]), 0, len(nestle_keys[0]))
    return out


def verse_keys(entries: list[list[str]], text: str) -> list[list]:
    # Lemma and parsing first; then the lemma alone, for a word the edition
    # parses otherwise (a variant ending, a MorphGNT tag mapped differently);
    # then the bare word as printed, for the lemmas the editions file under
    # different headwords (Strong's εἴδω and φάγω, Nestle's ὁράω and ἐσθίω).
    lemmas = [lexicon_key(e[0]) for e in entries]
    return [list(zip(lemmas, (e[1] for e in entries))), lemmas, [bare(t) for t in text.split()]]


# --- main ---------------------------------------------------------------------


def report(edition: str, total: int, glossed: int, aligned: int) -> None:
    print(f"{edition}: {total} words, {glossed / total:.2%} with a gloss, {aligned / total:.2%} aligned")


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    berean = nestle_glosses(Path(sys.argv[1]))

    nestle: dict[str, Words] = {}
    known: list[tuple[str, str, str]] = []
    for slug, *_ in BOOKS:
        words = read_words("nestle-1904", slug)
        for c, verses in words.items():
            for v, entries in verses.items():
                glosses = berean[(slug, c, v)]
                assert len(glosses) == len(entries), (slug, c, v, len(glosses), len(entries))
                for entry, gloss in zip(entries, glosses):
                    entry[2:] = [gloss]
                    if gloss is not None:
                        known.append((entry[0], entry[1], gloss))
        nestle[slug] = words
    gloss_of = fallback(known)

    total = glossed = aligned = 0
    for slug, words in nestle.items():
        for verses in words.values():
            for entries in verses.values():
                for entry in entries:
                    total += 1
                    aligned += entry[2] is not None
                    if entry[2] is None:
                        entry[2] = gloss_of(entry[0], entry[1])
                    glossed += bool(entry[2])
        write_words("nestle-1904", slug, words)
    report("nestle-1904", total, glossed, aligned)

    nestle_text = {slug: read_text("nestle-1904", slug) for slug, *_ in BOOKS}
    for edition in EDITIONS:
        lookup = nestle_verse_for(edition, nestle)
        total = glossed = aligned = 0
        for slug, *_ in BOOKS:
            words = read_words(edition, slug)
            text = read_text(edition, slug)
            for c, verses in words.items():
                for v, entries in verses.items():
                    found = lookup(slug, f"{c}:{v}")
                    if found:
                        nc, nv = found.split(":")
                        glosses = align_verse(
                            verse_keys(entries, text[c][v]),
                            verse_keys(nestle[slug][nc][nv], nestle_text[slug][nc][nv]),
                            [e[2] for e in nestle[slug][nc][nv]],
                        )
                    else:
                        glosses = [None] * len(entries)
                    for entry, gloss in zip(entries, glosses):
                        total += 1
                        aligned += gloss is not None
                        entry[2:] = [gloss if gloss is not None else gloss_of(entry[0], entry[1])]
                        glossed += bool(entry[2])
            write_words(edition, slug, words)
        report(edition, total, glossed, aligned)


if __name__ == "__main__":
    main()
