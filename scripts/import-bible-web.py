#!/usr/bin/env python3
"""Rebuild content/bible/<translation>/ from a Bible published only as web pages.

    knox          bibliacatolica.com.br/the-knox-bible, one page per chapter
    matos-soares  liriocatolico.com.br/biblia_online/biblia_matos_soares, one page
                  per book (the 1956 edition)

Writes the same shape as import-bible-usfm.py: `<slug>.json` as
{chapter: {verse: text}} under the Douay slugs, and `index.json`. Footnote
calls are dropped; the notes themselves are not imported.

Pages are kept in <cache dir>, so a second run reads from disk.

Usage:
    python3 scripts/import-bible-web.py <translation> <cache dir>
"""
from __future__ import annotations

import html
import json
import re
import sys
import time
import unicodedata
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BIBLE = ROOT / "content" / "bible"

# Douay slug → (Lírio Católico slug, bibliacatolica.com.br slug), in canon order.
BOOKS = {
    "genesis": ("genesis", "genesis"),
    "exodus": ("exodo", "exodus"),
    "leviticus": ("levitico", "leviticus"),
    "numbers": ("numeros", "numbers"),
    "deuteronomy": ("deuteronomio", "deuteronomy"),
    "josue": ("josue", "joshua"),
    "judges": ("juizes", "judges"),
    "ruth": ("rute", "ruth"),
    "1-kings": ("i-samuel", "1-samuel"),
    "2-kings": ("ii-samuel", "2-samuel"),
    "3-kings": ("i-reis", "1-kings"),
    "4-kings": ("ii-reis", "2-kings"),
    "1-paralipomenon": ("i-cronicas", "1-chronicles"),
    "2-paralipomenon": ("ii-cronicas", "2-chronicles"),
    "1-esdras": ("esdras", "ezra"),
    "2-esdras": ("neemias", "nehemiah"),
    "tobias": ("tobias", "tobit"),
    "judith": ("judite", "judith"),
    "esther": ("ester", "esther"),
    "job": ("jo", "job"),
    "psalms": ("salmos", "psalms"),
    "proverbs": ("proverbios", "proverbs"),
    "ecclesiastes": ("eclesiastes", "ecclesiastes"),
    "canticles": ("cantico-dos-canticos", "song-of-solomon"),
    "wisdom": ("sabedoria", "wisdom-of-solomon"),
    "ecclesiasticus": ("eclesiastico", "ecclesiasticus"),
    "isaias": ("isaias", "isaiah"),
    "jeremias": ("jeremias", "jeremiah"),
    "lamentations": ("lamentacoes", "lamentations"),
    "baruch": ("baruc", "baruch"),
    "ezechiel": ("ezequiel", "ezekiel"),
    "daniel": ("daniel", "daniel"),
    "osee": ("oseias", "hosea"),
    "joel": ("joel", "joel"),
    "amos": ("amos", "amos"),
    "abdias": ("abdias", "obadiah"),
    "jonas": ("jonas", "jonah"),
    "micheas": ("miqueias", "micah"),
    "nahum": ("naum", "nahum"),
    "habacuc": ("habacuc", "habakkuk"),
    "sophonias": ("sofonias", "zephaniah"),
    "aggeus": ("ageu", "haggai"),
    "zacharias": ("zacarias", "zechariah"),
    "malachias": ("malaquias", "malachi"),
    "1-machabees": ("i-macabeus", "1-maccabees"),
    "2-machabees": ("ii-macabeus", "2-maccabees"),
    "matthew": ("sao-mateus", "matthew"),
    "mark": ("sao-marcos", "mark"),
    "luke": ("sao-lucas", "luke"),
    "john": ("sao-joao", "john"),
    "acts": ("atos-dos-apostolos", "acts"),
    "romans": ("romanos", "romans"),
    "1-corinthians": ("i-corintios", "1-corinthians"),
    "2-corinthians": ("ii-corintios", "2-corinthians"),
    "galatians": ("galatas", "galatians"),
    "ephesians": ("efesios", "ephesians"),
    "philippians": ("filipenses", "philippians"),
    "colossians": ("colossenses", "colossians"),
    "1-thessalonians": ("i-tessalonicenses", "1-thessalonians"),
    "2-thessalonians": ("ii-tessalonicenses", "2-thessalonians"),
    "1-timothy": ("i-timoteo", "1-timothy"),
    "2-timothy": ("ii-timoteo", "2-timothy"),
    "titus": ("tito", "titus"),
    "philemon": ("filemon", "philemon"),
    "hebrews": ("hebreus", "hebrews"),
    "james": ("sao-tiago", "james"),
    "1-peter": ("i-sao-pedro", "1-peter"),
    "2-peter": ("ii-sao-pedro", "2-peter"),
    "1-john": ("i-sao-joao", "1-john"),
    "2-john": ("ii-sao-joao", "2-john"),
    "3-john": ("iii-sao-joao", "3-john"),
    "jude": ("sao-judas", "jude"),
    "apocalypse": ("apocalipse", "revelation"),
}


def fetch(url: str, cache: Path) -> str:
    path = cache / re.sub(r"[^A-Za-z0-9]+", "_", url.split("://", 1)[1])
    if path.exists():
        return path.read_text(encoding="utf-8")
    # Lírio Católico's Cloudflare turns away urllib's own User-Agent.
    request = urllib.request.Request(url, headers={"User-Agent": "okhttp/4.12.0"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                text = response.read().decode("utf-8")
            break
        except OSError:
            if attempt == 3:
                raise
            time.sleep(2 ** (attempt + 1))
    path.write_text(text, encoding="utf-8")
    time.sleep(0.3)
    return text


def plain(markup: str) -> str:
    markup = re.sub(r"<br\s*/?>", " ", markup)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", markup))).strip()


def knox(cache: Path, drb: list[dict]) -> list[dict]:
    def chapter(job: tuple[str, int]) -> dict[str, str]:
        slug, number = job
        page = fetch(
            f"https://www.bibliacatolica.com.br/the-knox-bible/{BOOKS[slug][1]}/{number}/", cache
        )
        # "✻" marks where one of Knox's footnotes hangs. He often renders two or
        # three verses as one, so verse numbers skip.
        verses = {
            verse: plain(content.replace("✻", ""))
            for verse, content in re.findall(r"<p><strong>(\d+)\.</strong>(.*?)</p>", page, re.S)
        }
        if not verses:
            sys.exit(f"knox: no verses in {slug} {number}")
        return verses

    index = []
    with ThreadPoolExecutor(2) as pool:
        for book in drb:
            slug = book["slug"]
            jobs = [(slug, n) for n in range(1, book["chapters"] + 1)]
            write(BIBLE / "knox", slug, dict(zip((str(n) for _, n in jobs), pool.map(chapter, jobs))))
            index.append(book)
            print(slug, flush=True)
    return index


def matos_soares(cache: Path, drb: list[dict]) -> list[dict]:
    index = []
    for book in drb:
        slug = book["slug"]
        page = fetch(
            "https://www.liriocatolico.com.br/biblia_online/biblia_matos_soares/"
            f"{BOOKS[slug][0]}/completo/",
            cache,
        )
        name = plain(re.search(r"<h1>(.*?) - Livro Completo", page, re.S).group(1))
        chapters = {}
        parts = re.split(r'<h2 id="cap-(\d+)"', page)[1:]
        for number, body in zip(parts[::2], parts[1::2]):
            verses = {}
            for verse, content in re.findall(
                r"<p>\s*<strong><sup><small>(\d+)</small></sup></strong>(.*?)(?:<!--|<a |</p>)",
                body, re.S,
            ):
                text = re.sub(r"\[[ivxlcdm]+\]", "", plain(content))  # a footnote call
                # …or one printed as a bare digit after the verse's last mark ("Senhor,1").
                text = re.sub(r'([,.;:!?”"])\d+$', r"\1", text.strip())
                # The Psalms carry the Hebrew numbering after the verse: "(10,1)", "(1)".
                if slug == "psalms":
                    text = re.sub(r"\s*\(\d+(,\s*\d+)?\)$", "", text)
                text = text.replace("\u00ad", "").replace("_", " ").replace("*", "")
                text = re.sub(r"\{\d+:|\}", "", text)  # leftovers of the site's note markup
                text = re.sub(r"\(\s+", "(", re.sub(r"\s+\)", ")", text))  # "( Jr 31, 15 )"
                verses[verse] = re.sub(r"\s+", " ", unicodedata.normalize("NFC", text)).strip()
            chapters[number] = verses
        if len(chapters) != book["chapters"]:
            sys.exit(f"matos-soares: {slug} has {len(chapters)} chapters, expected {book['chapters']}")
        write(BIBLE / "matos-soares", slug, chapters)
        index.append({**book, "name": name})
        print(slug, flush=True)
    return index


def write(out: Path, slug: str, chapters: dict[str, dict[str, str]]) -> None:
    for number, verses in chapters.items():
        if not verses or any(not text for text in verses.values()):
            sys.exit(f"{out.name}: empty verse in {slug} {number}")
    out.mkdir(parents=True, exist_ok=True)
    (out / f"{slug}.json").write_text(
        json.dumps(chapters, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )


def main() -> None:
    sources = {"knox": knox, "matos-soares": matos_soares}
    if len(sys.argv) != 3 or sys.argv[1] not in sources:
        sys.exit(__doc__)
    cache = Path(sys.argv[2])
    cache.mkdir(parents=True, exist_ok=True)
    drb = json.loads((BIBLE / "drb" / "index.json").read_text(encoding="utf-8"))
    index = sources[sys.argv[1]](cache, drb)
    (BIBLE / sys.argv[1] / "index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8"
    )
    verses = sum(
        len(v)
        for b in index
        for v in json.loads((BIBLE / sys.argv[1] / f"{b['slug']}.json").read_text()).values()
    )
    print(f"{len(index)} books, {sum(b['chapters'] for b in index)} chapters, {verses} verses")


if __name__ == "__main__":
    main()
