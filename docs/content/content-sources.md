# Content Sources

Where each text comes from, under what terms, and whether it may enter the corpus. The rule: public-domain and openly licensed text is built into the corpus from `content/`; in-copyright text is fetched at runtime by a source in `apps/app/src/sources/` (or `apps/app/src/lib/`) and cached on the device only, never in `content/`, the corpus, or any CI artifact.

| Content | Source | License | Status |
|---------|--------|---------|--------|
| Bible: Douay-Rheims, CPDV, Clementine Vulgate, Haydock's commentary | USFM → `content/bible/<translation>/` via `scripts/import-bible-usfm.py`, `scripts/import-haydock.py` | Public domain | In corpus |
| Bible: Knox, Matos Soares | Web pages → `content/bible/<translation>/` via `scripts/import-bible-web.py` | No rights holder asserts a claim; several publishers print them | In corpus |
| Bible: Ave Maria | The Claretians' API (`apps/app/src/sources/bible/`) | In copyright | Runtime, per chapter |
| Breviary texts, EF Mass propers, EF calendar | Divinum Officium (`content/do/` submodule) | MIT | In corpus |
| OF Mass propers, order, calendar (la/en/pt) | `ember-extra`, vendored into `content/of/` | English prayers are ICEL © | In corpus (see below) |
| Catechism (CCC) + Compendium | vatican.va | © Libreria Editrice Vaticana | Runtime external books |
| St. Josemaría Escrivá's works | escriva.org API | © Fundación Studium / Opus Dei | Runtime external books |
| Liturgy of the Hours (OF) | iBreviary | Third-party; credit required | Runtime |
| Gospel of the day, Words of the Popes | vaticannews.va "Word of the Day" | Third-party | Runtime |
| Daily Gospel commentary, meditation, articles | opusdei.org | Third-party | Runtime |

## Bible

The picker's list is `translations` in `apps/app/src/lib/bibleTranslations.ts`. Every translation files its books under the Douay slugs (`1-kings`, `psalms`, `apocalypse`), so a reference or a reading position opens the same book in any of them.

**In the corpus** (`content/bible/<dir>/`, one `<slug>.json` per book as `{chapter: {verse: text}}`):

| Code | Translation | Source | Rebuilt by |
|------|-------------|--------|------------|
| `DRB` | Douay-Rheims, Challoner's revision (1749–52) | `github.com/BibleCorps/ENG-B-DRC1750-pd-PSFM` | `import-bible-usfm.py drb` |
| `CPDV` | Catholic Public Domain Version (Conte, 2009) | `github.com/BibleCorps/ENG-B-CPDV2009-pd-PSFM` | `import-bible-usfm.py cpdv` |
| `VULG` | Clementine Vulgate | `ebible.org/Scriptures/latVUC_usfm.zip` | `import-bible-usfm.py vulgate` |
| `KNOX` | Knox Bible (1945–50) | `bibliacatolica.com.br/the-knox-bible/` (the same text as Baronius Press's `catholicbible.online/knox/`, which cuts off a crawl partway) | `import-bible-web.py knox` |
| `MS` | Matos Soares, 1956 edition | `liriocatolico.com.br/biblia_online/biblia_matos_soares/`, with the owner's consent | `import-bible-web.py matos-soares` |

- The Douay-Rheims is the fallback for every other translation: offline, or for a chapter the other numbers differently. The import keeps Challoner's chapter arguments and book introductions (`summaries.json`). Checked verse by verse against ebible.org's 1899 edition (`engDRA`): the same text. The source ran the last verse of seven chapters into the one before (John 11:57, 2 Corinthians 1:24, Genesis 5:32, 2 Kings 13:39, Psalms 28:11 and 150:6, Amos 9:15); the import splits them so references resolve.
- **Haydock's commentary** (`content/bible/haydock/`, from `github.com/cmahte/ENG-B-Haydock1883-pd-PSFM`, the USFM of the transcription at `johnblood.gitlab.io/haydock`) is data only so far: `{chapter: {verse: [note, …]}}` per book against the Douay-Rheims' verses, and `intros.json`. Nothing renders it yet.
- Footnotes are in the other sources too and not imported: Challoner's annotations, Conte's notes, the Glossa Ordinaria in the Vulgate, Knox's and Matos Soares' notes.
- The CPDV prints Esther in the Greek order (15 chapters, where the Douay has 16).
- Knox and Matos Soares are in the corpus on the owner's finding that no one asserts copyright over these texts and several publishers print them. Knox died in 1957, as did Matos Soares, so both are public domain under life+70 from 1 January 2028.
- Lírio Católico sits behind Cloudflare, which turns away some non-browser clients; the importer sends an `okhttp` User-Agent.

**Read from the publisher** (in copyright; one chapter per request, kept in the on-device `external_content` table):

| Code | Translation | Source |
|------|-------------|--------|
| `AM` | Bíblia Ave Maria | The Claretians' API, `biblia.parresia.com/wp-json/bible/v2/chapter/<livro>_<n>` (behind `claretianos.com.br/biblia-ave-maria-online/`); CORS open, so it reads on web too |

- The Ave Maria numbers the Psalms as the Vulgate does but follows the Hebrew chapter divisions elsewhere (Joel has 4 chapters, Malachi 3).

**Not in yet:**

- **Bíblia CNBB.** In copyright, and Edições CNBB enforces it (Lírio Católico withdrew its copy). Three copies exist, none clean:
  - `clerus.org/bibliaclerusonline/pt/66c.htm` (the Dicastery for the Clergy): all 73 books as static HTML on opaque filenames, several chapters to a page, no API and no CORS.
  - `catolicaflix.com/biblia/biblia-cnbb`: one PDF per book (Word exports of 2008, real text layer), all 73 books. It shares clerus's gaps (Haggai 1:9 runs into verse 13), so both come from the same files.
  - The Bolls.life export: a different printing, 66 books only (no deuterocanon, Daniel 3 without the canticle), with book-introduction prose spliced into 1 Samuel 1:19. It is the one copy that has the passages the other two lost.
- **Original Douay-Rheims (1582, 1609–10).** EEBO-TCP `A16049` and `A11777` are clean on rights but in original spelling, the Old Testament without reliable verse marks. `github.com/janvier-s/original-douay-rheims` is modern-spelling JSON marked CC0, of unverified provenance.
- **Kenrick's revision, Figueiredo.** Page scans only (archive.org).
- Rejected: Bolls.life (no deuterocanon in its Douay-Rheims or its CNBB); Bible Gateway (no public API, terms forbid scraping); API.Bible (FUMS tracking forces online-only use).

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

1. "Scripture texts: Douay-Rheims, Catholic Public Domain Version, Clementine Vulgate, Knox Bible, Bíblia Matos Soares; commentary by Fr. George Leo Haydock."
2. "Bíblia Ave Maria from the Claretian Missionaries."
3. "Catechism of the Catholic Church, copyright Libreria Editrice Vaticana."
4. "Liturgical texts and traditional Mass propers from Divinum Officium (MIT License)."
5. "Liturgy of the Hours texts provided by iBreviary."
6. "Daily Gospel commentary and meditations courtesy of Opus Dei (opusdei.org)."
7. Links to the GitHub repositories used.
