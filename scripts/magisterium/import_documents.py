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
import shutil
import sys
import threading
import traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
from itertools import zip_longest
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
from names import COUNCILS, ID_TYPE_WORDS, ascii_fold, author_label, document_type, type_label  # noqa: E402
from sources import NoText, extract  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
INVENTORY = ROOT / "research" / "magisterium" / "inventory.json"
STATUS = ROOT / "research" / "magisterium" / "import-status.json"
BOOKS = ROOT / "content" / "books" / "magisterium"

COUNCIL_AUTHORS = {c[0] for c in COUNCILS}
# The app's two languages carry a region, as everywhere in the corpus; the rest stay bare ISO codes.
LANG_DIR = {"en": "en-US", "pt": "pt-BR", "zh-cn": "zh-CN", "zh-tw": "zh-TW"}
CHAPTER = "text"


def lang_dir(code: str) -> str:
    return LANG_DIR.get(code, code)


def slugify(s: str, max_words: int = 7) -> str:
    s = re.sub(r"\(.*?\)", " ", ascii_fold(s).lower())
    words = re.findall(r"[a-z0-9]+", s)
    return "-".join(words[:max_words]) or "document"


def language_order(langs: list[str]) -> list[str]:
    """Latin (the original of most of these documents) first, then the app's languages, then the rest."""
    head = [l for l in ("la", "en-US", "pt-BR") if l in langs]
    return head + sorted(l for l in langs if l not in head)


def base_id(d: dict) -> str:
    words = (d.get("slug") or slugify(d["title"], max_words=12)).split("-")
    while len(words) > 1 and words[0] in ID_TYPE_WORDS:
        words.pop(0)
    return re.sub(r"-+", "-", f"{d['author']}-{'-'.join(words[:7])}")[:90].strip("-")


def assign_ids(docs: list[dict]) -> None:
    bases = [base_id(d) for d in docs]
    seen: dict[str, int] = {}
    for base in bases:
        seen[base] = seen.get(base, 0) + 1
    used: set[str] = set()
    for d, base in zip(docs, bases, strict=True):
        bid = base
        if seen[base] > 1 and d["date"]:
            bid = f"{base}-{d['date'].replace('-', '')}"
        n = 2
        while bid in used:
            bid, n = f"{base}-{n}", n + 1
        used.add(bid)
        d["id"] = bid


def load_status(path: Path) -> dict:
    return json.loads(path.read_text()) if path.exists() else {}


def save_status(path: Path, status: dict) -> None:
    path.write_text(json.dumps(dict(sorted(status.items())), ensure_ascii=False, indent=1) + "\n")


status_lock = threading.Lock()


def import_document(d: dict, status: dict, reconvert: bool = False) -> None:
    bid = d["id"]
    book_dir = BOOKS / bid
    prev = status.get(bid, {})
    titles: dict[str, str] = dict(prev.get("titles", {}))
    imported: dict[str, str] = dict(prev.get("imported", {}))
    skipped: dict[str, str] = dict(prev.get("skipped", {}))
    for code, url in d["langs"].items():
        ld = lang_dir(code)
        if ld in imported and (book_dir / ld / f"{CHAPTER}.md").exists() and not reconvert:
            continue
        try:
            ex = extract(url, d["title"], code)
        except NoText as e:
            skipped[ld] = str(e)
            continue
        except Exception as e:  # a parser bug on one page must not stop the batch
            skipped[ld] = f"error: {type(e).__name__}: {e}"
            traceback.print_exc()
            continue
        (book_dir / ld).mkdir(parents=True, exist_ok=True)
        (book_dir / ld / f"{CHAPTER}.md").write_text(ex.markdown, encoding="utf-8")
        titles[ld] = ex.title or d["title"]
        imported[ld] = url
        skipped.pop(ld, None)
    entry = {"author": d["author"], "date": d["date"], "imported": imported, "skipped": skipped, "titles": titles,
             "inventory_title": d["title"]}
    if imported:
        langs = language_order(list(imported))
        sources = [{"language": l, "url": imported[l], "description": f"Text as published at {urlparse(imported[l]).netloc}."}
                   for l in langs]
        write_book_json(book_dir, book_meta(bid, d, {l: titles[l] for l in langs}, langs, sources))
    with status_lock:
        status[bid] = entry


def book_meta(bid: str, d: dict, name: dict[str, str], langs: list[str], sources: list[dict]) -> dict:
    """book.json of a single-chapter document; `d` is its inventory row."""
    kind = document_type(d.get("type"), d["title"])
    year = (d["date"] or "")[:4].lstrip("0") or None
    author = author_label(d["author"])
    return {
        "id": bid,
        "cover": "quarter",
        "name": name,
        "author": author,
        "description": {l: " · ".join(x for x in [type_label(kind, l), author[l], d["date"] or ""] if x)
                        for l in ("en-US", "pt-BR")},
        **({"composed": year} if year else {}),
        "languages": langs,
        "tags": ["magisterium", kind, d["author"]],
        "sources": sources,
        "toc": [{"id": CHAPTER, "title": name}],
    }


def write_book_json(book_dir: Path, meta: dict) -> None:
    (book_dir / "book.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def round_robin_by_host(docs: list[dict]) -> list[dict]:
    """Interleave documents by the host of their first source, so the workers don't
    all queue behind vatican.va's crawl delay while the other hosts sit idle."""
    queues: dict[str, list[dict]] = {}
    for d in docs:
        queues.setdefault(urlparse(next(iter(d["langs"].values()))).netloc, []).append(d)
    return [d for batch in zip_longest(*queues.values()) for d in batch if d is not None]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int)
    ap.add_argument("--only", nargs="*", help="book ids or inventory authors")
    ap.add_argument("--host", help="only fetch URLs on this host (others keep their previous state)")
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--reconvert", action="store_true",
                    help="rebuild every chapter from the fetch cache (after a converter fix)")
    ap.add_argument("--prune", action="store_true",
                    help="delete books the current inventory no longer produces (after an inventory change)")
    args = ap.parse_args()

    docs = [d for d in json.loads(INVENTORY.read_text())
            if d["status"] == "include" and d["langs"] and d["author"] not in COUNCIL_AUTHORS]
    assign_ids(docs)
    if args.prune:
        expected = {d["id"] for d in docs}
        # Councils and Denzinger recoveries come from their own importers.
        recovered = ROOT / "research" / "magisterium" / "denzinger-recovered.json"
        if recovered.exists():
            expected |= {r["book"] for r in json.loads(recovered.read_text()).values() if r.get("found")}
        expected |= {p.name for p in BOOKS.glob("council-*")}
        status = load_status(STATUS)
        for book_dir in sorted(BOOKS.iterdir()):
            if book_dir.is_dir() and book_dir.name not in expected:
                shutil.rmtree(book_dir)
                status.pop(book_dir.name, None)
                print(f"pruned {book_dir.name}")
        for bid in [b for b in status if b not in expected]:
            status.pop(bid)
        save_status(STATUS, status)
        return
    if args.only:
        docs = [d for d in docs if d["id"] in args.only or d["author"] in args.only]
    if args.host:
        for d in docs:
            d["langs"] = {k: v for k, v in d["langs"].items() if urlparse(v).netloc == args.host}
        docs = [d for d in docs if d["langs"]]
    if args.limit:
        docs = docs[: args.limit]

    status = load_status(STATUS)
    done = 0

    def save() -> None:
        with status_lock:
            save_status(STATUS, status)

    with ThreadPoolExecutor(args.workers) as ex:
        futures = [ex.submit(import_document, d, status, args.reconvert) for d in round_robin_by_host(docs)]
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
