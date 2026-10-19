#!/usr/bin/env python3
"""Inventory the secondary web sources:

- vatican.va's older-popes section (Pius IX back to Gregory IX), whose
  documents are listed straight on each pope's language page
- papalencyclicals.net (EN) and veritatis.com.br (PT), both WordPress, through
  their REST API

→ vatican-old.json, papalencyclicals.json, veritatis.json
"""
from __future__ import annotations

import json
import re
import time
import urllib.request
from collections import Counter
from pathlib import Path

from bs4 import BeautifulSoup
from survey_vatican import BASE, HERE, UA, fetch

OLD_POPES = [
    "gregorius-ix", "innocentius-iv", "urbanus-iv", "clemens-vi", "benedictus-xii",
    "eugenius-iv", "benedictus-xiv", "clemens-xiii", "clemens-xiv", "pius-vi",
    "pius-vii", "leo-xii", "pius-viii", "gregorius-xvi", "pius-ix",
]
LANGS = ["it", "la", "en", "pt", "es", "fr", "de"]


def survey_vatican_old() -> list[dict]:
    docs: dict[str, dict] = {}
    for pope in OLD_POPES:
        for lang in LANGS:
            html = fetch(f"/content/{pope}/{lang}.html")
            if not html:
                continue
            soup = BeautifulSoup(html, "html.parser")
            for a in soup.find_all("a", href=True):
                m = re.match(rf"/content/{pope}/([a-z]{{2}})/documents/(.+)\.html$", a["href"])
                if not m:
                    continue
                d = docs.setdefault(a["href"], {
                    "pope": pope, "lang": m.group(1), "slug": m.group(2),
                    "title": a.get_text(" ", strip=True), "url": BASE + a["href"],
                })
    return list(docs.values())


def wp_posts(site: str) -> tuple[list[dict], dict[int, str]]:
    cache = HERE / "_cache" / re.sub(r"\W+", "_", site)
    cache.mkdir(parents=True, exist_ok=True)

    def get(path: str):
        f = cache / (re.sub(r"\W+", "_", path) + ".json")
        if f.exists():
            return json.loads(f.read_text())
        for attempt in range(4):
            try:
                req = urllib.request.Request(site + path, headers={"User-Agent": UA})
                with urllib.request.urlopen(req, timeout=60) as r:
                    data = json.loads(r.read())
                break
            except urllib.error.HTTPError as e:
                if e.code == 400:
                    return []
                time.sleep(2**attempt)
        else:
            raise RuntimeError(site + path)
        f.write_text(json.dumps(data, ensure_ascii=False))
        return data

    cats = {}
    for page in range(1, 20):
        batch = get(f"/wp-json/wp/v2/categories?per_page=100&page={page}")
        if not batch:
            break
        cats.update({c["id"]: c["name"] for c in batch})
    posts = []
    for kind in ("posts", "pages"):
        for page in range(1, 400):
            batch = get(f"/wp-json/wp/v2/{kind}?per_page=100&page={page}&_fields=id,link,title,categories,date,slug")
            if not batch:
                break
            for p in batch:
                posts.append({
                    "kind": kind, "url": p["link"], "slug": p["slug"],
                    "title": BeautifulSoup(p["title"]["rendered"], "html.parser").get_text(),
                    "categories": [cats.get(c, c) for c in p.get("categories", [])],
                })
    return posts, cats


def main() -> None:
    old = survey_vatican_old()
    (HERE / "vatican-old.json").write_text(json.dumps(old, ensure_ascii=False, indent=1))
    print("vatican-old", len(old), Counter((d["pope"]) for d in old))
    print(" langs", Counter(d["lang"] for d in old))
    for site, name in [("https://www.papalencyclicals.net", "papalencyclicals"), ("https://www.veritatis.com.br", "veritatis")]:
        posts, cats = wp_posts(site)
        (HERE / f"{name}.json").write_text(json.dumps(posts, ensure_ascii=False, indent=1))
        print(name, len(posts), Counter(c for p in posts for c in p["categories"]).most_common(60))


if __name__ == "__main__":
    main()
