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

The research index keeps the site's own numbering (the Hebrew: Psalm 23 is "The
Lord is my shepherd").

Usage:
    python3 scripts/build-clerus-index.py <cache dir>

The cache dir keeps every page fetched, so a second run only parses. A full
crawl is about 3,200 requests.
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


def catechism(cache: Path, slugs: dict[str, str]) -> list[tuple[int, str, int, int | None, int | None]]:
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
    reference = re.compile(r"<a href=\w+\.htm#\w+>(\w+) (\d+)(?:,(\d+)(?:-(\d+))?)?[^<]*</a>")
    found: list[tuple[int, str, int, int | None, int | None]] = []

    def cite(paragraph: int, markup: str) -> None:
        for book, chapter, first, last in reference.findall(markup):
            if book in slugs:
                found.append(
                    (paragraph, slugs[book], int(chapter), int(first) if first else None, int(last or first) if first else None)
                )

    for page in pages:
        text = fetch(cache, page)
        # The footnote numbers start again in each part, so a call waits only
        # for the next note of its number.
        calls: dict[str, int] = {}
        blocks = re.split(r"<a name=\w+><b>(\d+)</b>", text)
        for number, block in zip(blocks[1::2], blocks[2::2]):
            paragraph = int(number)
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
    return found


def magisterium(cited: list[dict]) -> list[dict]:
    """The councils' and popes' documents that cite a passage, for those Clerus
    has in Portuguese (it marks them " PT"): {work, places: [[number, file,
    anchor]]}. The app reads the numbered section from Clerus, at that anchor."""
    out: dict[str, list] = {}
    for entry in cited:
        if not entry["work"].endswith(" PT"):
            continue
        places = out.setdefault(entry["work"][:-3], [])
        for file, anchor, label in entry["places"]:
            if label.isdigit() and [label, file, anchor] not in places:
                places.append([label, file, anchor])
    return [{"work": work, "places": places} for work, places in out.items() if places]


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
    for paragraph, book, c, first, last in catechism(cache, slugs):
        cited_by_catechism.setdefault((book, c), []).append((paragraph, first, last))
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
            documents = magisterium(cited)
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
