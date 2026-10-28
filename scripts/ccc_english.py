"""The Scripture the Catechism of the Catholic Church cites, paragraph by
paragraph, from its English text on vatican.va.

The Holy See has the Catechism a section to a page: each numbered paragraph
opens with its number, its footnote calls are links in <sup>, the page's notes
are listed after a rule. This reads every reference in a note back to the
paragraph that calls it. It is the second witness `build-clerus-index.py` lays
beside the Portuguese text on Clerus; neither is clean (this one prints
"Jas 113" for 1:13 and "Gen 1-26" for 1:26), which is why there are two.
"""
from __future__ import annotations

import html
import re
import time
import urllib.request
from pathlib import Path

BASE = "https://www.vatican.va/archive/ENG0015/"
END = 999

BOOKS = {
    "gen": "genesis", "ex": "exodus", "lev": "leviticus", "num": "numbers", "deut": "deuteronomy",
    "dt": "deuteronomy", "josh": "josue", "judg": "judges", "ruth": "ruth", "ezra": "1-esdras",
    "neh": "2-esdras", "tob": "tobias", "jdt": "judith", "esth": "esther", "job": "job", "ps": "psalms",
    "pss": "psalms", "prov": "proverbs", "eccl": "ecclesiastes", "song": "canticles", "wis": "wisdom",
    "sir": "ecclesiasticus", "isa": "isaias", "is": "isaias", "jer": "jeremias", "lam": "lamentations",
    "bar": "baruch", "ezek": "ezechiel", "dan": "daniel", "hos": "osee", "joel": "joel", "am": "amos",
    "amos": "amos", "obad": "abdias", "jon": "jonas", "mic": "micheas", "nah": "nahum", "hab": "habacuc",
    "zeph": "sophonias", "hag": "aggeus", "zech": "zacharias", "mal": "malachias", "mt": "matthew",
    "mk": "mark", "lk": "luke", "jn": "john", "acts": "acts", "rom": "romans", "gal": "galatians",
    "eph": "ephesians", "phil": "philippians", "col": "colossians", "titus": "titus",
    "philem": "philemon", "heb": "hebrews", "jas": "james", "jude": "jude", "rev": "apocalypse",
}
NUMBERED = {
    "sam": ("1-kings", "2-kings"), "kings": ("3-kings", "4-kings"), "kgs": ("3-kings", "4-kings"),
    "chr": ("1-paralipomenon", "2-paralipomenon"), "macc": ("1-machabees", "2-machabees"),
    "cor": ("1-corinthians", "2-corinthians"), "thes": ("1-thessalonians", "2-thessalonians"),
    "thess": ("1-thessalonians", "2-thessalonians"), "tim": ("1-timothy", "2-timothy"),
    "pet": ("1-peter", "2-peter"), "pt": ("1-peter", "2-peter"), "jn": ("1-john", "2-john", "3-john"),
}
ONE_CHAPTER = {"jude", "2-john", "3-john", "philemon", "abdias"}

_names = sorted({n.capitalize() for n in [*BOOKS, *NUMBERED]} | {"PS", "Pss"}, key=len, reverse=True)
BOOK = re.compile(r"(?<![A-Za-z0-9])(?:(?P<p>[123]|I{1,3}|l)\s*)?(?P<n>" + "|".join(_names) + r")\.?\s*(?=\d)")
# "4:10", "4:10-12", "4:10-5:2", "4:10 ff.", or a bare number: a verse after
# a comma, a chapter otherwise.
REF = re.compile(
    r"(?P<sep>[;,]|and)?\s*(?:cf\.?\s*|see\s*)?(?P<a>\d+)(?::(?P<b>\d+))?[a-z]{0,2}(?P<ff>\s*ff?\.?)?"
    r"(?:\s*[-–—]\s*(?:(?P<c>\d+):)?(?P<d>\d+)[a-z]{0,2})?"
)
# A bare number is a reference only if no word follows it ("5 loaves").
WORD = re.compile(r"\s*(?!and\b|cf\b|Cf\b|ff?\b)[A-Za-z]")
NEXT = re.compile(r"\s*\.?\s*(?=(?:[;,]|and\b|cf\.?|\d))")

Reference = tuple[str, int, int | None, int | None]


def fetch(cache: Path, name: str) -> str:
    path = cache / "ccc-va" / name
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        request = urllib.request.Request(BASE + name, headers={"User-Agent": "Mozilla/5.0"})
        path.write_bytes(urllib.request.urlopen(request, timeout=60).read())
        time.sleep(1)
    return path.read_text(encoding="latin-1")


def slug_of(match: re.Match) -> str | None:
    name, prefix = match.group("n").lower(), match.group("p")
    if not prefix:
        return BOOKS.get(name)
    n = {"I": 1, "II": 2, "III": 3, "l": 1}.get(prefix) or int(prefix)
    books = NUMBERED.get(name, ())
    return books[n - 1] if n <= len(books) else None


def run(slug: str, text: str) -> list[Reference]:
    """The references that follow a book's name: "4:10; 4:14; 3:5", "5-7"."""
    out: list[Reference] = []
    chapter = None
    after_verse = False
    at = 0
    while (m := REF.match(text, at)) is not None:
        if not m["b"] and WORD.match(text, m.end()):
            break
        at = m.end()
        a, sep = int(m["a"]), m["sep"]
        if m["b"]:
            chapter, first = a, int(m["b"])
            if m["c"]:
                out.append((slug, chapter, first, END))
                chapter = int(m["c"])
                out.append((slug, chapter, 1, int(m["d"])))
            else:
                last = END if m["ff"] else int(m["d"] or first)
                out.append((slug, chapter, first, max(first, last)))
        elif (slug in ONE_CHAPTER and chapter is None) or (
            chapter is not None and sep == "," and after_verse
        ):
            chapter = chapter or 1
            out.append((slug, chapter, a, END if m["ff"] else int(m["d"] or a)))
        else:
            out.extend((slug, c, None, None) for c in range(a, int(m["d"] or a) + 1))
            chapter = a
        after_verse = bool(out) and out[-1][2] is not None
        step = NEXT.match(text, at)
        if not step:
            break
        at = step.end()
    return out


def references(text: str, inline: bool = False) -> list[Reference]:
    # Two ways the notes set a reference that the run below would misread:
    # "Eph 1:13; 4, 30" (chapter and verse with a comma) and "Deut 31:9. 24"
    # (a further verse after a stop).
    text = re.sub(r";\s*(\d+),\s*(\d+)", r"; \1:\2", text)
    text = re.sub(r"(\d:\d+[a-z]?(?:-\d+[a-z]?)?)\.\s+(?=\d+(?!\d*:))", r"\1, ", text)
    out: list[Reference] = []
    for match in BOOK.finditer(text):
        slug = slug_of(match)
        rest = text[match.end() :]
        # "Rom. 5, 12" is a page reference to a commentary, not a verse.
        if slug is None or ("." in match.group(0) and re.match(r"\d+\s*,\s*\d", rest)):
            continue
        # In running prose a number after a name is a verse only as "3:16".
        if inline and slug not in ONE_CHAPTER and not re.match(r"\d+:\d", rest):
            continue
        out.extend(run(slug, rest))
    return out


def words(markup: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", markup))).strip()


def english(cache: Path) -> list[tuple[int, str, int, int | None, int | None]]:
    """(paragraph, book, chapter, first verse, last verse) for every reference,
    the verses None where a chapter is cited whole."""
    pages = dict.fromkeys(re.findall(r'href="?(__P\w+\.HTM)', fetch(cache, "_INDEX.HTM"), re.I))
    found: list[tuple[int, str, int, int | None, int | None]] = []
    paragraph = None
    for name in pages:
        page = fetch(cache, name)
        # The pages come in two hands: lower-case tags with bare attributes,
        # and upper-case with quoted ones in another order. A note is at an
        # anchor named "$…", its call at one named "-…".
        rule = re.search(r'<hr[^>]*width="?30%', page, re.I)
        body, tail = (page[: rule.start()], page[rule.start() :]) if rule else (page, "")
        notes = {
            n: words(text)
            for n, text in re.findall(
                r'<a [^>]*name="?\$\w+[^>]*>(\d+)</a>\s*</b>\s*</font>\s*<font[^>]*>(.*?)</font>', tail, re.S | re.I
            )
        }
        body = re.sub(
            r'<sup>\s*<a [^>]*name="?-\w+[^>]*>(\d+)</a>\s*</sup>', lambda m: f"\x00{m.group(1)}\x00", body, flags=re.I
        )
        # What a page prints above its first paragraph (a commandment's
        # words, with their note) opens that paragraph.
        above: list[Reference] = []
        opened_here = False
        for block in re.split(r"<p[ >]", body, flags=re.I):
            text = re.sub(r"^class=MsoNormal>?\s*", "", words(block))
            # A paragraph opens with its number, the next after the last or
            # near it; any other number is something else (a list, a year).
            opened = re.match(r"(\d{1,4}) (?=\S)", text)
            if opened and (paragraph or 0) < int(opened.group(1)) <= (paragraph or 0) + 40:
                paragraph = int(opened.group(1))
                found.extend((paragraph, *reference) for reference in above)
                above, opened_here = [], True
            cited = references(re.sub(r"\x00\d+\x00", "", text), inline=True)
            for call in re.findall(r"\x00(\d+)\x00", text):
                cited.extend(references(notes.get(call, "")))
            if not opened_here:
                above.extend(cited)
            elif paragraph is not None:
                found.extend((paragraph, *reference) for reference in cited)
    return found
