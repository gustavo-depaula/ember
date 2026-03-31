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

Built-in practice metadata comes from `src/content/practices/*/manifest.json`. Each manifest includes a `defaults` section that defines initial tier, time block, schedule, enabled state, and sort order. Adding a new built-in practice = adding a manifest folder. No code changes needed.

### Essential (enabled by default)
| Practice | Schedule | Time Block |
|----------|----------|------------|
| Morning Offering | Daily | Morning |
| Mental Prayer | Daily | Morning |
| Holy Mass | Days-of-week [Sun] | Morning |
| Rosary | Daily | Daytime |
| Examination of Conscience | Daily | Evening |
| Night Prayer | Daily | Evening |

### Ideal
| Practice | Schedule | Time Block | Default |
|----------|----------|------------|---------|
| Angelus | Daily | Daytime | Enabled |
| Spiritual Reading | Daily | Flexible | Enabled |
| Confession | Times-per 1x/month | Flexible | Disabled |
| Visit to Blessed Sacrament | Daily | Flexible | Disabled |

### Extra (disabled by default)
| Practice | Schedule | Time Block |
|----------|----------|------------|
| Divine Mercy Chaplet | Daily | Daytime |
| Stations of the Cross | Days-of-week [Fri] | Flexible |
| Lectio Divina | Daily | Flexible |
| Guardian Angel Prayer | Daily | Morning |
| Memorare | Daily | Flexible |
| Three O'Clock Prayer | Daily | Daytime |

---

## Custom Practices

Users can:
- **Add** custom practices with name, icon, tier, time block, and schedule
- **Edit** any practice's tier, time block, schedule, icon, and notification settings
- **Enable/disable** practices (built-in practices can be disabled but not deleted)
- **Delete** custom practices

---

## Schedule Model

Each practice has a JSON `schedule` field (discriminated union). See `docs/features/data-model-v2.md` for the complete spec.

### Schedule Types

| Type | Description | Example |
|------|-------------|---------|
| `daily` | Every day | Morning Offering |
| `days-of-week` | Specific days (0=Sun..6=Sat) | Mass on Sunday, Stations on Friday |
| `day-of-month` | Specific calendar days | First of the month devotion |
| `nth-weekday` | Nth occurrence of a weekday in month | First Friday devotion |
| `times-per` | N times per week/month (user picks when) | Rosary 3x/week, Confession 1x/month |
| `fixed-program` | Consecutive days from a start date | 54-day Rosary Novena |

### Season Filters

Any schedule can be gated on liturgical seasons via `seasons` field:
- Stations of the Cross: `{ type: 'days-of-week', days: [5], seasons: ['lent'] }`
- Regina Caeli: `{ type: 'daily', seasons: ['easter'] }`

### Embedded Notifications

Notifications live inside `schedule.notify[]`, enabling per-day notification times:
- Morning Offering daily at 6:30 → `{ type: 'daily', notify: [{ at: '06:30' }] }`
- Mass Sun 9am + Confession Sat 3pm → `{ type: 'days-of-week', days: [0,6], notify: [{ at: '09:00', days: [0] }, { at: '15:00', days: [6] }] }`

Implementation: `src/features/plan-of-life/schedule.ts`

---

## Time Blocks

Practices are organized into four time-of-day blocks on the home screen:

| Block | Time Range | Display Logic |
|-------|-----------|---------------|
| Morning | 5:00–11:59 | Expanded when current or incomplete |
| Daytime | 12:00–16:59 | Expanded when current or incomplete |
| Evening | 17:00–4:59 | Expanded when current or incomplete |
| Flexible | Any time | Always expanded unless all done |

Time block is a *display grouping* concern, not a scheduling concern. The schedule says *which days*; the time block says *where in the day's UI*.

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

### Individual Practice Walls

The practice detail screen uses a simple binary green wall (done/not done) for each individual practice, using the legacy 5-level green palette.

---

## Notifications

Schedule-aware local notifications using `expo-notifications`:

- Notifications are embedded in `schedule.notify[]`
- `daily` schedules → daily recurring reminders
- `days-of-week` schedules → weekly recurring reminders per scheduled day
- Per-day notification times: different times for different days (e.g., Mass Sun 9am, Confession Sat 3pm)
- When practice settings change, all notifications are rescheduled
- On app launch, all notifications are synced with current practice settings
- Android uses a dedicated "Practice Reminders" notification channel

Implementation: `src/lib/notifications.ts`

---

## Screens

### `/plan/` — Plan of Life Hub
- Multi-hue fidelity wall at top (20 weeks)
- Settings gear icon to configure practices
- Summary stats: current streak, completion rate
- Day carousel with date selection
- Practice checklist for selected date (schedule-filtered)
- Tap practice row → detail view

### `/plan/[practiceId]` — Practice Detail
- Practice name, icon (from manifest or custom)
- Individual binary green wall
- Stats: current streak, longest streak, total days, completion rate
- Variant selector (for practices with variants like Rosary mysteries)
- Reading track pickers (for practices with lectio tracks)
- Practice teaching content from manifest

### `/plan/settings` — Customize Practices
- All practices grouped by tier (essential/ideal/extra)
- Tap practice → edit modal with full configuration
- Add custom practice button
- Browse catalog link
- Edit: tier, time block, schedule, icon, notifications, enabled/disabled
- Built-in practices can't be renamed or deleted

---

## Data Model

```typescript
type Tier = 'essential' | 'ideal' | 'extra'
type TimeBlock = 'morning' | 'daytime' | 'evening' | 'flexible'

type UserPractice = {
  practice_id: string
  enabled: number
  sort_order: number
  tier: Tier
  time_block: TimeBlock
  schedule: string        // JSON Schedule
  variant: string | null
  custom_name: string | null
  custom_icon: string | null
  custom_desc: string | null
}

type Completion = {
  id: number
  practice_id: string
  sub_id: string | null   // office hour, mystery set, etc.
  date: string            // YYYY-MM-DD
  completed_at: number    // Unix timestamp ms
}
```

The `sub_id` column captures what sub-unit was completed:
- Divine Office: `"morning"`, `"evening"`, `"compline"`
- Rosary: `"joyful"`, `"sorrowful"`, `"glorious"`, `"luminous"`
- Simple practices: `null`

Multiple completions per practice per day are supported (e.g., 2 rosaries in one day).

See `docs/features/data-model-v2.md` for the complete schema with SQL definitions.
