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
    side: the Portuguese on Clerus and the English (scripts/ccc_english.py).

    Neither is clean alone. Clerus links the references itself and slips
    (Jonas read as John, "6,11" cut to "6,1", a reference left unlinked, a
    call misnumbered in the text so its note falls to a later paragraph); the
    English transcription has its own ("Deut 6:45" for 6:4-5). Measured against
    each other, each alone is right about nineteen times in twenty and has
    nine in ten. Together: what both have is kept; what only the English has
    is kept if such a verse exists; what only the Portuguese has is kept
    unless the English shows it to be one of Clerus's slips.
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

    def slip(ours: tuple) -> str | None:
        """Why the English shows a Portuguese-only reference to be Clerus's error."""
        paragraph, book, chapter, first, _last = ours
        here = by_paragraph.get(paragraph, [])
        if any(e[1] != book and e[2] == chapter and e[3] is not None and same((0, e[1], *ours[2:]), e) for e in here):
            return "another book"
        if any(
            e[1:3] == (book, chapter) and first is not None and e[3] not in (None, first) and str(e[3]).startswith(str(first))
            for e in here
        ):
            return "a digit dropped"
        near = (e for n in range(paragraph - 8, paragraph + 9) if n != paragraph for e in by_paragraph.get(n, []))
        if first is not None and any(same(ours, e) and e not in matched for e in near):
            return "another paragraph"
        return None

    matched: set[tuple] = set()
    kept: list[tuple] = []
    tally: Counter[str] = Counter()
    for ours in portuguese:
        twins = [e for e in by_paragraph.get(ours[0], []) if same(ours, e)]
        matched.update(twins)
        if twins:
            tally["in both"] += 1
            kept.append(ours)
    for ours in portuguese:
        if any(same(ours, e) for e in by_paragraph.get(ours[0], [])):
            continue
        reason = slip(ours) or (None if exists(ours) else "no such verse")
        tally[f"Portuguese only, dropped: {reason}" if reason else "Portuguese only, kept"] += 1
        if not reason:
            kept.append(ours)
    for theirs in english:
        if theirs in matched:
            continue
        tally["English only, kept" if exists(theirs) else "English only, dropped: no such verse"] += 1
        if exists(theirs):
            kept.append(theirs)
    print("catechism:", ", ".join(f"{count} {what}" for what, count in tally.most_common()))
    return kept


REFERENCE = re.compile(r"<a href=\w+\.htm#\w+>(\w+) (\d+)(?:,(\d+)(?:-(?:(\d+),)?(\d+))?|-(\d+))?[^<]*</a>")


def references(markup: str, slugs: dict[str, str]) -> list[tuple[str, int, int | None, int | None]]:
    """The Scripture a stretch of a page links to: (book, chapter, first verse,
    last verse), the verses None where a chapter is cited whole. A reference
    that runs into another chapter ("Sb 11,23-12,2") is given as two."""
    out: list[tuple[str, int, int | None, int | None]] = []
    for book, chapter, first, end_chapter, last, to_chapter in REFERENCE.findall(markup):
        if book not in slugs:
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

    def cite(section: tuple[str, str, str], markup: str) -> None:
        # A chapter cited whole ("cf. Mt 5-7") says nothing of a passage in
        # it; a psalm cited whole is its passage.
        found.extend(
            (*section, *reference)
            for reference in references(markup, slugs)
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
            found.extend((title(), *place, *r) for r in references(markup, slugs) if r[2] or r[0] == "psalms")
    return found


def write_cited(directory: Path, found: list[tuple], vulgate: bool = False) -> int:
    """Lay places against the verses they cite, a file to a book: {items:
    [place], chapters: {chapter: [[first verse, last verse, place's position]]}}
    in the Douay's numbering. `found` is (place, book, chapter, first, last),
    the places in the order they are to be listed. `vulgate` is for a work
    that numbers as the Douay does already (St Thomas cites the Vulgate)."""
    directory.mkdir(parents=True, exist_ok=True)
    books: dict[str, tuple[dict, dict[str, list]]] = {}
    for place, slug, chapter, first, last in found:
        positions, chapters = books.setdefault(slug, ({}, {}))
        position = positions.setdefault(place, len(positions))
        if first is None:  # a psalm cited whole
            first, last = 1, END
        placed = [(chapter, first, last, None)] if vulgate else douay(slug, chapter, first, last)
        for douay_chapter, start, end, _label in placed:
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
    return sum(len(runs) for _p, chapters in books.values() for runs in chapters.values())


def write_summa(cache: Path, everywhere: dict[str, str], slugs: dict[str, str]) -> None:
    """content/bible/summa/: the articles of the Summa that quote each verse,
    as [the corpus's chapter id, the article's question]."""
    found, problems = summa(cache, everywhere, slugs)
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
    print(f"summa: {cited} citations by {len({chapter for chapter, *_ in found})} articles, {len(problems)} not placed")
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
                for douay_chapter, start, end, label in runs:
                    by_book.setdefault(slug, {}).setdefault(str(douay_chapter), []).append(
                        {
                            "from": start,
                            "to": end,
                            "passage": label or reference.split(" ", 1)[1],
                            "ccc": paragraphs,
                            **({"homilies": homilies} if homilies else {}),
                            **({"magisterium": documents} if documents else {}),
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
