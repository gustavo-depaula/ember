# Import the 1963 Latin Diurnale Monasticum

## Context

The Monastic Diurnal (Benedictine day-hours book) is a natural next addition to Ember's breviary offerings. Ember already ships a Roman `divine-office` practice and the `little-office-bvm`, so the infrastructure for canonical-hour practices is proven. The gap is a genuinely monastic arrangement — the Benedictine weekly psalter (RB 8–18) differs fundamentally from the Roman 30-day psalter Ember has today, and the antiphons/hymns/capitula follow a distinct Solesmes tradition.

**Scope decided:** 1963 *Diurnale Monasticum*, all 7 day hours (Lauds → Compline, no Matins), **Latin only** for v1.

**Bottom-line feasibility: very feasible, ~72–84 hours of work, no engine changes required.** The flow DSL already supports every primitive needed (`select on:hour`, `cycle`, `seasonal`, `psalmody`, `resolve`). The effort is overwhelmingly content sourcing and data authoring, not code. The highest risk is source acquisition for the seasonal antiphons and collects.

## Recommended Approach

### 1. New library: `ember-monastic`

Create a dedicated library at `content/libraries/ember-monastic/` rather than extending `devotions`. The Diurnale is large (9 data files, seasonal propers), Latin-only, and opt-in — bundling into `devotions` would inflate that library's `.pray` for everyone. Mirrors existing split-outs (`novenas`, `litanies`). Leaves room for a future Nocturnale / Antiphonale without churn.

### 2. Directory structure

```
content/libraries/ember-monastic/
  manifest.json
  practices/
    diurnale-monasticum/
      manifest.json
      flow.json
      data/
        psalter-benedictine.json       # RB 8-18 weekly cycle, indexBy: day-of-week
        office-hymns.json              # per-hour × per-season
        antiphons-feria.json           # weekday × hour × psalm
        antiphons-seasonal.json        # Advent/Lent/Paschal overrides
        capitula.json                  # little chapters per hour × season
        responsories-brief.json        # brief responsories per hour
        collects.json                  # temporal collects (Sundays + ferias)
        compline.json                  # monastic compline (nearly fixed)
        canticles-ot.json              # 7 Lauds OT canticles (Benedictine set)
```

Shape mirrors `content/libraries/devotions/practices/divine-office/data/` exactly.

### 3. Benedictine psalter (the core differentiator)

`psalter-benedictine.json` must encode RB 8–18 — a 1-week cycle keyed by weekday, with Benedictine psalm splits (Ps 9, 17, 67, 77, 103–106, 117, 118 in 22 sections, 143). Use sub-keys like `"17a"`, `"17b"` or `{ref:17, range:"1-13"}`. Hand-coded from the Rule text (mechanical, ~200 entries). Vulgate numbering via `contextKey: "numbering"` — matches existing `psalter-30-day.json` at `content/libraries/devotions/practices/divine-office/data/psalter-30-day.json`.

### 4. flow.json

Top-level `select on: "hour"` mapping clock ranges to hour branches (pattern from `content/libraries/devotions/practices/little-office-bvm/flow.json:10-20`):

- 4–6: lauds · 6–8: prime · 8–11: terce · 11–14: sext · 14–17: none · 17–20: vespers · 20–4: compline

Each hour branch structure:
1. `prayer ref: opening-verse` (Deus in adiutorium)
2. `seasonal` → `cycle` hymn (`key: "{hour}"`)
3. `psalmody` driven by `cycle data:"psalter-benedictine" key:"{hour}"`, antiphons interleaved as `prose` (DSL has no first-class antiphon type; `prose` is fine for v1)
4. `lectio` / capitulum from `capitula.json` (seasonal)
5. Brief responsory
6. **Lauds/Vespers only**: canticle (`benedictus`/`magnificat`) wrapped in antiphon
7. `resolve` strategy `"liturgical-day"` via `packages/liturgical/src/liturgical-day-resolver.ts` for collect (top-tier feasts override temporal)
8. Closing: Pater Noster (reuse `base:pater-noster` qualified ref — vendored at build time by `scripts/vendor-prayers.py`), versicles

Compline branch is mostly fixed — static `psalmody`, not a cycle.

Expected size: **600–900 LOC** (little-office-bvm is 500 LOC for 8 simpler hours without seasonal branching).

### 5. manifest.json

Model on `content/libraries/devotions/practices/divine-office/manifest.json`:
- `estimatedMinutes: 20`, `theme: "office"`, `flowMode: "scroll"`
- 9 `data` registrations; no `tracks` (no lectio continua in a diurnal)
- `defaults.slots` — 7 slots, all `enabled: false`:
  - Lauds 06:00 · Vespers 18:00 → `tier: essential`
  - Prime 07:00 · Terce 09:00 · Sext 12:00 · None 15:00 · Compline 21:00 → `tier: aspirational`

### 6. Source acquisition (highest risk)

Priority order:
1. **divinumofficium repo** (`github.com/DivinumOfficium/divinum-officium`) — has monastic 1963 rubrics partially digitized in tagged plaintext at `/web/www/horas/Latin/Psalterium/Monastic/`. Best option. Expect coverage gaps.
2. **archive.org Solesmes/Desclée 1963 scan** — Tesseract OCR with `+lat` traineddata (~95% clean on Latin; strip chant neumes).
3. **musicasacra.com / gregorianbooks.com** PDFs with extractable text layers.

**Crib antiphons from divinumofficium, spot-check against a Solesmes scan.** This is where manual verification time concentrates.

### 7. Parse script

Write `scripts/parse-diurnale-monasticum.py` modeled on `scripts/parse-intimita-divina.py` (~200 LOC). Consumes divinumofficium-format text files, emits the 9 data JSON files above. Separate `scripts/build-benedictine-psalter.py` hand-codes the RB 8–18 table (not parsed — fixed data).

Wire into `scripts/build-libraries.sh` so `pnpm build:libraries` produces `ember-monastic-1.0.0.pray`.

### 8. Out of scope for v1 (explicit)

- Matins / Nocturnale
- Full monastic sanctoral — only common of saints + universal top-tier feasts (Christmas, Epiphany, Triduum, Pentecost, Assumption, All Saints)
- English or Portuguese translation
- Gregorian notation, neumes, pointing marks
- Audio / recited chant
- Votive offices, Office of the Dead
- Pre-1963 rubrics (Divino Afflatu, Tridentine)

## Effort Breakdown

| Phase | Hours |
|---|---|
| Source acquisition + cleanup | 8–12 |
| Benedictine psalter table (hand, from RB) | 4 |
| `parse-diurnale-monasticum.py` | 10–14 |
| Seasonal hymn curation | 6 |
| Antiphon / capitulum / responsory curation + verify | 16–20 |
| Collects | 4 |
| flow.json authoring + seasonal branching | 8 |
| manifest + slots + library manifest | 2 |
| Testing | 8 |
| Buffer for feast edge cases | 6 |
| **Total** | **72–84 hours** |

## Critical Files (to read before starting, and to reference while authoring)

- `content/libraries/devotions/practices/divine-office/flow.json` — closest structural analogue
- `content/libraries/devotions/practices/little-office-bvm/flow.json` — hour-by-clock `select` pattern
- `content/libraries/devotions/practices/divine-office/data/psalter-30-day.json` — data file shape to mirror
- `content/libraries/devotions/practices/divine-office/manifest.json` — manifest shape to mirror
- `scripts/parse-intimita-divina.py` — parse-script idiom
- `scripts/build-libraries.sh`, `scripts/vendor-prayers.py` — build pipeline
- `packages/liturgical/src/liturgical-day-resolver.ts` — for feast-proper `resolve` calls
- `docs/features/unified-flow-system.md` — DSL reference for `select`, `cycle`, `seasonal`, `resolve`
- `docs/content/book-format.md`, `docs/features/prayer-books.md` — library/pray-format spec

## Verification

1. `pnpm build:libraries` produces `ember-monastic-1.0.0.pray` with a clean `registry.json` entry.
2. **Psalter snapshot test** in `packages/liturgical/src/__tests__/`: sample 14 days × 7 hours using `liturgical-day-resolver`, snapshot the resolved psalm IDs, confirm Sunday Lauds = Ps 66, 50, 117, 62, Benedicite, 148–149–150 (per RB 12).
3. **Date spot-checks**: e.g. 2026-04-17 (Friday Paschal Time) Lauds should render Ps 75, 91, Canticle of Habakkuk, 148–149–150 with Paschal-alleluia antiphon.
4. **App dev shell**: `pnpm start:web`, open Diurnale Monasticum, verify `scroll` mode renders correctly and `select on:hour` lands on the right hour for current system clock.
5. **Text diff** a random week's antiphons against a published Solesmes Diurnale scan — final human verification before shipping.
6. Docs: add entry in `docs/content/PIPELINE.md` (already lists Monastic Diurnal as planned) and a journal entry in `docs/journal.md` about the Benedictine-psalter/Roman-psalter split.
