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
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from import_documents import BOOKS, lang_dir, language_order  # noqa: E402
from sources import NoText, check_script, extract  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SURVEY = ROOT / "research" / "magisterium"
# Separate from import-status.json, which a running document import rewrites from memory.
STATUS = SURVEY / "council-status.json"

# id, Tanner page, DCO council name, Veritatis category stem, en/pt/la names, opening year
COUNCILS = [
    ("nicaea-i", "ecum01", "Nicaenum I", "Niceia I", ("First Council of Nicaea", "Primeiro Concílio de Niceia", "Concilium Nicaenum I"), "325"),
    ("constantinople-i", "ecum02", "Constantinopolitanum I", "Constantinopla I", ("First Council of Constantinople", "Primeiro Concílio de Constantinopla", "Concilium Constantinopolitanum I"), "381"),
    ("ephesus", "ecum03", "Ephesenum", None, ("Council of Ephesus", "Concílio de Éfeso", "Concilium Ephesenum"), "431"),
    ("chalcedon", "ecum04", "Chalcedonense", None, ("Council of Chalcedon", "Concílio de Calcedônia", "Concilium Chalcedonense"), "451"),
    ("constantinople-ii", "ecum05", "Constantinopolitanum II", None, ("Second Council of Constantinople", "Segundo Concílio de Constantinopla", "Concilium Constantinopolitanum II"), "553"),
    ("constantinople-iii", "ecum06", "Constantinopolitanum III", None, ("Third Council of Constantinople", "Terceiro Concílio de Constantinopla", "Concilium Constantinopolitanum III"), "680"),
    ("nicaea-ii", "ecum07", "Nicaenum II", None, ("Second Council of Nicaea", "Segundo Concílio de Niceia", "Concilium Nicaenum II"), "787"),
    ("constantinople-iv", "ecum08", "Constantinopolitanum IV", None, ("Fourth Council of Constantinople", "Quarto Concílio de Constantinopla", "Concilium Constantinopolitanum IV"), "869"),
    ("lateran-i", "ecum09", "Lateranum I", None, ("First Lateran Council", "Primeiro Concílio de Latrão", "Concilium Lateranense I"), "1123"),
    ("lateran-ii", "ecum10", "Lateranum II", None, ("Second Lateran Council", "Segundo Concílio de Latrão", "Concilium Lateranense II"), "1139"),
    ("lateran-iii", "ecum11", "Lateranum III", None, ("Third Lateran Council", "Terceiro Concílio de Latrão", "Concilium Lateranense III"), "1179"),
    ("lateran-iv", "ecum12-2", "Lateranum IIII", None, ("Fourth Lateran Council", "Quarto Concílio de Latrão", "Concilium Lateranense IV"), "1215"),
    ("lyon-i", "ecum13", "Lugdunense I", None, ("First Council of Lyon", "Primeiro Concílio de Lyon", "Concilium Lugdunense I"), "1245"),
    ("lyon-ii", "ecum14", "Lugdunense II", None, ("Second Council of Lyon", "Segundo Concílio de Lyon", "Concilium Lugdunense II"), "1274"),
    ("vienne", "ecum15", "Viennense", None, ("Council of Vienne", "Concílio de Vienne", "Concilium Viennense"), "1311"),
    ("constance", "ecum16", "Constantiense", None, ("Council of Constance", "Concílio de Constança", "Concilium Constantiense"), "1414"),
    ("florence", "ecum17", "Basiliense", None, ("Council of Basel-Ferrara-Florence", "Concílio de Basileia-Ferrara-Florença", "Concilium Basiliense-Ferrariense-Florentinum"), "1431"),
    ("lateran-v", "ecum18", "Lateranum V", None, ("Fifth Lateran Council", "Quinto Concílio de Latrão", "Concilium Lateranense V"), "1512"),
    ("trent", "trent", "Tridentinum", "Trento", ("Council of Trent", "Concílio de Trento", "Concilium Tridentinum"), "1545"),
    ("vatican-i", "ecum20", "Vaticanum I", "Vaticano I", ("First Vatican Council", "Concílio Vaticano I", "Concilium Vaticanum I"), "1869"),
]
TRENT_ORDER = [
    "ctbull", "firstsession", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth",
    "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth",
    "nineteenth", "twentieth", "twenty-first", "twenty-second", "twenty-third", "twenty-fourth", "twenty-fifth",
]
DCO_LANG = {"LT": "la", "MLT": "la", "GR": "grc", "MGR": "grc", "GE": "de", "SP": "es"}
# DCO's English is the NPNF commentary edition, not Tanner's text of the decrees; Tanner wins.
DCO_SKIP_LANGS = {"en"}
# Vatican I's Latin is on vatican.va; DCO has only commentary for it.
EXTRA = {"vatican-i": [
    ("la", "Constitutio dogmatica Dei Filius", "https://www.vatican.va/archive/hist_councils/i-vatican-council/documents/vat-i_const_18700424_dei-filius_la.html"),
    ("it", "Costituzione dogmatica Dei Filius", "https://www.vatican.va/archive/hist_councils/i-vatican-council/documents/vat-i_const_18700424_dei-filius_it.html"),
]}


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s.lower()).strip()


def pieces(council: tuple) -> dict[str, list[tuple[str, str]]]:
    """lang → [(fallback title, url)] in reading order."""
    cid, tanner, dco_name, ver_name, _, _ = council
    out: dict[str, list[tuple[str, str]]] = {}
    pe = json.loads((SURVEY / "papalencyclicals.json").read_text())
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

    dco = json.loads((SURVEY / "dco.json").read_text())["docs"]
    for d in dco:
        if d["issuer_kind"] != "council":
            continue
        issuer = norm(d["issuer"].replace("Concilium", ""))
        # Exact name: "Constantinopolitanum I" must not take the files of II–IV.
        # Basel's issuer carries its later sessions' cities in parentheses.
        if issuer != norm(dco_name) and not (dco_name == "Basiliense" and issuer.startswith("basiliense")):
            continue
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
        ver = json.loads((SURVEY / "veritatis.json").read_text())
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
                ex = extract(url, fallback)
                check_script(code, ex)
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
    status = json.loads(STATUS.read_text()) if STATUS.exists() else {}
    for council in COUNCILS:
        if only and council[0] not in only:
            continue
        import_council(council, status)
    STATUS.write_text(json.dumps(dict(sorted(status.items())), ensure_ascii=False, indent=1) + "\n")


if __name__ == "__main__":
    main()
