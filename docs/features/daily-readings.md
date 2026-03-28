# Daily Mass Readings — Feature Research

## Goal

Fill the `proper` placeholder slots in the Ordo Missae with actual daily-changing texts: readings, collects, antiphons, and prayers. Also provide a standalone "Today's Readings" screen.

## What Changes Daily in the Mass

### Readings (Liturgy of the Word)

- **First Reading** — usually OT (or Acts during Easter)
- **Responsorial Psalm** — psalm verses with a response line (sometimes from a non-psalm book, e.g. Jeremiah)
- **Second Reading** — epistles (Sundays and Solemnities only)
- **Gospel Acclamation** — "Alleluia + verse" (replaced during Lent)
- **Gospel** — always from Matthew, Mark, Luke, or John

### Propers (Variable Prayers)

- **Entrance Antiphon** (Introitus)
- **Collect** (opening prayer)
- **Prayer over the Offerings** (Secreta)
- **Preface** (seasonal or proper)
- **Communion Antiphon**
- **Prayer after Communion** (Postcommunio)
- **Prayer over the People** (certain days, especially Lent)

### Liturgical Calendar Cycles

**Sundays:** 3-year rotation (A/B/C)
- Year A = Matthew, Year B = Mark, Year C = Luke (John fills in during Easter)
- Determined by: `year % 3` → 0=A, 1=B, 2=C (starting from Advent)

**Weekdays:** 2-year rotation (I/II)
- Year I = odd calendar years, Year II = even
- Only affects the First Reading; the Gospel follows a 1-year cycle

**Liturgical seasons:** Advent → Christmas → Ordinary Time → Lent → Easter Triduum → Easter → Ordinary Time

**Sanctoral cycle** runs simultaneously — feasts ranked: Solemnity > Feast > Memorial > Optional Memorial. Higher-ranked feasts override weekday readings.

---

## Available Data Sources

### Missale Meum API — EF Complete Propers

The best source found. Provides **every variable part** of the 1962 Mass in bilingual Latin/English.

- **URL:** `https://www.missalemeum.com/{lang}/api/v5/proper/{YYYY-MM-DD}`
- **Docs:** https://www.missalemeum.com/docs (Swagger) / https://www.missalemeum.com/redoc
- **Auth:** None
- **Cost:** Free, open source
- **Source data:** Divinum Officium (already used by our app for hymns)
- **Languages:** `en`, `pl` (English, Polish)

**Response shape:**
```json
[
  {
    "info": {
      "id": "tempora:Quad5-6:3:v",
      "title": "Saturday of Passion Week",
      "colors": ["v"],
      "rank": 3,
      "date": "2026-03-28",
      "commemorations": ["St. John of Capistrano"]
    },
    "sections": [
      {
        "id": "Introitus",
        "label": "Introit",
        "body": [
          ["English text with *Ps 30:10* references...", "Latin text..."]
        ]
      },
      { "id": "Oratio", "label": "Collect", "body": [["...", "..."]] },
      { "id": "Lectio", "label": "Epistle", "body": [["...", "..."]] },
      { "id": "Graduale", "label": "Gradual", "body": [["...", "..."]] },
      { "id": "Evangelium", "label": "Gospel", "body": [["...", "..."]] },
      { "id": "Offertorium", "label": "Offertory", "body": [["...", "..."]] },
      { "id": "Secreta", "label": "Secret", "body": [["...", "..."]] },
      { "id": "Prefatio", "label": "Preface", "body": [["...", "..."]] },
      { "id": "Communio", "label": "Communion", "body": [["...", "..."]] },
      { "id": "Postcommunio", "label": "Postcommunion", "body": [["...", "..."]] }
    ]
  }
]
```

Each `body` entry is a `[english, latin]` pair. When a feast has commemorations, additional sections appear (e.g. `Commemoratio Oratio`, `Commemoratio Secreta`).

The response may contain **multiple propers** when the day has both a temporal and sanctoral celebration (e.g., Saturday of Passion Week + St. John of Capistrano).

**Section IDs available:** Introitus, Oratio, Lectio, Graduale, Tractus, Evangelium, Offertorium, Secreta, Prefatio, Communio, Postcommunio, Super populum, and Commemoratio variants.

**Other useful endpoints:**
- `GET /{lang}/api/v5/calendar/{year}` — full liturgical calendar for a year
- `GET /{lang}/api/v5/ordo` — fixed Mass texts (Ordinary)
- `GET /{lang}/api/v5/votive` — votive Mass list
- `GET /{lang}/api/v5/proper/{date}?format=pdf` — PDF generation

**Verdict:** Perfect for EF. One API call per day gives everything needed.

---

### Catholic Readings API — OF References + Calendar

Provides scripture **references** (not full text) and liturgical calendar metadata for the Ordinary Form.

- **URL:** `https://cpbjr.github.io/catholic-readings-api/readings/{YYYY}/{MM-DD}.json`
- **Calendar:** `https://cpbjr.github.io/catholic-readings-api/liturgical-calendar/{YYYY}/{MM-DD}.json`
- **Auth:** None
- **Cost:** Free (GitHub Pages, no rate limits, CORS enabled)
- **License:** MIT
- **Coverage:** 2025-2026 data available

**Readings response:**
```json
{
  "date": "2026-03-29",
  "season": "Holy Week",
  "readings": {
    "firstReading": "Isaiah 50:4-7",
    "psalm": "Psalm 22:8-9, 17-18, 19-20, 23-24",
    "secondReading": "Philippians 2:6-11",
    "gospel": "Matthew 26:14—27:66"
  },
  "usccbLink": "https://bible.usccb.org/bible/readings/032926.cfm"
}
```

Note: `secondReading` is absent on weekdays. The `psalm` field sometimes references non-psalm books (e.g., `"Jeremiah 31:10, 11-12abcd, 13"`). Cross-chapter ranges use em-dash (`—`).

**Calendar response:**
```json
{
  "date": "2026-01-31",
  "season": "Ordinary Time",
  "celebration": {
    "name": "Saint John Bosco, Priest",
    "type": "MEMORIAL",
    "quote": "Run, jump, shout, but do not sin.",
    "description": "The 'Father and Teacher of Youth,' he founded the Salesians...",
    "image": "https://upload.wikimedia.org/..."
  }
}
```

Celebration types: `FERIA`, `MEMORIAL`, `FEAST`, `SOLEMNITY`.

**Verdict:** Good for liturgical day metadata and USCCB links. References need resolution to actual text (complex parsing). Does NOT provide collects or antiphons.

---

### Evangelizo.org — OF Full Reading Text

Provides the actual **text** of daily readings (not just references).

- **URL:** `https://feed.evangelizo.org/v2/reader.php?date={YYYYMMDD}&lang={LANG}&type=all`
- **Auth:** None
- **Cost:** Free
- **Languages:** Multiple (AM=English, PT=Portuguese, FR=French, ES=Spanish, etc.)
- **Content:** First Reading, Psalm, Second Reading, Gospel text + saint of the day commentary

**Limitations:**
- Response format may include HTML (needs parsing/stripping)
- Date range limited to ~30 days from current date
- Does NOT provide collects, antiphons, or other propers
- No CORS headers documented (may need a proxy for web)

**Verdict:** Useful for getting actual reading text without building a reference parser. Complements Catholic Readings API.

---

### Universalis — OF Readings + Claims Full Propers

Claims to provide full Mass readings AND propers (Collect, Prayer over Offerings, Prayer after Communion, antiphons).

- **URL:** `https://universalis.com`
- **Integration:** JSONP-based (legacy JavaScript callback pattern)
- **Docs:** https://universalis.com/n-jsonp.htm, https://universalis.com/n-jsonp-technical.htm
- **Cost:** Free for webmaster integration
- **Languages:** English (NAB for US, ESV for UK, Jerusalem Bible for others)

**Status:** API documentation is vague and incomplete. The JSONP format makes it harder to use from a React Native app. Would need thorough testing to confirm what data is actually exposed and in what structure.

**Verdict:** Potentially the only free source for OF propers, but unreliable documentation. Worth investigating further.

---

### Other Sources Evaluated

| Source | What it provides | Why not primary |
|--------|-----------------|-----------------|
| **Church Calendar API** (calapi.inadiutorium.cz) | OF liturgical calendar computation | Calendar only, no text |
| **Liturgy.day** (liturgy.day/docs) | Liturgical calendar queries | Incomplete docs, no text |
| **Divinum Officium** (GitHub) | EF Mass proper source files | Raw text files, no API (used by Missale Meum) |
| **iBreviary** | Complete missal | No public API |
| **USCCB** (bible.usccb.org) | Official US readings | No public API, web pages only |
| **Propria.org** | EF printable missalettes | PDF only, limited scope |

---

## Recommended Strategy

### EF (Extraordinary Form): Missale Meum API

One API call per date returns everything: Introit, Collect, Epistle, Gradual/Tract, Gospel, Offertory, Secret, Preface, Communion Antiphon, Postcommunion. Bilingual Latin/English. The response structure maps directly to our `MassSectionBlock` component.

### OF (Ordinary Form): Layered Approach

| Data | Source | Status |
|------|--------|--------|
| Liturgical day info (season, celebration, feast type) | Catholic Readings API | Ready |
| Reading text (First Reading, Psalm, Gospel, etc.) | Evangelizo.org | Needs format testing |
| USCCB link for official reference | Catholic Readings API | Ready |
| Collects, antiphons, propers | **Gap — no free API source** | See note below |

**The OF propers gap:** The Collect, Entrance/Communion Antiphons, and other variable prayers for the Ordinary Form are copyrighted by ICEL (International Commission on English in the Liturgy). No free API currently provides them in structured format. Options:
1. Accept the gap for MVP — show readings + liturgical info, keep dashed placeholders for collects/antiphons
2. Investigate Universalis JSONP more thoroughly
3. Look into ICEL licensing for non-commercial use
4. Use the Latin texts from Divinum Officium (the OF collects are largely the same as EF, just in modern arrangement) — would need manual mapping

### Caching

Cache API responses per date in SQLite. Mass propers for a given date never change, so cache indefinitely. Consider pre-fetching the upcoming week for offline reliability.

### Slot Mapping

The existing Mass JSON has `proper` sections with `slot` fields. These need to map to API section IDs:

| Mass JSON slot | EF API section ID | OF source |
|---------------|-------------------|-----------|
| `introit` | `Introitus` | Gap (antiphon) |
| `collect` | `Oratio` | Gap (ICEL copyright) |
| `first-reading` | `Lectio` | Evangelizo |
| `responsorial-psalm` | `Graduale` | Evangelizo |
| `second-reading` | (varies) | Evangelizo (Sundays) |
| `gospel-acclamation` | `Tractus` (Lent) | Gap |
| `gospel` | `Evangelium` | Evangelizo |
| `offertory` | `Offertorium` | Gap (antiphon) |
| `prayer-over-offerings` | `Secreta` | Gap |
| `communion-antiphon` | `Communio` | Gap |
| `prayer-after-communion` | `Postcommunio` | Gap |

---

## Attribution

- Missale Meum: "Traditional Mass propers from Missale Meum (missalemeum.com), powered by Divinum Officium."
- Catholic Readings API: "Liturgical calendar data from Catholic Readings API (MIT License)."
- Evangelizo: "Daily readings provided by Evangelizo.org."
- USCCB: Link to official readings page per day.
