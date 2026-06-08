#!/usr/bin/env python3
"""Build per-chapter dispatch prompts for the audit-book-vs-pdf skill.

Each prompt is a self-contained brief for a background subagent:
md path + PDF path + page range + classification rubric + output path.
"""
import argparse
import json
import sys
from pathlib import Path

PROMPT_TMPL = """# Vision-PDF audit task: {ch_id}

You are auditing one chapter of a markdown translation against an authoritative printed-edition PDF. Read both, classify every substantive difference, and write a findings report. **Do not edit any source file.**

## Inputs

- Markdown (the file under audit): `{md_path}`
- PDF (the witness, NOT the canon): `{pdf_path}`
- PDF page range for this chapter: pages {start}-{end}
- Book: `{book_id}` ({language})

## Step 1 — Alignment sanity check

Use the Read tool to read PDF page {start} (call with `pages: "{start}"`). Confirm it contains the start of this chapter — look for the chapter heading or its opening paragraph and quote it back. Also read the first ~20 lines of `{md_path}` and quote the chapter heading there.

If the two headings don't match, STOP and report the misalignment. Do not proceed to step 2. Do not fabricate findings.

If they match, write a one-line confirmation at the top of your findings file:

> Aligned: PDF page {start} matches md heading "..."

## Step 2 — Read both sources

Read the entire md file (one Read call).

Read the PDF page range. The Read tool accepts at most 20 pages per call — chunk as needed: `pages: "{start}-{plus19}"`, `pages: "{plus20}-{plus39}"`, etc. Read every page in the range; do not skip.

## Step 3 — Classify and report findings

Walk through the chapter paragraph by paragraph. For every **substantive** difference between md and PDF, append one row to a markdown table.

A difference is substantive if it changes the wording, the form of a word, a name, a reference, or the meaning. NOT substantive: line wraps, hyphenation at line ends, page-break artifacts, running headers/footers in the PDF.

Categories (use exactly these strings in the Category column):

| Category | Meaning |
|----------|---------|
| `md-error` | Word/phrase in md is a defect (OCR survivor, dropped char, typo). PDF is correct. |
| `pdf-error` | Word/phrase in PDF is a defect (scan smudge, smear). md is correct. |
| `modernization` | PDF reflects a more modern form (e.g. md `Padre` → PDF `Pai`). |
| `orthography` | Pre/post spelling-reform difference (Portuguese: trema, `idéia`/`ideia`, etc.). |
| `edition-variant` | Name or reference swap (David/Davi, Job/Jó, Santiago/São Tiago, dominga/domingo). |
| `rephrase` | Sentence-level paraphrase preserving meaning. Show enough context to make the change visible. |
| `omission` | Passage present on one side, missing on the other. Note which side omits. |
| `unknown` | Substantive difference you can't classify with confidence. Add a brief note. |

Findings table format:

```
| Para # | Category | MD reads | PDF reads | PDF page | Note |
|--------|----------|----------|-----------|----------|------|
| 3 | md-error | empedernecidos | empederniram | 412 | likely OCR-fused form of "empederniram" |
| 7 | modernization | Padre Nosso | Pai Nosso | 415 |  |
| 12 | rephrase | "afervorar a alma" | "confortar a alma" | 418 | semantic equivalents |
```

Include footnotes and marginalia in your comparison.

## Step 4 — Do NOT edit

You are not authorized to modify {md_path} or any other source file. Your job is to surface findings. The user will review the summary before any edits are applied.

## Project-specific rules
{rules}

## Output

Write the alignment confirmation line, the findings table, and a one-line totals summary to:

`{out_path}`

End the file with a single line: `TOTAL: N findings across K categories.`

If you found zero substantive differences, the table is empty and you write `TOTAL: 0 findings — chapter is clean.`
"""

PT_BR_RULES = """
- The md is derived from the 1951 Frei Leopoldo Pires Martins, OFM edition. The PDF (SAEM "São Pio V" reprint) is a modernized reprint of the same translation. The reprint is the **witness**, not the canon.
- Do NOT flag pre-1971 Portuguese orthography in the md as `md-error`: `idéia`, `freqüente`, `sòmente`, tremas (`ü`), accented adverbs (`àvidamente`), `pára` (verb), etc. are correct for the canonical edition. Only classify these as `orthography` findings; do not classify them as defects.
- Common edition variants the reprint applies (classify as `edition-variant` or `modernization`, not errors): `Padre` → `Pai` (when referring to God the Father), `Madre` → `Mãe` (when referring to the Church or Mary), `David` → `Davi`, `Job` → `Jó`, `Santiago` → `São Tiago`, `dominga` → `domingo`.
- `Santo Padre` (the Pope) is NOT modernized to `Santo Pai` — if the PDF still reads `Santo Padre`, that's not a finding.
- Include footnotes, marginalia, and editorial introductions in your comparison. Note their location.
- Scripture references (e.g. "Mt. 5,3") that differ in formatting only (commas vs colons) are NOT findings unless the actual verse pointer changes.
"""

GENERIC_RULES = """
- The PDF is the witness, not the canon. Report differences; do not invent fixes.
- Include footnotes and marginalia.
- Treat formatting-only differences (line wrap, hyphenation, page breaks) as NOT substantive.
"""

RULESETS = {
    "pt-BR": PT_BR_RULES,
    "generic": GENERIC_RULES,
}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--book", required=True, help="path to book.json")
    ap.add_argument("--lang", required=True, help="language directory under the book (e.g. pt-BR)")
    ap.add_argument("--pdf", required=True, help="path to the PDF to compare against")
    ap.add_argument("--pages", required=True, help='JSON file: {"chapter_id": [start, end], ...}')
    ap.add_argument("--out", required=True, help="output directory (will create prompts/ and findings/)")
    ap.add_argument("--ruleset", default="pt-BR", choices=list(RULESETS.keys()))
    args = ap.parse_args()

    book_path = Path(args.book).resolve()
    pdf_path = Path(args.pdf).resolve()
    pages_path = Path(args.pages).resolve()
    out_dir = Path(args.out).resolve()

    if not book_path.exists():
        sys.exit(f"ERROR: book.json not found: {book_path}")
    if not pdf_path.exists():
        sys.exit(f"ERROR: PDF not found: {pdf_path}")
    if not pages_path.exists():
        sys.exit(f"ERROR: pages.json not found: {pages_path}")

    book = json.load(open(book_path, encoding="utf-8"))
    pages = json.load(open(pages_path, encoding="utf-8"))
    book_id = book.get("id", book_path.parent.name)
    book_dir = book_path.parent
    lang_dir = book_dir / args.lang

    if not lang_dir.is_dir():
        sys.exit(f"ERROR: language directory not found: {lang_dir}")

    (out_dir / "prompts").mkdir(parents=True, exist_ok=True)
    (out_dir / "findings").mkdir(parents=True, exist_ok=True)

    rules = RULESETS[args.ruleset]
    written, skipped = 0, []
    for ch_id, rng in pages.items():
        if not (isinstance(rng, list) and len(rng) == 2):
            skipped.append((ch_id, "invalid range"))
            continue
        start, end = int(rng[0]), int(rng[1])
        md_path = (lang_dir / f"{ch_id}.md").resolve()
        if not md_path.exists():
            skipped.append((ch_id, f"md missing: {md_path}"))
            continue
        prompt = PROMPT_TMPL.format(
            ch_id=ch_id,
            md_path=md_path,
            pdf_path=pdf_path,
            start=start,
            end=end,
            plus19=start + 19,
            plus20=start + 20,
            plus39=start + 39,
            book_id=book_id,
            language=args.lang,
            rules=rules,
            out_path=(out_dir / "findings" / f"{ch_id}.md").resolve(),
        )
        (out_dir / "prompts" / f"{ch_id}.md").write_text(prompt, encoding="utf-8")
        written += 1

    print(f"Wrote {written} prompt(s) to {out_dir}/prompts/")
    if skipped:
        print(f"Skipped {len(skipped)}:", file=sys.stderr)
        for ch, why in skipped:
            print(f"  {ch}: {why}", file=sys.stderr)
        sys.exit(1 if written == 0 else 0)


if __name__ == "__main__":
    main()
