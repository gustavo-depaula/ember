"""Import Greek lexicons into content/bible/lexicon/<source>/<shard>.json.

Sources (each cloned into its own empty directory; all are read as data only):

  dodson          Jeffrey Dodson, Greek Lexicon of the New Testament (public
                  domain; repository CC0 1.0).
                  https://github.com/biblicalhumanities/Dodson-Greek-Lexicon
  abbott-smith    G. Abbott-Smith, A Manual Greek Lexicon of the New Testament
                  (1922; public domain; TEI markup declared public domain).
                  https://github.com/translatable-exegetical-tools/Abbott-Smith
  strongs         James Strong, Dictionary of the Greek Testament (1890; public
                  domain; XML by Ulrik Petersen, "Copy Freely").
                  https://github.com/openscriptures/strongs
  middle-liddell  Liddell & Scott, An Intermediate Greek-English Lexicon (1889;
                  public domain). Perseus Digital Library XML, CC BY-SA 3.0 US.
                  https://github.com/blinskey/middle-liddell (fork of Perseus
                  text 1999.04.0058; PerseusDL/lexica carries only LSJ)

Output: one JSON object per shard, {key: [{lemma, gloss?, def, strong?}, ...]},
where key = lexicon_key(lemma) and the shard is the key's first letter. `def`
is plain text: sense numbers, Greek, references as printed, *word* for italic.
Also writes content/bible/lexicon/sources.json.

Usage:
  python3 -I scripts/greek-bible/lexicon.py fetch /tmp/greek-src
  python3 -I scripts/greek-bible/lexicon.py build /tmp/greek-src
"""

import json
import re
import subprocess
import sys
import unicodedata
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

# -I drops the script's directory from sys.path; the key lives beside us.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lexicon_key import lexicon_key, shard_of  # noqa: E402

repoRoot = Path(__file__).resolve().parents[2]
outRoot = repoRoot / "content/bible/lexicon"

sources = [
    {
        "id": "dodson",
        "name": "A Greek-English Lexicon of the New Testament",
        "author": "John Jeffrey Dodson",
        "year": 2010,
        "licence": "CC0-1.0",
        "attribution": "Dodson Greek Lexicon, public domain; digitized by Ulrik Sandborg-Petersen and the Biblical Humanities project.",
        "url": "https://github.com/biblicalhumanities/Dodson-Greek-Lexicon",
        "repo": "https://github.com/biblicalhumanities/Dodson-Greek-Lexicon",
    },
    {
        "id": "abbott-smith",
        "name": "A Manual Greek Lexicon of the New Testament",
        "author": "G. Abbott-Smith",
        "year": 1922,
        "licence": "Public Domain",
        "attribution": "G. Abbott-Smith, A Manual Greek Lexicon of the New Testament (T. & T. Clark, 1922); TEI edition by the Translatable Exegetical Tools project (public domain).",
        "url": "https://github.com/translatable-exegetical-tools/Abbott-Smith",
        "repo": "https://github.com/translatable-exegetical-tools/Abbott-Smith",
    },
    {
        "id": "strongs",
        "name": "Dictionary of the Greek Testament (Strong's Exhaustive Concordance)",
        "author": "James Strong",
        "year": 1890,
        "licence": "Public Domain",
        "attribution": "James Strong, Strong's Exhaustive Concordance (1890), public domain; XML by Ulrik Petersen, via Open Scriptures.",
        "url": "https://github.com/openscriptures/strongs",
        "repo": "https://github.com/openscriptures/strongs",
    },
    {
        "id": "middle-liddell",
        "name": "An Intermediate Greek-English Lexicon",
        "author": "Henry George Liddell and Robert Scott",
        "year": 1889,
        "licence": "CC-BY-SA-3.0-US",
        "attribution": "Text provided by Perseus Digital Library, with funding from The Annenberg CPB/Project. Original version available for viewing and download at http://www.perseus.tufts.edu/hopper/. Licensed CC BY-SA 3.0 US; converted from Beta Code to Unicode and restructured by Ember.",
        "url": "http://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.04.0058",
        "repo": "https://github.com/blinskey/middle-liddell",
    },
]


# ---------------------------------------------------------------- text helpers


def nfc(text):
    return unicodedata.normalize("NFC", text)


def tidy(text):
    # The XML's line breaks and indentation are not the printer's; tags also
    # leave spaces before punctuation ("Mt 8:8 ,") and inside brackets.
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([,.;:·)\]])", r"\1", text)
    text = re.sub(r"([(\[])\s+", r"\1", text)
    text = re.sub(r"\*\s*\*", "", text)
    return nfc(text.strip())


def local(tag):
    return tag.rsplit("}", 1)[-1]


latinLookalikes = str.maketrans("aoeik", "αοεικ")


def clean_lemma(text):
    # Headwords carry homograph numbers, compound-only hyphens and trailing
    # commas ("λόγος, ου, ὁ"); the lemma is the bare word. A typist's Latin
    # lookalike inside a Greek word (Abbott-Smith's "Καΐφaς") would split its key.
    word = re.split(r"[,\s]", text.strip(), maxsplit=1)[0]
    word = re.sub(r"[\d\-–‑]", "", word)
    if re.search(r"[\u0370-\u03ff\u1f00-\u1fff]", word):
        word = word.translate(latinLookalikes)
    return nfc(word)


def literal_asterisks(text):
    # `def` reserves * for italic; Abbott-Smith prints * as a sign on
    # headwords (words not in classical Greek), so it becomes the low asterisk.
    return text.replace("*", "⁎")


# ----------------------------------------------------------------- Beta Code

betaLetters = dict(zip("abgdezhqiklmncoprstufxywv", "αβγδεζηθικλμνξοπρστυφχψωϝ"))
betaMarks = {
    "^": ("̆", 0),
    "_": ("̄", 0),
    ")": ("̓", 1),
    "(": ("̔", 1),
    "+": ("̈", 2),
    "/": ("́", 3),
    "\\": ("̀", 3),
    "=": ("͂", 3),
    "|": ("ͅ", 4),
}
betaPunct = {":": "·", "'": "’"}


def beta_to_unicode(beta, quantity=True):
    """Perseus Beta Code → NFC polytonic Greek.

    Marks are re-sorted before composing because Beta Code writes them in any
    order (i/+ and i+/ both occur) while NFC only composes a breathing or
    diaeresis that precedes the accent. Capitals put their marks between * and
    the letter. A word starting with a Latin capital without * is English that
    slipped into a Greek tag ("Pass.") and is copied as is. `quantity=False`
    drops the editors' vowel-length marks (^ _), which headwords must not carry.
    """
    out = []
    i = 0
    n = len(beta)

    def marks_at(j):
        found = []
        while j < n and beta[j] in betaMarks:
            found.append(betaMarks[beta[j]])
            j += 1
        return found, j

    while i < n:
        ch = beta[i]
        if ch == "*":
            pre, j = marks_at(i + 1)
            if j < n and beta[j].lower() in betaLetters:
                letter = betaLetters[beta[j].lower()].upper()
                post, j = marks_at(j + 1)
                out.append((letter, pre + post))
                i = j
                continue
            i += 1
            continue
        if ch.isupper() and (i == 0 or not beta[i - 1].isalpha()):
            end = i
            while end < n and not beta[end].isspace():
                end += 1
            out.append((beta[i:end], []))
            i = end
            continue
        if ch.lower() in betaLetters:
            letter = betaLetters[ch.lower()]
            post, j = marks_at(i + 1)
            if letter == "σ" and (j >= n or beta[j].lower() not in betaLetters):
                letter = "ς"
            out.append((letter, post))
            i = j
            continue
        if ch in betaMarks:
            # A stray mark (e.g. a lone breathing) has no base; drop it.
            i += 1
            continue
        out.append((betaPunct.get(ch, ch), []))
        i += 1

    def compose(letter, marks):
        kept = [m for m in sorted(marks, key=lambda m: m[1]) if quantity or m[1] != 0]
        return letter + "".join(code for code, _ in kept)

    text = nfc("".join(compose(letter, marks) for letter, marks in out))
    # Homograph numbers glued to a cited word ("λέγω3") are not printed.
    return re.sub(r"(?<=[Ͱ-Ͽἀ-῿])\d+", "", text)


# -------------------------------------------------------------------- dodson


def read_dodson(root):
    tree = ET.parse(root / "dodson.xml")
    for el in tree.getroot().iter():
        if local(el.tag) != "entry":
            continue
        head, _, number = el.get("n", "").partition("|")
        defs = {d.get("role"): tidy("".join(d.itertext())) for d in el if local(d.tag) == "def"}
        entry = {"lemma": clean_lemma(head), "gloss": defs.get("brief", ""), "def": defs.get("full", "")}
        if number.strip().isdigit():
            entry["strong"] = int(number)
        yield entry


# -------------------------------------------------------------- abbott-smith


def render_abbott_smith(el):
    tag = local(el.tag)
    if tag in ("note", "pb"):
        return literal_asterisks(el.tail or "")
    if tag == "lb":
        return " " + (el.tail or "")
    inner = literal_asterisks(el.text or "") + "".join(render_abbott_smith(c) for c in el)
    if tag == "emph" or (tag == "hi" and el.get("rend") == "italic"):
        inner = f"*{inner.strip()}*"
    if tag == "sense" and el.get("n"):
        inner = f" {el.get('n')} {inner}"
    return inner + literal_asterisks(el.tail or "")


def read_abbott_smith(root):
    tree = ET.parse(root / "abbott-smith.tei.xml")
    body = next(el for el in tree.getroot().iter() if local(el.tag) == "body")
    for el in body.iter():
        if local(el.tag) != "entry":
            continue
        head, _, number = el.get("n", "").partition("|")
        if not head:
            # 257 entries lack @n; their headword is the lemma form or first orth.
            lemmaForm = next((f for f in el.iter() if local(f.tag) == "form" and f.get("type") == "lemma"), None)
            source = lemmaForm if lemmaForm is not None else next(f for f in el.iter() if local(f.tag) == "orth")
            head = "".join(source.itertext())
        glosses = [tidy("".join(g.itertext())) for g in el.iter() if local(g.tag) == "gloss"]
        body_text = literal_asterisks(el.text or "") + "".join(render_abbott_smith(c) for c in el)
        entry = {"lemma": clean_lemma(head), "gloss": glosses[0] if glosses else "", "def": tidy(body_text)}
        match = re.match(r"G(\d+)", number.strip())
        if match:
            entry["strong"] = int(match.group(1))
        yield entry


# ------------------------------------------------------------------- strongs


def read_strongs(root):
    tree = ET.parse(root / "greek/StrongsGreekDictionaryXML_1.4/strongsgreek.xml")
    entries = [el for el in tree.getroot().iter("entry")]
    lemmas = {
        int(el.findtext("strongs")): el.find("greek").get("unicode") for el in entries if el.find("greek") is not None
    }

    def inner(el):
        return (el.text or "") + "".join(render(c) + (c.tail or "") for c in el)

    def render(el):
        # A cross-reference prints the cited word, so the reader needn't
        # look the number up; Hebrew numbers have no Greek lemma to show.
        if el.tag == "greek":
            return el.get("unicode", "")
        if el.tag == "strongsref":
            number = int(el.get("strongs"))
            return f"H{number}" if el.get("language") == "HEBREW" else f"{lemmas.get(number, '')} (G{number})"
        if el.tag == "pronunciation":
            return ""
        return inner(el)

    for el in entries:
        number = int(el.findtext("strongs"))
        greek = el.find("greek")
        if greek is None:
            continue
        part = {child.tag: tidy(inner(child)) for child in el if child.tag in ("strongs_derivation", "strongs_def", "kjv_def")}
        # Strong's prints the KJV renderings after ":--".
        kjv = part.get("kjv_def", "").lstrip(":-– ").strip()
        text = " ".join(p for p in (part.get("strongs_derivation"), part.get("strongs_def")) if p)
        if kjv:
            text = f"{text.rstrip('.')}. KJV: {kjv}" if text else f"KJV: {kjv}"
        yield {"lemma": nfc(greek.get("unicode")), "def": tidy(text), "strong": number}


# ------------------------------------------------------------ middle-liddell


def sense_label(n):
    # Perseus numbers senses A, I, 2, b …; a few carry editorial values
    # ("Perseus", "III*") that are not printed numbers. Lowercase Roman
    # ("Ii") is a typo for the capital.
    if n is None or n == "0":
        return ""
    if re.fullmatch(r"[IVX][ivx]+", n):
        n = n.upper()
    return n if re.fullmatch(r"[A-Ga-f]|[IVX]+|\d+", n) else ""


def render_middle_liddell(el):
    tag = el.tag
    tail = el.tail or ""
    # gramGrp holds Morpheus stem codes, not lexicon text; the headword is
    # written once, at the start, by read_middle_liddell.
    if tag in ("gramGrp", "form") or (tag == "note" and el.get("type") == "alt"):
        return tail
    if el.get("lang") == "greek":
        return beta_to_unicode("".join(el.itertext())) + tail
    if tag == "usg":
        # Perseus writes the printer's "id." (same author) as "id=Aesch.".
        text = "".join(el.itertext())
        return ("id." if text.startswith("id=") else text) + tail
    inner = (el.text or "") + "".join(render_middle_liddell(c) for c in el)
    if tag == "sense" and sense_label(el.get("n")):
        inner = f" {sense_label(el.get('n'))}. {inner}"
    if tag == "etym":
        # The derivation is a bare word after the headword ("λόγος, ὁ, λέγω");
        # brackets keep it from reading as part of the grammar.
        inner = f" ({inner.strip()}) "
    return inner + tail


strayBeta = re.compile(r"(?:\*[()/\\=|+]*)?[a-z][a-z()/\\=|+^_]*?[/\\=][a-z()/\\=|+^_]*")


def convert_stray_beta(text):
    # About thirty cited words sit outside a lang="greek" tag ("= timwro/s").
    # English here never carries / \ = inside a word, so a run of Beta Code
    # letters with an accent mark is Greek. A closing ")" ends the run as a
    # bracket, since no Greek word ends in a breathing.
    def convert(match):
        run = match.group()
        bare = run.rstrip(")(")
        return beta_to_unicode(bare) + run[len(bare):]

    return strayBeta.sub(convert, text)


def read_middle_liddell(root):
    tree = ET.parse(root / "Perseus_text_1999.04.0058.xml")
    for el in tree.getroot().iter("entry"):
        orth = el.find("form/orth")
        lemma = clean_lemma(beta_to_unicode("".join(orth.itertext()), quantity=False))
        # The "alt" note is the printed headword line ("λόγος, ὁ,"); entries
        # without one print the bare headword.
        alt = el.find("note[@type='alt']")
        head = beta_to_unicode("".join((alt if alt is not None else orth).itertext()))
        text = head + " " + (el.text or "") + "".join(render_middle_liddell(c) for c in el)
        # The gloss is the first rendering in a sense; the etymology's notes
        # also hold translations ("ἔστι μοι, I have") that are not the meaning.
        firstTr = el.find("sense//tr")
        gloss = tidy("".join(firstTr.itertext())) if firstTr is not None else ""
        yield {"lemma": lemma, "gloss": gloss, "def": literal_asterisks(tidy(convert_stray_beta(text)))}


readers = {
    "dodson": read_dodson,
    "abbott-smith": read_abbott_smith,
    "strongs": read_strongs,
    "middle-liddell": read_middle_liddell,
}


# ------------------------------------------------------------------- commands


def fetch(srcRoot):
    for source in sources:
        target = srcRoot / f"lex-{source['id']}"
        target.mkdir(parents=True, exist_ok=True)
        if any(target.iterdir()):
            sys.exit(f"{target} is not empty; downloads go into new empty directories")
        subprocess.run(["git", "clone", "--depth", "1", source["repo"], str(target / "repo")], check=True)


def compact(entry):
    return {k: v for k, v in entry.items() if v not in ("", None)}


def build(srcRoot):
    summary = []
    for source in sources:
        entries = [compact(e) for e in readers[source["id"]](srcRoot / f"lex-{source['id']}" / "repo")]
        shards = defaultdict(lambda: defaultdict(list))
        dropped = 0
        for entry in entries:
            key = lexicon_key(entry["lemma"])
            if not key or not entry.get("def"):
                dropped += 1
                continue
            shards[shard_of(key)][key].append(entry)
        target = outRoot / source["id"]
        target.mkdir(parents=True, exist_ok=True)
        for old in target.glob("*.json"):
            old.unlink()
        size = 0
        for shard, byKey in shards.items():
            path = target / f"{shard}.json"
            path.write_text(
                json.dumps(dict(sorted(byKey.items())), ensure_ascii=False, separators=(",", ":")),
                encoding="utf-8",
            )
            size += path.stat().st_size
        kept = len(entries) - dropped
        print(f"{source['id']}: {kept} entries, {sum(len(b) for b in shards.values())} keys, {size / 1e6:.1f} MB, dropped {dropped}")
        summary.append({k: source[k] for k in ("id", "name", "author", "year", "licence", "attribution", "url")} | {"entries": kept})
    (outRoot / "sources.json").write_text(
        json.dumps(summary, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )


if __name__ == "__main__":
    if len(sys.argv) != 3 or sys.argv[1] not in ("fetch", "build"):
        sys.exit(__doc__)
    {"fetch": fetch, "build": build}[sys.argv[1]](Path(sys.argv[2]))
