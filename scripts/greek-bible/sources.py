#!/usr/bin/env python3
"""Write content/bible/greek-<edition>/sources.json: what each part of an
edition is made from, under what licence, and the credit that licence asks.

The repository's LICENSE dedicates Ember's own work to the public domain;
these files are where third-party material says otherwise, so anyone who
takes an edition from the corpus (the app, the website, the API) takes its
terms with it. Same shape as content/bible/lexicon/sources.json.

Each entry names the `part` it covers:
    text           the verses (<slug>.json)
    words          words/<slug>.json: lemma, parsing and gloss of each word.
                   The file's licence is the most restrictive of its sources
    concordance    concordance/: derived from words/ alone, so under its licence
    versification  versification.json: the map to the shared Vulgate address

The facts are the importers' (nt.py, glosses.py, lxx.py, lxx_words.py,
lxx_glosses.py), each read in the repository it comes from; keep them in step.

Usage: python3 -I scripts/greek-bible/sources.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "content" / "bible"

berean = {
    "name": "Berean Interlinear Bible glosses",
    "author": "Bible Hub",
    "licence": "Public Domain",
    "attribution": "English glosses from the Berean Interlinear Bible (Bible Hub), dedicated to the public domain on 30 April 2023, as aligned to the Nestle 1904 by the Biblical Humanities project.",
    "url": "https://berean.bible/terms.htm",
}


def ours(part: str, what: str, licence: str = "Public Domain") -> dict:
    return {
        "part": part,
        "name": f"Ember {what}",
        "author": "Ember",
        "licence": licence,
        "attribution": f"{what[0].upper()}{what[1:]} by Ember.",
    }


def concordance(licence: str) -> dict:
    return ours("concordance", "lemma concordance, derived from this edition's words", licence) | {
        "attribution": "Lemma concordance derived by Ember from this edition's words, under their licence.",
    }


nestle = [
    {
        "part": "text",
        "name": "Novum Testamentum Graece",
        "author": "Eberhard Nestle",
        "year": 1904,
        "licence": "Public Domain",
        "attribution": "Eberhard Nestle, Novum Testamentum Graece (British and Foreign Bible Society, 1904), public domain; digital text by Diego Renato dos Santos.",
        "url": "https://github.com/biblicalhumanities/Nestle1904",
    },
    {
        "part": "words",
        "name": "Nestle 1904 morphology",
        "author": "Ulrik Sandborg-Petersen, after Maurice A. Robinson",
        "licence": "CC0-1.0",
        "attribution": "Lemmas and parsing by Ulrik Sandborg-Petersen after Maurice A. Robinson (CC0 1.0), Biblical Humanities project.",
        "url": "https://github.com/biblicalhumanities/Nestle1904",
    },
    {"part": "words"} | berean,
    concordance("CC0-1.0"),
    ours("versification", "verse map to the Clementine Vulgate"),
]

editions = {
    "greek-nestle-1904": nestle,
    "greek-sblgnt": [
        {
            "part": "text",
            "name": "SBL Greek New Testament",
            "author": "Michael W. Holmes",
            "year": 2010,
            "licence": "CC-BY-4.0",
            "attribution": "SBL Greek New Testament (SBLGNT), copyright 2010 by the Society of Biblical Literature and Logos Bible Software, CC BY 4.0.",
            "url": "https://github.com/LogosBible/SBLGNT",
        },
        {
            "part": "words",
            "name": "MorphGNT: SBLGNT Edition",
            "author": "J. K. Tauber, ed.",
            "licence": "CC-BY-SA-3.0",
            "attribution": "MorphGNT: SBLGNT Edition, J. K. Tauber, ed. (CC BY-SA 3.0); its tags converted to Robinson's scheme and refined with the Nestle 1904 morphology (CC0) by Ember. The words files as a whole are CC BY-SA 3.0.",
            "url": "https://github.com/morphgnt/sblgnt",
        },
        {"part": "words"} | berean,
        concordance("CC-BY-SA-3.0"),
        ours("versification", "verse map to the Clementine Vulgate"),
    ],
    "greek-tischendorf": [
        {
            "part": "text",
            "name": "Novum Testamentum Graece, editio octava critica maior",
            "author": "Constantin von Tischendorf",
            "year": 1872,
            "licence": "Public Domain",
            "attribution": "Tischendorf's eighth edition (1869–72), public domain; digital text by G. Clint Yale.",
            "url": "https://github.com/morphgnt/tischendorf-data",
        },
        {
            "part": "words",
            "name": "Tischendorf morphology",
            "author": "Ulrik Sandborg-Petersen, after Maurice A. Robinson",
            "licence": "Public Domain",
            "attribution": "Lemmas and parsing by Ulrik Sandborg-Petersen after Maurice A. Robinson, public domain.",
            "url": "https://github.com/morphgnt/tischendorf-data",
        },
        {"part": "words"} | berean,
        concordance("Public Domain"),
        ours("versification", "verse map to the Clementine Vulgate"),
    ],
    "greek-byzantine": [
        {
            "part": "text",
            "name": "The New Testament in the Original Greek: Byzantine Textform",
            "author": "Maurice A. Robinson and William G. Pierpont",
            "year": 2018,
            "licence": "Unlicense",
            "attribution": "Robinson–Pierpont Byzantine Textform 2018, dedicated to the public domain (The Unlicense).",
            "url": "https://github.com/byztxt/byzantine-majority-text",
        },
        {
            "part": "words",
            "name": "Robinson–Pierpont parsing and Strong's numbers",
            "author": "Maurice A. Robinson",
            "licence": "Unlicense",
            "attribution": "Parsing and Strong's numbers by Maurice A. Robinson (The Unlicense); lemmas from Strong's Greek dictionary (public domain, Open Scriptures XML).",
            "url": "https://github.com/byztxt/byzantine-majority-text",
        },
        {"part": "words"} | berean,
        concordance("Unlicense"),
        ours("versification", "verse map to the Clementine Vulgate"),
    ],
    "greek-brenton": [
        {
            "part": "text",
            "name": "The Septuagint Version of the Old Testament, with an English Translation",
            "author": "Sir Lancelot C. L. Brenton",
            "year": 1851,
            "licence": "Public Domain",
            "attribution": "The Greek text of Brenton's Septuagint with Apocrypha (London, 1851), public domain, from eBible.org (grcbrent).",
            "url": "https://ebible.org/details.php?id=grcbrent",
        },
        {
            "part": "words",
            "name": "lxx-morph",
            "author": "OpenScriptorium",
            "licence": "CC-BY-4.0",
            "attribution": "Lemmas and parsing from lxx-morph by OpenScriptorium (CC BY 4.0), aligned to Brenton's text by Ember.",
            "url": "https://github.com/OpenScriptorium/lxx-morph",
        },
        {
            "part": "words",
            "name": "GLAUx",
            "author": "Alek Keersmaekers",
            "licence": "CC-BY-SA-4.0",
            "attribution": "Cross-check, and the parsing of words lxx-morph lacks, from GLAUx by Alek Keersmaekers (CC BY-SA 4.0). The words files as a whole are therefore CC BY-SA 4.0.",
            "url": "https://github.com/alekkeersmaekers/glaux",
        },
        {
            "part": "words",
            "name": "STEPBible lexicons (TBESG, TFLSJ, TIPNR)",
            "author": "Tyndale House Cambridge / STEPBible.org",
            "licence": "CC-BY-4.0",
            "attribution": "Glosses from STEP Bible, www.STEPBible.org, TBESG, TFLSJ and TIPNR, based on work at Tyndale House Cambridge (CC BY 4.0), adapted by Ember.",
            "url": "https://github.com/STEPBible/STEPBible-Data",
        },
        {"part": "words"} | berean | {
            "attribution": "Glosses of the same forms in the New Testament from the Berean Interlinear Bible (Bible Hub), public domain.",
        },
        concordance("CC-BY-SA-4.0"),
        ours("versification", "verse map to the Clementine Vulgate") | {
            "attribution": "Verse map to the Clementine Vulgate by Ember, drafted from SIL's versification tables (machine.py, MIT, © SIL International) and checked against the texts.",
            "url": "https://github.com/sillsdev/machine.py",
        },
    ],
}

for edition, sources in editions.items():
    path = ROOT / edition / "sources.json"
    path.write_text(json.dumps(sources, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8")
    print(path.relative_to(ROOT.parent.parent))
