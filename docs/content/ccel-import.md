# CCEL Importer

Convert public-domain ThML files from the [Christian Classics Ethereal Library](https://ccel.org) into ready-to-edit Ember books.

> See `docs/content/book-format.md` for the target format. The importer emits `book.json` + per-language Markdown chapters into `content/libraries/ccel-classics/books/<bookId>/`, then `pnpm build:libraries` packages everything into a `.pray`.

## Quick start

```bash
# 1. Download the ThML XML from CCEL (find it on https://ccel.org/index/format/ThML)
curl -L -o /tmp/imitation.xml https://ccel.org/ccel/kempis/imitation/imitation.xml

# 2. Run the importer
python scripts/ccel-import.py \
  --input /tmp/imitation.xml \
  --library ccel-classics \
  --book-id kempis-imitation-of-christ \
  --chapter-level auto \
  --composed 1418

# 3. Hand-review the output
ls content/libraries/ccel-classics/books/kempis-imitation-of-christ/

# 4. Build & verify
pnpm build:libraries
```

## What the importer does

1. Parses the ThML file (HTML named entities pre-substituted; DOCTYPE stripped so `lxml` doesn't try to fetch a remote DTD).
2. Pulls `DC.Title`, `DC.Creator`, `DC.Date`, `DC.Language`, `DC.Identifier` from `<ThML.head>/<electronicEdInfo>`.
3. Walks `<div1>/<div2>/<div3>` and picks one as the **chapter level** — by default the deepest level whose median word count lands in `[500, 5000]`. Override with `--chapter-level div1|div2|div3`.
4. For each chapter, converts the body XML to Markdown:
   - `<p>` → paragraph
   - `<scripRef passage="…">text</scripRef>` → just the text (the `passage` attribute is dropped in v1; live scripture linking is a future feature, see `docs/content/book-format.md`)
   - `<note>` → Markdown footnote (`[^N]` + definition appended), rendered by `marked-footnote` in `bookReader.ts`
   - `<lg>`/`<l>` → blockquote with two-space hard breaks per line
   - `<q>` → curly-quoted inline
   - `<list>`/`<item>` → `- item`
   - `<i>`/`<emph>` → `*…*`, `<b>` → `**…**`
   - `<a href=…>` → text only (cross-document links dropped in v1; count logged)
   - `<scripCom>`/`<scripContext>`/`<pb/>`/`<a name=…>` → stripped
5. Emits `book.json` with ancestor-qualified TOC ids (`book-1-chapter-1`, etc.) and writes `<lang>/<id>.md` per leaf.
6. Idempotently appends the new book to `content/libraries/ccel-classics/library.json`.

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
- [ ] If the importer reported unknown elements, check whether they need a mapping (open an issue or extend `scripts/ccel/markdown.py`).
- [ ] Verify dropped link count is small (< 1% of paragraphs); if higher, audit before committing.

## Granularity tips

- Short devotional works (Imitation, Devout Life): `--chapter-level auto` usually picks `div2`.
- Massive multi-book works (Summa Contra Gentiles, Confessions): often want `--chapter-level div2` so each "Caput" / chapter is one file. `div1` would put a whole "Liber" in one chapter (too long).
- Use `--dry-run` to preview the TOC without writing files.

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
cd scripts && python3 -m unittest ccel.tests.test_importer -v
```

The tests run end-to-end against `scripts/ccel/tests/fixtures/sample.xml`, a synthetic ThML document that exercises every element the importer handles (DC fields, nested `divN`, `scripRef`, `note`, `lg`/`l`, `q`, `list`/`item`, `pb`, cross-doc `<a>`, named entities).
