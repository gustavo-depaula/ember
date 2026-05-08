# Book Format

The content system for books in Ember — spiritual classics, hybrid devotional works. Markdown/HTML source files for prose, hashed and served as immutable blobs through the Hearth v2 corpus.

> See `docs/content/spiritual-books.md` for the full wishlist of titles. See `docs/features/corpus.md` for the v2 author workflow. See `docs/ARCHITECTURE.md` for the corpus architecture.

---

## Concept

A **book** is long-form readable content — spiritual classics, Church documents, formation guides — distributed as `.md` (or `.html`) chapter files, hashed per `(chapter, language)` and served as immutable blobs through the Hearth v2 corpus.

Books are one corpus kind among several (`prayer`, `practice`, `chapter`, `book`, `mass`, `of-*`, `collection`, `checkup`); each kind has its own root folder under `content/`. To group a book with related practices and prayers under a single curated heading (e.g. *Montfort Spirituality* gathering *True Devotion* + a consecration practice + an act-of-consecration prayer), use a `content/collections/<id>.json` — see `docs/features/corpus.md`.

### Design goals

- Stay human-editable (Markdown for prose, JSON for everything else)
- Render in a WebView with CSS column pagination
- Per-`(chapter, language)` blob granularity so a typo fix ships a few KB
- One book id resolves to a single item-manifest in `catalog.json`

---

## Directory Structure

Books live at `content/books/<id>/` in the v2 source tree (flat by kind — prayers, practices, chapters, books, masses, of-library, of-data, collections each at the corpus root). The directory shape inside each book is unchanged from v1:

### Pure prose (montfort spirituality — books only)

```
content/books/
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
    images/                  # webp; referenced from chapters as ../images/...
  montfort-secret-rosary/
    book.json
    en-US/
      rose-01.md

content/collections/montfort-spirituality.json
  # Lists the refs that group these into the "Montfort Spirituality" curated set:
  # { "items": [{"ref": "book/montfort-true-devotion"}, ...] }
```

### Per-kind flat tree (v2)

```
content/practices/total-consecration/
  manifest.json
  flow.json
content/chapters/about-montfort/
  chapter.json
  content.json
content/prayers/
  act-of-consecration.json
content/collections/
  montfort-spirituality.json
```

Practices, chapters, and prayers live flat at the corpus root, each in their own kind-folder. Any number of collections can reference the same item without duplication.

---

## Distribution

The `scripts/build-corpus.py` pipeline emits each book as a set of immutable hash-addressed blobs:

- One blob per `(chapter, language)` markdown / HTML file.
- One blob per book image (webp). Referenced from chapter markdown via `../images/<file>.webp`.
- One blob per book item-manifest (the `book.json` body merged with all the chapter + image hashes).
- One shared blob for `book.css` (deduplicated across every book that uses it).

A user reading just the en-US edition of *Catechism of Trent* fetches only its en-US chapter blobs; pt-BR readers fetch only their language. Image blobs fetch lazily as the WebView renders, then are inlined as base64 data URIs by `loadBookContent` so the WebView shell sees a regular `<img src="data:...">`.

### Chapter files

Chapters are `.md` (primary) or `.html` (supported fallback):

- **`.md`** — converted at runtime using `marked` + `marked-footnote`, then rendered in WebView
- **`.html`** — rendered directly in WebView with `book.css` applied

The reader prefers `.md`; `.html` overrides on a per-chapter basis when present.

### File naming conventions

- Chapter filenames match the TOC leaf node `id`: `ch-01.md`, `preface.md`, `part-1.md`
- All lowercase, kebab-case
- Extension is `.md` or `.html`

### Stylesheet

`content/books/book.css` is the shared base stylesheet, hashed once and referenced by every book item-manifest's `style` field. It provides:

- Light/dark theme via CSS variables (`--bg`, `--text`, `--heading`, etc.)
- Typography using EB Garamond and Cinzel fonts
- Reader-configurable variables: `--reader-font-size`, `--reader-line-height`, `--reader-text-align`, `--reader-margin`
- CSS column pagination

Books with unique needs can include additional per-book CSS overrides (TODO: not yet wired in v2; today the shared `book.css` is the only stylesheet served).

---

## Content Model

### Manifests

Two manifest levels:

- **`book.json`** — one per book at `content/books/<id>/book.json`. Holds the book's TOC + metadata. The build pipeline merges this body with hashes for every chapter / image / style file into a single book item-manifest blob.
- **`content/collections/<name>.json`** — curated grouping that lists refs to corpus items; doesn't itself contain content. See `docs/features/corpus.md` for the format.

```typescript
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

### Book ID generation

The `id` field is the book's unique identifier. It must be kebab-case, ASCII-only, and match the folder name (`content/books/<id>/`). Format: **`{author}-{title}`**.

**Step 1 — Author prefix.** Use the author's most commonly known short name:

- Use the surname or the name the saint is known by: *Thomas à Kempis* → `kempis`, *St. Augustine* → `augustine`, *St. Francis de Sales* → `francis-de-sales`.
- Drop honorifics: *St.*, *Bl.*, *Ven.*, *Fr.*, *Pope*.
- For popes known by their papal name: *Pope Leo XIII* → `leo-xiii`.
- **Skip the author prefix** for institutional documents (e.g. `catechism-of-trent`), Bibles/translations, and anthologies/compiled works with no single author.

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
| Catechism of the Council of Trent | (Council of Trent) | `catechism-of-trent` |

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

### Manifest example

**`content/books/montfort-true-devotion/book.json`** (abridged):

```json
{
  "id": "montfort-true-devotion",
  "name": {
    "fr-FR": "Traité de la vraie dévotion à la Sainte Vierge",
    "en-US": "True Devotion to the Blessed Virgin Mary",
    "pt-BR": "Tratado da Verdadeira Devoção à Santíssima Virgem Maria"
  },
  "author": {
    "fr-FR": "Saint Louis-Marie Grignion de Montfort",
    "en-US": "St. Louis de Montfort",
    "pt-BR": "São Luís Maria Grignion de Montfort"
  },
  "composed": 1712,
  "languages": ["fr-FR", "en-US", "pt-BR"],
  "sources": [
    {
      "language": "fr-FR",
      "url": "https://livres-mystiques.com/partieTEXTES/Montfort/Montfort.html",
      "description": "French original from Livres Mystiques"
    }
  ],
  "toc": [
    { "id": "preface", "title": { "en-US": "Preface", "pt-BR": "Prefácio" } },
    {
      "id": "part-1",
      "title": { "en-US": "Part I", "pt-BR": "Parte I" },
      "children": [
        { "id": "ch-01", "title": { "en-US": "Chapter I", "pt-BR": "Capítulo I" } }
      ]
    }
  ]
}
```

To bundle this book with related practices, prayers, or other books under a curated heading, author a `content/collections/montfort-spirituality.json` that lists `{ "ref": "book/montfort-true-devotion" }` alongside the other refs. See `docs/features/corpus.md` for the collection format.

---

## Per-Language Directories

Prose is read in one language at a time (unlike prayers which display bilingually). Per-language directories mean:

- CDN fetches only the language you need (future)
- Alignment is at chapter level, not paragraph level
- Both language directories must have matching chapter IDs

If an edition has a genuinely different chapter structure, it's a **different book ID**.

---

## Build Pipeline

### `build-corpus.py`

`scripts/build-corpus.py` walks `content/{prayers,practices,chapters,books,masses,of-library,of-data,collections,checkup}/` and emits hash-addressed blobs + per-item manifests + a top-level `catalog.json` to `_site/hearth/v2/`.

For books specifically: each `(chapter, language)` markdown file is canonicalized, sha256-hashed, and written to `blobs/{ab}/{cd}/{full-sha256}` only if missing (idempotent re-runs). The resulting book item-manifest is itself a blob whose hash is referenced from `catalog.json`.

```bash
pnpm build:corpus       # build only
pnpm hearth             # build + serve at http://localhost:4100 for dev
```

### Ingestion pipeline

For importing existing public domain texts:

```
HTML source (Gutenberg, CCEL, Internet Archive)
  → import-book script (clean up, convert to Markdown)
  → chapter files in content/books/<bookId>/<lang>/
  → human review, corrections, bilingual alignment
  → build-corpus.py (hash + emit per-(chapter, lang) blobs + book item-manifest)
```

For CCEL ThML imports specifically, use `content/_archive/ccel-classics/scripts/ccel-import.py` — see `docs/content/ccel-import.md`. (Source path migrated during the v2 rename pass; the importer's output already lands at `content/books/<bookId>/`.)

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
| Distribution format | Content-addressed blobs (Hearth v2) | Per-(chapter, lang) granularity; updates ship the changed bytes only |
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
