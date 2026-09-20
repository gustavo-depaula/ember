---
name: review-book-translation
description: Audit book translations across languages for completeness, structure, and objective defects.
---

# Review Book Translation — Cross-Language Quality Audit

Review an existing book translation by comparing each chapter across all languages (original + translations) to catch completeness gaps, formatting inconsistencies, and language-specific errors.

## When to use

When the user asks to review, audit, or QA a book's translations. Typical triggers: "review the translation", "check [book] translations", "compare languages for [book]", "QA the [language] translation".

## Philosophy

A good translation review is **mechanical and exhaustive** — it checks every file, not a sample. The original-language text is the canonical source; every section, paragraph, and inline quote in the original must have a counterpart in each translation. The review does not judge translation quality or style choices (those are subjective), but it does catch **objective defects**: missing content, broken formatting, wrong references, encoding issues, and convention violations.

## What to Check

### 1. Completeness

The most important check. For each chapter file, compare the original against each translation:

- **Same number of major sections** (e.g., Punto I/II/III → Point I/II/III → Ponto I/II/III)
- **Same number of prayer/affection sections** (Affetti e preghiere → Affections and Prayers → Afetos e Orações)
- **No missing paragraphs** — count paragraphs per section and flag mismatches
- **Author parentheticals preserved** — personal notes, asides, and editorial remarks by the author (not editor footnotes) must appear in all translations
- **Inline Latin quotes present** — every Latin phrase in the original should appear in all translations

### 2. Structure & Headings

- Heading hierarchy matches (# for title, ## for sections)
- Section heading translations are correct and consistent across all chapters:
  - Italian "Punto I" → English "Point I" → Portuguese "Ponto I"
  - Italian "Affetti e preghiere" → English "Affections and Prayers" → Portuguese "Afetos e Orações"
- No YAML frontmatter

### 3. Footnotes

- Editor footnotes (`[^N]` markers and definitions) must be **removed** in translations (unless the user explicitly asked to keep them)
- Author footnotes should be **preserved** if they exist in the original

### 4. Latin & Scripture

- Latin phrases preserved inline in *italics* in all translations
- Scripture references preserved as-is (book, chapter, verse)
- Bible book abbreviations correct for each language (e.g., "Iob" in Latin → "Job" in English → "Jó" in Portuguese, NOT "Jo" which is João/John)

### 5. Language-Specific Conventions

**Portuguese (pt-BR):**
- Proper diacritics/accents throughout (ã, é, ç, õ, í, ô, ê, á, à, ú) — Portuguese without accents is broken Portuguese
- Saints' names in Portuguese forms (Santo Agostinho, São Tomás, São Bernardo)

**English (en-US):**
- Saints' names in standard English forms (St. Augustine, St. Thomas, St. Bernard)

**All languages:**
- Proper names from the original preserved (not replaced with generic terms like "a saint" or "an author")
- No typos or malformed words

### 6. Markdown Format

- `>` for blockquotes (prayers, extended quotations)
- `*italics*` for Latin phrases
- Consistent formatting across all chapters in the same language

## The Pipeline

### Phase 1 — Inventory

1. **Read `book.json`** to get the TOC, languages, and total chapter count.
2. **List files** in each language directory to confirm all chapters exist.
3. **Flag any missing files** — every chapter in the TOC must have a corresponding `.md` file in every language listed in `languages`.

### Phase 2 — Parallel Review

4. **Launch parallel review agents**, one per batch of 4–6 chapters. Each agent:

   a. For each chapter in its batch, reads all language versions (original + translations).
   b. Checks all items from the "What to Check" list above.
   c. Reports **only issues found** — clean files get a one-word "clean" verdict.
   d. For each issue, reports: file name, language, issue type, and what's wrong (with line references when possible).

   **Batching guidance:**
   - For books with ≤ 15 chapters: 3 agents (5 chapters each)
   - For books with 16–30 chapters: 5–6 agents
   - For books with 30+ chapters: 7–8 agents (4–5 chapters each)
   - Use `model: sonnet` for review agents to save cost — review is pattern-matching, not creative work

### Phase 3 — Consolidate & Report

5. **Collect all agent results** and compile a single report organized by issue type:

   ```markdown
   ## Completeness Issues
   | File | Language | What's Missing |
   |------|----------|----------------|

   ## Diacritics / Encoding Issues
   | File | Language | Word | Fix |
   |------|----------|------|-----|

   ## Wrong References
   | File | Language | Reference | Fix |
   |------|----------|-----------|-----|

   ## Typos
   | File | Language | Typo | Fix |
   |------|----------|------|-----|

   ## Formatting Issues
   | File | Language | Issue |
   |------|----------|-------|
   ```

6. **Present the report** to the user and ask whether to fix the issues.

### Fidelity review (when asked to go beyond the mechanical audit)

The checklist above cannot see a fluent sentence that says the wrong thing. When the task is fidelity, not just completeness:

- **Make the passes differ in kind.** A clause-by-clause bilingual read, a source-blind cold read of the target, a pass over function words and headings only (prepositions, articles, `este`/`aquele`, conjunctions, possessive `sua`, `consigo` vs `com ele`), and a spelling-only sweep. Two clean rounds of the same shape measure reviewer agreement, not correctness; after a clean round, give the next one a category never yet swept.
- **Make reviewers show their work.** Require the target-language rendering quoted beside every item reported as checked — a bare verdict over a list hides wrong renderings. Check each proposed fix against the source as rigorously as the finding, above all fixes from a source-blind reader, which propose false friends.
- **Run the sweeps reading cannot.** A per-paragraph term-frequency diff against the journal's Key Terms table, in both directions, writing every corrected term back into the table; in dialogue, a turn-by-turn addressee trace for tu/vós.
- **List where the target must commit and the source is open** — gender of a relative's referent, pronoun antecedent, adversative connector, tu/vós — and justify each from context. Bilingual passes read these as matching and monolingual passes read them as fluent, so both miss them.
- **Verify the journal itself each round.** Grep every falsifiable claim in `translation-journal.md` (both columns of each Key Terms row, quoted forms, counts) against the chapter files. Reviewers treat the journal as a do-not-flag list, so a false row silently exempts text nobody checked.
- **Record rejected findings** in `translation-journal.md`, with the source line and the reasoning, in the same commit that decides them, and pass that reasoning (not just "don't flag X") into later reviewer prompts. The next round reads only that file and re-raises whatever is unrecorded.

### Phase 4 — Fix (if requested)

7. **Launch parallel fix agents**, one per batch of 5 files in the affected language. Each agent:
   - Reads the file
   - Applies all fixes for that file (diacritics, missing content, typos, references)
   - Writes the corrected file
   - For missing content: reads the original source and en-US (if available) to translate the missing passage

8. **Update the translation journal** to reflect any new decisions or corrections.

9. **Build and verify:**
   ```bash
   pnpm build:corpus
   ```

## Example: Apparecchio alla Morte Review

1. Book has 38 chapters (dedica, intento-opera, 36 considerazioni) in 3 languages (it, en-US, pt-BR)
2. Launched 8 parallel review agents (5 chapters each, last batch 3)
3. Found:
   - All 38 pt-BR files missing proper Portuguese diacritics (systematic encoding issue)
   - 5 missing content passages (author parentheticals dropped during translation)
   - 3 wrong Bible abbreviations (Jo instead of Jó for Book of Job)
   - 2 typos, 1 missing Latin phrase in en-US
4. Launched 9 parallel fix agents (8 for pt-BR diacritics + content, 1 for en-US)
5. Updated translation journal, rebuilt corpus blobs (`pnpm build:corpus`)
