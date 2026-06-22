# CTS Saint Booklets — raw import (staging, not yet integrated)

Raw scrape of the saint booklets offered on
[ecatholic2000.com/saints.shtml](https://www.ecatholic2000.com/saints.shtml).
These are digitized **Catholic Truth Society (CTS)** pamphlets — short, authored,
narrative lives of individual saints (plus a handful of Marian, devotional, and
sermon booklets that share the same index). Re-hosted by Wildfire Fellowship, Inc;
the underlying texts are old CTS pamphlets.

**Status:** faithful raw import only. No editorial transformation, no corpus
integration. How these become first-class content (one `book/` per saint vs. a
single `book/cts-saint-lives` collection vs. tap-through depth behind the existing
holy-card + pictorial-life saints) is **deferred** — see chat thread.

## What's here (committed kit)

- `scrape_cts.py` + `cts_saints_list.tsv` — the scraper and its input link list.
- `build_cts_book.py` — turns the scrape into `content/books/cts-lives-of-the-saints`
  (the curation rules: which 25 booklets are excluded, name fixes, OCR repairs).
- `manifest.json` — index of all 100 booklets (slug, source id+url, title, author,
  paragraph/char counts). The inventory record, including the excluded ones.

The bulky raw scrape itself (`md/` — 100 OCR'd markdown files, ~3.9 MB) is **not
committed**: the 75 curated lives already live in the book, and it's fully
regenerable. Recreate it with the two commands below.

Rough makeup: 79 saint lives/bios · 8 sermons (the Vianney set) · 8 devotional or
doctrinal · 5 Marian. ~3.9 MB of text total.

## Provenance & caveats

- **Source chain:** original CTS pamphlet (named author, early–mid 20c, mostly PD)
  → Internet Archive / Wildfire scan → ecatholic2000 OCR → this scrape.
- **OCR, not proofed.** Text is the site's OCR; expect occasional artifacts.
  Verify against Internet Archive originals before shipping any individual booklet.
- **Author rarely captured.** Only 3 booklets state author inline (`BY …`); the
  rest leave `author` empty — most CTS attributions live on the title page, which
  the site dropped. Fill these in during curation.
- **Licensing deliberately not vetted here** (per instruction). Confirm
  first-publication date per booklet before any of it ships.

## Regenerating

```sh
python3 scrape_cts.py content/_import/cts-saints   # re-scrape → md/ + manifest.json
python3 build_cts_book.py                          # re-curate → content/books/cts-lives-of-the-saints
```

The scraper uses a polite 0.6s delay and identifies as `ember-content-import`.
`md/` is git-ignored; only the kit above is tracked.
