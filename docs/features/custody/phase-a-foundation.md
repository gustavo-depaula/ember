# Phase A — Foundation

> Scope: data layer + types + routing scaffold. No UI work, no native code.
> Complexity: **Moderate.** Pure JS / SQLite. The migration runner extension is the only non-trivial bit; everything else is the existing repository pattern applied to new tables.
> Depends on: nothing. This phase opens the milestone.

## Goal

Stand up the data and routing primitives Custody needs so Phases B and C have somewhere to land. Three new tables, an extended migration runner, the type system that flows through the rest of the feature, the repository, the React Query hooks, and an empty Expo Router scaffold. After Phase A, the app builds and boots; the Custody tab opens but is empty.

## Major decisions

### A1. Migration runner: track applied migrations in a dedicated `_migrations` table

Today, `apps/app/src/db/client.ts:33` runs `0001_initial.sql` unconditionally on every boot via `_db.execAsync(initialMigration)`. That works for one migration; it doesn't compose for two.

Three options for adding a second:

- **(a) Probe `sqlite_master` for each table before each migration.** Works but couples the runner to migration internals — every new migration would have to advertise the tables it creates so the runner knows what to probe. Brittle.
- **(b) Store applied migration filenames in the existing `preferences` table.** Works with no schema change, but pollutes a key/value store that's intended for user preferences. Mixing platform metadata with user data invites bugs.
- **(c) Add a dedicated `_migrations` table that records `(name TEXT PRIMARY KEY, applied_at INTEGER)`.** Standard, explicit, low-cost.

**Decision: (c).** Cost is one extra table. Benefit is a clean substrate for every future migration in the project.

The runner change itself is small — under 30 lines. The migration table is created with `CREATE TABLE IF NOT EXISTS` so it's safe on first boot. Existing installs that already ran `0001_initial.sql` need a backfill: if `user_practices` exists but `_migrations` is empty, insert `('0001_initial.sql', now)` before scanning new migrations. Without that backfill, the runner would re-run `0001_initial.sql` on existing installs and the table-creation `CREATE TABLE` statements would fail unless they're all `IF NOT EXISTS` — which they are not currently.

### A2. Targets type: discriminated union with a `tokenRef` indirection for iOS

Commitments target *something*. That something is platform-specific:

- iOS apps and categories: opaque `ActivityToken` blobs returned from `FamilyActivityPicker`. Cannot be enumerated; cannot be inspected. Large.
- Android apps: stable `packageName` strings.
- Domains: free-text, e.g., `instagram.com`.
- Curated lists: a key into a shipped block-list (e.g., `porn`, `gambling`, `social`).

```typescript
type Target =
  | { kind: 'ios-app'; tokenRef: string }
  | { kind: 'ios-category'; tokenRef: string }
  | { kind: 'android-app'; packageName: string }
  | { kind: 'domain'; domain: string }
  | { kind: 'domain-list'; listKey: 'porn' | 'gambling' | 'social' | 'news' }
```

The `tokenRef` is an indirection: SQLite stores the ref string (e.g., a UUID); the actual `ActivityToken` bytes live in App Group `UserDefaults` under that ref. Reasoning:

1. **The iOS `ShieldConfiguration` extension cannot read SQLite directly.** Apple does not give app extensions a sane way to share an SQLite file with the main app — the App Group filesystem is shared but locking and migration coordination across processes is fragile. `UserDefaults` is the documented mechanism.
2. **Tokens are large.** Storing them in SQLite once is fine; storing them again in `UserDefaults` for the extension is fine; storing them in two places that drift is not. One source of truth (UserDefaults), with SQLite holding the ref, is the cleanest split.
3. **The ref is a stable handle.** The token bytes can rotate (e.g., the user re-picks an app); the ref does not. Commitment events that point at "I fell on this token" need a stable target identity.

For Android and domains, no indirection — those values are stable and small enough to inline. The discriminated union accommodates both shapes.

### A3. `commitments` schema with explicit CHECK constraints

```sql
CREATE TABLE commitments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  confessor_note TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('abstain', 'time-limit', 'time-fence')),
  targets TEXT NOT NULL,                                       -- JSON Target[]
  schedule TEXT NOT NULL,                                      -- JSON ScheduleRule
  severity TEXT NOT NULL CHECK (severity IN ('light', 'firm', 'bound')),
  friction TEXT NOT NULL CHECK (friction IN ('none', 'wait', 'prayer', 'confession-only')),
  friction_config TEXT,                                        -- JSON, e.g., { waitSeconds: 300 }
  shield_anchor TEXT,                                          -- JSON Anchor
  fall_policy TEXT NOT NULL CHECK (fall_policy IN ('log', 'examen', 'confession-prep')),
  archived INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX commitments_active ON commitments(archived) WHERE archived = 0;
```

CHECK constraints on enums catch typos at write time and are essentially free. The partial index on `archived = 0` makes the home-today query fast even with hundreds of archived commitments.

`friction_config` is a separate JSON column rather than nested into `friction` because the friction modes have different config shapes (`wait` has seconds; `prayer` has a prayer ref; `confession-only` has nothing). A flat enum in `friction` plus a sidecar config JSON keeps queries simple.

### A4. `commitment_events`: append-only, JOIN-friendly

```sql
CREATE TABLE commitment_events (
  id TEXT PRIMARY KEY,
  commitment_id TEXT NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('kept', 'fell', 'paused', 'overrode', 'confessed')),
  occurred_at INTEGER NOT NULL,
  note TEXT,
  metadata TEXT                                                -- JSON
);

CREATE INDEX commitment_events_by_commitment ON commitment_events(commitment_id, occurred_at DESC);
CREATE INDEX commitment_events_by_type ON commitment_events(type, occurred_at DESC);
```

Append-only by convention — the repository never updates rows, only inserts. Two indexes: by commitment for streak/list queries, by type for the confession-prep "falls log" query (which is `WHERE type = 'fell' AND occurred_at > ?`).

`ON DELETE CASCADE` because users will be allowed to fully delete archived commitments; the events go with them. (Archive is the soft delete; full delete is the hard one.)

### A5. `custody_sessions`: separate from `commitment_events`

A custody session is *not* a commitment event. They are different objects:

- A commitment event records what the user did or didn't do relative to a rule.
- A custody session records a finite prayer block: when, how long, with what anchor, completed or aborted.

Folding them into one table would require nullable foreign keys (sessions don't belong to a commitment) and a wider `type` enum. Two tables is clearer.

```sql
CREATE TABLE custody_sessions (
  id TEXT PRIMARY KEY,
  anchor_ref TEXT NOT NULL,
  anchor_type TEXT NOT NULL CHECK (anchor_type IN ('text', 'image', 'prayer', 'lectio', 'silence')),
  planned_seconds INTEGER NOT NULL,
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  ended_reason TEXT CHECK (ended_reason IN ('completed', 'aborted', 'app-killed'))
);
```

### A6. Schedule reuse, not extension

`apps/app/src/features/plan-of-life/schedule.ts:18-26` defines `ScheduleRule` as a discriminated union of temporal patterns (daily, days-of-week, day-of-month, nth-weekday, times-per, fixed-program, periodic-series, holy-days-of-obligation). `isApplicableOn(rule, date, ctx)` at `schedule.ts:41` evaluates it.

The temptation is to wrap `ScheduleRule` in a `CommitmentSchedule` type, "in case commitments need their own schedule semantics." They don't. A commitment is active on the same days a practice is. Season-gating works the same way (Lent-only commitments use `seasons?: LiturgicalSeason[]` exactly as practices do).

**Decision: reuse `ScheduleRule` directly.** Custody imports it and `isApplicableOn` from plan-of-life. No wrapper. If commitments ever need a temporal pattern practices don't (e.g., per-hour micro-schedules for time-limit), extend the existing union — that's how `holy-days-of-obligation` was added.

The one new helper Custody adds is `nextActivation(commitment, ctx)` and `nextDeactivation(commitment, ctx)` to render time-fence countdowns in the UI. Those live in Custody's own `schedule.ts`, not in plan-of-life.

### A7. Anchor type: discriminated union with platform-renderable variants

The `shield_anchor` column carries the content the iOS extension or the Android Activity will render. The extension cannot fetch at trigger time (network, content-resolver); it must be self-contained.

```typescript
type Anchor =
  | { kind: 'text'; text: string; attribution?: string }
  | { kind: 'image'; imageRef: string; caption?: string }       // bundled asset key
  | { kind: 'prayer'; prayerRef: string; rendered: string }     // rendered text inline
  | { kind: 'lectio'; reference: string; rendered: string }
  | { kind: 'silence' }
```

For `prayer` and `lectio`, the *rendered* text is denormalized into the anchor at edit time. The reason is simple: at shield-trigger time on iOS, our extension cannot call the content resolver. Storing the resolved text inline is the only way the extension can render the prayer.

Cost: prayer text changes upstream (e.g., a translation fix in the corpus) won't propagate to active commitments until the user re-saves them. Acceptable: anchors are personal choices, and users will edit them rarely. Phase E adds a "refresh anchor" affordance that re-renders against the current corpus.

### A8. TanStack Query keys: namespaced under `['custody']`

Existing pattern in `practices.ts` uses keys like `['practices', 'all']`. Custody mirrors it:

- `['custody', 'commitments', 'all']` — full list (active + archived)
- `['custody', 'commitments', commitmentId]` — single
- `['custody', 'commitments', 'active-today']` — filtered through `isApplicableOn`
- `['custody', 'events', commitmentId]` — events for a commitment
- `['custody', 'falls', 'since-confession']` — joined falls log
- `['custody', 'falls', 'since-examen']` — joined falls log for examen
- `['custody', 'sessions', 'recent']` — recent custody sessions

Mutations invalidate `['custody']` at the root for simplicity. The query count is small enough that fine-grained invalidation is premature.

### A9. Routing scaffold: mirror `/plan/`, surface from Plan tab

Expo Router tree:

```
apps/app/src/app/custody/
  _layout.tsx                    Stack header, matches /plan/'s nav style
  index.tsx                      Custody overview (list + active-today + sessions)
  new.tsx                        Create commitment
  [commitmentId].tsx             View / edit
  session.tsx                    Custody session runner
```

Entry point: a tile under the Plan tab that links to `/custody`, mirroring how `examen` and `confessio` are surfaced from the home screen. Not a top-level sidebar tab — Custody is part of Fidelity, not a peer of it.

### A10. `_migrations` table living in `0001_initial.sql` vs. created by the runner

If we put `CREATE TABLE _migrations` inside `0001_initial.sql`, it's tracked alongside everything else. But existing installs already ran `0001_initial.sql` without it.

If the runner creates `_migrations` itself before applying any migration, it's outside the migration history but always present. Cleaner.

**Decision: runner creates the table.** The runner is the only piece that reads or writes it; it owns the table.

## Architecture

### File layout added in Phase A

```
apps/app/src/db/
  client.ts                           [edited: extended migration runner]
  migrations/
    0001_initial.sql                  [unchanged]
    0002_custody.sql                  [new]
  repositories/
    custody.ts                        [new]

apps/app/src/features/custody/
  index.ts                            [new: barrel]
  types.ts                            [new]
  schedule.ts                         [new: thin wrapper utils]
  hooks.ts                            [new: TanStack Query hooks]

apps/app/src/app/custody/
  _layout.tsx                         [new: stub]
  index.tsx                           [new: stub]
  new.tsx                             [new: stub]
  [commitmentId].tsx                  [new: stub]
  session.tsx                         [new: stub]

apps/app/src/lib/i18n/locales/
  en-US.ts                            [edited: + custody.* keys]
  pt-BR.ts                            [edited: + custody.* keys]

apps/app/src/app/plan/
  index.tsx                           [edited: + Custody tile]
```

### Migration runner sketch

```typescript
// apps/app/src/db/client.ts (after init)

await _db.execAsync(`
  CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    applied_at INTEGER NOT NULL
  )
`)

// Backfill: if user_practices exists but _migrations is empty, mark 0001 as applied.
const hasUserPractices = await _db.getFirstAsync<{ count: number }>(
  `SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name='user_practices'`
)
const hasMigrations = await _db.getFirstAsync<{ count: number }>(
  `SELECT COUNT(*) AS count FROM _migrations`
)
if (hasUserPractices?.count && !hasMigrations?.count) {
  await _db.runAsync(
    `INSERT INTO _migrations(name, applied_at) VALUES (?, ?)`,
    ['0001_initial.sql', Date.now()]
  )
}

// Apply pending migrations in order.
const migrations: { name: string; sql: string }[] = [
  { name: '0001_initial.sql', sql: initialMigration },
  { name: '0002_custody.sql', sql: custodyMigration },
]
for (const m of migrations) {
  const applied = await _db.getFirstAsync<{ name: string }>(
    `SELECT name FROM _migrations WHERE name = ?`, [m.name]
  )
  if (applied) continue
  await _db.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(m.sql)
    await tx.runAsync(`INSERT INTO _migrations(name, applied_at) VALUES (?, ?)`, [m.name, Date.now()])
  })
}
```

### Repository sketch

`apps/app/src/db/repositories/custody.ts` follows the event-sourced mutation pattern from `practices.ts`. Public API:

```typescript
listCommitments(opts?: { includeArchived?: boolean }): Promise<Commitment[]>
getCommitment(id: string): Promise<Commitment | undefined>
createCommitment(input: CommitmentInput): Promise<Commitment>
updateCommitment(id: string, patch: Partial<CommitmentInput>): Promise<Commitment>
archiveCommitment(id: string): Promise<void>
deleteCommitment(id: string): Promise<void>           // hard delete; cascades

recordEvent(input: { commitmentId: string; type: EventType; note?: string; metadata?: object }): Promise<CommitmentEvent>
listEventsForCommitment(commitmentId: string, opts?: { limit?: number }): Promise<CommitmentEvent[]>
listFallsSince(timestamp: number): Promise<(CommitmentEvent & { commitment: Commitment })[]>

createSession(input: { anchor: Anchor; plannedSeconds: number }): Promise<CustodySession>
endSession(id: string, reason: CustodySession['endedReason']): Promise<CustodySession>
listRecentSessions(limit: number): Promise<CustodySession[]>
```

JSON-serialize `targets`, `schedule`, `friction_config`, `shield_anchor`, and `metadata` on the way in; parse on the way out. Repository is the only place that touches JSON columns.

## Tasks

### T-A1. Extend the SQLite migration runner

In `apps/app/src/db/client.ts`, add the `_migrations` table creation, the existing-install backfill, and the migration-loop logic shown in the sketch above. The migrations array is in-source for now (no filesystem scanning — Expo bundles SQL files via `require`/`import` or inline strings). Wrap each migration application in `withExclusiveTransactionAsync` so a failure rolls back both the schema change and the `_migrations` insert. Add a unit test in `apps/app/src/db/__tests__/migrations.test.ts` that runs against an in-memory `expo-sqlite` instance and verifies: (a) fresh boot applies both migrations, (b) second boot is a no-op, (c) backfill path inserts `0001` when `user_practices` already exists.

### T-A2. Author `0002_custody.sql`

Three `CREATE TABLE` statements (`commitments`, `commitment_events`, `custody_sessions`), three `CREATE INDEX` statements, all `CHECK` constraints on enum columns, foreign-key cascade from events and sessions to `commitments`. File goes in `apps/app/src/db/migrations/0002_custody.sql`. Reference the schema in this doc verbatim.

### T-A3. Define types in `apps/app/src/features/custody/types.ts`

Top-level types:

- `Commitment` (matches the SQL schema; `targets`, `schedule`, `friction_config`, `shield_anchor` are typed shapes, not JSON strings)
- `CommitmentInput` (the same minus generated fields: `id`, `created_at`, `updated_at`)
- `CommitmentKind`, `Severity`, `Friction`, `FallPolicy` (string-literal unions matching the CHECK enums)
- `Target` (discriminated union, five variants — see A2)
- `Anchor` (discriminated union, five variants — see A7)
- `CommitmentEvent`, `EventType`, `CustodySession`

Re-export `ScheduleRule` and `ScheduleContext` from plan-of-life for the convenience of downstream code.

### T-A4. Implement `apps/app/src/db/repositories/custody.ts`

CRUD with the API surface above. Use the same `emit`/`emitBatch` event-sourced pattern as `practices.ts`. Repository is responsible for JSON (de)serialization on every column that holds structured data. `listFallsSince` does a `JOIN` of `commitment_events` against `commitments`. `listCommitments({ includeArchived: false })` uses the partial index.

### T-A5. TanStack Query hooks in `apps/app/src/features/custody/hooks.ts`

The keys listed in A8. One hook per key. Mutations go through repository functions and invalidate `['custody']` root. Add `useActiveCommitmentsToday(date?: Date, ctx?: ScheduleContext)` that calls `listCommitments({ includeArchived: false })` then filters in JS via `isApplicableOn`. SSR-safe: every hook is `useQuery`/`useMutation` against the repo.

### T-A6. Schedule wrappers in `apps/app/src/features/custody/schedule.ts`

Re-export `isApplicableOn` from plan-of-life as `isCommitmentActiveOn` for naming clarity. Add `nextActivation(commitment, ctx)` and `nextDeactivation(commitment, ctx)` that compute the next time-fence boundaries from the schedule + the commitment's `kind`. For `time-fence`, this is the next start/end of the fence window today or tomorrow.

### T-A7. i18n keys

Add the `custody.*` namespace to both `en-US.ts` and `pt-BR.ts`. Match the existing dot-namespaced style. Keys to start with:

```
custody.title
custody.tagline
custody.empty.heading
custody.empty.cta
custody.commitments.create
custody.commitments.edit
custody.kinds.abstain.label
custody.kinds.abstain.help
custody.kinds.time-limit.label
custody.kinds.time-limit.help
custody.kinds.time-fence.label
custody.kinds.time-fence.help
custody.severity.light.label
custody.severity.light.help
custody.severity.firm.label
custody.severity.firm.help
custody.severity.bound.label
custody.severity.bound.help
custody.severity.bound.coming-android
custody.friction.none.label
custody.friction.wait.label
custody.friction.prayer.label
custody.friction.confession-only.label
custody.shield.cta.pray
custody.shield.cta.disable
custody.session.start
custody.session.duration.5
custody.session.duration.10
custody.session.duration.20
custody.session.duration.40
custody.session.duration.60
custody.anchor.kinds.text
custody.anchor.kinds.prayer
custody.anchor.kinds.lectio
custody.anchor.kinds.image
custody.anchor.kinds.silence
```

### T-A8. Expo Router scaffold

Five files under `apps/app/src/app/custody/`. Stubs only — each renders a Tamagui `YStack` with the route name centered. `_layout.tsx` matches `apps/app/src/app/plan/_layout.tsx`'s nav configuration.

### T-A9. Plan-tab entry point

Edit `apps/app/src/app/plan/index.tsx` to add a Custody tile that links to `/custody`. Match the visual treatment of the existing tiles (e.g., the Examen tile if present). Hide the tile behind a feature flag check (`flags.custody`) so Phase A can land without exposing the empty surface to users — Phase B turns the flag on.

### T-A10. Feature flag plumbing

Add `flags.custody` to whatever flag mechanism the project uses (or create a minimal one in `apps/app/src/config/flags.ts` if none exists). Default off; can be flipped on per-build for development.

## Verification

- Unit tests for the migration runner cover fresh-boot, second-boot, and existing-install backfill paths.
- Repository tests cover round-trip JSON serialization for `targets`, `schedule`, `friction_config`, `shield_anchor`.
- App boots cleanly on a device that has been running an older build (existing-install path).
- `_migrations` table contains rows for `0001_initial.sql` and `0002_custody.sql` after first boot.
- `/custody` route opens; tabs/nav render; placeholder copy in en-US and pt-BR.

## Risks

| Risk | Mitigation |
|---|---|
| Migration runner change breaks existing installs | Backfill path tested explicitly; staging snapshot of a real user's DB used in tests. |
| Anchor inline-rendering drifts from corpus over time | Phase E adds "refresh anchor" affordance; document the trade-off. |
| Schedule reuse blocks future commitment-only patterns | Extend the existing union when needed; precedent from `holy-days-of-obligation`. |
| Feature flag exposes incomplete surface accidentally | Default off; flag check guards both the tile and the route entry. |
| JSON column shape drift (no schema check beyond `CHECK`) | Repository is the single read/write boundary; type-check inputs there. |
