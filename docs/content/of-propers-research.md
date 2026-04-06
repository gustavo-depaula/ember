# OF Mass Propers — Research (April 2026)

Research into data sources for Ordinary Form daily Mass propers (readings, collects, antiphons, prayers).

## The ICEL Copyright Problem

The International Commission on English in the Liturgy (ICEL) holds copyright on the English translation of the Roman Missal (3rd typical edition, 2011). This covers all variable prayers: collects, entrance/communion antiphons, prayers over the offerings, prayers after communion, and prefaces. No free API provides these in structured format for English.

The Latin editio typica is not restricted by ICEL. Portuguese translations are published openly by CNBB (Brazilian Bishops' Conference).

---

## Data Sources Evaluated

### Complete Propers (readings + prayers + antiphons)

| Source | Language | Verdict |
|--------|----------|---------|
| **Liturgia Diária API** | PT-BR | **Use this** — has everything |

### Readings Only (no collects/antiphons)

| Source | Language | Verdict |
|--------|----------|---------|
| **Evangelizo** | EN, PT, FR, ES | **Use for EN readings** |
| Universalis JSONP | EN | Readings only despite claims |
| Catholic Readings API | EN | References only, not full text |
| AELF `/v1/messes/` | FR | Readings only, French only |

### Calendar Only (no content)

| Source | Notes |
|--------|-------|
| Liturgical Calendar API | PHP, date calculations only |
| Romcal | Node.js liturgical calendar |
| Catholic Readings API | Also has calendar metadata |

### Dead Ends

| Source | Why |
|--------|-----|
| Divinum Officium | EF only — returns `"Unknown version: Novus Ordo"` |
| iBreviary | Has complete propers but content loads dynamically via mobile app, no public API |
| USCCB | No public API, terms prohibit scraping |
| Universalis (full propers) | Only serves readings via JSONP, not propers despite vague docs |
| Catholic Missal API (grocerysushi) | Aspirational README, unclear if functional, appears readings-only |

---

## Liturgia Diária API (PT-BR — Complete Propers)

- **Repository**: https://github.com/Dancrf/liturgia-diaria
- **Base URL**: `https://liturgia.up.railway.app/v2/`
- **Found via**: https://github.com/servusdei2018/awesome-catholic
- **Source data**: Likely scraped from liturgia.cnbb.org.br (CNBB)

### Endpoints

```
GET /v2/                              → today's liturgy
GET /v2/?dia={DD}&mes={MM}&ano={YYYY} → specific date
GET /v2/{DD}-{MM}                     → specific date (path params)
GET /v2/{DD}-{MM}-{YYYY}              → specific date (path params)
GET /v2/?periodo={N}                  → next N days (max 7)
```

### Response Shape

```json
{
  "data": "DD/MM/YYYY",
  "liturgia": "2ª feira na Oitava da Páscoa",
  "cor": "Branco",
  "oracoes": {
    "coleta": "string",
    "oferendas": "string",
    "comunhao": "string",
    "extras": [{ "titulo": "string", "texto": "string" }]
  },
  "leituras": {
    "primeiraLeitura": [{ "referencia": "string", "titulo": "string", "texto": "string" }],
    "salmo": [{ "referencia": "string", "refrao": "string", "texto": "string" }],
    "segundaLeitura": [{ "referencia": "string", "titulo": "string", "texto": "string" }],
    "evangelho": [{ "referencia": "string", "titulo": "string", "texto": "string" }],
    "extras": [{ "tipo": "string", "referencia": "string", "titulo": "string", "texto": "string" }]
  },
  "antifonas": {
    "entrada": "string",
    "comunhao": "string"
  }
}
```

### Slot Mapping

| API field | Flow slot | Notes |
|-----------|-----------|-------|
| `oracoes.coleta` | `collect` | |
| `leituras.primeiraLeitura[0].texto` | `first-reading` | `.referencia` → citation |
| `leituras.salmo[0].texto` | `responsorial-psalm` | `.refrao` → prepend as refrain, `.referencia` → citation |
| `leituras.segundaLeitura[0].texto` | `second-reading` | Empty on weekdays |
| `leituras.evangelho[0].texto` | `gospel` | `.referencia` → citation |
| `oracoes.oferendas` | `prayer-over-offerings` | |
| `oracoes.comunhao` | `prayer-after-communion` | |
| `antifonas.entrada` | `entrance-antiphon` | New slot needed in OF flows |
| `antifonas.comunhao` | `communion` | |
| (not provided) | `gospel-verse` | Remains undefined |
| (not provided) | `preface` | Remains undefined |

### Limitations
- Hosted on Railway (free tier?) — may have availability concerns
- No documented rate limits
- Max 7-day period query

### Liturgical Colors
`Verde` (Green), `Vermelho` (Red), `Roxo` (Purple), `Rosa` (Rose), `Branco` (White)

---

## Evangelizo API (EN — Readings Only)

- **URL**: `https://feed.evangelizo.org/v2/reader.php?date={YYYYMMDD}&lang={LANG}&type=all`
- **Auth**: None
- **Cost**: Free

### Language Codes
- `AM` — English
- `PT` — Portuguese
- `FR` — French
- `ES` — Spanish

### Response
Returns full text of daily Mass readings: First Reading, Responsorial Psalm, Second Reading (Sundays), Gospel.

Does NOT provide: collects, antiphons, prayers, prefaces — none of the proper prayers.

### Slot Mapping

| Content | Flow slot | Notes |
|---------|-----------|-------|
| First Reading | `first-reading` | May contain HTML |
| Psalm | `responsorial-psalm` | May contain HTML |
| Second Reading | `second-reading` | Sundays/Solemnities only |
| Gospel | `gospel` | May contain HTML |

### Limitations
- ~30-day date window from current date
- No CORS headers (may need proxy for Expo web)
- Response is HTML (not JSON) — needs `<br />` normalization, entity decoding, `<font>` tag parsing
- Does NOT provide collects, antiphons, or any proper prayers
- **No psalm response/refrain** — only the psalm verses are returned, without the responsorial refrain text (e.g., "Keep me, O God, for in you I take refuge"). The Liturgia Diária API provides this for PT-BR via the `refrao` field, but no structured English source has been found for it

---

## Future English Propers Options

If we want complete English OF propers later, options to investigate:

1. **Digitize from the Roman Missal** — Transcribe collects/antiphons from the 2011 English Missal into structured JSON. Finite dataset. Most sustainable.
2. **Reverse-engineer iBreviary mobile API** — Their app has complete propers; the data comes from somewhere. The `ibreviary-scraper` repo on GitHub suggests this is possible.
3. **ICEL licensing** — Contact ICEL about non-commercial use licensing.
4. **Latin propers** — The Missale Romanum editio typica (Latin) is not ICEL-restricted. Could provide Latin collects/antiphons alongside English readings.
5. **Community data projects** — Monitor https://github.com/servusdei2018/awesome-catholic for new APIs.
