# Book Format

How to author a book under `content/books/`. A book is long-form prose (spiritual classics, catechisms, Church documents) read one language at a time in the foliate-based WebView reader (`apps/app/src/features/books/reader/`). `pnpm build:corpus` hashes each `(chapter, language)` file into its own blob, so a typo fix ships a few KB and a reader downloads only the language they read.

To group a book with related practices and chapters under a curated heading, add a `content/collections/<id>.json`: `sections[]`, each with a `title` and `blocks` of `{ "kind": "item", "ref": "book/<id>" }`. See `content/collections/montfort-spirituality.json`.

## Layout

```
content/books/<dir>/
  book.json          # metadata + TOC
  en-US/ch-01.md     # one directory per language, one file per TOC node
  pt-BR/ch-01.md
  images/            # referenced from chapters as ../images/<file>
```

- **A `book.json` marks a book; its directory path doesn't matter.** Intermediate directories without a `book.json` are organizational only (`aquinas-opera-omnia/catena-aurea/matthew/`). The corpus id is `book.json#id`, never the path, so regrouping directories never changes catalog ids.
- Language directories hold `.md` (primary) or `.html` chapters; if both exist for one id, `.html` wins. Filenames are the TOC node `id`, lowercase kebab-case.
- The build skips `images/`, `fonts/`, `sources/`, any directory starting with `_` (editorial scratch like `_review`), and the loose files `translation-journal.md`, `translator-notes-log.md`, `findings.md`, `needs-human-eyes.md`.
- Chapters in every language directory must use the same ids: alignment is per chapter, never per paragraph. An edition whose chapter structure genuinely differs is a **different book id**.

## `book.json`

The shape is `BookEntry` / `TocNode` in `apps/app/src/content/manifestTypes.ts`. Every book sets `id`, `name`, `author`, `description`, `languages`, `sources`, `toc` and `cover`; set `composed` when the date is known.

- **`sources`**: `[{ language, url, description }]`, the provenance of each language's text. Several books (the Trent catechism, both Pius X catechisms, Morrow, …) align *independent historical translations*, and `sources` is where that shows.
- **`cover`**: the generated bound-volume format for a book without art. One of `classic`, `gilt`, `label`, `quarter`, `arch`, `watermark`, `banded`, `missal` (`apps/app/src/features/covers/coverFor.ts`).

### Book id

`{author}-{title}`, kebab-case ASCII, ≤40 characters. Nested books carry their family prefix in the id (`aquinas-opera-omnia/catechetical-instructions/` → `aquinas-catechetical-instructions`).

1. **Author**: the name the author is commonly known by, with honorifics dropped (*Thomas à Kempis* → `kempis`, *St. Francis de Sales* → `francis-de-sales`, *Pope Leo XIII* → `leo-xiii`). Omit it for institutional documents (`trent-catechism`), Bibles, and anthologies with no single author.
2. **Title**: the original title for works written in English or Portuguese; otherwise the best-known English or Portuguese title.
3. **Simplify**: drop articles (*the, a, an, o, os, as, de, do, da, dos, das*, but keep a "de" that is part of an author's name) and subtitles. Transliterate accents, lowercase, and hyphenate.
4. **Editions**: use the unqualified id. Add a qualifier only when a second edition of the same work arrives.

| Work | ID |
|---|---|
| The Imitation of Christ, Thomas à Kempis | `kempis-imitation-of-christ` |
| True Devotion to Mary, St. Louis de Montfort | `montfort-true-devotion` |
| Catechism of the Council of Trent | `trent-catechism` |

### `composed`

A `number` only for an exact known year; everything else is a string.

| Granularity | Example |
|---|---|
| Exact year | `1418` |
| Approximate | `"c. 1418"` |
| Range | `"1370–1418"` |
| Approximate range | `"c. 354–430"` |
| Century | `"15th century"` |

Ranges take an en-dash `–`. Write `c.` with a space (not `ca.`, `circa` or `~`), and centuries as ordinals (not Roman numerals).

### TOC

Nodes nest arbitrarily. A node with `children` is a **group** (Part, Section); a node without children is a **leaf** (a chapter file).

A group may also have its own body file with the group's `id` (`<lang>/part-1.md`). That makes the Part a readable page for its introduction; without the file it only organizes the TOC. Reference works (e.g. the Catholic Encyclopedia) stay leaf-only.

```json
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
```

`pointRange: { from, to }` on a node shows a range of numbered points in the TOC, for books of numbered maxims.

### Titles

**The first `# H1` of each chapter body is the displayed title.** The reader restyles it by the node's role: a top-level group renders as a **part** (a large centered divider), a nested group as a **section**, and any leaf as a **chapter** (a centered title with a fleuron and drop cap). Lead every chapter `.md` with a single `# Title` and don't add a second one. To override the role inferred from depth, set `"role": "part" | "section" | "chapter"` on the node.

`toc[].title` is the **navigation label** (TOC sheet, search, completion toasts, scrubber). It should agree with the H1 but may be shorter or reordered.

`pnpm build:corpus` warns about a chapter with no leading H1, an H1 that shares no words with its TOC label, and a file whose name matches no TOC id (an orphan).

## Chapter markdown

The app converts markdown at read time with `marked` + `marked-footnote` (`apps/app/src/features/books/reader/bookContent.ts`).

- **Paragraph numbers the author chose are inert bold text** (`**47.**`), never `47. ` list markers. `marked` turns `N. ` runs into `<ol start>` and silently renumbers gaps and repeats, which destroys citation handles.
- Images live in the book's `images/` directory and are referenced as `../images/<file>`. The reader inlines them as data URIs.

### Image groups: `:::gallery` and `:::row`

```markdown
:::gallery
![Sacred Heart of Jesus](../images/batoni.jpg "Pompeo Batoni, 1767")
The most influential Sacred Heart painting.

![Pietà](../images/bouguereau.jpg "William-Adolphe Bouguereau, 1876")
:::

:::row{weights="2,1"}
![](../images/main.jpg)
![](../images/detail.jpg)
:::
```

`:::gallery` is a captioned snap-scroll carousel; `:::row` is a side-by-side composition that becomes a swipeable strip when the items don't fit. Inside either one, the alt text is the title, the image's quoted third argument is the attribution, and the paragraph right after an image is its caption. Blank lines separate items. Attributes: `display` (`carousel` | `stack` | `row`), `weights`, `caption`. Prose after the closing `:::` is ordinary markdown. The parser is `apps/app/src/features/books/markedGalleryExtension.ts`.

### Styling

The reader's stylesheet (fonts, reader-configurable size, leading and margins, pagination) lives in `apps/app/src/features/books/reader/foliate/bootstrap.raw.js`. Chapters carry structure, not styling. `build-corpus.py` would hash a shared `content/book.css` into each manifest's `style` if the file existed; it doesn't. The `style.css` files sitting in some language directories are never picked up by the build.

## External books

Copyrighted books (the Catechism and its Compendium from vatican.va, Escrivá's works) are never authored under `content/books/`. The app registers them at runtime (`apps/app/src/content/cccCatalog.ts`, `escrivaCatalog.ts`) as a `BookEntry` with `source: { type: 'external', producer, homepage }` and `{ type: 'external', url }` chapter refs. The reader then fetches each chapter through the named producer and caches it on the device. An `anchors` map (`"507" → { chapter }`) lets `book/ccc#507` open the right chapter without scanning. Licensing: `docs/content/content-sources.md`.
