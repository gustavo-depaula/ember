#!/usr/bin/env python3
"""Build content/bible/lexicon-hebrew/: three Hebrew lexicons and the root
families, keyed by STEPBible's extended Strong's number (dStrong) as the
words files (content/bible/hebrew-wlc/words/) name every piece.

Sources (each licence read in the repo it comes from):

    TBESH   github.com/STEPBible/STEPBible-Data Lexicons/"TBESH - Translators
            Brief lexicon of Extended Strongs for Hebrew - STEPBible.org CC BY":
            CC BY 4.0, "Data created by www.STEPBible.org based on work at
            Tyndale House Cambridge". Per dStrong: the Hebrew form, the gloss
            and the grammatical class, which its field notes say "were created
            by Tyndale scholars". NOT its "Meaning" column: those definitions
            "are based on the Abridged BDB by Online Bible, (c) Larry Pierce ...
            Permission should be gained from Online Bible before these are
            applied in any project", which the CC BY data does not grant.
    BDB     github.com/openscriptures/HebrewLexicon BrownDriverBriggs.xml:
            Brown, Driver & Briggs, A Hebrew and English Lexicon of the Old
            Testament (1906), public domain; the markup CC BY 4.0 (readme.md:
            "The actual text of Brown, Driver, Briggs and Strong's Hebrew
            dictionary remain in the public domain"; attribution to the Open
            Scriptures Hebrew Bible project).
    Strong  the same repo's HebrewStrong.xml: James Strong's Hebrew and
            Chaldee Dictionary (1890), public domain.
    Index   the same repo's LexicalIndex.xml (CC BY 4.0): each BDB entry with
            its Strong's numbers, its SBL transliteration, and BDB's own
            arrangement by roots — an entry is a root ("main", with its letters
            and the entries derived from it) or a word filed under one ("sub").

A dStrong (H7225G) reaches the index through its Strong's number; where the
index splits a number in two, STEP's letter, lowered, is the index's `aug`
letter (prototype-verified on the showcase words).

Writes:
    tbesh/<shard>.json     {dStrong: {"lemma", "x", "gloss", "pos"}}
    bdb/<shard>.json       {dStrong: {"lemma", "x", "pos", "gloss", "body"}}
    strongs/<shard>.json   {dStrong: {"lemma", "x", "pron", "body"}}
    roots.json             {dStrong: root id}
    families.json          {root id: {"root", "x", "members": [{"d", "lemma",
                            "x", "pos", "gloss", "count"}]}}
    sources.json           the three lexicons, with licences and credits

"x" is the SBL academic transliteration (the index's, else Strong's), "pos"
the index's part of speech (N, V, Np, ...), or for TBESH its own class
("H:N-M": language, type, gender, name kind). A "body" is the entry as structured text: a list of
paragraphs {"n"?: sense label, "d": depth, "r": runs}, each run [kind, text]
or ["ref", text, osisRef] (a verse), or ["strong", number, "H7218"] (Strong's
pointing to another of his entries); kind one of t (text), he (Hebrew), def,
pos, stem, asp, em, f (a foreign word BDB could not print: "Syriac", "Arabic").

Shards are the concordance's: str(Strong's number // 500).zfill(2).

Usage: python3 -I scripts/hebrew-bible/lexicon.py <downloads dir>
"""
from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import LEXICON, OUT, dump, nfc  # noqa: E402
from concordance import shard  # noqa: E402

NS = "{http://openscriptures.github.com/morphhb/namespace}"
NAME = re.compile(r"^H306[89]")


def read_tbesh(path: Path) -> dict:
    out = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        cols = line.split("\t")
        if len(cols) < 8 or not re.match(r"^H\d{4}", cols[0]):
            continue
        d = cols[1].split(" ")[0]
        meaning = re.sub(r"<BR>", "<br>", cols[7])
        meaning = re.sub(r"<(?!/?(br|i|b)\b)[^>]*>", "", meaning, flags=re.I)
        out.setdefault(
            d,
            {"lemma": nfc(cols[3]), "x": cols[4], "gloss": cols[6], "pos": cols[5], "def": meaning.strip()},
        )
    return out


def read_index(path: Path) -> tuple[dict, dict]:
    root = ET.parse(path).getroot()
    entries, by_strong = {}, defaultdict(list)
    for e in root.iter(f"{NS}entry"):
        w, pos, d, etym = e.find(f"{NS}w"), e.find(f"{NS}pos"), e.find(f"{NS}def"), e.find(f"{NS}etym")
        xrefs = e.findall(f"{NS}xref")
        ent = {
            "id": e.get("id"),
            "w": nfc(w.text or "") if w is not None else "",
            "x": w.get("xlit", "") if w is not None else "",
            "pos": pos.text if pos is not None else "",
            "def": d.text if d is not None else "",
            "bdb": xrefs[0].get("bdb") if xrefs else None,
            "strong": [(x.get("strong"), x.get("aug")) for x in xrefs if x.get("strong")],
            "etype": etym.get("type") if etym is not None else None,
            "root": nfc(etym.get("root")) if etym is not None and etym.get("root") else None,
            "links": [s.strip() for s in (etym.text or "").split(",") if s.strip()] if etym is not None else [],
        }
        entries[ent["id"]] = ent
        for s, aug in ent["strong"]:
            if s.isdigit():
                by_strong[int(s)].append((aug, ent["id"]))
    return entries, by_strong


def index_entry(d: str, by_strong: dict) -> str | None:
    """A dStrong's entry in the lexical index (see the module docstring)."""
    m = re.match(r"^H(\d+)([A-Z]?)$", d)
    if not m:
        return None
    cands = by_strong.get(int(m.group(1)), [])
    if len(cands) == 1:
        return cands[0][1]
    letter = m.group(2).lower()
    for aug, i in cands:
        if aug == letter:
            return i
    # The index splits a number STEP does not (or by other letters): the first
    # of the index's, which is the commoner sense in both.
    return cands[0][1] if cands and not letter else None


def root_of(li: str | None, entries: dict) -> str | None:
    e = entries.get(li) if li else None
    if not e:
        return None
    if e["etype"] == "main" and e["root"]:
        return li
    if e["etype"] == "sub" and e["links"]:
        parent = entries.get(e["links"][0])
        if parent and parent["etype"] == "main" and parent["root"]:
            return parent["id"]
    return None


# ── Structured text ───────────────────────────────────────────────────────────

KIND = {"w": "he", "def": "def", "pos": "pos", "stem": "stem", "asp": "asp", "em": "em", "foreign": "f"}


def body(el) -> list[dict]:
    """An entry as paragraphs of typed runs (see the module docstring)."""
    out: list[dict] = []

    def flush(runs, depth, n=None):
        # Whitespace between two runs separates them; at the edges it is
        # only the XML's indentation.
        while runs and runs[0][0] == "t" and not runs[0][1].strip():
            runs = runs[1:]
        while runs and runs[-1][0] == "t" and not runs[-1][1].strip():
            runs = runs[:-1]
        if not runs and n:
            # A numbered sense whose words are all in its sub-senses: the
            # label still opens its place in the outline.
            out.append({"d": depth, "r": [], "n": n})
        if runs:
            # Collapse the XML's line breaks and indentation into single spaces.
            for r in runs:
                r[1] = re.sub(r"\s+", " ", r[1])
            runs[0][1] = runs[0][1].lstrip()
            runs[-1][1] = runs[-1][1].rstrip()
            block = {"d": depth, "r": runs}
            if n:
                block["n"] = n
            out.append(block)

    def walk(node, depth, n=None):
        runs: list = []
        if node.text:
            runs.append(["t", node.text])
        label = n
        for child in node:
            tag = child.tag.replace(NS, "")
            if tag == "sense":
                flush(runs, depth, label)
                label = None
                runs = []
                walk(child, depth + 1, child.get("n"))
            elif tag in ("status", "page"):
                pass
            elif tag == "ref":
                runs.append(["ref", "".join(child.itertext()), child.get("r", "")])
            elif tag in KIND:
                runs.append([KIND[tag], nfc("".join(child.itertext()))])
            else:
                runs.append(["t", "".join(child.itertext())])
            if child.tail:
                runs.append(["t", child.tail])
        flush(runs, depth, label)

    walk(el, 0)
    # Merge adjacent text runs.
    for block in out:
        merged = []
        for r in block["r"]:
            if merged and r[0] == "t" and merged[-1][0] == "t":
                merged[-1][1] += r[1]
            else:
                merged.append(r)
        block["r"] = merged
    return out


def strong_body(e) -> list[dict]:
    out = []
    for tag in ("source", "meaning", "usage"):
        x = e.find(f"{NS}{tag}")
        if x is None:
            continue
        runs = [["t", "KJV: "]] if tag == "usage" else []
        if x.text:
            runs.append(["t", x.text])
        for child in x:
            ctag = child.tag.replace(NS, "")
            if ctag == "w" and child.get("src"):
                # A cross-reference to another entry ("from the same as 7218").
                runs.append(["strong", "".join(child.itertext()), child.get("src")])
            else:
                runs.append([KIND.get(ctag, "t"), nfc("".join(child.itertext()))])
            if child.tail:
                runs.append(["t", child.tail])
        for r in runs:
            r[1] = re.sub(r"\s+", " ", r[1])
        if runs:
            runs[0][1] = runs[0][1].lstrip()
            runs[-1][1] = runs[-1][1].rstrip()
            out.append({"d": 0, "r": runs})
    return out


# ── Build ─────────────────────────────────────────────────────────────────────


def main(src: Path) -> None:
    tbesh = read_tbesh(src / "tbesh.txt")
    entries, by_strong = read_index(src / "LexicalIndex.xml")
    bdb = {e.get("id"): e for e in ET.parse(src / "BrownDriverBriggs.xml").getroot().iter(f"{NS}entry")}
    strongs = {e.get("id"): e for e in ET.parse(src / "HebrewStrong.xml").getroot().iter(f"{NS}entry")}
    counts = json.loads((OUT / "concordance" / "counts.json").read_text(encoding="utf-8"))

    # Every dStrong worth an entry: those the text uses, and TBESH's own.
    wanted = sorted(set(counts) | set(tbesh), key=lambda d: (int(re.match(r"^H(\d+)", d).group(1)), d))
    shards: dict = defaultdict(lambda: defaultdict(dict))
    li_of: dict = {}
    for d in wanted:
        if not re.match(r"^H\d+", d):
            continue
        sh = shard(d)
        li = index_entry(d, by_strong)
        li_of[d] = li
        ent = entries.get(li) if li else None
        t = tbesh.get(d)
        x = (ent or {}).get("x") or ""
        if t:
            shards["tbesh"][sh][d] = {"lemma": t["lemma"], "x": x or t["x"], "gloss": t["gloss"], "pos": t["pos"]}
        if ent and ent["bdb"] and ent["bdb"] in bdb:
            shards["bdb"][sh][d] = {
                "lemma": ent["w"],
                "x": x,
                "pos": ent["pos"],
                "gloss": ent["def"],
                "body": body(bdb[ent["bdb"]]),
            }
        num = re.match(r"^H(\d+)", d).group(1)
        se = strongs.get(f"H{int(num)}")
        if se is not None:
            w = se.find(f"{NS}w")
            shards["strongs"][sh][d] = {
                "lemma": nfc(w.text or "") if w is not None else "",
                "x": w.get("xlit", "") if w is not None else "",
                "pron": w.get("pron", "") if w is not None else "",
                "body": strong_body(se),
            }
        if NAME.match(d):
            # The Name, as read (Congregation for Divine Worship, 2008): "x" is
            # the consonants, and the entry says what is said instead.
            for lex in ("tbesh", "bdb", "strongs"):
                if d in shards[lex][sh]:
                    shards[lex][sh][d]["x"] = "YHWH"
                    shards[lex][sh][d]["read"] = "ʾădōnāy" if d.startswith("H3068") else "ʾĕlōhîm"

    for lex, by_shard in shards.items():
        out = LEXICON / lex
        out.mkdir(parents=True, exist_ok=True)
        for old in out.glob("*.json"):
            old.unlink()
        for sh, data in sorted(by_shard.items()):
            dump(out / f"{sh}.json", data)

    # Root families: every dStrong whose index entry is, or is filed under, a root.
    li_count: Counter = Counter()
    li_key: dict = {}
    for d, c in counts.items():
        li = li_of.get(d)
        if li:
            li_count[li] += c
            li_key.setdefault(li, d)
    roots, families = {}, {}
    for d in wanted:
        r = root_of(li_of.get(d), entries)
        if not r or NAME.match(d):
            continue  # the Name is filed under הוה ("ruin"): no family for it
        roots[d] = r
        if r in families:
            continue
        re_ = entries[r]
        members, seen = [], set()
        for m in [r] + [x for x in re_["links"] if x in entries]:
            me = entries[m]
            if not li_count.get(m) or (me["w"], me["def"]) in seen:
                continue
            seen.add((me["w"], me["def"]))
            members.append({"d": li_key.get(m), "lemma": me["w"], "x": me["x"], "pos": me["pos"], "gloss": me["def"], "count": li_count[m]})
        members.sort(key=lambda m: -m["count"])
        families[r] = {"root": re_["root"], "x": re_["x"], "members": members}
    dump(LEXICON / "roots.json", roots)
    dump(LEXICON / "families.json", families)

    sources = [
        {
            "id": "tbesh", "name": "Translators Brief lexicon of Extended Strongs for Hebrew (glosses)",
            "author": "Tyndale House Cambridge / STEPBible.org", "year": 2026, "licence": "CC-BY-4.0",
            "attribution": "Glosses and word classes from TBESH, data created by www.STEPBible.org based on work at Tyndale House Cambridge (CC BY 4.0). Its definitions, from Online Bible's Abridged BDB, are not included.",
            "url": "https://github.com/STEPBible/STEPBible-Data", "entries": sum(len(v) for v in shards["tbesh"].values()),
        },
        {
            "id": "bdb", "name": "A Hebrew and English Lexicon of the Old Testament",
            "author": "Francis Brown, S. R. Driver and Charles A. Briggs", "year": 1906, "licence": "Public Domain",
            "attribution": "Brown, Driver & Briggs (1906), public domain; XML and lexical index by the Open Scriptures Hebrew Bible project (CC BY 4.0).",
            "url": "https://github.com/openscriptures/HebrewLexicon", "entries": sum(len(v) for v in shards["bdb"].values()),
        },
        {
            "id": "strongs", "name": "A Concise Dictionary of the Words in the Hebrew Bible",
            "author": "James Strong", "year": 1890, "licence": "Public Domain",
            "attribution": "James Strong, Strong's Exhaustive Concordance (1890), public domain; XML by the Open Scriptures Hebrew Bible project.",
            "url": "https://github.com/openscriptures/HebrewLexicon", "entries": sum(len(v) for v in shards["strongs"].values()),
        },
    ]
    dump(LEXICON / "sources.json", sources, pretty=True)

    # Coverage, for the report.
    lex = {d: c for d, c in counts.items() if int(re.match(r"^H(\d+)", d).group(1)) < 9000}
    names = {d for d in lex if tbesh.get(d, {}).get("pos", "").startswith("N:")}
    tot = sum(lex.values())
    rooted = sum(c for d, c in lex.items() if d in roots)
    print(
        f"tbesh {sources[0]['entries']}, bdb {sources[1]['entries']}, strongs {sources[2]['entries']}; "
        f"roots: {len(families)} families, {len(roots)} dStrongs; occurrences reaching a root "
        f"{rooted / tot:.1%} ({sum(c for d, c in lex.items() if d in roots and d not in names) / (tot - sum(lex[d] for d in names)):.1%} without names); "
        f"distinct words with a root {sum(1 for d in lex if d in roots) / len(lex):.1%}; "
        f"words reaching BDB {sum(c for d, c in lex.items() if d in shards['bdb'][shard(d)]) / tot:.1%} of occurrences"
    )


if __name__ == "__main__":
    main(Path(sys.argv[1]))
