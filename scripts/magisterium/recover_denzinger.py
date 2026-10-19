#!/usr/bin/env python3
"""Find the full text of Denzinger-cited documents inside DCO's collected volumes.

262 documents Denzinger excerpts have no text of their own in any surveyed
source, but many sit inside a pope's collected letters (Migne's "Epistolae et
decreta", Innocent III's Regesta) that DCO publishes as one file. For each such
document with a known incipit, search the pope's Latin files for the incipit,
cut the letter out between the headings around it, and import it as its own
Latin book.

    uv run --with olefile --with beautifulsoup4 --with lxml python scripts/magisterium/recover_denzinger.py

Writes research/magisterium/denzinger-recovered.json: per document, the volume
it was found in, or why not.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "research" / "magisterium"))
from build_inventory import pope_id  # noqa: E402
from import_documents import BOOKS, book_meta, slugify, write_book_json  # noqa: E402
from names import ascii_fold  # noqa: E402
from sources import CACHE, UA, NoText, fetch, paras_to_markdown, pdf_paragraphs, temp_file  # noqa: E402
from worddoc import read_doc  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SURVEY = ROOT / "research" / "magisterium"
OUT = SURVEY / "denzinger-recovered.json"
# A Migne volume can be 100 MB of scanned pages; past this a file isn't worth fetching to search.
MAX_PDF_BYTES = 60_000_000
LETTERISH = re.compile(r"(epistol|epistul|regest|decret|litter|bull|constitut|privileg|documenta|acta|registr|opera)", re.I)
# A new letter in a Migne-style volume starts with a heading paragraph like these.
HEADING = re.compile(
    r"^\W*(EPISTOLA|EPISTULA|EPIST\.|DECRETUM|DECRETALIS|DECRETALES|PRIVILEGIUM|BULLA|CONSTITUTIO|"
    r"CAPITULA|RESCRIPTUM|LITTERAE|SERMO|CAPUT|DIPLOMA|[IVXLC]+\.\s+[A-Z]{3,})\b",
)


def fold(s: str) -> str:
    """Latin spelling folded so incipits match across editions: æ→ae, j→i, v→u, case and accents gone."""
    s = ascii_fold(s).lower().replace("j", "i").replace("v", "u")
    return re.sub(r"[^a-z]+", " ", s).strip()


def cached(url: str) -> bool:
    key = hashlib.sha1(url.encode()).hexdigest()
    return (CACHE / key[:2] / key).exists()


def size_of(url: str) -> int | None:
    try:
        req = urllib.request.Request(url.replace(" ", "%20"), method="HEAD", headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            return int(r.headers.get("Content-Length") or 0) or None
    except Exception:
        return None


def paragraphs_of(url: str, fmt: str) -> list[str]:
    data = fetch(url)
    if fmt != "doc":
        return pdf_paragraphs(data)
    with temp_file(data, ".doc") as path:
        paras, _ = read_doc(path)
    return [p.strip() for p in paras if p.strip()]


def find_letter(paras: list[str], folded: list[str], incipit: str) -> list[str] | None:
    """`folded` is `paras` through fold()."""
    key = fold(incipit)
    if len(key) < 8:
        return None
    hit = next((i for i, f in enumerate(folded) if key in f), None)
    if hit is None:
        return None
    start = next((i for i in range(hit, max(hit - 6, -1), -1) if HEADING.match(paras[i])), hit)
    last = min(len(paras), hit + 400)
    end = next((j for j in range(hit + 1, last) if HEADING.match(paras[j])), last)
    letter = paras[start:end]
    return letter if sum(len(p) for p in letter) > 200 else None


def main() -> None:
    inv = json.loads((SURVEY / "inventory.json").read_text())
    wanted = [x for x in inv if not x["langs"] and x["status"] == "include" and re.search(r"'[^']+'", x["title"])]
    dco = json.loads((SURVEY / "dco.json").read_text())["docs"]
    files_by_author: dict[str, list[tuple[str, str, str]]] = {}
    for d in dco:
        author = pope_id(d.get("author") or "") or pope_id(d["issuer"])
        for f in sorted(d["files"], key=lambda f: f["format"] != "doc"):
            if f["format"] in ("doc", "pdf") and any(l in ("LT", "MLT") for l in f["langs"]):
                if f["format"] == "pdf" and not LETTERISH.search(d["title"]):
                    continue
                files_by_author.setdefault(author, []).append((d["title"], f["format"], f["file_url"]))

    results: dict[str, dict] = {}
    texts: dict[str, tuple[list[str], list[str]]] = {}  # url → (paragraphs, folded)
    for row in wanted:
        incipit = re.search(r"'([^']+)'", row["title"]).group(1)
        key = f"{row['author']}:{incipit}"
        found = None
        for title, fmt, url in files_by_author.get(row["author"], []):
            if url not in texts:
                if fmt == "pdf" and not cached(url) and (size_of(url) or 0) > MAX_PDF_BYTES:
                    texts[url] = ([], [])
                    continue
                try:
                    paras = paragraphs_of(url, fmt)
                except (NoText, ValueError, OSError, RuntimeError) as e:
                    print(f"  unreadable {url}: {e}")
                    paras = []
                texts[url] = (paras, [fold(p) for p in paras])
            letter = find_letter(*texts[url], incipit)
            if letter:
                found = (title, url, letter)
                break
        if not found:
            results[key] = {"title": row["title"], "found": False,
                            "searched": len(files_by_author.get(row["author"], []))}
            continue
        title, url, letter = found
        bid = f"{row['author']}-{slugify(incipit)}"
        book_dir = BOOKS / bid
        (book_dir / "la").mkdir(parents=True, exist_ok=True)
        (book_dir / "la" / "text.md").write_text(paras_to_markdown(incipit, letter), encoding="utf-8")
        sources = [{"language": "la", "url": url,
                    "description": f"Cut from “{title}”, Documenta Catholica Omnia, between the headings around the incipit."}]
        write_book_json(book_dir, book_meta(bid, row, {"la": incipit}, ["la"], sources))
        results[key] = {"title": row["title"], "found": True, "book": bid, "volume": title, "url": url,
                        "paragraphs": len(letter), "date": row["date"], "author": row["author"], "ds": row.get("ds", [])}
        print(f"found {bid} in {title} ({len(letter)} paragraphs)")
    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=1) + "\n")
    print(f"{sum(r['found'] for r in results.values())} of {len(results)} recovered")


if __name__ == "__main__":
    main()
