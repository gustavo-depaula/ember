#!/usr/bin/env python3
"""Build content/bible/hebrew-wlc/ from the Westminster Leningrad Codex.

Sources (each licence read in the repo it comes from):

    WLC         github.com/openscriptures/morphhb wlc/<Book>.xml (OSIS): the
                Westminster Leningrad Codex word by word, public domain
                (README.md: "This work is based on The Westminster Leningrad
                Codex, which is in the public domain"); its lemmas and
                morphology are the Open Scriptures Hebrew Bible's, CC BY 4.0
                (LICENSE.md: "Original work of the Open Scriptures Hebrew Bible
                available at https://github.com/openscriptures/morphhb").
                The text, the written/read (ketiv/qere) notes, the maqaf,
                paseq and sof pasuq, and the open/closed paragraph marks.
    TAHOT       github.com/STEPBible/STEPBible-Data "Translators Amalgamated
                OT+NT/TAHOT *.txt", CC BY 4.0 (README.md: "STEPBible Data
                Repository CC BY 4.0"; each file: "STEPBible.org CC BY"): the
                same codex word by word, each word split into its pieces with
                the extended Strong's number (dStrong), the English gloss and
                the grammar code of each piece, and the transliteration.

Writes, beside the other Bibles:
    index.json          the 39 books, in the Douay's order, with its names
    <slug>.json         {chapter: {verse: text}} in the Hebrew numbering. Words
                        are separated by one space, except after a maqaf, which
                        joins two words with no space. The app splits a verse
                        into tokens on whitespace and after every maqaf.
    words/<slug>.json   {chapter: {verse: [entry per token]}}:
                        {"p": [[dStrong, gloss, morph, piece], ...],
                         "t": transliteration,
                         "q": read form, "w": written form}   (q and w only
                        where the codex writes one thing and reads another).
                        A punctuation token (the paseq ׀, the inverted nun ׆)
                        is {"p": []}.
    paragraphs.json     {slug: {"c:v": "p" | "s"}}: an open (פ) or closed (ס)
                        paragraph mark after the verse.
    paragraphs-inside.json  {slug: {"c:v": [[n, "p" | "s"], ...]}}: the marks the
                        codex sets inside a verse (Gen 35:22), after its first
                        n tokens.

The words are the WLC's; TAHOT's study of each is aligned to them verse by
verse on their consonants (difflib over the words' consonant skeletons). TAHOT
follows the read form where the codex writes one thing and reads another, so a
written word is matched on its read form. Where the codex prints the written
consonants with the read form's vowels TAHOT records that print ("L= ..."),
and the text shows it once its consonants are checked against the written
form; otherwise the written consonants stand bare, as the WLC gives them.

God's Name: the Church does not pronounce it (Congregation for Divine Worship,
letter of 29 June 2008), so where a piece is the Tetragrammaton the data gives
what is read aloud. H3068 (read Adonai) is glossed "the LORD"; H3069 (pointed
to be read Elohim, after Adonai: "Lord GOD") "GOD". The transliteration of the
token is "YHWH" (with any prefix pieces' sounds kept: "la·YHWH").

Usage: python3 -I scripts/hebrew-bible/wlc.py <downloads dir>
       (the dir holds wlc-<Book>.xml and gendeu/josest/jobsng/isamal.txt)
"""
from __future__ import annotations

import difflib
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import (  # noqa: E402
    BOOKS,
    MAQAF,
    OUT,
    PASEQ,
    SLUG_OF_TAHOT,
    SOF_PASUQ,
    douay_order,
    dump,
    nfc,
    skeleton,
    tokens,
)

OSIS = "{http://www.bibletechnologies.net/2003/OSIS/namespace}"
NAME = re.compile(r"^H306[89]")
INVERTED_NUN = "\u05c6"

# ── TAHOT ─────────────────────────────────────────────────────────────────────

ROW = re.compile(r"^(\d?[A-Z][a-z]{1,2})\.(\d+)\.(\d+)(?:\((\d+)\.(\d+)\))?#(\d+)=(\S+)\t")


def read_tahot(src: Path) -> dict:
    """{(slug, hebrew chapter, hebrew verse): [word]} for every word of the
    codex (not the words BHS reconstructs from the Septuagint, type X)."""
    out: dict = defaultdict(list)
    for name in ("gendeu.txt", "josest.txt", "jobsng.txt", "isamal.txt"):
        for line in (src / name).read_text(encoding="utf-8").splitlines():
            m = ROW.match(line)
            if not m:
                continue
            book, ec, ev, hc, hv, _, kind = m.groups()
            if kind.startswith("X"):
                continue
            hc, hv = (int(hc), int(hv)) if hc else (int(ec), int(ev))
            out[(SLUG_OF_TAHOT[book], hc, hv)].append(parse_tahot(kind, line.split("\t")))
    return out


def parse_tahot(kind: str, cols: list[str]) -> dict:
    """One TAHOT word: its pieces (Hebrew, dStrong, gloss, grammar), its
    transliteration, and for a read form, the print of the written one."""
    # Pieces are split by "/"; the marks after a piece (maqaf, paseq, sof pasuq,
    # paragraph letters, and their codes) follow a "\\" inside it.
    pieces = [nfc(p.split("\\")[0]) for p in cols[1].split("/")]
    strongs = [p.split("\\")[0] for p in cols[4].split("/")]
    glosses = [g.strip() for g in cols[3].split("/")]
    morph = cols[5]
    lang = morph[:1]
    codes = morph[1:].split("/") if morph else []
    out = []
    for i, h in enumerate(pieces):
        out.append(
            {
                "h": h.strip(),
                "s": strongs[i].strip().strip("{}") if i < len(strongs) else "",
                "g": glosses[i] if i < len(glosses) else "",
                "m": (lang + codes[i]) if i < len(codes) else "",
            }
        )
    word = {"kind": kind, "pieces": out, "x": cols[2], "skel": skeleton("".join(pieces))}
    if kind.startswith("Q"):
        variants = " ".join(cols[6:8])
        lm = re.search(r"L= ([^\s¦;]+)", variants)
        if lm:
            # The word alone: TAHOT writes its maqaf, paseq or sof pasuq after a "\".
            word["print"] = nfc(re.sub(r"[/\\־׀׃ ]", "", lm.group(1)))
    return word


# ── WLC ───────────────────────────────────────────────────────────────────────


def read_wlc(path: Path) -> dict:
    """{(chapter, verse): [item]} in order: words, and the marks between them.

    A word: {"w": text, "pieces": [...], "lemma", "morph", "ketiv": bool,
    "qere": [read pieces] | None}. A mark: {"seg": "maqaf" | "paseq" |
    "sof" | "pe" | "samekh" | "nun"}."""
    root = ET.parse(path).getroot()
    verses: dict = {}
    for ve in root.iter(f"{OSIS}verse"):
        _, c, v = ve.get("osisID").split(".")
        items: list[dict] = []
        for el in ve:
            tag = el.tag.replace(OSIS, "")
            if tag == "w":
                text = nfc("".join(el.itertext()))
                items.append(
                    {
                        "w": text.replace("/", ""),
                        "pieces": text.split("/"),
                        "lemma": el.get("lemma", ""),
                        "morph": el.get("morph", ""),
                        "ketiv": el.get("type") == "x-ketiv",
                        "qere": None,
                    }
                )
            elif tag == "note" and el.get("type") == "variant":
                rdg = el.find(f"{OSIS}rdg")
                if rdg is not None and rdg.get("type") == "x-qere":
                    # The read form belongs to the run of written words just
                    # before it (Job 38:1 מנ הסערה, read מִן הַסְּעָרָה): word for
                    # word where the counts agree, else the whole run shares it.
                    read = [[nfc(p) for p in "".join(qw.itertext()).split("/")] for qw in rdg.findall(f"{OSIS}w")]
                    run = []
                    for it in reversed(items):
                        if "w" not in it:
                            if it.get("seg") == "maqaf":
                                continue
                            break
                        if not it["ketiv"] or it["qere"] is not None:
                            break
                        run.insert(0, it)
                    if len(run) == len(read) and len(run) > 1:
                        for it, r in zip(run, read):
                            it["qere"] = [r]
                    else:
                        for it in run:
                            it["qere"] = read
                            if len(run) > 1:
                                it["qere_shared"] = True
            elif tag == "seg":
                kind = {
                    "x-maqqef": "maqaf",
                    "x-paseq": "paseq",
                    "x-sof-pasuq": "sof",
                    "x-pe": "pe",
                    "x-samekh": "samekh",
                    "x-reversednun": "nun",
                }.get(el.get("type"))
                if kind:
                    items.append({"seg": kind})
        verses[(int(c), int(v))] = items
    return verses


# ── Alignment ─────────────────────────────────────────────────────────────────


def read_skel(word: dict) -> str:
    """What the codex reads at a word: the read form's consonants for a
    written one (which may be several words, or none)."""
    if word["ketiv"] and word["qere"] is not None:
        return skeleton("".join("".join(q) for q in word["qere"]))
    return skeleton(word["w"])


report: list[dict] = []
FIXES: dict = {}  # filled from fixes.py: hand-aligned places


def align(slug: str, c: int, v: int, words: list[dict], tahot: list[dict]) -> list[dict | None]:
    """For each WLC word, the TAHOT word(s) that study it (a list, usually one),
    or None. Equal skeletons pair up; inside a differing stretch, a run of WLC
    words whose joined consonants equal a run of TAHOT words' share them."""
    fix = FIXES.get((slug, c, v))
    if fix is not None:
        return [[tahot[j] for j in js] if js else None for js in fix]
    a = [read_skel(w) for w in words]
    b = [t["skel"] for t in tahot]
    out: list = [None] * len(words)
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                out[i1 + k] = [tahot[j1 + k]]
            continue
        if op == "replace" and i2 - i1 == j2 - j1:
            for k in range(i2 - i1):
                out[i1 + k] = [tahot[j1 + k]]
            if any(a[i1 + k] != b[j1 + k] for k in range(i2 - i1)):
                report.append({"ref": f"{slug} {c}:{v}", "op": "replace-same-count",
                               "wlc": [words[i]["w"] for i in range(i1, i2)],
                               "tahot": ["".join(p["h"] for p in tahot[j]["pieces"]) for j in range(j1, j2)]})
            continue
        if op in ("replace", "delete") and "".join(a[i1:i2]) == "".join(b[j1:j2]) and j2 > j1:
            # Word division differs: several WLC words one TAHOT word (בַּל אֻמִּים
            # → בלאמים) or the other way; each WLC word takes the TAHOT words
            # whose consonants it holds, or shares the one that spans it.
            spans = []
            pos = 0
            for t in tahot[j1:j2]:
                spans.append((pos, pos + len(t["skel"]), t))
                pos += len(t["skel"])
            pos = 0
            taken: set = set()
            for i in range(i1, i2):
                lo, hi = pos, pos + len(a[i])
                hits = [t for s, e, t in spans if s < hi and e > lo]
                fresh = [t for t in hits if id(t) not in taken]
                # A TAHOT word already given to the word before is studied
                # there: this one is the second half of it on the page.
                out[i] = fresh or ("joined" if hits else None)
                taken.update(id(t) for t in hits)
                pos = hi
            report.append({"ref": f"{slug} {c}:{v}", "op": "division",
                           "wlc": [words[i]["w"] for i in range(i1, i2)],
                           "tahot": ["".join(p["h"] for p in t["pieces"]) for t in tahot[j1:j2]]})
            continue
        report.append({"ref": f"{slug} {c}:{v}", "op": op,
                       "wlc": [words[i]["w"] for i in range(i1, i2)],
                       "tahot": ["".join(p["h"] for p in t["pieces"]) for t in tahot[j1:j2]]})
    return out


# ── Entries ───────────────────────────────────────────────────────────────────

# A prefix letter in the WLC's lemma → STEP's dStrong for it, learned from the
# aligned words (filled by `learn`); used only for a word TAHOT does not reach.
prefix_strong: dict = {}
gloss_of: dict = {}  # dStrong → its commonest TAHOT gloss
strong_of_number: dict = {}  # Strong's number → its commonest dStrong
translit_of_form: dict = {}  # a pointed form → its TAHOT transliteration


def name_override(pieces: list[list[str]], x: str) -> tuple[list[list[str]], str]:
    """God's Name read as the Church reads it (see the module docstring)."""
    hit = False
    for p in pieces:
        if NAME.match(p[0]):
            p[1] = "the LORD" if p[0].startswith("H3068") else "GOD"
            hit = True
    if not hit:
        return pieces, x
    # Keep the sounds of the prefixes before the Name (la./, va./, me.), drop the rest.
    parts = x.split("/")
    keep = [s for s, p in zip(parts, pieces) if not NAME.match(p[0])]
    lead = [s for s in keep[: next(i for i, p in enumerate(pieces) if NAME.match(p[0]))]]
    return pieces, "/".join([*lead, "YHWH"]) if lead else "YHWH"


def entry_from_tahot(word: dict, ts: list[dict]) -> dict:
    """The words-file entry for a WLC word studied by TAHOT word(s) `ts`."""
    pieces: list[list[str]] = []
    xs = []
    for t in ts:
        xs.append(t["x"])
        for p in t["pieces"]:
            if not p["h"] and not p["s"]:
                continue  # the space inside a multi-word read form ("/ /")
            pieces.append([p["s"], p["g"], p["m"], p["h"]])
    # The piece texts are the WLC's own where it splits the word the same way
    # (TAHOT may point a word differently, or follow its read form).
    if not word["ketiv"] and len(ts) == 1 and len(word["pieces"]) == len(pieces):
        for p, h in zip(pieces, word["pieces"]):
            p[3] = h
    # TAHOT's transliteration now and then carries a stray Hebrew point.
    x = re.sub(r"[֑-ׇ]", "", " ".join(xs))
    pieces, x = name_override(pieces, x)
    return {"p": pieces, "t": x}


def entry_fallback(word: dict) -> dict:
    """An entry for a word TAHOT does not reach, from the WLC's own lemma and
    morphology: each piece's dStrong from its Strong's number (or prefix
    letter), its gloss the commonest TAHOT gloss of that dStrong."""
    lemmas = word["lemma"].split("/")
    morph = word["morph"]
    lang = morph[:1]
    codes = morph[1:].split("/") if morph else []
    pieces = []
    for i, h in enumerate(word["pieces"]):
        lem = lemmas[i].strip() if i < len(lemmas) else ""
        num = re.match(r"^(\d+)", lem)
        if num:
            d = strong_of_number.get(int(num.group(1)), f"H{int(num.group(1)):04d}")
        else:
            d = prefix_strong.get(lem, "")
        pieces.append([d, gloss_of.get(d, ""), (lang + codes[i]) if i < len(codes) else "", h])
    x = translit_of_form.get(word["w"], "")
    pieces, x = name_override(pieces, x)
    return {"p": pieces, "t": x}


def learn(wlc: dict, tahot: dict) -> None:
    """The fallback tables, from words both sources agree on."""
    glosses: dict = defaultdict(Counter)
    numbers: dict = defaultdict(Counter)
    prefixes: dict = defaultdict(Counter)
    for key, ts in tahot.items():
        for t in ts:
            translit_of_form.setdefault(nfc("".join(p["h"] for p in t["pieces"])), t["x"])
            for p in t["pieces"]:
                if p["s"]:
                    glosses[p["s"]][p["g"]] += 1
                    m = re.match(r"^H(\d+)", p["s"])
                    if m and int(m.group(1)) < 9000:
                        numbers[int(m.group(1))][p["s"]] += 1
    for (slug, c, v), items in wlc.items():
        ts = tahot.get((slug, c, v), [])
        ws = [it for it in items if "w" in it]
        if len(ws) != len(ts):
            continue
        for w, t in zip(ws, ts):
            lemmas = w["lemma"].split("/")
            if len(lemmas) != len(t["pieces"]):
                continue
            for lem, p in zip(lemmas, t["pieces"]):
                lem = lem.strip()
                if lem and not lem[0].isdigit() and p["s"].startswith("H9"):
                    prefixes[lem][p["s"]] += 1
    gloss_of.update({d: c.most_common(1)[0][0] for d, c in glosses.items()})
    strong_of_number.update({n: c.most_common(1)[0][0] for n, c in numbers.items()})
    prefix_strong.update({k: c.most_common(1)[0][0] for k, c in prefixes.items()})


# ── Build ─────────────────────────────────────────────────────────────────────


def build_verse(slug: str, c: int, v: int, items: list[dict], tahot: list[dict]) -> tuple[str, list, str | None, list]:
    """A verse's text, its words entries (one per token), the paragraph mark
    after it, and any paragraph marks inside it (as (token index, mark))."""
    words = [it for it in items if "w" in it]
    studied = align(slug, c, v, words, tahot)
    toks: list[str] = []
    entries: list[dict] = []
    para = None
    inside = []
    wi = 0
    for n, it in enumerate(items):
        if "w" in it:
            ts = studied[wi]
            wi += 1
            if ts == "joined":
                entry = {"p": [], "j": 1}
                ts = None
            else:
                entry = entry_from_tahot(it, ts) if ts else entry_fallback(it)
                # TAHOT leaves empty a word it reads as not read (2 Sam 13:33
                # אִם־) where the codex points it as read: study it from the WLC.
                if ts and not entry["p"] and not it["ketiv"]:
                    entry, ts = entry_fallback(it), None
            text = it["w"]
            if ts:
                entry["from_tahot"] = True
            if it.get("qere_shared"):
                entry["shared"] = it["qere"]
            if it["ketiv"]:
                read = it["qere"] or []
                entry["w"] = text
                entry["q"] = " ".join("".join(q) for q in read)
                # The codex prints the written consonants with the read
                # form's vowels; TAHOT records that print ("L= ...").
                prints = [t.get("print") for t in (ts or []) if t.get("print")]
                if prints and skeleton(prints[0]) == skeleton(text):
                    text = prints[0]
                if not read:
                    entry["q"] = ""  # written, not read
            toks.append(text)
            entries.append(entry)
        elif it["seg"] == "maqaf" and toks:
            toks[-1] += MAQAF
        elif it["seg"] == "sof" and toks:
            # A maqaf before the verse's end binds the word to one read but
            # not written (2 Sam 8:3 בִּֽנְהַר־[פְּרָת]); with nothing after it on
            # the page it would split off the sof pasuq as a token of its own.
            if toks[-1].endswith(MAQAF):
                toks[-1] = toks[-1][:-1]
                report.append({"ref": f"{slug} {c}:{v}", "op": "maqaf-before-end"})
            toks[-1] += SOF_PASUQ
        elif it["seg"] in ("paseq", "nun"):
            toks.append(PASEQ if it["seg"] == "paseq" else INVERTED_NUN)
            entries.append({"p": []})
        elif it["seg"] in ("pe", "samekh"):
            mark = "p" if it["seg"] == "pe" else "s"
            rest = items[n + 1 :]
            if any("w" in r for r in rest):
                inside.append((len(toks), mark))
            else:
                para = mark
    # A read form shared by a run of written words (2 Kgs 6:25 חרי יונים, read
    # דִּבְיוֹנִים) is studied once, on the first; the others are joined to it.
    word_tokens = [k for k, e in enumerate(entries) if "w" in e]
    k = 0
    while k < len(word_tokens):
        first = word_tokens[k]
        run = [first]
        while (
            k + len(run) < len(word_tokens)
            and word_tokens[k + len(run)] == run[-1] + 1
            and entries[first].get("shared") is not None
            and entries[word_tokens[k + len(run)]].get("shared") is entries[first]["shared"]
        ):
            run.append(word_tokens[k + len(run)])
        if len(run) > 1:
            pieces, xs, seen = [], [], set()
            studied_run = [r for r in run if entries[r].get("from_tahot")] or run
            for r in studied_run:
                for p in entries[r]["p"]:
                    if (p[0], p[3]) not in seen:
                        seen.add((p[0], p[3]))
                        pieces.append(p)
                if entries[r].get("t") and entries[r]["t"] != "[ ]" and entries[r].get("from_tahot"):
                    xs.append(entries[r]["t"])
            entries[first]["p"] = pieces
            entries[first]["t"] = " ".join(dict.fromkeys(xs))
            for r in run[1:]:
                entries[r] = {"p": [], "j": 1, "w": entries[r]["w"], "q": entries[r]["q"]}
        k += len(run)
    for e in entries:
        e.pop("shared", None)
        e.pop("from_tahot", None)
        if e.get("t") == "[ ]":
            e["t"] = ""
    # Join: one space between tokens, none after a maqaf.
    text = ""
    for t in toks:
        text += t if not text or text.endswith(MAQAF) else " " + t
    assert len(tokens(text)) == len(entries), (slug, c, v, text)
    return text, entries, para, inside


def main(src: Path) -> None:
    tahot = read_tahot(src)
    wlc: dict = {}
    for slug, name, _, _ in BOOKS:
        for (c, v), items in read_wlc(src / f"wlc-{name}.xml").items():
            wlc[(slug, c, v)] = items
    learn(wlc, tahot)
    try:
        import fixes  # noqa: PLC0415  (hand-aligned places, beside this script)

        FIXES.update(fixes.FIXES)
    except ImportError:
        pass

    books: dict = defaultdict(dict)
    words: dict = defaultdict(dict)
    paragraphs: dict = defaultdict(dict)
    inside_marks: list = []
    missing_tahot = []
    for (slug, c, v), items in wlc.items():
        ts = tahot.get((slug, c, v))
        if ts is None:
            missing_tahot.append(f"{slug} {c}:{v}")
            ts = []
        text, entries, para, inside = build_verse(slug, c, v, items, ts)
        books[slug].setdefault(str(c), {})[str(v)] = text
        words[slug].setdefault(str(c), {})[str(v)] = entries
        if para:
            paragraphs[slug][f"{c}:{v}"] = para
        for at, mark in inside:
            inside_marks.append((slug, c, v, at, mark))

    for slug in books:
        dump(OUT / f"{slug}.json", books[slug])
        dump(OUT / "words" / f"{slug}.json", words[slug])
    order = {b["slug"]: b["name"] for b in douay_order()}
    index = [
        {"slug": s, "name": order[s], "testament": "ot", "chapters": max(int(c) for c in books[s])}
        for s in order
        if s in books
    ]
    dump(OUT / "index.json", index, pretty=True)
    dump(OUT / "paragraphs.json", {s: paragraphs[s] for s in order if s in paragraphs}, pretty=True)
    inside: dict = defaultdict(lambda: defaultdict(list))
    for slug, c, v, at, mark in inside_marks:
        inside[slug][f"{c}:{v}"].append([at, mark])
    dump(OUT / "paragraphs-inside.json", {s: inside[s] for s in order if s in inside}, pretty=True)

    # What did not line up, for fixes.py and the report.
    glossless = [
        (slug, c, v, i, e)
        for slug, chs in words.items()
        for c, vs in chs.items()
        for v, es in vs.items()
        for i, e in enumerate(es)
        if e["p"] and not any(p[1] for p in e["p"])
    ]
    print(f"verses {len(wlc)}; TAHOT missing for {len(missing_tahot)}: {missing_tahot[:20]}", file=sys.stderr)
    print(f"alignment notes: {len(report)}; paragraph marks inside verses: {len(inside_marks)}", file=sys.stderr)
    print(f"tokens without any gloss: {len(glossless)}", file=sys.stderr)
    log = Path("/tmp/hebtools/wlc-report.json")
    dump(log, {"report": report, "inside": inside_marks, "missing": missing_tahot,
               "glossless": [f"{s} {c}:{v} #{i} {e}" for s, c, v, i, e in glossless]}, pretty=True)
    print(f"details: {log}", file=sys.stderr)


if __name__ == "__main__":
    main(Path(sys.argv[1]))
