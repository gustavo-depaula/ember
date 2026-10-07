#!/usr/bin/env python3
"""Rebuild the Clerus citation index: for each passage of Scripture, where the
Church's library cites it.

Biblia Clerus (clerus.org/bibliaclerusonline, the Dicastery for the Clergy)
divides the Bible into some 3,000 passages. Beside each one it links a page
listing every place in its library that cites the passage: the Catechism, the
Fathers, St Thomas, councils, encyclicals, papal homilies. This crawls those
pages and keeps the links as data; none of the cited prose is taken.

Writes:
  research/clerus-index/index.jsonl.gz  one passage a line, every citation
  research/clerus-index/works.json      the works cited, with their counts
  content/bible/clerus/<slug>.json      what the app reads: per chapter, each
                                        passage with its Catechism paragraphs
                                        the homilies on it that the corpus
                                        holds, and the councils and popes who
                                        cite it, in the Douay-Rheims' numbering
  content/bible/clerus/talks/<slug>.json  the popes' homilies and addresses
                                        that cite each verse
  content/bible/summa/<slug>.json       the articles of the Summa that do
  content/bible/catechism.json          what each paragraph of the Catechism
                                        cites

Only the first two come from Clerus's citation pages. Those credit a note to
the section it is printed after and are wrong too often to show, so the rest
is read from the works' own pages on Clerus (and, for the Catechism, from the
English edition beside it): see research/clerus-index/README.md.

The research index keeps the site's own numbering (the Hebrew: Psalm 23 is "The
Lord is my shepherd").

Usage:
    python3 scripts/build-clerus-index.py <cache dir>

The cache dir keeps every page fetched, so a second run only parses. A full
crawl is about 8,500 requests, at one a second.
"""
from __future__ import annotations

import gzip
import html
import json
import re
import sys
import time
import unicodedata
import urllib.request
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import ccc_english  # noqa: E402

BASE = "https://www.clerus.org/bibliaclerusonline/pt/"
RESEARCH = ROOT / "research" / "clerus-index"
OUT = ROOT / "content" / "bible" / "clerus"

# The Portuguese edition's book names, to the Douay slugs the corpus uses.
SLUGS = {
    "Mateus": "matthew", "Marco": "mark", "Lucas": "luke", "João": "john", "Atos": "acts",
    "Romanos": "romans", "1Coríntios": "1-corinthians", "2Coríntios": "2-corinthians",
    "Gálatas": "galatians", "Efésios": "ephesians", "Filipenses": "philippians",
    "Colossenses": "colossians", "1Tessalonicenses": "1-thessalonians",
    "2Tessalonicenses": "2-thessalonians", "1Timóteo": "1-timothy", "2Timóteo": "2-timothy",
    "Tito": "titus", "Filêmon": "philemon", "Hebreus": "hebrews", "Tiago": "james",
    "1Pedro": "1-peter", "2Pedro": "2-peter", "1João": "1-john", "2João": "2-john",
    "3João": "3-john", "Judas": "jude", "Apocalipse": "apocalypse", "Gênesis": "genesis",
    "Êxodo": "exodus", "Levítico": "leviticus", "Números": "numbers",
    "Deuteronômio": "deuteronomy", "Josué": "josue", "Juízes": "judges", "Rute": "ruth",
    "1Samuel": "1-kings", "2Samuel": "2-kings", "1Reis": "3-kings", "2Reis": "4-kings",
    "1Crônicas": "1-paralipomenon", "2Crônicas": "2-paralipomenon", "Esdras": "1-esdras",
    "Neemias": "2-esdras", "Tobias": "tobias", "Judite": "judith", "Ester": "esther",
    "1Macabeus": "1-machabees", "2Macabeus": "2-machabees", "Jó": "job", "Salmos": "psalms",
    "Provérbios": "proverbs", "Eclesiastes": "ecclesiastes", "Cântico": "canticles",
    "Sabedoria": "wisdom", "Eclesiástico": "ecclesiasticus", "Isaías": "isaias",
    "Jeremias": "jeremias", "Lamentações": "lamentations", "Baruc": "baruch",
    "Ezequiel": "ezechiel", "Daniel": "daniel", "Oséias": "osee", "Joel": "joel",
    "Amós": "amos", "Abdias": "abdias", "Jonas": "jonas", "Miquéias": "micheas",
    "Naum": "nahum", "Habacuc": "habacuc", "Sofonias": "sophonias", "Ageu": "aggeus",
    "Zacarias": "zacharias", "Malaquias": "malachias",
}

CATECHISM = "Catecismo Igreja Catól."

FATHERS = ROOT / "content" / "books" / "church-fathers"

# The homilies and expositions Clerus lists as treating a passage, for the
# works the corpus holds in English: Clerus's name for the work, to the book
# of the Bible it is on, the corpus book, and how Clerus numbers its places.
#   "plain"  the homily's number, or homily and section run together ("6201")
#            once past the last homily
#   "hhss"   homily × 100 + section ("1303" is homily 13)
#   "psalm"  the psalm of the passage itself, in the Hebrew numbering both use
#   "book"   On the Sermon on the Mount: Book One is on Matthew 5, Book Two on
#            6 and 7. Clerus's numbers do not divide that way, so the chapter
#            of the passage decides.
# Clerus numbers the homilies on the two letters to the Thessalonians as one
# series; `after` is how many of them come before this book's first.
HOMILIES = [
    ("Chrysostome sur Mt", "matthew", "john-chrysostom/homilies-on-the-gospel-of-st-matthew", "plain", 0),
    ("Chrysostome sur Jean", "john", "john-chrysostom/homilies-on-the-gospel-of-john", "plain", 0),
    ("Chrysostome sur Actes", "acts", "john-chrysostom/homilies-on-acts", "hhss", 0),
    ("Chrysostome sur Rm", "romans", "john-chrysostom/homilies-on-romans", "hhss", 0),
    ("Chrysostome sur 1Co", "1-corinthians", "john-chrysostom/homilies-on-first-corinthians", "hhss", 0),
    ("Chrysostome sur 2Co", "2-corinthians", "john-chrysostom/homilies-on-second-corinthians", "hhss", 0),
    ("Chrysostome sur Eph", "ephesians", "john-chrysostom/homilies-on-ephesians", "hhss", 0),
    ("Chrysostome Philippiens", "philippians", "john-chrysostom/homilies-on-philippians", "hhss", 0),
    ("Chrysostome, Colossiens", "colossians", "john-chrysostom/homilies-on-colossians", "hhss", 0),
    ("Chrysostome sur Thess.", "1-thessalonians", "john-chrysostom/homilies-on-first-thessalonians", "hhss", 0),
    ("Chrysostome sur Thess.", "2-thessalonians", "john-chrysostom/homilies-on-second-thessalonians", "hhss", 11),
    ("Chrysostome sur 1Tm", "1-timothy", "john-chrysostom/homilies-on-first-timothy", "hhss", 0),
    ("Chrysostome sur 2Tm", "2-timothy", "john-chrysostom/homilies-on-second-timothy", "hhss", 0),
    ("Chrysostome sur Tite", "titus", "john-chrysostom/homilies-on-titus", "hhss", 0),
    ("Chrysostome Philémon", "philemon", "john-chrysostom/homilies-on-philemon", "hhss", 0),
    ("Chrysostome sur Héb. I", "hebrews", "john-chrysostom/homilies-on-the-epistle-to-the-hebrews", "hhss", 0),
    ("Augustin sur Jean", "john", "augustine/tractates-on-the-gospel-of-john", "plain", 0),
    ("Augustin, les Psaumes", "psalms", "augustine/enarrations-or-expositions-on-the-psalms", "psalm", 0),
    ("Augustin, Epitre Jean", "1-john", "augustine/homilies-on-the-first-epistle-of-john", "hhss", 0),
    ("Augustin sur la montagne", "matthew", "augustine/our-lord-s-sermon-on-the-mount", "book", 0),
]


def numbered_chapters(directory: str) -> tuple[str, dict[int, str]]:
    """A corpus book's id, and its chapter ids by the number in their titles
    ("Homily 62", "Tractate 3", "Psalm 23", "Book Two"). A book can open with
    an argument, so the homily's number is not its place in the book."""
    book = json.loads((FATHERS / directory / "book.json").read_text(encoding="utf-8"))
    words = {"one": 1, "two": 2}
    chapters = {}
    for node in book["toc"]:
        match = re.search(r"(?:Homily|Tractate|Psalm|Book) (\d+|One|Two)\b", node["title"]["en-US"])
        if match:
            n = match.group(1)
            chapters[int(n) if n.isdigit() else words[n.lower()]] = node["id"]
    return book["id"], chapters


def homilies_on(slug: str, chapter: int, cited: list[dict], books: dict) -> list[dict]:
    """The homilies that treat a passage, as places in the corpus's books."""
    out, seen = [], set()
    for entry in cited:
        if entry["group"]:
            continue
        for work, on, directory, scheme, after in HOMILIES:
            if entry["work"] != work or on != slug:
                continue
            book, chapters = books[directory]
            for _file, _anchor, label in entry["places"]:
                if not label.isdigit():
                    continue
                n = int(label)
                if scheme == "psalm":
                    n = chapter
                elif scheme == "hhss":
                    n = n // 100 - after
                elif scheme == "book":
                    n = 1 if chapter == 5 else 2
                elif n > max(chapters):
                    n //= 100
                if n in chapters and (book, n) not in seen:
                    seen.add((book, n))
                    out.append(
                        {
                            "author": directory.split("/")[0],
                            # What the work calls its parts: the app names the place by it.
                            "kind": {"psalm": "exposition", "book": "book"}.get(
                                scheme, "tractate" if "tractates" in directory else "homily"
                            ),
                            "n": n,
                            "book": book,
                            "chapter": chapters[n],
                        }
                    )
    return out


def fetch(cache: Path, name: str) -> str:
    """A page of the site, from the cache or fetched into it. windows-1252."""
    path = cache / f"{name}.htm"
    if not path.exists() or path.stat().st_size < 400:
        request = urllib.request.Request(BASE + f"{name}.htm", headers={"User-Agent": "Mozilla/5.0"})
        for attempt in range(4):
            try:
                body = urllib.request.urlopen(request, timeout=60).read()
                if len(body) >= 400:
                    break
            except OSError:
                pass
            time.sleep(4 * (attempt + 1))
        else:
            sys.exit(f"could not fetch {name}.htm")
        path.write_bytes(body)
        time.sleep(0.3)
    return path.read_bytes().decode("cp1252", "replace")


def passages_of(cache: Path) -> list[tuple[str, str, str]]:
    """(book slug, the site's reference, citation page) for every passage."""
    found = []
    index = fetch(cache, "66c")
    for book_page, name in re.findall(r"<a href=(\w+)\.htm target=m>(.*?)</a>", index):
        slug = SLUGS[html.unescape(name)]
        pages = dict.fromkeys(re.findall(r'href="?([a-z0-9]+)\.htm#', fetch(cache, book_page), re.I))
        for page in pages:
            for cite, title in re.findall(
                r'href=(9\w+)\.htm target=l><img src=c\.gif align=right title="([^"]+)"', fetch(cache, page)
            ):
                found.append((slug, title, cite))
    return found


def span(reference: str) -> tuple[int, int, int, int]:
    """"Jn 2,23-3,15" as (chapter, verse, chapter, verse); one chapter when no second is given."""
    match = re.fullmatch(r"\S+ (\d+),(\d+)(?:-(?:(\d+),)?(\d+))?", reference)
    if not match:
        raise ValueError(f"unreadable reference: {reference}")
    chapter, verse, end_chapter, end_verse = match.groups()
    return int(chapter), int(verse), int(end_chapter or chapter), int(end_verse or verse)


END = 999  # "to the end of the chapter", for a passage that runs on into the next


def douay(slug: str, chapter: int, start: int, end: int) -> list[tuple[int, int, int, str | None]]:
    """A run of verses in the site's numbering (the Hebrew) as the Douay-Rheims
    numbers it: (chapter, from, to, label). The label is set where the site's
    own reference would name another chapter than the one being read.

    The Psalms are cited whole, so only the psalm's number moves. Verses inside
    the two psalms the Vulgate joins and the two it divides are placed by the
    usual tables; a title verse can still be one off.
    """
    if slug == "psalms":
        if chapter <= 8 or chapter >= 148:
            return [(chapter, start, end, None)]
        if chapter == 9:
            return [(9, 1, 21, "9")]
        if chapter == 10:
            return [(9, 22, END, "9")]
        if chapter == 114:
            return [(113, 1, 8, "113")]
        if chapter == 115:
            return [(113, 9, END, "113")]
        if chapter == 116:
            return [(114, 1, END, "114"), (115, 1, END, "115")]
        if chapter == 147:
            return [(146, 1, END, "146"), (147, 1, END, "147")]
        return [(chapter - 1, start, end, str(chapter - 1))]
    if slug == "joel" and chapter == 3:
        return [(2, start + 27, end + 27 if end != END else END, f"2,{start + 27}-{end + 27}")]
    if slug == "joel" and chapter == 4:
        return [(3, start, end, f"3,{start}-{end}")]
    if slug == "malachias" and chapter == 3 and start >= 19:
        return [(4, start - 18, end - 18 if end != END else END, f"4,{start - 18}-{end - 18}")]
    return [(chapter, start, end, None)]


def catechism_portuguese(cache: Path, slugs: dict[str, str]) -> list[tuple[int, str, int, int | None, int | None]]:
    """Every Scripture reference in the Catechism, from its own text on Clerus:
    (paragraph, book, chapter, first verse, last verse), the verses None where
    a whole chapter is cited.

    Clerus's citation pages cannot be used for the Catechism. It prints a
    section's footnotes after the section's last paragraph and indexes them
    there, so about half its citations name the wrong paragraph. Here each
    footnote goes back to the paragraph that calls it, "(436)" to "436. …".
    """
    library = fetch(cache, "66m")
    contents = re.search(r"<a href=(\w+)\.htm target=m>Catecismo Igreja Cat", library).group(1)
    pages = dict.fromkeys(re.findall(r'href="?([a-z0-9]+)\.htm#', fetch(cache, contents), re.I))
    found: list[tuple[int, str, int, int | None, int | None]] = []

    def cite(paragraph: int, markup: str) -> None:
        found.extend((paragraph, *reference) for reference in references(markup, slugs))

    # The footnote numbers start again in each part, so a call waits only for
    # the next note of its number; a section's notes can be on the page after
    # its first paragraphs, so the calls are kept from page to page.
    calls: dict[str, int] = {}

    def read(paragraph: int, block: str) -> None:
        notes = re.split(r"<br>\s*(\d+)\. ", block)
        body = notes[0]
        # A numbered line in the paragraph's own text is not a note.
        start = next((i for i in range(1, len(notes), 2) if notes[i] in calls or f"({notes[i]})" in body), None)
        if start is not None:
            body = "".join(notes[:start])
        for call in re.findall(r"\((\d+)\)", body):
            calls[call] = paragraph
        cite(paragraph, body)
        if start is not None:
            for note, markup in zip(notes[start::2], notes[start + 1 :: 2]):
                if note in calls:
                    cite(calls.pop(note), markup)

    for page in pages:
        text = fetch(cache, page).split("<hr><center>")[0]
        blocks = re.split(r"<a name=\w+><b>(\d+)</b>", text)
        for number, block in zip(blocks[1::2], blocks[2::2]):
            # What stands under the headings that close a block (a
            # commandment's words, with their own note) opens the paragraph
            # after, not this one.
            own, heading, epigraph = block.partition("<a Name=")
            read(int(number), own)
            if heading:
                read(int(number) + 1, re.sub(r"<h\d>.*?</h\d>", " ", epigraph, flags=re.S))
    return found


def catechism(cache: Path, slugs: dict[str, str]) -> list[tuple[int, str, int, int | None, int | None]]:
    """The Catechism's Scripture references, from two editions laid side by
    side: the Portuguese on Clerus and the English on vatican.va
    (scripts/ccc_english.py).

    Neither is clean alone. Clerus links the references itself and slips
    (Jonas read as John, "6,11" cut to "6,1", a reference left unlinked, a
    call misnumbered in the text so its note falls to a later paragraph); the
    English prints its own ("Gen 1-26" for 1:26). Measured against each other,
    Clerus alone is right about nineteen times in twenty and has nine in ten.
    Together: what both have is kept. A verse only the English has is kept if
    such a verse exists; a chapter cited whole needs both, since that is how
    a misprint reads. What only the Portuguese has is dropped: checked by
    hand, most of it was Clerus's slips.
    """
    portuguese = dict.fromkeys(catechism_portuguese(cache, slugs))
    english = dict.fromkeys(ccc_english.english(cache))
    by_paragraph: dict[int, list[tuple]] = {}
    for reference in english:
        by_paragraph.setdefault(reference[0], []).append(reference)
    verses = {path.stem: json.loads(path.read_text(encoding="utf-8")) for path in (ROOT / "content" / "bible" / "drb").glob("*.json")}

    def exists(reference: tuple) -> bool:
        """Such a chapter and verse are in the book, by the Douay's count and
        a little over (the editions number some chapters a verse or two apart)."""
        _paragraph, book, chapter, first, _last = reference
        if book == "psalms":
            return chapter <= 150
        in_chapter = verses.get(book, {}).get(str(chapter))
        return in_chapter is not None and (first is None or first <= len(in_chapter) + 3)

    def same(a: tuple, b: tuple) -> bool:
        """The same citation, in two editions' numbering."""
        if a[1:3] != b[1:3]:
            return False
        if a[3] is None or b[3] is None:
            return True
        slack = 2 if a[1] == "psalms" else 1
        return a[3] - slack <= b[4] and b[3] - slack <= a[4]

    matched: set[tuple] = set()
    kept: list[tuple] = []
    tally: Counter[str] = Counter()
    for ours in portuguese:
        twins = [e for e in by_paragraph.get(ours[0], []) if same(ours, e)]
        matched.update(twins)
        if twins:
            tally["in both"] += 1
            # Clerus's link sometimes keeps only the chapter ("Ap 9" for 9,4).
            kept.append(next((e for e in twins if e[3] is not None), ours) if ours[3] is None else ours)
    tally["only in the Portuguese, dropped"] = len(portuguese) - tally["in both"]
    for theirs in english:
        if theirs in matched:
            continue
        keep = theirs[3] is not None and exists(theirs)
        tally["only in the English, kept" if keep else "only in the English, dropped"] += 1
        if keep:
            kept.append(theirs)
    print("catechism:", ", ".join(f"{count} {what}" for what, count in tally.most_common()))
    return kept


REFERENCE = re.compile(r"<a href=\w+\.htm#\w+>(\w+) (\d+)(?:,(\d+)(?:-(?:(\d+),)?(\d+))?|-(\d+))?[^<]*</a>")


def references(
    markup: str, slugs: dict[str, str], psalter: str | None = None
) -> list[tuple[str, int, int | None, int | None]]:
    """The Scripture a stretch of a page links to: (book, chapter, first verse,
    last verse), the verses None where a chapter is cited whole. A reference
    that runs into another chapter ("Sb 11,23-12,2") is given as two.

    `psalter` is how the text numbers the psalms where a reference does not
    say ("modern", "vulgate", or "" when the text does not say either); left
    as None a psalm is taken as Clerus links it, which is right for the
    Catechism."""
    out: list[tuple[str, int, int | None, int | None]] = list(psalms(markup, psalter)) if psalter is not None else []
    for book, chapter, first, end_chapter, last, to_chapter in REFERENCE.findall(markup):
        if book not in slugs or (psalter is not None and book == "Ps" and not end_chapter and not to_chapter):
            continue
        if not first:
            # "Mt 5-7": each chapter, whole.
            out.extend((slugs[book], c, None, None) for c in range(int(chapter), int(to_chapter or chapter) + 1))
        elif end_chapter and int(end_chapter) > int(chapter):
            out.append((slugs[book], int(chapter), int(first), END))
            out.append((slugs[book], int(end_chapter), 1, int(last)))
        else:
            out.append((slugs[book], int(chapter), int(first), int(last or first)))
    return out
# A footnote where it is printed, in the four ways the documents set one:
# "<b>95</b>. …", "(95) …", "[95] …" and "95. …".
NOTE = re.compile(r"<br>\s*(?:<b>(\d+)</b>\.?|\((\d+)\)|\[(\d+)\]|(\d+)\.) ")
CALLS = {
    "paren": re.compile(r"\((\d{1,3})\)"),
    "bracket": re.compile(r"\[(\d{1,3})\]"),
    # A bare number after a word or a closing quotation mark.
    "bare": re.compile(r"(?:(?<=[»”\"\w.,;:!?] )|(?<=[»”\"a-zà-ú][.,;:])|(?<=[a-zà-ú]{3}))(\d{1,3})(?=[\s,.;:)<])"),
}


def pages_of(cache: Path, work: str, seed: str) -> list[str]:
    """A document's pages in order, from any one of them. A page names its
    document in its footer and links the pages before and after it."""
    def of_work(page: str) -> bool:
        footer = re.search(r"<hr><center><font[^>]*><b> ([^<]+)</b>", fetch(cache, page))
        return footer is not None and (footer.group(1) == work or footer.group(1).startswith(work + " "))

    def beside(page: str, title: str) -> str | None:
        link = re.search(rf"<a href=(\w+)\.htm><img title={title} ", fetch(cache, page))
        return link.group(1) if link and of_work(link.group(1)) else None

    first = seed
    while (before := beside(first, "Vor")) is not None:
        first = before
    pages = [first]
    while (after := beside(pages[-1], "Nach")) is not None:
        pages.append(after)
    return pages


def document(cache: Path, work: str, seed: str, slugs: dict[str, str]) -> list[tuple]:
    """Every Scripture reference in a document, from its own text on Clerus:
    (number, file, anchor, book, chapter, first verse, last verse) for the
    numbered section that makes it.

    Clerus's citation pages cannot be used for this either. A document's notes
    are printed after a section, a group of sections or the whole document, and
    are indexed to the section they are printed after; some links name the page
    beside the one the section is on. Here a note goes back to the section that
    calls it, and a section is where its page has it.
    """
    pages = [(page, fetch(cache, page)) for page in pages_of(cache, work, seed)]
    whole = "".join(text for _page, text in pages)
    notes_printed = len(NOTE.findall(whole))
    # How the document calls its notes: "(95)", "[95]", or the bare number. A
    # note can open with the same mark, so the notes' own are not counted.
    called = NOTE.sub(" ", whole)
    style = next(
        (name for name in ("paren", "bracket") if len(CALLS[name].findall(called)) * 2 >= max(notes_printed, 1)),
        "bare",
    )
    found: list[tuple] = []
    calls: dict[str, tuple[str, str, str]] = {}
    numbering = psalm_numbering([text for _page, text in pages])

    def cite(section: tuple[str, str, str], markup: str) -> None:
        # A chapter cited whole ("cf. Mt 5-7") says nothing of a passage in
        # it; a psalm cited whole is its passage.
        found.extend(
            (*section, *reference)
            for reference in references(markup, slugs, numbering)
            if reference[2] or reference[0] == "psalms"
        )

    for page, text in pages:
        text = text.split("<hr><center>")[0]
        blocks = re.split(r"<a name=(\w+)><b>(\d+)</b>", text)
        for anchor, number, block in zip(blocks[1::3], blocks[2::3], blocks[3::3]):
            section = (number, page, anchor)
            parts = NOTE.split(block)
            body = parts[0]
            notes = [(next(n for n in parts[i : i + 4] if n), parts[i + 4]) for i in range(1, len(parts), 5)]
            if notes:
                # What follows a heading after the section's last note (a
                # chapter's epigraph) is not the note's, nor the section's.
                notes[-1] = (notes[-1][0], notes[-1][1].split("<a Name=")[0])
            own = set(CALLS[style].findall(body))
            # A bare number is often not a call, so an earlier section is
            # believed over this one only where the notes are plainly not its
            # own: a list for the sections before, or for the whole document.
            listed = style != "bare" or sum(n in own for n, _ in notes) * 2 < len(notes)
            cite(section, body)
            for n in own:
                calls[n] = section
            for n, markup in notes:
                caller = section if n in own or not listed else calls.get(n, section)
                calls.pop(n, None)
                cite(caller, markup)
    return found


_psalters: list[dict[str, dict[str, str]]] = []


def _words(text: str) -> set[str]:
    plain = "".join(c for c in unicodedata.normalize("NFD", text.lower()) if not unicodedata.combining(c))
    # Latin is spelt with i or j, u or v, as the printer liked.
    plain = plain.replace("æ", "ae").replace("œ", "oe").replace("j", "i").replace("v", "u")
    return {word[:5] for word in re.findall(r"[a-z]{5,}", plain)}


def psalm_links(markup: str) -> list[tuple[int, int | None, int | None, str | None]]:
    """The psalms a stretch of a Portuguese text cites, each as (number, first
    verse, last verse, numbering): "vulgate" or "modern" where the text itself
    or the words it quotes say which the number is, None where nothing does.

    Clerus's linker takes every psalm number for the modern one. The popes'
    texts cite by either, and say so in two ways. Some print both numbers,
    "Sal 139 [138],14" or "Sal 13 (14),3", which Clerus links as two psalms
    one apart: that is one psalm, and the lower number is the Vulgate's.
    Otherwise the words quoted beside the reference are laid against the
    corpus's Psalters, which number as the Vulgate does (Matos Soares for the
    Portuguese, the Clementine for a verse quoted in Latin), under each
    reading."""
    if not _psalters:
        for edition in ("matos-soares", "vulgate"):
            _psalters.append(json.loads((ROOT / "content" / "bible" / edition / "psalms.json").read_text(encoding="utf-8")))
    links = [m for m in REFERENCE.finditer(markup) if m.group(1) == "Ps" and not m.group(4) and not m.group(6)]
    out: list[tuple[int, int | None, int | None, str | None]] = []
    paired = False
    for i, match in enumerate(links):
        if paired:
            paired = False
            continue
        number = int(match.group(2))
        first = int(match.group(3)) if match.group(3) else None
        last = int(match.group(5) or match.group(3)) if match.group(3) else None
        after = links[i + 1] if i + 1 < len(links) else None
        between = re.sub(r"<[^>]+>", "", markup[match.end() : after.start()]) if after else ""
        if after and abs(int(after.group(2)) - number) == 1 and len(between.strip()) <= 3:
            paired = True
            if after.group(3):
                first, last = int(after.group(3)), int(after.group(5) or after.group(3))
            out.append((min(number, int(after.group(2))), first, last, "vulgate"))
            continue
        # The second number is not always linked: "Sl 138 [139],1-6".
        other = re.match(r"(?:</\w+>|\s)*[\[(]\s*(\d+)\s*[\])](?:\s*,\s*(\d+)(?:-(\d+))?)?", markup[match.end() :])
        if other and abs(int(other.group(1)) - number) == 1:
            if other.group(2):
                first, last = int(other.group(2)), int(other.group(3) or other.group(2))
            out.append((min(number, int(other.group(1))), first, last, "vulgate"))
            continue
        numbering = None
        if 11 <= number <= 146:
            said = _words(html.unescape(re.sub(r"<[^>]+>", " ", markup[max(0, match.start() - 400) : match.end() + 150])))

            def likeness(psalm: int) -> float:
                # A psalm cited whole is known by any verse of it.
                verses = [
                    _words(text)
                    for psalter in _psalters
                    for v, text in psalter.get(str(psalm), {}).items()
                    if first is None or first <= int(v) <= min(last, first + 5)
                ]
                # At least three of a verse's words, and two in five of them:
                # a verse is often quoted in part.
                return max((len(v & said) / len(v) for v in verses if len(v) >= 4 and len(v & said) >= 3), default=0.0)

            modern, vulgate = likeness(number - 1), likeness(number)
            if modern >= 0.4 and modern >= vulgate + 0.25:
                numbering = "modern"
            elif vulgate >= 0.4 and vulgate >= modern + 0.25:
                numbering = "vulgate"
        out.append((number, first, last, numbering))
    return out


def psalms(markup: str, otherwise: str | None) -> list[tuple[str, int, int | None, int | None]]:
    """The psalms a stretch cites, in the site's numbering (so that `douay`
    brings each to its Vulgate number): a psalm cited by the Vulgate's number
    is one on, between the two psalms the Vulgate joins and the two it
    divides. `otherwise` is how the text numbers where a reference does not
    say; where the text does not say either, the reference is left out, since
    it would be the wrong psalm as often as one time in three."""
    out: list[tuple[str, int, int | None, int | None]] = []
    for number, first, last, numbering in psalm_links(markup):
        # The two numberings agree on the first eight psalms and the last three.
        if not (numbering or otherwise) and 9 <= number <= 147:
            continue
        vulgate = (numbering or otherwise) == "vulgate" and (10 <= number <= 112 or 116 <= number <= 145)
        out.append(("psalms", number + 1 if vulgate else number, first, last))
    return out


def psalm_numbering(markups: list[str]) -> str:
    """How a text numbers the psalms, by the references in it that say (a
    text is taken to number one way throughout), or "" where none does."""
    votes = Counter(numbering for markup in markups for *_reference, numbering in psalm_links(markup) if numbering)
    if not votes:
        return ""
    return "vulgate" if votes["vulgate"] > votes["modern"] else "modern"


TOKEN = re.compile(r"<a Name=(\w+)>(?:<center>)?<h[12]>(.*?)</h[12]>(?:</center>)?|<a name=(\w+)><b>(\d+)</b>", re.S)


def stream(cache: Path, work: str, seed: str):
    """A work's pages as what they hold, in order: ("heading", page, anchor,
    title), ("number", page, anchor, number) and ("text", markup)."""
    for page in pages_of(cache, work, seed):
        text = fetch(cache, page).split("<hr><center>")[0]
        at = 0
        for token in TOKEN.finditer(text):
            yield ("text", text[at : token.start()])
            at = token.end()
            if token.group(1):
                title = html.unescape(re.sub(r"<[^>]+>", "", token.group(2)))
                yield ("heading", page, token.group(1), re.sub(r"\s+", " ", title).strip())
            else:
                yield ("number", page, token.group(3), token.group(4))
        yield ("text", text[at:])


# Clerus has the Summa in Spanish, a work to each part; the corpus's chapter
# ids open with these.
SUMMA = {"Suma Teológica I": "fp", "Suma Teológica I-II": "fs", "Suma Teológica II-II": "ss", "Suma Teológica III": "tp"}
SUMMA_BOOK = ROOT / "content" / "books" / "aquinas-opera-omnia" / "summa-theologiae" / "en-US"


def summa(cache: Path, seeds: dict[str, str], slugs: dict[str, str]) -> tuple[list[tuple], list[str]]:
    """Every Scripture reference in the Summa, by the article that makes it:
    (the corpus's chapter id, book, chapter, first verse, last verse), and what
    could not be placed. The Summa has no notes, so a reference is where it is
    printed; the question and article are read from the headings above it."""
    found: list[tuple] = []
    problems: list[str] = []
    for work, prefix in SUMMA.items():
        question = article = None
        for kind, *rest in stream(cache, work, seeds[work]):
            if kind == "heading":
                q = re.match(r"CUESTI[ÓO]N (\d+)", rest[2], re.I)
                a = re.match(r"[: ]*ART[IÍí]CULO (\d+)", rest[2], re.I)
                if q:
                    question, article = int(q.group(1)), None
                elif a:
                    # Clerus lost a question's heading (II-II, 17): its
                    # articles begin again at 1 under the question before.
                    if int(a.group(1)) == 1 and (article or 0) >= 2 and question is not None:
                        question += 1
                    article = int(a.group(1))
            elif kind == "text" and question is not None:
                cited = [r for r in references(rest[0], slugs) if r[2] or r[0] == "psalms"]
                if not cited:
                    continue
                chapter = f"{prefix}-q{question:03d}-" + ("pr" if article is None else f"a{article:02d}")
                if not (SUMMA_BOOK / f"{chapter}.md").exists():
                    problems.append(f"{work}: no {chapter} in the corpus")
                    continue
                found.extend((chapter, *r) for r in cited)
    return found, problems


# The popes' preaching and teaching that Clerus has in Portuguese, a work to a
# collection (the addresses of John Paul II, a work to each year).
TALKS = re.compile(r"Homilias JOÃO PAULO II|Bento XVI Homilias|Audiências [\d-]+|Discursos Bento XVI|Discursos João Paulo II \d+")


def talks(cache: Path, work: str, seed: str, slugs: dict[str, str]) -> list[tuple]:
    """Every Scripture reference in a collection of homilies or addresses, by
    the text that makes it: (title, page, anchor, book, chapter, first verse,
    last verse). A text runs from its headings (the day, the occasion) to the
    next; its notes are printed inside it, so they are its own."""
    found: list[tuple] = []
    titles: list[str] = []
    place: tuple[str, str] | None = None
    fresh = True  # still among the lines that head a text

    def title() -> str:
        # "HOMILIA DO PAPA JOÃO PAULO II" heads every text of his and names none.
        named = [t for t in dict.fromkeys(titles) if not re.fullmatch(r"(?:\w+ D[OE] )?(?:SANTO PADRE|PAPA [\w ]+)", t)]
        return " — ".join(named or titles)[:240]

    def words(markup: str) -> str:
        return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", markup))).strip()

    texts: dict[tuple[str, str], list[tuple[str, str]]] = {}
    for kind, *rest in stream(cache, work, seed):
        if kind == "heading":
            page, anchor, heading = rest
            if not fresh:
                titles = []
            fresh = True
            if heading:
                titles.append(heading)
            place = (page, anchor)
        elif kind == "text" and place is not None:
            markup = rest[0]
            # Between its headings a text has lines that are still its title
            # (the place, the day, set in the middle of the page), and the day
            # is often the first such line under the last of them.
            lines = re.match(r"(?:\s|<br>)*((?:<center>.*?</center>(?:\s|<br>)*)*)", markup, re.S).group(1)
            if fresh and len(words(markup)) < 120 and not REFERENCE.search(markup):
                lines = markup
            else:
                fresh = fresh and not words(markup)
            if lines and (fresh or titles):
                titles.extend(t for t in (words(line) for line in re.split(r"</center>|<br>", lines)) if t)
            texts.setdefault(place, []).append((title(), markup))
    for place, stretches in texts.items():
        numbering = psalm_numbering([markup for _title, markup in stretches])
        found.extend(
            (name, *place, *r)
            for name, markup in stretches
            for r in references(markup, slugs, numbering)
            if r[2] or r[0] == "psalms"
        )
    return found


# The books as the corpus's English Summa names them (several translators'
# hands), to the Douay slugs. It numbers as St Thomas does, by the Vulgate:
# "1 Kgs" is the first book of Samuel.
SUMMA_NAMES = {
    "genesis": "Gen Gn Genesis", "exodus": "Ex Exod Exodus", "leviticus": "Lev Leviticus",
    "numbers": "Num Numbers", "deuteronomy": "Deut Dt Deuteronomy", "josue": "Josh Jos", "judges": "Judg Judges",
    "ruth": "Ruth", "1-kings": "1 Kgs|1 Kings|1 Sam|1 Samuel", "2-kings": "2 Kgs|2 Kings|2 Sam|2 Samuel",
    "3-kings": "3 Kgs|3 Kings", "4-kings": "4 Kgs|4 Kings", "1-paralipomenon": "1 Chr|1 Paral|1 Paralip",
    "2-paralipomenon": "2 Chr|2 Paral|2 Paralip", "1-esdras": "Ezra|1 Esdras|1 Esdr|1 Esdra",
    "2-esdras": "2 Esdras|2 Esdr", "tobias": "Tob Tobias Tobit", "judith": "Jdt Judith", "esther": "Esther",
    "1-machabees": "1 Macc|1 Mach", "2-machabees": "2 Macc|2 Mach|2 Maccabees", "job": "Job",
    "psalms": "Ps Psalm", "proverbs": "Prov Proverbs", "ecclesiastes": "Eccl Eccles Ecclesiastes",
    "canticles": "Song Songs Cant", "wisdom": "Wis Wisdom", "ecclesiasticus": "Sir Sirach Ecclus",
    "isaias": "Isa Is Isaiah Isaias", "jeremias": "Jer Jeremiah Jeremias", "lamentations": "Lam Lament",
    "baruch": "Bar Baruch", "ezechiel": "Ezek Ezech Ezekiel Ezechiel", "daniel": "Dan Daniel",
    "osee": "Hos Hosea Osee", "joel": "Joel", "amos": "Amos", "jonas": "Jonah", "micheas": "Mic Micah",
    "nahum": "Nahum", "habacuc": "Hab", "zacharias": "Zech Zach", "malachias": "Mal Malach Malachi",
    "matthew": "Matt Mt Matthew", "mark": "Mark Mk", "luke": "Luke Lk Luc", "john": "John Jn", "acts": "Acts",
    "romans": "Rom Rm Romans", "1-corinthians": "1 Cor|1 Corinthians", "2-corinthians": "2 Cor|2 Corinthians",
    "galatians": "Gal Galatians", "ephesians": "Eph Ephesians", "philippians": "Phil Philippians Phillipians",
    "colossians": "Col Colossians", "1-thessalonians": "1 Thess|1 Thessalonians",
    "2-thessalonians": "2 Thess|2 Thessalonians", "1-timothy": "1 Tim|1 Timothy", "2-timothy": "2 Tim|2 Timothy",
    "titus": "Titus", "hebrews": "Heb Hebrews", "james": "Jas James", "1-peter": "1 Pet|1 Pt|1 Peter",
    "2-peter": "2 Pet|2 Pt|2 Peter", "1-john": "1 John|1 Jn", "2-john": "2 John", "jude": "Jude",
    "apocalypse": "Rev Revelation Apoc",
}
_summa_slug = {
    name: slug for slug, names in SUMMA_NAMES.items() for name in (names.split("|") if "|" in names or names[0].isdigit() else names.split())
}
SUMMA_REFERENCE = re.compile(
    r"(?<![A-Za-z0-9])(" + "|".join(sorted(map(re.escape, _summa_slug), key=len, reverse=True)) + r")\.? (?=\d+:\d)"
)


def summa_english() -> list[tuple]:
    """Every Scripture reference the corpus's own Summa prints, by article:
    (chapter id, book, chapter, first verse, last verse)."""
    found: list[tuple] = []
    for path in sorted(SUMMA_BOOK.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        for match in SUMMA_REFERENCE.finditer(text):
            found.extend((path.stem, *r) for r in ccc_english.run(_summa_slug[match.group(1)], text[match.end() :]) if r[2])
    return list(dict.fromkeys(found))


def write_cited(directory: Path, found: list[tuple], vulgate: bool = False) -> int:
    """Lay places against the verses they cite, a file to a book: {items:
    [place], chapters: {chapter: [[first verse, last verse, place's position]]}}
    in the Douay's numbering. `found` is (place, book, chapter, first, last),
    the places in the order they are to be listed. `vulgate` is for a work
    that numbers as the Douay does already (St Thomas cites the Vulgate)."""
    directory.mkdir(parents=True, exist_ok=True)
    books: dict[str, tuple[dict, dict[str, list]]] = {}
    drb = {path.stem: json.loads(path.read_text(encoding="utf-8")) for path in (ROOT / "content" / "bible" / "drb").glob("*.json")}
    absent = 0
    for place, slug, chapter, first, last in found:
        positions, chapters = books.setdefault(slug, ({}, {}))
        position = positions.setdefault(place, len(positions))
        if first is None:  # a psalm cited whole
            first, last = 1, END
        placed = [(chapter, first, last, None)] if vulgate else douay(slug, chapter, first, last)
        for douay_chapter, start, end, _label in placed:
            # A verse the book does not have is a reference misread (a digit
            # dropped or doubled, one book taken for another).
            in_chapter = drb.get(slug, {}).get(str(douay_chapter))
            if in_chapter is None or start > len(in_chapter) + 2:
                absent += 1
                continue
            run = [start, end, position]
            runs = chapters.setdefault(str(douay_chapter), [])
            if run not in runs:
                runs.append(run)
    for slug, (positions, chapters) in books.items():
        for runs in chapters.values():
            runs.sort()
        (directory / f"{slug}.json").write_text(
            json.dumps({"items": list(positions), "chapters": chapters}, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
    if absent:
        print(f"   {absent} left out: no such verse")
    return sum(len(runs) for _p, chapters in books.values() for runs in chapters.values())


def write_summa(cache: Path, everywhere: dict[str, str], slugs: dict[str, str]) -> None:
    """content/bible/summa/: the articles of the Summa that quote each verse,
    as [the corpus's chapter id, the article's question].

    From the corpus's own text, which prints its references. The Spanish Summa
    on Clerus is laid beside it as a second witness, and counted, but adds
    nothing of its own: about half of what only Clerus has is its linker's
    misreading, and the rest is a quotation the Spanish editors gave a
    reference to that the English leaves without one.
    """
    english = summa_english()
    spanish, problems = summa(cache, everywhere, slugs)
    verses = {path.stem: json.loads(path.read_text(encoding="utf-8")) for path in (ROOT / "content" / "bible" / "drb").glob("*.json")}
    by_article: dict[str, list[tuple]] = {}
    for reference in spanish:
        by_article.setdefault(reference[0], []).append(reference)

    def witnessed(e: tuple) -> bool:
        return any(o[1:3] == e[1:3] and (o[3] is None or (o[3] - 1 <= e[4] and e[3] - 1 <= o[4])) for o in by_article.get(e[0], []))

    def exists(e: tuple) -> bool:
        in_chapter = verses.get(e[1], {}).get(str(e[2]))
        return in_chapter is not None and e[3] <= len(in_chapter) + 1

    found = [e for e in english if exists(e) or witnessed(e)]
    both = sum(witnessed(e) for e in found)
    print(
        f"summa: {len(found)} references in the English, {both} of them also on Clerus, "
        f"{len(english) - len(found)} dropped (no such verse), {len(spanish)} on Clerus in all"
    )
    toc = json.loads((SUMMA_BOOK.parent / "book.json").read_text(encoding="utf-8"))["toc"]
    titles: dict[str, str] = {}

    def walk(nodes: list[dict]) -> None:
        for node in nodes:
            # "Article 6 — Whether hope is…", "Question 017 — Question 17 — Hope".
            titles[node["id"]] = node["title"]["en-US"].split(" — ")[-1]
            walk(node.get("children", []))

    walk(toc)
    for chapter in {chapter for chapter, *_ in found}:
        if chapter.endswith("-pr"):
            titles[chapter] = titles[chapter[:-3]]
    cited = write_cited(
        ROOT / "content" / "bible" / "summa",
        [((chapter, titles[chapter]), *reference) for chapter, *reference in found],
        vulgate=True,
    )
    print(f"summa: {cited} citations by {len({chapter for chapter, *_ in found})} articles; on Clerus, {len(problems)} not placed")
    for problem, count in Counter(problems).most_common():
        print(f"   {problem} ({count})")


def collection(work: str) -> str:
    """A collection as the reader is to see it named."""
    pope = "João Paulo II" if "JO" in work.upper() else "Bento XVI"
    kind = "homilias" if "Homilias" in work else "audiências" if "Audiências" in work else "discursos"
    return f"{pope}, {kind}"


def write_talks(cache: Path, everywhere: dict[str, str], slugs: dict[str, str]) -> None:
    """content/bible/clerus/talks/: the popes' homilies, audiences and
    addresses that quote each verse, as [collection, title, page, anchor]."""
    found: list[tuple] = []
    for work in sorted(everywhere):
        if TALKS.fullmatch(work):
            found.extend(
                ((collection(work), title, page, anchor), *reference)
                for title, page, anchor, *reference in talks(cache, work, everywhere[work], slugs)
            )
    cited = write_cited(OUT / "talks", found)
    print(f"talks: {cited} citations by {len({place for place, *_ in found})} texts")


def citations(page: str) -> list[dict]:
    """A citation page as its works, in the site's order: {group, work, places}.

    The page opens with the works that treat the passage itself (group ""),
    then the rest under the library's own headings. A place is [file, anchor,
    label]: where on the site, and the number or title the site shows.
    """
    body = page[page.find("</center>") :]
    out, group = [], ""
    for chunk in re.split(r"(<b>[^<]+</b><hr>)", body):
        heading = re.fullmatch(r"<b>([^<]+)</b><hr>", chunk)
        if heading:
            group = html.unescape(heading.group(1)).strip()
            continue
        for work, links in re.findall(r"<i>([^<]+):</i>(.*?)(?=<i>[^<]+:</i>|$)", chunk, re.S):
            places = [
                [file, anchor, html.unescape(label).strip()]
                for file, anchor, label in re.findall(r"<a href=(\w+)\.htm#(\w+) target=m>([^<]*)</a>", links)
            ]
            if places:
                out.append({"group": group, "work": html.unescape(work).strip(), "places": places})
    return out


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    cache = Path(sys.argv[1])
    cache.mkdir(parents=True, exist_ok=True)
    RESEARCH.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)

    books = {directory: numbered_chapters(directory) for _w, _on, directory, _s, _a in HOMILIES}
    passages = passages_of(cache)
    slugs = {reference.split(" ")[0]: slug for slug, reference, _cite in passages}
    # The Catechism's citations, by book and chapter, to lay on the passages.
    cited_by_catechism: dict[tuple[str, int], list[tuple[int, int | None, int | None]]] = {}
    # The same citations turned around: what each paragraph cites, as [book,
    # chapter, first verse, last verse] in the Douay's numbering.
    cited_in_catechism: dict[str, list] = {}
    for paragraph, book, c, first, last in catechism(cache, slugs):
        cited_by_catechism.setdefault((book, c), []).append((paragraph, first, last))
        for douay_chapter, start, end, _label in douay(book, c, first or 1, last or END):
            run = [book, douay_chapter, start, end]
            runs = cited_in_catechism.setdefault(str(paragraph), [])
            if run not in runs:
                runs.append(run)
    (OUT.parent / "catechism.json").write_text(
        json.dumps(dict(sorted(cited_in_catechism.items(), key=lambda kv: int(kv[0]))), separators=(",", ":")),
        encoding="utf-8",
    )
    # The documents Clerus has in Portuguese (it marks them " PT"), in the
    # order its citation pages first name them, each with a page to start from.
    seeds: dict[str, str] = {}
    everywhere: dict[str, str] = {}  # a page of every work, to walk it from
    for _slug, _reference, cite in passages:
        for entry in citations(fetch(cache, cite)):
            everywhere.setdefault(entry["work"], entry["places"][0][0])
            if entry["work"].endswith(" PT") and any(label.isdigit() for _f, _a, label in entry["places"]):
                seeds.setdefault(entry["work"], entry["places"][0][0])
    cited_by_documents: dict[tuple[str, int], list[tuple]] = {}
    for work, seed in seeds.items():
        for number, file, anchor, book, c, first, last in document(cache, work, seed, slugs):
            cited_by_documents.setdefault((book, c), []).append((work[:-3], [number, file, anchor], first, last))
    works: Counter[tuple[str, str]] = Counter()
    by_book: dict[str, dict[str, list]] = {}
    links = 0
    with gzip.open(RESEARCH / "index.jsonl.gz", "wt", encoding="utf-8", compresslevel=9) as index:
        for slug, reference, cite in passages:
            chapter, verse, end_chapter, end_verse = span(reference)
            cited = citations(fetch(cache, cite))
            for entry in cited:
                works[(entry["group"], entry["work"])] += len(entry["places"])
                links += len(entry["places"])
            index.write(
                json.dumps(
                    {"book": slug, "from": [chapter, verse], "to": [end_chapter, end_verse], "page": cite, "cited": cited},
                    ensure_ascii=False,
                    separators=(",", ":"),
                )
                + "\n"
            )
            # A paragraph cites the passage when a verse it cites falls in it;
            # a citation of a whole chapter counts for every passage of it.
            paragraphs = sorted(
                {
                    paragraph
                    for c in range(chapter, end_chapter + 1)
                    for paragraph, first, last in cited_by_catechism.get((slug, c), [])
                    if first is None
                    or (
                        (c, last) >= (chapter, verse)
                        and (c, first) <= (end_chapter, end_verse)
                    )
                }
            )
            homilies = homilies_on(slug, chapter, cited, books)
            by_work: dict[str, list] = {}
            for c in range(chapter, end_chapter + 1):
                for work, place, first, last in cited_by_documents.get((slug, c), []):
                    if first is None or ((c, last) >= (chapter, verse) and (c, first) <= (end_chapter, end_verse)):
                        places = by_work.setdefault(work, [])
                        if place not in places:
                            places.append(place)
            documents = [{"work": work, "places": places} for work, places in by_work.items()]
            # A passage that runs into the next chapter is listed under each
            # chapter it touches, with the verses it covers there.
            for c in range(chapter, end_chapter + 1):
                runs = douay(slug, c, verse if c == chapter else 1, end_verse if c == end_chapter else END)
                # Which of the passage's verses each place cites, so a verse
                # can tell what cites it from what cites its neighbours: by
                # the paragraph's number, or a document's "page#anchor".
                here = [(str(paragraph), first, last) for paragraph, first, last in cited_by_catechism.get((slug, c), [])]
                here += [(f"{place[1]}#{place[2]}", first, last) for _work, place, first, last in cited_by_documents.get((slug, c), [])]
                for douay_chapter, start, end, label in runs:
                    cited_verses: dict[str, list] = {}
                    for key, first, last in here:
                        for at_chapter, at_first, at_last, _label in douay(slug, c, first or 1, last or END):
                            run = [at_first, at_last]
                            if at_chapter == douay_chapter and at_last >= start and at_first <= end and run not in cited_verses.setdefault(key, []):
                                cited_verses[key].append(run)
                    by_book.setdefault(slug, {}).setdefault(str(douay_chapter), []).append(
                        {
                            "from": start,
                            "to": end,
                            "passage": label or reference.split(" ", 1)[1],
                            "ccc": paragraphs,
                            **({"homilies": homilies} if homilies else {}),
                            **({"magisterium": documents} if documents else {}),
                            **({"verses": {k: v for k, v in cited_verses.items() if v}} if any(cited_verses.values()) else {}),
                        }
                    )

    write_summa(cache, everywhere, slugs)
    write_talks(cache, everywhere, slugs)

    (RESEARCH / "works.json").write_text(
        json.dumps(
            [{"group": g, "work": w, "places": n} for (g, w), n in sorted(works.items(), key=lambda kv: -kv[1])],
            ensure_ascii=False,
            indent=1,
        )
        + "\n",
        encoding="utf-8",
    )
    for slug, chapters in by_book.items():
        for passages in chapters.values():
            passages.sort(key=lambda p: (p["from"], p["to"]))
        (OUT / f"{slug}.json").write_text(
            json.dumps(chapters, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
        )
    passages = sum(len(p) for c in by_book.values() for p in c.values())
    print(f"{len(by_book)} books, {passages} passages by chapter, {links} citations of {len(works)} works")


if __name__ == "__main__":
    main()
