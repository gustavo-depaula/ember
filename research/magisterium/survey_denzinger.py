#!/usr/bin/env python3
"""List the source documents Denzinger excerpts, from catho.org's Latin Enchiridion.

catho.org (Ictus 3 CD-ROM) carries the Latin Denzinger as ~46 text pages,
9.php?d=bxj … byw, chained by "Suivant" links. Each excerpted document opens
with one or more <h2> lines (a heading wrapped as in the printed book, in
French), followed by passages tagged <b>DS number</b> <i>old Dz number</i>.
The table of contents (9.php?d=g1) is a PDF-layout dump whose numbers are
offset from its headings, so we read the headings from the text pages.

    python3 research/magisterium/survey_denzinger.py   → denzinger.json

The site is http-only and ISO-8859-1.
"""
from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.request
from collections import Counter
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

HERE = Path(__file__).resolve().parent
CACHE = HERE / "_cache" / "denz"
BASE = "http://catho.org/"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
FIRST_PAGE = "bxj"


def fetch(code: str) -> str:
    f = CACHE / f"{code}.html"
    if f.exists():
        return f.read_text(encoding="utf-8")
    for attempt in range(4):
        try:
            req = urllib.request.Request(f"{BASE}9.php?d={code}", headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                t = r.read().decode("iso-8859-1")
            break
        except Exception:
            time.sleep(2**attempt)
    else:
        raise RuntimeError(f"fetch failed: {code}")
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(t, encoding="utf-8")
    time.sleep(0.3)
    return t


def walk_pages() -> list[tuple[str, BeautifulSoup]]:
    """Follow the 'Suivant' chain from the first text page until it leaves the Latin Denzinger."""
    out, code, seen = [], FIRST_PAGE, set()
    while code and code not in seen:
        seen.add(code)
        soup = BeautifulSoup(fetch(code), "html.parser")
        title = soup.find("b", string=re.compile("Denzinger"))
        if not title or "latin" not in title.get_text():
            break
        out.append((code, soup))
        nxt = soup.find("img", title="Suivant")
        code = nxt.parent["href"].split("d=")[1] if nxt and nxt.parent.name == "a" else None
    return out


def events(soup: BeautifulSoup):
    """Yield ('h', text) for each <h2> and ('ds'|'dz', number) for each passage tag, in order."""
    for el in soup.body.descendants:
        if not isinstance(el, Tag):
            continue
        if el.name == "h2":
            yield "h", el.get_text(" ", strip=True)
        elif el.name == "b" and re.fullmatch(r"\d+[a-z]?", el.get_text(strip=True)):
            yield "ds", el.get_text(strip=True)
        elif el.name == "i" and re.fullmatch(r"\d+[a-z]?", el.get_text(strip=True)):
            yield "dz", el.get_text(strip=True)


MONTHS = r"(?:janv|févr|fevr|mars|avr|mai|juin|juil|août|aout|sept|oct|nov|déc|dec|ian|jan|febr|feb|mart|mar|apr|iun|iul|aug|ottobre|octobre)\w*\.?"
DATE_RE = re.compile(rf"((?:(?:vers|avant|après|entre|inter|a\.|ca\.|env\.)\s*)?(?:\d{{1,2}}\.?\s*(?:er\s+)?(?:\(\d{{1,2}}\.?\)\s*)?)?(?:{MONTHS}\s*(?:\([^)]*\)\s*)?)?\(?\d{{3,4}}\)?(?:\s*[-/]\s*\d{{2,4}})?\??)", re.I)

TYPES = [
    (r"\blitt\.? encycl|\bencycl", "encyclical"),
    (r"\bconst\.? ap|\bconstitutio|\bconst\b", "apostolic constitution"),
    (r"\bbulla\b|\bbulle\b", "bull"),
    (r"\bbreve\b|\bbref\b", "brief"),
    (r"\bmotu proprio\b", "motu proprio"),
    (r"\badhort", "exhortation"),
    (r"\ballocut|\ballocution", "allocution"),
    (r"\bsyllab", "syllabus"),
    (r"\bdecr\b|\bdécret|\bdecretum|\bdecretal", "decree"),
    (r"\bresp\b|\brespons|\bréponse", "response"),
    (r"\binstruct", "instruction"),
    (r"\bmonitum\b", "monitum"),
    (r"\bprofessio|\bprofession|\biusiurandum|\bserment", "profession of faith"),
    (r"\bsymbol", "creed"),
    (r"\bcanon|\bcan\b|\bcapitula", "canons"),
    (r"\bsessio|\bsession", "council session"),
    (r"\bep\b|\bepist|\blitt\b|\blet\b|\blettre", "letter"),
    (r"\bdamn|\bcondamn|\berrores|\berreurs|\bpropositions", "condemnation"),
]

CURIA = [
    (r"S\.\s*Officii|Saint[- ]Office|S\.\s*Off\.|Sacr\.\s*Off", "Holy Office"),
    (r"S\.\s*C\.\s*(?:de\s*)?Prop|Propagand", "Propaganda Fide"),
    (r"Commiss\.?\s*(?:de\s*re\s*)?Biblic|Commission biblique|re Biblica", "Pontifical Biblical Commission"),
    (r"S\.\s*Pae\w*tentiar|Pénitencerie|Paenitentiaria", "Sacred Penitentiary"),
    (r"S\.\s*C\.\s*(?:Rituum|des Rites)|Rituum", "Congregation of Rites"),
    (r"S\.\s*C\.\s*Indicis|l'Index|Indicis", "Congregation of the Index"),
    (r"(?:S\.\s*C(?:gr)?\.\s*(?:S\.\s*)?|Cgr\.\s*S\.\s*)(?:Concilii|du Concile)", "Congregation of the Council"),
    (r"S\.\s*C(?:gr)?\.\s*(?:Studiorum|des Etudes|Seminariis)", "Congregation of Studies/Seminaries"),
    (r"S\.\s*C\.\s*(?:Consistor)", "Consistorial Congregation"),
    (r"S\.\s*C(?:gr)?\.\s*(?:de\s*)?Sacram|des Sacrements", "Congregation of the Sacraments"),
    (r"S\.\s*C(?:gr)?\.|Congr\.|\bCgr\.", "Roman congregation"),
]


def issuer_of(h: str) -> dict:
    """Best-effort issuer from a French Denzinger heading."""
    under = re.search(r"(?:sous|sub|\()\s*((?:saint |bienheureux |b\. |s\. )?[A-ZÉ][\w'éèêëïîôûç]+(?: [A-Z][\w']*)?(?: (?:[IVXL]+|le Grand))?)\s*\)?", h)
    for pat, name in CURIA:
        if re.search(pat, h, re.I):
            return {"kind": "curia", "name": name, "pope": under[1] if under and re.search(r"sous|sub", under[0]) else None}
    m = re.match(r"^((?:Conc(?:ile|ilium|\.)|Synod|Synode)[^,;]*?)(?:,|;|$)", h, re.I)
    if m:
        name = re.sub(r"\s*\(([^)]*)\)", "", m[1]).strip()
        pope = re.search(r"\(([^)]*(?:[IVX]+|Grand|saint|Saint)[^)]*)\)", m[1])
        return {"kind": "council", "name": name, "pope": pope[1] if pope else None}
    m = re.match(r"^([^,;]+?)(?:,|;)", h)
    name = (m[1] if m else h).strip()
    kind = "pope" if re.search(r"\b[IVXL]+\b|le Grand|Libere|Libère|Pie|Léon|Grégoire|Innocent|Clément|Urbain|Benoît|Boniface|Jean|Paul|Martin|Nicolas|Alexandre|Sixte|Pelage|Pélage|Hormisdas|Gélase|Vigile|Agathon|Zosime|Sirice|Damase|Célestin|Anastase|Hadrien|Adrien|Eugène|Lucius|Honorius|Calixte|Félix|Simplice|Vitalien|Etienne|Denis|Corneille|Zéphyrin|Jules|Agapet|Hilaire|Silvère|Symmaque|Zacharie|Formose|Zachar", name) else "other"
    return {"kind": kind, "name": name, "pope": None}


def parse_heading(h: str) -> dict:
    quotes = re.findall(r"['\"«]\s*([^'\"»]{3,}?)\s*['\"»]", h)
    dates = DATE_RE.findall(h)
    typ = next((t for pat, t in TYPES if re.search(pat, h, re.I)), None)
    return {
        "incipit": quotes[0] if quotes else None,
        "date": dates[0].strip(" ()") if dates else None,
        "type": typ,
        "issuer": issuer_of(h),
    }


def main() -> None:
    pages = walk_pages()
    print(f"{len(pages)} text pages: {pages[0][0]} … {pages[-1][0]}")
    docs: list[dict] = []
    cur, pending_h = None, []
    for code, soup in pages:
        for kind, val in events(soup):
            if kind == "h":
                pending_h.append(val)
                continue
            if pending_h:
                heading = re.sub(r"\s+", " ", " ".join(pending_h)).strip()
                cur = {"heading": heading, **parse_heading(heading), "page": f"{BASE}9.php?d={code}", "ds": [], "dz": []}
                docs.append(cur)
                pending_h = []
            if cur:
                cur[kind].append(val)
    if pending_h:
        print("trailing heading without passages:", pending_h)

    def num(x: str) -> int:
        return int(re.match(r"\d+", x)[0])

    for d in docs:
        d["ds_range"] = [d["ds"][0], d["ds"][-1]] if d["ds"] else None
        d["dz_range"] = [d["dz"][0], d["dz"][-1]] if d["dz"] else None
        d["passages"] = max(len(d["ds"]), len(d["dz"]))
        del d["ds"], d["dz"]
    # Council chapters, canon blocks and labels ("Cap. 2 …", "b) Canones", "Contra Nestorium")
    # carry their own heading but belong to the document above; they inherit its issuer.
    parent = None
    for d in docs:
        h = d["heading"]
        d["subheading"] = bool(
            re.match(r"^(\(?[a-z]\)|cap\.|can\.|\d+\.|canones|contra\b|sess\.?\b|sessio|actio|definitio|decretum de|caput)", h, re.I)
            or (d["issuer"]["kind"] == "other" and not d["incipit"] and not d["date"] and parent is not None)
        )
        # "Constitutio 'Ex gravi'", "Decr. '…', sous saint Pie X": a papal act whose heading
        # names the pope only by "sous …", or not at all when it follows its pope's other acts.
        if not d["subheading"] and d["issuer"]["kind"] == "other" and re.match(r"^(ex\s+)?(const|bulla|litt|decr|ep\b|ep\.)", h, re.I):
            under = re.search(r"sous\s+((?:saint |bienheureux )?[A-ZÉ]\w+(?: [IVXL]+)?)", h)
            prev_pope = next((x["issuer"]["name"] for x in reversed(docs[: docs.index(d)]) if x["issuer"]["kind"] == "pope"), None)
            d["issuer"] = {"kind": "pope", "name": under[1] if under else prev_pope, "pope": None, "inferred": not under}
        if d["subheading"] and parent:
            d["issuer"] = parent["issuer"]
            d["parent_heading"] = parent["heading"]
        else:
            parent = d
        if d["issuer"]["kind"] == "council":
            d["issuer"]["name"] = re.sub(r"^Conc\.\s*", "Concile ", d["issuer"]["name"])

    (HERE / "denzinger.json").write_text(json.dumps({"source": f"{BASE}9.php?d=g1", "documents": docs}, ensure_ascii=False, indent=1))
    main_docs = [d for d in docs if not d["subheading"]]
    print(f"{len(docs)} headings, {len(main_docs)} source documents (excluding {len(docs) - len(main_docs)} sub-headings)")
    ds_all = [d for d in docs if d["ds_range"]]
    print(f"DS span {ds_all[0]['ds_range'][0]} … {ds_all[-1]['ds_range'][1]}")
    print("\nBy issuer kind:", dict(Counter(d["issuer"]["kind"] for d in main_docs)))
    print("By type:", dict(Counter(d["type"] for d in main_docs).most_common()))
    print("\nBy issuer (top 60):")
    for (k, n), c in Counter((d["issuer"]["kind"], d["issuer"]["name"]) for d in main_docs).most_common(60):
        print(f"  {c:4} {k:8} {n}")


if __name__ == "__main__":
    main()
