# Data Model V2

## Context

The V1 data model accumulated 7 migrations, 3 generations of reading progress tracking, dual storage (SQLite + AsyncStorage), and a `practices` table that conflates content definitions with user configuration. The frequency model only supports `daily | weekly | custom` with day-of-week arrays — insufficient for real Catholic practice patterns (First Fridays, seasonal practices, novenas, "X times per week").

This redesign collapses everything to **4 SQLite tables** (no AsyncStorage), a **single JSON `schedule` field** replacing frequency, and a clean separation: **manifests define content, the DB stores only user data**.

---

## Principles

1. **The manifest IS the practice definition.** The DB stores only what the user chose and did.
2. **One persistence layer.** SQLite only. No AsyncStorage.
3. **Schemaless where it matters.** Cursors store JSON positions, schedules store JSON rules — no migrations needed for new shapes.
4. **Adding a practice = adding a manifest folder.** No seed edits, no migrations, no code changes.

---

## Schema (4 tables + 1 cache)

### `user_practices`

The user's plan-of-life configuration. Content (name, icon, description, history, flows) comes from `src/content/practices/*/manifest.json` at runtime.

```sql
CREATE TABLE user_practices (
  practice_id  TEXT PRIMARY KEY,
  enabled      INTEGER NOT NULL DEFAULT 0,
  sort_order   INTEGER NOT NULL,
  tier         TEXT NOT NULL DEFAULT 'essential',   -- 'essential' | 'ideal' | 'extra'
  time_block   TEXT NOT NULL DEFAULT 'flexible',    -- 'morning' | 'daytime' | 'evening' | 'flexible'
  schedule     TEXT NOT NULL DEFAULT '{"type":"daily"}',
  variant      TEXT,
  custom_name  TEXT,
  custom_icon  TEXT,
  custom_desc  TEXT
);
```

- No `name`, `icon`, `description`, `is_builtin`, `manifest_id`, `frequency`, `frequency_days`, `notify_enabled`, `notify_time`.
- Built-in practices: `practice_id` matches a manifest id. Name/icon/description resolved from manifest.
- Custom (user-created) practices: `practice_id` has no matching manifest. Use `custom_name`, `custom_icon`, `custom_desc`.
- `time_block` is a **display grouping** concern (which section of the checklist), not derivable from the schedule.
- Notifications are embedded in `schedule.notify[]`.

### `completions`

Event log of what the user actually did.

```sql
CREATE TABLE completions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  practice_id  TEXT NOT NULL,
  sub_id       TEXT,
  date         TEXT NOT NULL,
  completed_at INTEGER NOT NULL
);

CREATE INDEX idx_completions_date ON completions (date);
CREATE INDEX idx_completions_pd ON completions (practice_id, date);
```

- `sub_id`: identifies the sub-unit completed. For Divine Office: `'morning'`, `'evening'`, `'compline'`. For simple practices: `null`.
- Multiple completions per practice per day are supported.
- Replaces: `practice_logs`, `daily_office`, `practice_completions`.

### `cursors`

Reading position bookmarks with schemaless JSON positions.

```sql
CREATE TABLE cursors (
  id         TEXT PRIMARY KEY,
  position   TEXT NOT NULL,
  started_at TEXT NOT NULL
);
```

Position shapes by consumer:
- `divine-office/ot-readings` → `{"index": 42}`
- `divine-office/nt-readings` → `{"index": 18}`
- `divine-office/ccc-readings` → `{"index": 7}`
- `bible/position` → `{"book": "genesis", "chapter": 3}`
- `catechism/position` → `{"segment": 15}`

Replaces: `reading_progress`, `reading_tracks`, `practice_reading_tracks`.

### `preferences`

Key-value store replacing all AsyncStorage usage.

```sql
CREATE TABLE preferences (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

Keys: `translation`, `psalter-cycle`, `language`, `liturgical-calendar`, `jurisdiction`, `time-travel-date`, `form-preferences`, `reading-font-family`, `reading-font-size`, `reading-line-height`, `reading-margin`, `reading-text-align`, `theme`.

### `cached_translations` (unchanged)

```sql
CREATE TABLE cached_translations (
  translation TEXT NOT NULL,
  book        TEXT NOT NULL,
  chapter     INTEGER NOT NULL,
  content     TEXT NOT NULL,
  cached_at   INTEGER NOT NULL,
  PRIMARY KEY (translation, book, chapter)
);
```

---

## Schedule Model

Single JSON field replacing `frequency` + `frequency_days` + `notify_enabled` + `notify_time`. Discriminated union — extensible without migrations.

### Types

```typescript
type Schedule = ScheduleRule & {
  seasons?: LiturgicalSeason[]
  notify?: Notification[]
}

type Notification = {
  at: string        // 'HH:MM'
  days?: number[]   // optional subset of schedule days
}

type ScheduleRule =
  | { type: 'daily' }
  | { type: 'days-of-week'; days: number[] }
  | { type: 'day-of-month'; days: number[] }
  | { type: 'nth-weekday'; n: number; day: number }
  | { type: 'times-per'; count: number; period: 'week' | 'month' }
  | { type: 'fixed-program'; totalDays: number; startDate: string }
```

### Examples

| Practice | Schedule |
|----------|----------|
| Morning Offering | `{"type":"daily","notify":[{"at":"06:30"}]}` |
| Holy Mass (Sunday) | `{"type":"days-of-week","days":[0],"notify":[{"at":"08:00"}]}` |
| Stations (Lent Fridays) | `{"type":"days-of-week","days":[5],"seasons":["lent"]}` |
| First Friday | `{"type":"nth-weekday","n":1,"day":5}` |
| Rosary 3x/week | `{"type":"times-per","count":3,"period":"week"}` |
| Confession monthly | `{"type":"times-per","count":1,"period":"month"}` |
| 54-Day Novena | `{"type":"fixed-program","totalDays":54,"startDate":"2026-03-01"}` |
| Regina Caeli (Easter) | `{"type":"daily","seasons":["easter"]}` |
| Divine Office (3 reminders) | `{"type":"daily","notify":[{"at":"07:00"},{"at":"17:00"},{"at":"21:00"}]}` |

### Evaluation

**`isApplicableOn(schedule, date, season)`** — should this appear in today's checklist?

| Type | Logic |
|------|-------|
| `daily` | true |
| `days-of-week` | `date.getDay() ∈ days` |
| `day-of-month` | `date.getDate() ∈ days` |
| `nth-weekday` | is this the Nth occurrence of `day` in this month? |
| `times-per` | true (shows every day; user picks when) |
| `fixed-program` | `startDate ≤ date < startDate + totalDays` |

All types gate on `seasons` first.

**`isFaithful(schedule, completionsOnDate, completionsInPeriod)`** — for fidelity wall.

| Type | Logic |
|------|-------|
| Most types | `completionsOnDate > 0` |
| `times-per` | `completionsInPeriod ≥ count` |

### Streaks

Streaks respect the schedule: missing a non-applicable day doesn't break a streak. For `times-per`, streak is measured in periods (consecutive weeks/months meeting the goal). For `fixed-program`, streak counts consecutive completed days within the program window.

---

## Store Consolidation

### Before (7 stores)

`practiceStore`, `officeStore`, `preferencesStore`, `bibleStore`, `catechismStore`, `readingConfigStore`, `themeStore`

### After (2 stores)

**`preferencesStore`** — all user preferences, hydrated from `preferences` table:
- translation, psalterCycle, language, liturgicalCalendar, jurisdiction, timeTravelDate, formPreferences
- fontFamily, fontSizeStep, lineHeightStep, margin, textAlign
- theme

**`navigationStore`** — ephemeral UI state:
- selectedDate (shared across plan and office views)

Everything else (practices, completions, cursors) queried via TanStack Query from SQLite.

---

## Manifest `defaults` Section

Each manifest declares its default user configuration:

```json
{
  "id": "rosary",
  "name": { "en": "Holy Rosary" },
  "defaults": {
    "enabled": true,
    "sortOrder": 4,
    "tier": "essential",
    "timeBlock": "daytime",
    "schedule": { "type": "daily" }
  }
}
```

Seeding reads all manifests and inserts `user_practices` rows from `defaults`. Adding a new built-in practice = adding a manifest folder. No code changes.

---

## Migration from V1

Migration `0008_data_model_v2.sql`:

1. Create new tables
2. Migrate `practices` → `user_practices` (convert frequency → schedule JSON)
3. Migrate `practice_completions` → `completions` (rename detail → sub_id)
4. Migrate `practice_reading_tracks` → `cursors` (convert to JSON position)
5. Migrate `reading_tracks` → `cursors` (legacy reading positions)
6. AsyncStorage → `preferences` table (done in TypeScript)
7. Old tables remain (harmless, SQLite can't drop pre-3.35)
