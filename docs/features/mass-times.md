# Mass Times (app)

A crowd-correctable directory of Catholic churches with their Mass, confession, and adoration times —
the app surface over the [Mass Times backend](../future-plans/mass-times-backend.md) (Cloudflare
Workers + D1, live at `https://ember-mass-times.dpgu.workers.dev`).

Reached from a card in the Explore featured carousel (`ExploreFeed.tsx`). Currently seeded with a
São Paulo sample.

## Screens & entry points

All routes live under `app/(tabs)/(today,explore,library,you,search)/mass-times/`:

- **`index`** — the hub. A header with a search icon + a List/Map `ViewToggle`, a kind filter
  (All / Mass / Confession / Adoration), then either the nearby **list** or the **map**. Both views
  share one location + query via `useMassTimesNearby(kind)`.
- **`[churchId]`** — church detail: name + save heart, contact actions (directions/call/email/website),
  a check-in button, the schedule grouped by kind (expanded upcoming times), the parish's raw text,
  and the verify / suggest-an-edit form.
- **`search`** — debounced full-text search by name (FTS); results tap through to detail.
- **`log`** — the personal Mass check-in log.

## Architecture

```
lib/mass-times/        the data layer (no UI)
  client.ts            typed fetch wrappers over the Worker (@ember/api row types)
  schedule.ts          on-device rrule expansion (expandService) + per-church wall-clock helpers
  hooks.ts             TanStack Query hooks (nearby / church / search / verify / correction)
  clientId.ts          stable per-install X-Client-Id for writes (persisted in the preferences KV)

features/mass-times/   the feature
  useDeviceLocation.ts expo-location with a São Paulo fallback (graceful pre-rebuild / pre-permission)
  useMassTimesNearby.ts location + nearby query as one unit (shared by list & map)
  favorites.ts         saved churches (zustand, JSON in the preferences KV)
  checkins.ts          personal Mass log (zustand, JSON in the preferences KV)
  persisted.ts         shared loadJson/saveJson over the preferences KV
  format.ts            distance / time / relative-day / kind-label formatting
  components/          ChurchListItem, ChurchDetail, ChurchesMap (+ lazy NativeChurchesMap),
                       ChurchSearch, SavedChurches, FavoriteButton, CheckInButton, MassLog,
                       ChurchFeedback (verify + corrections), KindFilter, ViewToggle, …
```

### Key decisions

- **Reads need no auth; writes carry `X-Client-Id`** (a per-install UUID), which the backend folds
  into a fingerprint for verify-dedup + rate limiting.
- **Recurrence is expanded on-device, zoneless.** The backend stores rrules, never occurrences;
  `schedule.ts` expands them and compares against `wallClockNow(church.timezone)` so "next Mass" is
  correct in the church's own time. Times are wall-clock `HH:MM` displayed verbatim.
- **The native map is isolated + lazy-loaded.** `expo-maps` binds its native view at import, so
  `NativeChurchesMap` is loaded via `React.lazy` behind a `MapErrorBoundary`; the list path never
  executes it, and it falls back on web / before a native rebuild.
- **Favorites + check-ins are local**, stored as JSON in the generic `preferences` KV table (no
  schema/migration), hydrated at boot.

### Native modules

`expo-location` and `expo-maps` were added — they need `pnpm ios` (a native rebuild) to take effect.
List / detail / search work without it; the map and real GPS light up after a rebuild.

## Data / import boundary

The directory data comes from an **out-of-band** pipeline (a private repo). Per that contract, nothing
about the scrape or its format lives here — only a dump file in the `@ember/api` `ChurchDump` shape
crosses the boundary, consumed by `apps/backend/scripts/import.ts` →
`wrangler d1 execute --remote --file`. The deployed sample is São Paulo city.
