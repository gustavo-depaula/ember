"""Build the Hebrew word-study data and embed it in the prototype pages.

    python3 -I build-data.py <source-dir> <repo-root>

<source-dir> holds the downloads, never committed:
  gendeu.txt josest.txt jobsng.txt isamal.txt
      STEPBible TAHOT (Translators Amalgamated Hebrew OT), CC BY 4.0,
      github.com/STEPBible/STEPBible-Data "Translators Amalgamated OT+NT/":
      the Leningrad text word by word, split into its pieces, with
      transliteration, gloss, extended Strong's and grammar of each piece.
  tbesh.txt   STEPBible TBESH (brief lexicon of extended Strong's), CC BY 4.0
  tehmc.txt   STEPBible TEHMC (Hebrew morphology codes, expanded), CC BY 4.0
  BrownDriverBriggs.xml, LexicalIndex.xml, HebrewStrong.xml
      github.com/openscriptures/HebrewLexicon: BDB and Strong's text public
      domain, markup and the lexical index CC BY 4.0.

<repo-root> gives the Douay, Vulgate and Brenton Septuagint (content/bible/).

Roots come from BDB's own arrangement as the lexical index records it: each
index entry is either a root ("main", with the root's letters and the ids of
the words derived from it) or a word filed under one ("sub", naming its root
entry). TAHOT's "Root dStrong" column is not a root: it is the word's own
lexical entry.

The data replaces the <script id="data"> block in every page beside this file.
"""

import json
import os
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict

src, repo = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
bible = os.path.join(repo, "content", "bible")
NS = "{http://openscriptures.github.com/morphhb/namespace}"


def nfc(s):
    return unicodedata.normalize("NFC", s)


# --- TAHOT ---------------------------------------------------------------------

ROW = re.compile(r"^(\d?[A-Z][a-z]{1,2})\.(\d+)\.(\d+)(?:\((\d+)\.(\d+)\))?#(\d+)=(\S+)\t")
words_by_verse = defaultdict(list)  # (book, heb chapter, heb verse) -> [word]
eng_of = {}  # (book, heb c, heb v) -> (eng c, eng v)
order = []  # verse keys in canonical order

for name in ("gendeu.txt", "josest.txt", "jobsng.txt", "isamal.txt"):
    with open(os.path.join(src, name), encoding="utf-8") as f:
        for line in f:
            m = ROW.match(line)
            if not m:
                continue
            book, ec, ev, hc, hv, _, kind = m.groups()
            if kind.startswith("X"):  # reconstructed from the LXX, not in the codex
                continue
            cols = line.rstrip("\n").split("\t")
            hc, hv = (int(hc), int(hv)) if hc else (int(ec), int(ev))
            key = (book, hc, hv)
            if key not in eng_of:
                eng_of[key] = (int(ec), int(ev))
                order.append(key)
            words_by_verse[key].append({"kind": kind, "cols": cols})


def split_word(raw):
    """TAHOT's Hebrew field: pieces split by "/", marks after "\\"."""
    parts = raw.split("\\")
    pieces = [nfc(p) for p in parts[0].split("/")]
    tail = parts[1:]
    return pieces, tail


def parse(word):
    cols = word["cols"]
    pieces, tail = split_word(cols[1])
    strongs = cols[4].split("\\")[0].split("/")
    glosses = [g.strip() for g in cols[3].split("/")]
    morph = cols[5]
    lang = morph[:1]
    codes = morph[1:].split("/") if morph else []
    main = next((i for i, s in enumerate(strongs) if s.startswith("{")), 0)
    out = []
    for i, h in enumerate(pieces):
        s = strongs[i].strip("{}") if i < len(strongs) else ""
        out.append({
            "h": h,
            "g": glosses[i] if i < len(glosses) else "",
            "s": s,
            "m": (lang + codes[i]) if i < len(codes) else "",
        })
    mq = "־" in tail
    para = "open" if "פ" in tail else "closed" if "ס" in tail else None
    w = {
        "t": "".join(pieces),
        "x": cols[2],
        "p": out,
        "k": out[main]["s"] if out else "",
        "mi": main,
    }
    if mq:
        w["mq"] = 1
    if "׃" in tail:
        w["end"] = 1
    if "׀" in tail:
        w["pq"] = 1
    if para:
        w["para"] = para
    kind = word["kind"]
    if kind.startswith("Q"):
        # The written form (ketiv) is in "Meaning Variants" when it changes the
        # sense ("K= ve./Lo' (וְ/לֹא) "and/ not" ..."), else in "Spelling
        # Variants" as bare letters ("L= ... ;K= הוֹצֵא").
        variants = " ".join(cols[6:8])
        km = re.search(r"K= (\S+) \(([^)]*)\) \"([^\"]*)\"", variants)
        ks = re.search(r"K= ([\u0590-\u05FF]+)", variants)
        w["q"] = {
            "sense": kind.startswith("Q(K"),
            "ketiv": nfc((km.group(2) if km else ks.group(1) if ks else "").replace("/", "").replace("\\", "")),
            "kx": km.group(1) if km else "",
            "kg": km.group(3) if km else "",
        }
    return w


# God's Name: Catholic usage does not pronounce it (Congregation for Divine
# Worship, letter of 29 June 2008), so its gloss and sound are those read aloud.
NAME = re.compile(r"^H306[89]")


def name_override(w):
    for p in w["p"]:
        if NAME.match(p["s"]):
            p["g"] = "the LORD" if p["s"].startswith("H3068") else "GOD"
            p["name"] = 1
            w["x"] = "Adonai" if p["s"].startswith("H3068") else "Elohim"
            w["name"] = 1
    return w


# --- occurrences ---------------------------------------------------------------

count = Counter()
where = defaultdict(list)
for key in order:
    for i, word in enumerate(words_by_verse[key]):
        strongs = word["cols"][4].split("\\")[0]
        m = re.search(r"\{(H\d+[A-Z]?)\}", strongs)
        if m:
            count[m.group(1)] += 1
            where[m.group(1)].append((key, i))

# --- Douay, Vulgate, Septuagint -----------------------------------------------

slug = {
    "Gen": "genesis", "Exo": "exodus", "Lev": "leviticus", "Num": "numbers", "Deu": "deuteronomy",
    "Jos": "josue", "Jdg": "judges", "Rut": "ruth", "1Sa": "1-kings", "2Sa": "2-kings",
    "1Ki": "3-kings", "2Ki": "4-kings", "1Ch": "1-paralipomenon", "2Ch": "2-paralipomenon",
    "Ezr": "1-esdras", "Neh": "2-esdras", "Est": "esther", "Job": "job", "Psa": "psalms",
    "Pro": "proverbs", "Ecc": "ecclesiastes", "Sng": "canticles", "Isa": "isaias", "Jer": "jeremias",
    "Lam": "lamentations", "Ezk": "ezechiel", "Dan": "daniel", "Hos": "osee", "Jol": "joel",
    "Amo": "amos", "Oba": "abdias", "Jon": "jonas", "Mic": "micheas", "Nam": "nahum",
    "Hab": "habacuc", "Zep": "sophonias", "Hag": "aggeus", "Zec": "zacharias", "Mal": "malachias",
}
douay_name = {
    "genesis": "Gen", "exodus": "Ex", "leviticus": "Lev", "numbers": "Num", "deuteronomy": "Deut",
    "josue": "Jos", "judges": "Judg", "ruth": "Ruth", "1-kings": "1 Kgs", "2-kings": "2 Kgs",
    "3-kings": "3 Kgs", "4-kings": "4 Kgs", "1-paralipomenon": "1 Par", "2-paralipomenon": "2 Par",
    "1-esdras": "1 Esd", "2-esdras": "2 Esd", "esther": "Esth", "job": "Job", "psalms": "Ps",
    "proverbs": "Prov", "ecclesiastes": "Eccl", "canticles": "Cant", "isaias": "Is",
    "jeremias": "Jer", "lamentations": "Lam", "ezechiel": "Ez", "daniel": "Dan", "osee": "Os",
    "joel": "Joel", "amos": "Amos", "abdias": "Abd", "jonas": "Jon", "micheas": "Mich",
    "nahum": "Nah", "habacuc": "Hab", "sophonias": "Soph", "aggeus": "Agg", "zacharias": "Zach",
    "malachias": "Mal",
}
cache = {}


def load(edition, book):
    k = (edition, book)
    if k not in cache:
        with open(os.path.join(bible, edition, f"{book}.json"), encoding="utf-8") as f:
            cache[k] = json.load(f)
    return cache[k]


def vulgate_psalm(c, v):
    """Hebrew psalm numbering → the Vulgate's, for the psalms that map whole."""
    if c <= 8 or c >= 148:
        return c, v
    if c in (9, 10, 114, 115, 116, 147):
        return None
    return c - 1, v


def shared(key):
    """The Vulgate (Douay) address of a Hebrew verse, as far as the prototype needs."""
    book, hc, hv = key
    if book == "Psa":
        a = vulgate_psalm(hc, hv)
        return ("psalms", *a) if a else None
    ec, ev = eng_of[key]
    return (slug[book], ec, ev)


def douay(addr):
    if not addr:
        return None
    b, c, v = addr
    try:
        return load("drb", b)[str(c)][str(v)]
    except KeyError:
        return None


# --- lexicons ------------------------------------------------------------------

tbesh = {}
with open(os.path.join(src, "tbesh.txt"), encoding="utf-8") as f:
    for line in f:
        cols = line.rstrip("\n").split("\t")
        if len(cols) < 8 or not re.match(r"^H\d{4}", cols[0]):
            continue
        d = cols[1].split(" ")[0]
        tbesh.setdefault(d, {
            "lemma": nfc(cols[3]), "x": cols[4], "morph": cols[5], "gloss": cols[6], "meaning": cols[7],
        })

tehmc = {}
with open(os.path.join(src, "tehmc.txt"), encoding="utf-8") as f:
    for line in f:
        cols = line.rstrip("\n").split("\t")
        if len(cols) >= 2 and re.match(r"^[HA][A-Za-z0-9]+$", cols[0]) and "=" in cols[1]:
            tehmc.setdefault(cols[0], cols[1].strip())

li = ET.parse(os.path.join(src, "LexicalIndex.xml")).getroot()
li_entries = {}
li_by_strong = defaultdict(list)
for e in li.iter(f"{NS}entry"):
    w = e.find(f"{NS}w")
    pos = e.find(f"{NS}pos")
    d = e.find(f"{NS}def")
    etym = e.find(f"{NS}etym")
    xrefs = e.findall(f"{NS}xref")
    ent = {
        "id": e.get("id"),
        "w": nfc(w.text or "") if w is not None else "",
        "xlit": w.get("xlit", "") if w is not None else "",
        "pos": pos.text if pos is not None else "",
        "def": d.text if d is not None else "",
        "bdb": xrefs[0].get("bdb") if xrefs else None,
        "strong": [(x.get("strong"), x.get("aug")) for x in xrefs if x.get("strong")],
        "etype": etym.get("type") if etym is not None else None,
        "root": etym.get("root") if etym is not None else None,
        "elinks": [s.strip() for s in (etym.text or "").split(",") if s.strip()] if etym is not None else [],
    }
    li_entries[ent["id"]] = ent
    for s, aug in ent["strong"]:
        if s.isdigit():  # a handful carry a stray letter, no number
            li_by_strong[int(s)].append((aug, ent["id"]))


def li_for(dstrong):
    """TAHOT's extended Strong's (H7462B) → the lexical index entry.

    STEP's disambiguating letter, lowered, is the index's `aug` letter where
    the index splits a Strong's number; otherwise the number decides."""
    m = re.match(r"^H(\d+)([A-Z]?)$", dstrong)
    if not m:
        return None
    cands = li_by_strong.get(int(m.group(1)), [])
    if not cands:
        return None
    if len(cands) == 1:
        return cands[0][1]
    letter = m.group(2).lower()
    for aug, i in cands:
        if aug == letter:
            return i
    return None


def root_of(li_id):
    e = li_entries.get(li_id)
    if not e:
        return None
    if e["etype"] == "main" and e["root"]:
        return li_id
    if e["etype"] == "sub" and e["elinks"]:
        parent = li_entries.get(e["elinks"][0])
        if parent and parent["etype"] == "main" and parent["root"]:
            return parent["id"]
    return None


# Coverage of the whole Hebrew Bible, word occurrences and distinct words.
lex_words = {k: c for k, c in count.items() if not k.startswith("H9")}
resolved = {k: li_for(k) for k in lex_words}
rooted = {k: root_of(v) for k, v in resolved.items() if v}
tot = sum(lex_words.values())
stats = {
    "occurrences": tot,
    "to_index": sum(c for k, c in lex_words.items() if resolved[k]) / tot,
    "to_root": sum(c for k, c in lex_words.items() if rooted.get(k)) / tot,
    "distinct": len(lex_words),
    "distinct_to_root": sum(1 for k in lex_words if rooted.get(k)) / len(lex_words),
}
names = {k: c for k, c in lex_words.items() if tbesh.get(k, {}).get("morph", "").startswith("N:")}
stats["to_root_without_names"] = sum(c for k, c in lex_words.items() if rooted.get(k) and k not in names) / (
    tot - sum(names.values())
)
print(json.dumps(stats, indent=1), file=sys.stderr)

pos = {key: n for n, key in enumerate(order)}

# count by index entry, for root families
li_count = Counter()
li_key = {}
for k, c in lex_words.items():
    i = resolved.get(k)
    if i:
        li_count[i] += c
        li_key.setdefault(i, k)

# BDB and Strong's text, as small HTML
bdb_root = ET.parse(os.path.join(src, "BrownDriverBriggs.xml")).getroot()
bdb = {e.get("id"): e for e in bdb_root.iter(f"{NS}entry")}
strongs_root = ET.parse(os.path.join(src, "HebrewStrong.xml")).getroot()
strongs = {e.get("id"): e for e in strongs_root.iter(f"{NS}entry")}


def esc(s):
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def html(el, top=True):
    tag = el.tag.replace(NS, "")
    inner = esc(el.text) + "".join(html(c, False) + esc(c.tail) for c in el)
    if top:
        return inner
    if tag == "status":
        return ""
    if tag == "w":
        return f'<span class="he" lang="he">{inner}</span>'
    if tag == "def":
        return f'<b class="def">{inner}</b>'
    if tag == "pos":
        return f'<span class="pos">{inner}</span>'
    if tag in ("stem", "asp"):
        return f"<b>{inner}</b>"
    if tag == "ref":
        return f'<span class="ref">{inner}</span>'
    if tag in ("foreign", "em"):
        return f"<i>{inner}</i>"
    if tag == "sense":
        n = el.get("n")
        return f'<div class="sense">{f"<b>{n}.</b> " if n else ""}{inner}</div>'
    if tag == "lb":
        return "<br>"
    return inner


def bdb_html(bdb_id):
    e = bdb.get(bdb_id)
    if e is None:
        return None
    return re.sub(r"\s+", " ", html(e)).strip()


def strong_html(dstrong):
    m = re.match(r"^H(\d+)", dstrong)
    e = strongs.get(f"H{int(m.group(1))}") if m else None
    if e is None:
        return None
    parts = []
    w = e.find(f"{NS}w")
    for tag in ("source", "meaning", "usage"):
        x = e.find(f"{NS}{tag}")
        if x is not None:
            label = {"source": "", "meaning": "", "usage": "<b>KJV:</b> "}[tag]
            parts.append(f'<p class="st-{tag}">{label}{re.sub(r"\s+", " ", html(x)).strip()}</p>')
    return {
        "head": nfc(w.text or "") if w is not None else "",
        "xlit": w.get("xlit", "") if w is not None else "",
        "pron": w.get("pron", "") if w is not None else "",
        "html": "".join(parts),
    }


def clean_meaning(s):
    s = re.sub(r"<(?!/?(br|i|b)\b)[^>]*>", "", s, flags=re.I)
    return s.replace("<BR>", "<br>")


# --- passages ------------------------------------------------------------------


def verse(book, c, v):
    key = (book, c, v)
    ws = [name_override(parse(w)) for w in words_by_verse[key]]
    return key, ws


def snippet(key, i):
    ws = words_by_verse[key]
    a, b = max(0, i - 3), min(len(ws), i + 4)
    out = []
    for j in range(a, b):
        w = parse(ws[j])
        out.append({"t": w["t"], "hit": j == i})
    return {"before": a > 0, "after": b < len(ws), "words": out}


lex = {}
roots = {}
needed = set()


def ref_label(key):
    addr = shared(key)
    ec, ev = eng_of[key]
    if addr:
        b, c, v = addr
        return f"{douay_name[b]} {c}:{v}"
    return f"{key[0]} {ec}:{ev}"


def lexeme(k):
    if k in lex or not k:
        return
    t = tbesh.get(k) or {}
    li_id = li_for(k)
    root = root_of(li_id) if li_id else None
    e = li_entries.get(li_id) if li_id else None
    # A dictionary word may be split by TAHOT into senses (H7225G "beginning",
    # H7225H "best"): count and sample all of them, as one word.
    keys = [d for d, li_ in resolved.items() if li_id and li_ == li_id] or [k]
    hits = sorted((pos[key], key, i) for d in keys for key, i in where.get(d, []))
    samples = []
    for _, key, i in hits[:400]:
        addr = shared(key)
        line = douay(addr)
        if not line:
            continue
        samples.append({"ref": ref_label(key), "he": snippet(key, i), "drb": line})
        if len(samples) == 6:
            break
    entry = {
        "k": k,
        "lemma": t.get("lemma", ""),
        "x": (e["xlit"] if e and e["xlit"] else t.get("x", "")),
        "gloss": t.get("gloss", ""),
        "morph": t.get("morph", ""),
        "tbesh": clean_meaning(t.get("meaning", "")),
        "count": li_count.get(li_id, 0) if li_id else count.get(k, 0),
        "samples": samples,
        "bdb": bdb_html(e["bdb"]) if e and e["bdb"] else None,
        "strong": strong_html(k),
        "root": root,
        "li": li_id,
    }
    if NAME.match(k):
        entry["x"] = "Adonai" if k.startswith("H3068") else "Elohim"
        entry["gloss"] = "the LORD" if k.startswith("H3068") else "GOD"
        entry["name"] = 1
    lex[k] = entry
    if root and root not in roots:
        r = li_entries[root]
        members = [root] + [m for m in r["elinks"] if m in li_entries]
        fam = []
        for m in members:
            me = li_entries[m]
            if not me["strong"] and m == root and not li_count.get(m):
                continue
            fam.append({
                "li": m,
                "w": me["w"],
                "x": me["xlit"],
                "pos": me["pos"],
                "def": me["def"],
                "count": li_count.get(m, 0),
                "k": li_key.get(m),
            })
        seen = set()
        fam = [f for f in sorted(fam, key=lambda f: -f["count"])
               if f["count"] and (f["w"], f["def"]) not in seen and not seen.add((f["w"], f["def"]))]
        roots[root] = {"letters": nfc(r["root"]), "x": r["xlit"], "members": fam}


passages = {}


def passage(pid, title, book, chapter, verses, heading, poetry=False, witnesses=False):
    out = []
    for v in verses:
        key, ws = verse(book, chapter, v)
        for w in ws:
            for p in w["p"]:
                if p["s"]:
                    lexeme(p["s"])
        addr = shared(key)
        item = {"n": v, "words": ws}
        if addr:
            item["drb"] = douay(addr)
            if witnesses:
                b, c, vv = addr
                item["vul"] = load("vulgate", b)[str(c)][str(vv)]
                # The Brenton Septuagint keeps its own numbering; its map
                # sends a verse to the shared address only where they differ.
                vmap = json.load(open(os.path.join(bible, "greek-brenton", "versification.json"), encoding="utf-8")).get(b, {})
                own = next((k for k, s in vmap.items() if s == f"{c}:{vv}"), f"{c}:{vv}")
                oc, ov = own.split(":")
                item["lxx"] = load("greek-brenton", b).get(oc, {}).get(ov)
        out.append(item)
    passages[pid] = {"title": title, "heading": heading, "poetry": poetry, "verses": out}


passage("gen1", "Genesis 1:1–5", "Gen", 1, range(1, 6),
        {"book": "Genesis", "he": "בְּרֵאשִׁית", "heX": "Bereshit", "chapter": "Chapter 1"}, witnesses=True)
passage("ps23", "Psalm 23 (22)", "Psa", 23, range(1, 7),
        {"book": "Psalms", "he": "תְּהִלִּים", "heX": "Tehillim", "chapter": "Psalm 23", "vul": "Vulgate 22"},
        poetry=True, witnesses=True)
passage("isa7", "Isaiah 7:10–16", "Isa", 7, range(10, 17),
        {"book": "Isaias", "he": "יְשַׁעְיָהוּ", "heX": "Yeshayahu", "chapter": "Chapter 7"}, witnesses=True)
# A written/read pair to show: Ps 100:3, where the written "and not we" is
# what the Vulgate and the Douay translate, and the read "and his we are".
qkey = ("Psa", 100, 3)
passage("qere", "Psalm 100 (99):1–5", "Psa", 100, range(1, 6),
        {"book": "Psalms", "he": "תְּהִלִּים", "heX": "Tehillim", "chapter": "Psalm 100", "vul": "Vulgate 99"},
        poetry=True, witnesses=True)

# plain-words grammar for every code on the pages
codes = {p["m"] for ps in passages.values() for v in ps["verses"] for w in v["words"] for p in w["p"]}
grammar = {c: tehmc.get(c, "") for c in codes}

data = {"passages": passages, "lex": lex, "roots": roots, "grammar": grammar, "stats": stats}
blob = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

for name in os.listdir(here):
    if not name.endswith(".html"):
        continue
    path = os.path.join(here, name)
    with open(path, encoding="utf-8") as f:
        page = f.read()
    new = re.sub(
        r'<script id="data" type="application/json">.*?</script>',
        lambda _: f'<script id="data" type="application/json">{blob}</script>',
        page,
        flags=re.S,
    )
    if new != page:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new)
        print("wrote", name, file=sys.stderr)

print("lexemes", len(lex), "roots", len(roots), "qere verse", qkey, file=sys.stderr)
