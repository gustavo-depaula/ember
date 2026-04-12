# Import Book — Public Domain Text to Library Pipeline

Import a public domain Catholic text from the web into the Ember content system as a markdown-sourced book inside a library.

## When to use

When the user asks to import a new book, add a new work to the library, or download a text for the content platform. Typical triggers: "import [book name]", "add [author]'s [work] to the library", "download [title] for Salty".

## Philosophy

We are building a Catholic digital library of spiritual classics. The original-language text is the **canonical source** — translations derive from it, not the other way around. Preserve the author's structure faithfully. Editorial apparatus (footnotes, prefaces) from scholarly editions is worth keeping when it aids understanding.

## Folder Structure

All content lives under `content/libraries/{library-id}/`:

```
content/libraries/{library-id}/
  library.json                      # Library-level metadata
  sources/
    {language-originals}/           # e.g. french-originals/, latin-originals/
      {work-slug}.txt               # Raw downloaded text (one per work)
  books/
    {book-id}/
      book.json                     # Book metadata + TOC
      {lang}/                       # e.g. fr-FR/, en-US/, la/
        {chapter-id}.md             # One markdown file per chapter
```

Key principles:
- **Sources are `.txt`** — raw, faithful text dumps. Never edit these; they're the archive.
- **Chapters are `.md`** — clean markdown, hand-edited. These are the authoring format.
- **Markdown is converted at runtime** using `marked` + `marked-footnote` — no pandoc dependency at build time.
- **One language directory per language** — the original language comes first, translations later.
- **No EPUB packaging** — chapter files ship directly inside `.pray` archives. The app renders them in a WebView with CSS column pagination.

## The Pipeline

### Phase 1 — Research & Download

1. **Find the source.** Search for the work online. Prefer:
   - HTML text sites (livres-mystiques.com, sacred-texts.com, thelatinlibrary.com, wikisource)
   - NOT scanned PDFs (no OCR quality control)
   - Public domain editions (author died 100+ years ago)

2. **Download with `requests` + `BeautifulSoup`.** Use the script at `scripts/crawl-montfort-fr.py` as a template. Critical rules:
   - **Do NOT use Crawl4AI** — it silently drops content. Use `requests` + `BeautifulSoup` with `get_text(separator='\n\n')`.
   - Save as `.txt` files in `sources/{language}-originals/`
   - Use `---` separators between source pages
   - One `.txt` file per work (even if the work spans multiple web pages)

3. **Verify word counts.** Compare against known book lengths. A full treatise should be tens of thousands of words. If the count seems low, the download lost content.

### Phase 2 — Map Structure

4. **Grep for structure markers** in the `.txt` file:
   ```bash
   grep -n 'PARTIE\|ARTICLE\|CHAPITRE\|INTRODUCTION\|APPENDICE\|COMMENTAIRES\|^---$' source.txt
   ```
   This reveals chapter boundaries, section headers, footnote blocks, and page separators.

5. **Define chapters.** Map the text's natural divisions to chapter IDs. Follow the **author's own structure**, not any translator's reorganization. Document the line ranges.

### Phase 3 — Split & Clean

6. **Split with `scripts/extract-lines.sh`:**
   ```bash
   ./scripts/extract-lines.sh source.txt START END output.md
   ```
   One call per chapter. Output directly into the book's language directory.

7. **Hand-clean with parallel background subagents.** Launch **one agent per file** using `run_in_background: true`. Do NOT group multiple files into one agent — a single large agent that fails or gets denied loses all its work, while granular agents let completed files stay done. Launch all agents in a single message for maximum parallelism. Each agent must:

   **Structure:**
   - Add proper `#`/`##`/`###` markdown headings from the raw section headers
   - Part headings as `#`, article/chapter headings as `##`, sub-sections as `###`

   **Text cleanup:**
   - Merge drop-cap artifacts (capital letter alone on a line + rest of word on next line)
   - Fix paragraph breaks (one blank line between paragraphs, remove extras)
   - Remove leading whitespace/indentation from lines
   - Remove site navigation boilerplate, copyright notices, menu text
   - Remove `---` page separator artifacts within chapters
   - Remove `*****` horizontal rule artifacts

   **Footnotes:**
   - Convert inline `(N)` markers to markdown `[^N]` references
   - Extract footnote text from COMMENTAIRES sections
   - Place as `[^N]: note text` at the bottom of each chapter file
   - Remove "COMMENTAIRES" headers and "cliquez sur..." lines

   **Do NOT:**
   - Add YAML frontmatter to chapter files
   - Alter the actual text content
   - Remove Latin quotations or scriptural references
   - Remove editorial prefaces or scholarly annotations

### Phase 4 — Metadata

8. **Create or update `book.json`** with:
   - `id`, `name` (localized), `author` (localized), `description` (localized)
   - `composed` (year the work was written)
   - `languages` array (original language first)
   - `sources` array — provenance for downloaded texts. Each entry: `{ "language": "xx", "url": "https://...", "description": "..." }`
   - `toc` tree matching the chapter file structure
   - Titles in all available languages

9. **The TOC follows the author's structure.** The per-language filtering in the build script means each language can have different chapters — a language only includes chapters that have a source file.

10. **Update `library.json`** if needed — ensure the book ID is listed in the `books` array and, if the library uses a `contents` array, add a `{ "type": "book", "id": "{book-id}" }` entry.

### Phase 5 — Build & Verify

11. **Build:**
    ```bash
    bash scripts/build-libraries.sh
    ```
    The build script copies the shared CSS into each book's language directories, then zips each library into a `.pray` archive and regenerates `registry.json`.

12. **Verify:**
    - Check that the `.pray` file was generated
    - Inspect the zip contents (should have all chapters as `.md` under `books/{book-id}/{lang}/`)
    - Compare word count of built content against source `.txt`
    - Open in the app to spot-check content, TOC navigation, footnotes

## Text Preservation Guidelines

- **The author's words are sacred.** Never "fix" or "modernize" spelling, grammar, or word choice. Montfort wrote "cur" not "coeur" — keep it.
- **Preserve the author's paragraph structure.** Don't merge or split paragraphs.
- **Keep all Latin and scriptural quotations** exactly as they appear.
- **Editor footnotes are scholarly apparatus** — preserve them as markdown footnotes. They add context about textual variants, historical references, and theological nuances.
- **If text seems wrong, check the source website** before changing it. What looks like an error may be period spelling or a faithful transcription of the manuscript.

## Tools & Scripts

| Tool | Location | Purpose |
|------|----------|---------|
| Crawl script template | `scripts/crawl-montfort-fr.py` | BS4-based downloader (adapt per source site) |
| Line extractor | `scripts/extract-lines.sh` | Split `.txt` by line ranges into chapter files |
| Library builder | `scripts/build-libraries.sh` | Copies CSS, zips libraries into `.pray` archives, generates `registry.json` |

## Example: What We Did for Montfort

1. Found 7 works on livres-mystiques.com (public domain French editions)
2. Downloaded with `requests` + `BeautifulSoup` as `.txt` files (~152k words total)
3. Mapped the Traité's structure: 12 chapters across 6,332 lines
4. Split into 12 `.md` files with `extract-lines.sh`
5. Cleaned all 12 in parallel with subagents (headings, footnotes, paragraphs)
6. Updated `book.json` with French canonical TOC
7. Built — `.pray` archive with all chapters intact
