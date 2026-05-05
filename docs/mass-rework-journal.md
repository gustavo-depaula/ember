# Mass Rework — Working Journal

Daily log of the audit-improve-commit loop on the `mass-rework` branch.
Each entry: what I noticed, what I changed, what surprised me. Written so
the next person (or me on a different day) can pick up cold.

Read top-to-bottom for chronology. Newest entries at the bottom.

---

## Day 0 — Branching off `main`

State at branch point: many in-flight Mass changes already on disk but
uncommitted. Decision: commit the existing work in 4–5 logical bundles
(vendor + engine + app + content + tooling), then enter a tight loop —
audit gap → plan → implement → test → simplify → atomic commit → journal
entry — for the rest of the night.

### What's already done before this branch (uncommitted)

**Engine (`packages/content-engine`):**
- DataSource registry (`data-sources.ts`) — practices declare `load: [{ as, source }]`; engine looks the source up by name and calls `source.load(args, ctx)`. `ctx` exposes `fetchAsset(libraryId, path)` / `fetchOwnAsset(path)` so sources read from installed libraries (no remote fetches).
- Path-aware access in `select.on` / `select.from` / `repeat.from` / template substitution (e.g. `celebration.primary.title`).
- New primitives: `choice-rich-text` (per-slot picker over a celebration's primary + alternates with citation/intro/conclusion/response slots), `liturgical-color` (color swatch + label), `call` (parameterized fragment invocation), `select.from` (dynamic-options select), heading `from` (read a LocalizedText from a path).
- Cycle template substitution (`readings.{{day.cycle}}.firstReading`) with fallback to `readings.default.<slot>` when the cycle path is empty.
- `liturgical-day` data source migrated out of the engine into the registry — `meditacoes-ligorio` was the first real consumer.

**Mass-of package (`packages/mass-of`):**
- `enumerateCelebrations(date)` — returns 1+ celebrations per day. Multi-celebration days handled: Holy Thursday (chrism + lords-supper), Christmas (vigil/night/dawn/day), Holy Family Sunday, Mary Mother of God, Epiphany, Baptism of the Lord, Trinity, Corpus Christi (universal Thu + Brazil's transferred Sun), Sacred Heart, Christ the King.
- Late-Advent + Christmas Octave + Epiphany season day-NNN mapping (Dec 17 – Jan 13).
- `pickCycle(date)` for Year A/B/C Sundays + Year I/II weekdays.
- Sanctoral fold-in: tempore + saint as alternates of each other.
- Precedence: solemnities suppress tempore everywhere; feasts suppress tempore weekdays; memorials are fully suppressed on Sundays (saint omitted entirely).
- Easter Octave + Holy Week + Christmas Octave suppress sanctoral entirely.

**Mass flow (`content/libraries/base/practices/mass/flow.json`):**
- OF rite branch fully rewritten: top-level celebration picker (`select from: 'day.celebrations'`), per-rite dispatch (`select on: celebration.rite`), per-slot pickers (`choice-rich-text`).
- Reading slots use `readings.{{day.cycle}}.<slot>` for cycle-aware Sunday rendering.
- Final blessing season-aware via `select on: celebration.primary.season` — Lent doesn't show the Christmas blessing.
- Sequence dispatch (Vítima Pascal on Easter Sunday, Veni Sancte Spiritus on Pentecost) inserted after secondReading, silent on weekdays.
- All five paschal prefaces selectable via per-alternative chip toggle (Páscoa I…V).
- Liturgical color swatch + celebration title surface in the body.
- 11 V/R "Lord be with you" exchanges replaced with a `call` to a single fragment.

**App rewiring:**
- `useGospelOfTheDay` hook reading from the mass-of source (replaced the runtime `evangelizo`/`liturgia-diaria` fetchers — `apps/app/src/lib/mass-propers/of/` deleted).
- `useProperForSlot` hook narrowed to EF only.
- `ChoiceRichTextBlock` + `LiturgicalColorBlock` components.
- `LibraryManager.loadInstalledLibraries` drops stale install records on boot so a missing IDB content auto-recovers via the seed path.

**Content tooling:**
- `scripts/build-ember-extra-pray.sh` clones a pinned ember-extra commit and `cp -R`'s the `data/` tree into `content/libraries/base/of/` (vendored, not a submodule).
- `scripts/extract-solemn-blessings.py` parses the giant Bendiciones blob into a structured-options JSON.
- `scripts/splice-blessings.py` season-aware-wraps the blessings into the Mass flow.
- `scripts/dedupe-heading-chip.py` removes redundant heading-above-chip-label duplications.
- `scripts/add-greeting-macro.py` factors the Lord-be-with-you V/R into a fragment.
- `scripts/add-sequence.py` inserts the Sequence dispatch.
- `scripts/validate-flows.ts` validates every flow.json + manifest.json against the engine's primitive set.

### Bugs caught during the audit phase (already fixed)

- **Preface double-prefix bug.** `hydratePreface` produced paths like
  `library/preface/preface.pf016.json` because ember-extra's `prefaceRef`
  field already includes the `preface.` prefix and my code prepended it
  again. Every Mass since the ember-extra integration day-1 silently
  rendered with NO preface body — the dialogue jumped straight to the
  Sanctus. Fixed; now `prefaceRef` is fed directly to `formularyPath`,
  with a fallback for the bare-form fixtures used in tests.
- **Multiple prefaces dropped.** Even with the bug above fixed, I was
  only rendering the proper preface — the celebration's
  `alternativeRefs` list was being ignored. Real problem because Easter
  weekdays expose all 5 paschal prefaces. Now `hydratePreface` fetches
  proper + alternatives and stuffs them into a single `alternatives[]`
  array; each entry carries its own `label` ("Páscoa I" / "Páscoa II"
  derived from the title). Engine's choice-rich-text alternative
  handling now picks them up as separate chip options.
- **Silent select dispatch falling back to options[0].** `select on:`
  with a value matching no option id was returning the first option
  instead of falling through to `default`. Caused the Easter Sunday
  sequence to render on every Easter weekday. Fixed.
- **Sunday OT readings empty.** Slot path `readings.default.firstReading`
  doesn't exist on Sundays — they ship under `readings.A/B/C`. Added
  cycle-template substitution + `default` fallback in the engine.
- **Stale install records on web.** When the IDB was wiped but SQL
  retained an `installed_books` row, the boot path threw and the user
  got a stuck blank page. Fixed: `loadInstalledLibraries` drops the
  stale row and lets the seed-from-registry path run on the next reload.

### Open known gaps (deferred to the loop)

- Asperges (Sprinkling Rite) — alternative to Penitential Act on Sundays.
- Antiphon citations sometimes missing in ember-extra (data, not code).
- Ferial title formatting: "Quinta semana Terça-feira" → "Terça-feira da V Semana da Páscoa".

### UX ideas the user has surfaced

- Enhanced preface / EP picker as horizontal cards showing the opening
  excerpt of each — easier to identify which one the priest is praying.
- Reading experience could be denser: collapsible sections for non-
  essential parts (long Eucharistic Prayer narratives, lengthy rubrics).
- General: the page is long. Anything we can do to make the praying flow
  feel less like scrolling and more like turning a page.

---
