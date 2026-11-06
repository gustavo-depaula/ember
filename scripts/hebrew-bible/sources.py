#!/usr/bin/env python3
"""Write content/bible/hebrew-wlc/sources.json: what each part of the edition
is made from, under what licence, and the credit that licence asks — the
shape of the Greek editions' (scripts/greek-bible/sources.py).

Parts: text, words, concordance, versification, paragraphs (open and closed
paragraph marks), accents (accents.json). The facts are the importers'
(wlc.py, versification.py, concordance.py, accents.py); keep them in step.

Usage: python3 -I scripts/hebrew-bible/sources.py
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import OUT, dump  # noqa: E402

OSHB = "https://github.com/openscriptures/morphhb"
STEP = "https://github.com/STEPBible/STEPBible-Data"

sources = [
    {
        "part": "text",
        "name": "Westminster Leningrad Codex",
        "author": "J. Alan Groves Center for Advanced Biblical Research",
        "licence": "Public Domain",
        "attribution": "The Westminster Leningrad Codex (public domain), as the Open Scriptures Hebrew Bible gives it word by word.",
        "url": OSHB,
    },
    {
        "part": "words",
        "name": "Open Scriptures Hebrew Bible",
        "author": "Open Scriptures",
        "licence": "CC-BY-4.0",
        "attribution": "Original work of the Open Scriptures Hebrew Bible available at https://github.com/openscriptures/morphhb (CC BY 4.0): the codex's words, their lemmas and morphology, the written and read forms.",
        "url": OSHB,
    },
    {
        "part": "words",
        "name": "Translators Amalgamated Hebrew OT (TAHOT)",
        "author": "Tyndale House Cambridge / STEPBible.org",
        "licence": "CC-BY-4.0",
        "attribution": "Pieces, extended Strong's numbers, glosses, grammar codes and transliterations from TAHOT, data created by www.STEPBible.org based on work at Tyndale House Cambridge (CC BY 4.0), aligned to the codex by Ember; God's Name glossed and transliterated as the Church reads it (Congregation for Divine Worship, 2008).",
        "url": STEP,
    },
    {
        "part": "concordance",
        "name": "Ember concordance, derived from this edition's words",
        "author": "Ember",
        "licence": "CC-BY-4.0",
        "attribution": "Concordance derived by Ember from this edition's words (Open Scriptures Hebrew Bible and STEPBible TAHOT, CC BY 4.0), under their licence.",
    },
    {
        "part": "versification",
        "name": "Ember verse map to the Clementine Vulgate",
        "author": "Ember",
        "licence": "Public Domain",
        "attribution": "Verse map to the Clementine Vulgate by Ember, drafted from SIL's versification tables (machine.py, MIT, © SIL Global) and STEPBible's TVTMS (CC BY 4.0, Tyndale House Cambridge / STEPBible.org), and checked against the texts.",
        "url": "https://github.com/sillsdev/machine.py",
    },
    {
        "part": "paragraphs",
        "name": "Westminster Leningrad Codex paragraph marks",
        "author": "J. Alan Groves Center for Advanced Biblical Research",
        "licence": "Public Domain",
        "attribution": "The codex's open (פ) and closed (ס) paragraph marks, as the Open Scriptures Hebrew Bible gives them.",
        "url": OSHB,
    },
    {
        "part": "accents",
        "name": "Gesenius' Hebrew Grammar, §15",
        "author": "Wilhelm Gesenius, ed. E. Kautzsch, tr. A. E. Cowley",
        "year": 1910,
        "licence": "Public Domain",
        "attribution": "Accent names, kinds and ranks after Gesenius' Hebrew Grammar §15 (Kautzsch–Cowley, 1910; public domain), as transcribed on English Wikisource (CC BY-SA 4.0).",
        "url": "https://en.wikisource.org/wiki/Gesenius%27_Hebrew_Grammar",
    },
]

dump(OUT / "sources.json", sources, pretty=True)
print(OUT / "sources.json")
