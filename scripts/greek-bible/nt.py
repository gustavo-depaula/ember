#!/usr/bin/env python3
"""Build content/bible/greek-<edition>/ from an open Greek New Testament.

Writes, per book, `<slug>.json` ({chapter: {verse: text}}, the shape the app
reads for every Bible), `words/<slug>.json` ({chapter: {verse: [[lemma, morph],
...]}}, one entry per whitespace token of the verse text, in order),
`index.json`, and `versification.json` (this edition's verse → the Clementine
Vulgate address the app shares across Bibles, only where they differ; `null`
when the Vulgate has no such verse). Each edition keeps its own numbering.

Morphology is Robinson's parsing scheme throughout ("V-PAI-3S", "N-NSM",
"T-NSM", "CONJ", "P-1GS", ...), the one byztxt, Tischendorf and the Nestle 1904
already use; MorphGNT's CCAT tags are converted (see `morphgnt_to_robinson`).

Editions, sources and licences (each verified in the repo it comes from):

    nestle-1904      github.com/biblicalhumanities/Nestle1904 (morph/Nestle1904.csv)
                     Text: Diego Renato dos Santos's Nestle 1904, public domain.
                     Morphology, lemmas, Strong's: Ulrik Sandborg-Petersen after
                     Maurice A. Robinson, CC0 1.0 (morph/README.md).
    sblgnt           github.com/LogosBible/SBLGNT (data/sblgnt/text) for the text,
                     CC BY 4.0: "SBL Greek New Testament (SBLGNT), copyright 2010
                     by the Society of Biblical Literature and Logos Bible
                     Software". Morphology: github.com/morphgnt/sblgnt, CC BY-SA
                     3.0: "MorphGNT: SBLGNT Edition, J. K. Tauber, ed.". The CCAT
                     tags are refined with the Nestle 1904 morphology (CC0).
    tischendorf      github.com/morphgnt/tischendorf-data (word-per-line/2.8/Unicode)
                     Tischendorf 8th ed., text (G. Clint Yale) and analysis (Ulrik
                     Sandborg-Petersen, after M. A. Robinson): public domain.
    westcott-hort    github.com/byztxt/greektext-westcott-hort (parsed/*.UWH)
                     M. A. Robinson's Westcott-Hort 1881 with parsing and
                     Strong's: public domain. Unaccented (see below).
    byzantine        github.com/byztxt/byzantine-majority-text
                     Robinson-Pierpont 2018: csv-unicode/ccat/no-variants for the
                     accented text, csv-unicode/strongs/with-parsing for parsing
                     and Strong's. The Unlicense (public domain dedication).
    scrivener        github.com/byztxt/greektext-scrivener (textonly/*.SCV)
                     Scrivener 1894 TR, public domain, text only. Its parsing is
                     borrowed by alignment from Robinson's parsed Textus Receptus,
                     github.com/byztxt/greektext-textus-receptus (public domain),
                     a TR that differs from Scrivener in a few hundred words.

Westcott-Hort and Scrivener are not shipped: their only open texts have no
accents, breathings, capitals or punctuation, and the Byzantine text and
Tischendorf/Nestle already stand for their traditions. Rebuild them here if
an accented copy turns up.

Lemmas for the byztxt editions, which carry only Strong's numbers, come from
Strong's Greek dictionary, github.com/openscriptures/strongs
(greek/StrongsGreekDictionaryXML_1.4/strongsgreek.xml, public domain).

Robinson's Westcott-Hort and Scrivener files are lowercase Greek without
accents, breathings or punctuation; this script transliterates them to Greek
letters as they are and adds nothing, so those two editions read unaccented.

Usage (the first directory is the edition's own repo, then its helpers):
    nt.py nestle-1904   <Nestle1904>
    nt.py sblgnt        <LogosBible SBLGNT> <morphgnt sblgnt> <Nestle1904>
    nt.py tischendorf   <tischendorf-data>
    nt.py westcott-hort <greektext-westcott-hort> <strongs>
    nt.py byzantine     <byzantine-majority-text> <strongs>
    nt.py scrivener     <greektext-scrivener> <greektext-textus-receptus> <strongs>
Run with `python3 -I` when the source dirs are fresh downloads.
"""
from __future__ import annotations

import csv
import difflib
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BIBLE = ROOT / "content" / "bible"

# (Douay slug, Douay name, OSIS-ish id used by Nestle/SBLGNT, Online Bible id
# used by byztxt and Tischendorf, byztxt CSV id).
BOOKS = [
    ("matthew", "Matthew", "Matt", "MT", "MAT"), ("mark", "Mark", "Mark", "MR", "MAR"),
    ("luke", "Luke", "Luke", "LU", "LUK"), ("john", "John", "John", "JOH", "JOH"),
    ("acts", "Acts", "Acts", "AC", "ACT"), ("romans", "Romans", "Rom", "RO", "ROM"),
    ("1-corinthians", "1 Corinthians", "1Cor", "1CO", "1CO"),
    ("2-corinthians", "2 Corinthians", "2Cor", "2CO", "2CO"),
    ("galatians", "Galatians", "Gal", "GA", "GAL"), ("ephesians", "Ephesians", "Eph", "EPH", "EPH"),
    ("philippians", "Philippians", "Phil", "PHP", "PHP"),
    ("colossians", "Colossians", "Col", "COL", "COL"),
    ("1-thessalonians", "1 Thessalonians", "1Thess", "1TH", "1TH"),
    ("2-thessalonians", "2 Thessalonians", "2Thess", "2TH", "2TH"),
    ("1-timothy", "1 Timothy", "1Tim", "1TI", "1TI"), ("2-timothy", "2 Timothy", "2Tim", "2TI", "2TI"),
    ("titus", "Titus", "Titus", "TIT", "TIT"), ("philemon", "Philemon", "Phlm", "PHM", "PHM"),
    ("hebrews", "Hebrews", "Heb", "HEB", "HEB"), ("james", "James", "Jas", "JAS", "JAM"),
    ("1-peter", "1 Peter", "1Pet", "1PE", "1PE"), ("2-peter", "2 Peter", "2Pet", "2PE", "2PE"),
    ("1-john", "1 John", "1John", "1JO", "1JO"), ("2-john", "2 John", "2John", "2JO", "2JO"),
    ("3-john", "3 John", "3John", "3JO", "3JO"), ("jude", "Jude", "Jude", "JUDE", "JUD"),
    ("apocalypse", "Apocalypse", "Rev", "RE", "REV"),
]

# A verse is a list of tokens (text, lemma, morph); the text of the verse is
# the tokens joined by spaces, which is what keeps words/ aligned with it.
Token = tuple[str, str, str]
Bible = dict[str, dict[int, dict[int, list[Token]]]]


def nfc(text: str) -> str:
    return unicodedata.normalize("NFC", text)


def clean_lemma(lemma: str) -> str:
    # Nestle and Tischendorf number homonyms ("δοῦλος (II)"); the number is a
    # lexicon's bookkeeping, not part of the dictionary form.
    return re.sub(r"\s*\([IV]+\)$", "", nfc(lemma.strip()))


def letters(word: str) -> str:
    """The word's letters and diacritics, for matching one source to another."""
    return "".join(c for c in nfc(word) if unicodedata.category(c)[0] in "LM")


def bare(word: str) -> str:
    """Lowercase letters with no diacritics: the shape of an unaccented source."""
    decomposed = unicodedata.normalize("NFD", word.lower())
    return "".join(c for c in decomposed if unicodedata.category(c)[0] == "L").replace("ς", "σ")


def form_key(word: str) -> str:
    # Grave and acute are the same accent in different positions, so a form
    # seen elsewhere with either matches.
    return nfc(unicodedata.normalize("NFD", letters(word).lower()).replace("\u0300", "\u0301"))


def merge_bare_punctuation(tokens: list[Token]) -> list[Token]:
    """Fold a token with no letters ("—", "(") into its neighbour.

    A reader sees one word with its punctuation; words/ needs one entry per
    whitespace token, and a dash has no lemma.
    """
    out: list[Token] = []
    pending = ""
    for text, lemma, morph in tokens:
        if not letters(text):
            if out:
                last = out[-1]
                out[-1] = (last[0] + text, last[1], last[2])
            else:
                pending += text
            continue
        out.append((pending + text, lemma, morph))
        pending = ""
    return out


def put(bible: Bible, slug: str, chapter: int, verse: int, tokens: list[Token]) -> None:
    bible.setdefault(slug, {}).setdefault(chapter, {}).setdefault(verse, []).extend(tokens)


# --- Strong's ---------------------------------------------------------------


def strongs_lemmas(strongs_dir: Path) -> dict[int, str]:
    xml = (strongs_dir / "greek" / "StrongsGreekDictionaryXML_1.4" / "strongsgreek.xml").read_text(
        encoding="utf-8"
    )
    lemmas = {}
    for number, body in re.findall(r'<entry strongs="(\d+)">(.*?)</entry>', xml, re.S):
        found = re.search(r'<greek [^>]*unicode="([^"]*)"', body)
        if found:
            lemmas[int(number)] = nfc(found.group(1))
    return lemmas


def strongs_lemma(numbers: list[int], morph: str, lemmas: dict[int, str], tvm: bool) -> str:
    # Robinson's files put a "tense-voice-mood" number after a verb's Strong's
    # number; 0 opens a compound written as several Strong's entries.
    if tvm and morph.startswith("V-") and len(numbers) > 1:
        numbers = numbers[:-1]
    return " ".join(lemmas.get(n, "") for n in numbers if n).strip()


# --- Nestle 1904 ------------------------------------------------------------


def read_nestle_rows(nestle_dir: Path) -> list[list[str]]:
    with (nestle_dir / "morph" / "Nestle1904.csv").open(encoding="utf-8-sig") as f:
        return [line.rstrip("\n").split("\t") for line in f][1:]


def nestle(dirs: list[Path]) -> Bible:
    osis = {b[2]: b[0] for b in BOOKS}
    bible: Bible = {}
    for ref, text, morph, _form, _strongs, lemma, *_ in read_nestle_rows(dirs[0]):
        book, cv = ref.split(" ")
        chapter, verse = map(int, cv.split(":"))
        # The shorter ending of Mark is filed as "16:99", a number Nestle never
        # printed and no other Bible shares; it is left out.
        if (book, chapter, verse) == ("Mark", 16, 99):
            continue
        put(bible, osis[book], chapter, verse, [(nfc(text), clean_lemma(lemma), morph)])
    return bible


# --- MorphGNT → Robinson ----------------------------------------------------
#
# MorphGNT (CCAT) gives a part of speech and an 8-place parse
# (person, tense, voice, mood, case, number, gender, degree). It carries less
# than Robinson's scheme: one "C-" for conjunction, conditional and many
# particles, "D-" for adverbs and negatives, "RP" for personal, reflexive and
# reciprocal pronouns, no indeclinable classes (N-PRI, A-NUI, HEB, ARAM), no
# deponent voices or second aorists. So each word's Robinson tag is looked up
# in the Nestle 1904 (CC0, Robinson-tagged, same lemma conventions) by lemma
# and by the grammar both schemes share:
#   verbs       tense (X→R perfect, Y→L pluperfect), voice (active vs not),
#               mood (D→M imperative), then person+number or case+number+gender
#   nominals    case + number, preferring a tag of the same gender and class
#   the rest    the lemma alone (καί → CONJ, εἰ → COND, οὐ → PRT-N, ἀμήν → HEB)
# and only when Nestle never has the lemma in that shape is the tag built
# structurally: N-/A- case number gender (+ -C/-S degree), RA → T-, RD → D-,
# RR → R-, RI → I- (τίς) or X- (τις), RP → P-[person]case number[gender],
# V- tense voice mood [-person number | -case number gender], C- → CONJ,
# D- → ADV, P- → PREP, X- → PRT, I- → INJ.

TENSES = {"P": "P", "I": "I", "F": "F", "A": "A", "X": "R", "Y": "L"}
MOODS = {"I": "I", "D": "M", "S": "S", "O": "O", "N": "N", "P": "P"}
CLASS_OF = {"N-": "N", "A-": "ASKQ", "RA": "T", "RD": "D", "RI": "IXQK", "RP": "PFC", "RR": "RK"}
INDECLINABLE = {"C-": "CONJ", "D-": "ADV", "P-": "PREP", "X-": "PRT", "I-": "INJ"}


def robinson_key(tag: str) -> tuple:
    """The part of a Robinson tag MorphGNT can also express."""
    verb = re.fullmatch(r"V-2?([PIFARLX])([A-Z])([ISOMNPR])(?:-([0-9A-Z]+))?(?:-.*)?", tag)
    if verb:
        tense, voice, mood, rest = verb.groups()
        return ("V", tense, "A" if voice in "AQ" else "MP", "P" if mood == "R" else mood, rest or "")
    possessive = re.fullmatch(r"S-[123][SP]([NVGDA])([SP])[MFN]?(?:-.*)?", tag)
    if possessive:
        return ("NOM", *possessive.groups())
    nominal = re.fullmatch(r"[NATRCDKIXQFP]-[123]?([NVGDA])([SP])[MFN]?(?:-.*)?", tag)
    if nominal:
        return ("NOM", *nominal.groups())
    return ("IND",)


def tag_gender(tag: str) -> str:
    found = re.fullmatch(r"[A-Z]-(?:[123][SP])?[123]?[NVGDA][SP]([MFN])(?:-.*)?", tag)
    return found.group(1) if found else ""


def morphgnt_key(pos: str, parse: str) -> tuple:
    person, tense, voice, mood, case, number, gender, _degree = parse
    if pos == "V-":
        rest = person + number if mood in "IDSO" else case + number + gender if mood == "P" else ""
        return ("V", TENSES.get(tense, tense), "A" if voice == "A" else "MP", MOODS.get(mood, mood), rest)
    if pos in CLASS_OF and case != "-":
        return ("NOM", case, number)
    return ("IND",)


def tag_index(rows: list[list[str]]) -> dict[tuple, Counter]:
    index: dict[tuple, Counter] = defaultdict(Counter)
    for _ref, _text, morph, _form, _strongs, lemma, *_ in rows:
        index[(clean_lemma(lemma), robinson_key(morph))][morph] += 1
    return index


def structural_tag(pos: str, parse: str, lemma: str) -> str:
    person, tense, voice, mood, case, number, gender, degree = parse
    cng = (case + number + gender).replace("-", "")
    suffix = {"C": "-C", "S": "-S"}.get(degree, "")
    if pos == "V-":
        head = f"V-{TENSES.get(tense, tense)}{voice}{MOODS.get(mood, mood)}"
        rest = (person + number) if mood in "IDSO" else cng if mood == "P" else ""
        return f"{head}-{rest}" if rest else head
    if pos in INDECLINABLE:
        return INDECLINABLE[pos]
    if pos == "N-" and case == "-":
        return "N-PRI"
    if pos == "RP":
        # Robinson gives gender only to the third person (αὐτός).
        person = person.replace("-", "")
        gender = "" if person in ("1", "2") else gender.replace("-", "")
        return f"P-{person}{case}{number}{gender}"
    prefix = {"N-": "N", "A-": "A", "RA": "T", "RD": "D", "RR": "R"}.get(pos)
    if pos == "RI":
        prefix = "I" if lemma == "τίς" else "X"
    return f"{prefix}-{cng}{suffix}" if prefix else ""


def morphgnt_to_robinson(pos: str, parse: str, lemma: str, index: dict[tuple, Counter]) -> str:
    key = morphgnt_key(pos, parse)
    candidates = index.get((lemma, key)) or (index.get((lemma, ("IND",))) if key[0] == "NOM" else None)
    if not candidates:
        return structural_tag(pos, parse, lemma)
    classes = CLASS_OF.get(pos, "")
    gender = parse[6]

    def rank(item: tuple[str, int]) -> tuple:
        tag, count = item
        return (tag[0] in classes and tag[1] == "-", tag_gender(tag) == gender, count)

    return max(candidates.items(), key=rank)[0]


# --- SBLGNT -----------------------------------------------------------------

# The SBLGNT's critical signs point into its apparatus, which is not shipped;
# a second sign in one verse carries a number ("⸀1").
SBL_SIGLA = re.compile(r"[⸀⸁⸂⸃⸄⸅]\d*")


def align(tokens: list[str], keys: list[str], analyses: list[tuple[str, str]]) -> list:
    """Pair each token with the analysis whose word it is, by matching keys.

    Runs of equal length that differ (a spelling) pair up in order; anything
    else is left None for the caller to fill.
    """
    out: list = [None] * len(tokens)
    matcher = difflib.SequenceMatcher(a=keys, b=[a[0] for a in analyses], autojunk=False)
    for op, a0, a1, b0, b1 in matcher.get_opcodes():
        if op == "equal" or (op == "replace" and a1 - a0 == b1 - b0):
            for i, j in zip(range(a0, a1), range(b0, b1)):
                out[i] = analyses[j][1]
    return out


def lexicon(entries: list[tuple[str, tuple[str, str]]]) -> dict[str, tuple[str, str]]:
    """Most frequent analysis of each written form, for words a source lacks."""
    seen: dict[str, Counter] = defaultdict(Counter)
    for form, analysis in entries:
        seen[form][analysis] += 1
    return {form: c.most_common(1)[0][0] for form, c in seen.items()}


def fill(tokens: list[str], analyses: list, forms: dict[str, tuple[str, str]], unmatched: Counter) -> list[Token]:
    out = []
    for token, analysis in zip(tokens, analyses):
        if analysis is None:
            analysis = forms.get(form_key(token), ("", ""))
            unmatched["filled" if analysis[0] else "unknown"] += 1
        out.append((token, *analysis))
    return out


def sblgnt(dirs: list[Path]) -> Bible:
    text_dir, morph_dir, nestle_dir = dirs
    nestle_rows = read_nestle_rows(nestle_dir)
    index = tag_index(nestle_rows)
    analyses: dict[tuple, list] = defaultdict(list)
    entries = []
    for number, path in enumerate(sorted(morph_dir.glob("*-morphgnt.txt"))):
        slug = BOOKS[number][0]
        for line in path.read_text(encoding="utf-8").splitlines():
            bcv, pos, parse, _text, word, _normal, lemma = line.split(" ")
            lemma = nfc(lemma)
            analysis = (clean_lemma(lemma), morphgnt_to_robinson(pos, parse, lemma, index))
            analyses[(slug, int(bcv[2:4]), int(bcv[4:6]))].append((letters(word), analysis))
            entries.append((form_key(word), analysis))
    # MorphGNT predates the SBLGNT's Pericope Adulterae (added in v1.2); its
    # words, and any form MorphGNT never has, take the Nestle 1904's analysis.
    nestle_forms = lexicon([(form_key(r[1]), (clean_lemma(r[5]), r[2])) for r in nestle_rows])
    forms = {**nestle_forms, **lexicon(entries)}
    osis = {b[2]: b[0] for b in BOOKS}
    bible: Bible = {}
    unmatched: Counter = Counter()
    for path in sorted((text_dir / "data" / "sblgnt" / "text").glob("*.txt")):
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            ref, tab, text = line.partition("\t")
            if not tab:
                continue  # the book's Greek title
            book, cv = ref.split(" ")
            chapter, verse = map(int, cv.split(":"))
            slug = osis[book]
            tokens = nfc(SBL_SIGLA.sub("", text)).split()
            matched = align(tokens, [letters(t) for t in tokens], analyses[(slug, chapter, verse)])
            put(bible, slug, chapter, verse, fill(tokens, matched, forms, unmatched))
    print(f"sblgnt: words without MorphGNT analysis: {dict(unmatched)}")
    return bible


# --- Tischendorf ------------------------------------------------------------


def tischendorf(dirs: list[Path]) -> Bible:
    olb = {b[3]: b[0] for b in BOOKS}
    bible: Bible = {}
    for path in (dirs[0] / "word-per-line" / "2.8" / "Unicode").glob("*.txt"):
        for line in path.read_text(encoding="utf-8").splitlines():
            head, _, lemma = line.partition(" ! ")
            book, ref, _break, _kethiv, qere, morph, *_ = head.split(" ")
            where, _, word = ref.partition(".")
            chapter, verse = map(int, where.split(":"))
            # The Pericope Adulterae comes twice: first an unaccented text
            # with Codex Bezae's readings (ἐπορεύθησαν, ἐπὶ ἁμαρτίᾳ), then
            # Tischendorf's own, numbered again from word 1.
            # A reader wants the edition's text once, so the second replaces.
            if word == "1":
                bible.get(olb[book], {}).get(chapter, {}).pop(verse, None)
            # The Qere is the printed text with the editor's corrections of
            # Tischendorf's misprints (eleven missing accents); the parsing
            # describes it.
            put(bible, olb[book], chapter, verse, [(nfc(qere), clean_lemma(lemma), morph)])
    return bible


# --- byztxt (Robinson) ------------------------------------------------------

BETA = dict(zip("abgdezhqiklmncoprsvtufxyw", "αβγδεζηθικλμνχοπρσςτυφξψω"))
# Scrivener's files use y for theta and q for psi, the reverse of the parsed files.
BETA_SCRIVENER = {**BETA, "y": "θ", "q": "ψ"}


def from_beta(word: str, table: dict[str, str]) -> str:
    return "".join(table.get(c, c) for c in word)


def robinson_words(text: str) -> dict[tuple[int, int], list[tuple[str, list[int], str]]]:
    """Parse Robinson's "word strongs [tvm] {MORPH}" stream into verses.

    `| a | b |` is a variant unit: a is this edition's reading, b the
    Nestle-Aland's (or another TR's), so b is dropped. "(2:7)" marks where
    another versification starts a verse.
    """
    verses: dict[tuple[int, int], list] = {}
    current = None
    state = 0  # 0 outside a variant unit, 1 in this edition's reading, 2 in the other
    for token in text.split():
        if token == "|":
            state = (state + 1) % 3
            continue
        ref = re.fullmatch(r"(\d+):(\d+)", token)
        if ref:
            assert state != 2, f"verse {token} inside a variant reading"
            current = verses.setdefault((int(ref[1]), int(ref[2])), [])
            continue
        if state == 2 or re.fullmatch(r"\(\d+:\d+\)", token):
            continue
        if token.isdigit():
            current[-1][1].append(int(token))
        elif token.startswith("{"):
            current[-1][2] = token.strip("{}")
        else:
            current.append([token, [], ""])
    return {k: [tuple(w) for w in v] for k, v in verses.items()}


def westcott_hort(dirs: list[Path]) -> Bible:
    source, strongs_dir = dirs
    lemmas = strongs_lemmas(strongs_dir)
    bible: Bible = {}
    for slug, _name, _osis, olb, _csv in BOOKS:
        text = (source / "parsed" / f"{olb}.UWH").read_text(encoding="latin-1")
        for (chapter, verse), words in robinson_words(text).items():
            assert all("<" not in w for w, _, _ in words), (slug, chapter, verse)
            tokens = [(from_beta(w, BETA), strongs_lemma(n, m, lemmas, True), m) for w, n, m in words]
            put(bible, slug, chapter, verse, tokens)
    return bible


def byzantine(dirs: list[Path]) -> Bible:
    source, strongs_dir = dirs
    lemmas = strongs_lemmas(strongs_dir)
    bible: Bible = {}

    def rows(path: Path) -> list[list[str]]:
        with path.open(encoding="utf-8") as f:
            return list(csv.reader(f))[1:]

    for slug, _name, _osis, _olb, code in BOOKS:
        parsed = {
            (int(c), int(v)): robinson_words(f"{c}:{v} {t}")[(int(c), int(v))]
            for c, v, t in rows(source / "csv-unicode" / "strongs" / "with-parsing" / f"{code}.csv")
        }
        for c, v, text in rows(source / "csv-unicode" / "ccat" / "no-variants" / f"{code}.csv"):
            # ¶ is Robinson's paragraph mark. A verse with no text is one the
            # Byzantine text omits but keeps the number of (Acts 24:7).
            tokens = nfc(text.replace("¶", "")).split()
            if not tokens:
                continue
            words = parsed[(int(c), int(v))]
            assert [bare(t) for t in tokens] == [bare(w) for w, _, _ in words], (slug, c, v)
            put(bible, slug, int(c), int(v), [
                (t, strongs_lemma(n, m, lemmas, False), m) for t, (_, n, m) in zip(tokens, words)
            ])
    return bible


def scrivener(dirs: list[Path]) -> Bible:
    source, tr_dir, strongs_dir = dirs
    lemmas = strongs_lemmas(strongs_dir)
    bible: Bible = {}
    unmatched: Counter = Counter()
    for slug, _name, _osis, olb, _csv in BOOKS:
        text = (source / "textonly" / f"{olb}.SCV").read_text(encoding="latin-1")
        text = re.sub(r"\[[^\]]*\]", " ", text)  # the book's title
        verses: dict[tuple[int, int], list[str]] = {}
        for token in text.split():
            ref = re.fullmatch(r"(\d+):(\d+)", token)
            if ref:
                current = verses.setdefault((int(ref[1]), int(ref[2])), [])
            else:
                current.append(from_beta(token, BETA_SCRIVENER))
        # Robinson's parsed TR is not Scrivener word for word, so its analyses
        # are matched to Scrivener's words; the rest come from the same form
        # elsewhere in it, and are left "" when the form never occurs.
        tr_text = (tr_dir / "parsed" / f"{olb}.UTR").read_text(encoding="latin-1")
        tr = {
            k: [(from_beta(w, BETA).strip("[]"), (strongs_lemma(n, m, lemmas, True), m)) for w, n, m in ws]
            for k, ws in robinson_words(tr_text).items()
        }
        forms = lexicon([(form_key(w), a) for ws in tr.values() for w, a in ws])
        for (chapter, verse), tokens in verses.items():
            matched = align(tokens, tokens, tr.get((chapter, verse), []))
            put(bible, slug, chapter, verse, fill(tokens, matched, forms, unmatched))
    print(f"scrivener: words not in the parsed TR at that place: {dict(unmatched)}")
    return bible


EDITIONS = {
    "nestle-1904": nestle,
    "sblgnt": sblgnt,
    "tischendorf": tischendorf,
    "westcott-hort": westcott_hort,
    "byzantine": byzantine,
    "scrivener": scrivener,
}

# --- Versification ----------------------------------------------------------
#
# Found by aligning every book's verses with the Clementine Vulgate's by length
# (Gale-Church), and by checking proper names verse against verse, then read
# in Greek and Latin. Each rule moves this edition's verses first..last of a
# chapter to (chapter, verse + offset) in the Vulgate. Where a Greek verse
# spans two Latin ones, its own number is kept when it is one of them (Luke
# 17:37, John 6:51, 2 Tim 4:10). Verses the Vulgate has and the Greek lacks
# (Matthew 18:11, Acts 8:37) need no entry: nothing points at them.
# (slug, chapter, first, last, to chapter, offset, editions it applies to)
ALL = None
RULES = [
    # Greek 17:14-15 is Vulgate 17:14 ("dicens: Domine, miserere").
    ("matthew", 17, 15, 27, 17, -1, ALL),
    # The Byzantine text has the woe on widows' houses first (Vulgate 23:14).
    ("matthew", 23, 13, 13, 23, 1, {"byzantine"}),
    ("matthew", 23, 14, 14, 23, -1, {"byzantine"}),
    # Greek 4:40-41 is Vulgate 4:40 ("et timuerunt timore magno").
    ("mark", 4, 41, 41, 4, -1, ALL),
    # The Vulgate ends Mark 8 with "Amen dico vobis, quia sunt quidam".
    ("mark", 9, 1, 1, 8, 38, ALL),
    ("mark", 9, 2, 50, 9, -1, ALL),
    # Greek 9:42 runs on to the healing (Vulgate 9:43); "Ἐξεπλήσσοντο" is 9:44.
    ("luke", 9, 43, 43, 9, 1, ALL),
    # Tischendorf splits 1:38 at "τί ζητεῖτε;", so his 1:39-52 are 1:38-51.
    ("john", 1, 39, 52, 1, -1, {"tischendorf"}),
    # The Vulgate splits 6:51 at "Si quis manducaverit".
    ("john", 6, 52, 71, 6, 1, ALL),
    # Vulgate 11:56 runs on to "Dederant autem pontifices".
    ("john", 11, 57, 57, 11, -1, ALL),
    # Greek 7:55-56 is Vulgate 7:55 ("et ait: Ecce video cælos apertos").
    ("acts", 7, 56, 60, 7, -1, ALL),
    # The Vulgate (and the TR) have "Et tremens ac stupens" as 9:6; texts
    # without it start 9:6 at "ἀλλὰ ἀνάστηθι", which is Vulgate 9:7.
    ("acts", 9, 6, 6, 9, 1, {"nestle-1904", "sblgnt", "tischendorf", "westcott-hort", "byzantine"}),
    # Greek 14:6-7 is Vulgate 14:6 ("et ibi evangelizantes erant").
    ("acts", 14, 7, 28, 14, -1, ALL),
    # Vulgate 19:40 ends with "Et cum hæc dixisset, dimisit concionem".
    ("acts", 19, 41, 41, 19, -1, ALL),
    # Vulgate 23:25 is its own parenthesis ("Timuit enim"); "γράψας
    # ἐπιστολὴν" is Vulgate 23:26 ("Scribens epistolam").
    ("acts", 23, 25, 25, 23, 1, ALL),
    # The Byzantine text closes Romans 14 with the doxology, Vulgate 16:25-27.
    ("romans", 14, 24, 26, 16, 1, {"byzantine"}),
    # Vulgate 1:23 runs on to "non quia dominamur fidei vestræ".
    ("2-corinthians", 1, 24, 24, 1, -1, ALL),
    # The Vulgate has "Salutant vos omnes sancti" in 13:12, as Nestle does.
    ("2-corinthians", 13, 13, 14, 13, -1, {"westcott-hort", "byzantine", "scrivener"}),
    # Vulgate 4:8 ends with "Festina ad me venire cito".
    ("2-timothy", 4, 9, 9, 4, -1, ALL),
    # Vulgate 1:14 ends with "Pax tibi. Salutant te amici".
    ("3-john", 1, 15, 15, 1, -1, ALL),
    # Vulgate 20:7 runs on to "Gog, et Magog, et congregabit eos in prælium".
    ("apocalypse", 20, 8, 8, 20, -1, ALL),
]


def versification(name: str, bible: Bible) -> dict[str, dict[str, str | None]]:
    exceptions: dict[str, dict[str, str | None]] = {}
    for slug, *_ in BOOKS:
        vulgate = vulgate_verses(slug)
        for chapter, verses in bible[slug].items():
            for verse in verses:
                if not verses[verse]:
                    continue
                target = (chapter, verse)
                for book, ch, first, last, to, offset, editions in RULES:
                    if (book, ch) == (slug, chapter) and first <= verse <= last and (editions is ALL or name in editions):
                        target = (to, verse + offset)
                address = f"{target[0]}:{target[1]}" if target[1] in vulgate.get(target[0], ()) else None
                if address != f"{chapter}:{verse}":
                    exceptions.setdefault(slug, {})[f"{chapter}:{verse}"] = address
    return exceptions


def vulgate_verses(slug: str) -> dict[int, set[int]]:
    data = json.loads((BIBLE / "vulgate" / f"{slug}.json").read_text(encoding="utf-8"))
    return {int(c): {int(v) for v in vs} for c, vs in data.items()}


def write(name: str, bible: Bible, exceptions: dict[str, dict[str, str | None]]) -> None:
    out = BIBLE / f"greek-{name}"
    (out / "words").mkdir(parents=True, exist_ok=True)
    index = []
    for slug, book_name, *_ in BOOKS:
        chapters = bible[slug]
        text, words = {}, {}
        for chapter in sorted(chapters):
            text[str(chapter)], words[str(chapter)] = {}, {}
            for verse in sorted(chapters[chapter]):
                tokens = merge_bare_punctuation(chapters[chapter][verse])
                # Robinson's files keep the number of a verse the edition omits
                # (Westcott-Hort's Matthew 18:11); a reader has nothing to show.
                if not tokens:
                    continue
                verse_text = " ".join(t for t, _, _ in tokens)
                assert len(verse_text.split()) == len(tokens), (slug, chapter, verse)
                assert verse_text == nfc(verse_text), (slug, chapter, verse)
                text[str(chapter)][str(verse)] = verse_text
                words[str(chapter)][str(verse)] = [[lemma, morph] for _, lemma, morph in tokens]
        (out / f"{slug}.json").write_text(
            json.dumps(text, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
        )
        (out / "words" / f"{slug}.json").write_text(
            json.dumps(words, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
        )
        index.append({"slug": slug, "name": book_name, "testament": "nt", "chapters": len(chapters)})
    (out / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8")
    versification = out / "versification.json"
    if exceptions:
        versification.write_text(json.dumps(exceptions, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8")
    elif versification.exists():
        versification.unlink()


def main() -> None:
    if len(sys.argv) < 3 or sys.argv[1] not in EDITIONS:
        sys.exit(__doc__)
    name = sys.argv[1]
    bible = EDITIONS[name]([Path(p) for p in sys.argv[2:]])
    for slug, *_ in BOOKS:
        if slug not in bible:
            sys.exit(f"{name}: {slug} missing")
    write(name, bible, versification(name, bible))


if __name__ == "__main__":
    main()
