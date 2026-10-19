#!/usr/bin/env python3
"""Inventory vatican.va's papal documents, Leo XIII → Leo XIV.

Walks each pope's per-type index (and its per-year / paginated sub-indexes) in
English and Italian — Italian is the most complete, some documents have no EN —
and records every document once, keyed by its filename, with the languages
vatican.va carries it in. Pages are cached under _cache/ so reruns are offline.

    python3 research/magisterium/survey_vatican.py   → vatican-papal.json
"""
from __future__ import annotations

import json
import re
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from bs4 import BeautifulSoup

HERE = Path(__file__).resolve().parent
CACHE = HERE / "_cache" / "vatican"
BASE = "https://www.vatican.va"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"

POPES = [
    "leo-xiii", "pius-x", "benedict-xv", "pius-xi", "pius-xii", "john-xxiii",
    "paul-vi", "john-paul-i", "john-paul-ii", "benedict-xvi", "francesco", "leo-xiv",
]
# The magisterial genres. Homilies, audiences, angelus, speeches, messages and
# the like are pastoral output in the tens of thousands, out of scope.
TYPES = [
    "encyclicals", "apost_exhortations", "apost_constitutions", "apost-constitutions",
    "apost_letters", "motu_proprio", "bulls", "briefs", "letters",
]
INDEX_LANGS = ["en", "it"]


def fetch(path: str) -> str | None:
    f = CACHE / path.strip("/").replace("/", "__")
    # A cached page holding U+FFFD was mis-decoded: fetch it again.
    if f.exists() and "\ufffd" not in (t := f.read_text()):
        return t or None
    for attempt in range(4):
        try:
            req = urllib.request.Request(BASE + path, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                raw = r.read()
            # The /content/ CMS serves UTF-8; the older archive pages are Latin-1.
            try:
                t = raw.decode("utf-8")
            except UnicodeDecodeError:
                t = raw.decode("cp1252", errors="replace")
            break
        except urllib.error.HTTPError as e:
            if e.code == 404:
                t = ""
                break
            time.sleep(2**attempt)
        except Exception:
            time.sleep(2**attempt)
    else:
        raise RuntimeError(f"fetch failed: {path}")
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(t)
    return t or None


def crawl_type(pope: str, lang: str, typ: str) -> list[dict]:
    prefix = f"/content/{pope}/{lang}/{typ}"
    queue, seen, items = [f"{prefix}.index.html"], set(), []
    sub = re.compile(re.escape(prefix) + r"(?:/\d{4})?\.index(?:\.\d+)?\.html$")
    while queue:
        path = queue.pop()
        if path in seen:
            continue
        seen.add(path)
        html = fetch(path)
        if not html:
            continue
        soup = BeautifulSoup(html, "html.parser")
        for a in soup.find_all("a", href=True):
            h = a["href"].split("?")[0]
            if sub.match(h) and h not in seen:
                queue.append(h)
        for item in soup.select("div.item"):
            h2 = item.find(["h2", "h1", "h3"])
            if not h2 or not h2.find("a"):
                continue
            links = {}
            for a in item.find_all("a", href=True):
                m = re.match(rf"/content/{re.escape(pope)}/([a-z]{{2}}(?:_[a-z]+)?)/(.+)\.html$", a["href"])
                if m and "/documents/" in m.group(2):
                    links[m.group(1)] = a["href"]
            if not links:
                continue
            file = Path(next(iter(links.values()))).stem
            items.append({"file": file, "title": h2.get_text(" ", strip=True), "langs": links})
    return items


def parse_date(file: str) -> str | None:
    # Filenames carry the date as DDMMYYYY or YYYYMMDD depending on the pope.
    m = re.search(r"(?:^|[_-])(\d{8})[_-]", file + "_")
    if not m:
        return None
    s = m.group(1)
    if s[:2] in ("18", "19", "20") and 1 <= int(s[4:6]) <= 12:
        return f"{s[:4]}-{s[4:6]}-{s[6:]}"
    return f"{s[4:]}-{s[2:4]}-{s[:2]}"


def main() -> None:
    jobs = [(p, l, t) for p in POPES for l in INDEX_LANGS for t in TYPES]
    with ThreadPoolExecutor(8) as ex:
        results = list(ex.map(lambda j: (j, crawl_type(*j)), jobs))
    docs: dict[str, dict] = {}
    for (pope, lang, typ), items in results:
        for it in items:
            d = docs.setdefault(it["file"], {
                "file": it["file"], "pope": pope, "type": typ.replace("-", "_"),
                "date": parse_date(it["file"]), "title": {}, "urls": {},
            })
            d["title"].setdefault(lang, it["title"])
            for k, v in it["langs"].items():
                d["urls"].setdefault(k, BASE + v)
    out = sorted(docs.values(), key=lambda d: (POPES.index(d["pope"]), d["date"] or "", d["file"]))
    (HERE / "vatican-papal.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    from collections import Counter
    c = Counter((d["pope"], d["type"]) for d in out)
    for p in POPES:
        print(p, {t: n for (pp, t), n in c.items() if pp == p})
    print("total", len(out))


if __name__ == "__main__":
    main()
