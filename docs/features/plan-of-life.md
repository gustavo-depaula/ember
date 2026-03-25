# Plan of Life

## Overview

A tracker for daily Catholic spiritual practices, with a GitHub-style green contribution wall showing consistency over time. The Plan of Life is a traditional Catholic concept — a structured daily schedule of prayer and devotion.

---

## MVP: Fixed Practices

The MVP ships with a curated, non-editable list of 8 common Catholic practices:

| # | Practice | Time of Day | Description |
|---|----------|-------------|-------------|
| 1 | Morning Offering | Morning | Offering the day's work and sufferings to God |
| 2 | Mental Prayer / Meditation | Morning | 15-30 min of silent prayer or meditation on Scripture |
| 3 | Holy Mass | Morning/Midday | Attendance at Mass (daily if possible) |
| 4 | Spiritual Reading | Flexible | Reading from spiritual classics, saints, theology |
| 5 | Angelus | Noon | Traditional prayer recited at noon |
| 6 | Rosary | Flexible | Five decades of the Rosary |
| 7 | Examination of Conscience | Evening | Brief review of the day's actions and failings |
| 8 | Night Prayer | Night | Brief prayer before sleep |

Each practice is a **daily binary toggle** — done or not done for that day.

---

## Future: Preset + Fully Customizable

- Ship with a robust set of pre-loaded practices covering daily, weekly, and seasonal devotions
- Users can create custom practices with:
  - Custom name
  - Icon selection
  - Frequency: daily, weekly, specific days of the week
  - Time-of-day slot (morning, midday, evening, night, flexible)
- Users can reorder, hide, or archive practices
- Weekly practices (e.g., Confession on Saturdays) show on the appropriate days

---

## Green Contribution Wall

### Overview Wall
- Shows **all practices combined** on one heatmap
- Each cell = 1 day
- Color intensity = how many of the 8 practices were completed that day
  - 0/8: empty/lightest (`#E8E4D9`)
  - 1-2/8: light sage
  - 3-4/8: medium green
  - 5-6/8: deep green
  - 7-8/8: deep emerald (`#2D6A4F`)
- Scrollable horizontally to see history (weeks/months)
- 7 rows (Mon-Sun), columns = weeks (same layout as GitHub)

### Individual Practice Walls
- Toggle to see each practice's own wall
- Binary: completed (green) or not (empty)
- Same layout and scrolling behavior

### Interaction
- Tap a day cell to see a tooltip/modal: which practices were completed, which were missed
- Streak counter: current streak and longest streak per practice

---

## Screens

### `/plan/` — Plan of Life Hub
- Overview green wall at the top
- Below: list of all 8 practices with today's completion status (checkbox)
- Tap a practice to go to its detail view
- Summary stats: current streak, completion rate this week/month

### `/plan/[practiceId]` — Practice Detail
- Practice name and icon
- Individual green wall for this practice
- Stats: current streak, longest streak, total days completed, completion rate
- Calendar view alternative (month grid with dots)

---

## Data Model

```typescript
interface Practice {
  id: string
  name: string
  icon: string           // icon identifier
  frequency: 'daily' | 'weekly' | 'custom'
  enabled: boolean
  order: number          // display order
}

interface PracticeLog {
  date: string           // YYYY-MM-DD
  practiceId: string
  completed: boolean
  completedAt?: number   // Unix timestamp
}
```

### SQLite Schema

```sql
CREATE TABLE practices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily',
  enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL
);

CREATE TABLE practice_logs (
  date TEXT NOT NULL,
  practice_id TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at INTEGER,
  PRIMARY KEY (date, practice_id),
  FOREIGN KEY (practice_id) REFERENCES practices(id)
);

CREATE INDEX idx_practice_logs_date ON practice_logs(date);
CREATE INDEX idx_practice_logs_practice ON practice_logs(practice_id);
```
