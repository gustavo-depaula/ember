# Content Sources

## Summary Table

| Content | Source | License | Format | Offline? |
|---------|--------|---------|--------|----------|
| Bible (Douay-Rheims) | `xxruyle/Bible-DouayRheims` (GitHub) | MIT / Public Domain | JSON | Yes (bundled) |
| Bible (NABRE, RSV) | Bolls.life API | Free, no auth | REST API | Cached after first fetch |
| Catechism (CCC) | `nossbigg/catechism-ccc-json` (GitHub) | Scraped from Vatican | JSON | Yes (bundled) |
| Psalter & Hymns | `divinumofficium/divinum-officium` (GitHub) | MIT | Custom text -> JSON | Yes (bundled) |

---

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

## Attribution Requirements

The app should include an attribution/credits screen listing:

1. "Scripture texts (Douay-Rheims) are in the public domain."
2. "Online translations provided by Bolls.life."
3. "Catechism of the Catholic Church, copyright Libreria Editrice Vaticana."
4. "Liturgical texts from Divinum Officium (MIT License)."
5. Links to the GitHub repositories used.
