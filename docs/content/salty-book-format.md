# Salty Book Format

The unified content system for all books in Ember — spiritual classics, prayer collections, and hybrid works. HTML/Markdown source files read directly from disk for prose rendering; manifest-based prayer collections for devotional content. One folder tree, one manifest type, one discovery system.

> See `docs/content/spiritual-books.md` for the full wishlist of titles. See `docs/features/prayer-books.md` for the library feature.

---

## Concept

Ember's content falls into three categories: structured short content (prayers, Bible verses, CCC paragraphs), long-form prose (spiritual classics, Church documents, study Bibles), and devotional collections (libraries, devocionários). The Salty book format is the **unified system** for the latter two — and any hybrid of them.

A library in this system can have any combination of:

- **Books** — long-form readable content (`.html` or `.md` chapter files, read directly from disk)
- **Prayer collection** — browsable, ordered devotional content (prayer refs, rubrics, practice-refs)
- **Colocated practices** — schedulable units for the plan of life (standard practice manifests)

A pure spiritual classic like *Imitation of Christ* has only books. A library like *Orações Básicas* has only a prayer collection and practices. A hybrid like *Introduction to the Devout Life* has all three.

### Design goals

- Work bundled now, CDN-downloadable later
- Stay human-editable (HTML/Markdown for prose, JSON for prayer collections)
- Render in a WebView with CSS column pagination (prose) and native components (prayer collections)
- One folder per library — books, prayers, and practices colocated
- One manifest type, one discovery system, one practice-export mechanism
- Support both sequential and random-access reading patterns
- HTML source is directly queryable at runtime — extract fragments by `id` for practice flows, CCC lookups, etc.

### Relation to existing content

| Content type | Format | Addressability | Bilingual | This spec replaces? |
|-------------|--------|---------------|-----------|-------------------|
| Bible (DRB) | JSON per chapter | Verse | No (one translation at a time) | No — bundled Bible stays as-is |
| Catechism | Flat JSON array | Paragraph number | No | Eventually — CCC becomes a book with `addressable: "paragraphs"` |
| Libraries | Manifest + prayer assets | Section/prayer | Yes (bilingual display) | **Yes** — libraries with `prayerCollection` |
| **Books** | **Manifest + HTML/Markdown chapters** | **Chapter / paragraph / article** | **No (per-language directories)** | — |

---

## Architecture

Books are raw `.html` or `.md` chapter files read directly from disk at runtime. No EPUB packaging step is needed for the app — chapters are rendered in a WebView with CSS column pagination.

- **`content/libraries/{libraryId}/books/{bookId}/{lang}/`** — human-editable chapter files (`.html` or `.md`, committed to git)
- `.md` files are shipped inside `.pray` packages and converted at runtime using `marked` + `marked-footnote`

Books are embedded inside `.pray` packages — the same zip format used for libraries. A single `.pray` can bundle books alongside practices, prayers, and chapters. The `build-books.sh` script copies the CSS and zips everything into the `.pray`.

Libraries that are **pure prayer collections** (no `toc`, only `prayerCollection`) skip the build entirely — their manifests and prayer JSON are used directly at runtime. Mixed libraries package only their prose books.

### Why raw HTML/Markdown?

| Alternative | Problem |
|-------------|---------|
| Markdown + JSON AST | Required a custom parser, custom block/span type system, and custom native renderers. Reinvented what HTML+CSS already does |
| EPUB packaging | Added build complexity (pandoc, container.xml, package.opf, nav.xhtml) for no runtime benefit — the app uses its own WebView reader, not epub.js |
| Custom format at runtime | Proprietary, no interop |

Raw `.html` chapters are the simplest path: human-editable in git, directly renderable in WebView, no build step. `.md` chapters add convenience for simpler content — they ship as-is and are converted at runtime via `marked`.

### Per-language directories

Prose is read in one language at a time (unlike prayers which display bilingually). Per-language directories mean:

- CDN fetches only the language you need (future)
- Alignment is at chapter level, not paragraph level
- Both language directories must have matching chapter IDs

If an edition has a genuinely different chapter structure (editorial splits/merges), it's a **different book ID**, linked via `relatedEditions`.

### Pipeline

```
HTML source (Gutenberg, CCEL, Internet Archive)
  → import-book script (clean HTML, add semantic attributes)
  → chapter files in content/libraries/{libraryId}/books/{bookId}/{lang}/
  → human review, corrections, bilingual alignment
  → build-books.sh (copy CSS + zip into .pray)
  → .pray file with chapter files inside books/{bookId}/
  → WebView renders with CSS column pagination
```

### Queryability

Chapter files are standard HTML with `id` attributes on every addressable element. At runtime, the app reads them directly and extracts fragments by `id`.

This enables:

- Practice flows that show 5 CCC paragraphs: read the HTML, querySelector by `id`, render the fragment
- Cross-references: resolve a book+anchor to a chapter file + element, extract and display
- Search indexing: parse HTML text content at build time or first launch

No build-time index is required. The chapter files ARE the queryable format.

---

## Directory Structure

All libraries live in `content/libraries/`. A library is a self-contained folder — the same `.pray` package format used for all content. Books (prose) are nested under `books/` within the library directory. The three archetypes:

### Pure prose (Rule of St. Benedict)

```
content/libraries/benedict-rule/
  library.json
  books/
    benedict-rule/
      book.json                         # Book metadata (name, author, toc)
      en-US/
        prologue.html                   # Chapter files (committed to git)
        ch-01.html
        ch-02.html
```

### Pure prayer collection (Orações Basicas)

```
content/libraries/oracoes-basicas/
  library.json
  prayers/                              # Scoped prayer assets
    sign-of-cross.json
    morning-offering.json
    our-father.json
  practices/                            # Colocated practices
    morning-prayers/
      manifest.json                     # Standard PracticeManifest
      flows/default.json                # FlowDefinition
    night-prayers/
      manifest.json
      flows/default.json
```

### Mixed library (Montfort Spirituality)

```
content/libraries/montfort-spirituality/
  library.json
  books/
    montfort-true-devotion/
      book.json                         # Book metadata (name, author, toc)
      en-US/                            # Chapter files (committed to git)
        ch-01.html
        ch-02.html
      pt-BR/
        ch-01.html
        ch-02.html
      fr-FR/
        ch-01.md                        # Markdown chapters also supported
        ch-02.md
    montfort-secret-rosary/
      book.json
      en-US/
        rose-01.html
  prayers/                              # Montfort prayers
    act-of-consecration.json
  practices/                            # Plan-of-life practices
    total-consecration/
      manifest.json
      flows/default.json
  chapters/                             # Native chapters (rendered in-app)
    about-montfort/
      chapter.json
      content.json
```

### Study Bible with layers (Douay-Rheims + Haydock)

```
content/libraries/douay-rheims-study/
  library.json
  books/
    douay-rheims-study/
      book.json
      en-US/
        genesis/ch-01.html              # Base text with anchors
        genesis/ch-02.html
  layers/                               # Annotation layer content (format TBD)
    haydock/genesis/ch-01.*
    catena/genesis/ch-01.*
```

### Colocated practices

Practices live in `practices/` inside the library folder. They use the exact same `PracticeManifest` / `FlowDefinition` / track format as any practice in `content/practices/`. No new format.

ID convention: `book::{libraryId}::{practiceId}` (e.g., `book::francis-de-sales-devout-life::meditation-retreat`).

Discovery finds them by convention — practices inside a library folder are automatically namespaced.

---

## `.pray` Package Format

A `.pray` file is a zip containing the library's content — books (chapter files), prayers, practices, and metadata. The `build-books.sh` script copies the CSS and zips everything.

### Structure

```
library.pray (zip)
├── library.json                        # Library manifest
├── ember-book.css                      # Base stylesheet for book rendering
├── books/
│   └── benedict-rule/
│       ├── book.json                   # Book metadata (name, author, toc)
│       └── en-US/
│           ├── prologue.html           # Chapter files
│           ├── ch-01.html
│           └── ch-02.html
├── prayers/                            # Scoped prayer JSON
├── practices/                          # Colocated practice manifests
├── chapters/                           # Native chapters
└── layers/                             # Annotation layer content
```

### Chapter files

Chapters can be `.html` or `.md`:

- **`.html`** — rendered directly in WebView with `ember-book.css` applied
- **`.md`** — converted at runtime using `marked` + `marked-footnote`, then rendered in WebView

Both formats ship as-is inside the `.pray` package. No build-time conversion.

### File naming conventions

- Chapter filenames match the TOC leaf node `id`: `ch-01.html`, `prologue.html`, `ch-01.md`
- Nested TOC paths mirror the directory structure: `part-1/ch-01.html`
- All lowercase, kebab-case
- Extension is `.html` or `.md`

### Stylesheet

`ember-book.css` is the base stylesheet included in every `.pray` package. It provides consistent typography and styling across all books. See [HTML Source Format](#html-source-format) for the CSS class conventions.

Books with unique needs (poetry-heavy, study Bible) can include additional per-book CSS overrides.

### Image handling

- Images live in `images/`
- Cover image: `images/cover.jpg` (or `.png`)
- Content images referenced from HTML: `<img src="../images/filename.jpg" alt="description">`

### Zip packaging rules

- All files use DEFLATE compression
- No encryption or DRM

---

## Content Model

### Manifest

The manifest is the unified type for all libraries — prose books, prayer collections, and hybrids.

There are two manifest levels:

- **`library.json`** — the outer container (the `.pray` package). Lists which books it contains and holds library-level metadata.
- **`book.json`** — one per book inside the library. Holds the book's TOC, metadata, and addressability.

```typescript
type Library = {
  id: string
  name: LocalizedText
  description: LocalizedText
  author?: LocalizedText
  composed?: number | string
  languages: ContentLanguage[]
  tags?: string[]
  icon?: string
  image?: string

  // Books inside this library (optional — absent for pure prayer collections)
  books?: string[]

  // Devotional browsing structure (optional — absent for pure prose libraries)
  prayerCollection?: PrayerCollectionSection[]

  relatedEditions?: string[]
}

type BookManifest = {
  id: string
  name: LocalizedText
  description: LocalizedText
  author?: LocalizedText
  composed?: number | string
  languages: ContentLanguage[]

  // Prose reading structure
  toc?: TocNode[]
  addressable?: 'chapters' | 'paragraphs' | 'articles' // default: 'chapters'
  layers?: LayerDeclaration[]
}

type TocNode = {
  id: string
  title: LocalizedText
  children?: TocNode[]   // present = group node, absent = leaf (chapter file)
}

type LayerDeclaration = {
  id: string
  name: LocalizedText
}
```

Three optional content concerns, any combination:
- **`books`** — "this library has prose you can read" (HTML/Markdown chapters read from disk)
- **`prayerCollection`** — "this library has organized devotional content you can browse" (prayer sections, practice references)
- **`practices/` folder** — "this library exports practices to the plan of life" (standard practice manifests)

### Library ID generation

The `id` field is the library's unique identifier. It must be kebab-case, ASCII-only, and match the folder name. Format: **`{author}-{title}`**.

**Step 1 — Author prefix.** Use the author's most commonly known short name:

- Use the surname or the name the saint is known by: *Thomas à Kempis* → `kempis`, *St. Augustine* → `augustine`, *St. Francis de Sales* → `francis-de-sales`, *St. John of the Cross* → `john-cross`.
- Drop honorifics: *St.*, *Bl.*, *Ven.*, *Fr.*, *Pope*.
- For popes known by their papal name: *Pope Leo XIII* → `leo-xiii`.
- **Skip the author prefix** for: curated collections with no single author (e.g. `oracoes-basicas`), institutional documents (e.g. `catechism`), and Bibles/translations (e.g. `douay-rheims-study`).

**Step 2 — Title.** Use the language most commonly associated with the work:

- Works originally in English or Portuguese: use the original title. *Orações Básicas* → `oracoes-basicas`.
- Works originally in Latin, French, Greek, etc.: use the most commonly known English or Portuguese title. *De Imitatione Christi* → "Imitation of Christ".
- Works that originated within this project: use the name they were created with.

**Step 3 — Simplify.**

1. Drop articles: *the, a, an, o, a, os, as, de, do, da, dos, das* (but keep "de" in author names where it's part of the name, e.g. `francis-de-sales`).
2. Drop subtitles (everything after a colon or em-dash).
3. Transliterate accented characters to ASCII: ã→a, é→e, ç→c, ü→u, etc.
4. Lowercase, replace spaces and punctuation with hyphens.
5. Collapse multiple hyphens. Strip leading/trailing hyphens.
6. Target ≤40 characters — abbreviate naturally if needed.

**Step 4 — Handle editions.** By default, use the unqualified ID. Only add a qualifier when a second edition of the same work is introduced:

- Single edition: `kempis-imitation-of-christ`
- Second edition adds qualifier: `kempis-imitation-of-christ-knox`
- Qualifiers can be: translator name, publisher, year, or distinguishing label
- Link related editions via `relatedEditions` in each manifest

**Examples:**

| Work | Author | ID |
|------|--------|----|
| The Imitation of Christ | Thomas à Kempis | `kempis-imitation-of-christ` |
| Confessions | St. Augustine | `augustine-confessions` |
| Introduction to the Devout Life | St. Francis de Sales | `francis-de-sales-devout-life` |
| Dark Night of the Soul | St. John of the Cross | `john-cross-dark-night` |
| Story of a Soul | St. Thérèse of Lisieux | `therese-story-of-soul` |
| Rule of St. Benedict | St. Benedict | `benedict-rule` |
| Spiritual Exercises | St. Ignatius of Loyola | `ignatius-spiritual-exercises` |
| Orações Básicas | (curated collection) | `oracoes-basicas` |
| Catechism of the Catholic Church | (institutional) | `catechism` |
| Douay-Rheims + Haydock study ed. | (translation) | `douay-rheims-study` |
| Summa Theologica | St. Thomas Aquinas | `aquinas-summa-theologica` |

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Unique library identifier (see ID generation above), matches folder name |
| `name` | yes | Localized title |
| `description` | yes | Localized short description |
| `author` | no | Localized author name (absent for curated collections) |
| `composed` | no | When the work was composed — see [composed formats](#composed-formats) below |
| `languages` | yes | Available language codes |
| `tags` | no | Topical tags (e.g. `["ascetical", "devotional"]`) |
| `icon` | no | Small glyph identifier for UI |
| `image` | no | Cover image path |
| `books` | no | List of book IDs contained in this library |
| `prayerCollection` | no | Devotional browsing structure (see below) |
| `relatedEditions` | no | IDs of structurally different editions of the same work |

### Composed formats

The `composed` field accepts `number | string`. Use `number` only for exact known years; everything else is a `string`.

| Granularity | Type | Format | Example |
|---|---|---|---|
| Exact year | `number` | `YYYY` | `1418` |
| Approximate year | `string` | `"c. YYYY"` | `"c. 1418"` |
| Year range | `string` | `"YYYY–YYYY"` | `"1370–1418"` |
| Approximate range | `string` | `"c. YYYY–YYYY"` | `"c. 354–430"` |
| Century | `string` | `"Nth century"` | `"15th century"` |
| Century range | `string` | `"Nth–Nth century"` | `"1st–4th century"` |

Rules:
- Always use en-dash `–` for ranges (not hyphen `-`)
- Always `c.` with a space (not `ca.`, `circa`, `~`)
- Century as ordinal + "century" (not Roman numerals, not "1400s")

### Prayer collection

The `prayerCollection` field defines the browsing structure for devotional content. Each entry is a section with an ordered list of prayer entries.

```typescript
type PrayerCollectionSection = {
  id: string
  name: LocalizedText
  entries: LibraryEntry[]
}

type LibraryEntry =
  | { type: 'prayer'; ref: string }
  | { type: 'rubric'; text: LocalizedText }
  | { type: 'subheading'; text: LocalizedText }
  | { type: 'divider' }
  | { type: 'image'; src: string; caption?: LocalizedText }
  | { type: 'subsection'; title: LocalizedText; entries: LibraryEntry[] }
  | { type: 'practice-ref'; practiceId: string }
```

Prayer refs resolve using scoped prayers first (from the library's `prayers/` folder), then fall back to global prayer assets. Cross-library references use `libraryId::prayerId` syntax.

Practice refs point to colocated practices: `book::{libraryId}::{practiceId}`.

The `prayerCollection` is purely organizational — it defines what shows up when you browse the library, and in what order. Some entries are inline prayer sections, some point to practices. No practice metadata lives on the collection entries themselves.

### TOC structure

TOC nodes nest arbitrarily. One type, one rule: if a node has `children`, it's a group. If it doesn't, it's a leaf that maps to a chapter file.

| Example work | Structure |
|-------------|-----------|
| Rule of St. Benedict | Flat — 73 leaf nodes, no nesting |
| Confessions | Book → Chapter (2 levels) |
| Spiritual Exercises | Weeks → Days → Exercises (3 levels) |
| Summa Theologica | Part → Question → Article (3 levels) |
| CCC | Part → Section → Chapter → Article (4 levels) |

Example (2-level):

```json
{
  "toc": [
    {
      "id": "book-1",
      "title": { "en-US": "Book One: Useful Admonitions", "pt-BR": "Livro Primeiro" },
      "children": [
        { "id": "ch-01", "title": { "en-US": "Of the Imitation of Christ", "pt-BR": "Da Imitação de Cristo" } },
        { "id": "ch-02", "title": { "en-US": "Of Having a Humble Opinion of Oneself" } }
      ]
    }
  ]
}
```

Example (4-level, deep hierarchy):

```json
{
  "toc": [
    { "id": "part-1", "title": { "en-US": "The Profession of Faith" }, "children": [
      { "id": "section-2", "title": { "en-US": "The Profession of the Christian Faith" }, "children": [
        { "id": "chapter-3", "title": { "en-US": "I Believe in the Holy Spirit" }, "children": [
          { "id": "art-12", "title": { "en-US": "I Believe in Life Everlasting" } }
        ]}
      ]}
    ]}
  ]
}
```

### Manifest examples

**Pure prose** (Imitation of Christ):

```json
{
  "id": "kempis-imitation-of-christ",
  "name": { "en-US": "The Imitation of Christ", "pt-BR": "Imitação de Cristo" },
  "author": { "en-US": "Thomas à Kempis", "pt-BR": "Tomás de Kempis" },
  "description": { "en-US": "Classic guide to the spiritual life", "pt-BR": "Guia clássico da vida espiritual" },
  "composed": 1418,
  "languages": ["en-US", "pt-BR"],
  "tags": ["ascetical"],
  "toc": [
    { "id": "book-1", "title": { "en-US": "Book One: Useful Admonitions" }, "children": [
      { "id": "ch-01", "title": { "en-US": "Of the Imitation of Christ" } },
      { "id": "ch-02", "title": { "en-US": "Of Having a Humble Opinion of Oneself" } }
    ]}
  ]
}
```

**Pure prayer collection** (Orações Básicas):

```json
{
  "id": "oracoes-basicas",
  "name": { "en-US": "Basic Catholic Prayers", "pt-BR": "Orações Básicas" },
  "description": { "en-US": "Essential prayers for daily Catholic life", "pt-BR": "Orações essenciais para a vida católica" },
  "languages": ["en-US", "pt-BR"],
  "tags": ["devotional"],
  "icon": "prayer",
  "prayerCollection": [
    {
      "id": "oracoes-principais",
      "name": { "en-US": "Main Prayers", "pt-BR": "Orações Principais" },
      "entries": [
        { "type": "prayer", "ref": "sign-of-cross" },
        { "type": "prayer", "ref": "our-father" },
        { "type": "prayer", "ref": "hail-mary" }
      ]
    },
    {
      "id": "oracoes-da-manha",
      "name": { "en-US": "Morning Prayers", "pt-BR": "Orações da Manhã" },
      "entries": [
        { "type": "practice-ref", "practiceId": "book::oracoes-basicas::morning-prayers" }
      ]
    }
  ]
}
```

**Mixed book** (Introduction to the Devout Life):

```json
{
  "id": "francis-de-sales-devout-life",
  "name": { "en-US": "Introduction to the Devout Life", "pt-BR": "Introdução à Vida Devota" },
  "author": { "en-US": "St. Francis de Sales", "pt-BR": "São Francisco de Sales" },
  "description": { "en-US": "A practical guide to holiness in everyday life" },
  "composed": 1609,
  "languages": ["en-US", "pt-BR"],
  "tags": ["ascetical", "devotional"],
  "image": "cover.jpg",
  "toc": [
    { "id": "part-1", "title": { "en-US": "Part I: Counsels and Exercises for the Soul" }, "children": [
      { "id": "ch-01", "title": { "en-US": "What True Devotion Is" } },
      { "id": "ch-12", "title": { "en-US": "The First Meditation: On Creation" } }
    ]}
  ],
  "prayerCollection": [
    {
      "id": "meditation-retreat",
      "name": { "en-US": "7-Day Meditation Retreat" },
      "entries": [
        { "type": "practice-ref", "practiceId": "book::francis-de-sales-devout-life::meditation-retreat" }
      ]
    }
  ]
}
```

---

## XHTML Source Format

### Chapter template

Every chapter follows this structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Chapter I — Of the Kinds or the Life of Monks</title>
  <link rel="stylesheet" href="../shared/salty.css" type="text/css"/>
</head>
<body>
  <section id="ch-01" epub:type="chapter">
    <!-- chapter content here -->
  </section>
</body>
</html>
```

The `id` on the `<section>` must match the TOC leaf node ID from `manifest.json`.

### Block-level conventions

#### Headings

```xml
<h1>Chapter I</h1>
<h2>Of the Kinds or the Life of Monks</h2>
<h3>Subsection Title</h3>
```

`<h1>` is the chapter title (top-level heading per chapter, standard EPUB convention). `<h2>` for subheadings, `<h3>` for sub-subheadings. Never use `<h4>` or deeper.

#### Paragraphs

```xml
<p>It is well known that there are four kinds of monks. The first kind
is that of Cenobites, that is, the monastic, who live under a rule
and an Abbot.</p>
```

#### Blockquotes

```xml
<blockquote>
  <p>Vanity of vanities, and all is vanity, except to love God
  and serve Him only.</p>
</blockquote>
```

Can nest other blocks.

#### Containers

**Prayer** — centered, italic, for embedded prayers in spiritual classics:

```xml
<aside class="prayer">
  <p>O Lord, grant us Thy peace...</p>
</aside>
```

**Poetry** — preserved line breaks, stanza spacing, for psalms, hymns, verse:

```xml
<div class="poetry">
  <p class="stanza">
    Blessed is the man<br/>
    &#160;&#160;that walketh not in the counsel of the ungodly,<br/>
    &#160;&#160;nor standeth in the way of sinners.
  </p>
  <p class="stanza">
    But his delight is in the law of the <span class="sc">Lord</span>;<br/>
    &#160;&#160;and in his law doth he meditate day and night.
  </p>
</div>
```

Use `<br/>` for line breaks within a stanza, separate `<p class="stanza">` elements for stanza breaks. Indentation uses `&#160;` (non-breaking space) — two per indent level.

**In-brief** — bordered summary box, for CCC summary sections:

```xml
<aside class="in-brief">
  <p>These words express the faith of the Church...</p>
</aside>
```

**Sidebar** — callout for editorial notes:

```xml
<aside class="sidebar">
  <p>Editor's note: this passage appears only in the 1609 edition.</p>
</aside>
```

**Element choice:** Use `<aside>` for prayer, in-brief, sidebar, and custom containers (semantically tangential content). Use `<div>` for poetry (primary content in a different presentation mode).

#### Footnotes

Standard EPUB 3 footnote pattern. Reference inline:

```xml
<p>This is the highest wisdom.<a epub:type="noteref" href="#fn-1" id="fnref-1"><sup>1</sup></a></p>
```

Definition at end of chapter:

```xml
<aside epub:type="footnote" id="fn-1">
  <p><a href="#fnref-1">1.</a> This translation follows the edition of 1893
  by Rev. William Benham.</p>
</aside>
```

Rich footnotes (multi-paragraph) use multiple `<p>` tags inside the `<aside>`.

The `epub:type="noteref"` and `epub:type="footnote"` semantics allow the app to implement popover behavior.

#### Lists

```xml
<ul>
  <li><p>First item with <em>rich</em> content</p></li>
  <li>
    <p>Second item</p>
    <p>With multiple paragraphs</p>
  </li>
</ul>

<ol>
  <li><p>Numbered item</p></li>
</ol>
```

#### Dividers

```xml
<hr/>
```

### Inline conventions

#### Emphasis and strong

```xml
<em>italic text</em>
<strong>bold text</strong>
```

#### Small caps

```xml
<span class="sc">Lord</span>
```

CSS: `font-variant: small-caps;`

#### Scripture references

Tappable links that open the Bible reader:

```xml
<a href="ember://scripture/john:8:12" class="scripture-ref"
   data-ref="john:8:12">John 8:12</a>
```

With Psalm numbering disambiguation:

```xml
<a href="ember://scripture/psalms:22?numbering=lxx" class="scripture-ref"
   data-ref="psalms:22" data-numbering="lxx">Psalm 22</a>
```

The `href` uses a custom URL scheme intercepted by the app. The `data-*` attributes carry structured data for programmatic access. In standard EPUB readers, the link won't resolve but the text remains readable.

#### Internal references

Links within the same book:

```xml
<a href="ch-05.xhtml#opened-heaven">see Chapter V</a>
```

For same-chapter links: `<a href="#anchor-id">`. Cross-chapter links include the filename.

#### Book references

Links to another book + unit:

```xml
<a href="ember://book/catechism/p1012" class="book-ref"
   data-book="catechism" data-unit="p1012">CCC 1012</a>
```

#### Verses

Verses are wrapped in a `<span class="verse">` that encompasses the number and the full verse text:

```xml
<span class="verse" id="v1" data-verse="1">
  <sup class="verse-number">1</sup>
  In the beginning God created the heaven and the earth.
</span>
```

The wrapping `<span>` carries the `id` and `data-verse` — this makes the entire verse queryable, highlightable, and targetable by annotation layers.

For numbered paragraphs (CCC, Canon Law), the `<p>` itself is the wrapper — no extra `<span>` needed:

```xml
<p class="numbered-paragraph" id="p795" data-paragraph="795">
  <sup class="verse-number">795</sup>
  By his death and Resurrection, Jesus Christ has "opened" heaven to us.
</p>
```

#### Anchors

Block-level — put the `id` directly on the element:

```xml
<p id="opened-heaven">By his death and Resurrection...</p>
```

Span-level — wrap with `<span>`:

```xml
<p>...Jesus Christ has <span id="opened-heaven">"opened" heaven to us</span>.
The life of the blessed...</p>
```

Multiple anchors per block — use the primary `id` on the element and `data-anchors` for all:

```xml
<p id="p795" data-anchors="p795 redemption-fruits">
  <sup class="verse-number" data-verse="795">795</sup>
  By his death and Resurrection...
</p>
```

### CSS class reference

| Class | Element | Purpose |
|---|---|---|
| `prayer` | `<aside>` | Centered, italic prayer text |
| `poetry` | `<div>` | Poetry container |
| `stanza` | `<p>` inside `.poetry` | Individual stanza |
| `in-brief` | `<aside>` | Bordered summary box |
| `sidebar` | `<aside>` | Callout/note box |
| `sc` | `<span>` | Small caps |
| `verse` | `<span>` | Wraps full verse content (number + text) |
| `numbered-paragraph` | `<p>` | Numbered paragraph (CCC, Canon Law) |
| `verse-number` | `<sup>` | Superscript verse/paragraph number |
| `scripture-ref` | `<a>` | Scripture reference link |
| `book-ref` | `<a>` | Cross-book reference link |

### Full example: spiritual classic chapter

```xml
<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Chapter I — Of the Imitation of Christ</title>
  <link rel="stylesheet" href="../shared/salty.css" type="text/css"/>
</head>
<body>
  <section id="ch-01" epub:type="chapter">
    <h1>Chapter I</h1>
    <h2>Of the Imitation of Christ, and Contempt of All the Vanities of the World</h2>

    <p>"He that followeth Me, walketh not in darkness,"
    <a href="ember://scripture/john:8:12" class="scripture-ref"
       data-ref="john:8:12">John 8:12</a>
    saith the Lord. These are the words of Christ, by which we are admonished,
    that we must imitate His life and manners, if we would be truly enlightened,
    and delivered from all blindness of heart.</p>

    <blockquote>
      <p>Vanity of vanities, and all is vanity, except to love God
      and serve Him only.</p>
    </blockquote>

    <p>This is therefore the highest wisdom, by contempt of the world to tend
    towards the kingdom of heaven.<a epub:type="noteref" href="#fn-1"
    id="fnref-1"><sup>1</sup></a></p>

    <aside epub:type="footnote" id="fn-1">
      <p><a href="#fnref-1">1.</a> This translation follows the edition of
      1893 by Rev. William Benham.</p>
    </aside>
  </section>
</body>
</html>
```

### Full example: CCC chapter with containers

```xml
<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Article 12 — I Believe in Life Everlasting</title>
  <link rel="stylesheet" href="../shared/salty.css" type="text/css"/>
</head>
<body>
  <section id="art-12" epub:type="chapter">
    <h1>Article 12: "I Believe in Life Everlasting"</h1>

    <p class="numbered-paragraph" id="p1020" data-paragraph="1020">
      <sup class="verse-number">1020</sup>
      "The Christian who unites his own death to that of Jesus views it as a
      step towards him and an entrance into everlasting life."
      <a href="ember://book/catechism/p1012" class="book-ref"
         data-book="catechism" data-unit="p1012">CCC 1012</a>
    </p>

    <p class="numbered-paragraph" id="p1021" data-paragraph="1021">
      <sup class="verse-number">1021</sup>
      Death puts an end to human life as the time open to either accepting or
      rejecting the divine grace manifested in Christ.
      <a href="ember://scripture/hebrews:9:27" class="scripture-ref"
         data-ref="hebrews:9:27">Hebrews 9:27</a>
    </p>

    <aside class="in-brief">
      <p class="numbered-paragraph" id="p1051" data-paragraph="1051">
        <sup class="verse-number">1051</sup>
        Every man receives his eternal recompense in his immortal soul from
        the moment of his death.
      </p>

      <p class="numbered-paragraph" id="p1052" data-paragraph="1052">
        <sup class="verse-number">1052</sup>
        "We believe that the souls of all who die in Christ's grace… are the
        People of God beyond death."
        <a href="ember://book/lumen-gentium/49" class="book-ref"
           data-book="lumen-gentium" data-unit="49"><em>Lumen Gentium</em> 49</a>
      </p>
    </aside>
  </section>
</body>
</html>
```

### Full example: Bible chapter with inline verses

```xml
<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Genesis 2</title>
  <link rel="stylesheet" href="../shared/salty.css" type="text/css"/>
</head>
<body>
  <section id="gen-2" epub:type="chapter">
    <h1>Genesis 2</h1>

    <p>
      <span class="verse" id="v7" data-verse="7">
        <sup class="verse-number">7</sup>
        And the <span class="sc">Lord</span> God formed man of the dust of
        the ground, and breathed into his nostrils the breath of life;
      </span>
      <span class="verse" id="v8" data-verse="8">
        <sup class="verse-number">8</sup>
        and man became a living soul.
      </span>
      <span class="verse" id="v9" data-verse="9">
        <sup class="verse-number">9</sup>
        And the <span class="sc">Lord</span> God planted a garden eastward
        in Eden; and there he put the man whom he had formed.
      </span>
    </p>
  </section>
</body>
</html>
```

Multiple verses share one visual paragraph — verses are inline markers, not block boundaries.

---

## Anchor System & Addressability

### Core principle

An anchor is an `id` attribute on an HTML element. It makes that content referenceable — by layers, by cross-references, by the query system.

### Anchor ID conventions

| Content type | ID format | Scope | Element |
|---|---|---|---|
| Verse | `v1`, `v2`, ... | Unique within chapter | `<span class="verse" id="v1">` |
| Numbered paragraph | `p795`, `p796`, ... | Unique within book | `<p class="numbered-paragraph" id="p795">` |
| Named anchor | `opened-heaven` | Unique within book | `<span id="opened-heaven">` |

Paragraph anchors use `p` prefix (not `¶`) because `id` attributes must be URL-safe and HTML-safe.

### Multiple anchors per block

When a block has multiple anchors, use the primary one as the element `id` and list all anchors in `data-anchors` (space-separated):

```xml
<p class="numbered-paragraph" id="p795" data-paragraph="795" data-anchors="p795 redemption-fruits">
  <sup class="verse-number">795</sup>
  By his death and Resurrection, Jesus Christ has
  <span id="opened-heaven">"opened" heaven to us</span>...
</p>
```

### Scoping and namespaced references

References resolve from narrowest scope outward. Separator is **colon**. Pattern: `[book]:[chapter]:[anchor]`, dropping left segments when scope is implicit.

| Reference | Resolves to |
|-----------|-------------|
| `v7` | Verse 7 in current chapter |
| `gen-1:v7` | Verse 7 of Genesis ch. 1 (cross-chapter, same book) |
| `douay-rheims:gen-1:v7` | Verse 7 of Genesis 1 in the Douay-Rheims (cross-book) |
| `p795` | Paragraph 795 in current book (book-unique) |
| `catechism:p795` | Paragraph 795 in the CCC (cross-book) |
| `opened-heaven` | Named anchor in current book |
| `catechism:opened-heaven` | Named anchor in the CCC (cross-book) |

Chapter-scoped anchors (verses) need the chapter qualifier for cross-chapter references. Book-unique anchors (numbered paragraphs, named anchors) skip the chapter level.

### Addressability modes

Declared in the manifest's `addressable` field.

| Mode | Unit | Example works | Query pattern |
|------|------|---------------|---------------|
| `chapters` (default) | Chapter ID | Imitation, Confessions, Story of a Soul | Load chapter by ID |
| `paragraphs` | Numbered paragraph | CCC, Canon Law | Query by `id` in XHTML |
| `articles` | Composite key | Summa Theologica | Query by `id` in XHTML |

### Runtime querying

For `paragraphs` and `articles` modes, the app can read the XHTML source files directly and extract elements by `id`:

```
1. Determine which XHTML file contains the target (from manifest TOC or convention)
2. Read the XHTML file
3. querySelector('#p795') to extract the element
4. Render the fragment in a WebView or native component
```

No build-time index is required. For dense reference works (CCC: 2,865 paragraphs), a lightweight map from paragraph ranges to filenames can live in the manifest or be computed from the TOC.

---

## Annotation Layers

Annotation layers attach supplementary content (commentary, study notes, patristic sources) to anchored locations in the base text. Layers are **additive** — adding commentary never modifies the base text.

### Declaration

Layers are declared in the manifest:

```json
{
  "layers": [
    { "id": "haydock", "name": { "en-US": "Haydock Commentary" } },
    { "id": "catena", "name": { "en-US": "Catena Aurea" } }
  ]
}
```

### Attachment patterns

Layer entries attach to anchors in the base text using three patterns:

| Pattern | Meaning | Example |
|---------|---------|---------|
| Single anchor | Attaches to one verse/paragraph/anchor | Commentary on verse 6 |
| Anchor range | Attaches to a range of anchors | Patristic commentary spanning verses 1-3 |
| Phrase match | Highlights a specific word within an anchor | Study note on "firmament" in verse 6 |

### Overlapping is expected

- Haydock comments on v1-v3, Catena comments on v2-v5 — verses 2-3 have both
- A verse-level note and a word-level note on the same verse coexist
- Multiple layers can reference the same anchor
- The reader collects all entries touching a given anchor and presents them

### Reader behavior

- Base text always loads; layers load on demand when toggled
- Blocks with annotations show a subtle indicator
- Tap to expand inline or view in bottom sheet
- Layer preferences persist per book
- Layer toggle in reader toolbar

### Layer content format

**TBD.** The layer content file format (how commentary text is stored and keyed to anchors) will be specified in a future revision. The declaration, attachment patterns, and reader behavior described above are stable.

Layer content files live in `sources/books/{bookId}/layers/{layerId}/` in source and `salty/layers/{layerId}/` in the EPUB bundle.

---

## Scripture Reference Format

### Ref format grammar

```
ref = location (";" location)*
location = book ":" chapter-spec

chapter-spec =
  | chapter                                    → whole chapter
  | chapter "-" chapter                        → chapter range
  | chapter "," chapter-list                   → non-contiguous chapters
  | chapter ":" verse-list                     → verses in one chapter
  | chapter ":" verse "-" chapter ":" verse    → cross-chapter verse range

verse-list = verse-or-range ("," verse-or-range)*
verse-or-range = verse | verse "-" verse
```

Semicolons separate independent locations (same or different books).

### Parsing rules

Count the colons to determine the level:
- `book:chapter` → whole chapter(s)
- `book:chapter:verse-list` → verses within a chapter
- `book:chapter:verse-chapter:verse` → cross-chapter verse range

### Numbering

- `numbering="lxx"` — Septuagint/Vulgate psalm numbering
- `numbering="mt"` — Masoretic numbering (default, omit when not needed)
- Only relevant for Psalms

### XHTML syntax

```xml
<a href="ember://scripture/john:8:12" class="scripture-ref"
   data-ref="john:8:12">John 8:12</a>

<a href="ember://scripture/psalms:22?numbering=lxx" class="scripture-ref"
   data-ref="psalms:22" data-numbering="lxx">Psalm 22</a>
```

### Canonical book names

Lowercase kebab-case. Catholic canon including deuterocanonical books.

**Old Testament:** genesis, exodus, leviticus, numbers, deuteronomy, joshua, judges, ruth, 1-samuel, 2-samuel, 1-kings, 2-kings, 1-chronicles, 2-chronicles, ezra, nehemiah, tobit, judith, esther, 1-maccabees, 2-maccabees, job, psalms, proverbs, ecclesiastes, song-of-solomon, wisdom, sirach, isaiah, jeremiah, lamentations, baruch, ezekiel, daniel, hosea, joel, amos, obadiah, jonah, micah, nahum, habakkuk, zephaniah, haggai, zechariah, malachi

**New Testament:** matthew, mark, luke, john, acts, romans, 1-corinthians, 2-corinthians, galatians, ephesians, philippians, colossians, 1-thessalonians, 2-thessalonians, 1-timothy, 2-timothy, titus, philemon, hebrews, james, 1-peter, 2-peter, 1-john, 2-john, 3-john, jude, revelation

### Abbreviation → canonical name mapping

| Abbreviations | Canonical name | Single chapter? |
|---|---|---|
| Gen, Gn | genesis | |
| Ex, Exod | exodus | |
| Lev, Lv | leviticus | |
| Num, Nm | numbers | |
| Deut, Dt | deuteronomy | |
| Josh, Jos | joshua | |
| Judg, Jgs | judges | |
| Ruth, Ru | ruth | |
| 1 Sam, 1 Sm | 1-samuel | |
| 2 Sam, 2 Sm | 2-samuel | |
| 1 Kgs, 1 Kings, III Kings | 1-kings | |
| 2 Kgs, 2 Kings, IV Kings | 2-kings | |
| 1 Chr, 1 Chron, 1 Par | 1-chronicles | |
| 2 Chr, 2 Chron, 2 Par | 2-chronicles | |
| Ezra, Ezr, 1 Esd | ezra | |
| Neh, 2 Esd | nehemiah | |
| Tob, Tb | tobit | |
| Jdt | judith | |
| Esth, Est | esther | |
| 1 Macc, 1 Mc | 1-maccabees | |
| 2 Macc, 2 Mc | 2-maccabees | |
| Job, Jb | job | |
| Ps, Psa, Psalm, Psalms | psalms | |
| Prov, Prv | proverbs | |
| Eccl, Eccles, Qoh, Qoheleth | ecclesiastes | |
| Song, Cant, Song of Sol, Canticle of Canticles | song-of-solomon | |
| Wis, Ws | wisdom | |
| Sir, Ecclus, Ecclesiasticus | sirach | |
| Isa, Is | isaiah | |
| Jer | jeremiah | |
| Lam | lamentations | |
| Bar | baruch | |
| Ezek, Ez | ezekiel | |
| Dan, Dn | daniel | |
| Hos | hosea | |
| Joel, Jl | joel | |
| Amos, Am | amos | |
| Obad, Ob | obadiah | yes |
| Jonah, Jon | jonah | |
| Mic, Mi | micah | |
| Nah, Na | nahum | |
| Hab, Hb | habakkuk | |
| Zeph, Zep | zephaniah | |
| Hag, Hg | haggai | |
| Zech, Zec | zechariah | |
| Mal | malachi | |
| Matt, Mt | matthew | |
| Mk | mark | |
| Lk | luke | |
| Jn | john | |
| Acts | acts | |
| Rom | romans | |
| 1 Cor | 1-corinthians | |
| 2 Cor | 2-corinthians | |
| Gal | galatians | |
| Eph | ephesians | |
| Phil | philippians | |
| Col | colossians | |
| 1 Thess, 1 Thes | 1-thessalonians | |
| 2 Thess, 2 Thes | 2-thessalonians | |
| 1 Tim | 1-timothy | |
| 2 Tim | 2-timothy | |
| Tit, Ti | titus | |
| Phlm, Philem | philemon | yes |
| Heb | hebrews | |
| Jas | james | |
| 1 Pet, 1 Pt | 1-peter | |
| 2 Pet, 2 Pt | 2-peter | |
| 1 Jn | 1-john | |
| 2 Jn | 2-john | yes |
| 3 Jn | 3-john | yes |
| Jude | jude | yes |
| Rev, Apoc | revelation | |

Single-chapter books (Obadiah, Philemon, 2 John, 3 John, Jude) always include chapter 1 in the ref: `jude:1:4`, not `jude:4`.

### Examples

| XHTML | `data-ref` value |
|-------|------------------|
| `<a ... data-ref="john:8:12">John 8:12</a>` | `john:8:12` |
| `<a ... data-ref="genesis:1:1-3">Genesis 1:1-3</a>` | `genesis:1:1-3` |
| `<a ... data-ref="1-corinthians:13:4-7">1 Cor 13:4-7</a>` | `1-corinthians:13:4-7` |
| `<a ... data-ref="psalms:22" data-numbering="lxx">Psalm 22</a>` | `psalms:22` (with `numbering: "lxx"`) |
| `<a ... data-ref="john:8:12-9:5">John 8:12-9:5</a>` | `john:8:12-9:5` |
| `<a ... data-ref="jude:1:4">Jude 4</a>` | `jude:1:4` |
| `<a ... data-ref="romans:8:28,31-39">Romans 8:28,31-39</a>` | `romans:8:28,31-39` |
| `<a ... data-ref="matthew:5:3;luke:6:20">Matt 5:3; Luke 6:20</a>` | `matthew:5:3;luke:6:20` |

---

## epub.js Integration Conventions

### Link interception

epub.js fires events when users tap links. The app intercepts custom URL schemes:

| URL pattern | Action |
|---|---|
| `ember://scripture/{ref}` | Open Bible reader at reference |
| `ember://scripture/{ref}?numbering=lxx` | Open with LXX numbering |
| `ember://book/{bookId}/{unit}` | Open another book at the specified unit |
| `ember://practice/{practiceId}` | Open practice flow |
| Relative `*.xhtml#fragment` | Internal navigation (epub.js handles natively) |

### Footnote popovers

epub.js does not auto-popover footnotes. The app intercepts taps on `epub:type="noteref"` links, extracts the referenced `epub:type="footnote"` content, and displays it in a custom popover or bottom sheet.

### Theme and preferences

epub.js supports theme injection via `rendition.themes`. The app applies user preferences (font size, font family, line height, theme/colors) through this API.

### Annotation rendering

For annotation layers, the app uses epub.js's `rendition.annotations` API to highlight anchored elements and injected CSS/JS for custom decoration.

### Fragment extraction

For practice flows and cross-references that need to display a small fragment (not the full book), the app reads the XHTML source file directly and extracts elements by `id`. These fragments are rendered in a plain WebView with `salty.css` applied — epub.js is not needed for fragment display.

---

## Content-Engine Integration

### ReadingReference variants

Extends the existing union at `packages/liturgical/src/types.ts`:

```typescript
type ReadingReference =
  | { type: 'bible'; book: string; bookName: string; chapter: number; startVerse?: number; endVerse?: number }
  | { type: 'catechism'; startParagraph: number; count: number }
  | { type: 'book'; bookId: string; chapterId: string }                    // chapter reading
  | { type: 'book-unit'; bookId: string; start: number; count: number }    // paragraph range
```

### LectioTrackDef source

Extends the existing type at `packages/content-engine/src/types.ts`:

```typescript
type LectioTrackDef =
  | { source: 'bible'; label: LocalizedText; entries: string[] }
  | { source: 'catechism'; label: LocalizedText; entries: string[] }
  | { source: 'book'; bookId: string; label: LocalizedText; entries: string[] }
  | { source: 'book'; bookId: string; label: LocalizedText; mode: 'sequential' }
```

Chapter-based track entries reference TOC path: `"book-1:ch-01"`, `"book-1:ch-02"`.

Sequential mode auto-generates entries by walking the TOC's leaf chapters.

Paragraph-addressable track entries: `"p1-p10"`, `"p11-p17"`.

### Prayer collection resolution

Prayer refs in `prayerCollection` entries resolve using scoped-prayer resolution:

1. Check `prayers/` in the book folder (scoped prayers)
2. Fall back to global prayer assets (`assets/prayers/`)
3. Cross-book refs use `bookId::prayerId` syntax

### Colocated practices

Practices in `practices/` use the standard `PracticeManifest` format — identical to `content/practices/`. They are discovered alongside book manifests and automatically namespaced with `book::{bookId}::{practiceId}`.

These practices can reference:
- Scoped prayers from the parent book's `prayers/` folder
- Lectio tracks through the parent book's prose chapters
- Any global prayer or content asset

The `prayerCollection` references them via `{ type: 'practice-ref', practiceId: 'book::oracoes-basicas::morning-prayers' }`.

### Discovery

Book manifests are discovered at bundle time. The registry provides:

```
getBook(id)              — manifest + EPUB path
getBookChapter(id, lang, chapterId) — XHTML file path or content
getScopedPrayer(bookId, prayerId)   — prayer JSON
getBookPractices(bookId)            — colocated practice manifests
getAllBooks()             — all book manifests
```

### Reading progress

A Zustand store tracks:
- Current book ID
- Current chapter ID
- Persisted to user preferences

Chapter-level progress is sufficient for MVP. Sub-chapter scroll position is deferred.

---

## Build Pipeline

### Build script

`packages/salty-epub-builder/` — a Node.js tool that packages XHTML source files into EPUB 3 bundles. No parsing or content transformation.

For each book with a `toc`:

1. Read `manifest.json`
2. For each language in `manifest.languages`:
   a. Walk the `toc` tree to collect leaf chapter IDs and their file paths
   b. Generate `package.opf` from manifest metadata
   c. Generate `nav.xhtml` from manifest `toc`
3. Generate `container.xml` with one `rootfile` per language
4. Copy shared assets (`salty.css`, images) to `shared/`
5. Copy all XHTML chapter files per language
6. Copy `salty/` directory (manifest.json, prayers, practices, layers)
7. Zip everything into a valid EPUB 3 (mimetype first, uncompressed)

Pure prayer collections (no `toc`) skip the build pipeline.

### Ingestion pipeline

For importing existing public domain texts:

```
Existing EPUB (Gutenberg, CCEL, Internet Archive)
  → unzip, extract XHTML chapters
  → clean HTML (strip non-semantic markup, normalize tags)
  → add Salty semantic attributes (scripture refs, anchors, container classes)
  → output: XHTML source files in sources/books/
```

This is simpler than the old pipeline (XHTML → Markdown) because the source and target formats are both XHTML. The "cleaning" step normalizes heading levels, adds `epub:type` and `class` attributes, detects scripture references, adds `id` attributes for anchors, and ensures XHTML well-formedness.

### Build-time validations

Prose validations (books with `toc`):

- **XHTML well-formedness**: XML parse each source file
- **Anchor uniqueness**: no duplicate `id` attributes within their scope (chapter-scoped or book-scoped)
- **Layer reference validity**: every layer entry anchor resolves to an `id` in the base text
- **Cross-book references**: target book and anchor exist
- **TOC consistency**: every TOC leaf has a corresponding `.xhtml` file per language
- **Language parity**: both language directories have the same chapter IDs
- **Link validity**: all `href="#..."` internal links resolve to existing `id` attributes
- **EPUB validation**: run `epubcheck` on the output

Prayer collection validations (books with `prayerCollection`):

- **Prayer ref resolution**: every `prayer` ref resolves to a file in `prayers/` or a global prayer asset
- **Practice ref resolution**: every `practice-ref` practiceId resolves to a practice in `practices/`
- **Practice manifest validity**: colocated practice manifests follow the standard `PracticeManifest` schema

### Build command

```bash
pnpm build-books                          # Build all books
pnpm build-books -- --book benedict-rule   # Build one book
```

---

## Use Cases

| Archetype | Example | TOC | Prayer Collection | Practices | Special features |
|-----------|---------|-----|-------------------|-----------|-----------------|
| Simple classic | Imitation of Christ | yes (2 levels) | no | no | Lectio track integration |
| Reference work | CCC | yes (4 levels) | no | no | `in-brief` containers, `addressable: "paragraphs"`, queryable by paragraph ID |
| Study Bible | Douay-Rheims + Haydock | yes (2 levels) | no | no | Verse anchors, annotation layers, multi-layer toggle |
| Composite reference | Summa Theologica | yes (3 levels) | no | no | `addressable: "articles"`, `sidebar` containers |
| Poetry-heavy classic | Dark Night of the Soul | yes (2 levels) | no | no | `poetry` containers for stanzas |
| Pure prayer collection | Orações Básicas | no | yes | yes | Scoped prayers, practice-refs, plan-of-life integration |
| Mixed book | Introduction to the Devout Life | yes (2 levels) | yes | yes | Prose chapters + meditation retreat practice + morning routine |

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Source format | XHTML files in git | Human-editable, diffable, directly queryable at runtime |
| Output format | EPUB 3 | W3C standard, readable in any EPUB reader, epub.js renders it |
| Multilingual strategy | Single EPUB per book, per-language OPFs | One file = one book, shared assets, app selects language at runtime |
| Rendering | epub.js + WebView | Full JS/CSS control, pagination, themes, annotations |
| Heading hierarchy | `<h1>` per chapter | Standard EPUB convention — each XHTML document starts at h1 |
| Container elements | `<aside>` for prayer/in-brief/sidebar; `<div>` for poetry | Semantic HTML: aside = tangential, div = presentation variant |
| Poetry line breaks | `<br/>` within `<p class="stanza">` | Standard EPUB pattern, works in all readers |
| Verses | `<span class="verse">` wrapping `<sup>` + text | Full verse queryable/highlightable; `<sup>` for the number |
| Numbered paragraphs | `<p class="numbered-paragraph">` | Natural wrapper, `data-paragraph` for programmatic use |
| Anchors | `id` on element; `data-anchors` for multiples | Standard web semantics, no wrapper elements |
| Paragraph anchor naming | `p795` instead of `¶795` | URL-safe, HTML id-safe |
| App-specific links | `ember://` URL scheme + `data-*` attributes | URL for runtime interception, data attrs for queryability |
| Footnotes | EPUB 3 standard (`epub:type` semantics) | Standard markup, app implements popover behavior |
| Annotation layers | Feature described, content format TBD | Declaration and behavior stable; file format needs more design |
| Prayer collections | JSON (unchanged) | Not prose, not EPUB content — separate rendering path |
| Build step | EPUB packaging only (no content transformation) | Source XHTML = EPUB content. Build just zips. |
| Per-language structure divergence | Same structure required | Different structure = different book ID, linked via `relatedEditions` |
| Queryability | Read XHTML files directly at runtime | No build-time index needed — HTML with `id` attributes IS the queryable format |

---

## Not in Scope

These are explicitly out of scope for this spec and will be addressed in separate specs when needed:

- **Reader UI** — screen layout, navigation, typography settings (separate feature spec)
- **Library browsing UI** — book discovery, search, categories (separate feature spec)
- **CDN download system** — on-demand book downloading, storage management
- **Full-text search** — search index generation
- **Images** — `<img>` element support reserved but not specified. Design when a book needs illustrations.
- **Red letter text** — `dominical` class for Jesus's words. Significant editorial effort.
- **Tables** — `<table>` for chronologies/comparison charts. Rare in spiritual classics.
- **Reading progress within chapters** — scroll position tracking beyond chapter-level cursors
- **Annotation layer content format** — how commentary text is stored and keyed to anchors (TBD)

---

## Future Directions

### CCC migration

The current flat `ccc.json` array can be migrated to the Salty book format with `addressable: "paragraphs"`. Paragraph-level querying via `getElementById` replaces the current array slicing.

### Library index

When we have 10+ books, a lightweight `library.json` manifest listing all available books will be needed for startup performance (avoid discovering many manifests).

### Deferred content types

- **Images**: `<img>` with `alt` and optional `<figcaption>`. Source images in `shared/images/`.
- **Tables**: for chronologies, comparison charts. Rare in spiritual classics.
- **Red letter**: CSS class for Jesus's words. Major editorial effort.

### Migration from libraries

The current library system (`content/libraries/`) is superseded by this unified book format. Migration:

| Current | Unified |
|---------|---------|
| `Library` manifest | `BookManifest` with `prayerCollection` |
| `sections` array | `prayerCollection` array |
| Library `practice` field | Colocated practice in `practices/` + `practice-ref` entry |
| `content/libraries/{id}/` | `sources/books/{id}/` (source) and book bundle (runtime) |
| `book::{libraryId}::{sectionId}` practice IDs | `book::{bookId}::{practiceId}` (unchanged convention) |
