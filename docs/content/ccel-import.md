# CCEL Importer

Convert public-domain ThML files from the [Christian Classics Ethereal Library](https://ccel.org) into ready-to-edit Ember books.

> See `docs/content/book-format.md` for the target format. The importer emits `book.json` + per-language Markdown chapters straight into `content/books/<bookId>/`, then `pnpm build:corpus` hashes each (chapter, lang) file into the v2 corpus.

## Quick start

```bash
# 1. Download the ThML XML from CCEL (find it on https://ccel.org/index/format/ThML)
curl -L -o /tmp/imitation.xml https://ccel.org/ccel/kempis/imitation/imitation.xml

# 2. Run the importer (lives at content/_archive/ccel-classics/scripts/ post-rename)
python content/_archive/ccel-classics/scripts/ccel-import.py \
  --input /tmp/imitation.xml \
  --book-id kempis-imitation-of-christ \
  --chapter-level auto \
  --composed 1418

# 3. Hand-review the output
ls content/books/kempis-imitation-of-christ/

# 4. Build & verify
pnpm build:corpus
```

## What the importer does

1. Parses the ThML file (HTML named entities pre-substituted; DOCTYPE stripped so `lxml` doesn't try to fetch a remote DTD).
2. Pulls metadata from `<ThML.head>` — both element form (`<DC.Creator scheme="short-form">…</DC.Creator>`) and HTML form (`<meta name="DC.Creator" content="…">`):
   - **Title**: prefers `DC.Title sub="Main"`.
   - **Author**: prefers `DC.Creator scheme="short-form"`, then `file-as`. Skips the bare `scheme="ccel"` slug.
   - **Composed date**: prefers `<firstPublished>`/`<published>` from `<generalInfo>` over `<DC.Date sub="Created">` (which is the digital-edition timestamp). Plain `DC.Date` only used when it's a pre-1900 4-digit year.
   - **Source URL**: prefers an http(s) `DC.Identifier`; otherwise synthesizes `https://www.ccel.org/ccel/<authorID>/<bookID>/`.
3. **Skips top-level "Indexes" / "Contents" / "Index of …" sections** — these are auto-generated navigation aids in CCEL files, not reading content.
4. Walks `<div1>/<div2>/<div3>` and picks one as the **chapter level** — by default the deepest level whose median word count lands in `[500, 5000]`. Override with `--chapter-level div1|div2|div3`.
5. For each chapter, converts the body XML to Markdown:
   - `<p>` → paragraph (whitespace-only `<p> </p>` spacers are dropped)
   - `<scripRef passage="…">text</scripRef>` → just the text (the `passage` attribute is dropped in v1; live scripture linking is a future feature, see `docs/content/book-format.md`)
   - `<note>` → Markdown footnote (`[^N]` + definition appended), rendered by `marked-footnote` in `bookReader.ts`
   - `<lg>`/`<verse>`/`<l>` → blockquote with two-space hard breaks per line
   - `<q>` → curly-quoted inline
   - `<list>`/`<item>` and `<ul>`/`<ol>`/`<li>` → `- item`
   - `<i>`/`<emph>` → `*…*`, `<b>` → `**…**`
   - `<a href=…>` → text only (cross-document links dropped in v1; count logged)
   - `<scripCom>`/`<scripContext>`/`<pb/>`/`<a name=…>`/`<img>`/`<index>`/`<indexterm>` → stripped
   - Leading sub-headings inside a chapter body (CCEL's `<h4>The First Chapter</h4>` / `<h3>{title}</h3>` print decorations) are dropped — we already inject our own `# {title}` H1.
6. Emits `book.json` with ancestor-qualified TOC ids (`book-1-chapter-1`, etc.) and writes `<lang>/<id>.md` per leaf. Slugs prefer `(type, n)` pairs (`chapter-1`), then a "PART/BOOK/CHAPTER N" prefix detected in the title (`part-i`, `chapter-vii`), then the first six words of the title.
7. Idempotently appends the new book to `content/libraries/ccel-classics/library.json`.

## Finding ThML URLs on CCEL

The format index is at `https://ccel.org/index/format/ThML`. URLs follow `https://ccel.org/ccel/<author>/<work>/<work>.xml`, e.g.:

| Work | URL |
|------|-----|
| Imitation of Christ (à Kempis) | `https://ccel.org/ccel/kempis/imitation/imitation.xml` |
| Confessions (Augustine) | `https://ccel.org/ccel/augustine/confessions/confessions.xml` |
| Summa Contra Gentiles (Aquinas) | `https://ccel.org/ccel/aquinas/gentiles/gentiles.xml` |
| Introduction to the Devout Life (de Sales) | `https://ccel.org/ccel/desales/devout_life/devout_life.xml` |

If the work has multi-file ThML (CCEL splits some long works), use the master `.xml` first; the importer can also be re-run per file with the same `--book-id` once the manifest exists.

## Hand-review checklist

After import, before committing:

- [ ] `book.json`: `id` matches the folder name; `composed` looks right; `sources[].url` points back to CCEL.
- [ ] TOC tree: ancestor groups make sense (Books → Chapters); leaf ids are unique and human-readable.
- [ ] Spot-check 3+ chapter `.md` files:
  - Paragraphs read naturally (no orphaned XML, no doubled-up footnote markers).
  - Scripture quotes preserve their text but no `passage="…"` leaks through.
  - Footnotes appear at the bottom and resolve.
  - Verse / poetry blocks render as blockquotes.
- [ ] If the importer reported unknown elements, check whether they need a mapping (open an issue or extend `content/libraries/ccel-classics/scripts/ccel/markdown.py`).
- [ ] Verify dropped link count is small (< 1% of paragraphs); if higher, audit before committing.

## Granularity tips

- Short devotional works (Imitation, Devout Life): `--chapter-level auto` usually picks `div2`.
- Massive multi-book works (Summa Contra Gentiles): `auto` lands on `div2` (each chapter), giving ~387 short readable files.
- Augustine's Confessions: CCEL's source uses **only `<div1>` per book** with paragraph-marked chapter headings inside (`<p class="chapter">CHAPTER I</p>`). `auto` picks `div1`, producing 13 large book-length files. Pass `--chapter-level div1` (or just leave it on auto) and accept the granularity, or hand-split later. Promoting the inline chapter-paragraphs to H2s is a future improvement.
- Use `--dry-run` to preview the TOC without writing files.

## Pilot books imported

Battle-tested on the four pilot works in `ccel-classics`:

| Book | Source | Chapters | Notes |
|------|--------|---------:|-------|
| Imitation of Christ (à Kempis) | `kempis/imitation.xml` | 116 | 4 books × ~30 chapters each |
| Introduction to the Devout Life (de Sales) | `desales/devout_life.xml` | 120 | Pass `--composed 1609` (DC.Date is the digitization timestamp). |
| Confessions (Augustine) | `augustine/confessions.xml` | 15 | Each "Book" = one file. Pass `--composed 397`. |
| Summa Contra Gentiles (Aquinas) | `aquinas/gentiles.xml` | 387 | Title is "Of God and His Creatures" (Rickaby's English title). Pass `--composed 1259-1265`. |

## Licensing & attribution

CCEL's underlying texts are largely public domain in the US; CCEL claims copyright only on its formatting/encoding work. Because the importer emits **fresh Markdown** derived from the public-domain text, we are not redistributing CCEL's claimed-copyrighted formatting.

Every imported book should:

1. Cite the CCEL URL in `book.json` `sources[]` (the importer does this automatically).
2. Acknowledge CCEL in the library `description` (already done in `ccel-classics/library.json`).
3. **Manually verify** the rights statement on the work's CCEL page before publishing — a small number of CCEL works are translator-restricted.

## Cross-document references

Bible references (`<scripRef>`) are the dominant kind. They're preserved as visible text in v1; live linking to the in-app Bible reader is future work tracked in `docs/content/book-format.md` ("Future Directions").

CCEL inter-work links (`<a href="ccel:augustine/confessions">…`) are dropped; the visible citation text remains. A v2 path could rewrite these to in-Ember links once a CCEL-id → Ember-bookId registry is maintained.

## Tests

```bash
cd content/libraries/ccel-classics/scripts && python3 -m unittest ccel.tests.test_importer -v
```

The tests run end-to-end against `content/libraries/ccel-classics/scripts/ccel/tests/fixtures/sample.xml`, a synthetic ThML document that exercises every element the importer handles (DC fields, nested `divN`, `scripRef`, `note`, `lg`/`l`, `q`, `list`/`item`, `pb`, cross-doc `<a>`, named entities).
