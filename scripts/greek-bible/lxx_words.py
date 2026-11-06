#!/usr/bin/env python3
"""Lemma, parsing and gloss for every word of the Brenton Septuagint.

Writes content/bible/greek-brenton/words/<slug>.json, the shape the Greek New
Testaments carry: {chapter: {verse: [[lemma, morph, gloss], ...]}}, one entry
per whitespace token of the verse text, in order. An entry may carry a fourth
element "?": not checked, because the two sources disagree on lemma or
parsing, or only one source (or only the fallback) gave it. Lemma and morph
are "" where nothing could be determined (also "?"). The inline labels of
lettered verses ("(35a)") are tokens of the text but not words: ["", "", ""].

Morphology is Robinson's parsing scheme, written the way the Nestle 1904 writes
it (see `robinson`), lemmas follow the MorphGNT/Koine headwords (γίνομαι,
γινώσκω) as both the NT editions and OpenScriptorium do.

Sources (each licence read in the repo it comes from):

    lxx-morph   github.com/OpenScriptorium/lxx-morph @ c91f6b1e8fb3ba37df701e6ae31f675ace71a2b2
                db/seeds/lxx_morph/<book>.json: surface, lemma, POS and parsing
                for each word of Rahlfs (1935, text public domain, after Eliran
                Wong's digital edition). Data CC BY 4.0 (LICENSE-DATA):
                "lxx-morph, OpenScriptorium". The primary source.
    GLAUx       github.com/alekkeersmaekers/glaux @ b077d8f6ff429a5c7245954bc16bb7d1d7948823
                xml/0527-*.xml: the Septuagint of el.wikisource (a Rahlfs-type
                text, CC BY-SA 3.0), lemmatized and tagged (AGDT tags) by Alek
                Keersmaekers' GLAUx, CC BY-SA 4.0 (README.md, metadata.txt).
                The cross-check, and the parsing of words lxx-morph lacks.
    Nestle 1904 github.com/biblicalhumanities/Nestle1904 morphology (CC0), as
                content/bible/greek-nestle-1904/words/ already holds it: only
                the conventions of Robinson's codes per lemma (which pronoun
                head, deponency, second aorists, PRT-N, COND), and a form
                lexicon for words neither LXX source reaches.
    TBESG       github.com/STEPBible/STEPBible-Data @ 5de0a47f35f0fc13dfe1430d104e5db8a4285f9c
                Lexicons/TBESG (Translators Brief lexicon of Extended Strongs for
                Greek), CC BY 4.0, "Tyndale House Cambridge / STEPBible.org":
                the brief gloss of each lemma. Dodson and Middle Liddell
                (content/bible/lexicon/) where TBESG has no entry.
    OdyCy       huggingface.co/chcaa/grc_odycy_joint_trf @ 83046e93fa6b5dee122c3ca7cff1377512928143
                (wheel grc_odycy_joint_trf-0.7.0), MIT: a spaCy tagger for
                Ancient Greek, run (optionally) over the few hundred words
                nothing above reaches, mostly rare names.

Words neither source reaches take, in turn: the parse of the phrase Brenton
prints as one word (FUSED: ἀναμέσον, διατοῦτο), the Hebrew letters of
Lamentations, the analysis the same form nearly always has among the agreed
words (then in the Nestle 1904), OdyCy's; else "" and "?".

Because parsings and lemmas of words lxx-morph does not reach are taken from
GLAUx, the words files are CC BY-SA 4.0 as a whole (attribution: lxx-morph by
OpenScriptorium, CC BY 4.0; GLAUx by Alek Keersmaekers, CC BY-SA 4.0; glosses
from STEP Bible, www.STEPBible.org, TBESG, TFLSJ and TIPNR, based on work at
Tyndale House Cambridge, CC BY 4.0, adapted by lxx_glosses.py; and the Berean
Interlinear's glosses of the same forms in the New Testament, public domain).

There is no word-level analysis of Brenton's own text (the Sixtine text as
reprinted by Valpy), so both sources are aligned to it: per Brenton chapter,
the source chapters that share most of its word pairs are aligned to it on
bare letters (no accents, breathings or case; final sigma, movable nu and the
λημψ/ληψ, οὐθ/οὐδ spellings levelled) with difflib, best chapter first and
the others only into what is left. That copes with the books Brenton files
otherwise than Rahlfs (Esther in Vulgate order, Esdras B split in two, Daniel
13–14 and Baruch 6) and with variant texts (Joshua and Judges B, Theodotion's
Daniel, the two Tobits): whichever reads most like Brenton wins, chapter by
chapter.

Usage (each directory a fresh download at the commit above; run with -I):
    python3 -I scripts/greek-bible/lxx_words.py <lxx-morph> <glaux> <STEPBible-Data> [tags.json]
    python3 -I scripts/greek-bible/concordance.py brenton

The optional tagger pass, between two builds (tags.json is a scratch file
keyed by token position, so it is only good for the build that preceded it):
    python3 -I scripts/greek-bible/lxx_words.py <lxx-morph> <glaux> <STEPBible-Data>
    uv venv -p 3.11 /tmp/odycy && VIRTUAL_ENV=/tmp/odycy uv pip install click \
        https://huggingface.co/chcaa/grc_odycy_joint_trf/resolve/<commit>/grc_odycy_joint_trf-0.7.0-py3-none-any.whl
    /tmp/odycy/bin/python -I scripts/greek-bible/lxx_words.py tag /tmp/tags.json
    python3 -I scripts/greek-bible/lxx_words.py <lxx-morph> <glaux> <STEPBible-Data> /tmp/tags.json
    python3 -I scripts/greek-bible/concordance.py brenton

Rerun after lxx.py brenton rewrites the text (the words follow its tokens),
and then lxx_glosses.py, which replaces the TBESG glosses written here with
the NT's form-aware Berean glosses where it can.
"""
from __future__ import annotations

import json
import random
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path

# -I drops the script's directory from sys.path; the key and lxx.py live beside us.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lexicon_key import lexicon_key, shard_of  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
BIBLE = ROOT / "content" / "bible"
BRENTON = BIBLE / "greek-brenton"

# Douay slug → (lxx-morph files, GLAUx documents) that may hold its text.
# Variant texts are all listed; the alignment picks per chapter.
BOOKS = {
    "genesis": (["genesis"], ["001"]), "exodus": (["exodus"], ["002"]),
    "leviticus": (["leviticus"], ["003"]), "numbers": (["numbers"], ["004"]),
    "deuteronomy": (["deuteronomy"], ["005"]),
    "josue": (["joshua-vaticanus-b", "joshua"], ["006"]),
    "judges": (["judges-vaticanus-b", "judges"], ["009"]), "ruth": (["ruth"], ["010"]),
    "1-kings": (["1-samuel"], ["011"]), "2-kings": (["2-samuel"], ["012"]),
    "3-kings": (["1-kings"], ["013"]), "4-kings": (["2-kings"], ["014"]),
    "1-paralipomenon": (["1-chronicles"], ["015"]),
    "2-paralipomenon": (["2-chronicles"], ["016"]),
    "1-esdras": (["2-esdras"], ["018"]), "2-esdras": (["2-esdras"], ["018"]),
    "tobias": (["tobit", "tobit-sinaiticus"], ["021", "022"]),
    "judith": (["judith"], ["020"]), "esther": (["esther-greek"], ["019"]),
    "job": (["job-lxx"], ["032"]), "psalms": (["psalms-lxx"], ["027"]),
    "proverbs": (["proverbs"], ["029"]), "ecclesiastes": (["ecclesiastes"], ["030"]),
    "canticles": (["song-of-solomon"], ["031"]), "wisdom": (["wisdom"], ["033"]),
    "ecclesiasticus": (["sirach"], ["034"]), "isaias": (["isaiah"], ["048"]),
    "jeremias": (["jeremiah-lxx"], ["049"]), "lamentations": (["lamentations"], ["051"]),
    "baruch": (["baruch", "letter-of-jeremiah"], ["050", "052"]),
    "ezechiel": (["ezekiel"], ["053"]),
    "daniel": (["daniel-theodotion", "daniel", "susanna-theodotion", "susanna",
                "bel-and-the-dragon-theodotion", "bel-and-the-dragon"],
               ["054", "055", "056", "057", "058", "059"]),
    "osee": (["hosea"], ["036"]), "joel": (["joel"], ["039"]), "amos": (["amos"], ["037"]),
    "abdias": (["obadiah"], ["040"]), "jonas": (["jonah"], ["041"]),
    "micheas": (["micah"], ["038"]), "nahum": (["nahum"], ["042"]),
    "habacuc": (["habakkuk"], ["043"]), "sophonias": (["zephaniah"], ["044"]),
    "aggeus": (["haggai"], ["045"]), "zacharias": (["zechariah"], ["046"]),
    "malachias": (["malachi"], ["047"]),
    "1-machabees": (["1-maccabees"], ["023"]), "2-machabees": (["2-maccabees"], ["024"]),
}

LABEL = re.compile(r"\(\d+[a-z]\d*\)")


# ── Matching keys ────────────────────────────────────────────────────────────


def bare(word: str) -> str:
    """Lowercase Greek letters, no diacritics, σ for ς."""
    d = unicodedata.normalize("NFD", word.lower())
    return "".join(c for c in d if unicodedata.category(c) == "Ll" and "α" <= c <= "ω" or c == "ς").replace("ς", "σ")


def match_key(word: str) -> str:
    """The bare letters with the spellings Brenton and Rahlfs differ in levelled:
    movable nu (ἐστίν/ἐστί, εἶπεν/εἶπε), Rahlfs' λήμψομαι for λήψομαι, οὐθείς
    for οὐδείς. Only for aligning; nothing is written from it."""
    b = bare(word)
    b = b.replace("μψ", "ψ").replace("ουθ", "ουδ").replace("μηθ", "μηδ")
    if len(b) >= 4 and (b.endswith("εν") or b.endswith("σιν")) or b == "εστιν":
        b = b[:-1]
    return b


def nfc(s: str) -> str:
    return unicodedata.normalize("NFC", s)


# ── Brenton ─────────────────────────────────────────────────────────────────


def brenton_book(slug: str) -> dict[str, dict[str, str]]:
    return json.loads((BRENTON / f"{slug}.json").read_text(encoding="utf-8"))


def is_word(token: str) -> bool:
    return not LABEL.fullmatch(token) and bool(bare(token))


# ── Sources ─────────────────────────────────────────────────────────────────
# A source word is (match key, lemma, features); features as in `features`.
# A source chapter is a list of them, in text order.

Chapter = list[tuple[str, str, dict]]


def load_osc(root: Path, name: str) -> dict[str, Chapter]:
    path = root / "db" / "seeds" / "lxx_morph" / f"{name}.json"
    chapters: dict[str, Chapter] = {}
    for verse in json.loads(path.read_text(encoding="utf-8")):
        ch = re.search(r"(\d+):\w+$", verse["ref"]).group(1)
        for w in verse["words"]:
            key = match_key(w["surface"])
            if key:
                chapters.setdefault(ch, []).append((key, nfc(w["lemma"] or ""), osc_features(w)))
    return {f"{name} {ch}": words for ch, words in chapters.items()}


def load_glaux(root: Path, doc: str) -> dict[str, Chapter]:
    chapters: dict[str, Chapter] = {}
    for _, el in ET.iterparse(root / "xml" / f"0527-{doc}.xml"):
        if el.tag != "word":
            continue
        form, tag = el.get("form") or "", el.get("postag") or ""
        key = match_key(form)
        # Punctuation (u) and the empty nodes of the treebank's ellipses (E).
        if key and tag[:1] not in ("u", "") and el.get("lemma") != "E":
            ch = el.get("div_chapter") or el.get("div_psalm") or "0"
            chapters.setdefault(ch, []).append((key, nfc(el.get("lemma") or ""), glaux_features(tag, el.get("lemma") or "")))
        el.clear()
    return {f"glaux {doc} {ch}": words for ch, words in chapters.items()}


# ── Features ────────────────────────────────────────────────────────────────
# Both sources are read into one shape before anything is compared:
#   pos   N (noun), NP (proper noun), A, NUM, T (article), PRON, V, CONJ, PREP,
#         PRT, ADV, INJ
#   t v m p   tense, voice, mood, person: one Robinson letter or None
#   n c g     number, case, gender: frozensets of Robinson letters, since
#             lxx-morph leaves syncretic forms open ("masc/neut gen sg")
#   d     degree, C or S

OSC_POS = {
    "noun": "N", "proper noun": "NP", "adjective": "A", "numeral": "NUM", "article": "T",
    "pronoun": "PRON", "verb": "V", "participle": "V", "conjunction": "CONJ",
    "preposition": "PREP", "particle": "PRT", "adverb": "ADV", "interjection": "INJ",
}
OSC_WORDS = {
    "pres": ("t", "P"), "imperf": ("t", "I"), "fut": ("t", "F"), "aor": ("t", "A"),
    "perf": ("t", "R"), "plup": ("t", "L"), "futperf": ("t", "F"),
    "act": ("v", "A"), "mid": ("v", "M"), "pass": ("v", "P"), "mid/pass": ("v", "E"),
    "ind": ("m", "I"), "subj": ("m", "S"), "opt": ("m", "O"), "imperat": ("m", "M"),
    "inf": ("m", "N"), "ptc": ("m", "P"),
    "1st": ("p", "1"), "2nd": ("p", "2"), "3rd": ("p", "3"),
    "comp": ("d", "C"), "superl": ("d", "S"),
}
CASES = {"nom": "N", "gen": "G", "dat": "D", "acc": "A", "voc": "V"}
GENDERS = {"masc": "M", "fem": "F", "neut": "N"}
NUMBERS = {"sg": "S", "pl": "P", "dual": "P"}  # Robinson has no dual


def blank(pos: str | None) -> dict:
    return {"pos": pos, "t": None, "v": None, "m": None, "p": None,
            "n": frozenset(), "c": frozenset(), "g": frozenset(), "d": None}


def osc_features(w: dict) -> dict:
    f = blank(OSC_POS.get(w.get("pos") or ""))
    for part in (w.get("parsing") or "").split():
        if part in OSC_WORDS:
            k, v = OSC_WORDS[part]
            f[k] = v
        elif part in NUMBERS:
            f["n"] = frozenset(NUMBERS[part])
        elif all(x in CASES for x in part.split("/")):
            f["c"] = frozenset(CASES[x] for x in part.split("/"))
        elif all(x in GENDERS for x in part.split("/")):
            f["g"] = frozenset(GENDERS[x] for x in part.split("/"))
    return f


GLAUX_POS = {"n": "N", "a": "A", "m": "NUM", "l": "T", "p": "PRON", "v": "V", "c": "CONJ",
             "b": "CONJ", "r": "PREP", "g": "PRT", "d": "ADV", "i": "INJ", "e": "INJ"}


def glaux_features(tag: str, lemma: str) -> dict:
    tag = (tag + "---------")[:9]
    pos = GLAUX_POS.get(tag[0])
    if pos == "N" and lemma[:1].isupper():
        pos = "NP"
    f = blank(pos)
    f["p"] = tag[1] if tag[1] in "123" else None
    f["n"] = frozenset({"s": "S", "p": "P", "d": "P"}.get(tag[2], ""))
    f["t"] = {"p": "P", "i": "I", "f": "F", "a": "A", "r": "R", "l": "L", "t": "F"}.get(tag[3])
    f["m"] = {"i": "I", "s": "S", "o": "O", "m": "M", "n": "N", "p": "P"}.get(tag[4])
    f["v"] = {"a": "A", "m": "M", "p": "P", "e": "E"}.get(tag[5])
    f["g"] = frozenset({"m": "M", "f": "F", "n": "N", "c": "MF"}.get(tag[6], ""))
    f["c"] = frozenset({"n": "N", "g": "G", "d": "D", "a": "A", "v": "V"}.get(tag[7], ""))
    f["d"] = {"c": "C", "s": "S"}.get(tag[8])
    return f


# ── Alignment ───────────────────────────────────────────────────────────────


def bigrams(keys: list[str]) -> set[tuple[str, str]]:
    return set(zip(keys, keys[1:]))


def candidates(keys: list[str], chapters: dict[str, Chapter], index: dict) -> list[str]:
    """The source chapters that may hold this Brenton chapter's text, best
    first: those sharing a twentieth of its word pairs (an addition of Esther
    filed in a chapter of its own shares little with the rest)."""
    mine = bigrams(keys)
    if not mine:
        return []
    shared = Counter()
    for pair in mine:
        for name in index.get(pair, ()):
            shared[name] += 1
    return [n for n, s in shared.most_common(6) if s / len(mine) >= 0.05]


def pair_index(chapters: dict[str, Chapter]) -> dict:
    index: dict[tuple[str, str], set[str]] = defaultdict(set)
    for name, words in chapters.items():
        for pair in bigrams([w[0] for w in words]):
            index[pair].add(name)
    return index


def similar(a: str, b: str) -> bool:
    return SequenceMatcher(None, a, b, autojunk=False).ratio() >= 0.75


def align(keys: list[str], chapters: dict[str, Chapter], names: list[str]) -> dict[int, tuple]:
    """Brenton token index → (source word, fuzzy?). The best chapter is aligned
    whole; later ones only fill what is still open, in runs of three or more
    words, so a formula another chapter shares cannot claim a stray word."""
    out: dict[int, tuple] = {}
    for rank, name in enumerate(names):
        words = chapters[name]
        theirs = [w[0] for w in words]
        sm = SequenceMatcher(None, keys, theirs, autojunk=False)
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "equal" and (rank == 0 or i2 - i1 >= 3):
                for k in range(i2 - i1):
                    out.setdefault(i1 + k, (words[j1 + k], False))
            # A word spelled differently in the two texts (Μωυσῆς/Μωσῆς,
            # a different augment) sits in a one-for-one replacement.
            elif tag == "replace" and rank == 0 and i2 - i1 == j2 - j1 <= 3:
                for k in range(i2 - i1):
                    if similar(keys[i1 + k], theirs[j1 + k]):
                        out.setdefault(i1 + k, (words[j1 + k], True))
    return out


# ── Robinson's conventions, from the Nestle 1904 ────────────────────────────
# Robinson's codes say more than either source: which pronoun class a lemma
# belongs to (D- for οὗτος, K- for ὅσος, A-…-N for οὐδείς), that γίνομαι's
# aorist is a second aorist of a middle deponent (V-2ADI), that εἰ is COND and
# οὐ PRT-N. Those are properties of the lemma, read off the Nestle 1904's own
# tagging, so a Septuagint word is coded the way the same word is in the NT.

INDECLINABLE = {"CONJ", "PREP", "PRT", "ADV", "INJ", "COND", "HEB", "ARAM"}
VOICE_CLASS = {"A": "A", "M": "M", "D": "M", "P": "P", "O": "P", "E": "E", "N": "E", "Q": "A", "X": "A"}
VERB = re.compile(r"V-(2?)([PIFARL])([AMPEDONQX])([ISONMP])")


def nt_tables() -> dict:
    by_lemma: dict[str, Counter] = defaultdict(Counter)
    forms: dict[str, Counter] = defaultdict(Counter)
    nestle = BIBLE / "greek-nestle-1904"
    for path in sorted((nestle / "words").glob("*.json")):
        words = json.loads(path.read_text(encoding="utf-8"))
        text = json.loads((nestle / path.name).read_text(encoding="utf-8"))
        for c, verses in words.items():
            for v, entries in verses.items():
                for token, (lemma, morph, *_) in zip(text[c][v].split(), entries):
                    by_lemma[lemma][morph] += 1
                    by_lemma[lexicon_key(lemma)][morph] += 1
                    forms[form_key(token)][(lemma, morph)] += 1
    return {"lemma": by_lemma, "forms": forms}


def form_key(token: str) -> str:
    """A token as a form: lowercase, NFC, grave as acute, no punctuation."""
    d = unicodedata.normalize("NFD", token.lower()).replace("̀", "́")
    return nfc("".join(c for c in d if unicodedata.category(c)[0] in "LM"))


# The Nestle heads the indefinite τις with its grave (τὶς); by key alone it
# would fall in with the interrogative τίς.
NT_HEADWORD = {"τις": "τὶς"}


def nt_codes(nt: dict, lemma: str) -> Counter:
    lemma = NT_HEADWORD.get(lemma, lemma)
    return nt["lemma"].get(lemma) or nt["lemma"].get(lexicon_key(lemma)) or Counter()


def nt_head(codes: Counter) -> tuple[str, str] | None:
    """The lemma's declined class in the NT: (head, persons part or "")."""
    heads = Counter()
    for code, n in codes.items():
        parts = code.split("-")
        if parts[0] in INDECLINABLE or parts[0] == "V":
            continue
        first = parts[1] if len(parts) > 1 else ""
        lead = re.match(r"[123][SP]?" if parts[0] == "S" else r"[123]?", first).group(0)
        heads[(parts[0], lead if parts[0] in ("S", "F") else "")] += n
    return heads.most_common(1)[0][0] if heads else None


def nt_suffix(codes: Counter, suffix: str) -> bool:
    total = sum(codes.values())
    return total > 0 and sum(n for c, n in codes.items() if c.endswith("-" + suffix)) * 2 > total


def nt_verb(codes: Counter, tense: str, vclass: str) -> tuple[Counter, Counter]:
    """For the lemma's verb forms in this tense and voice class: how often
    each Robinson voice letter, and how often second (2) vs first forms."""
    voices, second = Counter(), Counter()
    for code, n in codes.items():
        m = VERB.match(code)
        if m and m.group(2) == tense and VOICE_CLASS[m.group(3)] == vclass:
            voices[m.group(3)] += n
            second[bool(m.group(1))] += n
    return voices, second


def pick(options: frozenset, order: str) -> str:
    return next((x for x in order if x in options), "")


def cng(f: dict, gender: bool = True) -> str:
    """Case, number and gender as Robinson writes them (NSM). A syncretic
    form the context did not settle takes the likeliest reading; an unknown
    gender is left out (P-GS), as Robinson leaves it out of P-1GS."""
    # A name declined for case alone (GLAUx gives Ἀβραμ a case, no number)
    # is singular.
    out = pick(f["c"], "NAGDV") + (pick(f["n"], "SP") or "S")
    return out + (pick(f["g"], "MFN") if gender else "")


def robinson(lemma: str, f: dict, nt: dict) -> str:
    pos = f["pos"]
    if pos is None:
        return ""
    codes = nt_codes(nt, lemma)
    if pos in ("CONJ", "PREP", "PRT", "ADV", "INJ"):
        known = Counter({c: n for c, n in codes.items() if c.split("-")[0] in INDECLINABLE})
        same = Counter({c: n for c, n in known.items() if c.split("-")[0] == pos})
        if same:
            return same.most_common(1)[0][0]
        # The source's class decides only between the classes the NT gives
        # the lemma; otherwise the NT's wins (δέ is CONJ whether a source
        # calls it a particle or not, εἰ is COND, οὐχί PRT-I).
        if known:
            return known.most_common(1)[0][0]
        return pos + ("-" + f["d"] if f["d"] and pos == "ADV" else "")
    if pos == "V":
        return verb_code(lemma, f, codes)
    head = nt_head(codes)
    if pos in ("N", "NP", "A") and f["c"] and head and head[0] in ("N", "A"):
        # Robinson codes a substantival adjective (οἱ ἐχθροί, ἡ ἔρημος) as
        # an adjective; lxx-morph calls it a noun.
        pos = head[0]
    if pos in ("N", "NP"):
        pri = sum(n for c, n in codes.items() if c == "N-PRI")
        if not f["c"] or pri and pri >= 0.9 * sum(codes.values()):
            # Indeclinable: a name, or a Hebrew word left as it is (σαβαωθ),
            # whichever part of speech a source calls it.
            return "N-PRI" if lemma[:1].isupper() else "N-OI"
        return "N-" + cng(f)
    if pos == "T":
        return "T-" + cng(f)
    if not f["c"]:
        return "A-NUI" if pos in ("NUM", "A") else ""
    if head is None:
        head = ("P", "") if pos == "PRON" and f["p"] else (("D", "") if pos == "PRON" else ("A", ""))
    letter, lead = head
    if letter == "N":
        letter = "A"  # a substantive in the NT, an adjective here
    if letter == "P" and (f["p"] in ("1", "2") or lexicon_key(lemma) in ("εγω", "συ", "ημεισ", "υμεισ")):
        person = f["p"] or ("1" if lexicon_key(lemma) in ("εγω", "ημεισ") else "2")
        return f"P-{person}{cng(f, gender=False)}"
    if letter == "F":
        return f"F-{f['p'] or lead or '3'}{cng(f)}"
    if letter == "S":
        return f"S-{lead or '1S'}{cng(f)}"
    code = f"{letter}-{cng(f)}"
    if letter == "A" and f["d"]:
        return f"{code}-{f['d']}"
    if nt_suffix(codes, "N"):
        return code + "-N"
    return code


def verb_code(lemma: str, f: dict, codes: Counter) -> str:
    t, v, m = f["t"], f["v"], f["m"]
    if not (t and m):
        return ""
    v = v or "A"
    deponent = lemma.endswith("μαι")
    voices, second = nt_verb(codes, t, VOICE_CLASS[v])
    if voices:
        # The NT's own letter for this voice of this lemma (D for the middle
        # of a deponent, and for the future middle of λαμβάνω).
        v = voices.most_common(1)[0][0]
    elif v in "MPE" and (deponent or (t == "F" and v == "M")):
        v = {"M": "D", "P": "O", "E": "N"}[v]
    if not second and t == "A" and VOICE_CLASS[v] == "M":
        # An aorist middle the NT lacks (ἐλάβετο) is second if the active is.
        _, second = nt_verb(codes, t, "A")
    two = "2" if second and second[True] > second[False] else ""
    stem = f"V-{two}{t}{v}{m}"
    if m == "N":
        return stem
    if m == "P":
        return f"{stem}-{cng(f)}"
    return f"{stem}-{f['p'] or '3'}{pick(f['n'], 'SP') or 'S'}"


# ── Comparing the sources ───────────────────────────────────────────────────

VOICES = {"A": "A", "M": "M", "P": "P", "E": "MP"}
# Parts of speech the two sources draw differently for the same word: a
# substantival adjective is a noun in lxx-morph, ἄλλος a pronoun; the code
# rendered from either is compared, so the class decides only where the
# Nestle's conventions leave it open.
POS_GROUPS = [{"N", "NP", "A", "NUM", "PRON"}, {"CONJ", "PREP", "PRT", "ADV", "INJ"}, {"V"}, {"T"}]


def merge(a: dict, b: dict) -> dict | None:
    """The reading both feature sets allow, or None if they conflict.
    a's part of speech is kept."""
    if a["pos"] != b["pos"] and not any(a["pos"] in g and b["pos"] in g for g in POS_GROUPS):
        return None
    out = dict(a)
    if {a["pos"], b["pos"]} == {"N", "A"}:
        out["pos"] = "A"
    if {a["pos"], b["pos"]} == {"NP", "A"}:
        out["pos"] = "NP"  # a gentilic (Μακκαβαῖος) is a name here
    if a["pos"] == "NP" and not a["c"]:
        # lxx-morph leaves an indeclinable name unparsed (Δαυιδ); GLAUx
        # gives it the case of its place in the sentence. Robinson: N-PRI.
        return {**out, "c": frozenset(), "n": frozenset(), "g": frozenset()}
    for k in ("t", "m", "p", "d"):
        if a[k] and b[k] and a[k] != b[k]:
            return None
        out[k] = a[k] or b[k]
    if a["v"] and b["v"]:
        both = set(VOICES[a["v"]]) & set(VOICES[b["v"]])
        if not both:
            return None
        out["v"] = a["v"] if len(both) == 2 else both.pop()
    else:
        out["v"] = a["v"] or b["v"]
    for k in ("n", "c", "g"):
        if a[k] and b[k]:
            if not a[k] & b[k]:
                return None
            out[k] = a[k] & b[k]
        else:
            out[k] = a[k] or b[k]
    return out


def lemma_map(pairs: Counter) -> dict:
    """GLAUx headword → lxx-morph headword where GLAUx follows another
    convention: γίγνομαι for γίνομαι, and, per form, οὐ for οὐχί or ἄν for
    the ἐάν of ὃς ἐάν. A mapping holds where, over the words both sources
    reach, lxx-morph gives the other lemma at least four times and at least
    three times in four. Keys: (lemma, form) and lemma."""
    grouped: dict = defaultdict(Counter)
    for (g, form, o), n in pairs.items():
        grouped[(g, form)][o] += n
        grouped[g][o] += n
    out = {}
    for g, counts in grouped.items():
        (o, n), total = counts.most_common(1)[0], sum(counts.values())
        lemma = g[0] if isinstance(g, tuple) else g
        if lexicon_key(o) != lexicon_key(lemma) and n >= 4 and n * 4 >= total * 3:
            out[g] = o
    return out


def map_lemma(lmap: dict, lemma: str, form: str) -> str:
    return lmap.get((lemma, form)) or lmap.get(lemma) or lemma


def canon_lemma(lemma: str, nt: dict) -> str:
    """The NT's headword where the sources head a verb by its other voice
    (φοβέω for φοβέομαι) and the NT knows only that one."""
    if not lemma or lemma in nt["lemma"]:
        return lemma
    for a, b in (("ομαι", "ω"), ("ω", "ομαι"), ("οῦμαι", "έω"), ("έω", "έομαι"), ("άω", "άομαι")):
        if lemma.endswith(a) and lemma[: -len(a)] + b in nt["lemma"]:
            return lemma[: -len(a)] + b
    return lemma


def canon_voice(lemma: str, f: dict, nt: dict) -> dict:
    """A voice the NT never gives the lemma in this tense becomes the one it
    always does: ἔσται is a middle deponent future for Robinson (V-FDI-3S),
    an active one for lxx-morph."""
    if f["pos"] != "V" or not f["t"] or not f["v"]:
        return f
    codes = nt_codes(nt, lemma)
    seen = Counter()
    for v in "AMPE":
        voices, _ = nt_verb(codes, f["t"], v)
        seen[v] = sum(voices.values())
    total = sum(seen.values())
    if total >= 5 and not seen[VOICE_CLASS[f["v"]]]:
        top, n = seen.most_common(1)[0]
        if n >= 0.95 * total:
            return {**f, "v": top}
    return f


def spelling(key: str) -> str:
    """A headword key with the spellings lexicons head differently levelled:
    ττ/σσ (ἐλαττόω), contracted adjectives (χάλκεος/χαλκοῦς), ἕνεκα/ἕνεκεν."""
    key = key.replace("ττ", "σσ")
    key = re.sub(r"εοσ$", "ουσ", key)
    key = re.sub(r"ρρουσ$", "ρροσ", key)
    return "ενεκα" if key == "ενεκεν" else key


def same_lemma(a: str, b: str, f: dict) -> bool:
    if spelling(lexicon_key(a)) == spelling(lexicon_key(b)):
        return True
    # Hebrew names: lxx-morph heads Ιουδα indeclinable where GLAUx declines
    # Ἰούδας; the name is the same.
    return f["pos"] == "NP" and lexicon_key(a).rstrip("σ") == lexicon_key(b).rstrip("σ")


NOMINAL = {"N", "NP", "A", "NUM", "PRON", "T"}


def settle(fs: list[dict | None]) -> list[dict | None]:
    """Narrow the syncretic forms left open (τοῦ masculine or neuter) by the
    words they agree with: an article by the next nominal within four words,
    an adjective, pronoun or participle by a noun beside it."""
    def nominal(f):
        return f and (f["pos"] in NOMINAL or f["m"] == "P") and f["c"]

    def ambiguous(f):
        return len(f["c"]) > 1 or len(f["g"]) > 1 or len(f["n"]) > 1

    out = [dict(f) if f else f for f in fs]
    for i, f in enumerate(out):
        if not nominal(f) or not ambiguous(f) or f["pos"] == "PRON" and f["p"]:
            continue
        near = range(i + 1, min(i + 5, len(out))) if f["pos"] == "T" else [i + 1, i - 1, i + 2, i - 2]
        for j in near:
            g = out[j] if 0 <= j < len(out) else None
            if not nominal(g) or g["pos"] == "T" or (f["pos"] != "T" and g["pos"] not in ("N", "NP")):
                continue
            both = {k: f[k] & g[k] if f[k] and g[k] else f[k] for k in ("c", "n", "g")}
            if all(both[k] or not f[k] for k in both):
                f.update(both)
                break
    return out


# ── Glosses ─────────────────────────────────────────────────────────────────


def tbesg(step: Path) -> dict[str, list[tuple[str, str]]]:
    """lexicon key → [(headword, brief gloss)], from the TBESG table rows
    (eStrong, dStrong, uStrong, Greek, transliteration, morph, gloss, meaning)."""
    path = next((step / "Lexicons").glob("TBESG*.txt"))
    out: dict[str, list[tuple[str, str]]] = defaultdict(list)
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        cols = line.split("\t")
        if len(cols) < 7 or not re.fullmatch(r"G\d{4,5}[A-Z]?", cols[0]):
            continue
        gloss = cols[6].strip()
        for head in cols[3].split(","):
            head = nfc(head.strip())
            if head and gloss:
                out[lexicon_key(head)].append((head, gloss))
    return out


def lexicon_shard(name: str, key: str, cache: dict) -> list[dict]:
    shard = shard_of(key)
    if (name, shard) not in cache:
        path = BIBLE / "lexicon" / name / f"{shard}.json"
        cache[(name, shard)] = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    return cache[(name, shard)].get(key, [])


def short(gloss: str) -> str:
    """A few words: the first sense, without the lexicon's parentheses."""
    gloss = re.sub(r"\([^)]*\)|\[[^]]*\]|<[^>]*>", "", gloss)
    first = re.split(r"[;,:]", gloss)[0].strip(" .")
    words = first.split()
    return " ".join(words[:5])


def glosser(step: Path):
    brief = tbesg(step)
    cache: dict = {}
    memo: dict[str, str] = {}

    def from_tbesg(lemma: str) -> str:
        entries = brief.get(lexicon_key(lemma), [])
        exact = [g for h, g in entries if h == lemma]
        return short((exact or [g for _, g in entries] or [""])[0])

    def from_lexicon(name: str, lemma: str, field: str) -> str:
        entries = lexicon_shard(name, lexicon_key(lemma), cache)
        entry = next((e for e in entries if e["lemma"] == lemma), entries[0] if entries else {})
        return short(entry.get(field, ""))

    def gloss(lemma: str) -> str:
        if not lemma:
            return ""
        if lemma not in memo:
            # TBESG heads the active of verbs the LXX uses only in the middle
            # (πορεύω for πορεύομαι), and contracted nouns uncontracted
            # (ὀστέον for ὀστοῦν).
            other = re.sub(r"ομαι$", "ω", re.sub(r"οῦμαι$", "έω", lemma))
            other = re.sub(r"οῦν$", "έον", re.sub(r"οῦς$", "εος", other))
            fused = FUSED.get(form_key(lemma))
            memo[lemma] = (from_tbesg(lemma) or from_tbesg(other)
                           or from_lexicon("dodson", lemma, "gloss")
                           or from_lexicon("middle-liddell", lemma, "gloss")
                           or from_lexicon("middle-liddell", other, "gloss")
                           or (fused[2] if fused else ""))
        return memo[lemma]

    return gloss


# ── Building ────────────────────────────────────────────────────────────────


def aligned_book(slug: str, osc_root: Path, glaux_root: Path):
    """Per verse of Brenton: [(token, lxx-morph word, GLAUx word, fuzzy)]."""
    osc_files, glaux_docs = BOOKS[slug]
    osc: dict[str, Chapter] = {}
    for name in osc_files:
        osc.update(load_osc(osc_root, name))
    glaux: dict[str, Chapter] = {}
    for doc in glaux_docs:
        glaux.update(load_glaux(glaux_root, doc))
    osc_pairs, glaux_pairs = pair_index(osc), pair_index(glaux)
    out: dict[str, dict[str, list[tuple]]] = {}
    for ch, verses in brenton_book(slug).items():
        tokens = [(v, t) for v, text in verses.items() for t in text.split()]
        where = [i for i, (_, t) in enumerate(tokens) if is_word(t)]
        keys = [match_key(tokens[i][1]) for i in where]
        a = align(keys, osc, candidates(keys, osc, osc_pairs))
        b = align(keys, glaux, candidates(keys, glaux, glaux_pairs))
        rows = out.setdefault(ch, {v: [] for v in verses})
        at = {i: k for k, i in enumerate(where)}
        for i, (v, t) in enumerate(tokens):
            k = at.get(i)
            o, fo = a.get(k, (None, False)) if k is not None else (None, False)
            g, fg = b.get(k, (None, False)) if k is not None else (None, False)
            if o and (not o[1] or o[2]["pos"] is None):
                o = None
            if g and (not g[1] or g[2]["pos"] is None):
                g = None
            rows[v].append((t, k is not None, o, g, fo or fg))
    return out


def normalised(word: tuple | None, nt: dict, lmap: dict | None = None) -> tuple | None:
    """A source word with its lemma and voice in the NT's conventions; a
    GLAUx word (lmap given) also with lxx-morph's headwords."""
    if not word:
        return None
    key, lemma, f = word
    lemma = canon_lemma(map_lemma(lmap, lemma, key) if lmap is not None else lemma, nt)
    return key, lemma, canon_voice(lemma, f, nt)


def compare(o: tuple | None, g: tuple | None, fuzzy: bool, nt: dict) -> tuple[str, dict | None, str]:
    """(lemma, features, how) for one word from its two (normalised) source
    words; how is agreed, differ, osc, glaux, fuzzy or none. A word paired
    only by its likeness to a source word (another spelling, or another
    word: ἂν for ἐάν, ζητῆσαι for ἐκζητῆσαι) is never vouched for."""
    if o and g:
        m = merge(o[2], g[2])
        same = m is not None and same_lemma(o[1], g[1], o[2]) and (
            robinson(o[1], m, nt) == robinson(o[1], {**m, "pos": g[2]["pos"]}, nt))
        if fuzzy:
            return o[1], m if same else o[2], "fuzzy"
        return (o[1], m, "agreed") if same else (o[1], o[2], "differ")
    if o or g:
        return (o or g)[1], (o or g)[2], "fuzzy" if fuzzy else "osc" if o else "glaux"
    return "", None, "none"


def analyse(rows: list[tuple], lmap: dict, nt: dict):
    """One verse: [(lemma, features, how)], how as in `compare` or label."""
    out = [compare(normalised(o, nt), normalised(g, nt, lmap), fuzzy, nt) if word else ("", None, "label")
           for _, word, o, g, fuzzy in rows]
    settled = settle([f for _, f, _ in out])
    return [(lemma, f, how) for (lemma, _, how), f in zip(out, settled)]


def build(osc_root: Path, glaux_root: Path, step: Path, tagged: Path | None) -> None:
    nt = nt_tables()
    aligned = {slug: aligned_book(slug, osc_root, glaux_root) for slug in BOOKS}
    pairs = Counter((g[1], g[0], o[1]) for book in aligned.values() for verses in book.values()
                    for rows in verses.values() for _, _, o, g, _ in rows if o and g)
    lmap = lemma_map(pairs)
    print(f"GLAUx headwords mapped to lxx-morph's: {len(lmap)}")

    # First every word a source reaches; then the words neither reaches, from
    # the forms the agreed words and the Nestle 1904 attest.
    books: dict[str, dict[str, dict[str, list]]] = {}
    forms: dict[str, Counter] = defaultdict(Counter)
    for slug, chapters in aligned.items():
        for ch, verses in chapters.items():
            for v, rows in verses.items():
                entries = []
                for (token, *_), (lemma, f, how) in zip(rows, analyse(rows, lmap, nt)):
                    code = robinson(lemma, f, nt) if f else ""
                    entries.append([lemma, code, how, token])
                    if how == "agreed" and code:
                        forms[form_key(token)][(lemma, code)] += 1
                books.setdefault(slug, {}).setdefault(ch, {})[v] = entries

    tags = json.loads(tagged.read_text(encoding="utf-8")) if tagged else {}
    gloss = glosser(step)
    stats: dict[str, Counter] = defaultdict(Counter)
    for slug, chapters in books.items():
        out: dict[str, dict[str, list]] = {}
        for ch, verses in chapters.items():
            for v, entries in verses.items():
                row = []
                for i, (lemma, code, how, token) in enumerate(entries):
                    if how == "fuzzy":
                        # The form's own analysis, where the agreed words
                        # give it one, beats a look-alike's.
                        known = from_forms(token, forms, nt)
                        if known[2] == "lxx-form":
                            lemma, code = known[:2]
                    if how == "none":
                        lemma, code, how = from_forms(token, forms, nt)
                    hit = tags.get(slug, {}).get(f"{ch}:{v}", {}).get(str(i))
                    if how == "none" and hit:
                        lemma, code, how = from_tagger(token, *hit, lmap, nt)
                    stats[slug][how] += 1
                    if how == "label":
                        row.append(["", "", ""])
                        continue
                    if how == "fused":
                        entry = [lemma, code, FUSED[form_key(token)][2]]
                    elif how == "letter":
                        entry = [lemma, code, LETTERS[lemma]]
                    else:
                        entry = [lemma, code, gloss(lemma)]
                    if how != "agreed" or not code:
                        entry.append("?")
                    row.append(entry)
                out.setdefault(ch, {})[v] = row
        write_words(slug, out)
    report(stats)


# Brenton prints some phrases as one word where Rahlfs (and the NT) print
# two: ἀναμέσον for ἀνὰ μέσον, διατοῦτο, τοπρωΐ. Neither source has the
# fused word, so it is parsed here, as its head word, glossed as the phrase.
FUSED = {
    "ἀναμέσον": ("ἀνά", "PREP", "between"), "ἀνάμεσον": ("ἀνά", "PREP", "between"),
    "διατοῦτο": ("διά", "PREP", "therefore"), "διατί": ("διά", "PREP", "why"),
    "διαπαντός": ("διά", "PREP", "continually"), "τοπρωΐ": ("πρωΐ", "ADV", "in the morning"),
    "τοπρότερον": ("πρότερος", "ADV-C", "formerly"), "τοτάχος": ("τάχος", "N-ASN", "quickly"),
    "ἐπιτοαυτό": ("ἐπί", "PREP", "together"), "ἱνατί": ("ἵνα", "CONJ", "why"),
    "εἴτις": ("εἰ", "COND", "if anyone"), "εἴπως": ("εἰ", "COND", "if perhaps"),
    "πρινή": ("πρίν", "ADV", "before"), "ἐξεναντίας": ("ἐκ", "PREP", "opposite"),
    "καθότι": ("καθότι", "CONJ", "because"), "ὑπεράνω": ("ὑπεράνω", "PREP", "above"),
}

# The Hebrew letters heading the stanzas of Lamentations (ΑΛΕΦ.), and of
# Psalm 118 where Brenton prints them.
LETTERS = {
    "αλεφ": "aleph", "βηθ": "beth", "γιμελ": "gimel", "δαλεθ": "daleth", "η": "he",
    "ουαυ": "waw", "ζαιν": "zayin", "ηθ": "heth", "τηθ": "teth", "ιωδ": "yod",
    "χαφ": "kaph", "λαμεδ": "lamed", "μημ": "mem", "νουν": "nun", "σαμεχ": "samekh",
    "αιν": "ayin", "φη": "pe", "τσαδη": "tsade", "κωφ": "qoph", "ρηχσ": "resh",
    "χσεν": "shin", "θαυ": "taw",
}


def from_forms(token: str, forms: dict[str, Counter], nt: dict) -> tuple[str, str, str]:
    """A word neither source reaches: a fused phrase, a Hebrew letter, else
    the analysis its form has had elsewhere (the agreed words of the
    Septuagint, then the Nestle 1904) when that is nearly always one lemma;
    else nothing. The gloss of a fused phrase rides on its code: see build."""
    form = form_key(token)
    if form in FUSED:
        return FUSED[form][0], FUSED[form][1], "fused"
    # Set in bare capitals with a stop: Η. is the letter, Ἡ the article.
    if token.endswith(".") and token[:-1] == bare(token).upper() and bare(token) in LETTERS:
        return bare(token), "N-LI", "letter"
    for table, how in ((forms, "lxx-form"), (nt["forms"], "nt-form")):
        counts = table.get(form)
        if not counts:
            continue
        lemmas = Counter()
        for (lemma, _), n in counts.items():
            lemmas[lemma] += n
        lemma, n = lemmas.most_common(1)[0]
        # τοῦ is ὁ, masculine or neuter: the lemma is sure, the code the
        # likelier one (and unchecked).
        if n >= 0.9 * sum(lemmas.values()):
            code = max(((c, k) for (lm, c), k in counts.items() if lm == lemma), key=lambda x: x[1])[0]
            return lemma, code, how
    return "", "", "none"


UD_POS = {"NOUN": "N", "PROPN": "NP", "ADJ": "A", "NUM": "NUM", "DET": "T", "PRON": "PRON",
          "VERB": "V", "AUX": "V", "CCONJ": "CONJ", "SCONJ": "CONJ", "ADP": "PREP",
          "PART": "PRT", "ADV": "ADV", "INTJ": "INJ"}


def ud_features(pos: str, feats: str) -> dict:
    """OdyCy's Universal Dependencies features in the shape of `features`.
    UD splits Greek tense into Tense and Aspect: Past alone is the aorist,
    Past + Imp the imperfect, Perf the perfect."""
    ud = dict(kv.split("=", 1) for kv in feats.split("|") if "=" in kv)
    f = blank(UD_POS.get(pos))
    if f["pos"] == "T" and ud.get("PronType") != "Art":
        f["pos"] = "PRON"
    tense, aspect = ud.get("Tense"), ud.get("Aspect")
    if f["pos"] == "V":
        f["t"] = ("L" if tense == "Pqp" else "R" if aspect == "Perf" else "F" if tense == "Fut"
                  else "I" if tense == "Past" and aspect == "Imp" else "A" if tense == "Past"
                  else "P" if tense == "Pres" else None)
        f["v"] = {"Act": "A", "Mid": "M", "Pass": "P", "MidPass": "E"}.get(ud.get("Voice", ""))
        form = ud.get("VerbForm")
        f["m"] = "N" if form == "Inf" else "P" if form == "Part" else {
            "Ind": "I", "Sub": "S", "Opt": "O", "Imp": "M"}.get(ud.get("Mood", ""))
    f["p"] = ud.get("Person")
    f["n"] = frozenset({"Sing": "S", "Plur": "P", "Dual": "P"}.get(ud.get("Number", ""), ""))
    f["c"] = frozenset({"Nom": "N", "Gen": "G", "Dat": "D", "Acc": "A", "Voc": "V"}.get(ud.get("Case", ""), ""))
    f["g"] = frozenset("".join({"Masc": "M", "Fem": "F", "Neut": "N"}.get(g, "") for g in ud.get("Gender", "").split(",")))
    f["d"] = {"Cmp": "C", "Sup": "S"}.get(ud.get("Degree", ""))
    return f


def from_tagger(token: str, lemma: str, pos: str, feats: str, lmap: dict, nt: dict) -> tuple[str, str, str]:
    """OdyCy's reading. Its lemmas are the treebanks' classical headwords, as
    GLAUx's are, so they take the same map; for a word it does not know it
    gives the word itself, which is no lemma unless the word is a name."""
    word = normalised((match_key(token), lemma, ud_features(pos, feats)), nt, lmap)
    if (not word or word[2]["pos"] is None or not word[1].isalpha()
            or lexicon_key(word[1]) == bare(token) and word[2]["pos"] != "NP"):
        return "", "", "none"
    code = robinson(word[1], word[2], nt)
    return (word[1], code, "tagger") if code else ("", "", "none")


def write_words(slug: str, words: dict) -> None:
    out = BRENTON / "words"
    out.mkdir(exist_ok=True)
    (out / f"{slug}.json").write_text(
        json.dumps(words, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def report(stats: dict[str, Counter]) -> None:
    kinds = ["agreed", "differ", "osc", "glaux", "fuzzy", "lxx-form", "nt-form", "fused", "letter", "tagger", "none"]
    total = Counter()
    print(f"{'book':16} {'words':>6} " + " ".join(f"{k:>8}" for k in kinds))
    for slug, c in stats.items():
        total.update(c)
        n = sum(c.values()) - c["label"]
        print(f"{slug:16} {n:6} " + " ".join(f"{100 * c[k] / n:8.1f}" for k in kinds))
    n = sum(total.values()) - total["label"]
    print(f"{'all':16} {n:6} " + " ".join(f"{100 * total[k] / n:8.1f}" for k in kinds))


# ── The tagger (optional) ───────────────────────────────────────────────────


def tag(out: Path) -> None:
    """Run OdyCy over every verse with a word nothing else parsed, and keep
    its lemma, UD part of speech and features for those words:
    {slug: {"c:v": {i: [lemma, pos, feats]}}}.
    Needs spaCy and the model, so it runs from their venv (see the docstring)."""
    import spacy  # noqa: PLC0415 — only in the tagger's venv
    from spacy.tokens import Doc  # noqa: PLC0415

    nlp = spacy.load("grc_odycy_joint_trf")
    tags: dict[str, dict[str, dict[int, list[str]]]] = {}
    for path in sorted((BRENTON / "words").glob("*.json")):
        words = json.loads(path.read_text(encoding="utf-8"))
        text = brenton_book(path.stem)
        for c, verses in words.items():
            for v, entries in verses.items():
                gaps = [i for i, e in enumerate(entries) if e[:2] == ["", ""] and e[3:] == ["?"]]
                if not gaps:
                    continue
                # The verse's own tokens, without their punctuation, so the
                # tagger's words are the file's words, one for one.
                tokens = [re.sub(r"[,.·;:!()]+", "", t) or t for t in text[c][v].split()]
                doc = nlp(Doc(nlp.vocab, words=tokens))
                tags.setdefault(path.stem, {})[f"{c}:{v}"] = {i: [nfc(doc[i].lemma_), doc[i].pos_, str(doc[i].morph)] for i in gaps}
    out.write_text(json.dumps(tags, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"tagged {sum(len(v) for b in tags.values() for v in b.values())} words")


def main(argv: list[str]) -> None:
    if len(argv) == 3 and argv[1] == "tag":
        tag(Path(argv[2]))
    elif len(argv) in (4, 5):
        build(Path(argv[1]), Path(argv[2]), Path(argv[3]), Path(argv[4]) if len(argv) == 5 else None)
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main(sys.argv)
