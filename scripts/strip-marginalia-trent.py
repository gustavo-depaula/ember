#!/usr/bin/env python3
"""Strip marginalia from the 3 large pt-BR sacrament chapters and add canonical # headings.

After preclean-trent-pt-large.py reflowed paragraphs (each = one line), each paragraph
typically starts with marginalia text fused before a `[N]` marker. Pattern:

    <marginalia> [N] <body text>

where <marginalia> is short (10-50 chars), often dash-prefixed, OCR-mangled. The body
starts at `[N]`. We strip everything before `[N]` to leave just `[N] <body>`.

Also:
- Replace the source's top `CAPITULO XYZ\nDo Sacramento da X` with the canonical
  `# Capítulo N — Do Sacramento da X` heading
- Strip residual footnote-block lines that my prior pass missed (typically lines of
  the form `\d+) text — \d+) text — ...` or `<orig-page-number> Catecismo Romano. <part>`)
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PT_DIR = ROOT / "content" / "libraries" / "base" / "books" / "trent-catechism" / "pt-BR"

# (filename, canonical_heading)
TARGETS = [
    (
        "sacrament-baptism.md",
        '# Capítulo II — Do Batismo',
    ),
    (
        "sacrament-eucharist.md",
        '# Capítulo IV — Da Eucaristia',
    ),
    (
        "sacrament-penance.md",
        '# Capítulo V — Da Penitência',
    ),
]

# Lines that are clearly OCR'd footnote/citation blocks landing mid-text.
# Examples:
#   `2, 11-12; Gal 3, 27; Eph 5, 27; Col 2, 11-12. — 81) * Acerca da praxe...`
#   `Iv. Da Eucaristia 65 78-79. — V. Da Penitência 65 12 313`
#   `224 * Catecismo Romano. 1 Parte: Dos Sacramentos`
#   `“Comunitário” é o que diz respeito à comunidade. Os adjetivos...`
RESIDUAL_FOOTNOTE_RES = [
    # Page-header artifact: <num> [* | ] Catecismo Romano [...]
    re.compile(r"^\s*\d+\s+\*?\s*Catecismo Romano[^\n]*$", re.M),
    re.compile(r"^\s*Catecismo Romano[^\n]*$", re.M),
    # Running running-header-foot: "Iv. Da Eucaristia 65 78-79. — V. Da Penitência 65 12 313"
    re.compile(r"^\s*[IVX]+\.\s+(Da|Do|Dos|Das)\s+\w[^\n]*\d+[^\n]*$", re.M),
    # Bibliographic citation chunks that begin with "<num>, <num>" and contain — \d+) markers
    # — only if the line is dominated by such citations
    re.compile(
        r"^\s*\d+[,\s]\d+(?:[\-–]\d+)?[;\s]+(?:[A-Z][a-z]+\s+\d+,?\s*\d+(?:[\-–]\d+)?[;,]?\s*){1,4}"
        r"(?:[—\-]\s*\d{1,4}\)\s+[^\n]*)+$",
        re.M,
    ),
]

# Definite-marginalia patterns at start of paragraph BEFORE [N]:
# - The body always starts at `[N] ` where N is a digit
# - Anything before is marginalia, regardless of content
PARA_MARGIN_RE = re.compile(r"^[^\[]{1,80}\[(\d+)\]\s+", re.M)


def strip_marginalia(text: str) -> str:
    """For each paragraph (line), if it contains a `[N]` marker, strip everything before it."""
    lines = text.split("\n")
    cleaned: list[str] = []
    for line in lines:
        m = re.search(r"\[(\d+)\]\s*", line)
        if m and m.start() <= 80:
            # Marginalia is everything before [N]
            # Replace with just [N] body
            line = line[m.start() :]
        cleaned.append(line)
    return "\n".join(cleaned)


def strip_residual_footnotes(text: str) -> str:
    for r in RESIDUAL_FOOTNOTE_RES:
        text = r.sub("", text)
    return text


def replace_top_header(text: str, canonical_heading: str) -> str:
    """Replace 'CAPITULO XYZ\\n\\nDo Sacramento da X' with canonical heading."""
    lines = text.split("\n")
    out: list[str] = [canonical_heading, ""]
    skipped = 0
    # Skip leading lines until we hit the body (paragraph starting with [1] OR a non-CAPITULO/non-empty line)
    i = 0
    while i < len(lines) and skipped < 8:
        ln = lines[i].strip()
        if ln == "":
            i += 1
            continue
        # Skip CAPITULO header lines and "Do Sacramento da X" subtitle line
        if (
            re.match(r"^CAPITULO\s+(PRIMEIRO|SEGUNDO|TERCEIRO|QUARTO|QUINTO|SEXTO|SÉTIMO|OITAVO|NONO|DÉCIMO|UNDÉCIMO|DUODÉCIMO)\s*$", ln)
            or re.match(r"^Do (Sacramento )?(Batismo|Eucaristia|Penitência)\.?$", ln)
            or re.match(r"^Da (Sacramento )?(Eucaristia|Penitência)\.?$", ln)
            or re.match(r"^Do Sacramento d[aoe]\s+\w+\.?$", ln)
        ):
            i += 1
            skipped += 1
            continue
        break
    # Append remainder
    out.extend(lines[i:])
    # Collapse multi-blank lines
    text = "\n".join(out)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def main() -> None:
    for fname, heading in TARGETS:
        path = PT_DIR / fname
        text = path.read_text(encoding="utf-8")
        original_size = len(text)
        text = strip_residual_footnotes(text)
        text = strip_marginalia(text)
        text = replace_top_header(text, heading)
        # Final whitespace pass
        text = re.sub(r"\n{3,}", "\n\n", text).strip() + "\n"
        path.write_text(text, encoding="utf-8")
        print(f"{fname}: {original_size:>7,} → {len(text):>7,} chars")


if __name__ == "__main__":
    main()
