#!/usr/bin/env python3
"""Modernize 1939-style Catholic Scripture citations into modern English format.

Targets:  content/libraries/base/books/catechetical-instructions/en-US/*.md

Examples:
    "Osee, ii. 20"      -> "Hosea 2:20"
    "I Cor., vii. 4"    -> "1 Corinthians 7:4"
    "Matt., v. 3-10"    -> "Matthew 5:3-10"
    "Ps. cxviii. 66"    -> "Psalm 118:66"
    "I Cor., i. 28, 42" -> "1 Corinthians 1:28, 42"
    "I Kings, xvi. 7"   -> "1 Samuel 16:7"   (1939 Catholic numbering)
    "III Kings, viii. 27" -> "1 Kings 8:27"
    "IV Kings, ii. 1"   -> "2 Kings 2:1"
    "Ecclus., xxxiv. 4" -> "Sirach 34:4"
    "Apoc., xxi. 14"    -> "Revelation 21:14"
    "Osee, ii."         -> "Hosea 2"  (chapter only, no verse)

Skipped (left untouched):
    "Ibid."             — left as the word, but trailing chap/verse modernized
    "Sent."             — Sentences (Lombard), not Scripture
    "Summa Theol."      — Summa, not Scripture
    "St. Thomas, ..."   — saint names
    "Pt. I, Ch. III"    — Roman Catechism citations
    Standalone Roman numerals after "Q." (Question), "art." (article),
        "lib.", "vol.", "Chapter", "cap.", "loc. cit." — left untouched
    Free prose mentions ("the Apocalypse", "the Apostles") — only matched
        when followed by a chapter reference in citation form

Idempotent: running twice produces the same output as running once.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import Iterable

EN_US_DIR = Path(
    "/home/user/ember/content/libraries/base/books/catechetical-instructions/en-US"
)


# ---------------------------------------------------------------------------
# Roman numeral conversion
# ---------------------------------------------------------------------------

ROMAN_VALUES = {
    "i": 1, "v": 5, "x": 10, "l": 50, "c": 100, "d": 500, "m": 1000,
}


def roman_to_int(s: str) -> int | None:
    """Convert a (lowercase or uppercase) roman numeral to int.

    Returns None if the input is not a valid roman numeral, or if any digit
    is not in {i, v, x, l, c, d, m} (case-insensitive).
    """
    if not s:
        return None
    s = s.lower()
    total = 0
    prev = 0
    for ch in reversed(s):
        if ch not in ROMAN_VALUES:
            return None
        val = ROMAN_VALUES[ch]
        if val < prev:
            total -= val
        else:
            total += val
        prev = val
    # sanity: re-encode and compare to filter out junk like "iiii"
    if int_to_roman(total) != s:
        return None
    return total


def int_to_roman(n: int) -> str:
    pairs = [
        (1000, "m"), (900, "cm"), (500, "d"), (400, "cd"),
        (100, "c"), (90, "xc"), (50, "l"), (40, "xl"),
        (10, "x"), (9, "ix"), (5, "v"), (4, "iv"), (1, "i"),
    ]
    out = []
    for v, sym in pairs:
        while n >= v:
            out.append(sym)
            n -= v
    return "".join(out)


# ---------------------------------------------------------------------------
# Book name mapping
# ---------------------------------------------------------------------------

# Books that may take an ordinal prefix (e.g. "I Cor.", "II Tim.").
# Maps base abbreviation/name -> modern full name.
ORDINAL_BOOKS: dict[str, str] = {
    # Pauline letters
    "cor": "Corinthians",
    "thess": "Thessalonians",
    "tim": "Timothy",
    # Catholic letters
    "pet": "Peter",
    "peter": "Peter",
    "john": "John",
    # Old Testament
    "mac": "Maccabees",
    "macc": "Maccabees",
    "mach": "Maccabees",
    "machabees": "Maccabees",
    "paral": "Chronicles",
    "paralip": "Chronicles",
    "paralipomenon": "Chronicles",
    # Esdras: special-cased via ESDRAS_REMAP (I -> Ezra, II -> Nehemiah).
    "esdras": "Ezra",  # default if no ordinal — most likely Ezra
    "esd": "Ezra",
}

# Books that NEVER take an ordinal prefix.
SINGLE_BOOKS: dict[str, str] = {
    # Pentateuch
    "gen": "Genesis",
    "genesis": "Genesis",
    "exod": "Exodus",
    "exodus": "Exodus",
    "lev": "Leviticus",
    "levit": "Leviticus",
    "num": "Numbers",
    "deut": "Deuteronomy",
    # Historical
    "jos": "Joshua",
    "josue": "Joshua",
    "jud": "Judges",
    "judg": "Judges",
    "ruth": "Ruth",
    "tob": "Tobit",
    "tobias": "Tobit",
    "judith": "Judith",
    "esther": "Esther",
    "esth": "Esther",
    "nehemias": "Nehemiah",
    "ezra": "Ezra",
    "nehemiah": "Nehemiah",
    # Wisdom
    "job": "Job",
    "ps": "Psalm",
    "psalm": "Psalm",
    "psalms": "Psalm",
    "prov": "Proverbs",
    "eccles": "Ecclesiastes",
    "eccl": "Ecclesiastes",
    "ecclesiastes": "Ecclesiastes",
    "cant": "Song of Songs",
    "canticles": "Song of Songs",
    "wis": "Wisdom",
    "wisd": "Wisdom",
    "wisdom": "Wisdom",
    "sap": "Wisdom",
    "ecclus": "Sirach",
    "ecclesiasticus": "Sirach",
    "sirach": "Sirach",
    # Major prophets
    "isa": "Isaiah",
    "isaias": "Isaiah",
    "isaiah": "Isaiah",
    "jer": "Jeremiah",
    "jerem": "Jeremiah",
    "jeremiah": "Jeremiah",
    "lam": "Lamentations",
    "lament": "Lamentations",
    "bar": "Baruch",
    "baruch": "Baruch",
    "ezech": "Ezekiel",
    "ezek": "Ezekiel",
    "ezekiel": "Ezekiel",
    "dan": "Daniel",
    "daniel": "Daniel",
    # Minor prophets
    "osee": "Hosea",
    "hosea": "Hosea",
    "joel": "Joel",
    "amos": "Amos",
    "abdias": "Obadiah",
    "abd": "Obadiah",
    "obad": "Obadiah",
    "jonas": "Jonah",
    "jonah": "Jonah",
    "mich": "Micah",
    "mic": "Micah",
    "micah": "Micah",
    "nah": "Nahum",
    "nahum": "Nahum",
    "hab": "Habakkuk",
    "habacuc": "Habakkuk",
    "habakkuk": "Habakkuk",
    "soph": "Zephaniah",
    "sophonias": "Zephaniah",
    "zeph": "Zephaniah",
    "agg": "Haggai",
    "aggeus": "Haggai",
    "hag": "Haggai",
    "zach": "Zechariah",
    "zacharias": "Zechariah",
    "zech": "Zechariah",
    "mal": "Malachi",
    "malachias": "Malachi",
    "malachi": "Malachi",
    # NT (single)
    "matt": "Matthew",
    "matthew": "Matthew",
    "mark": "Mark",
    "marc": "Mark",
    "luke": "Luke",
    "luc": "Luke",
    "acts": "Acts",
    "rom": "Romans",
    "gal": "Galatians",
    "eph": "Ephesians",
    "phil": "Philippians",
    "col": "Colossians",
    "colos": "Colossians",
    "tit": "Titus",
    "titus": "Titus",
    "philem": "Philemon",
    "philemon": "Philemon",
    "heb": "Hebrews",
    "hebrews": "Hebrews",
    "james": "James",
    "jas": "James",
    "jude": "Jude",
    "apoc": "Revelation",
    "apocalypse": "Revelation",
}

# "Kings" needs special handling: in 1939 Catholic Bibles, what we now call
# 1/2 Samuel was called I/II Kings, and what we now call 1/2 Kings was called
# III/IV Kings. We map by ordinal:
#   I Kings   -> 1 Samuel
#   II Kings  -> 2 Samuel
#   III Kings -> 1 Kings
#   IV Kings  -> 2 Kings
KINGS_REMAP = {
    1: ("Samuel", 1),
    2: ("Samuel", 2),
    3: ("Kings", 1),
    4: ("Kings", 2),
}

# In 1939 Catholic Bibles, Esdras/Esd. covered both Ezra and Nehemiah:
#   I Esdras  -> Ezra
#   II Esdras -> Nehemiah
ESDRAS_REMAP = {
    1: ("Ezra", None),
    2: ("Nehemiah", None),
}

# Words that look like book names but ARE NOT — leave the surrounding region
# alone. Lowercased.
NON_BIBLICAL_BOOKS = {
    "sent",         # Lombard's Sentences
    "summa",        # Summa Theologiae
    "ibid",         # Ibid.
    "ib",
    "epist",        # Epist. (a generic letter reference)
    "loc",          # loc. cit.
    "cit",
    "op",           # op. cit.
    "vol",
    "chapter",
    "ch",
    "cap",
    "art",
    "lib",
    "no",           # n.
    "n",
    "q",            # Question (Summa)
    "viz",
    "cf",
    "cfr",
    "pt",           # Part
    "fr",
    "in",
    "de",
    "super",        # Aquinas's "Super..." commentaries
    "questions",
    "enchir",       # Enchiridion (Augustine)
    "ad",
    "polit",
    "politics",
    "anim",         # De Anim.
    "animal",
}

# Build alternation of all known biblical book tokens for the regex.
# Sort longest first so "ecclesiasticus" wins over "eccles", etc.
ALL_BOOKS = sorted(
    set(ORDINAL_BOOKS.keys()) | set(SINGLE_BOOKS.keys()) | {"kings"},
    key=lambda s: -len(s),
)
BOOK_ALT = "|".join(re.escape(b) for b in ALL_BOOKS)


# Roman numeral pattern (chapter or ordinal). Matches at least one valid
# roman digit; we still validate via roman_to_int afterwards.
ROMAN_RE = r"(?:[mdclxvi]+|[MDCLXVI]+)"

# Ordinal prefix: "I", "II", "III", or "IV" followed by space.
ORDINAL_RE = r"(I|II|III|IV)"

# Verse list: "20" or "20-21" or "1, 5, 7" or "5-9, 12" optionally "ff."
# Be lenient. We capture greedily but stop at sentence-ending punctuation.
# A verse fragment is: \d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*  (optionally " ff.")
VERSE_RE = r"\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*(?:\s*ff\.?)?"


# Main citation regex: optional ordinal + book + (sep) + roman chapter
# + optional verse part. Sep can be ", " or "., " or " " or just "."
# Examples this should match:
#   I Cor., vii. 4
#   I Cor., vii.4
#   Matt., v. 3-10
#   Ps. cxviii. 66
#   Heb. xi. 6
#   Heb., xi. 6
#   Osee, ii.
#   Osee, ii. 5
#   Apoc., v.
#   Wis. xiv. 3
#   I Peter v. 8
#   Mark, xvi. 16
#   Acts. iv. 12
CITATION_RE = re.compile(
    r"""
    (?<![A-Za-z])                        # not preceded by another letter
    (?:(?P<ord>I{1,3}|IV)\s+)?           # optional ordinal
    (?P<book>""" + BOOK_ALT + r""")      # book name/abbrev
    (?![A-Za-z])                         # book must end on a word boundary
    \.?                                  # optional period after book
    \s*[,.]?\s*                          # optional comma OR period
    (?P<chap>""" + ROMAN_RE + r""")      # chapter (roman numeral)
    (?![A-Za-z])                         # chapter must end on a word boundary
    (?P<after_chap>\.?)                  # optional trailing dot after chapter
    (?:                                  # optional verse part:
        \s*[,.]?\s*                      #   sep
        (?P<verse>""" + VERSE_RE + r""") #   verse list
    )?
    """,
    re.VERBOSE | re.IGNORECASE,
)


def transform_match(m: re.Match[str]) -> str:
    """Rewrite a single citation match. If we can't safely rewrite, return
    the matched text unchanged."""
    raw = m.group(0)
    ord_str = m.group("ord")
    book_raw = m.group("book")
    chap_str = m.group("chap")
    verse = m.group("verse")

    book_key = book_raw.lower()

    # Validate roman numeral chapter.
    chap_num = roman_to_int(chap_str)
    if chap_num is None:
        return raw

    # Validate ordinal (if present) is a roman numeral 1-4.
    ord_num: int | None = None
    if ord_str:
        ord_num = roman_to_int(ord_str)
        if ord_num is None or ord_num < 1 or ord_num > 4:
            return raw

    # Skip non-biblical "books".
    if book_key in NON_BIBLICAL_BOOKS:
        return raw

    # Determine modern book name + ordinal.
    if book_key == "kings":
        if ord_num is None:
            # Bare "Kings" without ordinal — ambiguous; skip safely.
            return raw
        modern_book, modern_ord_num = KINGS_REMAP[ord_num]
        ord_prefix = f"{modern_ord_num} "
    elif book_key in ("esdras", "esd"):
        if ord_num is None:
            # Bare "Esdras" → Ezra (the most common usage).
            modern_book = "Ezra"
            ord_prefix = ""
        elif ord_num in ESDRAS_REMAP:
            modern_book, _ = ESDRAS_REMAP[ord_num]
            ord_prefix = ""
        else:
            return raw
    elif book_key in ORDINAL_BOOKS:
        modern_book = ORDINAL_BOOKS[book_key]
        if ord_num is None:
            # Books like "Cor.", "Tim.", "Pet.", "Mach." normally take an
            # ordinal in this text. If absent, we still rewrite (no prefix).
            ord_prefix = ""
        else:
            ord_prefix = f"{ord_num} "
    elif book_key in SINGLE_BOOKS:
        modern_book = SINGLE_BOOKS[book_key]
        if ord_num is not None:
            # Don't apply ordinal to single books; bail out safely.
            return raw
        ord_prefix = ""
    else:
        return raw

    # Build the modernized citation.
    if verse:
        # Normalize verse: collapse internal whitespace.
        verse_clean = re.sub(r"\s+", " ", verse.strip())
        out = f"{ord_prefix}{modern_book} {chap_num}:{verse_clean}"
    else:
        # Chapter-only citation. Preserve any trailing period that the
        # original had after the chapter (e.g. "Osee, ii." → "Hosea 2.").
        trailing_dot = m.group("after_chap") or ""
        out = f"{ord_prefix}{modern_book} {chap_num}{trailing_dot}"

    return out


# ---------------------------------------------------------------------------
# Secondary passes for "tail" references that follow a primary citation.
# ---------------------------------------------------------------------------

# After 'Ibid.' (with optional comma/quotes), a bare roman chapter + verse:
#   "Ibid.," xviii. 14   ->   "Ibid.," 18:14
IBID_TAIL_RE = re.compile(
    r"""
    (?P<head>(?:["']?[Ii]bid\.[,]?["']?)\s*[,]?\s*)
    (?P<chap>""" + ROMAN_RE + r""")
    (?![A-Za-z])
    \s*[,.]?\s*
    (?P<verse>""" + VERSE_RE + r""")?
    """,
    re.VERBOSE,
)


def transform_ibid_tail(m: re.Match[str]) -> str:
    chap_num = roman_to_int(m.group("chap"))
    if chap_num is None:
        return m.group(0)
    verse = m.group("verse")
    head = m.group("head")
    if verse:
        verse_clean = re.sub(r"\s+", " ", verse.strip())
        return f"{head}{chap_num}:{verse_clean}"
    return f"{head}{chap_num}"


# A "continuation" reference inside a citation already rewritten: a comma or
# semicolon followed by a bare roman chapter + verse, where the preceding
# token is a digit (i.e. a verse number from the just-modernized cite).
#   "Matthew 5:17-18, xix. 17-20"  ->  "Matthew 5:17-18, 19:17-20"
CONTINUATION_RE = re.compile(
    r"""
    (?P<head>\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*[,;]\s*)
    (?P<chap>""" + ROMAN_RE + r""")
    (?![A-Za-z])
    \s*[,.]?\s*
    (?P<verse>""" + VERSE_RE + r""")
    """,
    re.VERBOSE,
)


def transform_continuation(m: re.Match[str]) -> str:
    chap_num = roman_to_int(m.group("chap"))
    if chap_num is None:
        return m.group(0)
    verse_clean = re.sub(r"\s+", " ", m.group("verse").strip())
    return f"{m.group('head')}{chap_num}:{verse_clean}"


# Bare parenthesized chapter+verse, e.g. "as we read in Leviticus (xx. 10)".
# Only matches when the roman is followed by a real verse; this keeps list
# markers like "(c)" from being mangled.
PAREN_BARE_RE = re.compile(
    r"""
    (?P<open>\()
    (?P<chap>""" + ROMAN_RE + r""")
    \.\s*
    (?P<verse>""" + VERSE_RE + r""")
    (?P<close>\))
    """,
    re.VERBOSE,
)


def transform_paren_bare(m: re.Match[str]) -> str:
    chap_num = roman_to_int(m.group("chap"))
    if chap_num is None:
        return m.group(0)
    verse_clean = re.sub(r"\s+", " ", m.group("verse").strip())
    return f"({chap_num}:{verse_clean})"


def modernize(text: str) -> tuple[str, int]:
    """Return (new_text, count) where count is the number of citations rewritten."""
    count = 0

    def _sub(m: re.Match[str]) -> str:
        nonlocal count
        new = transform_match(m)
        if new != m.group(0):
            count += 1
        return new

    new_text = CITATION_RE.sub(_sub, text)

    def _sub_ibid(m: re.Match[str]) -> str:
        nonlocal count
        new = transform_ibid_tail(m)
        if new != m.group(0):
            count += 1
        return new

    new_text = IBID_TAIL_RE.sub(_sub_ibid, new_text)

    def _sub_cont(m: re.Match[str]) -> str:
        nonlocal count
        new = transform_continuation(m)
        if new != m.group(0):
            count += 1
        return new

    new_text = CONTINUATION_RE.sub(_sub_cont, new_text)

    def _sub_paren(m: re.Match[str]) -> str:
        nonlocal count
        new = transform_paren_bare(m)
        if new != m.group(0):
            count += 1
        return new

    new_text = PAREN_BARE_RE.sub(_sub_paren, new_text)

    return new_text, count


# ---------------------------------------------------------------------------
# Self-test: print a few before/after examples for sanity.
# ---------------------------------------------------------------------------

EXAMPLE_TRANSFORMS = [
    "Osee, ii. 20",
    "I Cor., vii. 4",
    "Matt., v. 3-10",
    "Ps. cxviii. 66",
    "Heb., xi. 6",
    "Osee, ii.",
    "I Cor., i. 28, 42",
    "I Kings, xvi. 7",
    "III Kings, viii. 27",
    "IV Kings, v. 13",
    "II Tim., i. 12",
    "I John, iv. 20",
    "Ecclus., xxxiv. 4",
    "Apoc., xxi. 14",
    "Cant., iv. 7",
    "I Mach., ii. 41",
    "I Paral., xxix. 14",
    "Wisd., ii. 1",
    "Soph., iii. 3",
    "Mic., vii. 9",
    "Acts, viii. 39",
    "Mark, xvi. 16",
    "Luke, xviii. 9-15",
    "John, vi. 57",
    'Apoc., x. 6',
    'Philem., 8',  # no chapter (Philemon has only one) — won't match (no roman); leave as-is
]

EXAMPLE_SKIPS = [
    '"Ibid."',
    '"Ibid.," 13.',
    '"Summa Theol.," II-II, Q. lxix. art. 2',
    '"Sent.," c. 44',
    '"Roman Catechism," "loc. cit.," 2',
    "St. Thomas",
    "St. Augustine",
    "Pt. I, Ch. III",
    'vol. V',
]


def selftest() -> None:
    print("=" * 70)
    print("SELF-TEST — example transforms:")
    print("=" * 70)
    for src in EXAMPLE_TRANSFORMS:
        out, n = modernize(src)
        marker = "  ->  " if n else "  ==  "
        print(f"  {src!r}{marker}{out!r}  (n={n})")
    print()
    print("SELF-TEST — skips (should be unchanged):")
    for src in EXAMPLE_SKIPS:
        out, n = modernize(src)
        marker = "  ==  " if n == 0 else "  ?? "
        flag = "" if n == 0 else "  <-- UNEXPECTED CHANGE"
        print(f"  {src!r}{marker}{out!r}{flag}")
    print()


# ---------------------------------------------------------------------------
# File processing
# ---------------------------------------------------------------------------


def process_file(path: Path) -> tuple[int, list[tuple[str, str]]]:
    """Rewrite citations in `path`. Returns (count, samples)."""
    original = path.read_text(encoding="utf-8")
    new_text, count = modernize(original)
    samples: list[tuple[str, str]] = []
    if count and original != new_text:
        # Collect a few line-level diffs for the report.
        old_lines = original.splitlines()
        new_lines = new_text.splitlines()
        for o, n in zip(old_lines, new_lines):
            if o != n and len(samples) < 3:
                samples.append((o.strip(), n.strip()))
        path.write_text(new_text, encoding="utf-8")
    return count, samples


def find_targets() -> list[Path]:
    return sorted(EN_US_DIR.glob("*.md"))


def main(argv: Iterable[str]) -> int:
    if not EN_US_DIR.is_dir():
        print(f"ERROR: directory not found: {EN_US_DIR}", file=sys.stderr)
        return 1

    selftest()

    files = find_targets()
    print("=" * 70)
    print(f"Processing {len(files)} files in {EN_US_DIR}")
    print("=" * 70)

    total = 0
    summary: list[tuple[Path, int, list[tuple[str, str]]]] = []
    for f in files:
        count, samples = process_file(f)
        summary.append((f, count, samples))
        total += count

    # Per-file report
    print()
    print(f"{'FILE':<55} {'COUNT':>6}")
    print("-" * 70)
    for f, count, _ in summary:
        print(f"{f.name:<55} {count:>6}")
    print("-" * 70)
    print(f"{'TOTAL':<55} {total:>6}")
    print()

    # Sample diffs
    print("=" * 70)
    print("SAMPLE BEFORE/AFTER (up to 3 lines per file with changes):")
    print("=" * 70)
    for f, count, samples in summary:
        if not samples:
            continue
        print(f"\n  [{f.name}]  ({count} citation(s) rewritten)")
        for old, new in samples:
            old_short = (old[:160] + "…") if len(old) > 160 else old
            new_short = (new[:160] + "…") if len(new) > 160 else new
            print(f"    -  {old_short}")
            print(f"    +  {new_short}")

    print()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
