# Mass Times — Backend Plan

Status: planning. Scope: **backend only** (data model, API, validation, ingestion). Frontend UI
is out of scope; client touchpoints are noted but not built.

> The liturgical-Mass packages (`@ember/mass`, `@ember/mass-of`, `@ember/mass-propers`) are
> unrelated — this is the **church / mass-times directory**. This is also the app's first real
> backend, so `packages/api` + `apps/backend` are generic-but-fine names (there's only one).

---

## 1. Decisions

- **Stack = Cloudflare Workers (Hono) + D1** (SQLite at the edge). Serverless → **no ops**.
- **No user accounts / no auth.** Crowd verification and corrections dedup on a **fingerprint**
  (hashed IP and/or a client-generated stable id), not identity.
- **Reads and writes both go through the backend.** The app caches reads locally (TanStack Query).
- **Validation via Hono `@hono/zod-validator` + Zod.** No hand-written validators. The Zod
  schemas live in `@ember/api` and are reused by the frontend for form validation.
- **Frontend fetchers via Hono's `hc` typed client**, inferred from the **backend's** `AppType`
  (type-only import) — no codegen, types flow across the monorepo. Wrapped in TanStack Query.
- **Recurrence = rrule, queried via a materialized `occurrence` table.** `service` stores the
  rrule; it's expanded into concrete `occurrence` rows over a rolling window (local time + IANA
  tz → UTC, DST-safe), kept current by a scheduled **Cron Trigger**. All time/geo queries hit
  `occurrence`.
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
    schema.ts                       # domain types (Church, Service, Occurrence, ...) — type, not interface
    dump.ts                         # dump-file record types (backend import + out-of-band pipeline share these)
    validators.ts                   # Zod schemas for request payloads (backend validates with them; frontend reuses for form validation)
    index.ts

apps/backend/                       # ALL backend logic + the Cloudflare deployment
  src/
    app.ts                          # Hono app (fetch handler); mounts feature routers; exports `AppType`
    scheduled.ts                    # Cron Trigger handler — re-rolls the occurrence window over D1
    features/
      churches/                     # routes.ts (router + zod-validator) · queries.ts (D1) · service.ts (logic)
      corrections/                  # corrections + verification endpoints
    lib/
      geo.ts                        # haversine / bbox (backend-only)
      occurrence.ts                 # pure rrule -> occurrence expander — used by BOTH import.ts and scheduled.ts
    db.ts                           # D1 helpers
  scripts/
    import.ts                       # dump file -> upsert D1 (operator-run); expands occurrences for imported services
  migrations/                       # D1 schema DDL (0001_init.sql, ...)
  wrangler.jsonc                    # D1 binding, secrets, + cron trigger for scheduled.ts

apps/app/src/
  lib/parishes.ts                   # hc client from `import type { AppType } from 'backend'`; @ember/api zod schemas for forms; TanStack Query
  features/mass-times/              # UI later; not in scope now
```

**The boundary:** `@ember/api` holds *only the shared contract* — domain types, the dump-file
record types, and the request Zod schemas (the three things frontend, backend, and scripts/the
pipeline genuinely share). **Everything genuinely backend** — the Hono app, route handlers, D1
access, geo, occurrence expansion, migrations, the import script — lives in `apps/backend`,
organized into **feature folders** (`features/churches`, `features/corrections`) mirroring the
app's convention. The frontend type-imports `AppType` from the backend for its `hc` client (types
only, erased at build); the out-of-band pipeline imports only the **types** from `@ember/api`.

Conventions (`docs/CONVENTIONS.md`): Biome (single quotes, no semicolons, 2-space, width 100),
TS strict, `type` over `interface`, named exports + barrel `index.ts`, repository pattern with
raw SQL (`snake_case` columns ↔ `camelCase` TS), camelCase files, path aliases, errors surface
or crash.

---

## 3. Schema (D1 / SQLite)

`service` holds an rrule; `occurrence` is the materialized query surface; `church_text` keeps raw
text; geo via indexed `lat`/`lng` + bbox + haversine.

```sql
church (
  id            text primary key,        -- stable external id
  name, long_name, address, city, region, postal_code, country, country_code text,
  lat, lng      real not null,
  timezone      text not null,           -- IANA; drives all time math (DST-safe)
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

service (
  id            text primary key,
  church_id     text not null,
  kind          text not null,           -- mass | confession | adoration
  rite          text,                    -- per-Mass rite: latin (ordinary/EF) | byzantine | maronite | ... (separates Latin vs Eastern Catholic)
  language      text,                    -- ISO 639 (per-service)
  rrule         text not null,           -- iCal RRULE: weekly, monthly-by-weekday, day-of-month, seasonal via UNTIL
  start_time    text not null,           -- 'HH:MM' local wall-clock (anchor)
  end_time      text,
  location_note text,
  note          text,
  source        text,                    -- import | manual | user
  confidence    real
)

-- materialized query/UI surface
occurrence (
  church_id   text not null,
  service_id  text not null,
  kind, rite, language text,
  starts_at   text not null,             -- ISO UTC instant (tz resolved at expansion)
  ends_at     text
)
-- index (starts_at), (church_id, starts_at)

church_text (church_id text, kind text, raw_text text, source_updated_at text,
             primary key (church_id, kind))   -- mass_times | seasonal_mass_times | confession | adoration | info

church_link (church_id text, kind text, url text,
             primary key (church_id, kind))   -- website | instagram | facebook | whatsapp | youtube | livestream | donation

correction (                              -- moderation queue: public appends; you promote
  id text primary key, church_id text, service_id text,
  kind text, payload text, fingerprint text,
  status text,                            -- pending | accepted | rejected | duplicate
  created_at text, reviewed_at text, reviewed_by text
)

verification_event (                      -- user confirmations only (low volume)
  id text primary key, church_id text, service_id text,
  fingerprint text not null,              -- dedup: one per (church_id, fingerprint) per window
  created_at text
)
```

### Rite vs. communion — two questions, two fields
- **Which Catholic tradition / liturgy** → `service.rite`. Eastern Catholics *are* in communion
  with Rome (Catholic) — they're just not **Latin**. `rite` already separates Latin
  (Ordinary/Extraordinary Form) from Byzantine / Maronite / etc., so **no separate `tradition`
  field is needed.**
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

---

## 4. Endpoints (Hono app in `@ember/api`)

Read (public, cacheable; time/geo hit `occurrence`):
```
GET /health
GET /churches/near?lat=&lng=&radius_km=&limit=&kind=&rite=&institute=&status=&open_now=
GET /churches/:id                     # church + services (+ rite) + links + raw text
GET /churches?country=&city=&q=&bbox=&kind=&rite=&institute=&status=&limit=&offset=
GET /churches/:id/verifications       # paged
```

Write (public, **fingerprint + Turnstile + rate-limit**, Zod-validated, append-only):
```
POST /churches/:id/corrections        # inserts a pending `correction` row
POST /churches/:id/verify             # inserts a `verification_event` (deduped by fingerprint+window)
```

`status=`/`institute=`/`rite=` filters restrict only when supplied (never hide `unknown`).

---

## 5. Data jobs (both share `src/lib/occurrence.ts`)

**(a) Import — `scripts/import.ts` · operator-run · occasional.** Reads a **dump file** of
`@ember/api`-typed records → upserts `church`/`service`/`church_text`/`church_link` into D1 →
expands occurrences for the imported services. Run with your Cloudflare creds; the dump's
provenance is out of scope here.

**(b) Occurrence window roll — `src/scheduled.ts` · a Cloudflare Cron Trigger · hosted + automated.**
Even when source data doesn't change, the rolling horizon must advance (drop past, add future), so
a scheduled Worker re-expands `service.rrule` → `occurrence`. **Hosted + unattended** (the window
must stay current without you) — unlike the import, which is operator-run/local. Public-safe: pure
calendar math over D1, no external data.

> Why they differ: scrape/ETL/import are sensitive + occasional → **local, operator-run**; the
> occurrence roll is insensitive + must-stay-current → **hosted cron**. Same expander, different
> homes.

**Cost knob:** occurrence writes ≈ window size × roll frequency. Keep the window modest (e.g.
14–30 days) and/or roll **incrementally** (append the new day, prune the oldest) instead of a daily
full rebuild, to keep the D1 write meter cheap.

The public `correction`/`verify` endpoints never mutate canonical data — only append to queues.

---

## 6. Client layer (apps/app) — noted, not built yet

`lib/parishes.ts` builds the `hc` client from the backend's `AppType` (`import type` — erased at
build; typed fetchers, no codegen), reuses `@ember/api` Zod schemas for client-side form
validation, wrapped in TanStack Query for caching. Zustand for filter UI. No new patterns.

---

## 7. Open questions

1. **Fingerprint mechanism** — server-side hashed IP, a client-generated stable id, or both.
2. **Dump format** — JSONL of typed records (`import.ts` owns upsert + occurrence expansion) vs a
   `.sql` dump. Lean JSONL.
3. **Occurrence window + refresh cadence** — horizon length and re-roll frequency.
4. **D1 size** — 138k churches + ~650k services is well within D1; confirm the lean schema stays
   comfortable.

_Decided: Workers + Hono + D1; **Zod** validation; `hc` typed client; rrule + materialized
`occurrence`; `service.rite` (Latin vs Eastern); `church.canonical_status` (communion — nullable);
`packages/api` (shared contract only) + `apps/backend` (all backend logic, feature folders)._
