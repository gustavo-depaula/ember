"""Build the John 1:1-14 word-study data and embed it in the prototype pages.

    python3 -I build-data.py <source-dir> <repo-root>

<source-dir> holds the downloads, never committed:
  n1904/Nestle1904.csv    github.com/biblicalhumanities/Nestle1904 morph/ (CC-BY-SA)
  n1904/berean.xml        the same repo's glosses/ (Berean Interlinear, public domain)
  dodson.xml              github.com/biblicalhumanities/Dodson-Greek-Lexicon (CC0 / PD)
  abbott-smith.tei.xml    github.com/translatable-exegetical-tools/Abbott-Smith (PD)
  ml/ml*.xml              github.com/helmadik/MiddleLiddell (Perseus, CC-BY-SA)

The data replaces the <script id="data"> block in every page beside this file.
"""

import glob
import json
import os
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET

src, repo = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))

books = [
    ("Mt", "matthew"), ("Mk", "mark"), ("Lk", "luke"), ("Jn", "john"), ("Ac", "acts"),
    ("Rom", "romans"), ("1 Cor", "1-corinthians"), ("2 Cor", "2-corinthians"),
    ("Gal", "galatians"), ("Eph", "ephesians"), ("Phil", "philippians"),
    ("Col", "colossians"), ("1 Thess", "1-thessalonians"), ("2 Thess", "2-thessalonians"),
    ("1 Tim", "1-timothy"), ("2 Tim", "2-timothy"), ("Tit", "titus"), ("Phlm", "philemon"),
    ("Heb", "hebrews"), ("Jas", "james"), ("1 Pet", "1-peter"), ("2 Pet", "2-peter"),
    ("1 Jn", "1-john"), ("2 Jn", "2-john"), ("3 Jn", "3-john"), ("Jude", "jude"),
    ("Apoc", "apocalypse"),
]


def nfc(s):
    return unicodedata.normalize("NFC", s)


def bare(s):
    """Lowercase, no accents: the key lexica are matched on. Breathings stay (εἰς is not εἷς)."""
    d = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in d if not unicodedata.combining(c) or c in "\u0313\u0314")


# --- Nestle 1904 words ---------------------------------------------------------
book_codes = ["Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil",
              "Col", "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas", "1Pet",
              "2Pet", "1John", "2John", "3John", "Jude", "Rev"]
words = []  # every NT word: (book, chapter, verse, morph, strongs, text, lemma)
with open(os.path.join(src, "n1904", "Nestle1904.csv"), encoding="utf-8-sig") as f:
    next(f)
    for line in f:
        bcv, text, morph, _form, strongs, lemma, *_ = line.rstrip("\n").split("\t")
        book, cv = bcv.split(" ")
        c, v = cv.split(":")
        words.append((book_codes.index(book) + 1, int(c), int(v), morph, strongs.split("&")[0],
                      nfc(text), nfc(lemma)))

by_verse = {}
for w in words:
    by_verse.setdefault((w[0], w[1], w[2]), []).append(w)

# The Berean Interlinear's word-for-word glosses, by verse and word order.
berean = {}
for w in ET.parse(os.path.join(src, "n1904", "berean.xml")).getroot().iter("w"):
    if not w.get("osisId"):
        continue
    ref, n = w.get("osisId").split("!")
    berean.setdefault(ref, {})[int(n)] = (nfc(w.findtext("greek") or ""), (w.findtext("gloss") or "").strip())

# --- Dodson -------------------------------------------------------------------
ns_osis = "{http://www.crosswire.org/2008/TEIOSIS/namespace}"
dodson = {}
for e in ET.parse(os.path.join(src, "dodson.xml")).getroot().iter(ns_osis + "entry"):
    lemma, strongs = [p.strip() for p in e.get("n").split("|")]
    defs = {d.get("role"): " ".join("".join(d.itertext()).split()) for d in e.iter(ns_osis + "def")}
    orth = " ".join("".join(e.find(ns_osis + "orth").itertext()).split())
    dodson.setdefault(strongs.lstrip("0"), {"orth": nfc(orth), **defs})

# --- Abbott-Smith -------------------------------------------------------------
ns_as = "{http://www.crosswire.org/2013/TEIOSIS/namespace}"


def as_html(el, depth=0):
    """A sense tree as light HTML: glosses bold, Greek marked, references muted."""
    out = []

    def walk(node):
        tag = node.tag.replace(ns_as, "")
        if tag == "sense" and node is not el:
            out.append(f'<div class="sense"><span class="sn">{node.get("n") or ""}</span> ')
            if node.text:
                out.append(node.text)
            for c in node:
                walk(c)
                if c.tail:
                    out.append(c.tail)
            out.append("</div>")
            return
        open_, close = {
            "gloss": ("<b>", "</b>"),
            "foreign": ('<span class="gk">', "</span>") if node.get("{http://www.w3.org/XML/1998/namespace}lang") == "grc" else ("<i>", "</i>"),
            "ref": ('<span class="ref">', "</span>"),
            "emph": ("<i>", "</i>"),
        }.get(tag, ("", ""))
        if tag in ("pb", "note"):
            return
        out.append(open_)
        if node.text:
            out.append(node.text)
        for c in node:
            walk(c)
            if c.tail:
                out.append(c.tail)
        out.append(close)

    if el.text:
        out.append(el.text)
    for c in el:
        walk(c)
        if c.tail:
            out.append(c.tail)
    return re.sub(r"\s+", " ", "".join(out)).strip()


abbott, abbott_by_lemma = {}, {}
for e in ET.parse(os.path.join(src, "abbott-smith.tei.xml")).getroot().iter(ns_as + "entry"):
    if not e.get("n"):
        continue
    strongs = e.get("n").split("|")[-1].strip().lstrip("G").lstrip("0")
    occ = e.find(ns_as + "note[@type='occurrencesNT']")
    form = e.find(ns_as + "form")
    etym = e.find(ns_as + "etym")
    senses = [as_html(s) for s in e.findall(ns_as + "sense")]
    lemma = nfc(e.get("n").split("|")[0].strip())
    entry = abbott.setdefault(strongs, {
        "form": as_html(form) if form is not None else lemma,
        "lxx": as_html(etym) if etym is not None else "",
        "senses": senses,
        "occurrences": int(occ.text) if occ is not None and occ.text.isdigit() else None,
    })
    abbott_by_lemma.setdefault(lemma, entry)

# --- Middle Liddell -----------------------------------------------------------


def ml_html(node):
    out = []

    def walk(n, top=False):
        tag = n.tag
        open_, close = {
            "i": ("<i>", "</i>"),
            "foreign": ('<span class="gk">', "</span>") if n.get("lang") == "grc" else ("<i>", "</i>"),
            "ref": ('<span class="gk">', "</span>"),
            "usg": ('<span class="ref">', "</span>"),
        }.get(tag, ("", ""))
        if not top:
            out.append(open_)
        if n.text:
            out.append(n.text)
        for c in n:
            walk(c)
            if c.tail:
                out.append(c.tail)
        if not top:
            out.append(close)

    walk(node, True)
    return re.sub(r"\s+", " ", "".join(out)).strip()


liddell = {}
for path in sorted(glob.glob(os.path.join(src, "ml", "*.xml"))):
    for div in ET.parse(path).getroot().iter("div1"):
        head = div.find("head")
        if head is None or not head.text:
            continue
        key = nfc(head.text).strip()
        if key in liddell:
            continue
        alt = div.find("note[@type='alt']")
        senses = [
            {"level": int(s.get("level") or 0), "n": s.get("n") or "", "html": ml_html(s)}
            for s in div.findall("sense")
        ]
        liddell[key] = {
            "head": nfc(head.text).strip() + (nfc(alt.text) if alt is not None and alt.text else ""),
            "senses": senses,
        }

# --- Parsing, spelled out (Robinson codes) --------------------------------------
pos_names = {
    "N": "noun", "V": "verb", "T": "article", "A": "adjective", "P": "personal pronoun",
    "D": "demonstrative pronoun", "R": "relative pronoun", "C": "reciprocal pronoun",
    "F": "reflexive pronoun", "I": "interrogative pronoun", "X": "indefinite pronoun",
    "K": "correlative pronoun", "Q": "correlative pronoun", "S": "possessive pronoun",
    "PREP": "preposition", "CONJ": "conjunction", "ADV": "adverb", "PRT": "particle",
    "COND": "conditional", "INJ": "interjection", "HEB": "Hebrew word", "ARAM": "Aramaic word",
}
person = {"1": "1st person", "2": "2nd person", "3": "3rd person"}
tense = {"P": "present", "I": "imperfect", "F": "future", "A": "aorist", "R": "perfect", "L": "pluperfect"}
voice = {"A": "active", "M": "middle", "P": "passive", "E": "middle or passive", "D": "middle deponent",
         "O": "passive deponent", "N": "middle or passive deponent"}
mood = {"I": "indicative", "M": "imperative", "S": "subjunctive", "O": "optative", "N": "infinitive",
        "P": "participle", "R": "participle"}
case = {"N": "nominative", "G": "genitive", "D": "dative", "A": "accusative", "V": "vocative"}
number = {"S": "singular", "P": "plural"}
gender = {"M": "masculine", "F": "feminine", "N": "neuter"}
suffix = {"N": "negative", "I": "interrogative", "C": "comparative", "S": "superlative"}


def nominal(cng):
    """N-NSM, P-1DP, A-GSM-C: case, number, gender (and person, for some pronouns)."""
    m = re.match(r"^([123])?([NGDAV])([SP])([MFN])?$", cng)
    if not m:
        return ""
    p, c, n, g = m.groups()
    return " ".join(x for x in (person.get(p), case[c], gender.get(g), number[n]) if x)


def parse(morph):
    head, *rest = morph.split("-")
    if head == "V":
        m = re.match(r"^2?([PIFARL])([AMPEDON])([IMSONPR])$", rest[0])
        t, v, md = m.groups()
        second = "second " if rest[0].startswith("2") else ""
        spelled = f"{second}{tense[t]} {voice[v]} {mood[md]}"
        if md in "PR":
            return spelled + ", " + nominal(rest[1])
        if md == "N":
            return spelled
        p, n = rest[1][0], rest[1][1]
        return f"{spelled}, {person[p]} {number[n]}"
    if head in ("PREP", "CONJ", "ADV", "PRT", "COND", "INJ", "HEB", "ARAM"):
        return ", ".join(suffix[x] for x in rest if x in suffix)
    body = rest[0] if rest else ""
    # Possessives carry the possessor's person and number before the thing's case.
    if head == "S" and len(body) == 5:
        body = body[2:]
    extra = [suffix[x] for x in rest[1:] if x in suffix]
    return ", ".join(x for x in [nominal(body), *extra] if x)


def pos_of(morph):
    return pos_names[morph.split("-")[0]]


# --- Transliteration (SBL) ----------------------------------------------------
letters = {
    "α": "a", "β": "b", "γ": "g", "δ": "d", "ε": "e", "ζ": "z", "η": "ē", "θ": "th",
    "ι": "i", "κ": "k", "λ": "l", "μ": "m", "ν": "n", "ξ": "x", "ο": "o", "π": "p",
    "ρ": "r", "σ": "s", "ς": "s", "τ": "t", "υ": "y", "φ": "ph", "χ": "ch", "ψ": "ps", "ω": "ō",
}


def translit(word):
    d = unicodedata.normalize("NFD", word)
    cap = d[0].isupper()
    out, rough = [], False
    chars = [c for c in d if not unicodedata.combining(c) or c == "̔"]
    plain = [c.lower() for c in chars if c != "̔"]
    rough = "̔" in d
    i = 0
    while i < len(plain):
        c, nxt = plain[i], plain[i + 1] if i + 1 < len(plain) else ""
        if c == "γ" and nxt in "γκξχ":
            out.append("n")
        elif c == "υ" and i > 0 and plain[i - 1] in "αεηο":
            out.append("u")
        elif c == "ρ" and i == 0 and rough:
            out.append("rh")
            rough = False
        else:
            out.append(letters.get(c, c))
        i += 1
    s = ("h" if rough else "") + "".join(out)
    return s[0].upper() + s[1:] if cap else s


# --- Occurrences --------------------------------------------------------------
occ_by_lemma = {}
for w in words:
    occ_by_lemma.setdefault(w[4], []).append(w)

drb_cache = {}


def drb(book, chapter, verse):
    slug = books[book - 1][1]  # the Douay-Rheims files are named in its own spelling
    if slug not in drb_cache:
        drb_cache[slug] = json.load(open(os.path.join(repo, "content/bible/drb", f"{slug}.json"), encoding="utf-8"))
    return drb_cache[slug].get(str(chapter), {}).get(str(verse), "")


def snippet(book, chapter, verse, at_text):
    """The Greek verse, cut to a few words either side of the occurrence."""
    vw = [w[5] for w in by_verse[(book, chapter, verse)]]
    i = next((k for k, t in enumerate(vw) if t == at_text), 0)
    lo, hi = max(0, i - 4), min(len(vw), i + 5)
    return {"before": ("… " if lo else "") + " ".join(vw[lo:i]), "word": vw[i], "after": " ".join(vw[i + 1:hi]) + (" …" if hi < len(vw) else "")}


def samples(lemma, here_ref):
    """One more place in John, then one in each book it is found in; a rare word fills up from any."""
    occ = [w for w in occ_by_lemma[lemma] if (w[0], w[1], w[2]) != here_ref]
    near = [w for w in occ if w[0] == 4 and (w[1], w[2]) > here_ref[1:]][:1]
    seen_books, picked = {4} if near else set(), list(near)
    for w in occ:
        if w[0] not in seen_books and len(picked) < 4:
            seen_books.add(w[0])
            picked.append(w)
    for w in occ:
        if w not in picked and len(picked) < 4:
            picked.append(w)
    picked.sort(key=lambda w: (w[0] != 4, w[0], w[1], w[2]))
    return [{"ref": f"{books[w[0] - 1][0]} {w[1]}:{w[2]}", **snippet(w[0], w[1], w[2], w[5]), "drb": drb(w[0], w[1], w[2])}
            for w in picked]


def lookup(lexicon, lemma):
    """By the exact lemma, else by its letters alone (accents differ between editions)."""
    if lemma in lexicon:
        return lexicon[lemma]
    key = bare(lemma)
    return next((e for k, e in lexicon.items() if bare(k) == key), None)


# Middle Liddell heads Attic spellings where the NT has the Koine ones.
attic = {"γίνομαι": "γίγνομαι", "γινώσκω": "γιγνώσκω"}


def trim(entry, budget=3500):
    """The opening senses only: a sheet shows the head of an entry, not all of it."""
    if not entry:
        return entry
    kept, used = [], 0
    for sense in entry["senses"]:
        if used > budget:
            break
        kept.append(sense)
        used += len(sense["html"])
    return {**entry, "senses": kept, "more": len(entry["senses"]) - len(kept)}


# --- John 1:1-14 --------------------------------------------------------------
lemmas, verses = {}, []
for v in range(1, 15):
    vw = by_verse[(4, 1, v)]
    glosses = berean[f"John.1.{v}"]
    verse_words = []
    for i, w in enumerate(vw, 1):
        _b, _c, _v, morph, strongs, text, lemma = w
        lead, core, trail = re.match(r"^(\W*)(.+?)([^\w’]*)$", text).groups()
        g_greek, gloss = glosses.get(i, ("", ""))
        if bare(g_greek.strip(".,;·")) != bare(core):
            print(f"gloss misaligned at 1:{v} word {i}: {core} / {g_greek}")
        verse_words.append({"t": core, "p": trail, "lead": lead, "s": strongs, "l": lemma,
                            "parse": parse(morph), "code": morph, "g": gloss})
        if strongs not in lemmas:
            d = dodson.get(strongs) or {}
            occ = occ_by_lemma[strongs]
            lemmas[strongs] = {
                "lemma": lemma,
                "translit": translit(lemma),
                "gloss": d.get("brief", ""),
                "dodson": d.get("full", ""),
                "orth": d.get("orth", lemma),
                "pos": pos_of(morph),
                "count": len(occ),
                "inJohn": sum(1 for o in occ if o[0] == 4),
                # Abbott-Smith numbers a few common words apart from Strong's.
                "abbott": abbott.get(strongs) or lookup(abbott_by_lemma, lemma),
                "liddell": trim(lookup(liddell, attic.get(lemma, lemma))),
                "samples": samples(strongs, (4, 1, v)),
            }
    verses.append({"n": v, "words": verse_words})

drb_john = json.load(open(os.path.join(repo, "content/bible/drb/john.json"), encoding="utf-8"))["1"]
vg_john = json.load(open(os.path.join(repo, "content/bible/vulgate/john.json"), encoding="utf-8"))["1"]
data = {
    "edition": "Nestle 1904",
    "verses": verses,
    "lemmas": lemmas,
    "translations": {
        "drb": {"name": "Douay-Rheims", "verses": {str(v): drb_john[str(v)] for v in range(1, 15)}},
        "vulgate": {"name": "Vulgate", "verses": {str(v): vg_john[str(v)] for v in range(1, 15)}},
    },
}

for n, e in lemmas.items():
    gaps = [name for name, key in (("Dodson", "gloss"), ("Abbott-Smith", "abbott"), ("Liddell", "liddell")) if not e[key]]
    if gaps:
        print(f"{e['lemma']} (G{n}) is not in", ", ".join(gaps))

blob = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
for page in glob.glob(os.path.join(here, "*.html")):
    html = open(page, encoding="utf-8").read()
    new = re.sub(r'(<script id="data" type="application/json">).*?(</script>)',
                 lambda m: m.group(1) + blob + m.group(2), html, flags=re.S)
    if new != html:
        open(page, "w", encoding="utf-8").write(new)
        print("embedded in", os.path.basename(page))
print(f"{len(verses)} verses, {sum(len(v['words']) for v in verses)} words, {len(lemmas)} lemmas, {len(blob) // 1024} KB")
