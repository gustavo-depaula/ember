#!/usr/bin/env python3
"""Inventory Documenta Catholica Omnia's papal and conciliar documents.

Walks the per-pope pages (listed by 01_01_Magisterium_Paparum.html and the
alphabetical master list) and the ecumenical-council pages, and records every
document wrapper link. DCO encodes everything in the wrapper's filename:

    04z/z_<date>__<author>__<title>__<LANGS>.<ext>.html

The wrapper points at the real file ../<dir>/<date>,_<author>,_<title>,_<LANGS>.<ext>,
where <dir> is not in the filename (01p for popes, 03d for councils, …). We fetch
a few wrappers per source page to learn its <dir>, then derive the rest; a
derived URL is marked `file_url_verified: false`.

Links naming the same work in several languages are grouped into one record.

    python3 research/magisterium/survey_dco.py   → dco.json

DCO only answers over http; https fails. Pages are ISO-8859-1.
"""
from __future__ import annotations

import json
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from bs4 import BeautifulSoup

HERE = Path(__file__).resolve().parent
CACHE = HERE / "_cache" / "dco"
BASE = "http://www.documentacatholicaomnia.eu/"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
WRAPPER_SAMPLES = 3  # wrappers fetched per source page to learn its file dir

WRAPPER_RE = re.compile(r"^04z/z_(?P<date>.*?)__(?P<author>.*?)__(?P<title>.*)__(?P<langs>[A-Z]{2,3}(?:_[A-Z]{2,3})*)\.(?P<ext>\w+)\.html$")
PAGE_RE = re.compile(r"^01_(?P<sec>01|10)_(?P<y1>\d{4})-(?:(?P<y2>\d{4})-)?_(?P<name>.+)\.html$")


def fetch(path: str) -> str | None:
    f = CACHE / re.sub(r"[/\\]", "__", path)
    if f.exists():
        t = f.read_text(encoding="utf-8")
        return t or None
    url = BASE + urllib.parse.quote(path, safe="/,'()-_.[]")
    t = ""
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                t = r.read().decode("iso-8859-1")
            break
        except urllib.error.HTTPError as e:
            if e.code == 404:
                break
            time.sleep(2**attempt)
        except Exception:
            time.sleep(2**attempt)
    else:
        raise RuntimeError(f"fetch failed: {url}")
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(t, encoding="utf-8")
    return t or None


def links(html: str) -> list[tuple[str, str]]:
    soup = BeautifulSoup(html, "html.parser")
    return [(a["href"].strip(), a.get_text(" ", strip=True)) for a in soup.find_all("a", href=True)]


def parse_date(raw: str) -> dict:
    """'1745-11-01', '0251-0253', '1985-11.17', '2005-hodie' → {start, end, exact}."""
    norm = re.sub(r"[._]", "-", raw).replace("--", "-").rstrip("-")
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})$", norm)
    if m:
        d = f"{m[1]}-{m[2]}-{m[3]}"
        return {"start": d, "end": d, "exact": True}
    m = re.match(r"^(\d{4})-(\d{4}|hodie)$", norm)
    if m:
        return {"start": m[1], "end": m[2], "exact": False}
    m = re.match(r"^(\d{4})", norm)
    return {"start": m[1] if m else None, "end": None, "exact": False}


def norm_title(t: str) -> str:
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]", "", t)


def split_part(title: str) -> tuple[str, str | None]:
    m = re.match(r"^(.*?)_?\[(\w+)\]$", title)
    return (m[1], m[2]) if m else (title, None)


def main() -> None:
    # 1. source pages
    master = fetch("a_1050_Sanctorum_Paparum_Conspectus_Alphabeticus.html")
    popes_idx = fetch("01_01_Magisterium_Paparum.html") or ""
    councils_idx = fetch("01_10_Concilia_Oecumenica.html")
    pages: dict[str, str] = {}
    for h, _ in links(master) + links(popes_idx):
        # The master list links Pius IX twice, once as "….html.html", which 404s.
        if h.startswith("01_01_") and PAGE_RE.match(h) and not h.endswith(".html.html"):
            pages[h] = "pope"
    for h, _ in links(councils_idx):
        if h.startswith("01_10_") and h != "01_10_Concilia_Oecumenica.html":
            pages[h] = "council"
    print(f"{sum(v == 'pope' for v in pages.values())} pope pages, {sum(v == 'council' for v in pages.values())} council pages")

    with ThreadPoolExecutor(4) as ex:
        htmls = dict(zip(pages, ex.map(fetch, pages)))

    # 2. wrapper links per page; the alphabetical master is a cross-check
    raw: list[dict] = []
    unparsed: list[str] = []
    for page, kind in pages.items():
        html = htmls[page]
        if not html:
            print("empty page", page)
            continue
        m = PAGE_RE.match(page)
        issuer = m["name"].replace("_", " ") if m else page
        span = [m["y1"], m["y2"]] if m else None
        seen = set()
        for h, text in links(html):
            if not h.startswith("04z/") or h in seen:
                continue
            seen.add(h)
            w = WRAPPER_RE.match(h)
            if not w:
                unparsed.append(h)
                continue
            title, part = split_part(w["title"])
            raw.append({
                "page": page, "kind": kind, "issuer": issuer, "issuer_years": span,
                "date_raw": w["date"], "author": w["author"].replace("_", " "),
                "title": title.replace("_", " "), "part": part, "link_text": text,
                "langs": w["langs"].split("_"), "format": w["ext"], "wrapper": h,
            })
    # Some wrappers appear only in the alphabetical master list; attribute them to the
    # pope heading (a 01_01_ link) that precedes them there.
    page_wrappers = {r["wrapper"] for r in raw} | set(unparsed)
    master_links = links(master)
    current = None
    only_master = []
    for h, text in master_links:
        if h.startswith("01_01_") and PAGE_RE.match(h):
            current = h.replace(".html.html", ".html")
            continue
        if not h.startswith("04z/") or h in page_wrappers or not current:
            continue
        page_wrappers.add(h)
        w = WRAPPER_RE.match(h)
        if not w:
            unparsed.append(h)
            continue
        only_master.append(h)
        m = PAGE_RE.match(current)
        title, part = split_part(w["title"])
        raw.append({
            "page": current, "kind": "pope", "issuer": m["name"].replace("_", " "), "issuer_years": [m["y1"], m["y2"]],
            "date_raw": w["date"], "author": w["author"].replace("_", " "),
            "title": title.replace("_", " "), "part": part, "link_text": text,
            "langs": w["langs"].split("_"), "format": w["ext"], "wrapper": h,
        })
    print(f"{len(raw)} wrapper links ({len(only_master)} found only in the master list, {len(unparsed)} unparsed)")

    # 3. learn each page's file dir from a few wrappers
    by_page = defaultdict(list)
    for r in raw:
        by_page[r["page"]].append(r)
    samples = [r for rs in by_page.values() for r in rs[:WRAPPER_SAMPLES]]
    with ThreadPoolExecutor(4) as ex:
        wr = list(ex.map(lambda r: fetch(r["wrapper"]), samples))
    page_dirs: dict[str, Counter] = defaultdict(Counter)
    verified: dict[str, str] = {}
    for r, html in zip(samples, wr):
        for h, _ in links(html or ""):
            mm = re.match(r"^\.\./(\w+)/(.+)$", h)
            if mm and not h.endswith(".html"):
                page_dirs[r["page"]][mm[1]] += 1
                verified[r["wrapper"]] = BASE + h[3:]
                break
    global_dir = Counter(d for c in page_dirs.values() for d in c.elements())
    mixed = {p: dict(c) for p, c in page_dirs.items() if len(c) > 1}
    print("file dirs:", dict(global_dir), "pages with mixed dirs:", len(mixed))

    for r in raw:
        if r["wrapper"] in verified:
            r["file_url"], r["file_url_verified"] = verified[r["wrapper"]], True
            continue
        c = page_dirs.get(r["page"])
        d = (c or global_dir).most_common(1)[0][0] if (c or global_dir) else "01p"
        stem = r["wrapper"][len("04z/z_"):-len(".html")]
        r["file_url"] = BASE + d + "/" + stem.replace("__", ",_")
        r["file_url_verified"] = False

    # 4. group languages of one work
    groups: dict[tuple, list[dict]] = defaultdict(list)
    for r in raw:
        dt = parse_date(r["date_raw"])
        key = (r["page"], norm_title(r["title"]), r["author"])
        cands = groups[key]
        target = None
        for g in cands:
            # Same title on the same page: one work if the dates agree to within a year
            # (DCO's EN and IT copies of one bull sometimes differ by a typo'd year).
            y1, y2 = (g["date"]["start"] or "")[:4], (dt["start"] or "")[:4]
            if y1 == y2 or (y1.isdigit() and y2.isdigit() and abs(int(y1) - int(y2)) <= 1 and g["date"]["exact"]):
                target = g
                break
        if not target:
            target = {
                "issuer": r["issuer"], "issuer_kind": r["kind"], "issuer_years": r["issuer_years"],
                "author": r["author"], "date": dt, "title": r["title"], "page": BASE + r["page"],
                "files": [],
            }
            cands.append(target)
        target["files"].append({
            "langs": r["langs"], "format": r["format"], "part": r["part"], "date_raw": r["date_raw"],
            "wrapper_url": BASE + r["wrapper"], "file_url": r["file_url"],
            "file_url_verified": r["file_url_verified"],
        })
    docs = [g for gs in groups.values() for g in gs]
    for d in docs:
        d["languages"] = sorted({l for f in d["files"] for l in f["langs"]})
        d["formats"] = sorted({f["format"] for f in d["files"]})
        d["date_variants"] = sorted({f["date_raw"] for f in d["files"]}) if len({f["date_raw"] for f in d["files"]}) > 1 else None
    docs.sort(key=lambda d: (d["issuer_kind"] != "pope", (d["issuer_years"] or ["9999"])[0], d["issuer"], d["date"]["start"] or "", d["title"]))

    out = {
        "source": BASE, "pages": len(pages), "links": len(raw), "documents": len(docs),
        "unparsed_links": unparsed, "only_in_master": only_master, "docs": docs,
    }
    (HERE / "dco.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))

    def century(d):
        y = (d["issuer_years"] or [None])[0]
        return "special" if not y or y.startswith("9999") else f"saec. {int(y) // 100 + 1:02d}"

    print(f"\n{len(docs)} documents from {len(raw)} file links")
    print("\nPapal documents per pope-century (by pontificate start):")
    for k, n in sorted(Counter(century(d) for d in docs if d["issuer_kind"] == "pope").items()):
        print(f"  {k}: {n}")
    print("\nCouncil documents per council:")
    for k, n in Counter(d["issuer"] for d in docs if d["issuer_kind"] == "council").items():
        print(f"  {k}: {n}")
    print("\nFile links per language:", dict(Counter(l for r in raw for l in r["langs"]).most_common()))
    print("File links per format:", dict(Counter(r["format"] for r in raw).most_common()))


if __name__ == "__main__":
    main()
