#!/usr/bin/env python3
"""Import the ecumenical councils, Nicaea I to Vatican I, one book per council.

A council's acts come in pieces that differ by source: Tanner's English is one
page per council on papalencyclicals.net (Trent: one per session), the Latin and
Greek come as several files per council from Documenta Catholica Omnia, and the
Portuguese as a handful of Veritatis posts. Each piece becomes a chapter of its
language, so a language's table of contents follows its own source's divisions.
Vatican II is imported document by document with the papal documents.

    uv run --with olefile --with beautifulsoup4 --with lxml python scripts/magisterium/import_councils.py
"""
from __future__ import annotations

import json
import re
import sys
from functools import cache
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from import_documents import BOOKS, lang_dir, language_order, load_status, save_status  # noqa: E402
from names import COUNCILS, DCO_LANG, dco_council  # noqa: E402
from sources import NoText, extract  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SURVEY = ROOT / "research" / "magisterium"
# Separate from import-status.json, which a running document import rewrites from memory.
STATUS = SURVEY / "council-status.json"

TRENT_ORDER = [
    "ctbull", "firstsession", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth",
    "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth",
    "nineteenth", "twentieth", "twenty-first", "twenty-second", "twenty-third", "twenty-fourth", "twenty-fifth",
]
# DCO's English is the NPNF commentary edition, not Tanner's text of the decrees; Tanner wins.
DCO_SKIP_LANGS = {"en"}
# Vatican I's Latin is on vatican.va; DCO has only commentary for it.
EXTRA = {"vatican-i": [
    ("la", "Constitutio dogmatica Dei Filius", "https://www.vatican.va/archive/hist_councils/i-vatican-council/documents/vat-i_const_18700424_dei-filius_la.html"),
    ("it", "Costituzione dogmatica Dei Filius", "https://www.vatican.va/archive/hist_councils/i-vatican-council/documents/vat-i_const_18700424_dei-filius_it.html"),
]}


@cache
def survey(name: str):
    return json.loads((SURVEY / name).read_text())


@cache
def dco_council_docs() -> dict[str, list[dict]]:
    """DCO's documents of each council, by council id."""
    out: dict[str, list[dict]] = {}
    for d in survey("dco.json")["docs"]:
        if d["issuer_kind"] == "council" and (cid := dco_council(d["issuer"])):
            out.setdefault(cid, []).append(d)
    return out


def pieces(council: tuple) -> dict[str, list[tuple[str, str]]]:
    """lang → [(fallback title, url)] in reading order."""
    cid, tanner, _, ver_name, _, _ = council
    out: dict[str, list[tuple[str, str]]] = {}
    pe = survey("papalencyclicals.json")
    if cid == "trent":
        posts = {p["url"].rstrip("/").rsplit("/", 1)[-1].removesuffix(".htm"): p for p in pe if "/councils/trent/" in p["url"]}
        for key in TRENT_ORDER:
            hit = next((p for slug, p in posts.items() if slug.startswith(key)), None)
            if hit:
                out.setdefault("en", []).append((hit["title"], hit["url"]))
    else:
        hit = next((p for p in pe if p["url"].rstrip("/").endswith(f"/councils/{tanner}.htm")), None)
        if hit:
            out.setdefault("en", []).append((hit["title"], hit["url"]))

    for d in dco_council_docs().get(cid, []):
        # One file per document and language: DCO often has the same text as .doc and
        # .pdf (the .doc reads cleaner), and a file tagged with several languages is
        # filed under the first, since one text cannot be two editions.
        chosen: dict[str, str] = {}
        for f in sorted(d["files"], key=lambda f: f["format"] != "doc"):
            if f["format"] not in ("doc", "pdf") or not f["langs"]:
                continue
            lang = DCO_LANG.get(f["langs"][0], f["langs"][0].lower())
            if lang not in DCO_SKIP_LANGS:
                chosen.setdefault(lang, f["file_url"] or f["wrapper_url"])
        for lang, url in chosen.items():
            if url not in [u for _, u in out.get(lang, [])]:
                out.setdefault(lang, []).append((d["title"], url))

    if ver_name:
        ver = survey("veritatis.json")
        # "Vaticano I" must not match "Vaticano II".
        posts = [p for p in ver if any(c.startswith("Concílio") and re.search(rf"\b{re.escape(ver_name)}\b(?!I)", c)
                                       for c in p["categories"])]
        posts = [p for p in posts if "indice" not in p["url"] and "índice" not in p["title"].lower()]
        posts.sort(key=lambda p: (int(m.group(1)) if (m := re.search(r"parte-(\d+)", p["url"])) else 0, p["url"]))
        for p in posts:
            out.setdefault("pt", []).append((p["title"], p["url"]))

    for lang, title, url in EXTRA.get(cid, []):
        out.setdefault(lang, []).append((title, url))
    return out


def import_council(council: tuple, status: dict) -> None:
    cid, _, _, _, names, year = council
    bid = f"council-{cid}"
    book_dir = BOOKS / bid
    toc: list[dict] = []
    imported: dict[str, list[str]] = {}
    skipped: dict[str, str] = {}
    for code, items in pieces(council).items():
        ld = lang_dir(code)
        n = 0
        for fallback, url in items:
            try:
                ex = extract(url, fallback, code)
            except NoText as e:
                skipped[url] = str(e)
                continue
            n += 1
            chap = f"{ld}-{n:02d}"
            (book_dir / ld).mkdir(parents=True, exist_ok=True)
            (book_dir / ld / f"{chap}.md").write_text(ex.markdown, encoding="utf-8")
            toc.append({"id": chap, "title": {ld: ex.title or fallback}})
            imported.setdefault(ld, []).append(url)
    if not imported:
        print(f"{bid}: no text")
        return
    langs = language_order(list(imported))
    order = {l: i for i, l in enumerate(langs)}
    toc.sort(key=lambda node: (order[next(iter(node["title"]))], node["id"]))
    name = {"en-US": names[0], "pt-BR": names[1], "la": names[2]}
    meta = {
        "id": bid,
        "cover": "quarter",
        "name": name,
        "author": name,
        "description": {
            "en-US": f"Ecumenical council · {year}. Decrees, canons and acts in every language available.",
            "pt-BR": f"Concílio ecumênico · {year}. Decretos, cânones e atas em todas as línguas disponíveis.",
        },
        "composed": year,
        "languages": langs,
        "tags": ["magisterium", "council", cid],
        "sources": [
            {"language": l, "url": u, "description": "Conciliar text as published at this address."}
            for l in langs for u in imported[l]
        ],
        "toc": toc,
    }
    (book_dir / "book.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    status[bid] = {"author": cid, "date": year, "imported": {l: imported[l][0] for l in imported},
                   "chapters": {l: len(imported[l]) for l in imported}, "skipped": skipped, "titles": name,
                   "inventory_title": names[0]}
    print(f"{bid}: " + ", ".join(f"{l}×{len(imported[l])}" for l in langs) + (f"; {len(skipped)} skipped" if skipped else ""))


def main() -> None:
    only = set(sys.argv[1:])
    status = load_status(STATUS)
    for council in COUNCILS:
        if only and council[0] not in only:
            continue
        import_council(council, status)
    save_status(STATUS, status)


if __name__ == "__main__":
    main()
