#!/usr/bin/env python3
"""English gloss of every word of the Brenton Septuagint.

Rewrites only the gloss (third element) of each entry of
content/bible/greek-brenton/words/<slug>.json; lemma, morph and the "?" mark
are lxx_words.py's and stay as they are. Each word takes the first of:

  1. The Berean gloss of the same form in the NT ("form-aware"): the most
     common Berean Interlinear gloss (public domain, as glosses.py brought it
     into the Nestle 1904) for the same lemma and Robinson code in the Nestle
     1904 (ἐγένετο V-2ADI-3S "it came to pass", λέγων V-PAP-NSM "saying").
     Nouns, adjectives, articles, demonstratives and participles also match
     with the gender set aside (case and number decide their English; a noun
     the LXX and NT gender differently is the same noun). Proper names never
     take it: Ἰησοῦς in Joshua is not "Jesus", Ἰούδας mostly not "Judas", and
     the Berean glosses indeclinable names with the case of their verse
     ("of David").
  2. The brief TBESG gloss of the lemma, as lxx_words.py picks it (with
     Dodson and Middle Liddell behind it) — except where that gloss is a
     slash-list of senses (ἐν "in/on/among", ὁ "the/this/who", εἰς
     "toward/to/into") and the word is indeclinable (preposition,
     conjunction, particle, adverb, interjection): then the Berean's most
     common gloss of the lemma across the NT ("in", "into"), which is the
     interlinear's own choice and a single sense. A declinable word keeps
     TBESG's dictionary form rather than another form's Berean ("to say", not
     "said", for a future the NT lacks).
  3. For words still without a gloss, the STEPBible TFLSJ (full LSJ) gloss:
     of a headword whose spelling differs only as LXX and lexicon spellings do
     (λήμψις/λῆψις, ὀλεθρ-/ὀλοθρ-, γενημα/γεννημα), else of the one entry
     that prints the word in bold as a variant form. A few words at most.
  4. For proper names still without one, the English name of STEPBible's
     TIPNR (Tyndale's proper names): first by the bare letters of the Greek
     forms TIPNR lists — but those are the NT's and a dozen "LXX additions",
     and the names they cover TBESG already glosses. TIPNR gives the names of
     the Hebrew OT only in Hebrew, with every verse each occurs in; so a name
     otherwise unglossed is matched by the verses it shares with them and the
     likeness of its letters to the English (see `name_votes`). That is a
     guess from evidence, not a lookup: a sample read back was about 19 in 20
     right, the misses being a near neighbour in the same verse (Αβδιου).

The Berean's capitals are dropped from common words ("In [the]" → "in [the]",
its reverent "Me", "He", "Father", "Spirit") except the few in CAPITALS;
proper names never take its gloss. Brackets ("[the]", "of [the]") are the
Berean's and stay. A blank Berean gloss ("", "-": an article it leaves
untranslated) never wins.

Sources (each licence read in the repo it comes from):
    Berean      via content/bible/greek-nestle-1904/words/ (see glosses.py):
                Bible Hub dedicated the Berean texts to the public domain.
    STEPBible   github.com/STEPBible/STEPBible-Data @ 5de0a47f35f0fc13dfe1430d104e5db8a4285f9c
                (the commit lxx_words.py reads TBESG at): Lexicons/TBESG,
                Lexicons/TFLSJ (0-5624 and extra), Proper Nouns/TIPNR, all
                "STEPBible.org CC BY" (README.md: "STEPBible Data Repository
                CC BY 4.0"; each file: "Data created by www.STEPBible.org based
                on work at Tyndale House Cambridge (CC BY 4.0)").

Order (each step reads what the one before wrote, and each can be rerun; this
one reads only lemma and morph, so it can be rerun on its own output):
    python3 -I scripts/greek-bible/glosses.py ...          (the NT's Berean glosses)
    python3 -I scripts/greek-bible/lxx_words.py ...        (LXX lemma, morph, TBESG gloss)
    python3 -I scripts/greek-bible/lxx_glosses.py <STEPBible-Data>
    python3 -I scripts/greek-bible/concordance.py brenton  (lemmas only; glosses don't touch it)
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path

# -I drops the script's directory from sys.path; the key and lxx_words.py live beside us.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lexicon_key import lexicon_key  # noqa: E402
from lxx_words import BIBLE, BRENTON, FUSED, LETTERS, brenton_book, form_key, glosser, nfc, short, spelling  # noqa: E402

INDECLINABLE = re.compile(r"(PREP|CONJ|PRT|ADV|INJ|COND|ARAM|HEB)(-|$)")
# Codes whose English does not change with gender.
GENDERLESS = re.compile(r"^(N|A|T|D|V-.+P)-")
# Capitals the Berean writes that stay capitals in the Septuagint. Every other
# capital in the gloss of a common noun or verb is the Berean's: a sentence or
# a quotation beginning ("In [the]", "And"), or reverence for Christ ("Me",
# "He", "Father", "Son", "Spirit", "Teacher") that the OT words do not carry.
CAPITALS = {"I", "God", "Lord", "O", "Almighty", "Sabbath", "Sabbaths", "Passover", "Gentiles"}


def blank(gloss: str) -> bool:
    return gloss.strip() in ("", "-", "–", "—")


def genderless(code: str) -> str | None:
    """N-GSF → N-GS*; a participle V-PAP-NSM → V-PAP-NS*. None for codes whose
    English hangs on gender (personal pronouns: "of him", "of her")."""
    if not GENDERLESS.match(code):
        return None
    m = re.fullmatch(r"(.*-[NGDAV][SP])[MFN](-[A-Z]+)?", code)
    return f"{m[1]}*{m[2] or ''}" if m else None


# ── The Berean, from the Nestle 1904 ────────────────────────────────────────


def uncap(gloss: str) -> str:
    return re.sub(r"[A-Z][a-z']*", lambda m: m[0] if m[0] in CAPITALS else m[0].lower(), gloss)


def berean() -> dict:
    """Counts of each Berean gloss per (lemma, code), (lemma, genderless code)
    and lemma of a common word, capitals undone, plus the lemma keys."""
    rows = []  # (lemma, code, gloss)
    for path in sorted((BIBLE / "greek-nestle-1904" / "words").glob("*.json")):
        words = json.loads(path.read_text(encoding="utf-8"))
        for c, verses in words.items():
            for v, entries in verses.items():
                for lemma, code, gloss, *_ in entries:
                    rows.append((nfc(lemma), code, gloss.strip()))

    form: dict[tuple[str, str], Counter] = defaultdict(Counter)
    loose: dict[tuple[str, str], Counter] = defaultdict(Counter)
    lemma_glosses: dict[str, Counter] = defaultdict(Counter)
    keys: dict[str, set[str]] = defaultdict(set)
    for lemma, code, gloss in rows:
        if lemma[:1].isupper():
            continue
        keys[spelling(lexicon_key(lemma))].add(lemma)
        if blank(gloss):
            continue
        gloss = uncap(gloss)
        form[(lemma, code)][gloss] += 1
        if (g := genderless(code)):
            loose[(lemma, g)][gloss] += 1
        lemma_glosses[lemma][gloss] += 1
    return {"form": form, "loose": loose, "lemma": lemma_glosses, "keys": keys}


def nt_lemma(nt: dict, lemma: str) -> str | None:
    """The NT's headword for an LXX lemma: the same, or the one NT lemma with
    the same bare letters (LXX and NT headwords differ in accents and the
    spellings `spelling` levels)."""
    if lemma in nt["lemma"]:
        return lemma
    same = nt["keys"].get(spelling(lexicon_key(lemma)), set())
    return next(iter(same)) if len(same) == 1 else None


def top(counts: Counter | None) -> str:
    return counts.most_common(1)[0][0] if counts else ""


# Words a gloss can carry besides its sense: articles, pronouns, auxiliaries,
# the prepositions English uses for Greek cases.
FUNCTION = set("""a an the of to for in on by with from at into upon and i you he she it we they me
him her us them my your his its our their this that these those who whom which what is are was
were be been being am has have had having will shall would should may might can could let not no o but or nor yet so as then now also even if because there""".split())


def sense(gloss: str) -> frozenset[str]:
    """The gloss's content words, roughly stemmed: "he made", "made" and
    "[it is] made" are one sense; "did" and "made" two."""
    words = re.findall(r"[a-z']+", re.sub(r"\[[^]]*\]", "", gloss.lower()))
    return frozenset(w.removesuffix("s")[:4] for w in words if w not in FUNCTION)


def form_gloss(counts: Counter | None, senses: set[str]) -> str:
    """The Berean's gloss of a form: of the senses its glosses give it, the
    most common that is also one of the lemma's (`lemma_senses`), and of
    that sense's phrasings the most common (the shorter on a tie). So the
    NT's idiom does not stand for the word: καλόν "good", not "better" (καλόν
    ἐστιν, "it is better"); ψυχήν "life" and "soul" alike."""
    if not counts:
        return ""
    groups: dict[frozenset, Counter] = defaultdict(Counter)
    for gloss, n in counts.items():
        groups[sense(gloss)][gloss] += n
    ranked = sorted(groups.items(), key=lambda kv: -sum(kv[1].values()))
    for key, phrasings in ranked:
        if not key or key & senses:
            return min(phrasings, key=lambda g: (-phrasings[g], len(g)))
    return ""


def lemma_senses(nt: dict, head: str, base: str) -> set[str]:
    """The senses of a lemma: its TBESG gloss's, and the Berean's five
    commonest for the lemma and any it gives a twentieth of its occurrences
    (the stems are rough: "made" is not "make", nor "did" "do")."""
    senses = set().union(*(sense(g) for g in base.split("/"))) if base else set()
    counts = nt["lemma"].get(head, Counter())
    groups: Counter = Counter()
    for gloss, n in counts.items():
        groups[sense(gloss)] += n
    total = sum(groups.values())
    for i, (key, n) in enumerate(groups.most_common()):
        if i < 5 or n >= total / 20:
            senses |= key
    return senses


# ── TFLSJ ───────────────────────────────────────────────────────────────────


def loose_key(key: str) -> str:
    """Spellings in which LXX headwords and LSJ's differ, levelled."""
    key = spelling(key).replace("μψ", "ψ").replace("ολεθρ", "ολοθρ").replace("γεννημ", "γενημ")
    return re.sub(r"(.)\1", r"\1", key)


def tflsj(step: Path) -> tuple[dict[str, list[str]], dict[str, set[str]]]:
    """loose key of a headword → its glosses; loose key of a bold form in an
    entry → the glosses of the entries printing it."""
    heads: dict[str, list[str]] = defaultdict(list)
    bold: dict[str, set[str]] = defaultdict(set)
    for path in sorted((step / "Lexicons").glob("TFLSJ*.txt")):
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            cols = line.split("\t")
            if len(cols) < 8 or not re.fullmatch(r"G\d{4,5}[A-Z]?", cols[0]):
                continue
            gloss = short(cols[6]) or short(cols[6].replace("(", "").replace(")", ""))
            if not gloss:
                continue
            for head in cols[3].split(","):
                if (k := lexicon_key(nfc(head.strip()))):
                    heads[loose_key(k)].append(gloss)
            for b in re.findall(r"<b>([^<]+)</b>", cols[7]):
                for w in re.split(r"[\s,.;:·]+", b):
                    if len(k := lexicon_key(nfc(w))) > 3:
                        bold[loose_key(k)].add(gloss)
    return heads, bold


def from_tflsj(heads: dict, bold: dict, lemma: str, common: bool = False) -> str:
    """The first TFLSJ gloss of the lemma (of its active, for a middle);
    with `common`, the first that is not a name."""
    other = re.sub(r"ομαι$", "ω", re.sub(r"οῦμαι$", "έω", lemma))
    for word in (lemma, other):
        glosses = heads.get(loose_key(lexicon_key(word)), [])
        if common:
            return next((g for g in glosses if uncap(g) == g), "")
        if glosses:
            return glosses[0]
    for word in (lemma, other):
        hits = bold.get(loose_key(lexicon_key(word)), set())
        if len(hits) == 1:
            return next(iter(hits))
    return ""


# ── TIPNR ───────────────────────────────────────────────────────────────────

# Douay slug of the Brenton → TIPNR's book. The deuterocanon has none: its
# names are glossed from the votes their lemma wins in these books.
TIPNR_BOOKS = {
    "genesis": "Gen", "exodus": "Exo", "leviticus": "Lev", "numbers": "Num", "deuteronomy": "Deu",
    "josue": "Jos", "judges": "Jdg", "ruth": "Rut", "1-kings": "1Sa", "2-kings": "2Sa",
    "3-kings": "1Ki", "4-kings": "2Ki", "1-paralipomenon": "1Ch", "2-paralipomenon": "2Ch",
    "1-esdras": "Ezr", "2-esdras": "Neh", "esther": "Est", "job": "Job", "psalms": "Psa",
    "proverbs": "Pro", "ecclesiastes": "Ecc", "canticles": "Sng", "isaias": "Isa", "jeremias": "Jer",
    "lamentations": "Lam", "ezechiel": "Ezk", "daniel": "Dan", "osee": "Hos", "joel": "Jol",
    "amos": "Amo", "abdias": "Oba", "jonas": "Jon", "micheas": "Mic", "nahum": "Nam",
    "habacuc": "Hab", "sophonias": "Zep", "aggeus": "Hag", "zacharias": "Zec", "malachias": "Mal",
}
REF = re.compile(r"(?<![.\w])([1-3][A-Z][a-z]|[A-Z][a-z]{2})\.(\d+)\.(\d+)")


def tipnr(step: Path) -> tuple[dict[str, str], dict[tuple[str, int, int], set[str]]]:
    """Bare letters of each Greek name form TIPNR lists → its English name
    (where only one), and (book, chapter, verse) → the English names TIPNR
    finds there, whatever language it lists the form in."""
    path = next((step / "Proper Nouns").glob("TIPNR*.txt"))
    greek: dict[str, Counter] = defaultdict(Counter)
    verses: dict[tuple[str, int, int], set[str]] = defaultdict(set)
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        cols = line.split("\t")
        # Sub-records: "– Named", UniqueName, dStrong«eStrong=form, English, refs.
        if not line.startswith("– ") or len(cols) < 5 or "«" not in cols[2]:
            continue
        # "Ish/-tob": TIPNR marks where a hyphenated name is split.
        english = re.split(r"\s*[=;,(]", cols[3].strip())[0].strip().replace("/-", "-")
        if not english[:1].isupper():
            continue
        form = cols[2].strip().rpartition("=")[2]
        if re.search(r"[Ͱ-Ͽἀ-῿]", form):
            greek[lexicon_key(nfc(form))][english] += 1
        for book, c, v in REF.findall(cols[4]):
            verses[(book, int(c), int(v))].add(english)
    return {k: next(iter(c)) for k, c in greek.items() if len(c) == 1}, verses


# Greek and English spellings of Hebrew names, reduced to what they share.
GREEK_LATIN = [("ου", "u"), ("χ", ""), ("κ", "k"), ("θ", "t"), ("φ", "p"), ("ψ", "ps"), ("ξ", "x"),
               ("υ", "u"), ("η", "e"), ("ω", "o"), ("β", "b"), ("γ", "g"), ("δ", "d"), ("ζ", "z"),
               ("λ", "l"), ("μ", "m"), ("ν", "n"), ("π", "p"), ("ρ", "r"), ("σ", "s"), ("τ", "t"),
               ("α", "a"), ("ε", "e"), ("ι", "i"), ("ο", "o")]
ENGLISH_LATIN = [("sh", "s"), ("ch", "k"), ("ph", "p"), ("th", "t"), ("kh", "k"), ("c", "k"), ("q", "k"),
                 ("j", "i"), ("y", "i"), ("f", "p"), ("v", "b"), ("w", "u"), ("h", "")]


def latin(word: str, table: list[tuple[str, str]]) -> str:
    for a, b in table:
        word = word.replace(a, b)
    return re.sub(r"(.)\1", r"\1", word)


def name_likeness(lemma: str, english: str) -> float:
    """How alike a Greek and an English spelling of a name are, 0–1; 0 when
    their first consonants differ (Αμβρι is Omri, not Samaria), σ and z
    being one (Εσδρας, Ezra)."""
    g = latin(lexicon_key(lemma), GREEK_LATIN).replace("z", "s")
    e = latin(re.sub(r"[^a-z]", "", english.lower()), ENGLISH_LATIN).replace("z", "s")
    if re.sub(r"[aeiou]", "", g)[:1] != re.sub(r"[aeiou]", "", e)[:1]:
        return 0.0
    # The Greek declension's endings (Ἰωσίας, Ἰεροβοάμ/-ον) are not the name's.
    return max(SequenceMatcher(None, x, e).ratio() for x in (g, re.sub(r"(os|s|n)$", "", g)))


def gentilic(lemma: str, english: str) -> str:
    """A gentilic (Ἀσσύριος, Ἀμορραῖος) takes the people's English, not the
    land's: "Assyrian" for TIPNR's Assyria, else nothing."""
    if not re.search(r"(ιοσ|ιτησ|ιτισ|ισσα)$", lexicon_key(lemma)) or re.search(r"(ite|ites|ian|ians|ean|eans|i)$", english):
        return english
    return english + "n" if english.endswith("a") else ""


def name_votes(books: dict, verses: dict, shared: dict) -> dict[str, str]:
    """Each LXX name nothing else glosses votes, at each occurrence, for the
    TIPNR name most like it among those TIPNR finds within a verse of the same
    place (Psalms: the Hebrew numbering, a psalm on). Of the names that win a
    quarter of a lemma's votes (Ιωναθαν: TIPNR's Jehonathan and Jonathan, one
    Hebrew name) the likest wins, when together they hold half of
    the votes, the votes cover a third of the lemma's occurrences, and the
    likeness is at least 0.75 for one vote, 0.7 for up to four, 0.66 beyond
    (Μαρδοχαῖος, Mordecai)."""
    votes: dict[str, Counter] = defaultdict(Counter)
    seen = Counter()
    for slug, words in books.items():
        book = TIPNR_BOOKS.get(slug)
        for c, vs in words.items():
            for v, entries in vs.items():
                c1, v1 = map(int, (shared.get(slug, {}).get(f"{c}:{v}") or f"{c}:{v}").split(":")[:2])
                chapters = (c1, c1 + 1) if book == "Psa" else {int(c), c1}
                last = v1 + 3 if book == "Psa" else v1 + 2
                near = set().union(*(verses.get((book, cc, vv), set()) for cc in chapters for vv in range(v1 - 1, last)))
                for lemma, _, gloss, *_ in entries:
                    if not lemma[:1].isupper() or gloss:
                        continue
                    seen[lemma] += 1
                    score, best = max(((name_likeness(lemma, n), n) for n in near), default=(0, ""))
                    if score >= 0.5:
                        votes[lemma][best] += 1
    out = {}
    for lemma, counts in votes.items():
        total = sum(counts.values())
        strong = [n for n, k in counts.items() if k >= total / 4]
        if not strong:
            continue
        likeness, best = max((name_likeness(lemma, n), n) for n in strong)
        floor = 0.75 if total == 1 else 0.7 if total < 5 else 0.66
        if sum(counts[n] for n in strong) >= total / 2 and total >= seen[lemma] / 3 and likeness >= floor:
            if (english := gentilic(lemma, best)):
                out[lemma] = english
    return out


# ── Building ────────────────────────────────────────────────────────────────


def main(argv: list[str]) -> None:
    if len(argv) != 2:
        sys.exit(__doc__)
    step = Path(argv[1])
    nt = berean()
    tbesg = glosser(step)
    heads, bold = tflsj(step)
    greek_names, name_verses = tipnr(step)
    shared = json.loads((BRENTON / "versification.json").read_text(encoding="utf-8"))

    books = {p.stem: json.loads(p.read_text(encoding="utf-8")) for p in sorted((BRENTON / "words").glob("*.json"))}
    hows: dict[tuple[str, str, str, int], str] = {}
    for slug, words in books.items():
        text = brenton_book(slug)
        for c, verses in words.items():
            for v, entries in verses.items():
                for i, (token, entry) in enumerate(zip(text[c][v].split(), entries)):
                    entry[2], hows[(slug, c, v, i)] = gloss_of(token, entry[0], entry[1], nt, tbesg, heads, bold, greek_names)

    # Names TIPNR lists only in Hebrew: by the verses they share with it.
    voted = name_votes(books, name_verses, shared)
    stats = Counter()
    for slug, words in books.items():
        for c, verses in words.items():
            for v, entries in verses.items():
                for i, entry in enumerate(entries):
                    how = hows[(slug, c, v, i)]
                    if how == "none" and entry[0] in voted:
                        entry[2], how = voted[entry[0]], "tipnr-verse"
                    stats[how] += 1
        (BRENTON / "words" / f"{slug}.json").write_text(
            json.dumps(words, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    total = sum(n for how, n in stats.items() if how != "label")
    for how, n in stats.most_common():
        print(f"{how:12} {n:7} {100 * n / total:5.1f}%")


def gloss_of(token, lemma, code, nt, tbesg, heads, bold, greek_names) -> tuple[str, str]:
    if not lemma and not code:
        return "", "label" if token.startswith("(") else "none"
    fused = FUSED.get(form_key(token))
    if fused and (lemma, code) == fused[:2]:
        return fused[2], "fused"
    if lemma in LETTERS:
        return LETTERS[lemma], "letter"
    name = lemma[:1].isupper()
    head = None if name else nt_lemma(nt, lemma)
    base = tbesg(lemma)
    if head and code:
        senses = lemma_senses(nt, head, base)
        if (g := form_gloss(nt["form"].get((head, code)), senses)):
            return g, "form"
        if (loose := genderless(code)) and (g := form_gloss(nt["loose"].get((head, loose)), senses)):
            return g, "form"
    if head and INDECLINABLE.match(code) and (not base or "/" in base) and (g := top(nt["lemma"].get(head))):
        return g, "nt-lemma"
    if not name and base and uncap(base) != base:
        # TBESG heads some common words under a name of the same letters
        # (χλόη "Chloe"): the lexicon's common sense, if it has one.
        return from_tflsj(heads, bold, lemma, common=True) or base, "tbesg"
    if base:
        return base, "tbesg"
    if not name and (g := from_tflsj(heads, bold, lemma)):
        return g, "tflsj"
    if name and (g := greek_names.get(lexicon_key(lemma))):
        return g, "tipnr"
    return "", "none"


if __name__ == "__main__":
    main(sys.argv)
