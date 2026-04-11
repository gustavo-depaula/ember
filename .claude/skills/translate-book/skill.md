# Translate Book — Original-Language to Target-Language Translation Pipeline

Translate a book in the Ember content system from its original-language markdown source into one or more target languages.

## When to use

When the user asks to translate a book, add a new language to an existing book, or re-translate a book from its originals. Typical triggers: "translate [book] to [language]", "add English to [book]", "re-translate [book] from the French".

## Philosophy

The original-language text is the **canonical source** — all translations derive from it, never from another translation. Translations should be faithful to the author's meaning and tone while being accessible to modern readers of the target language. Each translation maintains its own journal of key terms and decisions to ensure internal consistency across chapters.

## Folder Structure

Books live under `content/libraries/{library-id}/books/{book-id}/`:

```
{book-id}/
  book.json                     # Metadata + TOC (already exists)
  {original-lang}/              # e.g. fr-FR/ — the canonical source
    preface.md
    introduction.md
    part-1-ch-1.md
    ...
  {target-lang}/                # e.g. en-US/, pt-BR/
    translation-journal.md      # Term glossary + decision log
    preface.md                  # Translated chapters (same filenames)
    introduction.md
    part-1-ch-1.md
    ...
    style.css                   # Shared stylesheet (copied by build)
```

Key principles:
- **One `.md` file per chapter**, same filename as the original
- **Translation journal** lives alongside the chapter files — it's a working document, not shipped content
- **`book.json` already defines the TOC** — chapter IDs and localized titles are there. Update it if adding a new language.

## The Pipeline

### Phase 1 — Preparation

1. **Read `book.json`** to understand the book's structure, existing languages, and TOC. Note which chapter IDs exist.

2. **Survey the original-language files.** List all `.md` files in the source directory. Read a few to understand the author's style, structure, and any patterns (numbered paragraphs, Latin quotations, footnotes, blockquotes).

3. **Identify footnote policy.** Original-language files may contain:
   - **Author footnotes** — part of the work. Translate these.
   - **Editor footnotes** — scholarly apparatus added by a later editor. Ask the user whether to keep, drop, or summarize these. Default: drop editor footnotes, since the translation itself can clarify what the editor was explaining.

4. **Clean up the target directory.** If re-translating, delete existing translation files (`.html` or `.md`) but keep `style.css`.

### Phase 2 — Journal Setup

5. **Create `translation-journal.md`** in the target language directory. Seed it with:

   ```markdown
   # Translation Journal — {Book Title} ({target-lang})

   Source: {original-lang}
   Target: {target-lang}

   ## Key Terms

   | French | English | Notes |
   |--------|---------|-------|
   | dévotion | devotion | |
   | la Sainte Vierge | the Blessed Virgin | |
   | ... | ... | ... |

   ## Translation Decisions

   - [decision log entries added as translation progresses]
   ```

   Pre-populate the terms table with obvious theological and structural terms from a quick scan of the source. This table grows throughout the translation.

### Phase 3 — Translation

6. **Translate one file at a time, in TOC order.** For each chapter:

   a. **Read the full source file.**
   b. **Translate** following the guidelines below.
   c. **Write the `.md` file** to the target language directory (same filename).
   d. **Update the journal** with any new terms, expressions, or decisions.

7. **Use background sub-agents for parallel languages.** When translating into multiple languages at once, launch one background agent per language. Each agent works independently through the full file list. Give each agent:
   - The full list of source files in order
   - The translation guidelines
   - Instructions to create and maintain the journal

### Phase 4 — Metadata & Build

8. **Update `book.json`:**
   - Add the new language code to the `languages` array
   - Ensure all TOC entries have titles in the new language
   - Ensure `name`, `author`, and `description` have entries for the new language

9. **Build and verify:**
   ```bash
   bash scripts/build-books.sh
   ```
   Check that the `.pray` archive includes the new language's chapter files.

## Translation Guidelines

### Tone & Fidelity

- **Faithful but accessible.** Preserve the author's meaning, theological precision, and emotional register. If the author is passionate and rhetorical, the translation should be too. If the author is measured and scholarly, match that.
- **Not archaic, not casual.** Aim for the register of a well-edited modern Catholic book — clear, dignified, warm.
- **Preserve the author's structure.** Same paragraphs, same section breaks, same numbered items. Don't merge or split.

### Latin & Scripture

- **Keep Latin phrases inline** with the translation following in the target language, matching the original's pattern.
- **Scripture references** (book, chapter, verse) preserved as-is.
- **Liturgical formulas** (e.g., Ave Maria, Magnificat) may be kept in Latin or given in the target language depending on how recognizable they are. Use judgment.

### Footnotes

- **Drop editor footnotes** unless the user explicitly asks to keep them.
- **Add translator notes sparingly** — only when a modern reader genuinely needs context to understand the text. Use markdown footnote syntax:
  ```
  [^1]: *Translator's note:* explanation here.
  ```
  For Portuguese: `*Nota do tradutor:*`

### Proper Names & Terms

- **Saints' names** in the target language's standard form (e.g., "Saint François de Sales" → "St. Francis de Sales" / "São Francisco de Sales").
- **Place names** generally kept in their original form unless there's a well-known English/Portuguese equivalent.
- **Outdated terms** modernized only when the original would be confusing or offensive (e.g., "mahométans" → "Muslims" / "muçulmanos"). Note such changes in the journal.

### Markdown Format

- `#` for part/major headings, `##` for article/chapter headings, `###` for sub-sections
- `>` for blockquotes (prayers, extended quotations)
- `*italics*` for Latin phrases, book titles, emphasis matching the source
- `**bold**` only where the source uses it
- Numbered paragraphs preserved as-is (e.g., `**14.** Text...`)
- No YAML frontmatter

## The Translation Journal

The journal is the translator's working memory. It ensures consistency across what may be hours of translation work, especially when using sub-agents that process files sequentially. It should contain:

1. **Key Terms table** — the canonical rendering of recurring theological, devotional, and structural terms. Add new rows as they appear.
2. **Translation Decisions** — dated entries explaining non-obvious choices: why a term was rendered a certain way, when something was modernized, when a translator note was added and why.
3. **Expressions & Idioms** — French (or other source language) expressions that don't translate literally, with the chosen rendering and rationale.

The journal is a reference document. It ships with the book files but is not rendered in the app.

## Example: True Devotion (Montfort)

1. Source: 12 French `.md` files in `fr-FR/` (preface through consecration)
2. Created translation journals for en-US and pt-BR
3. Launched two background agents (one per language), each translating all 12 files sequentially
4. Dropped all 1891 editor footnotes (by Canon Didiot) — not by Montfort
5. Added translator notes only where needed (e.g., explaining a Latin prayer's attribution)
6. Modernized "mahométans" → "Muslims" / "muçulmanos", noted in journals
7. Updated `book.json` with new language entries and TOC titles
8. Built with `build-books.sh`, verified `.pray` archive contents
