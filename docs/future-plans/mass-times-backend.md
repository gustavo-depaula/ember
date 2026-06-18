# Mass Times — Backend Plan

Status: **DEPLOYED** — live at `https://ember-mass-times.dpgu.workers.dev`. Scope: **backend only**
(data model, API, validation, ingestion). Frontend UI is out of scope; client touchpoints are noted
but not built.

> **Implemented** in `packages/api` (`@ember/api` — Drizzle schema, rrule `expand.ts`, dump types,
> Zod validators) + `apps/backend` (`@ember/backend` — Hono app, `features/churches` +
> `features/corrections`, `lib/geo.ts` geohash covering-set, `migrations/` incl. the hand-written
> FTS5 virtual table, `scripts/import.ts`). 26 tests pass (6 expander + 20 integration under
> `@cloudflare/vitest-pool-workers`).
>
> **Live** on Cloudflare (account `d345…2690`): Worker `ember-mass-times`, D1 `ember-mass-times`
> (all migrations applied — tables, FTS5, `attachment`), `WRITE_LIMITER` rate-limit binding.
> Production smoke test passed: health, geo near, FTS browse, Zod 400, 404, verify + dedup, and a
> **429** under burst. DB is empty — pending the real church-data import (see §9).
>
> **Two deviations from the original plan**, both intentional:
> - **R2 isn't enabled on the account**, so correction **attachments are stored as base64 in D1**
>   (new `attachment` table, capped at 1 MB) as an interim. Swap to R2 later with no migration — the
>   ids already act as keys. See `features/corrections/routes.ts`.
> - **The bulk import will exceed D1's free-tier write cap** (100k rows/day vs ~800k–1M rows). Turn
>   on **Workers Paid** ($5/mo, 50M writes/mo) before importing, or chunk over ~10 days. Storage
>   (~150–250 MB) stays well within free.

> The liturgical-Mass packages (`@ember/mass`, `@ember/mass-of`, `@ember/mass-propers`) are
> unrelated — this is the **church / mass-times directory**. This is also the app's first real
> backend, so `packages/api` + `apps/backend` are generic-but-fine names (there's only one).

---

## 1. Decisions

- **Stack = Cloudflare Workers (Hono) + D1** (SQLite at the edge). Serverless → **no ops**.
- **No user accounts / no auth.** Crowd verification and corrections dedup on a **fingerprint**
  (hashed IP and/or a client-generated stable id), not identity.
- **Reads and writes both go through the backend.** The app caches reads locally (TanStack Query).
  Reads are **near-static church + service data** (no per-request time computation server-side) →
  heavily cacheable.
- **Edge caching: deferred.** Reads are cheap (geohash-pruned) and kept cache-friendly (clean
  `GET`s, no cookies/auth on reads); add `caches.default` in front of the read routes later when a
  hot path appears — not needed for launch.
- **Validation via Hono `@hono/zod-validator` + Zod.** No hand-written validators. The Zod
  schemas live in `@ember/api` and are reused by the frontend for form validation.
- **D1 access via Drizzle (`drizzle-orm/d1`).** The Drizzle table schema in `@ember/api` is the
  **single source of truth**: domain types are *inferred* from it (`InferSelectModel`, no separate
  hand-written `type`s) and migrations are *generated* from it (`drizzle-kit`) — killing the
  DDL-vs-types drift of hand-maintaining both. Simple CRUD uses the query builder; the **hot
  geo queries drop to raw `sql` templates** (haversine, geohash prefix ranges). Frontend only *type-imports*
  the inferred types (erased at build); `drizzle-orm`'s runtime never enters the client bundle.
- **Frontend fetchers via Hono's `hc` typed client**, inferred from the **backend's** `AppType`
  (type-only import) — no codegen, types flow across the monorepo. Wrapped in TanStack Query.
- **Recurrence = rrule, expanded on-device — no `occurrence` table, no cron.** `service` stores
  the rrule + wall-clock `start_time`; the **app** expands it to concrete times on demand via a
  **shared expander** (`@ember/api`), against the device clock. The backend stores rules, not
  instances → no materialized table, no scheduled re-roll, no rolling-window staleness. The
  expander is reusable server-side as an *optional* fallback (e.g. a future web/SEO surface), but
  it's not on the critical path.
- **Times are wall-clock; no timezone math on the core path.** "Mass near me" puts device and
  church in the **same zone**: store/display `start_time` as a wall-clock string, and compute
  "open now / next" against the **device clock** — rrule matches days in floating time, and DST
  self-resolves (device and church share it). `church.timezone` (IANA) is stored as metadata but
  only consulted for the **cross-zone** case (browsing a church in a different zone), which is a
  later, opt-in path — the only place real IANA conversion is ever needed.
- **Bulk data is loaded from a dump file** (typed by `@ember/api`) via `apps/backend`'s
  `import.ts`. The dump is produced by an **out-of-band pipeline that is not part of this repo**;
  from here, the input is simply a typed dump file.

> Note: this backend legitimately pulls in deps the offline client never needed (Hono, Zod, D1
> tooling). The repo's lean "no framework / no validation lib" instinct was a property of the
> **client bundle** (bytes on a phone, trusted local data) — server code is a new context. Add
> deps that earn their keep; don't apply client conventions here.

---

## 2. Monorepo placement — `packages/api` = shared contract only; all backend logic in `apps/backend`

```
packages/api/   (@ember/api)        # ONLY what frontend + backend + scripts/pipeline ALL share
  src/
    schema.ts                       # Drizzle table defs (source of truth) → domain types inferred (Church, Service, ...)
    expand.ts                       # pure rrule (`rrule` pkg + `RRuleSet` for exdate/rdate) -> upcoming wall-clock times — SHARED: app on-device, backend may reuse
    dump.ts                         # dump-file record types (backend import + out-of-band pipeline share these)
    validators.ts                   # Zod schemas for request payloads (backend validates with them; frontend reuses for form validation)
    index.ts

apps/backend/                       # ALL backend logic + the Cloudflare deployment
  src/
    app.ts                          # Hono app (fetch handler); mounts feature routers; exports `AppType`
    features/
      churches/                     # routes.ts (router + zod-validator) · queries.ts (D1) · service.ts (logic)
      corrections/                  # corrections + verification endpoints
    lib/
      geo.ts                        # haversine / geohash covering via `ngeohash` (bboxes/neighbors) (backend-only)
    db.ts                           # drizzle(d1) client + raw `sql` helpers for geo
  scripts/
    import.ts                       # dump file -> upsert D1 (operator-run); computes church.geohash per row; no occurrence expansion
  drizzle.config.ts                 # points drizzle-kit at @ember/api schema; generates into migrations/
  migrations/                       # drizzle-kit-generated SQL; applied via `wrangler d1 migrations apply`
  wrangler.jsonc                    # D1 binding, R2 bucket (correction attachments), Rate Limiting binding, secrets (no cron)

apps/app/src/
  lib/parishes.ts                   # hc client from `import type { AppType } from 'backend'`; @ember/api zod schemas + expand.ts; TanStack Query
  features/mass-times/              # UI later; not in scope now
```

**The boundary:** `@ember/api` holds *only the shared contract* — domain types, the dump-file
record types, the request Zod schemas, and the **rrule expander** (`expand.ts`), since the *app*
runs expansion on-device and the backend may reuse it. **Everything genuinely backend** — the Hono
app, route handlers, D1 access, geo, migrations, the import script — lives in `apps/backend`,
organized into **feature folders** (`features/churches`, `features/corrections`) mirroring the
app's convention. The frontend type-imports `AppType` from the backend for its `hc` client (types
only, erased at build); the out-of-band pipeline imports only the **types** from `@ember/api`.

Conventions (`docs/CONVENTIONS.md`): Biome (single quotes, no semicolons, 2-space, width 100),
TS strict, `type` over `interface`, named exports + barrel `index.ts`, repository pattern (Drizzle
for schema/migrations/CRUD, raw `sql` for geo; `snake_case` columns ↔ `camelCase` fields),
camelCase files, path aliases, errors surface or crash.

---

## 3. Schema (D1 / SQLite)

`service` holds an rrule + wall-clock time (expanded on-device, never materialized); `church_text`
keeps raw text — **shown as a fallback when `has_structured_schedule` is false**; geo via an indexed
geohash + covering-set + haversine.

```sql
church (
  id            text primary key,        -- public id (URLs): human-friendly slug (name + city + disambiguator); see §3 "IDs"
  name, long_name, address, city, region, postal_code, country, country_code text,
  lat, lng      real not null,
  geohash       text not null collate binary,  -- precomputed (len ~9); BINARY collation so prefix-range filters use the index; covering-set prefilter before haversine
  timezone      text not null,           -- IANA; stored metadata, only consulted for cross-zone "open now" (core path is zoneless wall-clock)
  phone_e164, email text,
  status        text,                    -- active | temporarily_closed | closed
  featured      integer,
  -- affiliation: all NULLABLE; absent (unknown) for most churches; curated/enriched over time
  administration   text,                 -- diocesan | religious_institute | society_apostolic_life | personal_prelature | ordinariate | independent | other
  institute        text,                 -- specific body when not plain diocesan: FSSP, ICKSP, SSPX, OSB, OP, SJ, Opus Dei, ...
  canonical_status text,                 -- full_communion | irregular | not_in_communion | (null = unknown)
  note          text,                    -- free text, incl. disambiguation warnings ("Old Catholic — not in communion with Rome")
  has_structured_schedule integer,
  last_verified_at  text,                -- ISO; bumped by data refresh, moderator, or user events
  verified_source   text,                -- import | user | moderator
  updated_at    text
)
-- index (geohash), (country_code, city); FTS5 virtual table over (name, long_name) for text search

service (
  id            text primary key,        -- generated (crypto.randomUUID); nested under church, no pretty id needed
  church_id     text not null,
  kind          text not null,           -- mass | confession | adoration
  rite          text,                    -- Mass only (null for confession/adoration). EXTENSIBLE enum, not closed: latin_novus_ordo | latin_tridentine | byzantine | maronite | chaldean | syro_malabar | melkite | ukrainian_greek | ordinariate_divine_worship | ... (Latin OF/EF + Eastern Catholic rites + Anglican Ordinariate, which is full-communion Latin-Church-but-not-Roman)
  language      text,                    -- ISO 639 (per-service)
  rrule         text not null,           -- iCal RRULE: ONE pattern at ONE time. Multiple patterns = multiple rows (a church's schedule is the union)
  start_time    text not null,           -- 'HH:MM' local wall-clock; displayed as-is, expanded on-device
  end_time      text,
  exdate        text,                    -- optional: cancelled dates (holidays, one-offs) — RRuleSet EXDATE
  rdate         text,                    -- optional: one-off added dates not in the rrule — RRuleSet RDATE
  location_note text,
  note          text,
  source        text,                    -- import | manual | user
  confidence    real
)

-- no `occurrence` table: the app expands `service.rrule` on-device via @ember/api `expand.ts`

church_text (church_id text, kind text, raw_text text, source_updated_at text,
             primary key (church_id, kind))   -- mass_times | seasonal_mass_times | confession | adoration | info

church_link (church_id text, kind text, url text,
             primary key (church_id, kind))   -- website | instagram | facebook | whatsapp | youtube | livestream | donation

correction (                              -- moderation queue: public appends; you promote
  id text primary key,                    -- server-generated crypto.randomUUID()
  church_id text, service_id text,        -- service_id null for church-level / add-service
  kind text,                              -- edit_service | edit_church | add_service | flag_closed | note
  payload text,                           -- JSON { changes?, comment?, attachmentKeys? }; Zod-validated per kind (@ember/api/validators.ts)
  fingerprint text,
  status text,                            -- pending | accepted | rejected | duplicate
  created_at text, reviewed_at text, reviewed_by text
)

verification_event (                      -- user confirmations only (low volume)
  id text primary key, church_id text, service_id text,
  fingerprint text not null,              -- dedup: one per (church_id, fingerprint) per window
  created_at text
)
```

### IDs
The import is effectively **one-shot** — the dump is **not re-imported**, and any idempotency for
re-runs is the **importer/caller's** concern, out of scope here. So ids need no stable upstream match
key:
- `church.id`: a **human-friendly slug** generated at import — `name + city + short disambiguator`
  (the disambiguator breaks ties between same-named parishes in one city) — for shareable URLs like
  `/churches/st-mary-springfield-il`.
- `service.id`: **generated `crypto.randomUUID()`** — nested under a church, never addressed
  directly, so no pretty id needed.
- `correction.id` / `verification_event.id`: **generated `crypto.randomUUID()`** at insert —
  append-only events with no external identity.

### Rite vs. communion — two questions, two fields
- **Which Catholic tradition / liturgy / form** → `service.rite`. Eastern Catholics *are* in
  communion with Rome (Catholic) — they're just not **Latin**. `rite` carries the form distinction
  directly via two Latin values, `latin_novus_ordo` (Ordinary Form) and `latin_tridentine`
  (Extraordinary Form / TLM), alongside `byzantine` / `maronite` / etc., so **no separate `form` or
  `tradition` field is needed.** TLM-finding — a headline query for this audience — is just
  `rite=latin_tridentine`.
- **In communion with Rome, or not** → `church.canonical_status`. This is the differentiator:
  `full_communion` (diocesan, orders, FSSP, ICKSP, Eastern Catholic eparchies) · `irregular`
  (SSPX) · `not_in_communion` (sedevacantist groups, and Catholic-*named* bodies that are not in
  communion — e.g. Old Catholic / Christkatholisch, the Swiss case) · `null` = unknown.
- **Disambiguation behavior:** when `canonical_status = not_in_communion`, the app shows a clear,
  neutral banner ("Not in communion with Rome") — especially valuable when the *name* misleads.
  The human-readable specifics go in `church.note`. Eastern Catholic churches get **no** warning
  (they're Catholic) — only a positive rite label.

### Sparse by design
`administration` / `institute` / `canonical_status` are **nullable and mostly unknown** — curated
enrichment, not present for most churches and likely absent from the import dump. Filters restrict
**only when a value is supplied**; `unknown` is never hidden by default. Seed the well-known ones
(FSSP → full_communion, SSPX → irregular, the major orders → full_communion) as a baseline; the
rest fill in over time via curation + the corrections flow, carrying `confidence`.

Derived for display: `last_verified_at`, a windowed `verification_count`, and an
`in_communion_with_rome` convenience (`canonical_status = full_communion`, or `null`/`irregular`
shown with appropriate nuance) for default filtering.

### Geo queries — bounded + geo-first, geohash (no spatial DB needed)
D1/SQLite has **no R-tree / Geopoly / spatial extension** (confirmed open feature request), and
neither does any SQLite-family edge DB (Turso/libSQL) — so we emulate a spatial index with
**geohash** on an ordinary B-tree, the dominant documented pattern on D1. Each church stores one
full-precision geohash (`church.geohash`, len ~9) computed at import. Every geo query is **bounded**
(a required, capped `radius_km` / viewport `bbox`) and **geo-first**:
1. Compute the **covering set** — every geohash cell of length N that *intersects the search box*,
   with N chosen from the radius/zoom (`ngeohash.bboxes()` returns this set directly; it's more than
   "center + 8 neighbors" whenever the box spans more than one cell).
2. `WHERE` an **OR of prefix ranges** (`geohash >= 'abc' AND geohash < 'abd'`, one per covering
   cell) — range conditions on the BINARY-collated column **use the index** (never wrap the column
   in `substr()`/`LIKE` in the indexed filter).
3. Haversine-refine the survivors.

The query returns the nearby churches **with their `service` rules**; the device expands those rules
locally and filters/sorts by soonest. The DB does **pure geo** — no time table, no time join.
Confirm with `EXPLAIN QUERY PLAN` on real data. An unbounded geo query is the only thing that blows
up, so the API doesn't allow one.

> **Why geohash (not H3/S2):** all three avoid a spatial extension, but geohash is the lean,
> D1-proven choice and its one real weakness — latitude distortion — **doesn't apply to churches**
> (they live in populated latitudes, never the poles). A geohash prefix is an *exact* ancestor (so
> clustering is exact, unlike H3's approximate nesting), it's a zero-dependency ~30-line encoder,
> and one indexed text column serves radius, viewport, and zoom-clustering. **S2** is the principled
> upgrade (int64 `BETWEEN` ranges, fewest cells, global-correct) and the one to switch to **only if
> arbitrary-polygon geofencing** (e.g. "Masses inside *this* diocese boundary") ever becomes a
> requirement. **H3** is the worst fit here (best library, but multi-resolution-column DB awkwardness
> + approximate containment).

### Schedule grain — one row per slot
**One `service` row = one (time, pattern) slot.** An `RRULE` is a single pattern at a single
time-of-day (per RFC 5545 all recurrence shares one `DTSTART`), so "9:00 on the 13th **and** 11:00
on Mondays" is **two rows**, not one rule — and a church's schedule is the **union of its rows**
(`expand.ts` expands each row and concatenates). Don't pack multiple positive patterns into one
rule; combining `BYMONTHDAY`+`BYDAY` yields the *intersection*, not the union. Per-row **exceptions**
(a cancelled Sunday, a one-off) use `exdate`/`rdate` via `RRuleSet` — the only place a set is needed.

### Time = wall-clock, expanded on-device (no tz math on the core path)
`service` stores an rrule + wall-clock `start_time`; there is **no materialized instance table**.
The app expands upcoming times with `@ember/api`'s `expand.ts` (rrule → next N floating dates +
`start_time`) against the **device clock**, and renders `start_time` verbatim. Because a "near me"
device shares the church's zone, "open now / next Mass" is correct with **no IANA conversion**, and
**DST self-resolves** (shared zone). `church.timezone` is consulted **only** for the cross-zone
case (a church in a different zone than the device) — a later, opt-in path and the sole place real
tz conversion (Luxon/Intl) is needed. See §7 for the one client-side dependency to verify there.

---

## 4. Endpoints (Hono app in `apps/backend`)

Read (public, cacheable; pure geo — no server-side time computation):
```
GET /health
GET /churches/near?lat=&lng=&radius_km=&limit=&kind=&rite=&institute=&status=   # returns churches + service rules; client expands/sorts by soonest
GET /churches/:id                     # church + services (rrule + rite) + links + raw text
GET /churches?country=&city=&q=&bbox=&kind=&rite=&institute=&status=&limit=&offset=  # q = FTS5 name search; bbox = map pins (zoomed in)
GET /churches/:id/verifications       # paged
```
(A zoomed-out map cluster endpoint — e.g. `GET /churches/clusters?bbox=&len=` — is **deferred**;
see §8.)

Write (public, **fingerprint + Workers Rate Limiting binding**, Zod-validated, append-only):
```
POST /churches/:id/corrections        # inserts a pending `correction` row
POST /churches/:id/verify             # inserts a `verification_event` (deduped by fingerprint+window)
```

`status=`/`institute=`/`rite=` filters restrict only when supplied (never hide `unknown`).
`/churches/near` **requires** `lat`/`lng` + a capped `radius_km` (e.g. ≤50): geo prunes to a small
candidate set (geohash covering cells → haversine) and returns those churches **with their service rules** —
the device expands and sorts by soonest / "open now" (see §3, "Time = wall-clock"). The server does
no time computation, so these responses are fully cacheable.

### Trust model — append-only, operator-promoted
Writes never touch canonical data; they append to `correction`/`verification_event`. **Promotion is
manual** (operator-reviewed) — that's accepted, not a gap. The abuse floor is the **Workers Rate
Limiting binding** (per-fingerprint) + fingerprint dedup (one verify per church per **30-day
window**). To keep the review queue sane, a correction may **auto-surface for review** once **3
distinct** fingerprints submit a matching edit, but it still requires a human to promote.
**`canonical_status` is never auto-applied** — communion claims are the contentious field most open
to brigading, so those edits are always operator-reviewed regardless of confirmation count.

**Correction payload — structured edit, free text, attachments, or any mix.** `payload` is JSON:
`{ changes?, comment?, attachmentKeys? }`. `changes` is a structured proposed edit matching
service/church fields (directly applyable on promotion); `comment` is free text; `attachmentKeys`
reference photos (e.g. a bulletin) stored in **R2**. A correction can be any combination — a clean
structured edit, just a note with a photo, or both. Attachments are **optional in the schema**, so
text/structured corrections can ship first and R2 wiring follow later with no migration. The per-kind
shape is Zod-validated in `@ember/api/validators.ts`.

---

## 5. Data jobs — just the import (no cron, nothing to schedule)

On-device expansion removes the entire "keep a materialized window current" job: there is **no
`occurrence` table and no Cron Trigger**. The only write job is the occasional import.

**Import — `scripts/import.ts` · operator-run · occasional.** Reads a **dump file** of
`@ember/api`-typed records → upserts `church`/`service`/`church_text`/`church_link` into D1. No
occurrence expansion (rules are stored as-is). Run with your Cloudflare creds; the dump's
provenance is out of scope here.

**Stable identity + idempotent re-imports.** The importer slugs each church a human-friendly id
(`name + city + disambiguator`). A dump record may also carry an opaque `sourceId`; the importer
never stores it but echoes a **`sourceId → generated id` mapping sidecar** (`*.mapping.jsonl`).
Feeding that mapping back on the next run (`--prior`) makes a church **keep its id even if its name
or city changed** — so app favorites / check-ins / reminders (all keyed on church id) never break,
and a re-scrape diffs cleanly. With `--upsert`, the emitted SQL is idempotent: churches
`ON CONFLICT(id) DO UPDATE` (last import wins), and each imported church's children
(`service`/`church_text`/`church_link`) are deleted then reinserted. `correction` /
`verification_event` are never touched, so crowd input survives a re-import.

> **Initial bulk load — throughput, not cost.** The one-time load (~138k churches + ~650k services
> + texts/links ≈ <1M rows) is well inside D1's free write allowance, so it costs nothing — but do
> **not** push it as per-row INSERTs through a Worker (subrequest/CPU limits). Use
> `wrangler d1 import --file=dump.sql` (server-side bulk path, plain INSERTs into an empty DB) for
> the initial load; for later re-imports emit upsert SQL (`--upsert`) and apply it with
> `wrangler d1 execute --file=dump.sql`.

**Writes after launch are trivial** — occasional re-imports plus the tiny append-only
`correction`/`verify` queues. There is no recurring per-day write cost, because nothing is
materialized. The public `correction`/`verify` endpoints never mutate canonical data — only append
to queues.

> **Backup — covered for free, no export job.** Canonical data can be rebuilt from the dump (the
> disaster-recovery path) and the FTS5 table is derived, so the only irreplaceable rows are the
> `correction` / `verification_event` queues — and **D1 Time Travel** (30-day point-in-time restore)
> covers those with no extra work.

---

## 6. Client layer (apps/app) — noted, not built yet

`lib/parishes.ts` builds the `hc` client from the backend's `AppType` (`import type` — erased at
build; typed fetchers, no codegen), reuses `@ember/api` Zod schemas for client-side form
validation, wrapped in TanStack Query for caching. Zustand for filter UI.

**On-device expansion.** The app imports `@ember/api`'s `expand.ts` to turn each cached `service`
rule into upcoming wall-clock times against the device clock, then sorts/filters by soonest and
"open now." Because the backend serves near-static church + rule data, this is **offline-capable**:
once a church's services are cached (TanStack Query / SQLite), its schedule works with no network —
squarely Ember's offline-first ethos. No materialized data to sync, no staleness.

---

## 7. Open questions

1. **Fingerprint mechanism** — server-side hashed IP, a client-generated stable id, or both.
2. **Dump format** — both, by phase: `.sql` via `wrangler d1 import` for the **initial** bulk load;
   JSONL of typed records through `import.ts` (Drizzle `batch()`) for any later operator-run loads
   (no re-import guarantee — idempotency is the caller's concern).
3. **On-device tz support (cross-zone path only)** — verify Hermes/RN resolves IANA zones (likely
   `expo-localization` + an Intl/tzdata polyfill, or a tz lib bundling its own data) **before**
   building the cross-zone "open now." The core same-zone path needs none of this.
4. **D1 size** — 138k churches + ~650k services is well within D1; confirm the lean schema stays
   comfortable.
5. **Zoomed-out map behavior (DEFERRED)** — *not settled.* When a viewport holds too many churches
   to show as pins, the options are: server-side geohash-prefix **grouping** into clusters
   (on-the-fly `GROUP BY` vs. a precomputed `cell_count` aggregate), simply **capping** pins with a
   "zoom in to see more" hint, or something else. Decide when the map UI is actually designed; the
   geohash column already supports any of them, so nothing here blocks. See §8.

---

## 8. Map view — pins now, clustering deferred

The geohash column serves a pan/zoom map off the **same** index, no new storage:

- **Zoomed in (pins):** the existing `GET /churches?bbox=` returns individual churches in the
  viewport (geohash covering-set → bbox-refine), capped. The device drops pins and expands a
  church's times **lazily, on tap** — never for every pin while panning. This *confirms* the
  on-device/lazy expansion choice (a map never triggers bulk expansion).
- **Caching:** snap viewport queries to the geohash grid (query the covering cells, not the raw
  pixel bbox) so panning mostly re-hits the same cells → cache-friendly.

**Zoomed out (too many for pins): DECISION DEFERRED — see §7.5.** Geohash *can* do server-side
clustering cleanly (`GROUP BY substr(geohash,1,N)` over the viewport, N from zoom; centroid +
count per cell), optionally backed by a precomputed `cell_count(len, prefix, count, lat, lng)`
aggregate refreshed at import. But whether we cluster, cap, or do something else is **not settled**
and is left for when the map UI is designed. Nothing about the schema or the geohash choice depends
on this — it's purely an API/UX decision to make later.

## 9. Deploy — Cloudflare steps (account-gated)

Everything above is built and locally verified. These steps need the Cloudflare account; run them
from `apps/backend/`:

1. `pnpm exec wrangler login` (interactive OAuth).
2. `pnpm exec wrangler d1 create ember-mass-times` → paste the printed `database_id` into
   `wrangler.jsonc` (replacing the local placeholder).
3. `pnpm exec wrangler r2 bucket create ember-correction-attachments`. (The rate-limit binding needs
   no provisioning — it's inline in `wrangler.jsonc`.)
4. `pnpm db:migrate:remote` — applies `0000` (tables/indexes) + `0001` (FTS5 vtable + triggers).
5. Bulk load: produce `dump.sql` (the out-of-band pipeline, or `tsx scripts/import.ts dump.jsonl
   dump.sql` from a JSONL dump) → `pnpm exec wrangler d1 import ember-mass-times --remote
   --file=dump.sql`.
6. `pnpm deploy` (`wrangler deploy`).
7. `pnpm types` → commit the regenerated `worker-configuration.d.ts`.

Post-deploy smoke: `GET /health`; `GET /churches/near?lat=&lng=&radiusKm=`; one `POST
/churches/:id/verify` (200, then rapid repeats → 429 to confirm the rate-limit binding fires
remotely); `wrangler tail` shows no errors.

### Resolved open questions (from §7)
- **Fingerprint** = SHA-256 of request IP (`CF-Connecting-IP`) + optional `X-Client-Id` **header**
  (not a body field), in `lib/writeGuard.ts`.
- **Dump format** = JSONL of `@ember/api` `ChurchDump` records → `scripts/import.ts` emits a `.sql`
  for `wrangler d1 import` (bulk), or `importRows` (Drizzle, chunked) for small incremental loads.
- **Query params** are camelCase (`radiusKm`), matching the Zod schema keys / typed `hc` client.

_Decided: Workers + Hono + D1; **Drizzle** (schema source of truth + migrations; raw `sql` for
geo); **Zod** validation; `hc` typed client; **rrule expanded on-device — no `occurrence` table,
no cron**; **wall-clock times, no tz math on the core path** (`church.timezone` stored for the
cross-zone case only); geohash + geo-first bounded queries (S2 only if arbitrary-polygon
geofencing is ever needed; H3 ruled out); `service.rite`
(`latin_novus_ordo`/`latin_tridentine` + Eastern); `church.canonical_status` (communion —
nullable); `packages/api` (shared contract only) + `apps/backend` (all backend logic, feature
folders)._

_Rejected: **static geohash tiles on Hearth** for reads — crowd corrections would require a git
commit + corpus rebuild per update, and the repo is already large. D1 keeps writes/updates live._
