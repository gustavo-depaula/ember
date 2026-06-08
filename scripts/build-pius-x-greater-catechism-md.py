#!/usr/bin/env python3
"""Convert downloaded Wikisource .txt sources to authored Markdown chapter files.

Reads content/books/pius-x-greater-catechism/sources/it-originals/*.txt and
writes content/books/pius-x-greater-catechism/it/*.md, one md per source.

Format follows the existing pius-x-catechism (1912) book:
  # Chapter title
  ## § N. - subsection heading (when present)
  **1.** Question?
  *Answer.*

Q&A numbering restarts per chapter. The Wikisource transcription uses `D.` /
`R.` markers (no numbers) since the canonical 1905 numbering wasn't preserved
on Wikisource; per-chapter numbering keeps the visual style consistent with
the 1912 sibling and gives readers a useful local index.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOK_DIR = ROOT / "content" / "books" / "pius-x-greater-catechism"
SRC_DIR = BOOK_DIR / "sources" / "it-originals"
OUT_DIR = BOOK_DIR / "it"

# Some source files don't have a "D. ... R. ..." structure — they're just prose.
# Listed here so we render them as plain markdown paragraphs instead of trying
# to match a Q&A pattern.
PROSE_FILES = {"lettera-promulgazione.txt"}

# Chapter title map: source filename → markdown H1.
TITLES: dict[str, str] = {
    "lettera-promulgazione.txt": "Lettera di S.S. Papa Pio X al Cardinale Pietro Respighi",
    "prime-nozioni-capo-i.txt": "Prime nozioni — Capo I. Delle verità principali di nostra santa Fede",
    "prime-nozioni-capo-ii.txt": "Prime nozioni — Capo II. Parti principali della Dottrina cristiana",
    "prime-nozioni-capo-iii.txt": "Prime nozioni — Capo III. Atti di Fede, di Speranza, di Carità e di Contrizione",
    "lezione-preliminare.txt": "Lezione preliminare — Della dottrina cristiana e delle sue parti principali",
}


def strip_header(body: str) -> str:
    """Remove the === URL / === TITLE lines added by the crawler."""
    lines = body.split("\n")
    out: list[str] = []
    skipping = True
    for ln in lines:
        if skipping and (ln.startswith("=== ") or ln.strip() == ""):
            continue
        skipping = False
        out.append(ln)
    return "\n".join(out)


def normalize_spacing(text: str) -> str:
    """Fix the spurious spaces left by inline-element extraction.

    The crawler used `get_text(separator=' ')`, which inserts a space whenever
    an inline `<i>` / `<b>` boundary is crossed. That leaves artifacts like
    `il Credo .` or `parola Credo , che`. Tighten those up.
    """
    text = re.sub(r"\s+([,.;:!?»])", r"\1", text)
    text = re.sub(r"([«])\s+", r"\1", text)
    # Convert a stray non-breaking space to a regular one
    text = text.replace(" ", " ")
    text = re.sub(r" {2,}", " ", text)
    return text


def split_paragraphs(text: str) -> list[str]:
    paras: list[str] = []
    current: list[str] = []
    for ln in text.split("\n"):
        if ln.strip() == "":
            if current:
                paras.append(" ".join(current).strip())
                current = []
        else:
            current.append(ln.strip())
    if current:
        paras.append(" ".join(current).strip())
    return paras


def is_question(p: str) -> bool:
    return p.startswith("D.") and (len(p) <= 2 or p[2] == " ")


def is_answer(p: str) -> bool:
    return p.startswith("R.") and (len(p) <= 2 or p[2] == " ")


def is_section_divider(p: str) -> bool:
    # `§ 1 . - Della Chiesa in generale.`
    return p.startswith("§")


def strip_qr_prefix(p: str) -> str:
    return re.sub(r"^[DR]\.\s*", "", p).strip()


def render_qa(paragraphs: list[str], chapter_title: str) -> str:
    """Walk paragraphs and assemble markdown.

    Pattern: chapter heading, then alternating Q (D.) / A (R.) blocks. An
    answer may be followed by un-prefixed continuation paragraphs (e.g. the
    numbered articles of the Credo recitation); those get rendered as their
    own italic paragraphs immediately after the answer.
    """
    out: list[str] = [f"# {chapter_title}", ""]
    n = 0
    state = "header"  # header → q → a → (q | continuation | section)

    # The first non-empty paragraph is usually the chapter's own "Capo X. ..."
    # heading that the source page repeats — we drop it since the markdown H1
    # already carries that information.
    i = 0
    if paragraphs and not is_question(paragraphs[0]) and not is_section_divider(paragraphs[0]):
        i = 1

    while i < len(paragraphs):
        p = paragraphs[i]
        if is_section_divider(p):
            # Section dividers (`§ 1. - ...`) become H2 subheadings.
            heading = p.lstrip("§ ").rstrip(".").strip()
            heading = re.sub(r"^\d+\s*\.\s*-?\s*", "", heading).strip(" .-")
            section_num_match = re.match(r"§\s*(\d+)", p)
            if section_num_match:
                heading = f"§ {section_num_match.group(1)}. {heading}"
            out.append(f"## {heading}")
            out.append("")
            state = "header"
            i += 1
            continue

        if is_question(p):
            n += 1
            q = strip_qr_prefix(p)
            out.append(f"**{n}.** {q}")
            out.append("")
            state = "q"
            i += 1
            continue

        if is_answer(p):
            a = strip_qr_prefix(p)
            out.append(f"*{a}*")
            out.append("")
            state = "a"
            i += 1
            continue

        # Continuation paragraph (e.g., numbered list items inside an answer).
        # Render as italic so it visually belongs to the preceding answer.
        if state == "a":
            out.append(f"*{p}*")
            out.append("")
            i += 1
            continue

        # Floating prose before any Q/A — emit as plain paragraph.
        out.append(p)
        out.append("")
        i += 1

    while out and out[-1] == "":
        out.pop()
    out.append("")
    return "\n".join(out)


def render_prose(paragraphs: list[str], chapter_title: str) -> str:
    out: list[str] = [f"# {chapter_title}", ""]
    for p in paragraphs:
        out.append(p)
        out.append("")
    while out and out[-1] == "":
        out.pop()
    out.append("")
    return "\n".join(out)


def chapter_title_for(filename: str, paragraphs: list[str]) -> str:
    if filename in TITLES:
        return TITLES[filename]
    # Default: take the first paragraph, normalize spacing/punctuation
    raw = paragraphs[0] if paragraphs else filename
    # Convert "Capo I.  Del «Credo» in generale." → "Capo I — Del «Credo» in generale"
    raw = raw.strip().rstrip(".")
    raw = re.sub(r"^(Capo\s+[IVXLCDM]+)\s*[.\s]+", r"\1 — ", raw)
    return raw


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    files = sorted(SRC_DIR.glob("*.txt"))
    if not files:
        raise SystemExit(f"no .txt sources in {SRC_DIR}")
    for src in files:
        body = strip_header(src.read_text(encoding="utf-8"))
        body = normalize_spacing(body)
        paragraphs = split_paragraphs(body)
        if not paragraphs:
            print(f"  ! {src.name}: empty after parsing — skipped")
            continue
        title = chapter_title_for(src.name, paragraphs)
        if src.name in PROSE_FILES:
            md = render_prose(paragraphs, title)
        else:
            md = render_qa(paragraphs, title)
        out_path = OUT_DIR / (src.stem + ".md")
        out_path.write_text(md, encoding="utf-8")
        qa_count = md.count("**") // 2
        print(f"  → {out_path.relative_to(ROOT)}  ({qa_count} Q&A)")

    print(f"\nWrote {sum(1 for _ in OUT_DIR.glob('*.md'))} markdown chapters to {OUT_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
