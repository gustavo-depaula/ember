#!/usr/bin/env python3
"""Import the magisterial documents in research/magisterium/inventory.json as books.

One book per document under content/books/magisterium/<id>/, one Markdown
chapter per language (every language a source carries). Only rows marked
"include" that have a text source are imported; councils have their own
importer (import_councils.py).

    uv run --with olefile --with beautifulsoup4 python scripts/magisterium/import_documents.py [--limit N] [--only ID ...] [--host HOST]

Writes research/magisterium/import-status.json: per document, the book id and
the languages imported or skipped (with the reason), so a rerun only fetches
what is missing and the gaps stay visible.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import threading
import traceback
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
from names import author_label, document_type, type_label  # noqa: E402
from sources import NoText, extract  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
INVENTORY = ROOT / "research" / "magisterium" / "inventory.json"
STATUS = ROOT / "research" / "magisterium" / "import-status.json"
BOOKS = ROOT / "content" / "books" / "magisterium"

COUNCIL_AUTHORS = {
    "nicaea-i", "constantinople-i", "ephesus", "chalcedon", "constantinople-ii", "constantinople-iii",
    "nicaea-ii", "constantinople-iv", "lateran-i", "lateran-ii", "lateran-iii", "lateran-iv", "lyon-i",
    "lyon-ii", "vienne", "constance", "florence", "lateran-v", "trent", "vatican-i",
}
# The app's two languages carry a region, as everywhere in the corpus; the rest stay bare ISO codes.
LANG_DIR = {"en": "en-US", "pt": "pt-BR", "zh-cn": "zh-CN", "zh-tw": "zh-TW", "zh_cn": "zh-CN", "zh_tw": "zh-TW"}


def lang_dir(code: str) -> str:
    return LANG_DIR.get(code, code)


def slugify(s: str, max_words: int = 7) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"\(.*?\)", " ", s)
    words = re.findall(r"[a-z0-9]+", s)
    return "-".join(words[:max_words]) or "document"


# Leading genre words in a title or filename ("Enciclica Qui pluribus", "Epistola ad …").
TYPE_WORDS = {
    "enciclica", "encyclica", "encyclical", "encyclicae", "lettera", "apostolica", "apostolic", "letter", "letters",
    "esortazione", "exhortation", "costituzione", "constitutio", "constitution", "motu", "proprio", "bolla", "bulla",
    "bull", "breve", "brief", "epistola", "epistula", "allocuzione", "allocutio", "decreto", "decretum", "editto",
    "litterae", "apostolicae", "dogmatica", "carta", "ap", "chirografo", "littera", "the", "a", "an",
}


def language_order(langs: list[str]) -> list[str]:
    """Latin (the original of most of these documents) first, then the app's languages, then the rest."""
    head = [l for l in ("la", "en-US", "pt-BR") if l in langs]
    return head + sorted(l for l in langs if l not in head)


def assign_ids(docs: list[dict]) -> None:
    seen: dict[str, int] = {}
    for d in docs:
        slug = d.get("slug") or slugify(d["title"], max_words=12)
        words = slug.split("-")
        while len(words) > 1 and words[0] in TYPE_WORDS:
            words.pop(0)
        base = f"{d['author']}-{'-'.join(words[:7])}"
        base = re.sub(r"-+", "-", base)[:90].strip("-")
        d["_base"] = base
        seen[base] = seen.get(base, 0) + 1
    used: set[str] = set()
    for d in docs:
        bid = d["_base"]
        if seen[bid] > 1 and d["date"]:
            bid = f"{bid}-{d['date'].replace('-', '')}"
        n = 2
        while bid in used:
            bid, n = f"{d['_base']}-{n}", n + 1
        used.add(bid)
        d["id"] = bid


status_lock = threading.Lock()


def import_document(d: dict, status: dict) -> None:
    bid = d["id"]
    book_dir = BOOKS / bid
    chapter = "text"
    prev = status.get(bid, {})
    titles: dict[str, str] = dict(prev.get("titles", {}))
    imported: dict[str, str] = dict(prev.get("imported", {}))
    skipped: dict[str, str] = dict(prev.get("skipped", {}))
    for code, url in d["langs"].items():
        ld = lang_dir(code)
        if ld in imported and (book_dir / ld / f"{chapter}.md").exists():
            continue
        try:
            ex = extract(url, d["title"])
        except NoText as e:
            skipped[ld] = str(e)
            continue
        except Exception as e:  # a parser bug on one page must not stop the batch
            skipped[ld] = f"error: {type(e).__name__}: {e}"
            traceback.print_exc()
            continue
        (book_dir / ld).mkdir(parents=True, exist_ok=True)
        (book_dir / ld / f"{chapter}.md").write_text(ex.markdown, encoding="utf-8")
        titles[ld] = ex.title or d["title"]
        imported[ld] = url
        skipped.pop(ld, None)
    entry = {"author": d["author"], "date": d["date"], "imported": imported, "skipped": skipped, "titles": titles,
             "inventory_title": d["title"]}
    if imported:
        write_book_json(d, bid, book_dir, chapter, titles, imported)
    with status_lock:
        status[bid] = entry


def write_book_json(d: dict, bid: str, book_dir: Path, chapter: str, titles: dict, imported: dict) -> None:
    langs = language_order(list(imported))
    kind = document_type(d.get("type"), d["title"])
    year = (d["date"] or "")[:4].lstrip("0") or None
    name = {l: titles[l] for l in langs}
    author = author_label(d["author"])
    description = {
        "en-US": " · ".join(x for x in [type_label(kind, "en-US"), author["en-US"], d["date"] or ""] if x),
        "pt-BR": " · ".join(x for x in [type_label(kind, "pt-BR"), author["pt-BR"], d["date"] or ""] if x),
    }
    meta = {
        "id": bid,
        "cover": "quarter",
        "name": name,
        "author": author,
        "description": description,
        **({"composed": year} if year else {}),
        "languages": langs,
        "tags": ["magisterium", kind, d["author"]],
        "sources": [
            {"language": l, "url": imported[l], "description": f"Text as published at {urlparse(imported[l]).netloc}."}
            for l in langs
        ],
        "toc": [{"id": chapter, "title": name}],
    }
    (book_dir / "book.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int)
    ap.add_argument("--only", nargs="*", help="book ids or inventory authors")
    ap.add_argument("--host", help="only fetch URLs on this host (others keep their previous state)")
    ap.add_argument("--workers", type=int, default=8)
    args = ap.parse_args()

    docs = [d for d in json.loads(INVENTORY.read_text())
            if d["status"] == "include" and d["langs"] and d["author"] not in COUNCIL_AUTHORS]
    assign_ids(docs)
    if args.only:
        docs = [d for d in docs if d["id"] in args.only or d["author"] in args.only]
    if args.host:
        for d in docs:
            d["langs"] = {k: v for k, v in d["langs"].items() if urlparse(v).netloc == args.host}
        docs = [d for d in docs if d["langs"]]
    if args.limit:
        docs = docs[: args.limit]

    status = json.loads(STATUS.read_text()) if STATUS.exists() else {}
    done = 0

    def save() -> None:
        with status_lock:
            STATUS.write_text(json.dumps(dict(sorted(status.items())), ensure_ascii=False, indent=1) + "\n")

    with ThreadPoolExecutor(args.workers) as ex:
        futures = {ex.submit(import_document, d, status): d for d in docs}
        for f in as_completed(futures):
            f.result()
            done += 1
            if done % 25 == 0:
                save()
                print(f"[{done}/{len(docs)}]", flush=True)
    save()
    imported = sum(1 for s in status.values() if s["imported"])
    print(f"done: {done} processed; {imported} books with text; status in {STATUS.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
