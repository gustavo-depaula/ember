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
- [ ] Reader: let the reader switch a book to any of its languages (today: app language or the first)
- [ ] Bulk import: vatican.va
- [ ] Bulk import: DCO, papalencyclicals, veritatis
- [ ] Collection `collection/magisterium`
- [ ] DCO collected volumes → Denzinger gaps
- [ ] Councils
- [ ] Inventory artifact: imported status
- [ ] PR

## Open problems
