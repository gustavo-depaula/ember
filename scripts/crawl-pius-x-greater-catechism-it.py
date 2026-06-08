#!/usr/bin/env python3
"""Download the 1905 Catechismo Maggiore di Pio X from Italian Wikisource.

Outputs one .txt per logical section into
content/books/pius-x-greater-catechism/sources/it-originals/, with --- page
separators wrapping each Wikisource subpage.

Source: https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana
The Wikisource transcription is the canonical proofread edition (100% quality).
The 1905 text itself is public domain.

What we fetch:
  - Promulgation letter (Lettera di S.S. Papa Pio X)
  - Prime nozioni di catechismo — Capo I, II, III (the daily-prayers/acts block
    that the Hagan English translation omits)
  - Catechismo Maggiore — Lezione preliminare + 5 parts, each split into
    multiple "Capo" subpages

The script first fetches each Parte index page, parses out the Capo subpage
links, and walks them. We don't hardcode chapter counts so a future Wikisource
revision is picked up automatically.
"""

from __future__ import annotations

import re
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = (
    ROOT
    / "content"
    / "books"
    / "pius-x-greater-catechism"
    / "sources"
    / "it-originals"
)
BASE = "https://it.wikisource.org"
COMPENDIO = "/wiki/Compendio_della_dottrina_cristiana"

# Standalone front-matter pages — fetched directly into individual .txt files.
FRONT_MATTER: list[tuple[str, str, str]] = [
    (
        "lettera-promulgazione.txt",
        f"{COMPENDIO}/Lettera_di_S.S._Papa_Pio_X",
        "Lettera di S.S. Papa Pio X",
    ),
    (
        "prime-nozioni-capo-i.txt",
        f"{COMPENDIO}/Prime_nozioni_di_catechismo/Capo_I",
        "Prime nozioni di catechismo — Capo I (Delle verità principali di nostra santa Fede)",
    ),
    (
        "prime-nozioni-capo-ii.txt",
        f"{COMPENDIO}/Prime_nozioni_di_catechismo/Capo_II",
        "Prime nozioni di catechismo — Capo II (Parti principali della Dottrina cristiana)",
    ),
    (
        "prime-nozioni-capo-iii.txt",
        f"{COMPENDIO}/Prime_nozioni_di_catechismo/Capo_III",
        "Prime nozioni di catechismo — Capo III (Atti di Fede, di Speranza, di Carità e di Contrizione)",
    ),
    (
        "lezione-preliminare.txt",
        f"{COMPENDIO}/Catechismo_maggiore/Lezione_preliminare",
        "Catechismo Maggiore — Lezione preliminare (Della dottrina cristiana e delle sue parti principali)",
    ),
]

# Each part of the Catechismo Maggiore is an index page that links to per-Capo
# subpages. The script walks each Parte and writes one .txt per Capo.
PARTI: list[tuple[str, str, str]] = [
    ("parte-prima", "Parte_prima", "Parte I — Il Credo o Simbolo apostolico"),
    ("parte-seconda", "Parte_seconda", "Parte II — Dell'orazione"),
    (
        "parte-terza",
        "Parte_terza",
        "Parte III — Dei comandamenti di Dio e della Chiesa",
    ),
    ("parte-quarta", "Parte_quarta", "Parte IV — Dei sacramenti"),
    (
        "parte-quinta",
        "Parte_quinta",
        "Parte V — Delle virtù principali e delle altre cose necessarie a sapersi del cristiano",
    ),
]

HEADERS = {
    "User-Agent": (
        "Ember corpus importer (https://github.com/gustavo-depaula/ember) - "
        "fetching public-domain Catechismo Maggiore 1905 from it.wikisource.org"
    )
}


def fetch(url: str) -> BeautifulSoup:
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def extract_body_text(soup: BeautifulSoup) -> str:
    """Strip Wikisource chrome and return clean paragraph-flow text.

    The real content lives in `div.testi.cristianesimo`. Everything else
    (`span.metadata`, `span.numeropagina`, header/footer tables, edit links)
    is chrome and gets removed before extraction. We then walk paragraph-level
    elements one at a time and collapse their inline content with spaces so
    that `<i>`/`<b>`/`<span>` don't fragment lines.
    """
    content = soup.select_one("div.testi") or soup.select_one("div.mw-parser-output") or soup

    for sel in [
        "span.metadata",
        "span.numeropagina",
        "table",
        "div.ws-noexport",
        ".ws-noexport",
        ".noprint",
        "div.printfooter",
        "span.mw-editsection",
        "div.thumb",
        "sup.reference",
        "div#siteSub",
        "div#jump-to-nav",
        "div.mw-indicators",
        "div.mw-empty-elt",
        "style",
        "script",
    ]:
        for el in content.select(sel):
            el.decompose()

    blocks: list[str] = []
    block_tags = ["p", "div", "h1", "h2", "h3", "h4", "li", "dt", "dd", "blockquote"]
    for el in content.find_all(block_tags):
        has_block_child = any(
            d.name in block_tags for d in el.descendants if getattr(d, "name", None)
        )
        if has_block_child:
            continue
        text = el.get_text(separator=" ", strip=True)
        # Normalize whitespace runs and the leftover non-breaking spaces
        text = re.sub(r"[ \s]+", " ", text).strip()
        if not text:
            continue
        blocks.append(text)
    return "\n\n".join(blocks)


def discover_capi(parte_slug: str) -> list[tuple[str, str]]:
    """Return [(capo_slug, full_url), ...] for the Capi linked from a Parte index."""
    url = f"{BASE}{COMPENDIO}/Catechismo_maggiore/{parte_slug}"
    soup = fetch(url)
    content = soup.select_one("div.mw-parser-output") or soup
    capi: list[tuple[str, str]] = []
    seen: set[str] = set()
    prefix = f"{COMPENDIO}/Catechismo_maggiore/{parte_slug}/"
    for a in content.select("a[href]"):
        href = a["href"]
        if not href.startswith(prefix):
            continue
        # Skip in-page anchors / fragments
        clean_href = href.split("#", 1)[0]
        if clean_href in seen:
            continue
        seen.add(clean_href)
        # Slug = the bit after the last slash, e.g. "Capo_I"
        slug = clean_href.rsplit("/", 1)[-1]
        capi.append((slug, urljoin(BASE, clean_href)))
    return capi


def write_page(out_path: Path, url: str, title: str, body: str) -> None:
    header = f"=== URL: {url} ===\n=== TITLE: {title} ==="
    out_path.write_text(header + "\n\n" + body + "\n", encoding="utf-8")
    words = len(body.split())
    print(f"  → {out_path.relative_to(ROOT)}  ({words:,} words)")


def slugify_capo(parte: str, capo: str) -> str:
    # "Capo_I" → "capo-i"
    s = capo.lower().replace("_", "-")
    return f"{parte}-{s}"


def title_for_capo(parte_title: str, capo_slug: str, soup: BeautifulSoup) -> str:
    h1 = soup.select_one("h1#firstHeading")
    page_title = h1.get_text(strip=True) if h1 else capo_slug.replace("_", " ")
    return f"{parte_title} — {page_title}"


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    print("Front matter:")
    for filename, path, title in FRONT_MATTER:
        url = urljoin(BASE, path)
        print(f"  fetching {url}")
        soup = fetch(url)
        body = extract_body_text(soup)
        write_page(OUT_DIR / filename, url, title, body)
        time.sleep(0.5)

    for parte_slug, parte_path, parte_title in PARTI:
        print(f"\n{parte_title}:")
        capi = discover_capi(parte_path)
        if not capi:
            raise SystemExit(f"no Capi discovered for {parte_path}")
        for capo_slug_raw, capo_url in capi:
            soup = fetch(capo_url)
            body = extract_body_text(soup)
            filename = slugify_capo(parte_slug, capo_slug_raw) + ".txt"
            title = title_for_capo(parte_title, capo_slug_raw, soup)
            write_page(OUT_DIR / filename, capo_url, title, body)
            time.sleep(0.5)

    total = sum(1 for _ in OUT_DIR.glob("*.txt"))
    total_words = 0
    for p in OUT_DIR.glob("*.txt"):
        total_words += len(p.read_text(encoding="utf-8").split())
    print(f"\nWrote {total} files, {total_words:,} words total to {OUT_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
