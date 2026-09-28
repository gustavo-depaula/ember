# Content Sources

Where each text comes from, under what terms, and whether it may enter the corpus. The rule: public-domain and openly licensed text is built into the corpus from `content/`; in-copyright text is fetched at runtime by a source in `apps/app/src/sources/` (or `apps/app/src/lib/`) and cached on the device only, never in `content/`, the corpus, or any CI artifact.

| Content | Source | License | Status |
|---------|--------|---------|--------|
| Bible, Douay-Rheims | `github.com/xxruyle/Bible-DouayRheims` → `content/bible/drb/` | Text public domain (1749–1750); repo MIT | In corpus |
| Bible, other translations | Bolls.life API (`apps/app/src/lib/bolls.ts`) | Free, no auth; credit Bolls.life | Runtime, per chapter |
| Breviary texts, EF Mass propers, EF calendar | Divinum Officium (`content/do/` submodule) | MIT | In corpus |
| OF Mass propers, order, calendar (la/en/pt) | `ember-extra`, vendored into `content/of/` | English prayers are ICEL © | In corpus (see below) |
| Catechism (CCC) + Compendium | vatican.va | © Libreria Editrice Vaticana | Runtime external books |
| St. Josemaría Escrivá's works | escriva.org API | © Fundación Studium / Opus Dei | Runtime external books |
| Liturgy of the Hours (OF) | iBreviary | Third-party; credit required | Runtime |
| Gospel of the day, Words of the Popes | vaticannews.va "Word of the Day" | Third-party | Runtime |
| Daily Gospel commentary, meditation, articles | opusdei.org | Third-party | Runtime |

## Bible

- **Douay-Rheims** is the only major English Catholic Bible fully in the public domain, so it is the one translation in the corpus and the fallback for every other. `BibleCorps/ENG-B-DRC1750-pd-PSFM` (USFM, with Challoner's annotations) is a better-annotated alternative for cross-checking.
- **Bolls.life** serves the other translations (`GET /get-books/{t}/`, `/get-text/{t}/{bookid}/{chapter}/`, the catalog at `/static/bolls/app/views/languages.json`). The curated picker list is `suggestedTranslations` in `bolls.ts`.
- **Never use Bolls.life's own `DRB`**: it has 66 books and lacks all seven deuterocanonical books. The app's `DRB` is the corpus copy. A 66-book translation falls back to the corpus DRB for deuterocanonical books, as does any failed fetch.
- Rejected: Bible Gateway (no public API, terms forbid scraping); API.Bible (FUMS tracking forces online-only use).

## Catechism of the Catholic Church

Both the full CCC and the Compendium are external books (`book/ccc`, `book/compendium`): registered at runtime (`apps/app/src/content/cccCatalog.ts`), read in the standard book reader, scraped on demand from vatican.va, and cached in the on-device `external_content` SQLite table.

- **English**: `vatican.va/archive/ENG0015/`, IntraText pages (`__P*.HTM`) whose boundaries don't follow chapters. The paragraph→page map is precomputed in `apps/app/src/sources/ccc/en-pages.json` (regenerate with `scripts/build-ccc-en-index.mjs`); the text is frozen (2003).
- **Portuguese**: `vatican.va/archive/cathechism_po/`, one page per chapter with the paragraph range in the filename (`p1s1c1_26-49_po.html`).
- **Compendium**: one page per language (`apps/app/src/sources/ccc-compendium/`). Its cross-references link to `book/ccc#<range>`.
- `producer/ccc-chapter` (paragraph ranges for daily readings) extracts from the same scraper, in both languages.
- vatican.va serves Latin-1 and rejects requests without a browser User-Agent (`apps/app/src/sources/vatican/fetchPage.ts`).
- **Attribution:** "Catechism of the Catholic Church, copyright Libreria Editrice Vaticana." The Vatican generally permits non-commercial educational use.

## St. Josemaría Escrivá

Escrivá's works are **in copyright**, so they never enter the corpus. They are external books (`BookEntry.source = { type: 'external', producer: 'producer/escriva', homepage }`) fetched live from the publisher's own API (`https://escriva.org/api/v1`, client `apps/app/src/lib/escriva.ts`, work list `apps/app/src/content/escrivaWorks.ts`). A chapter is fetched on first open and cached in `external_content`; there is no bulk download, and pinning a book does not prefetch external chapters.

## Divinum Officium

`github.com/divinumofficium/divinum-officium`, MIT. `content/do/` is the repo as a git submodule, built into the corpus as-is and parsed on the device by `@ember/divinum-officium` (loader: `apps/app/src/sources/divinum-officium/loader.ts`). It supplies the traditional Breviary (hymns, antiphons, psalter, readings), the 1962 Mass propers and the EF calendar. Never edit inside the submodule.

## OF Mass propers (`ember-extra`)

Vendored from a pinned `ember-extra` commit into `content/of/`: temporal and sanctoral formularies, ordinaries, prefaces and calendar in Latin, English and Portuguese. Unlike the EF texts, the English OF collects, antiphons and other variable prayers are **ICEL-copyrighted**, and no free structured source for them exists. Treat the en-US OF propers as in-copyright text when deciding what to bundle or redistribute.

## Runtime web sources

All are native-only: the sites send no CORS headers, so web gets a notice or link-out. They set `dateScoped: true`, which keys the on-device cache per day.

- **iBreviary** (`apps/app/src/sources/ibreviary/`): today's Liturgy of the Hours for `practice/liturgy-of-the-hours` and the patristic reading. iBreviary asks integrators to credit the app when reusing its texts; that credit lives in the practice's manifest description, not inside each hour.
- **Vatican News** (`apps/app/src/sources/vatican-news/`): the Gospel of the day and "The words of the Popes" from the daily Word of the Day page. Offline or on web, the Gospel falls back to the corpus-computed OF Gospel.
- **Opus Dei** (`apps/app/src/sources/opus-dei/`, `apps/app/src/features/explore/opusDeiContent.ts`): the daily Gospel reflection (the "Reflection" tab of `practice/gospel-of-the-day`), `practice/opus-dei-meditation`, and the "From Opus Dei" row on Explore (Atom feed; card art comes from each article's `og:image`). From the Gospel page only the reflection is kept, since the scripture already lives in the practice. `parse.test.ts` runs trimmed real markup from `__fixtures__/` to catch site drift.

## Attribution

The credits screen should list:

1. "Scripture texts (Douay-Rheims) are in the public domain."
2. "Online translations provided by Bolls.life."
3. "Catechism of the Catholic Church, copyright Libreria Editrice Vaticana."
4. "Liturgical texts and traditional Mass propers from Divinum Officium (MIT License)."
5. "Liturgy of the Hours texts provided by iBreviary."
6. "Daily Gospel commentary and meditations courtesy of Opus Dei (opusdei.org)."
7. Links to the GitHub repositories used.
