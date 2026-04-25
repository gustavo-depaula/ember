#!/usr/bin/env python3
"""Import the 1912 short Catechism of St. Pius X into content/libraries/base/books/catechism-pius-x-1912/.

Sources:
  - Italian (it):    sources/italian-originals/archive-org-1959-djvu.txt  (Vatican 1959 reprint, OCR)
  - Brazilian PT:    sources/pt-br-originals/symposium-veritatis-raw.html (Symposium Veritatis blog)

Both sources are public-domain transcriptions of the 1912 text, which has 433 numbered Q&A entries
plus a preliminary lesson ("Prime nozioni della Fede cristiana"). The Q-numbering is contiguous 1..433
and aligns across languages.

Output: 21 markdown chapter files per language, organized by the canonical 1912 structure
(3 parts: Faith / Law / Grace). Each file has a level-1 heading and Q&A pairs in
**N.** Question / *Answer* form.

Re-runnable: deletes and recreates the per-language chapter dirs.
"""

from __future__ import annotations

import html
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB_DIR = ROOT / "content" / "libraries" / "base"
SOURCES_IT = LIB_DIR / "sources" / "italian-originals" / "corsia-2004.txt"
SOURCES_PT = LIB_DIR / "sources" / "pt-br-originals" / "symposium-veritatis-raw.html"
BOOK_DIR = LIB_DIR / "books" / "catechism-pius-x-1912"


# ---------------------------------------------------------------------------
# Chapter map: (chapter_id, q_start, q_end_inclusive, titles per language)
# ---------------------------------------------------------------------------

CHAPTERS: list[tuple[str, int, int, dict[str, str]]] = [
    ("lezione-preliminare", 1, 27, {
        "it": "Prime nozioni della Fede cristiana",
        "pt-BR": "Primeiras Noções da Fé Cristã",
        "en-US": "First Notions of the Christian Faith",
    }),
    # Parte I — La Fede (the Creed)
    ("credo-misteri-principali", 28, 36, {
        "it": "Parte I, Capo I — Misteri principali. Segno della santa Croce",
        "pt-BR": "Parte I, Capítulo I — Mistérios Principais. Sinal da Santa Cruz",
        "en-US": "Part I, Chapter I — Principal Mysteries. Sign of the Holy Cross",
    }),
    ("credo-unita-trinita", 37, 50, {
        "it": "Parte I, Capo II — Unità e Trinità di Dio",
        "pt-BR": "Parte I, Capítulo II — Unidade e Trindade de Deus",
        "en-US": "Part I, Chapter II — Unity and Trinity of God",
    }),
    ("credo-creazione", 51, 77, {
        "it": "Parte I, Capo III — Creazione del mondo. Origine e caduta dell'uomo",
        "pt-BR": "Parte I, Capítulo III — Criação do Mundo. Origem e Queda do Homem",
        "en-US": "Part I, Chapter III — Creation of the World. Origin and Fall of Man",
    }),
    ("credo-incarnazione", 78, 91, {
        "it": "Parte I, Capo IV — Incarnazione, Passione e Morte del Figliuolo di Dio",
        "pt-BR": "Parte I, Capítulo IV — Encarnação, Paixão e Morte do Filho de Deus",
        "en-US": "Part I, Chapter IV — Incarnation, Passion, and Death of the Son of God",
    }),
    ("credo-venuta", 92, 104, {
        "it": "Parte I, Capo V — Venuta di Gesù Cristo alla fine del mondo. I due giudizi",
        "pt-BR": "Parte I, Capítulo V — Vinda de Jesus Cristo no Fim do Mundo. Os Dois Juízos",
        "en-US": "Part I, Chapter V — Coming of Jesus Christ at the End of the World. The Two Judgments",
    }),
    ("credo-chiesa", 105, 127, {
        "it": "Parte I, Capo VI — Chiesa cattolica. Comunione dei santi",
        "pt-BR": "Parte I, Capítulo VI — Igreja Católica. Comunhão dos Santos",
        "en-US": "Part I, Chapter VI — Catholic Church. Communion of Saints",
    }),
    ("credo-remissione-peccati", 128, 155, {
        "it": "Parte I, Capo VII — Remissione dei peccati. Peccato",
        "pt-BR": "Parte I, Capítulo VII — Remissão dos Pecados. Pecado",
        "en-US": "Part I, Chapter VII — Forgiveness of Sins. Sin",
    }),
    ("credo-risurrezione", 156, 160, {
        "it": "Parte I, Capo VIII — Risurrezione della carne. Vita eterna. Amen",
        "pt-BR": "Parte I, Capítulo VIII — Ressurreição da Carne. Vida Eterna. Amém",
        "en-US": "Part I, Chapter VIII — Resurrection of the Body. Life Everlasting. Amen",
    }),
    # Parte II — La Legge
    ("legge-comandamenti", 161, 212, {
        "it": "Parte II, Capo I — Comandamenti di Dio",
        "pt-BR": "Parte II, Capítulo I — Mandamentos de Deus",
        "en-US": "Part II, Chapter I — Commandments of God",
    }),
    ("legge-precetti", 213, 226, {
        "it": "Parte II, Capo II — Precetti generali della Chiesa",
        "pt-BR": "Parte II, Capítulo II — Preceitos Gerais da Igreja",
        "en-US": "Part II, Chapter II — General Precepts of the Church",
    }),
    ("legge-virtu", 227, 266, {
        "it": "Parte II, Capo III — Virtù",
        "pt-BR": "Parte II, Capítulo III — Virtudes",
        "en-US": "Part II, Chapter III — Virtues",
    }),
    # Parte III — La Grazia, Sezione I — Sacramenti
    ("sacramenti-in-generale", 267, 289, {
        "it": "Parte III, Sezione I, Capo I — Sacramenti in generale",
        "pt-BR": "Parte III, Seção I, Capítulo I — Sacramentos em Geral",
        "en-US": "Part III, Section I, Chapter I — Sacraments in General",
    }),
    ("sacramento-battesimo", 290, 303, {
        "it": "Parte III, Sezione I, Capo II — Battesimo",
        "pt-BR": "Parte III, Seção I, Capítulo II — Batismo",
        "en-US": "Part III, Section I, Chapter II — Baptism",
    }),
    ("sacramento-cresima", 304, 315, {
        "it": "Parte III, Sezione I, Capo III — Cresima o Confermazione",
        "pt-BR": "Parte III, Seção I, Capítulo III — Crisma ou Confirmação",
        "en-US": "Part III, Section I, Chapter III — Confirmation",
    }),
    ("sacramento-eucaristia", 316, 354, {
        "it": "Parte III, Sezione I, Capo IV — Eucaristia",
        "pt-BR": "Parte III, Seção I, Capítulo IV — Eucaristia",
        "en-US": "Part III, Section I, Chapter IV — Eucharist",
    }),
    ("sacramento-penitenza", 355, 391, {
        "it": "Parte III, Sezione I, Capo V — Penitenza",
        "pt-BR": "Parte III, Seção I, Capítulo V — Penitência",
        "en-US": "Part III, Section I, Chapter V — Penance",
    }),
    ("sacramento-estrema-unzione", 392, 396, {
        "it": "Parte III, Sezione I, Capo VI — Estrema Unzione",
        "pt-BR": "Parte III, Seção I, Capítulo VI — Extrema-Unção",
        "en-US": "Part III, Section I, Chapter VI — Extreme Unction",
    }),
    ("sacramento-ordine", 397, 405, {
        "it": "Parte III, Sezione I, Capo VII — Ordine",
        "pt-BR": "Parte III, Seção I, Capítulo VII — Ordem",
        "en-US": "Part III, Section I, Chapter VII — Holy Orders",
    }),
    ("sacramento-matrimonio", 406, 413, {
        "it": "Parte III, Sezione I, Capo VIII — Matrimonio",
        "pt-BR": "Parte III, Seção I, Capítulo VIII — Matrimônio",
        "en-US": "Part III, Section I, Chapter VIII — Matrimony",
    }),
    # Parte III, Sezione II — Orazione
    ("orazione", 414, 433, {
        "it": "Parte III, Sezione II — Orazione",
        "pt-BR": "Parte III, Seção II — Oração",
        "en-US": "Part III, Section II — Prayer",
    }),
]


def chapter_for(q: int) -> tuple[str, dict[str, str]]:
    for cid, lo, hi, titles in CHAPTERS:
        if lo <= q <= hi:
            return cid, titles
    raise KeyError(f"no chapter for Q{q}")


# ---------------------------------------------------------------------------
# Portuguese parser — Symposium Veritatis HTML
# ---------------------------------------------------------------------------


def parse_pt() -> dict[int, tuple[str, str]]:
    """Returns {q: (question, answer)}. The HTML uses <b>N. Question?</b> followed by italic answer paragraphs."""
    raw = SOURCES_PT.read_text(encoding="utf-8")
    # Anchor from "Exposição das perguntas e respostas" intro line to before the Comments section
    start = raw.find("Exposição das perguntas e respostas")
    if start < 0:
        raise RuntimeError("intro anchor not found in pt-br source")
    # End: right before "Comentários" / comments section, or before postagens-mais-visitadas
    end_candidates = [raw.find(s, start) for s in ("Postar um comentário", "Postagens mais visitadas", "Comentários</")]
    end_candidates = [e for e in end_candidates if e > 0]
    end = min(end_candidates) if end_candidates else len(raw)
    body = raw[start:end]

    # Strip all tags, preserving paragraph breaks where </div> or <br> appear
    text = re.sub(r"<br\s*/?>", "\n", body)
    text = re.sub(r"</(div|p|li)>", "\n", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    # Normalize whitespace: drop empty lines, strip lines
    lines = [l.strip() for l in text.split("\n")]

    # Walk: a Q starts when a line matches "^N. ..." with a top-level Q number; everything until the next
    # top-level Q is part of the previous Q's answer (including nested numbered list items).
    qa: dict[int, tuple[str, str]] = {}
    cur_q: int | None = None
    cur_question = ""
    cur_answer_lines: list[str] = []

    def flush() -> None:
        if cur_q is not None:
            answer = "\n".join(cur_answer_lines).strip()
            qa[cur_q] = (cur_question, answer)

    for line in lines:
        if not line:
            # paragraph separator inside an answer
            if cur_q is not None and cur_answer_lines and cur_answer_lines[-1] != "":
                cur_answer_lines.append("")
            continue
        m = re.match(r"^(\d{1,3})\.\s+(.+)$", line)
        # Top-level Q vs nested numbered item: top-level Qs always end with '?' on the same line OR
        # end with ?: across two lines. We detect them by checking whether the *next* expected number
        # is what we'd expect. Simplest: top-level Qs are 1..433 in order.
        if m:
            n = int(m.group(1))
            rest = m.group(2)
            # is this the next expected top-level Q?
            expected = (cur_q or 0) + 1
            if n == expected and (rest.endswith("?") or rest.endswith(":") or rest.endswith(".")):
                # commit previous
                flush()
                cur_q = n
                cur_question = rest
                cur_answer_lines = []
                continue
        # otherwise, append to current answer
        if cur_q is not None:
            cur_answer_lines.append(line)
    flush()

    if len(qa) != 433:
        # Diagnose
        missing = [i for i in range(1, 434) if i not in qa]
        raise RuntimeError(f"pt-br: expected 433 Q&A, got {len(qa)}; missing Qs: {missing[:20]}{'...' if len(missing) > 20 else ''}")
    return qa


# ---------------------------------------------------------------------------
# Italian parser — corsiadeiservi.it clean digital PDF (2004 Word→Acrobat)
# ---------------------------------------------------------------------------


def fix_italian_text(s: str) -> str:
    """Clean up known artefacts from the corsia 2004 PDF text extraction.

    The 2004 Word→Acrobat conversion has these systematic glitches:
      - 'Il' rendered as 'II' or 'I1' (font 'l'→'I' or '1' substitution at sentence starts)
      - 'l'' rendered as '1'' (digit-1 + apostrophe)
      - 'è' rendered as 'é' or 'ò' in some positions
      - Line-break hyphens leak through ('Tri-nità', 'apparen-ze')
      - Spurious periods inside words ('contrariamen.te', 'virtù.morali')
      - Inline footnote markers '(1)', '(t)', '(*)' without footnote text in answers
    """
    # ── 'l'' → '1'' ── digit-1 + apostrophe before a word (most reliable signal)
    s = re.sub(r"\b1'(?=[A-Za-zÀ-ÿ])", "l'", s)
    # ── 'I1 X' → 'Il X' (digit 1 substituted for L)
    s = re.sub(r"(?<![A-Za-z])I1\s+([A-Za-zà-ÿ])", r"Il \1", s)
    s = re.sub(r"^I1\s+([A-Za-zà-ÿ])", r"Il \1", s, flags=re.M)
    # ── digit 1 substituted for L mid-word: "dal1e" → "dalle", "ne1la" → "nella", "a1tare" → "altare"
    s = re.sub(r"(?<=[a-zà-ÿ])1(?=[a-zà-ÿ])", "l", s)
    # ── digit 0 substituted for O mid-word: "n0n" → "non" (rare, but possible)
    s = re.sub(r"(?<=[bcdfghjklmnpqrstvwxz])0(?=[bcdfghjklmnpqrstvwxz])", "o", s)
    # ── 'II' at start of string or after sentence punctuation → 'Il' (when followed by Italian word)
    s = re.sub(r"^II\s+([A-Za-zà-ÿ])", r"Il \1", s)
    s = re.sub(r"(?<=[\.!\?]\s)II\s+([A-Za-zà-ÿ])", r"Il \1", s)
    s = re.sub(r"\bII\s+([a-zàèéìòù])", r"Il \1", s)
    # ── 'Ia' (capital I + lowercase a) at start of italics block / sentence → 'La'
    # In the PDF, capital "L" sometimes renders as "I" + "a" due to font substitution.
    s = re.sub(r"^Ia\s+([A-Za-zà-ÿ])", r"La \1", s)
    s = re.sub(r"(?<=[\.!\?]\s)Ia\s+([A-Za-zà-ÿ])", r"La \1", s)
    # ── 'í' (acute i) → 'i' — Italian doesn't use í except in foreign loanwords
    s = re.sub(r"í", "i", s)
    # ── Line-break hyphens that pdftotext didn't merge: "Tri-nità", "apparen-ze"
    # Match: lowercase letter + hyphen + lowercase letter (within a word)
    s = re.sub(r"([a-zà-ÿ])-([a-zà-ÿ])", r"\1\2", s)
    # ── Specific transcription typos
    s = re.sub(r"\bTra 1 figli\b", "Tra i figli", s)
    s = re.sub(r"\bAdamo tu preservato\b", "Adamo fu preservato", s)
    s = re.sub(r"\bcha hai\b", "che hai", s)
    # ── 'ò' for 'è' between words (e.g., "in Dio ò ogni")
    s = re.sub(r" ò ", " è ", s)
    # ── 'é' for 'è' — Italian almost never uses é except in foreign loanwords. Fix when followed
    # by a determiner/copula context. Keep accented 'é' for known cases (perché, poiché, finché).
    # Targeted fixes for very common patterns:
    s = re.sub(r"\bè\s+", "è ", s)  # normalize spacing
    # Replace bare é → è EXCEPT in exact forms perché/poiché/finché/affinché/giacché/benché/sicché/dacché
    def _fix_e_accent(match: "re.Match[str]") -> str:
        word = match.group(0)
        if re.search(r"(per|poi|fin|affin|giac|ben|sic|dac|cosicc|seppur|talc)ché$", word, re.I):
            return word
        return word.replace("é", "è")
    # Word-by-word: any word containing 'é' that isn't perché-family
    s = re.sub(r"\b\w*é\w*\b", _fix_e_accent, s)
    # ── Spaces around guillemets and quotes
    s = re.sub(r"«\s+", "« ", s)
    s = re.sub(r"\s+»", " »", s)
    # ── Period-as-space typos like "virtù.morali"
    s = re.sub(r"(virtù|grazia|fede|carità|gloria|opera|santità|verità|umiltà|bontà|doveri)\.([a-zà-ÿ])", r"\1 \2", s)
    # ── 'regno de', cieli' → 'regno de' cieli'
    s = re.sub(r"de',\s*cieli", "de' cieli", s)
    # ── 'esercirà' → 'eserciterà'
    s = re.sub(r"\beserci(?:rà|ra)\b", "eserciterà", s)
    # ── 'contrariamen.te' / similar in-word periods
    s = re.sub(r"contrariamen\.te", "contrariamente", s)
    s = re.sub(r"con\.te", "conte", s)
    # ── Stray period before a lowercase letter: " .word" → " word"
    s = re.sub(r"\s\.([a-zà-ÿ])", r" \1", s)
    # ── Drop inline footnote markers '(1)', '(t)', '(*)', '(†)'
    s = re.sub(r"\s*\(([1-9tT*†])\)\s*", " ", s)
    # ── 'più,' / 'più.' with stray space before punctuation
    s = re.sub(r"\s+([,\.;:!\?])", r"\1", s)
    # ── Trailing footnote/bibliography at end of answer.
    # The 1912 PDF inlines footnote text after a "* " or "(N) " marker. Examples:
    #   "...la sua vita terrena. * Matt., III, 17; LUC., IX, 35"
    #   "...Maria Santissima... grazia\". * Luc 1, 28."
    #   "...regno de' cieli*. * Matt V, 3-10"
    #   "...secondo te (t). (t) Orazione della Domenica VIII dopo la Pentecoste."
    # Strategy: any tail starting with ` * <Capitalized-citation>` or `(N) <Capitalized-citation>`
    # where the citation is a typical biblical/liturgical reference (book name + chapter,verse).
    bib_tail = (
        r"(?:[A-Z][a-zA-Zà-ÿ\.]{1,8}\.?,?\s*[IVXLM]+,?\s*\d+(?:[,\s\-–]+\d+)*\.?"   # Mixed-case book + roman numeral
        r"|[A-Z][a-zA-Zà-ÿ\.]{1,8}\.?,?\s*\d+(?:[,\s\-–]+\d+)*\.?"                  # Mixed-case book + arabic
        r"|[A-Z]{2,}\.,?\s*[IVXLM]+,?\s*\d+(?:[,\s\-–]+\d+)*\.?"                    # ALL-CAPS book + roman numeral
        r"|[A-Z]{2,}\.,?\s*\d+(?:[,\s\-–]+\d+)*\.?"                                 # ALL-CAPS book + arabic
        r"|Dall['’]Orazione[^\n]{1,80}"                                             # liturgical refs
        r"|Orazione (per|della|del)[^\n]{1,80}"
        r"|Formola\s+\d+\.?"                                                        # "Formola 14"
        r"|S\. ?[A-Z][a-zA-Zà-ÿ]{1,8}\.?,?\s*[IVXLM]+,?\s*\d+(?:[,\s\-–]+\d+)*\.?"  # "S. Giov."
        r"|Orazioni?,?\s*[IVXLM]+,?\s*[A-Za-z]+\.?"                                 # "Orazioni, II, Canone"
        r"|[A-Z][a-zà-ÿ]{2,8},?\s*[IVXLM]+,?\s*[A-Za-z]+\.?"                        # generic liturgical
        r")"
    )
    # repeat the citation pattern to allow "; LUC., IX, 35" follow-up
    bib_chain = bib_tail + r"(?:[;,]?\s*" + bib_tail + r"){0,3}"
    s = re.sub(rf"\s*\*[.\s]*\*\s*{bib_chain}\s*$", "", s)  # "* . * <bib>" (no space before bib)
    s = re.sub(rf"\s*\*\s*{bib_chain}\s*$", "", s)         # "* <bib>" or "*<bib>"
    s = re.sub(rf"\s*\(\s*\d+\s*\)\s+{bib_chain}\s*$", "", s)  # "(1) <bib>"
    s = re.sub(rf"\s*\(\s*[1-9tT*†]\s*\)\s+{bib_chain}\s*$", "", s)
    # Inline footnote anchor `*` mid-text — appears as ` *,` or ` *.` or ` *;` or `,*` etc.
    # The '*' is not part of any italic markdown here (we operate on raw answer text before italic wrap).
    s = re.sub(r"\s+\*(?=[\s,;:.\!\?])", "", s)
    s = re.sub(r"(?<=[a-zà-ÿ»’\"])\*(?=[\s,;:.\!\?])", "", s)
    s = re.sub(r"(?<=,)\*(?=\s)", "", s)
    # Trailing "*.", "*", "*. *" residue
    s = re.sub(r"\s*\*[.\s]*\*?\s*$", "", s)
    s = re.sub(r"\*\s*$", "", s)
    # Footnote anchor "* " prefix at start of answer
    s = re.sub(r"^\s*\*\s+", "", s)
    # ── PDF font-substitution typos
    s = re.sub(r"\bSapere c pensare\b", "Sapere e pensare", s)
    # Doubled-letter typos at word starts (drop-cap collision artifacts)
    s = re.sub(r"\bRricordati\b", "Ricordati", s)
    s = re.sub(r"\bNnoster\b", "Noster", s)
    s = re.sub(r"\bMmiserere\b", "Miserere", s)
    s = re.sub(r"\bSsancta\b", "Sancta", s)
    s = re.sub(r"\bAamen\b", "Amen", s)
    # Generic "Xx<lowercase>" → "X<lowercase>" when X-letter is uppercase + same-letter lowercase
    # at start of a word (only Italian-typical cases).
    s = re.sub(r"\b([A-Z])\1(?=[a-zà-ÿ]{2,})", r"\1", s)
    # ── "Vedi Append. II in fine" footnote-reference (with or without "*" prefix)
    s = re.sub(r"\.?\s*\*?\s*Vedi\s*Append\.?\s*[IVXLM]+\s*(?:in\s+fine)?\.?\s*", " ", s, flags=re.I)
    # Stray "VediAppend" without space
    s = re.sub(r"\bVediAppend\.?", "Vedi Appendice", s)
    # ── Bibliography with trailing lowercase letter suffix: "ROM., XIII, 1, a" — also without leading *
    s = re.sub(r"\s+[A-Z]+\.,?\s*[IVXLM]+,?\s*\d+,?\s*[a-z]\.?\s*$", "", s)
    # ── Standalone trailing bibliography (no asterisk, just citation)
    s = re.sub(r"\s+[A-Z]{2,}\.,?\s*[IVXLM]+,?\s*\d+(?:[,\s\-–]+\d+)*\.?\s*$", "", s)
    # ── Period-glued conjunctions: "e.le", "e.la", "o.il" → "e le", etc.
    s = re.sub(r"\b(e|o|a|in|di|da|su|che|né|e\spoi|né)\.([a-zà-ÿ])", r"\1 \2", s)
    # ── Collapse double spaces
    s = re.sub(r"  +", " ", s)
    return s.strip()


def parse_it() -> dict[int, tuple[str, str]]:
    """Parse the Italian text extracted from the corsia 2004 PDF.

    The PDF is a clean digital text (not OCR). Q-numbers are reliable. Strategy:
      1. Anchor at Q1 ("Chi ci ha creato?")
      2. Walk lines; when a line starts "N. " with a Q-number 1..433, open a new entry
      3. Capture answer lines until the next Q-number or chapter heading
      4. Use chapter headings (PARTE / Capo / Sezione) to validate the catechism scope
      5. Apply fix_italian_text to clean small known artefacts

    Returns {q_number: (question, answer)} for canonical Q1..Q433.
    """
    text = SOURCES_IT.read_text(encoding="utf-8")

    # Anchor at the FIRST Q1 in the main catechism (skip the front-matter prayer numbered "1 SEGNO DELLA CROCE")
    # The catechism Q1 is preceded by "LA DOTTRINA CRISTIANA" heading.
    anchor_marker = "LA DOTTRINA CRISTIANA"
    anchor_pos = text.find(anchor_marker)
    if anchor_pos < 0:
        raise RuntimeError("Italian Q1 anchor 'LA DOTTRINA CRISTIANA' not found")
    body = text[anchor_pos:]
    # Now find Q1
    q1_match = re.search(r"^1\.\s+Chi ci ha creato", body, re.M)
    if not q1_match:
        raise RuntimeError("Italian Q1 'Chi ci ha creato' not found after anchor")
    body = body[q1_match.start():]

    # Trim before any pre-existing front-matter footnote at end (the catechism Q&A end at Q433
    # and an appendix follows with PREGHIERE etc). We don't trim — just stop reading after Q433.
    lines = body.split("\n")

    # Lines that should NOT accumulate into Q&A: chapter headings, prayer-section labels,
    # scripture citations, the "PREGHIAMO" prayer block that sometimes appears between Qs,
    # and pdftotext page-break artefacts.
    NOISE_LINE_RE = re.compile(
        r"^\s*("
        r"PARTE\s+[IVX]+\s*$"
        r"|Parte\s+[IVX]+\s*$"
        r"|CAPO\s+[IVX]+\s*$"
        r"|Capo\s+[IVX]+\s*$"
        r"|SEZIONE\s+[IVX]+\b"
        r"|Sezione\s+[IVX]+\b"
        r"|CAPO\s+UNICO"
        r"|Capo\s+unico"
        r"|MEZZI DELLA GRAZIA"
        r"|«\s*CREDO\s*»"
        r"|PRINCIPALI VERITÀ"
        r"|DELLA FEDE CRISTIANA"
        r"|PREGHIAMO\s*$"
        r"|Misteri principali\s*$"
        r"|Segno della santa Croce"
        r"|Senza la fede"
        r"|Comandamenti in particolare"
        r"|Precetti generali della Chiesa"
        r"|Sacramenti o mezzi"
        r"|Orazione o mezzo impetrativo"
        r"|^[A-Z]\s*$"  # single uppercase letter (drop-cap artefact)
        r")",
        re.M,
    )

    def is_noise(s: str) -> bool:
        if not s:
            return False
        if NOISE_LINE_RE.match(s):
            return True
        # Pure scripture citation in parens at end of paragraph: "(Ebr, XI, 6.)" or "(Giov., XVII, 3.)"
        if re.match(r"^\([A-Za-z][^)]{1,40}\)\.?$", s):
            return True
        # All-caps lines of >5 chars (chapter section sub-headings)
        if len(s) > 5 and s == s.upper() and any(c.isalpha() for c in s) and not any(c.islower() for c in s):
            return True
        # Pure footnote-marker line "(t) Orazione della Domenica VIII dopo la Pentecoste."
        if re.match(r"^\([1-9tT*†]\)\s+", s):
            return True
        # Lone "(t)" or similar footnote marker
        if re.match(r"^\([1-9tT*†]\)\s*$", s):
            return True
        return False

    qa: dict[int, tuple[str, str]] = {}
    cur_n: int | None = None
    cur_q_buf: list[str] = []
    cur_a_buf: list[str] = []
    q_complete = False
    # PREGHIAMO sections appear between Q&A blocks (closing prayer for each part) and after Q433
    # (closing the catechism into appendix material). Skip lines while inside one until a new
    # numbered Q line resumes the parse.
    in_preghiamo = False
    # Chapter-transition state: after a Capo/Sezione/Parte heading, skip subsequent lines
    # (the chapter sub-title, Latin/Italian Credo recitations, scripture epigraphs) until the
    # next numbered Q line.
    in_chapter_transition = False

    def flush() -> None:
        if cur_n is None:
            return
        question = " ".join(cur_q_buf).strip()
        answer = " ".join(cur_a_buf).strip()
        question = fix_italian_text(question)
        answer = fix_italian_text(answer)
        question = re.sub(r"\s+", " ", question).strip()
        answer = re.sub(r"\s+", " ", answer).strip()
        # Append '?' only if question lacks any sentence-ending punctuation (rare PDF defect)
        if not re.search(r"[\?\.\!]\s*$", question):
            question = question.rstrip(":;,") + "?"
        qa[cur_n] = (question, answer)

    for raw_line in lines:
        line = raw_line.rstrip()
        stripped = line.strip()
        # Indentation: section headings in the corsia PDF are centered (heavily indented). Real Q
        # lines start at column 0. Skip heavily-indented lines as section/subsection headings.
        leading_ws = len(line) - len(line.lstrip())
        if leading_ws >= 6 and stripped:
            continue

        # Enter "PREGHIAMO" prayer block — skip subsequent lines until a new numbered Q starts.
        if stripped == "PREGHIAMO":
            in_preghiamo = True
            continue

        # Detect chapter-heading transitions in the body. Source pattern:
        #   PARTE I / Parte I (indented header)
        #   CAPO IV  (column 0)
        #   Subsection title (col 0, short, no Q-number)
        #   "Credo... in Gesù Cristo..." or scripture epigraph
        #   Then next numbered Q resumes
        # When we see a "Capo X" line at column 0, enter transition mode.
        if re.match(r"^(CAPO|Capo)\s+[IVX]+\s*$", stripped) or re.match(r"^(CAPO|Capo)\s+(UNICO|unico)\s*$", stripped):
            in_chapter_transition = True
            continue
        if re.match(r"^(SEZIONE|Sezione)\s+[IVX]+\b", stripped):
            in_chapter_transition = True
            continue
        if re.match(r"^(PARTE|Parte)\s+[IVX]+\s*$", stripped):
            in_chapter_transition = True
            continue

        # Detect a Q-start: "N. Question text" at column 0.
        m = re.match(r"^(\d{1,3})[\.\s]+(.+)$", stripped) if stripped else None
        # A real Q-number ends BOTH PREGHIAMO and chapter-transition states.
        if m:
            n = int(m.group(1))
            expected = (cur_n or 0) + 1
            if 1 <= n <= 433 and (n == expected or n == expected + 1 or n == expected + 2):
                in_preghiamo = False
                in_chapter_transition = False

        if in_preghiamo or in_chapter_transition:
            continue

        # Cap: once we've finished Q433 and entered any prayer block, we're done with the catechism.
        if cur_n is not None and cur_n >= 433 and not q_complete is False and len(cur_a_buf) > 0:
            # We have Q433's question and at least one answer line. If a "PREGHIAMO" or any other
            # prayer-block marker appeared, in_preghiamo would be set above and we'd skip. The hard
            # cap is just a safety: don't accept any more Q-starts.
            if m:
                n_check = int(m.group(1))
                if n_check > 433:
                    continue
        if m:
            n = int(m.group(1))
            rest = m.group(2).strip()
            expected = (cur_n or 0) + 1

            # Skip footnote citations like "1 Tim, IV,25)" or "1 Cor,..."
            if any(rest.startswith(s) for s in ("Tim,", "Cor,", "Re,", "Sam,", "Mac,", "Pt,", "Pet,", "Gv,", "Mt,")):
                if cur_n is not None and not is_noise(stripped):
                    cur_a_buf.append(stripped)
                continue

            # Numbered enumeration items inside an answer: short, ends with ; or , or no ?
            # E.g., "1. Battesimo;" "1) Unità e Trinità di Dio ;"
            is_enum_item = (
                len(rest) < 60
                and (rest.endswith(";") or rest.endswith(",") or rest.endswith(":"))
                and "?" not in rest
            )
            if is_enum_item and cur_n is not None and not q_complete is False:
                # Only treat as enum if we're inside an answer (already past the Q's '?')
                pass

            # Real Q-start signals — primary: next expected number with a question-like content
            looks_like_q = (
                len(rest) > 5
                and not is_enum_item
            )
            is_in_sequence = (n == expected) or (n == expected + 1) or (n == expected + 2)

            if looks_like_q and is_in_sequence:
                flush()
                cur_n = n
                cur_q_buf = [rest]
                cur_a_buf = []
                # Q text is the line that starts with N. — treat as complete on this line UNLESS
                # the line clearly continues (no terminal punctuation and no clear question marker)
                q_complete = bool(re.search(r"[\?\.:]\s*$", rest))
                continue

            # Tolerant case: number is "wrong" (PDF typo like Q138→"135") but content is clearly a Q.
            if (
                cur_n is not None
                and q_complete  # previous Q's question is finished
                and looks_like_q
                and len(cur_a_buf) > 0  # previous Q has at least one answer line
                and expected <= 433
                and not is_enum_item
            ):
                flush()
                cur_n = expected
                cur_q_buf = [rest]
                cur_a_buf = []
                q_complete = bool(re.search(r"[\?\.:]\s*$", rest))
                continue

            # Otherwise: numbered list item inside an answer
            if cur_n is not None and not is_noise(stripped):
                cur_a_buf.append(stripped)
            continue

        # Stop reading once we leave the catechism scope (after Q433 we hit appendix material)
        if cur_n is not None and cur_n >= 433 and stripped == "":
            # Allow blank line tail; check if next content is appendix
            pass

        if not stripped:
            continue

        # Skip noise lines
        if is_noise(stripped):
            continue

        # Are we still building the question? (Q line had no '?' yet)
        if cur_n is not None and not q_complete:
            cur_q_buf.append(stripped)
            if "?" in stripped:
                q_complete = True
            continue

        # Otherwise: accumulate to the answer
        if cur_n is not None:
            cur_a_buf.append(stripped)

    flush()

    return qa


# ---------------------------------------------------------------------------
# Markdown writer
# ---------------------------------------------------------------------------


def normalize_paragraph(s: str) -> str:
    """Collapse OCR line wrapping: replace single newlines with space, keep blank lines."""
    s = s.strip()
    # Replace single newlines (line wrap) with a space, but preserve blank-line paragraph breaks.
    parts = re.split(r"\n\s*\n", s)
    parts = [re.sub(r"\s+", " ", p).strip() for p in parts]
    return "\n\n".join(p for p in parts if p)


def render_chapter(lang: str, chapter_id: str, title: str, qs: list[tuple[int, str, str]]) -> str:
    out = [f"# {title}\n"]
    for n, q, a in qs:
        q_clean = normalize_paragraph(q)
        a_clean = normalize_paragraph(a)
        out.append(f"**{n}.** {q_clean}\n")
        # Answer: italicize the whole block. If multi-paragraph, italicize each paragraph separately.
        for para in a_clean.split("\n\n"):
            para = para.strip()
            if not para:
                continue
            out.append(f"*{para}*\n")
    return "\n".join(out).rstrip() + "\n"


def write_chapters(lang: str, qa: dict[int, tuple[str, str]]) -> int:
    out_dir = BOOK_DIR / lang
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)

    written = 0
    for cid, lo, hi, titles in CHAPTERS:
        title = titles[lang]
        items = [(n, qa[n][0], qa[n][1]) for n in range(lo, hi + 1) if n in qa]
        if not items:
            print(f"  [skip {lang}/{cid}] no Q&A in range Q{lo}-Q{hi}")
            continue
        path = out_dir / f"{cid}.md"
        path.write_text(render_chapter(lang, cid, title, items), encoding="utf-8")
        written += 1
        print(f"  [{lang}/{cid}] Q{lo}-Q{hi} ({len(items)} entries) → {path.name}")
    return written


def main() -> None:
    print("Parsing pt-BR (Symposium Veritatis)…")
    qa_pt = parse_pt()
    print(f"  → {len(qa_pt)} Q&A entries")

    print("Parsing Italian (archive.org 1959 OCR)…")
    qa_it = parse_it()
    print(f"  → {len(qa_it)} Q&A entries")

    if len(qa_it) != 433:
        print(f"  WARNING: Italian count is {len(qa_it)}, expected 433. Continuing anyway.")

    print("\nWriting pt-BR chapters…")
    n_pt = write_chapters("pt-BR", qa_pt)
    print(f"  → {n_pt} chapter files")

    print("\nWriting Italian chapters…")
    n_it = write_chapters("it", qa_it)
    print(f"  → {n_it} chapter files")


if __name__ == "__main__":
    main()
