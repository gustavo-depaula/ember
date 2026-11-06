#!/usr/bin/env python3
"""Build content/bible/greek-<edition>/ from public-domain Septuagint texts.

Editions and sources:
    swete    Swete, The Old Testament in Greek according to the Septuagint
             (Cambridge, 1887–1912; public domain), as digitized by the Open
             Greek and Latin project's First1KGreek (data/tlg0527, TEI,
             CC BY-SA 4.0: "Septuaginta, ed. H. B. Swete, First1KGreek, Open
             Greek and Latin / Harvard College Library"). Only the TEI is read,
             never the apparatus (<note>) or the running heads.
    brenton  The Greek text of Brenton's Septuagint with Apocrypha (London,
             1851; public domain), ebible.org `grcbrent` USFM.

Swete's digitization is imperfect: First1KGreek has no Ecclesiastes, loses a
printed line here and there (most in Genesis–4 Kingdoms), lacks a few pages
(Wisdom 3:5–17, Daniel 12:5–13, Bel 36–41, Psalm 118:28–35) and in places runs
several verses into one. The cleaning below mends what it can; nothing is
filled in from another edition except single garbled words (SWETE_FIXES).

The verse map (`versification.json`) is drafted from SIL's versification
tables (github.com/sillsdev/machine.py, MIT; see vrs.py) and corrected where
the draft is wrong or silent by `lxx-<edition>.map` beside this script (its
header says how each part was checked against the Clementine Vulgate).

Writes, per edition:
    <slug>.json           {chapter: {verse: text}} in the edition's own numbering
    index.json            the Old Testament books, Douay order and names
    versification.json    {slug: {"c:v": "c:v" | null}}: this edition's verse →
                          the Clementine Vulgate address the app shares, only
                          where they differ; null = no counterpart

Usage:
    python3 -I scripts/greek-bible/lxx.py swete <First1KGreek data/tlg0527 dir> <vrs dir>
    python3 -I scripts/greek-bible/lxx.py brenton <grcbrent USFM dir> <vrs dir>
    python3 -I scripts/greek-bible/lxx.py check <edition>
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BIBLE = ROOT / "content" / "bible"
VULGATE = BIBLE / "vulgate"
TEI = "{http://www.tei-c.org/ns/1.0}"

# Douay slug → (English name, SIL book code). Old Testament only, Douay order.
OT = [
    ("genesis", "Genesis", "GEN"), ("exodus", "Exodus", "EXO"),
    ("leviticus", "Leviticus", "LEV"), ("numbers", "Numbers", "NUM"),
    ("deuteronomy", "Deuteronomy", "DEU"), ("josue", "Josue", "JOS"),
    ("judges", "Judges", "JDG"), ("ruth", "Ruth", "RUT"),
    ("1-kings", "1 Kings", "1SA"), ("2-kings", "2 Kings", "2SA"),
    ("3-kings", "3 Kings", "1KI"), ("4-kings", "4 Kings", "2KI"),
    ("1-paralipomenon", "1 Paralipomenon", "1CH"),
    ("2-paralipomenon", "2 Paralipomenon", "2CH"),
    ("1-esdras", "1 Esdras", "EZR"), ("2-esdras", "2 Esdras", "NEH"),
    ("tobias", "Tobias", "TOB"), ("judith", "Judith", "JDT"),
    ("esther", "Esther", "EST"), ("job", "Job", "JOB"), ("psalms", "Psalms", "PSA"),
    ("proverbs", "Proverbs", "PRO"), ("ecclesiastes", "Ecclesiastes", "ECC"),
    ("canticles", "Canticle of Canticles", "SNG"), ("wisdom", "Wisdom", "WIS"),
    ("ecclesiasticus", "Ecclesiasticus", "SIR"), ("isaias", "Isaias", "ISA"),
    ("jeremias", "Jeremias", "JER"), ("lamentations", "Lamentations", "LAM"),
    ("baruch", "Baruch", "BAR"), ("ezechiel", "Ezechiel", "EZK"),
    ("daniel", "Daniel", "DAN"), ("osee", "Osee", "HOS"), ("joel", "Joel", "JOL"),
    ("amos", "Amos", "AMO"), ("abdias", "Abdias", "OBA"), ("jonas", "Jonas", "JON"),
    ("micheas", "Micheas", "MIC"), ("nahum", "Nahum", "NAM"),
    ("habacuc", "Habacuc", "HAB"), ("sophonias", "Sophonias", "ZEP"),
    ("aggeus", "Aggeus", "HAG"), ("zacharias", "Zacharias", "ZEC"),
    ("malachias", "Malachias", "MAL"), ("1-machabees", "1 Machabees", "1MA"),
    ("2-machabees", "2 Machabees", "2MA"),
]


# ── Swete (First1KGreek TEI) ────────────────────────────────────────────────

# First1KGreek work → where its chapters go: (slug, first source chapter, last
# source chapter, the Douay chapter the first one becomes). The Theodotion
# Daniel, Susanna and Bel are the Church's text (the Old Greek ones Swete also
# prints are left out). Esdras B is Ezra (1–10) + Nehemiah (11–23). The Letter
# of Jeremiah is Baruch 6. Works not listed are outside the Catholic canon
# (Esdras A, 3–4 Maccabees, Odes, Psalms of Solomon) or not Swete (Hart's
# Sirach `tlg034 grc1`, Ottley's Isaiah `tlg048 grc2`). First1KGreek has no
# Ecclesiastes (tlg030 holds only its catalogue entry).
SWETE = [
    ("tlg001", "grc1", [("genesis", 1, 50, 1)]),
    ("tlg002", "grc1", [("exodus", 1, 40, 1)]),
    ("tlg003", "grc1", [("leviticus", 1, 27, 1)]),
    ("tlg004", "grc1", [("numbers", 1, 36, 1)]),
    ("tlg005", "grc1", [("deuteronomy", 1, 34, 1)]),
    ("tlg006", "grc1", [("josue", 1, 24, 1)]),
    ("tlg008", "grc1", [("judges", 1, 21, 1)]),
    ("tlg010", "grc1", [("ruth", 1, 4, 1)]),
    ("tlg011", "grc1", [("1-kings", 1, 31, 1)]),
    ("tlg012", "grc1", [("2-kings", 1, 24, 1)]),
    ("tlg013", "grc1", [("3-kings", 1, 22, 1)]),
    ("tlg014", "grc1", [("4-kings", 1, 25, 1)]),
    ("tlg015", "grc1", [("1-paralipomenon", 1, 29, 1)]),
    ("tlg016", "grc1", [("2-paralipomenon", 1, 36, 1)]),
    ("tlg018", "grc1", [("1-esdras", 1, 10, 1), ("2-esdras", 11, 23, 1)]),
    ("tlg021", "grc1", [("tobias", 1, 14, 1)]),
    ("tlg020", "grc1", [("judith", 1, 16, 1)]),
    ("tlg019", "grc1", []),  # placed verse by verse: swete_esther
    ("tlg032", "grc1", [("job", 1, 42, 1)]),
    ("tlg027", "grc1", [("psalms", 1, 150, 1)]),
    ("tlg029", "grc1", [("proverbs", 1, 31, 1)]),
    ("tlg031", "grc1", [("canticles", 1, 8, 1)]),
    # Encoded chapters 16–20 are Wisdom 15–19 (there is no div numbered 15).
    ("tlg033", "grc1", [("wisdom", 1, 14, 1), ("wisdom", 16, 20, 15)]),
    ("tlg034", "grc2", [("ecclesiasticus", 1, 51, 1)]),
    ("tlg048", "grc1", [("isaias", 1, 66, 1)]),
    ("tlg049", "grc1", [("jeremias", 1, 52, 1)]),
    ("tlg051", "grc1", [("lamentations", 1, 5, 1)]),
    ("tlg050", "grc1", [("baruch", 1, 5, 1)]),
    ("tlg052", "grc1", [("baruch", 1, 1, 6)]),
    ("tlg053", "grc1", [("ezechiel", 1, 48, 1)]),
    ("tlg057", "grc1", [("daniel", 1, 12, 1)]),
    ("tlg055", "grc1", [("daniel", 1, 1, 13)]),
    ("tlg059", "grc1", [("daniel", 1, 1, 14)]),
    ("tlg036", "grc1", [("osee", 1, 14, 1)]),
    ("tlg039", "grc1", [("joel", 1, 3, 1)]),
    ("tlg037", "grc1", [("amos", 1, 9, 1)]),
    ("tlg040", "grc1", [("abdias", 1, 1, 1)]),
    ("tlg041", "grc1", [("jonas", 1, 4, 1)]),
    ("tlg038", "grc1", [("micheas", 1, 7, 1)]),
    ("tlg042", "grc1", [("nahum", 1, 3, 1)]),
    ("tlg043", "grc1", [("habacuc", 1, 3, 1)]),
    ("tlg044", "grc1", [("sophonias", 1, 3, 1)]),
    ("tlg045", "grc1", [("aggeus", 1, 2, 1)]),
    ("tlg046", "grc1", [("zacharias", 1, 14, 1)]),
    ("tlg047", "grc1", [("malachias", 1, 4, 1)]),
    ("tlg023", "grc1", [("1-machabees", 1, 16, 1)]),
    ("tlg024", "grc1", [("2-machabees", 1, 15, 1)]),
]


def _tei_text(el, out: list[str]) -> None:
    """Append the printed text under `el`: not the apparatus or marginalia
    (<note>), not running heads (<head>), not what the encoders struck (<del>)."""
    tag = el.tag.removeprefix(TEI)
    if tag in ("note", "head", "del"):
        return
    if tag == "lb":
        out.append("\n")
    if el.text:
        out.append(el.text)
    for child in el:
        _tei_text(child, out)
        if child.tail:
            out.append(child.tail)


def _is_continuation(raw: str) -> bool:
    """Text sitting between verses: a lowercase start continues the verse
    before (a line the encoders left after a page break, Job 15:35); anything
    else is a title that opens the next one (psalm titles, Isaiah's oracles, the
    preface of Lamentations)."""
    letters = [ch for ch in unicodedata.normalize("NFD", raw) if ch.isalpha()]
    return bool(letters) and letters[0].islower()


def parse_tei(path: Path) -> list[tuple[str, list[list[str]]]]:
    """[(chapter n, [[verse n, raw text], …]), …] in document order. A book
    without chapter divisions (the Letter of Jeremiah) is one chapter "1"."""
    body = ET.parse(path).getroot().find(f".//{TEI}body")
    chapters: list[tuple[str, list[list[str]]]] = []
    pending: list[str] = []  # title text waiting for the next verse

    def chapter() -> list[list[str]]:
        if not chapters:
            chapters.append(("1", []))
        return chapters[-1][1]

    def loose(text: str) -> None:
        if not text.strip():
            return
        verses = chapters[-1][1] if chapters else []
        if verses and _is_continuation(text):
            verses[-1][1] += " " + text
        else:
            pending.append(text)

    def walk(el) -> None:
        tag = el.tag.removeprefix(TEI)
        kind = el.get("subtype")
        if tag in ("note", "head", "del"):
            return
        if tag == "div" and kind == "verse":
            out: list[str] = []
            _tei_text(el, out)
            chapter().append([el.get("n"), " ".join(pending) + " " + "".join(out)])
            pending.clear()
            return
        if tag == "div" and kind == "chapter":
            chapters.append((el.get("n"), []))
        own: list[str] = []
        if el.text:
            own.append(el.text)
        for child in el:
            if child.tag.removeprefix(TEI) in ("div", "p", "lg", "l") or len(child):
                loose("".join(own))
                own = []
                walk(child)
            else:
                piece: list[str] = []
                _tei_text(child, piece)
                own.extend(piece)
            if child.tail:
                own.append(child.tail)
        loose("".join(own))

    walk(body)
    if pending:
        raise ValueError(f"{path.name}: text after the last verse: {pending}")
    return chapters


# Latin letters the OCR read for Greek capitals that look the same.
HOMOGLYPHS = str.maketrans({
    "A": "Α", "B": "Β", "E": "Ε", "H": "Η", "I": "Ι", "K": "Κ", "M": "Μ", "N": "Ν",
    "O": "Ο", "P": "Ρ", "T": "Τ", "X": "Χ", "Y": "Υ", "Z": "Ζ", "o": "ο", "l": "Ι",
    "ϲ": "σ", "Ϲ": "Σ",
})
SUPERSCRIPTS = "⁰¹²³⁴⁵⁶⁷⁸⁹"
GREEK = r"[\u0370-\u03ff\u1f00-\u1fff]"


ELIDED = {
    "επ", "εφ", "μετ", "μεθ", "απ", "αφ", "κατ", "καθ", "παρ", "αλλ", "αντ", "ανθ", "δι",
    "δ", "υπ", "υφ", "ουδ", "μηδ", "αν", "ιν", "ποτ", "τοτ", "οτ", "εστ", "τ", "γ", "σ", "μ",
    "ουδεν", "εφ", "οθ", "αμφ", "παντ", "πανθ",
}


def _bare(word: str) -> str:
    d = unicodedata.normalize("NFD", word.lower())
    return "".join(ch for ch in d if not unicodedata.combining(ch) and ch.isalpha())


def _elision(t: str) -> str:
    """One elision mark (’) where Swete prints one; the OCR's stray
    apostrophes inside or after other words go. Inside a word the mark is an
    elision only before a breathing (μετ’αὐτοῦ, a lost space); otherwise it
    is noise (ἐποίη’σαν)."""
    t = re.sub(r"[ʼ'᾿’]", "’", t)

    def inside(m):
        breathing = re.search("[\u0313\u0314]", unicodedata.normalize("NFD", m.group(2)))
        return f"{m.group(1)}’ {m.group(2)}" if breathing else m.group(1) + m.group(2)

    t = re.sub(r"(\w)’(\w)", inside, t)
    t = re.sub(r"(\w+)’", lambda m: m.group(0) if _bare(m.group(1)) in ELIDED else m.group(1), t)
    return re.sub(r"(?<!\w)’", "", t)


def clean_swete(raw: str) -> str:
    """The printed verse, without what digitization left in it: line-break
    hyphens, the editor's alternative verse numbers "(13)", page-margin
    chapter numerals, stray verse digits, Latin look-alike letters,
    and spaces before punctuation."""
    t = re.sub(r"U\+([0-9A-F]{4})", lambda m: chr(int(m.group(1), 16)), raw)
    t = unicodedata.normalize("NFC", t)  # parts of the TEI are decomposed
    t = t.replace("x003E;", "").replace("&gt;", "").replace("&lt;", "")
    t = re.sub(r"[¶§\[\]*†‡]", " ", t)
    t = re.sub(r"(\S)-\s*\n\s*(?=\S)", r"\1", t)  # word broken across lines
    t = re.sub(r"(" + GREEK + r")-\s+(?=" + GREEK + r")", r"\1", t)
    t = re.sub(r"\(\s*[\d" + SUPERSCRIPTS + r"]+[a-z]?(?:\s*[-–]\s*[\d]+[a-z]?)?\s*\)", " ", t)
    # Roman chapter numerals Swete prints in the margin, read into the text.
    t = re.sub(r"(?<![^\s(])(?:[IVXL]{2,6}|[VXL])(?=\s|$|" + GREEK + r")", " ", t)
    t = re.sub(r"[(⁽]+[ªᵃᵇ⁾]*\)", " ", t)
    # The half-verse letters of Proverbs and Job (a, ᵇ) set before a line.
    t = re.sub(r"(?<!\S)[a-eᵃᵇᶜᵈᵉ](?=\s|$|" + GREEK + ")", " ", t)
    t = re.sub(r"[\d" + SUPERSCRIPTS + r"]+", "", t)
    # Second pass: a verse number inside the brackets or before the letter
    # hid these from the passes above.
    t = re.sub(r"[(⁽]+[ªᵃᵇ⁾]*\)", " ", t)
    t = re.sub(r"(?<!\S)[a-eᵃᵇᶜᵈᵉ](?=" + GREEK + ")", "", t)
    t = t.replace("•", "·")
    t = re.sub(r"[|/\\<>»«^_¨´`£√?\"]+", " ", t)
    # A breathing printed before a capital (᾿Ιὼβ, ’lσραὴλ) belongs on it.
    t = re.sub(r"(?<!\S)[’᾿ʼ']\s?([A-Za-zΑΕΗΙΟΥΩ])",
               lambda m: m.group(1).translate(HOMOGLYPHS) + "\u0313", t)
    t = re.sub(r"(?<!\S)[‘῾]\s?([A-Za-zΑΕΗΙΟΥΩΡ])",
               lambda m: m.group(1).translate(HOMOGLYPHS) + "\u0314", t)
    t = t.translate(HOMOGLYPHS)
    t = re.sub(r"(?<=" + GREEK + ")s|s(?=" + GREEK + ")", "σ", t)
    t = re.sub(r"(?<!\S)ΙΙ(?=\w)", lambda m: "Π" if t[m.end()].islower() else "ΙΙ", t)  # Π as two iotas
    # A capital inside a lowercase word is the OCR's (ἸωσὴΦ).
    t = re.sub(r"(?<=\w)[Α-Ω]", lambda m: m.group(0).lower() if t[m.start() - 1].islower() else m.group(0), t)
    # Margin sigla (D, F, C), apparatus signs and stray letters left alone.
    t = re.sub(r"(?<!\S)(?:[A-Za-z]{1,3}|[+°-])(?=[\s;.,]|$)[;.,]?", " ", t)
    t = re.sub(r"\s+", " ", t)
    t = re.sub(r"\s+([,.·;:!])", r"\1", t)
    t = re.sub(r"[\x00-\x1f\x7f-\x9f]", "", t)
    t = unicodedata.normalize("NFC", t.strip())
    # Every accent a Greek vowel can carry composes under NFC; a mark still
    # loose afterwards (a dot below, a iota under a consonant) is OCR noise.
    t = "".join(ch for ch in t if unicodedata.category(ch) != "Mn")
    t = _elision(t)
    # The OCR doubled small words at line ends; the Greek never repeats these
    # (unlike σφόδρα σφόδρα or ἄνθρωπος ἄνθρωπος, which stay).
    t = re.sub(r"(?<!\S)(καὶ|δὲ|τοῦ|τῷ|τὸν|τὸ|τὰ|τῶν|τὴν|τῇ|τοὺς|ἡ|ἐν|εἰς|πρὸς|κατὰ|οὐκ) \1(?=[\s,.·;]|$)", r"\1", t)
    t = re.sub(r"ς(?=" + GREEK + ")", "σ", t)
    return re.sub(r"σ(?=[\s,.·;:!)’]|$)", "ς", t)


# ── Brenton (ebible.org USFM) ───────────────────────────────────────────────


def parse_usfm(path: Path) -> list[tuple[str, list[list[str]]]]:
    """[(chapter, [[verse label, text], …]), …]. Verse labels keep their
    letters (`24a`); footnotes, cross references and headings are dropped,
    character styles keep their text."""
    chapters: list[tuple[str, list[list[str]]]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = re.sub(r"\\(f|x|fe)\s.*?\\\1\*", "", line)
        m = re.match(r"\\c\s+(\d+)", line)
        if m:
            chapters.append((m.group(1), []))
            continue
        marker = re.match(r"\\(\w+)", line)
        if marker and marker.group(1) in ("id", "h", "toc1", "toc2", "toc3", "mt1", "mt2",
                                          "s1", "s2", "is1", "ip", "d", "ms", "rem"):
            continue
        for part in re.split(r"(?=\\v\s)", line):
            v = re.match(r"\\v\s+(\d+[a-z]*)\s*(.*)", part)
            if v:
                chapters[-1][1].append([v.group(1), v.group(2)])
            elif chapters and chapters[-1][1]:
                chapters[-1][1][-1][1] += " " + part
    return [
        (c, [[v, _strip_usfm(t)] for v, t in verses]) for c, verses in chapters
    ]


def _strip_usfm(t: str) -> str:
    t = re.sub(r"\\\+?\w+\*?", " ", t)  # \p, \add … \add*, \nb
    t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"\s+([,.·;:!])", r"\1", t)
    # ebible writes the elision mark as a modifier letter (ʼ); the corpus uses
    # the apostrophe the other Greek editions use. Before a capital the same
    # mark is a smooth breathing (ʼΑβιά = Ἀβιά). A mark that does not compose
    # with its letter (one dot below) is a keying slip.
    t = re.sub(r"(?<!\S)ʼ([ΑΕΗΙΟΥΩ])", "\\1\u0313", t)
    t = unicodedata.normalize("NFC", t).replace("ʼ", "’")
    return "".join(ch for ch in t if unicodedata.category(ch) != "Mn")


# ── Assembly ────────────────────────────────────────────────────────────────

# A row is (slug, chapter, verse label, text) in the edition's order. A label
# is an integer verse or a lettered sub-verse of one (`35a`): the app's verses
# are integers, so a lettered run joins the verse before it, its label kept
# inline so the reader can still find 3 Kingdoms 2:35a.


def merge(rows: list[tuple[str, int, str, str]]) -> dict[str, dict[int, dict[int, str]]]:
    books: dict[str, dict[int, dict[int, str]]] = {}
    last: dict[tuple[str, int], int] = {}
    for slug, ch, label, text in rows:
        if not text:
            continue
        verses = books.setdefault(slug, {}).setdefault(ch, {})
        m = re.fullmatch(r"(\d+)([a-z]\d*)?", label)
        if not m:
            raise ValueError(f"{slug} {ch}:{label}: not a verse label")
        if m.group(2):
            at = last.get((slug, ch))
            if at is None:
                raise ValueError(f"{slug} {ch}:{label}: lettered verse with none before it")
            verses[at] += f" ({label}) {text}"
            continue
        v = int(m.group(1))
        if v in verses:
            raise ValueError(f"{slug} {ch}:{v} twice")
        verses[v] = text
        last[(slug, ch)] = v
    return books


def _lettered(label: str) -> tuple[int, str]:
    m = re.fullmatch(r"(\d+)([a-z]*)", label)
    return int(m.group(1)), m.group(2)


# Swete's Esther prints the Greek additions in place under the encoders'
# provisional labels (prologue 1–17, 3:1a–7a, 4:1a–30a and 1b–16b, 8:1a–24a,
# 10:1a–3a + 1–11). Each is one run of the Vulgate's chapters 10–16, verse for
# verse, so they are filed where the Vulgate has them and the book reads in
# Vulgate order and numbering (the Hebrew chapters keep Swete's numbers, which
# are the Vulgate's).
def swete_esther(ch: str, label: str) -> tuple[int, int]:
    n, letters = _lettered(label)
    if ch == "prologue":
        return (11, n + 1) if n <= 11 else (12, n - 11)
    c = int(ch)
    if not letters:
        if c == 10:
            return (10, n + 3) if n <= 10 else (11, 1)
        return c, n
    if (c, letters) == (3, "a"):
        return 13, n
    if (c, letters) == (4, "a"):
        return (13, n + 7) if n <= 11 else (14, n - 11)
    if (c, letters) == (4, "b"):
        return 15, n + 3
    if (c, letters) == (8, "a"):
        return 16, n
    if (c, letters) == (10, "a"):
        return 10, n
    raise ValueError(f"esther {ch}:{label}")


# Encoding slips in First1KGreek's verse labels: (work, chapter, label before,
# label) → label, each checked against the neighbouring verses.
SWETE_LABELS = {
    ("tlg013", "2", "35h", "35I"): "35i", ("tlg013", "2", "35k", "35i"): "35l",  # a–o, no j
    ("tlg013", "2", "46g", "46n"): "46h", ("tlg013", "2", "46i", "46j"): "46k",
    ("tlg015", "16", "38", "93"): "39", ("tlg016", "4", "19", "220"): "20",
    ("tlg016", "17", "10", "111"): "11", ("tlg018", "17", "67", "79"): "69",
    ("tlg027", "88", "47", "84"): "48", ("tlg027", "118", "130", "31"): "131",
    ("tlg027", "118", "132", "33"): "133", ("tlg019", "4", "10a", "1a1"): "11a",
    ("tlg029", "25", "20", "29a"): "20a",
    ("tlg053", "7", "9", "11s"): "11", ("tlg049", "48", "10", "11s"): "11",
}


def _place(placements, ch: int) -> tuple[str, int] | None:
    for slug, first, last, dest in placements:
        if first <= ch <= last:
            return slug, ch - first + dest
    return None


def load_swete(tei: Path) -> tuple[list[tuple[str, int, str, str]], list[str]]:
    """The rows of every book, and what was left out (as "work chapter")."""
    rows: list[tuple[str, int, str, str]] = []
    dropped: list[str] = []
    for work, edition, placements in SWETE:
        before = None
        for ch, verses in parse_tei(tei / work / f"tlg0527.{work}.1st1K-{edition}.xml"):
            for label, raw in verses:
                fixed = SWETE_LABELS.get((work, ch, before, label), label)
                before = label
                text = clean_swete(raw)
                if work == "tlg019":
                    c, v = swete_esther(ch, fixed)
                    rows.append(("esther", c, str(v), text))
                    continue
                if fixed == "head":  # Isaias 31:9b, encoded as a heading of 32
                    slug, c, v, t = rows[-1]
                    rows[-1] = (slug, c, v, f"{t} {text}")
                    continue
                at = _place(placements, int(ch))
                if at is None:
                    dropped.append(f"{work} {ch}")
                    continue
                rows.append((at[0], at[1], fixed, text))
    return rows, sorted(set(dropped))


# ebible book code → placements, as for SWETE. Left out: 1 Esdras (1ES), the
# Prayer of Manasses (MAN), 3–4 Maccabees, Psalm 151.
BRENTON = [
    ("GEN", [("genesis", 1, 50, 1)]), ("EXO", [("exodus", 1, 40, 1)]),
    ("LEV", [("leviticus", 1, 27, 1)]), ("NUM", [("numbers", 1, 36, 1)]),
    ("DEU", [("deuteronomy", 1, 34, 1)]), ("JOS", [("josue", 1, 24, 1)]),
    ("JDG", [("judges", 1, 21, 1)]), ("RUT", [("ruth", 1, 4, 1)]),
    ("1SA", [("1-kings", 1, 31, 1)]), ("2SA", [("2-kings", 1, 24, 1)]),
    ("1KI", [("3-kings", 1, 22, 1)]), ("2KI", [("4-kings", 1, 25, 1)]),
    ("1CH", [("1-paralipomenon", 1, 29, 1)]), ("2CH", [("2-paralipomenon", 1, 36, 1)]),
    ("EZR", [("1-esdras", 1, 10, 1), ("2-esdras", 11, 23, 1)]),  # Esdras B
    ("TOB", [("tobias", 1, 14, 1)]), ("JDT", [("judith", 1, 16, 1)]),
    ("ESG", []),  # placed verse by verse: BRENTON_ESTHER
    ("JOB", [("job", 1, 42, 1)]), ("PSA", [("psalms", 1, 150, 1)]),
    ("PRO", [("proverbs", 1, 31, 1)]), ("ECC", [("ecclesiastes", 1, 12, 1)]),
    ("SNG", [("canticles", 1, 8, 1)]), ("WIS", [("wisdom", 1, 19, 1)]),
    ("SIR", [("ecclesiasticus", 1, 51, 1)]), ("ISA", [("isaias", 1, 66, 1)]),
    ("JER", [("jeremias", 1, 52, 1)]), ("LAM", [("lamentations", 1, 5, 1)]),
    ("BAR", [("baruch", 1, 5, 1)]), ("LJE", [("baruch", 1, 1, 6)]),
    ("EZK", [("ezechiel", 1, 48, 1)]), ("DAG", [("daniel", 1, 12, 1)]),
    ("SUS", [("daniel", 1, 1, 13)]), ("BEL", [("daniel", 1, 1, 14)]),
    ("HOS", [("osee", 1, 14, 1)]), ("JOL", [("joel", 1, 4, 1)]),
    ("AMO", [("amos", 1, 9, 1)]), ("OBA", [("abdias", 1, 1, 1)]),
    ("JON", [("jonas", 1, 4, 1)]), ("MIC", [("micheas", 1, 7, 1)]),
    ("NAM", [("nahum", 1, 3, 1)]), ("HAB", [("habacuc", 1, 3, 1)]),
    ("ZEP", [("sophonias", 1, 3, 1)]), ("HAG", [("aggeus", 1, 2, 1)]),
    ("ZEC", [("zacharias", 1, 14, 1)]), ("MAL", [("malachias", 1, 3, 1)]),
    ("1MA", [("1-machabees", 1, 16, 1)]), ("2MA", [("2-machabees", 1, 15, 1)]),
]


# ebible's slips in Brenton's verse numbers: (code, chapter, label) → label.
BRENTON_LABELS = {("SIR", "6", "2a"): "1", ("SIR", "6", "2b"): "2"}


def load_brenton(usfm: Path) -> tuple[list[tuple[str, int, str, str]], list[str]]:
    files = {re.match(r"\d+-(\w{3})", f.name).group(1): f for f in usfm.glob("*.usfm")}
    rows: list[tuple[str, int, str, str]] = []
    dropped = sorted(set(files) - {code for code, _ in BRENTON} - {"FRT", "INT", "GLO"})
    prologue: list[str] = []
    for code, placements in BRENTON:
        for ch, verses in parse_usfm(files[code]):
            for label, text in verses:
                label = BRENTON_LABELS.get((code, ch, label), label)
                if code == "ESG":
                    c, v = brenton_esther(int(ch), label)
                    if rows[-1][:3] == ("esther", c, str(v)):
                        rows[-1] = (*rows[-1][:3], f"{rows[-1][3]} {text}")
                    else:
                        rows.append(("esther", c, str(v), text))
                    continue
                # ebible numbers the prologue of Sirach 1:1–1:1g and the
                # book's first verse 1:1h; the Vulgate prints the prologue
                # in 1:1 too, so it opens that verse unlabelled.
                if code == "SIR" and ch == "1" and re.fullmatch(r"1[a-g]?", label):
                    prologue.append(text)
                    continue
                if code == "SIR" and (ch, label) == ("1", "1h"):
                    label, text = "1", " ".join([*prologue, text])
                at = _place(placements, int(ch))
                if at is None:
                    dropped.append(f"{code} {ch}")
                    continue
                rows.append((at[0], at[1], label, text))
    return rows, sorted(set(dropped))


# Brenton's Esther runs each Greek addition on as lettered verses of a Hebrew
# one (1:1–1r, 3:13a–g, 4:17a–z, 5:1–2b, 8:12a–x, 10:3a–l). As with Swete they
# are filed where the Vulgate has them. Brenton divides them more coarsely than
# the Vulgate, so each piece goes to the Vulgate verse it starts (4:17c holds
# 13:10–11) and two pieces share one verse where the Vulgate has a single verse
# for both (8:12a–b, the heading and greeting of the second letter, are 16:1).
# Placed by reading Brenton's English beside the Douay.
BRENTON_ADDITIONS = {
    1: ("1", "bcdefghiklmnopqr", [(11, v) for v in range(3, 13)] + [(12, v) for v in range(1, 7)]),
    3: ("13", "abcdefg", [(13, v) for v in range(1, 8)]),
    4: ("17", "abcdefghiklmnopqrstuwxyz",
        [(13, v) for v in (8, 9, 10, 12, 14, 15, 16, 17, 18)]
        + [(14, v) for v in (1, 3, 5, 6, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19)]),
    8: ("12", "abcdefghiklmnopqrstux",
        [(16, v) for v in (1, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 21, 22, 24)]),
    10: ("3", "abcdefghikl", [(10, v) for v in range(4, 14)] + [(11, 1)]),
}
BRENTON_ESTHER_D = {
    "1": (15, 4), "1a": (15, 5), "1b": (15, 8), "1c": (15, 9), "1d": (15, 10), "1e": (15, 11),
    "1f": (15, 12), "2": (15, 15), "2a": (15, 16), "2b": (15, 18),
}


def brenton_esther(ch: int, label: str) -> tuple[int, int]:
    if ch == 1 and label == "1s":  # the Hebrew book's first verse
        return 1, 1
    if ch == 5 and label in BRENTON_ESTHER_D:
        return BRENTON_ESTHER_D[label]
    if (ch, label) == (1, "1"):  # the first verse of addition A
        return 11, 2
    if ch in BRENTON_ADDITIONS:
        base, letters, places = BRENTON_ADDITIONS[ch]
        rest = label[len(base):]
        if label.startswith(base) and len(rest) == 1 and rest in letters:
            return places[letters.index(rest)]
    if not label.isdigit():
        raise ValueError(f"esther {ch}:{label}")
    return ch, int(label)


# OCR damage the rules above cannot mend, (slug, chapter, verse, as read, as
# printed). Each word was settled from its letters, its context and Brenton's
# reading of the same verse; a word that is only partly legible in the scan
# OCR is not restored. Three verses carry the apparatus into the text, which is
# cut away (Judges 18:8 and Proverbs 19:6 lose the rest of the verse, which the
# digitization does not have); 1 Kings 11:11 and 8:2 are mended from the
# legible half of each word.
SWETE_FIXES = [
    ("genesis", 8, 4, "Áραρἀτ", "Ἀραράτ"), ("genesis", 11, 19, "θηατέρnς", "θυγατέρας"),
    ("genesis", 11, 31, "γυmῖκα", "γυναῖκα"), ("genesis", 12, 14, "Μrπτον", "Αἴγυπτον"),
    ("genesis", 12, 15, "αmὴν", "αὐτὴν"), ("genesis", 12, 16, "αmήν", "αὐτήν"),
    ("genesis", 17, 15, "αmῆς", "αὐτῆς"), ("genesis", 27, 2, "τελεmῆς", "τελευτῆς"),
    ("genesis", 39, 3, "οaa ὂν", "ὅσα ἂν"), ("genesis", 41, 35, "συναγαγ‘τωσαν", "συναγαγέτωσαν"),
    ("genesis", 41, 48, "ἢh", "ἡ"), ("genesis", 41, 50, "ἑπτὰ τοῦ", "ἑπτὰ ἔτη τοῦ"),
    ("genesis", 43, 21, "ἡμῶν σταθμῷ ἀπε στρέψαμεν", "ἡμῶν ἐν σταθμῷ ἀπεστρέψαμεν"),
    ("genesis", 45, 24, "nἐξαπέστειλεν", "ἐξαπέστειλεν"), ("genesis", 47, 8, "Πόσα ἡμερῶν", "Πόσα ἔτη ἡμερῶν"),
    ("exodus", 2, 8, "δ‘ὲ", "δὲ"), ("exodus", 14, 15, "Τi", "Τί"), ("exodus", 14, 15, "υἱο-ς", "υἱοῖς"),
    ("exodus", 16, 29, "ἐẂκεν", "ἔδωκεν"), ("exodus", 16, 35, "παρqένοντο", "παρεγένοντο"),
    ("exodus", 17, 3, "όποκτcιναι", "ἀποκτεῖναι"), ("exodus", 17, 10, "καἳnρ", "καὶ Ὢρ"),
    ("exodus", 18, 13, "Μcοvο fι", "Μωυσῇ"), ("exodus", 18, 14, "Τi", "Τί"),
    ("exodus", 35, 25, "κόκκιvοv", "κόκκινον"), ("exodus", 36, 2, "Κai", "Καὶ"),
    ("exodus", 40, 8, "θυσιαmήριον", "θυσιαστήριον"), ("leviticus", 6, 3, "ἀπωvλίαν", "ἀπωλίαν"),
    ("numbers", 6, 11, " ΑΒΒRΕV", ""), ("numbers", 9, 5, "τ‘ῆ", "τῇ"), ("numbers", 11, 18, "naι", "καὶ"),
    ("numbers", 11, 23, "Μjy", "Μὴ"), ("numbers", 17, 4, "μnρτυρίου", "μαρτυρίου"),
    ("numbers", 22, 28, "Τt", "Τί"), ("numbers", 23, 17, "Τi", "Τί"), ("numbers", 30, 6, "ψυχῆ‘ς", "ψυχῆς"),
    ("judges", 9, 2, "Τt", "Τί"), ("judges", 9, 12, "ξύλ‘α", "ξύλα"), ("judges", 13, 10, "ἑv", "ἐν"),
    ("judges", 18, 24, "rοv", "τὸν"), ("judges", 18, 30, "ἴερcις", "ἱερεῖς"), ("judges", 19, 8, "τ‘ῆ", "τῇ"),
    ("1-kings", 4, 21, "deοv", "θεοῦ"), ("1-kings", 6, 21, "ἀναVΙΙ", "ἀναγάγετε"),
    ("1-kings", 8, 2, "ΑΣΛΕmν Α ἐν", "Ἀβιά, δικασταὶ ἐν"),
    ("1-kings", 11, 11, "οι υπολελιμμενοι οιεσπαρησαν, καὶ Αμανιτης Α παρεμβαλεῖ Α fτrt ἐπ’ Α εἶπον εἶπαν Α Αμανιτην Α Α σαν",
     "οἱ ὑπολελιμμένοι διεσπάρησαν, καὶ οὐχ ὑπελείφθησαν"),
    ("4-kings", 4, 14, "Τt", "Τί"),
    ("4-kings", 23, 31, "τους γνωριστας οm τους Α τα θεραειν οm τα Α γη τη Α ", ""),
    ("1-paralipomenon", 6, 19, "Óμουσεί", "Ὁμουσεί"), ("1-paralipomenon", 6, 20, "Íέεθ", "Ἰέεθ"),
    ("1-paralipomenon", 7, 2, "Uολέ", "Θολέ"), ("1-paralipomenon", 9, 13, "καὶn", "καὶ"),
    ("1-paralipomenon", 12, 13, "iερεμειὰ", "Ἱερεμειὰ"), ("2-paralipomenon", 5, 2, "Τóτε", "Τότε"),
    ("2-paralipomenon", 8, 6, "Λuβάνῳ", "Λιβάνῳ"), ("2-paralipomenon", 9, 19, "οὕταmυς", "οὕτως"),
    ("2-paralipomenon", 28, 23, "Fεοὶ", "θεοὶ"),
    ("ecclesiasticus", 26, 28, "ῥομφαίkαν", "ῥομφαίαν"), ("ecclesiasticus", 28, 10, "ἐκκαυθήrτεται", "ἐκκαυθήσεται"),
    ("ecclesiasticus", 36, 30, "nὗ", "οὗ"), ("ecclesiasticus", 41, 1, "Ἰᵇάνδρὶ", "ἀνδρὶ"),
    ("isaias", 16, 10, "ἀγαλ-, λίαμα", "ἀγαλλίαμα"), ("isaias", 48, 13, "nἅμα", "ἅμα"),
    ("jeremias", 4, 30, "μiταιον", "μάταιον"), ("jeremias", 9, 14, "zxὀπίσω", "ὀπίσω"),
    ("lamentations", 2, 8, "‟Ηθ.Καὶ", "Ἠθ. Καὶ"), ("lamentations", 2, 20, "ἐπίcβλεψον", "ἐπίβλεψον"),
    ("lamentations", 3, 9, "ὁⁱούς", "ὁδούς"), ("daniel", 1, 1, "Εn", "ΕΝ"), ("daniel", 4, 25, "Τhῦτα", "Ταῦτα"),
    ("aggeus", 2, 9, "Πfαντοκράτωρ", "παντοκράτωρ"), ("malachias", 3, 11, "διαmφθείρω", "διαφθείρω"),
    ("malachias", 3, 16, "Τhῦτα", "Ταῦτα"), ("2-machabees", 8, 23, "ΒΟΗΘεαc", "ΒΟΗΘΕΙΑΣ"),
]
# Verses cut at the point where the apparatus or another page runs into them.
SWETE_CUTS = [
    ("judges", 18, 8, " Τt "),  # the apparatus of the facing page follows
    ("proverbs", 19, 6, " ܎ҏďĎ"),  # a line of Job 7:12 follows
]


def fix_swete(books: dict) -> dict:
    for slug, ch, v, old, new in SWETE_FIXES:
        text = books[slug][ch][v]
        if old not in text:
            raise ValueError(f"fix {slug} {ch}:{v}: {old!r} not in the text")
        books[slug][ch][v] = text.replace(old, new).strip()
    for slug, ch, v, at in SWETE_CUTS:
        text = books[slug][ch][v]
        if at not in text:
            raise ValueError(f"cut {slug} {ch}:{v}: {at!r} not in the text")
        books[slug][ch][v] = text[: text.index(at)].rstrip(" ,")
    return books


# ── Versification ───────────────────────────────────────────────────────────

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import vrs  # noqa: E402  (beside this script; -I keeps the cwd off the path)


def sil_draft(lxx: dict, vul: dict, slug: str, c: int, v: int) -> tuple[int, int] | None:
    """SIL's guess at the Vulgate address of Septuagint verse `slug c:v`,
    composed lxx.vrs → org → vul.vrs. Book moves made at import are undone
    first: Esdras B is one book (EZR 1–23) in lxx.vrs, Daniel is DAG, Susanna,
    Bel and the Letter of Jeremiah are books of their own."""
    code = {s: k for s, _, k in OT}[slug]
    book, ch = code, c
    if slug in ("1-esdras", "2-esdras"):
        book, ch = "EZR", c + (10 if slug == "2-esdras" else 0)
    elif slug == "daniel":
        book, ch = {13: ("SUS", 1), 14: ("BEL", 1)}.get(c, ("DAG", c))
    elif slug == "baruch" and c == 6:
        book, ch = "LJE", 1
    out = vrs.compose(lxx, vul, book, ch, v)
    if out is None:
        return None
    target, tc, tv = out
    if slug == "daniel" and target in ("SUS", "BEL"):
        return (13 if target == "SUS" else 14), tv
    if slug == "baruch" and target == "LJE":
        return 6, tv
    if target == "NEH":
        return (tc, tv) if slug == "2-esdras" else None
    return tc, tv


def load_map(path: Path) -> dict[str, dict[tuple[int, int], tuple[int, int] | None]]:
    """Read a correction table: `slug c:v[-v] = c:v[-v]` (equal ranges, or a
    range onto one verse) or `= -` for no counterpart; `#` starts a comment.
    A later line overrides an earlier one."""
    out: dict = {}
    for n, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = raw.split("#")[0].strip()
        if not line:
            continue
        m = re.fullmatch(r"([\w-]+) (\d+):(\d+)(?:-(\d+))? = (?:(-)|(\d+):(\d+)(?:-(\d+))?)", line)
        if not m:
            raise ValueError(f"{path.name}:{n}: {raw}")
        slug, c, v1, v2, null, tc, tv1, tv2 = m.groups()
        src = [(int(c), v) for v in range(int(v1), int(v2 or v1) + 1)]
        dst = [None] * len(src) if null else [(int(tc), v) for v in range(int(tv1), int(tv2 or tv1) + 1)]
        if len(dst) == 1:
            dst = dst * len(src)
        if len(dst) != len(src):
            raise ValueError(f"{path.name}:{n}: ranges of different length")
        out.setdefault(slug, {}).update(zip(src, dst))
    return out


def vulgate_verses(slug: str) -> set[tuple[int, int]]:
    book = json.loads((VULGATE / f"{slug}.json").read_text(encoding="utf-8"))
    return {(int(c), int(v)) for c, verses in book.items() for v in verses}


def versify(books: dict, corrections: dict, vrs_dir: Path) -> dict[str, dict[str, str | None]]:
    """The verse map: SIL's draft, overridden by the hand-checked corrections,
    kept only where the edition's verse and the shared address differ. Esther
    is filed in the Vulgate's order at import, so its draft is the identity."""
    lxx, vul = vrs.load(vrs_dir / "lxx.vrs"), vrs.load(vrs_dir / "vul.vrs")
    out: dict[str, dict[str, str | None]] = {}
    for slug, _, _ in OT:
        if slug not in books:
            continue
        shared = vulgate_verses(slug)
        fixed = corrections.get(slug, {})
        diff: dict[str, str | None] = {}
        for c in sorted(books[slug]):
            for v in sorted(books[slug][c]):
                if (c, v) in fixed:
                    t = fixed[(c, v)]
                elif slug == "esther":
                    t = (c, v)
                else:
                    t = sil_draft(lxx, vul, slug, c, v)
                if t is not None and t not in shared:
                    t = None
                if t != (c, v):
                    diff[f"{c}:{v}"] = f"{t[0]}:{t[1]}" if t else None
        if diff:
            out[slug] = diff
    return out


# ── Output and checks ───────────────────────────────────────────────────────


def write_edition(name: str, books: dict, verse_map: dict) -> Path:
    out = BIBLE / f"greek-{name}"
    out.mkdir(parents=True, exist_ok=True)
    index = []
    for slug, english, _ in OT:
        if slug not in books:
            continue
        book = {str(c): {str(v): books[slug][c][v] for v in sorted(books[slug][c])} for c in sorted(books[slug])}
        (out / f"{slug}.json").write_text(
            json.dumps(book, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
        )
        index.append({"slug": slug, "name": english, "testament": "ot", "chapters": max(books[slug])})
    (out / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8")
    (out / "versification.json").write_text(
        json.dumps(verse_map, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8"
    )
    return out


def check(name: str) -> list[str]:
    """Problems with a written edition: books missing or chapters off from
    index.json, text not NFC or carrying markup, and verse-map entries whose
    source or target verse does not exist."""
    out = BIBLE / f"greek-{name}"
    index = json.loads((out / "index.json").read_text(encoding="utf-8"))
    verse_map = json.loads((out / "versification.json").read_text(encoding="utf-8"))
    problems = [f"no {slug}" for slug, _, _ in OT if slug not in {b["slug"] for b in index}]
    allowed = re.compile(r"[\u0370-\u03ff\u1f00-\u1fff\s,.·;:!’—–«»“”\[\]()a-z0-9]+")
    for entry in index:
        slug = entry["slug"]
        book = json.loads((out / f"{slug}.json").read_text(encoding="utf-8"))
        chapters = sorted(map(int, book))
        if chapters[-1] != entry["chapters"]:
            problems.append(f"{slug}: {chapters[-1]} chapters, index says {entry['chapters']}")
        gaps = sorted(set(range(1, chapters[-1] + 1)) - set(chapters))
        if gaps:
            problems.append(f"{slug}: no chapter {gaps}")
        for c, verses in book.items():
            for v, text in verses.items():
                if not v.isdigit():
                    problems.append(f"{slug} {c}:{v}: verse key")
                if unicodedata.normalize("NFC", text) != text:
                    problems.append(f"{slug} {c}:{v}: not NFC")
                if not allowed.fullmatch(text) or re.search(r"[a-z0-9](?![a-z0-9]*\))", text):
                    problems.append(f"{slug} {c}:{v}: stray characters {text[:60]!r}")
        shared = vulgate_verses(slug)
        for own, target in verse_map.get(slug, {}).items():
            c, v = own.split(":")
            if v not in book.get(c, {}):
                problems.append(f"{slug} {own}: mapped but not in the text")
            if target and tuple(map(int, target.split(":"))) not in shared:
                problems.append(f"{slug} {own} → {target}: not a Clementine verse")
    return problems


def main(argv: list[str]) -> None:
    if len(argv) == 3 and argv[1] == "check":
        problems = check(argv[2])
        print("\n".join(problems) or "ok")
        sys.exit(1 if problems else 0)
    if len(argv) != 4 or argv[1] not in ("swete", "brenton"):
        sys.exit(__doc__)
    name, source, vrs_dir = argv[1], Path(argv[2]), Path(argv[3])
    if name == "swete":
        rows, dropped = load_swete(source)
        books = fix_swete(merge(rows))
    else:
        rows, dropped = load_brenton(source)
        books = merge(rows)
    verse_map = versify(books, load_map(HERE / f"lxx-{name}.map"), vrs_dir)
    out = write_edition(name, books, verse_map)
    mapped = sum(1 for m in verse_map.values() for t in m.values() if t)
    nulls = sum(1 for m in verse_map.values() for t in m.values() if t is None)
    print(f"{out.relative_to(ROOT)}: {len(books)} books, {mapped} verses renumbered, {nulls} without counterpart")
    print("left out:", ", ".join(dropped))


if __name__ == "__main__":
    main(sys.argv)
