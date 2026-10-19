# Magisterium import — running log

Autonomous run started 2026-10-19 07:08 UTC (scheduled by the user). Scope and decisions are in the
scheduled prompt; this log records how the work went and what is still open.

## How to run

```bash
# fetch + convert (resumable: research/magisterium/import-status.json records what's done)
uv run --with olefile --with beautifulsoup4 --with lxml python scripts/magisterium/import_documents.py [--host www.vatican.va] [--only ID …]
pnpm build:corpus
```

Fetched pages are cached under `scripts/_cache/magisterium/` (gitignored), so reruns are offline.

## Decisions

- Books live at `content/books/magisterium/<id>/`, each with one chapter `text` per language
  (`<lang>/text.md`). Catalog id is `book/<author>-<incipit-slug>`, e.g. `book/leo-xiii-rerum-novarum`.
- Language dirs: `en-US`, `pt-BR` (the app's codes), `zh-CN` / `zh-TW`, otherwise bare ISO (`la`, `it`, `ar`…).
  Latin first in `languages`, then en-US, pt-BR, then the rest alphabetically.
- One source per language: vatican.va wins, then papalencyclicals, veritatis, DCO (inventory order).
- Raw source pages are not committed (there would be ~7,000); each book's `sources` lists the URL per language.
- Text is never edited. Only site chrome is removed: language bars, share buttons, related posts and
  copyright lines. Linked footnotes become `[^n]`; unlinked notes stay as published at the end.
- vatican.va pages that carry only a PDF link (Chinese translations) are read from the PDF's text layer.
  The same goes for archive `.pdf` translations (Hebrew, Dutch). Bidi control characters are stripped.
  PDF paragraphing follows the layout and is imperfect.
- DCO `.doc` files are parsed directly (`scripts/magisterium/worddoc.py`, piece table), since there is no
  antiword or LibreOffice here. DCO's own catalogue line at the top of each file is dropped; Migne column
  markers (`[0432C]`) stay.
- A PDF with fewer than 150 extracted characters per page counts as a scan: no text, skipped.
- Inventory refinements made during import: Veritatis's Curia documents join their vatican.va record on
  date; CDF commentaries (`dominus-iesus-amato` …) moved to review.

## Progress

- [x] Pipeline check: 8 sample documents across all sources, `pnpm build:corpus` keeps every language
- [x] Reader: Language row in the reader menu, choice kept per book (cursor `book/<id>/language`)
- [x] Reader: chapters that exist only in other languages leave the reading flow and the contents
- [ ] Bulk import (all sources, one process; vatican.va paced at one request start per 2 s)
- [ ] Reconvert everything from cache after converter fixes (tables, `<` escaping, PDF-only pages)
- [ ] Collection `collection/magisterium` (generator written: scripts/magisterium/build_collection.py)
- [x] DCO collected volumes → Denzinger gaps: tried, nothing imported (see below)
- [x] Councils: 20 books, `council-<id>` (scripts/magisterium/import_councils.py, status in council-status.json)
- [ ] Inventory artifact: imported status
- [ ] PR

## Open problems

- Converter bugs found mid-run, fixed in sources.py; the bulk run started before them, so `--reconvert` must follow it:
  pandoc turned layout tables into "[TABLE]" (42 chapters by then), DCO conjectures `<clerum>` would render as tags,
  and Chinese pages with a short intro hid their PDF.
- DCO mislabels some files' language (a French translation filed as Greek). `check_script` skips a text filed under a
  language with its own script (Greek, Cyrillic, Arabic, Hebrew, CJK) when most of its letters aren't in that script.
- vatican.va names some files with both date orders across languages; the inventory keys vatican.va documents by
  date + slug so they merge.
- Denzinger gaps from collected volumes (`recover_denzinger.py`): searched 171 gap documents with a known incipit
  across their popes' Latin DCO files. A loose first pass "found" 8, but 7 were wrong (an index of incipits, a phrase
  quoted mid-text, 400-paragraph slices with no end). With the incipit required to open a paragraph and a heading
  required to close the letter, nothing qualifies: Migne volumes have no reliable letter boundaries in their text
  layer. Nothing imported; the gaps stay listed. The script stays for a later pass (e.g. with the Bullarium).
- Sources with no text: 59 papalencyclicals posts are empty placeholders on the site; 15 DCO files 404 at DCO itself
  (their wrapper pages too); DCO PDFs with no text layer are scans and count as no text (see import-status.json).
