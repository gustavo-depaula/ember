"""What the Hebrew Bible scripts share: the books, their names in each source,
and the few text helpers every step needs.

Each book is one row: the Douay slug the app keys every Bible on, the OSIS
name of its file in the Open Scriptures Hebrew Bible (wlc/<name>.xml), the
three-letter code STEPBible's TAHOT uses, and SIL's code in its .vrs tables.
The order is the Hebrew Bible's as the WLC files run; the app's order is the
Douay's (content/bible/drb/index.json), which index.json follows.
"""
from __future__ import annotations

import json
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BIBLE = ROOT / "content" / "bible"
OUT = BIBLE / "hebrew-wlc"
LEXICON = BIBLE / "lexicon-hebrew"

# slug, WLC (OSIS) name, TAHOT code, SIL code
BOOKS = [
    ("genesis", "Gen", "Gen", "GEN"),
    ("exodus", "Exod", "Exo", "EXO"),
    ("leviticus", "Lev", "Lev", "LEV"),
    ("numbers", "Num", "Num", "NUM"),
    ("deuteronomy", "Deut", "Deu", "DEU"),
    ("josue", "Josh", "Jos", "JOS"),
    ("judges", "Judg", "Jdg", "JDG"),
    ("ruth", "Ruth", "Rut", "RUT"),
    ("1-kings", "1Sam", "1Sa", "1SA"),
    ("2-kings", "2Sam", "2Sa", "2SA"),
    ("3-kings", "1Kgs", "1Ki", "1KI"),
    ("4-kings", "2Kgs", "2Ki", "2KI"),
    ("1-paralipomenon", "1Chr", "1Ch", "1CH"),
    ("2-paralipomenon", "2Chr", "2Ch", "2CH"),
    ("1-esdras", "Ezra", "Ezr", "EZR"),
    ("2-esdras", "Neh", "Neh", "NEH"),
    ("esther", "Esth", "Est", "EST"),
    ("job", "Job", "Job", "JOB"),
    ("psalms", "Ps", "Psa", "PSA"),
    ("proverbs", "Prov", "Pro", "PRO"),
    ("ecclesiastes", "Eccl", "Ecc", "ECC"),
    ("canticles", "Song", "Sng", "SNG"),
    ("isaias", "Isa", "Isa", "ISA"),
    ("jeremias", "Jer", "Jer", "JER"),
    ("lamentations", "Lam", "Lam", "LAM"),
    ("ezechiel", "Ezek", "Ezk", "EZK"),
    ("daniel", "Dan", "Dan", "DAN"),
    ("osee", "Hos", "Hos", "HOS"),
    ("joel", "Joel", "Jol", "JOL"),
    ("amos", "Amos", "Amo", "AMO"),
    ("abdias", "Obad", "Oba", "OBA"),
    ("jonas", "Jonah", "Jon", "JON"),
    ("micheas", "Mic", "Mic", "MIC"),
    ("nahum", "Nah", "Nam", "NAM"),
    ("habacuc", "Hab", "Hab", "HAB"),
    ("sophonias", "Zeph", "Zep", "ZEP"),
    ("aggeus", "Hag", "Hag", "HAG"),
    ("zacharias", "Zech", "Zec", "ZEC"),
    ("malachias", "Mal", "Mal", "MAL"),
]
SLUGS = [b[0] for b in BOOKS]
SLUG_OF_TAHOT = {b[2]: b[0] for b in BOOKS}
SLUG_OF_WLC = {b[1]: b[0] for b in BOOKS}
WLC_OF = {b[0]: b[1] for b in BOOKS}
SIL_OF = {b[0]: b[3] for b in BOOKS}

MAQAF = "־"
PASEQ = "׀"
SOF_PASUQ = "׃"


def nfc(s: str) -> str:
    return unicodedata.normalize("NFC", s)


def skeleton(s: str) -> str:
    """The consonants alone (final forms kept): what two editions of the same
    words are matched on, whatever their points, accents or punctuation."""
    return "".join(c for c in s if "א" <= c <= "ת")


def douay_order() -> list[dict]:
    """The Douay's Old Testament books, in its order, with its names."""
    drb = json.loads((BIBLE / "drb" / "index.json").read_text(encoding="utf-8"))
    return [b for b in drb if b["testament"] == "ot"]


def dump(path: Path, data, pretty: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = (
        json.dumps(data, ensure_ascii=False, indent="\t") + "\n"
        if pretty
        else json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    )
    path.write_text(text, encoding="utf-8")


def tokens(text: str) -> list[str]:
    """A verse's tokens as the app splits it: on whitespace, then after every
    maqaf (which stays at the end of the first part)."""
    out: list[str] = []
    for piece in text.split():
        while MAQAF in piece[:-1]:
            i = piece.index(MAQAF) + 1
            out.append(piece[:i])
            piece = piece[i:]
        out.append(piece)
    return out
