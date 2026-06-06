---
name: audit-book-vs-pdf
description: Audit a book's translation against a printed-edition PDF by reading PDF pages with vision; surfaces md OCR errors, edition variants, modernizations, orthography drift, and sentence-level rephrasings without trusting a second OCR pass.
---

# Audit Book vs PDF — Vision-Based Edition Comparison

Compare an existing chapter-split markdown translation against an authoritative printed-edition PDF, by reading the PDF pages directly (Read tool renders them visually) instead of OCRing first. Every substantive difference is classified and reported; the user decides what to apply.

## When to use

User asks to "audit X against this PDF", "compare our markdown to that printed edition", "find all the differences between our chapters and that book", or proposes a "vision-PDF" / "page-by-page" comparison. Typical context: our md was built from a different OCR/source than the PDF being compared, and an OCR-vs-OCR diff is either too noisy or has already been done.

Do NOT use this skill for:

- New imports (use `import-book` instead)
- Cross-language QA of an already-imported book (use `review-book-translation` instead)
- OCR-vs-OCR audits (cheaper; write an ad-hoc difflib script)

## Philosophy

OCR is noisy; vision-reading a PDF page is not. Trade compute for signal. **The PDF is the witness, not the canon** — its differences from our md may be (1) defects in our md, (2) defects in the PDF edition, (3) deliberate editorial choices in either direction. The audit reports; the user decides what to apply. The skill never auto-edits source files during the audit phase.

## Folder layout (per run)

```
/tmp/audit/vision/
  pages.json                       # input: chapterID → [startPage, endPage] in the PDF
  prompts/{chapter}.md             # one dispatch prompt per chapter, built by prepare.py
  findings/{chapter}.md            # subagent output — diff table for that chapter
  summary.md                       # aggregated, classified report
```

## The Pipeline

### Phase 0 — Inputs

You need:

- A PDF with a clear text layer OR readable scans (Read tool will render pages as images either way; max 20 pages per Read call).
- A book directory: `content/books/{book-id}/` containing `book.json` and the language directory you're auditing (e.g. `pt-BR/`).
- A chapter → PDF page-range mapping. Either:
  - **User provides** a JSON file mapping chapter IDs to `[startPage, endPage]`, OR
  - **You derive it**: read the PDF's TOC pages, parse, build the mapping, and present it for the user to confirm before dispatching. PDF page numbers ≠ printed page numbers — front matter shifts them. Always verify on at least one known chapter heading.

### Phase 1 — Build the dispatch plan

Run the helper script that ships with this skill:

```bash
python3 .claude/skills/audit-book-vs-pdf/prepare.py \
  --book content/books/{book-id}/book.json \
  --lang pt-BR \
  --pdf /path/to/edition.pdf \
  --pages /tmp/audit/vision/pages.json \
  --out /tmp/audit/vision \
  --ruleset pt-BR
```

It writes one `prompts/{chapter}.md` per chapter, each containing the subagent's complete brief (md path, PDF path, page range, classification rubric, output path, project-specific rules).

### Phase 2 — Dispatch parallel subagents

Launch one background subagent per chapter (Agent tool, `run_in_background: true`, `subagent_type: general-purpose`, `model: sonnet`). Send all dispatches in a single message for maximum parallelism. The agent's prompt = the contents of the matching `prompts/{chapter}.md` file. Each agent must:

1. Confirm the page range opens with the expected chapter heading. If it doesn't, STOP and report the misalignment — do not fabricate findings.
2. Read the full PDF page range (chunking by ≤20 pages per Read call when needed) and the full md file.
3. Walk paragraph-by-paragraph and report every substantive difference (NOT mere line wrap, hyphenation, or page-break artifacts), classified as one of:
   - **md-error** — md word/phrase is a defect (OCR survivor, dropped character, typo)
   - **pdf-error** — PDF word/phrase is a defect (scan smudge, smear); the md is correct
   - **modernization** — PDF reflects a more modern form than md (`Padre`/md vs `Pai`/PDF)
   - **orthography** — pre/post spelling-reform difference (Portuguese: `idéia`/`ideia`, trema, adverb accents)
   - **edition-variant** — name or reference swap (David/Davi, Job/Jó, Santiago/São Tiago)
   - **rephrase** — sentence-level paraphrase preserving meaning
   - **omission** — passage present on one side, missing on the other (note direction)
   - **unknown** — substantive difference the agent can't classify confidently
4. Write the findings as a markdown table to the path given in the prompt. **Do NOT edit any source file.**

Use `model: sonnet` — this is pattern-matching plus vision, not creative work, and the per-chapter fanout is expensive on opus.

### Phase 3 — Aggregate

Once every chapter's `findings/{chapter}.md` exists, the main agent reads them and writes `summary.md` grouped by category:

```markdown
# Audit summary: {book-id} vs {edition name}

## md-error  (N total, K unique words)
| chapter | md form | pdf form | context | pdf page |
| ... |

## modernization  (N total)
| chapter | md form | pdf form | count |
| ... |

## orthography
## edition-variant
## rephrase                          # only the first 30 examples; full list lives in findings/
## omission
## pdf-error
## unknown
```

Present the summary to the user. Ask which categories to act on.

### Phase 4 — Apply (only when user picks categories)

Per category:

- **md-error** — dispatch parallel fix-agents (one per chapter with findings). Each applies edits with full citations and re-reads the PDF excerpt to confirm.
- **modernization** / **orthography** / **edition-variant** — usually scriptable. Build a regex/lookup table from the findings and apply across all chapters; spot-check 5–10 instances against the PDF.
- **rephrase** — case-by-case; rarely auto-applied unless the user wants full edition-style adaptation.
- **omission** / **pdf-error** / **unknown** — case-by-case; main agent reviews with the user.

### Phase 5 — Verify

```bash
pnpm build:corpus
```

Spot-check the rebuilt blobs and open one or two chapters in the app.

## Project-specific rules

The `prepare.py` helper supports a `--ruleset` flag that injects per-language guidance into every subagent prompt. The bundled `pt-BR` ruleset:

- Tells agents NOT to flag pre-1971 orthography (`idéia`, `freqüente`, trema, adverbs with accents) as defects — flag only when the md has a defect *beyond* the spelling reform.
- Reminds agents that `Padre`→`Pai`, `Madre`→`Mãe`, `David`→`Davi`, `Job`→`Jó`, `Santiago`→`São Tiago` are `edition-variant` or `modernization`, not errors.
- Tells agents to include footnotes and marginalia in the comparison.
- Reinforces that the reprint PDF is the witness, not the canon — the 1951 first edition is canonical.

Add new rulesets by editing `prepare.py`. Keep them concise; long rule blocks dilute the subagent's attention.

## Common failure modes

- **PDF page numbering ≠ printed page numbers.** Front matter and roman-numeral preface pages shift the offset. Confirm the mapping against a known chapter before dispatching.
- **Vision skips marginalia / footnotes.** Tell the agent explicitly to include them (the bundled prompt does).
- **Subagents over-correct toward the PDF.** The reprint is not canon. Reinforce the do-no-harm clause in every dispatch.
- **Token cost scales with PDF pages.** ~3-page chapters are cheap; ~80-page sacrament chapters are expensive. If a chapter has more than ~30 PDF pages, split it into sub-ranges and dispatch one agent per sub-range. Or batch several tiny chapters into one agent.
- **Diff-only output drifts silently.** Every prompt requires the agent to start with a 1-line alignment confirmation; without it, a misaligned page range produces plausible but meaningless findings.
- **Page-mapping mistakes invalidate a whole chapter.** Pilot on one short chapter before fanning out.

## Concrete example: Catecismo Romano vs SAEM Pires Martins reprint

- Book: `content/books/trent-catechism/` (42 chapters, pt-BR derived from a 1951 Pires Martins edition).
- Source PDF: SAEM "São Pio V" reprint, 728 pages, ClearScan layer.
- Prior audit (PR #214): OCR-vs-OCR diff caught 9 md-errors but missed modernizations and rephrasings that are invisible to a noisy text diff.
- Vision-PDF audit goal: capture every SAEM editorial decision (lexical modernizations, name swaps, sentence rephrasings, orthography drift) so the user can decide on a coherent adaptation strategy.
- Pilot scope: `creed-intro` (~3 PDF pages) — confirms signal quality before fanning out to all 42 chapters.

Example `pages.json` row:

```json
{ "creed-intro": [27, 30], "creed-01": [31, 75], "creed-02": [76, 120] }
```

## Tools & files in this skill

| File | Purpose |
|------|---------|
| `SKILL.md` | This document — the workflow |
| `prepare.py` | Builds one dispatch prompt per chapter from `book.json` + `pages.json` |
