# Content Sources

## Summary Table

| Content | Source | License | Format | Offline? |
|---------|--------|---------|--------|----------|
| Bible (Douay-Rheims) | `xxruyle/Bible-DouayRheims` (GitHub) | MIT / Public Domain | JSON | Yes (bundled) |
| Bible (NABRE, RSV) | Bolls.life API | Free, no auth | REST API | Cached after first fetch |
| Catechism (CCC) | `nossbigg/catechism-ccc-json` (GitHub) | Scraped from Vatican | JSON | Fetched at deploy time |
| Psalter & Hymns | `divinumofficium/divinum-officium` (GitHub) | MIT | Custom text -> JSON | Yes (bundled) |
| EF Mass Propers | Divinum Officium (bundled) | MIT | Bundled JSON | Yes (bundled) |
| OF Mass Propers | `ember-extra` (vendored) | See repo | Bundled JSON | Yes (bundled) |
| Liturgical Calendar | Catholic Readings API (GitHub Pages) | MIT | REST JSON | Cached after fetch |
| St. Josemaría Escrivá works | escriva.org API (`/api/v1`) | © Fundación Studium / Opus Dei | REST JSON | Cached after first fetch (never in Hearth) |

---

## St. Josemaría Escrivá (escriva.org API)

- **Source:** the official `https://escriva.org/api/v1` API (publisher: Fundación Studium / Opus Dei).
- **License:** Escrivá's works are **in copyright**. We therefore **never persist them into Hearth** — the texts are fetched live from the publisher's own API and cached per-device only. This is the deliberate exception to "everything is in the corpus": the books are modeled as *external books* (`BookEntry.source = { type: 'external', producer: 'producer/escriva', homepage }` with external `ChapterRef`s).
- **Languages:** the app's two languages map to escriva.org *site ids* — `en-US` → site `1`, `pt-BR` → site `6` (`GET /sites/`).
- **Endpoint families** (selected by a book's `book_group`):
  - `base` — `/chapters?book_id=` (thematic chapters) + `/points?chapter_id=` (numbered paragraphs, HTML).
  - `cartas` — `/cartas-chapters` + `/cartas-points` (the pastoral letters).
  - `one-level` / `holy-rosary` — `/one-level-texts?book_id=` (each text is a whole chapter; the Rosary and Way of the Cross).
  - All list endpoints paginate with `limit`/`offset` and a `next` url.
- **How it's wired:** `apps/app/src/lib/escriva.ts` (client) → `content/escrivaWorks.ts` (curated work list + collection, baked into the app) → `content/escrivaCatalog.ts` (runtime catalog registration + on-demand `BookEntry` build) → reader external-ref branch in `features/books/reader/bookContent.ts`. Chapter HTML is cached in the existing `external_content` SQLite table under `producer/escriva`.
- **Offline:** on-demand + cache. A chapter is fetched once on first open and re-read offline thereafter; there is no bulk download and pinning does not prefetch external chapters.

## Bible Text

### Bundled: Douay-Rheims (Primary Offline Translation)

- **Source:** `github.com/xxruyle/Bible-DouayRheims`
- **License:** MIT (the text itself is public domain — published 1749-1750)
- **Format:** JSON, individual files per book, 73 books (full Catholic canon including deuterocanonicals)
- **Usage:** Bundle in `assets/bible/drb/` — one JSON file per book
- **Why this source:** Only major English Catholic Bible that is fully public domain. The JSON format is ready to use with minimal processing.

**Alternative for cross-verification:** `BibleCorps/ENG-B-DRC1750-pd-PSFM` — USFM format with Challoner's annotations. Higher scholarly quality but needs more parsing.

### Online: Bolls.life API (Multiple Translations)

- **Base URL:** `https://bolls.life`
- **Auth:** None required
- **Cost:** Free
- **Rate limits:** Not documented; appears generous for reasonable use

**Suggested Catholic translations (curated, shown first in the picker):**

| Code | Translation | Books | Language |
|------|------------|-------|----------|
| DRB | Douay-Rheims Bible | 73 | English (bundled offline) |
| NABRE | New American Bible Revised Edition | 73 | English |
| RSV | Revised Standard Version | 73 | English |
| NRSVCE | New Revised Standard Version Catholic Edition | 73 | English |
| RSV2CE | Revised Standard Version 2nd Catholic Edition | 73 | English |
| NJB1985 | New Jerusalem Bible | 73 | English |
| CNBB | Bíblia CNBB | 73 | Portuguese |
| VULG | Vulgata Latina | 73 | Latin |

The full Bolls.life catalog (30+ languages, 100+ translations) is also available via an "All Translations" section in the picker, fetched from `GET /static/bolls/app/views/languages.json`.

**Note:** The Bolls.life DRB (Douay-Rheims) only has 66 books — it is **missing all 7 deuterocanonical books**. Do not use it for Catholic purposes. Use the bundled version from xxruyle instead. Non-Catholic translations (66 books) work fine but fall back to DRB when the user navigates to deuterocanonical books.

**Endpoints:**

```
GET /get-books/{translation}/
  -> Returns array of { bookid, name, chapters } for all books in that translation

GET /get-text/{translation}/{bookid}/{chapter}/
  -> Returns array of { pk, verse, text } for all verses in that chapter

GET /v2/find/{translation}?search={term}
  -> Search within a translation
```

**Caching strategy:**
- When user reads a chapter online, cache the full response in SQLite (`cached_translations` table)
- On subsequent reads, serve from cache
- Cache never expires (Bible text doesn't change)
- User can clear cache in settings if needed

### Not Viable

- **Bible Gateway:** No public API (discontinued). Terms prohibit scraping.
- **API.Bible:** FUMS tracking requirement implies online-only usage. Unclear Catholic translation availability. Poor fit for offline app.

---

## Catechism of the Catholic Church

### Source: `nossbigg/catechism-ccc-json`

- **GitHub:** `github.com/nossbigg/catechism-ccc-json`
- **Format:** JSON, organized by paragraphs with section hierarchy
- **Content:** Complete CCC (~2,865 paragraphs)
- **Scraped from:** vatican.va/archive/ENG0015/_INDEX.HTM

**Alternative:** `aseemsavio/catholicism-in-json` — also includes Canon Law and GIRM, but flatter structure (array of `{id, text}` objects).

**Recommendation:** Use `nossbigg/catechism-ccc-json` for better structural organization (section/chapter hierarchy maps well to the office reading flow).

**Reading pace:** 2,865 paragraphs / 365 days = ~7.8 paragraphs per Compline reading.

**Attribution:** Add "Catechism of the Catholic Church, copyright Libreria Editrice Vaticana" in the app's about/attribution screen. The Vatican generally permits non-commercial educational use.

---

## Hymns & Liturgical Texts

### Source: Divinum Officium

- **GitHub:** `github.com/divinumofficium/divinum-officium`
- **License:** MIT
- **Content:** Complete traditional Latin Breviary texts — hymns, antiphons, psalms, responsories, readings, prayers
- **Location in repo:** `web/www/horas/Latin/` and `web/www/horas/English/`
  - `Psalterium/` — psalter with hymns for each hour
  - `Tempora/` — temporal cycle (Advent, Lent, Easter, etc.)
  - `Sancti/` — sanctoral cycle (saints' feasts)
  - `Commune/` — common texts

**Format:** Custom bracket-based text format (not JSON). Example:
```
[Hymnus]
Te lucis ante terminum,
Rerum Creator, poscimus,
...
```

**Processing needed:** Parse the bracket format into structured JSON for the app. This is a one-time build step.

**What we need from it:**
- Hymn texts for Morning, Evening, and Compline (seasonal rotation)
- Marian antiphons (4 seasonal antiphons for Compline)
- Canticle texts (Benedictus, Magnificat, Nunc Dimittis) — though these could also come from the bundled Bible
- Opening/closing prayers for each hour

---

## Fixed Prayer Texts (Bundled)

These are well-known prayers that don't need an external source — just bundle them as static JSON/strings:

- Our Father (Pater Noster)
- Hail Mary (Ave Maria)
- Glory Be (Gloria Patri)
- Benedictus (Canticle of Zechariah) — Luke 1:68-79
- Magnificat (Canticle of Mary) — Luke 1:46-55
- Nunc Dimittis (Canticle of Simeon) — Luke 2:29-32
- Marian Antiphons (Alma Redemptoris, Ave Regina, Regina Caeli, Salve Regina)
- Sign of the Cross
- Opening verse ("Deus, in adiutorium meum intende...")

---

## Daily Mass Readings & Propers

### What Changes Daily in the Mass

**Readings:** First Reading, Responsorial Psalm, Second Reading (Sundays/Solemnities only), Gospel Acclamation, Gospel.

**Propers:** Entrance Antiphon, Collect, Prayer over the Offerings, Preface, Communion Antiphon, Prayer after Communion.

**Cycles:** Sundays use a 3-year rotation (A/B/C, determined by `year % 3`). Weekdays use a 2-year rotation (I/II, odd/even years, affecting First Reading only). Sanctoral cycle runs simultaneously — higher-ranked feasts override weekday readings.

### Missale Meum API (Historical Reference)

> **Note:** EF propers are now bundled from Divinum Officium data parsed at build time (see Current Implementation below). The Missale Meum API was used previously and is documented here for reference.

- **Base URL:** `https://www.missalemeum.com/{lang}/api/v5/proper/{YYYY-MM-DD}`
- **Docs:** https://www.missalemeum.com/docs (Swagger) / https://www.missalemeum.com/redoc
- **Auth:** None
- **Cost:** Free, open source
- **Content:** Complete daily Mass propers for the 1962 Missal — Introit, Collect, Epistle, Gradual, Gospel, Offertory, Secret, Preface, Communion Antiphon, Postcommunion. Bilingual Latin/English.
- **Source data:** Divinum Officium

**Response shape:** Array of proper objects. Each has `info` (id, title, colors, rank, date, commemorations) and `sections` (array of `{ id, label, body }` where `body` is `[english, latin]` pairs). Section IDs: `Introitus`, `Oratio`, `Lectio`, `Graduale`, `Tractus`, `Evangelium`, `Offertorium`, `Secreta`, `Prefatio`, `Communio`, `Postcommunio`, `Super populum`, and `Commemoratio` variants. Multiple propers returned when temporal and sanctoral celebrations overlap.

**Other endpoints:** `GET /{lang}/api/v5/calendar/{year}` (liturgical calendar), `GET /{lang}/api/v5/ordo` (fixed texts), `GET /{lang}/api/v5/votive` (votive Mass list).

**Verdict:** Perfect for EF. One API call per day gives everything.

### Catholic Readings API (OF Calendar + References)

- **Readings:** `https://cpbjr.github.io/catholic-readings-api/readings/{YYYY}/{MM-DD}.json`
- **Calendar:** `https://cpbjr.github.io/catholic-readings-api/liturgical-calendar/{YYYY}/{MM-DD}.json`
- **Auth:** None (GitHub Pages, CORS enabled)
- **Cost:** Free, MIT license
- **Coverage:** 2025-2026 data available
- **Content:** Scripture references (not full text) + liturgical day metadata (season, celebration, feast type, saint info)

**Quirks:** `psalm` field sometimes references non-psalm books (e.g., Jeremiah). Cross-chapter ranges use em-dash (—). `secondReading` absent on weekdays.

### `ember-extra` (OF Mass Propers — Vendored)

- **Source:** Vendored from a pinned `ember-extra` commit into `content/libraries/base/of/` (see `docs/mass-rework-journal.md`).
- **Content:** Complete OF Mass propers — temporal + sanctoral formularies, ordinaries, prefaces, calendar — in Latin, English, and Portuguese.
- **Status:** Integrated via `packages/mass-of/`.

### Current Implementation

| Form | Data | Source | Status |
|------|------|--------|--------|
| EF | All propers | Divinum Officium (bundled) | Implemented |
| OF | All propers (LA, EN, PT) | `ember-extra` (vendored) | Implemented |

---

## Attribution Requirements

The app should include an attribution/credits screen listing:

1. "Scripture texts (Douay-Rheims) are in the public domain."
2. "Online translations provided by Bolls.life."
3. "Catechism of the Catholic Church, copyright Libreria Editrice Vaticana."
4. "Liturgical texts from Divinum Officium (MIT License)."
5. "Traditional Mass propers parsed from Divinum Officium (MIT License)."
6. "Liturgical calendar data from Catholic Readings API (MIT License)."
7. Links to the GitHub repositories used.
