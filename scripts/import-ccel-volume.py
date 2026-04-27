#!/usr/bin/env python3
"""
Generic CCEL volume importer for the Ember content library.

Slices a CCEL plaintext volume (e.g. NPNF1-09) into per-book directories of
cleaned markdown. Each work in the volume becomes a `book` with TOC entries
mapped to chapter `.md` files. Footnotes are converted to GFM `[^N]` form.

The volume's structure (which lines belong to which work, and how each work
divides into chapters) is declared in a per-volume config dict and passed to
import_volume(). This script ships a config for NPNF1-09 (the Chrysostom
catechetical volume) and is reused by other volume importers.
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path
from typing import Iterable, Sequence

REPO = Path(__file__).resolve().parent.parent

PAGE_BREAK_RE = re.compile(r"^\s*_{30,}\s*$")
HRULE_RE = re.compile(r"^\s*-{6,}\s*$")
INLINE_FOOTNOTE_RE = re.compile(r"\[(\d+)\]")
FOOTNOTE_DEF_RE = re.compile(r"^\[(\d+)\]\s+(.*)$")
NUMBERED_PARA_RE = re.compile(r"^(\d+)\.\s+")
# Reliable section-start marker — every distinct work in NPNF1-09 begins with
# a `   St. Chrysostom:` preamble line. We use this both to trim chunk overshoots
# and to skip the preamble when a chunk starts with one.
PREAMBLE_START_RE = re.compile(r"^\s*St\.\s*Chrysostom:\s*$")


def strip_indent(line: str) -> str:
    """Strip the CCEL 3-space body indent (and any extra leading spaces)."""
    return line[3:] if line.startswith("   ") else line.lstrip()


def split_body_and_footnotes(lines: list[str]) -> tuple[list[str], list[tuple[str, str]]]:
    """Find the trailing footnote block and separate it from the body.

    CCEL chapters end with a sequence of `[N] note text...` paragraphs. Each
    footnote is a block of consecutive non-blank lines, the first of which
    starts with `[N]`. Walk up from the end, accepting each such block as a
    footnote and stopping at the first block whose first line is *not* `[N]`.
    """
    n = len(lines)
    if n == 0:
        return [], []

    # If the chunk starts with a `St. Chrysostom:` preamble (work title block),
    # skip past it. The preamble block ends at the first page-break separator
    # that's followed by the actual body content.
    first_content = 0
    while first_content < n and not lines[first_content].strip():
        first_content += 1
    if first_content < n and PREAMBLE_START_RE.match(lines[first_content]):
        # Skip forward through the preamble metadata until we pass the
        # closing page-break. The preamble layout: St. Chrysostom: / blank /
        # title / blank / translated by / blank / rev. ... / page-break.
        i = first_content + 1
        while i < n and not PAGE_BREAK_RE.match(lines[i]):
            i += 1
        # Skip the run of page-breaks/blanks following.
        while i < n and (PAGE_BREAK_RE.match(lines[i]) or not lines[i].strip()):
            i += 1
        first_content = i

    # Trim everything at/after the *next* section preamble.
    cut = n
    for i in range(first_content + 1, n):
        if PREAMBLE_START_RE.match(lines[i]):
            cut = i
            break

    lines = lines[first_content:cut]
    n = len(lines)
    if n == 0:
        return [], []

    # End of meaningful content: trim trailing blanks/page-breaks.
    end = n
    while end > 0 and (not lines[end - 1].strip() or PAGE_BREAK_RE.match(lines[end - 1])):
        end -= 1

    fn_start = end
    while fn_start > 0:
        # Walk up through any blanks/page-breaks above the current fn_start.
        cur = fn_start
        while cur > 0 and (not lines[cur - 1].strip() or PAGE_BREAK_RE.match(lines[cur - 1])):
            cur -= 1
        if cur == 0:
            fn_start = 0
            break
        # Identify the contiguous block of non-blank, non-page-break lines
        # ending at cur-1.
        block_end = cur  # exclusive
        block_start = block_end
        while (
            block_start > 0
            and lines[block_start - 1].strip()
            and not PAGE_BREAK_RE.match(lines[block_start - 1])
        ):
            block_start -= 1
        # Is this block a footnote definition? (first line matches [N] ...)
        first = strip_indent(lines[block_start])
        if FOOTNOTE_DEF_RE.match(first):
            fn_start = block_start
            continue
        # Not a footnote — body ends here.
        break

    body_lines = lines[:fn_start]
    fn_lines = lines[fn_start:end]

    # Parse footnote defs. Lines starting with [N] begin a new footnote;
    # subsequent non-blank, non-page-break lines extend the previous footnote.
    footnotes: list[tuple[str, str]] = []
    cur_num: str | None = None
    cur_buf: list[str] = []

    def flush() -> None:
        nonlocal cur_num, cur_buf
        if cur_num is not None:
            text = " ".join(p.strip() for p in cur_buf if p.strip())
            footnotes.append((cur_num, text))
            cur_num, cur_buf = None, []

    for raw in fn_lines:
        if not raw.strip() or PAGE_BREAK_RE.match(raw):
            continue
        s = strip_indent(raw)
        m = FOOTNOTE_DEF_RE.match(s)
        if m:
            flush()
            cur_num = m.group(1)
            cur_buf = [m.group(2)]
        else:
            cur_buf.append(s)
    flush()

    # Trim trailing page-break lines from body.
    while body_lines and (not body_lines[-1].strip() or PAGE_BREAK_RE.match(body_lines[-1])):
        body_lines.pop()
    return body_lines, footnotes


def clean_body(body_lines: list[str]) -> list[str]:
    """Convert raw body to paragraph-split text with markdown footnote refs."""
    out: list[str] = []
    para_buf: list[str] = []

    def flush() -> None:
        if para_buf:
            joined = " ".join(p.strip() for p in para_buf if p.strip())
            if joined:
                out.append(joined)
            para_buf.clear()

    for raw in body_lines:
        if PAGE_BREAK_RE.match(raw) or HRULE_RE.match(raw):
            flush()
            continue
        if not raw.strip():
            flush()
            continue
        para_buf.append(strip_indent(raw))
    flush()

    # Convert inline [N] -> [^N]
    out = [INLINE_FOOTNOTE_RE.sub(r"[^\1]", p) for p in out]
    return out


def render_chapter(
    title: str,
    body_paragraphs: list[str],
    footnotes: list[tuple[str, str]],
    *,
    subtitle: str | None = None,
) -> str:
    """Assemble the final markdown for a single chapter."""
    parts: list[str] = []
    title_md = INLINE_FOOTNOTE_RE.sub(r"[^\1]", title).rstrip(".").strip()
    parts.append(f"# {title_md}")
    parts.append("")
    if subtitle:
        sub_md = INLINE_FOOTNOTE_RE.sub(r"[^\1]", subtitle).strip()
        parts.append(f"## {sub_md}")
        parts.append("")
    parts.extend(p + "\n" for p in body_paragraphs)
    if footnotes:
        parts.append("")
        parts.append("---")
        parts.append("")
        for n, text in footnotes:
            # Convert any inline [N] references inside footnote text too.
            text_md = INLINE_FOOTNOTE_RE.sub(r"[^\1]", text)
            parts.append(f"[^{n}]: {text_md}")
    # Make sure paragraphs are separated by blank lines.
    md = "\n\n".join(parts).rstrip() + "\n"
    md = re.sub(r"\n{3,}", "\n\n", md)
    return md


def detect_chapter_title(body_lines: list[str]) -> tuple[str, str | None, list[str]]:
    """Pull the title (and optional subtitle) from the leading lines.

    Looks for the first non-empty stripped line as the title (e.g. "Homily I.")
    and optionally a second line as subtitle (e.g. "The Argument."). Returns
    (title, subtitle, remaining_body_lines).
    """
    i = 0
    while i < len(body_lines) and not body_lines[i].strip():
        i += 1
    if i >= len(body_lines):
        return ("Untitled", None, [])
    title = strip_indent(body_lines[i]).strip().rstrip(".")
    rest = body_lines[i + 1 :]
    # Skip blanks
    j = 0
    while j < len(rest) and not rest[j].strip():
        j += 1
    subtitle = None
    if j < len(rest):
        candidate = strip_indent(rest[j]).strip()
        # Use only short, title-cased candidates as subtitle
        if 3 <= len(candidate) <= 80 and candidate.endswith("."):
            short = candidate.rstrip(".")
            if short and not NUMBERED_PARA_RE.match(short):
                subtitle = candidate.rstrip(".")
                rest = rest[j + 1 :]
    return (title, subtitle, rest)


def slice_to_chapter(
    src_lines: list[str], start: int, end: int, *, force_title: str | None = None,
    subtitle_override: str | None = None,
) -> str:
    """Convert a [start, end] (1-indexed inclusive) line range to markdown."""
    chunk = src_lines[start - 1 : end]
    body, footnotes = split_body_and_footnotes(chunk)
    title, subtitle, rest = detect_chapter_title(body)
    if force_title is not None:
        title = force_title
    if subtitle_override is not None:
        subtitle = subtitle_override
    paras = clean_body(rest)
    return render_chapter(title, paras, footnotes, subtitle=subtitle)


def write_book(
    book_dir: Path,
    *,
    book_meta: dict,
    chapters: list[dict],
    src_lines: list[str],
    languages: Sequence[str] = ("en-US",),
) -> None:
    """Write book.json and per-chapter markdown for `languages[0]`.

    `chapters` items: { id, title (str | dict), start, end, [force_title], [subtitle] }
    """
    book_dir.mkdir(parents=True, exist_ok=True)
    lang_dir = book_dir / languages[0]
    lang_dir.mkdir(parents=True, exist_ok=True)

    toc = []
    for ch in chapters:
        # Render markdown
        md = slice_to_chapter(
            src_lines,
            ch["start"],
            ch["end"],
            force_title=ch.get("force_title"),
            subtitle_override=ch.get("subtitle"),
        )
        (lang_dir / f"{ch['id']}.md").write_text(md, encoding="utf-8")

        toc_title = ch.get("title")
        if toc_title is None:
            # Re-detect from rendered content (first H1 line)
            first = md.splitlines()[0].lstrip("# ").strip()
            toc_title = first
        if isinstance(toc_title, str):
            toc_title = {languages[0]: toc_title}
        toc.append({"id": ch["id"], "title": toc_title})

    book_json = {
        "id": book_meta["id"],
        "name": book_meta["name"],
        "author": book_meta.get("author", {"en-US": "St. John Chrysostom"}),
        "description": book_meta.get("description", {}),
        "composed": book_meta.get("composed"),
        "languages": list(languages),
        "sources": book_meta.get("sources", []),
        "toc": toc,
    }
    # Strip None composed
    if book_json["composed"] is None:
        del book_json["composed"]
    (book_dir / "book.json").write_text(
        json.dumps(book_json, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def import_volume(config: dict) -> None:
    """Process a CCEL volume per the supplied config dict."""
    src_path: Path = config["source_path"]
    library_dir: Path = config["library_dir"]
    src_lines = src_path.read_text(encoding="utf-8", errors="replace").splitlines(keepends=False)
    # 1-index: insert a sentinel so src_lines[1] is line 1.
    # Implementation note: slice_to_chapter does start-1, so we keep 0-indexed list as-is.
    print(f"Source: {src_path} ({len(src_lines)} lines, {sum(len(l) for l in src_lines)} chars)")

    for book in config["books"]:
        book_dir = library_dir / "books" / book["id"]
        write_book(
            book_dir,
            book_meta=book["meta"],
            chapters=book["chapters"],
            src_lines=src_lines,
            languages=book.get("languages", ("en-US",)),
        )
        print(f"  ✓ {book['id']} ({len(book['chapters'])} chapters)")


# ---------------------------------------------------------------------------
# NPNF1-09 — Chrysostom catechetical works for laity.
# ---------------------------------------------------------------------------

CHRYSOSTOM_AUTHOR = {"en-US": "St. John Chrysostom", "pt-BR": "São João Crisóstomo"}

NPNF1_09_SOURCE = {
    "language": "en-US",
    "url": "https://ccel.org/ccel/schaff/npnf109",
    "description": "NPNF Series I Vol. IX (Schaff, 1889): Stephens / Brandram / Stevens translations.",
}


def chapters_statues() -> list[dict]:
    """The 21 Homilies on the Statues — line ranges in the NPNF1-09 .txt."""
    ranges = [
        (1, 21881, 23085),
        (2, 23086, 23951),
        (3, 23952, 24832),
        (4, 24833, 25445),
        (5, 25446, 26323),
        (6, 26324, 27237),
        (7, 27238, 27684),
        (8, 27685, 28049),
        (9, 28050, 28665),
        (10, 28666, 29234),
        (11, 29235, 29728),
        (12, 29729, 30424),
        (13, 30425, 30895),
        (14, 30896, 31551),
        (15, 31552, 32131),
        (16, 32132, 32757),
        (17, 32758, 33338),
        (18, 33339, 33823),
        (19, 33824, 34463),
        (20, 34464, 35368),
        (21, 35369, 36019),
    ]
    return [
        {
            "id": f"homily-{n:02d}",
            "title": {"en-US": f"Homily {to_roman(n)}"},
            "start": s,
            "end": e,
        }
        for (n, s, e) in ranges
    ]


def to_roman(n: int) -> str:
    table = [
        (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
        (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
        (10, "X"), (9, "IX"), (5, "V"), (4, "IV"),
        (1, "I"),
    ]
    out = ""
    for v, s in table:
        while n >= v:
            out += s
            n -= v
    return out


def npnf1_09_config(library_dir: Path, source_path: Path) -> dict:
    return {
        "source_path": source_path,
        "library_dir": library_dir,
        "books": [
            {
                "id": "chrysostom-instructions-catechumens",
                "meta": {
                    "id": "chrysostom-instructions-catechumens",
                    "name": {
                        "en-US": "Instructions to Catechumens",
                        "pt-BR": "Instruções aos Catecúmenos",
                    },
                    "author": CHRYSOSTOM_AUTHOR,
                    "description": {
                        "en-US": "Two pre-baptismal instructions delivered to those preparing for baptism: the laver of regeneration, the renunciation of Satan, the dignity of the baptismal washing, the commitments of Christian life. Pure catechesis, addressed directly to lay catechumens.",
                        "pt-BR": "Duas instruções pré-batismais dirigidas aos que se preparavam para o batismo: o banho da regeneração, a renúncia a Satanás, a dignidade do banho batismal, os compromissos da vida cristã. Catequese pura, dirigida diretamente aos catecúmenos leigos.",
                    },
                    "composed": "c. 388",
                    "sources": [NPNF1_09_SOURCE],
                },
                "chapters": [
                    {"id": "first-instruction", "title": {"en-US": "First Instruction"}, "start": 10650, "end": 11144, "force_title": "First Instruction"},
                    {"id": "second-instruction", "title": {"en-US": "Second Instruction"}, "start": 11145, "end": 11710, "force_title": "Second Instruction"},
                ],
            },
            {
                "id": "chrysostom-statues",
                "meta": {
                    "id": "chrysostom-statues",
                    "name": {
                        "en-US": "Homilies on the Statues",
                        "pt-BR": "Homilias sobre as Estátuas",
                    },
                    "author": CHRYSOSTOM_AUTHOR,
                    "description": {
                        "en-US": "Twenty-one homilies preached at Antioch during Lent of 387 AD, when the people had toppled the imperial statues and feared the wrath of Theodosius. Chrysostom uses the crisis to preach repentance, almsgiving, the dignity of human nature, oaths, and trust in providence — pastoral catechesis at its most concrete.",
                        "pt-BR": "Vinte e uma homilias pregadas em Antioquia durante a Quaresma de 387, quando o povo havia derrubado as estátuas imperiais e temia a ira de Teodósio. Crisóstomo usa a crise para pregar arrependimento, esmolas, a dignidade da natureza humana, juramentos e confiança na providência.",
                    },
                    "composed": "387",
                    "sources": [NPNF1_09_SOURCE],
                },
                "chapters": chapters_statues(),
            },
            {
                "id": "chrysostom-power-of-demons",
                "meta": {
                    "id": "chrysostom-power-of-demons",
                    "name": {
                        "en-US": "Three Homilies on the Power of Demons",
                        "pt-BR": "Três Homilias sobre o Poder dos Demônios",
                    },
                    "author": CHRYSOSTOM_AUTHOR,
                    "description": {
                        "en-US": "Three homilies preached at Antioch refuting the popular notion that demons or fate govern human affairs. Chrysostom defends free will, providence, and the responsibility of repentance against the despair that despair-of-self and superstition both produce.",
                        "pt-BR": "Três homilias pregadas em Antioquia refutando a noção popular de que os demônios ou o destino governam os assuntos humanos. Crisóstomo defende o livre-arbítrio, a providência e a responsabilidade do arrependimento.",
                    },
                    "composed": "c. 388",
                    "sources": [NPNF1_09_SOURCE],
                },
                "chapters": [
                    {"id": "homily-01", "title": {"en-US": "Homily I"}, "start": 11790, "end": 12500},
                    {"id": "homily-02", "title": {"en-US": "Homily II"}, "start": 12501, "end": 12877},
                    {"id": "homily-03", "title": {"en-US": "Homily III"}, "start": 12878, "end": 13419},
                ],
            },
            {
                "id": "chrysostom-eutropius",
                "meta": {
                    "id": "chrysostom-eutropius",
                    "name": {
                        "en-US": "Two Homilies on Eutropius",
                        "pt-BR": "Duas Homilias sobre Eutrópio",
                    },
                    "author": CHRYSOSTOM_AUTHOR,
                    "description": {
                        "en-US": "Two short, dramatic homilies on the fall of the consul Eutropius, who once persecuted the Church's right of sanctuary and then took refuge at the altar himself. Vivid catechesis on the vanity of worldly power and the mercy of Christ.",
                        "pt-BR": "Duas homilias breves e dramáticas sobre a queda do cônsul Eutrópio, que outrora perseguiu o direito de asilo da Igreja e depois refugiou-se ele mesmo no altar. Catequese vívida sobre a vaidade do poder mundano e a misericórdia de Cristo.",
                    },
                    "composed": "399",
                    "sources": [NPNF1_09_SOURCE],
                },
                "chapters": [
                    {"id": "introduction", "title": {"en-US": "Introduction"}, "start": 16334, "end": 16528},
                    {"id": "homily-01", "title": {"en-US": "Homily I — When he had taken refuge in the church"}, "start": 16529, "end": 16801},
                    {"id": "homily-02", "title": {"en-US": "Homily II — When he had quitted the asylum of the church"}, "start": 16802, "end": 17909},
                ],
            },
            {
                "id": "chrysostom-young-widow",
                "meta": {
                    "id": "chrysostom-young-widow",
                    "name": {
                        "en-US": "Letter to a Young Widow",
                        "pt-BR": "Carta a uma Jovem Viúva",
                    },
                    "author": CHRYSOSTOM_AUTHOR,
                    "description": {
                        "en-US": "A pastoral letter of consolation to a young widow recently bereaved, drawing on the resurrection, providence, and the dignity of the widowed state. One of Chrysostom's most accessible works of lay spiritual direction.",
                        "pt-BR": "Carta pastoral de consolo a uma jovem viúva recém-enviuvada, recorrendo à ressurreição, à providência e à dignidade do estado de viuvez. Uma das obras mais acessíveis de Crisóstomo na direção espiritual de leigos.",
                    },
                    "composed": "c. 380",
                    "sources": [NPNF1_09_SOURCE],
                },
                "chapters": [
                    {"id": "introduction", "title": {"en-US": "Introduction"}, "start": 8263, "end": 8519},
                    {"id": "letter", "title": {"en-US": "Letter to a Young Widow"}, "start": 8520, "end": 8898, "force_title": "Letter to a Young Widow"},
                ],
            },
            {
                "id": "chrysostom-no-one-can-harm",
                "meta": {
                    "id": "chrysostom-no-one-can-harm",
                    "name": {
                        "en-US": "No One Can Harm the Man Who Does Not Injure Himself",
                        "pt-BR": "Ninguém Pode Prejudicar Quem Não se Prejudica a Si Mesmo",
                    },
                    "author": CHRYSOSTOM_AUTHOR,
                    "description": {
                        "en-US": "A treatise written from exile in Cucusus near the end of Chrysostom's life and sent to the deaconess Olympias. With Stoic clarity and Christian depth he argues that no external evil — loss, slander, sickness, even death — can truly injure a soul that does not injure itself by sin.",
                        "pt-BR": "Tratado escrito do exílio em Cucuso perto do fim da vida de Crisóstomo, enviado à diaconisa Olímpia. Com clareza estoica e profundidade cristã, argumenta que nenhum mal externo pode prejudicar a alma que não se prejudica pelo pecado.",
                    },
                    "composed": "c. 406",
                    "sources": [NPNF1_09_SOURCE],
                },
                "chapters": [
                    {"id": "introduction", "title": {"en-US": "Introduction"}, "start": 17926, "end": 18066},
                    {"id": "treatise", "title": {"en-US": "Treatise"}, "start": 18067, "end": 19105},
                ],
            },
            {
                "id": "chrysostom-ignatius-babylas",
                "meta": {
                    "id": "chrysostom-ignatius-babylas",
                    "name": {
                        "en-US": "Homilies on Ss. Ignatius and Babylas",
                        "pt-BR": "Homilias sobre Santos Inácio e Bábila",
                    },
                    "author": CHRYSOSTOM_AUTHOR,
                    "description": {
                        "en-US": "Two festal panegyrics on the Antiochene martyrs — St. Ignatius of Antioch and St. Babylas — preached at their shrines. Vivid pastoral catechesis on martyrdom, courage, the communion of saints, and the dignity of every Christian life.",
                        "pt-BR": "Dois panegíricos festivos sobre os mártires antioquenos — Santo Inácio de Antioquia e São Bábila — pregados em seus santuários. Catequese pastoral vívida sobre o martírio, a coragem, a comunhão dos santos e a dignidade de toda vida cristã.",
                    },
                    "composed": "c. 386–397",
                    "sources": [NPNF1_09_SOURCE],
                },
                "chapters": [
                    {"id": "introduction", "title": {"en-US": "Introduction"}, "start": 8917, "end": 9046, "force_title": "Introduction"},
                    {"id": "homily-on-ignatius", "title": {"en-US": "Homily on St. Ignatius"}, "start": 9050, "end": 9495, "force_title": "Homily on St. Ignatius"},
                    {"id": "homily-on-babylas", "title": {"en-US": "Homily on St. Babylas"}, "start": 9496, "end": 9770, "force_title": "Homily on St. Babylas"},
                ],
            },
            {
                "id": "chrysostom-lowliness",
                "meta": {
                    "id": "chrysostom-lowliness",
                    "name": {
                        "en-US": "Homily Concerning Lowliness of Mind",
                        "pt-BR": "Homilia sobre a Humildade",
                    },
                    "author": CHRYSOSTOM_AUTHOR,
                    "description": {
                        "en-US": "A single homily on Philippians 1:18 (\"Whether in pretence, or in sincerity, Christ is preached\"), expounding the master-virtue of humility — the disposition without which no other Christian virtue holds. A short, accessible piece of formation for ordinary believers.",
                        "pt-BR": "Uma única homilia sobre Filipenses 1,18 — exposição da virtude-mestra da humildade, sem a qual nenhuma outra virtude cristã se sustenta. Peça breve e acessível de formação para fiéis comuns.",
                    },
                    "composed": "c. 388",
                    "sources": [NPNF1_09_SOURCE],
                },
                "chapters": [
                    {"id": "homily", "title": {"en-US": "Homily"}, "start": 9787, "end": 10632, "force_title": "Homily Concerning Lowliness of Mind"},
                ],
            },
            {
                "id": "chrysostom-special-homilies",
                "meta": {
                    "id": "chrysostom-special-homilies",
                    "name": {
                        "en-US": "Five Special Homilies",
                        "pt-BR": "Cinco Homilias Especiais",
                    },
                    "author": CHRYSOSTOM_AUTHOR,
                    "description": {
                        "en-US": "Five occasional homilies preached at Antioch on themes of immediate pastoral relevance: Christ's prayer in the Garden (against Marcionists and Manichæans); the paralytic let down through the roof; absent church-goers and the love of enemies (Romans 12:20); the silent rebuke of others' sins. Concrete catechesis on prayer, perseverance, charity, and discretion.",
                        "pt-BR": "Cinco homilias ocasionais pregadas em Antioquia sobre temas de relevância pastoral imediata: a oração de Cristo no Horto (contra marcionitas e maniqueus); o paralítico descido pelo telhado; os ausentes da assembleia e o amor aos inimigos (Romanos 12,20); a repreensão silenciosa dos pecados alheios.",
                    },
                    "composed": "c. 387–397",
                    "sources": [NPNF1_09_SOURCE],
                },
                "chapters": [
                    {"id": "father-if-possible", "title": {"en-US": "Homily on \"Father, if it be possible, let this cup pass from me\""}, "start": 13420, "end": 14033, "force_title": "Homily on “Father, if it be possible, let this cup pass from me”"},
                    {"id": "paralytic", "title": {"en-US": "Homily on the Paralytic let down through the roof"}, "start": 14034, "end": 14880, "force_title": "Homily on the Paralytic Let Down through the Roof"},
                    {"id": "assembly", "title": {"en-US": "Homily to those who had not attended the assembly"}, "start": 14881, "end": 15686, "force_title": "Homily to Those Who Had Not Attended the Assembly"},
                    {"id": "errors-of-brethren", "title": {"en-US": "Homily against publishing the errors of the brethren"}, "start": 15687, "end": 16319, "force_title": "Homily Against Publishing the Errors of the Brethren"},
                ],
            },
            {
                "id": "chrysostom-letters-olympias",
                "meta": {
                    "id": "chrysostom-letters-olympias",
                    "name": {
                        "en-US": "Letters to Olympias",
                        "pt-BR": "Cartas a Olímpia",
                    },
                    "author": CHRYSOSTOM_AUTHOR,
                    "description": {
                        "en-US": "Seventeen letters from exile to the deaconess Olympias, the most prominent of Chrysostom's lay disciples. Direct, personal, and rich in encouragement under suffering — pastoral spiritual direction at its tenderest.",
                        "pt-BR": "Dezessete cartas escritas no exílio à diaconisa Olímpia, a mais proeminente das discípulas leigas de Crisóstomo. Direta, pessoal e rica em encorajamento sob o sofrimento.",
                    },
                    "composed": "404–407",
                    "sources": [NPNF1_09_SOURCE],
                },
                "chapters": [
                    {"id": "introduction", "title": {"en-US": "Introduction"}, "start": 19119, "end": 19181},
                    {"id": "letter-01", "title": {"en-US": "Letter I — To my lady"}, "start": 19186, "end": 19559, "force_title": "Letter I — To my lady"},
                    {"id": "letter-02", "title": {"en-US": "Letter II — To Olympias"}, "start": 19560, "end": 19877, "force_title": "Letter II — To Olympias"},
                    {"id": "letter-03", "title": {"en-US": "Letter III — To Olympias"}, "start": 19878, "end": 20026, "force_title": "Letter III — To Olympias"},
                    {"id": "letter-04", "title": {"en-US": "Letter IV — To Olympias"}, "start": 20027, "end": 20377, "force_title": "Letter IV — To Olympias"},
                    {"id": "letter-05", "title": {"en-US": "Letter V — To Olympias"}, "start": 20378, "end": 20460, "force_title": "Letter V — To Olympias"},
                ],
            },
        ],
    }


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("usage: import-ccel-volume.py <volume-id>", file=sys.stderr)
        print("known volumes: npnf1-09", file=sys.stderr)
        return 1
    vol = argv[1]
    if vol == "npnf1-09":
        library_dir = REPO / "content/libraries/chrysostom"
        source_path = library_dir / "sources/english-originals/npnf1-09.txt"
        cfg = npnf1_09_config(library_dir, source_path)
        import_volume(cfg)
        return 0
    print(f"unknown volume: {vol}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
