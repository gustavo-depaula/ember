#!/usr/bin/env python3
"""Inventory vatican.va's archive-style documents: Vatican II and the Roman Curia.

These pages predate the /content/ CMS: a document is a set of sibling files
`documents/<stem>_<lang>.html`, one per language. We crawl each body's index
pages (staying inside its directory), collect every `documents/` link, and group
by stem. → vatican-archive.json
"""
from __future__ import annotations

import json
import re
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup
from survey_vatican import BASE, HERE, fetch

# (body key, display name, root index). Doctrinal and disciplinary bodies whose
# documents carry teaching weight; academies, offices and the like are left out.
BODIES = [
    ("vatican-ii", "Second Vatican Council", "/archive/hist_councils/ii_vatican_council/index.htm"),
    ("cdf", "Dicastery for the Doctrine of the Faith", "/roman_curia/congregations/cfaith/doc_doc_index.htm"),
    ("cdf-cti", "International Theological Commission", "/roman_curia/congregations/cfaith/cti_index.htm"),
    ("cdf-pcb", "Pontifical Biblical Commission", "/roman_curia/congregations/cfaith/pcb_index.htm"),
    ("worship", "Dicastery for Divine Worship", "/roman_curia/congregations/ccdds/index.htm"),
    ("clergy", "Dicastery for the Clergy", "/roman_curia/congregations/cclergy/index.htm"),
    ("bishops", "Dicastery for Bishops", "/roman_curia/congregations/cbishops/index.htm"),
    ("catholic-education", "Dicastery for Culture and Education", "/roman_curia/congregations/ccatheduc/index.htm"),
    ("consecrated-life", "Dicastery for Consecrated Life", "/roman_curia/congregations/ccscrlife/index.htm"),
    ("evangelization", "Dicastery for Evangelization", "/roman_curia/congregations/cevang/index.htm"),
    ("oriental-churches", "Dicastery for the Eastern Churches", "/roman_curia/congregations/orientchurch/index.htm"),
    ("saints", "Dicastery for the Causes of Saints", "/roman_curia/congregations/csaints/index.htm"),
    ("christian-unity", "Dicastery for Promoting Christian Unity", "/roman_curia/pontifical_councils/chrstuni/index.htm"),
    ("interreligious", "Dicastery for Interreligious Dialogue", "/roman_curia/pontifical_councils/interelg/index.htm"),
    ("legislative-texts", "Dicastery for Legislative Texts", "/roman_curia/pontifical_councils/intrptxt/index.htm"),
    ("family", "Pontifical Council for the Family", "/roman_curia/pontifical_councils/family/index.htm"),
    ("justice-peace", "Pontifical Council for Justice and Peace", "/roman_curia/pontifical_councils/justpeace/index.htm"),
    ("culture", "Pontifical Council for Culture", "/roman_curia/pontifical_councils/cultr/index.htm"),
    ("social-communications", "Pontifical Council for Social Communications", "/roman_curia/pontifical_councils/pccs/index.htm"),
    ("health-care", "Pontifical Council for Health Care", "/roman_curia/pontifical_councils/hlthwork/index.htm"),
    ("migrants", "Pontifical Council for Migrants", "/roman_curia/pontifical_councils/migrants/index.htm"),
    ("laity", "Pontifical Council for the Laity", "/roman_curia/pontifical_councils/laity/laity_en/index_en.htm"),
    ("ecclesia-dei", "Pontifical Commission Ecclesia Dei", "/roman_curia/pontifical_commissions/ecclsdei/index.htm"),
    ("penitentiary", "Apostolic Penitentiary", "/roman_curia/tribunals/apost_penit/index.htm"),
]
DOC = re.compile(r"/[a-z_]*documents/([^/]+?)_([a-z]{2}(?:-[a-z]+)?)\.(html?|pdf)$")


def crawl(key: str, root: str) -> dict[str, dict]:
    scope = root.rsplit("/", 1)[0] + "/"
    queue, seen, docs = [root], set(), {}
    while queue and len(seen) < 400:
        path = queue.pop()
        if path in seen:
            continue
        seen.add(path)
        html = fetch(path)
        if not html:
            continue
        soup = BeautifulSoup(html, "html.parser")
        for a in soup.find_all("a", href=True):
            u = urlparse(urljoin(BASE + path, a["href"]))
            if u.netloc not in ("www.vatican.va", "vatican.va"):
                continue
            p = u.path
            m = DOC.search(p)
            if m and "index" in m.group(1):
                queue.append(p)
            elif m:
                stem, lang = m.group(1), m.group(2)
                d = docs.setdefault(stem, {"stem": stem, "body": key, "title": None, "urls": {}})
                d["urls"].setdefault(lang, BASE + p)
                t = a.get_text(" ", strip=True)
                if lang == "en" and t and len(t) > 3 and not d["title"]:
                    d["title"] = t
            elif p.startswith(scope) and re.search(r"index[^/]*\.html?$", p):
                queue.append(p)
    return docs


def parse_date(stem: str) -> str | None:
    m = re.search(r"_(\d{4})(\d{2})(\d{2})(?:_|$)", stem)
    return f"{m.group(1)}-{m.group(2)}-{m.group(3)}" if m else None


def main() -> None:
    with ThreadPoolExecutor(8) as ex:
        results = list(ex.map(lambda b: crawl(b[0], b[2]), BODIES))
    out = []
    for docs in results:
        for d in docs.values():
            d["date"] = parse_date(d["stem"])
            out.append(d)
    out.sort(key=lambda d: (d["body"], d["date"] or "", d["stem"]))
    (HERE / "vatican-archive.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    for k, n in Counter(d["body"] for d in out).items():
        print(k, n)
    print("total", len(out))


if __name__ == "__main__":
    main()
