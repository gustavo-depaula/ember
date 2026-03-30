# Plan of Life

## Overview

A tracker for daily Catholic spiritual practices, with a multi-hue fidelity wall showing consistency and depth of practice over time. The Plan of Life is a traditional Catholic concept — a structured daily schedule of prayer and devotion.

Practices are organized into three tiers — **Essential**, **Ideal**, and **Extra** — which drive the fidelity wall colors and help users prioritize their spiritual growth.

---

## Practice Tiers

| Tier | Purpose | Wall Color | Examples |
|------|---------|------------|----------|
| **Essential** | Core daily commitments | Green | Morning Offering, Mental Prayer, Rosary, Night Prayer |
| **Ideal** | Recommended devotions | Blue/Teal | Angelus, Spiritual Reading, Confession |
| **Extra** | Additional enrichment | Gold/Amber | Divine Mercy Chaplet, Lectio Divina, Memorare |

---

## Built-in Practices

### Essential (enabled by default)
| Practice | Frequency | Time Block |
|----------|-----------|------------|
| Morning Offering | Daily | Morning |
| Mental Prayer | Daily | Morning |
| Holy Mass | Weekly (Sunday) | Morning |
| Rosary | Daily | Daytime |
| Examination of Conscience | Daily | Evening |
| Night Prayer | Daily | Evening |
| Jesus Prayer *(Eastern)* | Daily | Flexible | Disabled |

### Ideal
| Practice | Frequency | Time Block | Default |
|----------|-----------|------------|---------|
| Angelus | Daily | Daytime | Enabled |
| Spiritual Reading | Daily | Flexible | Enabled |
| Confession | Weekly (Saturday) | Flexible | Disabled |
| Visit to Blessed Sacrament | Daily | Flexible | Disabled |
| Akathist Hymn *(Eastern)* | Weekly (Saturday) | Flexible | Disabled |
| Trisagion Prayers *(Eastern)* | Daily | Morning | Disabled |

### Extra (disabled by default)
| Practice | Frequency | Time Block |
|----------|-----------|------------|
| Divine Mercy Chaplet | Daily | Daytime |
| Stations of the Cross | Weekly (Friday) | Flexible |
| Lectio Divina | Daily | Flexible |
| Guardian Angel Prayer | Daily | Morning |
| Memorare | Daily | Flexible |
| Three O'Clock Prayer | Daily | Daytime |
| Paraklesis *(Eastern)* | Daily | Flexible |
| Prostrations *(Eastern)* | Daily | Morning |

---

## Custom Practices

Users can:
- **Add** custom practices with name, icon, tier, time block, and frequency
- **Edit** any practice's tier, time block, frequency, icon, and notification settings
- **Enable/disable** practices (built-in practices can be disabled but not deleted)
- **Delete** custom practices
- Set **frequency**: daily, weekly (specific days), or custom day selection

---

## Frequency System

Each practice has a frequency that determines when it appears in the checklist:

- **Daily** — appears every day
- **Weekly** — appears on selected days of the week (e.g., Sunday for Mass, Saturday for Confession)
- **Custom** — appears on any combination of specific days

Practices only show in the daily checklist on their applicable days. Streaks and completion rates respect the frequency — skipping a Sunday-only practice on Monday doesn't break a streak.

---

## Time Blocks

Practices are organized into four time-of-day blocks on the home screen:

| Block | Time Range | Display Logic |
|-------|-----------|---------------|
| Morning | 5:00–11:59 | Expanded when current or incomplete |
| Daytime | 12:00–16:59 | Expanded when current or incomplete |
| Evening | 17:00–4:59 | Expanded when current or incomplete |
| Flexible | Any time | Always expanded unless all done |

Each block has display states based on time of day and completion:
- **Expanded** — shows full practice list with toggles (current or incomplete past block)
- **Collapsed** — shows label + completion count (past block, all done)
- **Preview** — shows label + practice names in compact form (future blocks)

Implementation: `src/features/plan-of-life/timeBlocks.ts`

---

## Multi-Hue Fidelity Wall

### Color System

The wall uses 4 color families (8 levels) based on which tier of practices was completed:

| Value | Color Family | Meaning |
|-------|-------------|---------|
| 0 | Warm gray | Nothing done |
| 1–2 | **Gold/Amber** | Only extra practices done (partial/full) |
| 3–4 | **Blue/Teal** | Ideal practices done, essentials incomplete (partial/full) |
| 5–6 | **Green** | All essentials done (partial/all essentials) |
| 7 | **Burgundy/Deep Rose** | ALL applicable practices done — full fidelity |

### Color Tokens

Light theme:
```
wallEmpty:       #E8E4D9
wallExtra1:      #E8D9A0    (gold partial)
wallExtra2:      #C9A84C    (gold full)
wallIdeal1:      #A8C4D9    (blue partial)
wallIdeal2:      #3D5A80    (blue full)
wallEssential1:  #8FB88A    (green partial)
wallEssential2:  #2D6A4F    (green full)
wallPerfect:     #6B1D2A    (burgundy)
```

### Individual Practice Walls

The practice detail screen uses a simple binary green wall (done/not done) for each individual practice, using the legacy 5-level green palette.

### Interaction

- Tap a day cell to see which practices were completed/missed
- Streak counter: current streak and longest streak per practice

---

## Notifications

Per-practice local notifications using `expo-notifications`:

- Each practice can have notifications enabled with a configurable reminder time (HH:MM)
- Notifications are scheduled as daily recurring reminders
- When practice settings change, notifications are rescheduled
- On app launch, all notifications are synced with current practice settings
- Android uses a dedicated "Practice Reminders" notification channel

Implementation: `src/lib/notifications.ts`

---

## Screens

### `/plan/` — Plan of Life Hub
- Multi-hue fidelity wall at top (20 weeks)
- Settings gear icon to configure practices
- Day cell tap reveals completed/missed practices modal
- Summary stats: current streak, completion rate
- Today's practice checklist (frequency-filtered)
- Tap practice row → detail view

### `/plan/[practiceId]` — Practice Detail
- Practice name, icon, tier badge
- Individual binary green wall
- Stats: current streak, longest streak, total days, completion rate

### `/plan/settings` — Customize Practices
- All practices grouped by tier (essential/ideal/extra)
- Tap practice → edit modal with full configuration
- Add custom practice button
- Edit: tier, time block, frequency, icon, notifications, enabled/disabled
- Built-in practices can't be renamed or deleted

---

## Data Model

```typescript
type Tier = 'essential' | 'ideal' | 'extra'
type TimeBlock = 'morning' | 'daytime' | 'evening' | 'flexible'
type Frequency = 'daily' | 'weekly' | 'custom'

interface Practice {
  id: string
  name: string
  icon: string
  frequency: Frequency
  enabled: boolean
  sort_order: number
  tier: Tier
  time_block: TimeBlock
  frequency_days: string       // JSON array of day numbers (0=Sun..6=Sat)
  notify_enabled: boolean
  notify_time?: string         // HH:MM
  is_builtin: boolean
  description: string
  manifest_id: string | null   // links to practice content manifest
  selected_variant: string | null
}

// Event log — each completion is a separate row (supports multiple per day)
interface PracticeCompletion {
  id: number                   // autoincrement
  practiceId: string
  detail?: string              // sub-unit context: office hour, rosary mystery set, form, etc.
  date: string                 // YYYY-MM-DD
  completedAt: number          // Unix timestamp ms
}
```

The `detail` column captures what sub-unit was completed:
- Divine Office: `"morning"`, `"evening"`, `"compline"`
- Rosary: `"joyful"`, `"sorrowful"`, `"glorious"`, `"luminous"`
- Simple practices: `null`

Multiple completions per practice per day are supported (e.g., 2 rosaries in one day).

### SQLite Schema

```sql
CREATE TABLE practices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily',
  enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL,
  tier TEXT NOT NULL DEFAULT 'essential',
  time_block TEXT NOT NULL DEFAULT 'flexible',
  frequency_days TEXT NOT NULL DEFAULT '[]',
  notify_enabled INTEGER NOT NULL DEFAULT 0,
  notify_time TEXT,
  is_builtin INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  manifest_id TEXT,
  selected_variant TEXT
);

CREATE TABLE practice_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  practice_id TEXT NOT NULL,
  detail TEXT,                 -- office hour, mystery set, form, etc.
  date TEXT NOT NULL,
  completed_at INTEGER NOT NULL,
  FOREIGN KEY (practice_id) REFERENCES practices(id)
);

CREATE INDEX idx_completions_date ON practice_completions (date);
CREATE INDEX idx_completions_practice ON practice_completions (practice_id);
CREATE INDEX idx_completions_practice_date ON practice_completions (practice_id, date);
```
