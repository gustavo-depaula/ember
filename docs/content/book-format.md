# Book Format

The content system for books and libraries in Ember — spiritual classics, prayer collections, and hybrid works. Markdown/HTML source files read directly from disk for prose rendering; manifest-based prayer collections for devotional content. One folder tree, one manifest type, one discovery system.

> See `docs/content/spiritual-books.md` for the full wishlist of titles. See `docs/features/prayer-books.md` for the library feature. See `docs/ARCHITECTURE.md` for the library system overview.

---

## Concept

Ember's content falls into three categories: structured short content (prayers, Bible verses, CCC paragraphs), long-form prose (spiritual classics, Church documents), and devotional collections (libraries, devocionários). The book format is the **unified system** for the latter two — and any hybrid of them.

A library in this system can have any combination of:

- **Books** — long-form readable content (`.md` or `.html` chapter files, read directly from disk)
- **Practices** — schedulable units for the plan of life (standard practice manifests)
- **Prayers** — reusable prayer text assets referenced by flows
- **Chapters** — read-only native content (saint bios, formation guides)

A pure spiritual classic like *True Devotion* has only books. A library like *Catholic Daily Prayers* has only practices and prayers. A hybrid like *Montfort Spirituality* has books, practices, prayers, and chapters.

### Design goals

- Work bundled now, CDN-downloadable later
- Stay human-editable (Markdown for prose, JSON for everything else)
- Render in a WebView with CSS column pagination
- One folder per library — books, prayers, and practices colocated
- One manifest type, one discovery system, one practice-export mechanism

---

## Directory Structure

All libraries live in `content/libraries/`. A library is a self-contained folder — the same `.pray` package format used for all content. Books (prose) are nested under `books/` within the library directory.

### Pure prose (Montfort Spirituality — books only)

```
content/libraries/montfort-spirituality/
  library.json
  books/
    montfort-true-devotion/
      book.json
      fr-FR/
        preface.md
        introduction.md
        part-1.md
      en-US/
        preface.md
        introduction.md
        part-1.md
      pt-BR/
        preface.md
        introduction.md
        part-1.md
    montfort-secret-rosary/
      book.json
      en-US/
        rose-01.md
  chapters/
    about-montfort/
      chapter.json
      content.json
  practices/
    total-consecration/
      manifest.json
      flows/default.json
  prayers/
    act-of-consecration.json
```

### Pure practice library (Ember Default)

```
content/libraries/ember-default/
  library.json
  prayers/
    sign-of-cross.json
    morning-offering.json
    our-father.json
  practices/
    morning-offering/
      manifest.json
      flows/default.json
    rosary/
      manifest.json
      flows/default.json
```

### Colocated practices

Practices live in `practices/` inside the library folder. They use the exact same `PracticeManifest` / `FlowDefinition` / track format as any practice in `content/practices/`. No new format.

ID convention: `book::{libraryId}::{practiceId}` (e.g., `book::montfort-spirituality::total-consecration`).

---

## `.pray` Package Format

A `.pray` file is a zip containing the library's content. The `build-libraries.sh` script copies the CSS and zips everything.

### Structure

```
library.pray (zip)
├── library.json
├── ember-book.css              # Base stylesheet for book rendering
├── books/
│   └── montfort-true-devotion/
│       ├── book.json
│       ├── fr-FR/
│       │   ├── style.css       # Copy of ember-book.css
│       │   └── preface.md
│       └── en-US/
│           ├── style.css
│           └── preface.md
├── prayers/
├── practices/
└── chapters/
```

### Chapter files

Chapters are `.md` (primary) or `.html` (supported fallback):

- **`.md`** — converted at runtime using `marked` + `marked-footnote`, then rendered in WebView
- **`.html`** — rendered directly in WebView with `ember-book.css` applied

The reader tries `.html` first, falls back to `.md`.

### File naming conventions

- Chapter filenames match the TOC leaf node `id`: `ch-01.md`, `preface.md`, `part-1.md`
- All lowercase, kebab-case
- Extension is `.md` or `.html`

### Stylesheet

`ember-book.css` is the base stylesheet included in every `.pray` package. It provides:

- Light/dark theme via CSS variables (`--bg`, `--text`, `--heading`, etc.)
- Typography using EB Garamond and Cinzel fonts
- Reader-configurable variables: `--reader-font-size`, `--reader-line-height`, `--reader-text-align`, `--reader-margin`
- CSS column pagination

Books with unique needs can include additional per-book CSS overrides.

---

## Content Model

### Manifests

Two manifest levels:

- **`library.json`** — the outer container (the `.pray` package). Lists what the library contains.
- **`book.json`** — one per book inside the library. Holds the book's TOC and metadata.

```typescript
type Library = {
  id: string                        // Unique ID, kebab-case, matches folder name
  version: string                   // Semver
  name: LocalizedText
  languages: string[]               // e.g. ["en-US", "pt-BR"]
  practices: string[]               // Practice IDs (match dirs in practices/)
  prayers: string[]                 // Prayer asset IDs (match files in prayers/)

  description?: LocalizedText
  author?: LocalizedText
  tags?: string[]
  icon?: string
  image?: string
  chapters?: string[]               // Chapter IDs (match dirs in chapters/)
  books?: string[]                  // Book IDs (match dirs in books/)
  contents?: ContentEntry[]         // Unified display ordering (interleaves all types)
  defaults?: { autoSeed: boolean }  // If true, seed practices into plan on install
}

type ContentEntry = { type: 'chapter' | 'practice' | 'book'; id: string }

type BookManifest = {
  id: string
  name: LocalizedText
  author?: LocalizedText
  description?: LocalizedText
  composed?: number | string        // See composed formats below
  languages: string[]
  sources?: { language: string; url: string; description: string }[]
  toc: TocNode[]
}

type TocNode = {
  id: string
  title: LocalizedText
  children?: TocNode[]   // present = group node, absent = leaf (chapter file)
}
```

### Library ID generation

The `id` field is the library's unique identifier. It must be kebab-case, ASCII-only, and match the folder name. Format: **`{author}-{title}`**.

**Step 1 — Author prefix.** Use the author's most commonly known short name:

- Use the surname or the name the saint is known by: *Thomas à Kempis* → `kempis`, *St. Augustine* → `augustine`, *St. Francis de Sales* → `francis-de-sales`.
- Drop honorifics: *St.*, *Bl.*, *Ven.*, *Fr.*, *Pope*.
- For popes known by their papal name: *Pope Leo XIII* → `leo-xiii`.
- **Skip the author prefix** for: curated collections with no single author (e.g. `oracoes-basicas`), institutional documents (e.g. `catechism`), and Bibles/translations.

**Step 2 — Title.** Use the language most commonly associated with the work:

- Works originally in English or Portuguese: use the original title.
- Works originally in Latin, French, Greek, etc.: use the most commonly known English or Portuguese title.

**Step 3 — Simplify.**

1. Drop articles: *the, a, an, o, a, os, as, de, do, da, dos, das* (but keep "de" in author names where it's part of the name).
2. Drop subtitles (everything after a colon or em-dash).
3. Transliterate accented characters to ASCII: ã→a, é→e, ç→c, ü→u, etc.
4. Lowercase, replace spaces and punctuation with hyphens.
5. Collapse multiple hyphens. Strip leading/trailing hyphens.
6. Target ≤40 characters.

**Step 4 — Handle editions.** By default, use the unqualified ID. Only add a qualifier when a second edition of the same work is introduced.

**Examples:**

| Work | Author | ID |
|------|--------|----|
| The Imitation of Christ | Thomas à Kempis | `kempis-imitation-of-christ` |
| True Devotion to Mary | St. Louis de Montfort | `montfort-true-devotion` |
| Introduction to the Devout Life | St. Francis de Sales | `francis-de-sales-devout-life` |
| Orações Básicas | (curated collection) | `oracoes-basicas` |

### Composed formats

The `composed` field accepts `number | string`. Use `number` only for exact known years; everything else is a `string`.

| Granularity | Type | Format | Example |
|---|---|---|---|
| Exact year | `number` | `YYYY` | `1418` |
| Approximate year | `string` | `"c. YYYY"` | `"c. 1418"` |
| Year range | `string` | `"YYYY–YYYY"` | `"1370–1418"` |
| Approximate range | `string` | `"c. YYYY–YYYY"` | `"c. 354–430"` |
| Century | `string` | `"Nth century"` | `"15th century"` |

Rules:
- Always use en-dash `–` for ranges (not hyphen `-`)
- Always `c.` with a space (not `ca.`, `circa`, `~`)
- Century as ordinal + "century" (not Roman numerals)

### TOC structure

TOC nodes nest arbitrarily. One type, one rule: if a node has `children`, it's a group. If it doesn't, it's a leaf that maps to a chapter file.

| Example work | Structure |
|-------------|-----------|
| Secret of the Rosary | Flat — leaf nodes, no nesting |
| True Devotion | Part → Chapter (2 levels) |
| Summa Theologica | Part → Question → Article (3 levels) |

Example (2-level):

```json
{
  "toc": [
    {
      "id": "part-1",
      "title": {
        "fr-FR": "Première Partie",
        "en-US": "Part I — On Devotion to Our Blessed Lady in General",
        "pt-BR": "Parte I — Da Devoção a Nossa Senhora em Geral"
      },
      "children": [
        { "id": "ch-01", "title": { "en-US": "Chapter I", "pt-BR": "Capítulo I" } },
        { "id": "ch-02", "title": { "en-US": "Chapter II", "pt-BR": "Capítulo II" } }
      ]
    }
  ]
}
```

### Manifest examples

**Mixed library** (Montfort Spirituality — actual):

```json
{
  "id": "montfort-spirituality",
  "version": "1.0.0",
  "name": { "en-US": "Montfort Spirituality", "pt-BR": "Espiritualidade Montfortina" },
  "author": { "en-US": "St. Louis de Montfort" },
  "languages": ["fr-FR", "en-US", "pt-BR"],
  "tags": ["marian", "montfort", "consecration"],
  "practices": ["total-consecration"],
  "prayers": ["act-of-consecration"],
  "chapters": ["about-montfort"],
  "books": ["montfort-true-devotion", "montfort-love-wisdom", "montfort-secret-rosary"],
  "contents": [
    { "type": "chapter", "id": "about-montfort" },
    { "type": "book", "id": "montfort-true-devotion" },
    { "type": "book", "id": "montfort-love-wisdom" },
    { "type": "practice", "id": "total-consecration" }
  ]
}
```

**Pure practice library** (Ember Default — actual):

```json
{
  "id": "ember-default",
  "version": "1.0.0",
  "name": { "en-US": "Catholic Daily Prayers", "pt-BR": "Orações Católicas Diárias" },
  "description": { "en-US": "The essential Catholic prayer companion for your daily plan of life." },
  "languages": ["en-US", "pt-BR"],
  "tags": ["default", "daily", "essential"],
  "practices": ["morning-offering", "rosary", "divine-office", "..."],
  "prayers": ["our-father", "hail-mary", "sign-of-cross", "..."],
  "defaults": { "autoSeed": true }
}
```

---

## Per-Language Directories

Prose is read in one language at a time (unlike prayers which display bilingually). Per-language directories mean:

- CDN fetches only the language you need (future)
- Alignment is at chapter level, not paragraph level
- Both language directories must have matching chapter IDs

If an edition has a genuinely different chapter structure, it's a **different book ID**.

---

## Build Pipeline

### `build-libraries.sh`

`scripts/build-libraries.sh` packages each library into a `.pray` zip file:

1. **Phase 0** — Vendor cross-library prayer dependencies (`vendor-prayers.py`)
2. **Phase 1** — Copy `ember-book.css` to each book's language directories as `style.css`
3. **Phase 2** — Zip each `content/libraries/{id}/` into `{id}-{version}.pray`
4. **Phase 3** — Generate `registry.json` with metadata, content hashes, and previews

No content transformation — source files ship as-is inside the `.pray`.

```bash
pnpm build:libraries    # Build all libraries
```

### Ingestion pipeline

For importing existing public domain texts:

```
HTML source (Gutenberg, CCEL, Internet Archive)
  → import-book script (clean up, convert to Markdown)
  → chapter files in content/libraries/{libraryId}/books/{bookId}/{lang}/
  → human review, corrections, bilingual alignment
  → build-libraries.sh (copy CSS + zip into .pray)
```

---

## Book Reader

The reader is a WebView with CSS column pagination, implemented in `apps/app/src/features/books/`.

Key components:
- **`bookReader.ts`** — loads chapters, builds the HTML shell with three-panel pagination (prev/current/next chapters)
- **`[bookId].tsx`** — screen component with swipe/tap navigation, TOC sheet, reading config (font size, line height, margin, dark mode)

The reader loads `.html` first, falls back to `.md` (converted at runtime via `marked`). Pagination uses CSS multi-column layout with JavaScript touch handling for swipe gestures.

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Source format | Markdown files in git | Human-editable, diffable, no build step |
| Distribution format | `.pray` (zip) | Simple, self-contained, no EPUB complexity |
| Rendering | WebView + CSS column pagination | Full JS/CSS control, pagination, themes |
| Multilingual | Per-language directories | One language at a time, chapter-level alignment |
| Heading hierarchy | `<h1>` per chapter (after Markdown conversion) | Standard convention |
| Runtime conversion | `marked` + `marked-footnote` | Markdown to HTML at runtime, no build step |

---

## Future Directions

- **Annotation layers** — supplementary commentary (Haydock, Catena Aurea) attached to anchored locations in base text. Format TBD.
- **XHTML source format** — books with richer needs (footnotes, scripture cross-references, verse-level anchoring) could use semantic XHTML instead of Markdown. Per-book, not all-at-once.
- **CCC migration** — the current flat `ccc.json` could become a book with paragraph-level addressability.
- **Scripture cross-references** — tappable links in book content that open the Bible reader.
- **CDN downloads** — on-demand book downloading instead of bundled content.
