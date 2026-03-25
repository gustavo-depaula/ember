# Divine Office (Lectio Continua)

## Overview

A simplified Divine Office with three hours — Morning, Evening, and Compline — that uses **lectio continua** readings instead of the standard lectionary. Designed to read through the entire Bible and Catechism of the Catholic Church in approximately one year.

---

## Structure of Each Hour

### Morning Prayer (Lauds)

1. **Opening verse** — "O God, come to my assistance. O Lord, make haste to help me."
2. **Hymn** — Rotating, seasonal (full text from Divinum Officium)
3. **Psalmody** — Psalms assigned for this day's morning (from 30-day cycle)
4. **Scripture Reading** — Old Testament lectio continua portion
5. **Benedictus** — Canticle of Zechariah (Luke 1:68-79)
6. **Intercessions** — Brief petitions
7. **Our Father**
8. **Closing prayer**

### Evening Prayer (Vespers)

1. **Opening verse**
2. **Hymn** — Rotating, seasonal
3. **Psalmody** — Psalms assigned for this day's evening (from 30-day cycle)
4. **Scripture Reading** — New Testament lectio continua portion
5. **Magnificat** — Canticle of Mary (Luke 1:46-55)
6. **Intercessions**
7. **Our Father**
8. **Closing prayer**

### Night Prayer (Compline)

1. **Opening verse**
2. **Examination of Conscience** — Brief prompt for reflection
3. **Hymn**
4. **Psalmody** — Traditional Compline psalms (Ps 4, 91, 134), rotating weekly
5. **Scripture Reading** — Catechism of the Catholic Church portion
6. **Nunc Dimittis** — Canticle of Simeon (Luke 2:29-32)
7. **Closing prayer**
8. **Marian Antiphon** — Seasonal:
   - Advent to Feb 1: *Alma Redemptoris Mater*
   - Feb 2 to Wednesday of Holy Week: *Ave Regina Caelorum*
   - Easter to Pentecost: *Regina Caeli*
   - Pentecost to Advent: *Salve Regina*

---

## Lectio Continua System

### Bible Reading Plan

| Hour | Content | ~Daily Portion | Completes In |
|------|---------|---------------|--------------|
| Morning (Lauds) | Old Testament | ~3 chapters | ~365 days |
| Evening (Vespers) | New Testament | ~1 chapter | ~365 days |
| Compline | Catechism (CCC) | ~8 paragraphs | ~365 days |

- OT has ~929 chapters -> ~2.5 chapters/day to finish in a year
- NT has ~260 chapters -> ~0.7 chapters/day (some days have no NT reading, or readings are shorter)
- CCC has ~2,865 paragraphs -> ~7.8 paragraphs/day
- Psalms are handled separately via the psalter cycle (not part of lectio continua count)

### Customizable Starting Point

On first launch (or anytime in Settings):
- User sees a list of all Bible books with checkboxes
- Mark books/chapters already read
- The lectio continua picks up from where they haven't read yet
- If all books are unmarked, it starts from Genesis (OT) and Matthew (NT)

### Progress Tracking

- Percentage of OT complete
- Percentage of NT complete
- Percentage of CCC complete
- Visual progress bars on the `/progress/` dashboard
- Estimated completion date based on current pace

---

## 30-Day Psalter Cycle (DWDO)

All 150 psalms in 30 days, split between Morning and Evening prayer:

| Day | Morning     | Evening     |
| --- | ----------- | ----------- |
| 1   | 1-5         | 6-8         |
| 2   | 9-11        | 12-14       |
| 3   | 15-17       | 18          |
| 4   | 19-21       | 22-23       |
| 5   | 24-26       | 27-29       |
| 6   | 30-31       | 32-34       |
| 7   | 35-36       | 37          |
| 8   | 38-40       | 41-43       |
| 9   | 44-46       | 47-49       |
| 10  | 50-52       | 53-55       |
| 11  | 56-58       | 59-61       |
| 12  | 62-64       | 65-67       |
| 13  | 68          | 69-70       |
| 14  | 71-72       | 73-74       |
| 15  | 75-77       | 78          |
| 16  | 79-81       | 82-85       |
| 17  | 86-88       | 89          |
| 18  | 90-92       | 93-94       |
| 19  | 95-97       | 98-101      |
| 20  | 102-103     | 104         |
| 21  | 105         | 106         |
| 22  | 107         | 108-109     |
| 23  | 110-113     | 114-115     |
| 24  | 116-118     | 119:1-32    |
| 25  | 119:33-72   | 119:73-104  |
| 26  | 119:105-144 | 119:145-176 |
| 27  | 120-125     | 126-131     |
| 28  | 132-135     | 136-138     |
| 29  | 139-141     | 142-143     |
| 30  | 144-146     | 147-150     |

The table above uses MT (Hebrew) numbering. The app stores both MT and LXX numbering systems in `src/assets/psalter/30-day.json` and selects the correct one based on the chosen Bible translation (e.g., DRB uses LXX, NABRE/RSV use MT).

The day of the psalter cycle is determined by `day_of_month` (1-30). Months with 31 days repeat day 30. February uses days 1-28/29.

**Compline psalms** rotate weekly (not part of the 30-day cycle, MT numbering shown):
- Sunday: Psalm 4
- Monday: Psalm 91
- Tuesday: Psalm 134
- Wednesday: Psalm 4
- Thursday: Psalm 91
- Friday: Psalm 134
- Saturday: Psalm 4 + 134

---

## Bible Translation

- **Default (offline):** Douay-Rheims — public domain, bundled as JSON
- **Online options (via Bolls.life API):** RSV2CE, NABRE, NRSVCE, Clementine Vulgate
- User selects preferred translation in Settings
- Online translations are cached locally in SQLite after first fetch
- Falls back to Douay-Rheims when offline and no cache available

---

## Screens

### `/office/` — Office Hub
- Three cards: Morning, Evening, Compline
- Each shows: hour name, status (completed / not yet / in progress), time completed
- Today's psalms and reading references previewed on each card

### `/office/morning`, `/office/evening`, `/office/compline` — Prayer Flow
- Full scrollable prayer experience
- Each section (hymn, psalmody, reading, canticle, etc.) is a distinct visual block
- Decorative drop cap on first letter of readings
- "Mark as Complete" button at the bottom
- Progress indicator showing position within the prayer

### `/progress/` — Reading Progress Dashboard
- Three progress bars: OT, NT, CCC
- Percentage complete + estimated completion date
- List of completed books
- Current position in each reading track

### `/settings/` — Relevant Settings
- Translation picker
- Mark books as already read (checklist of all 73 books)
- Theme toggle (light/dark/system)

---

## Data Model

```typescript
interface ReadingProgress {
  type: 'ot' | 'nt' | 'catechism' | 'psalter'
  currentBook: string
  currentChapter: number
  currentVerse: number
  completedBooks: string[]
  startDate: string       // YYYY-MM-DD
}

interface OfficePreferences {
  psalterCycle: '30-day' | 'custom'
  translation: string     // 'DRB', 'RSV2CE', 'NABRE', etc.
  completedReadings: { book: string; chapters: number[] }[]
}

interface DailyOffice {
  date: string            // YYYY-MM-DD
  morning: { completed: boolean; completedAt?: number }
  evening: { completed: boolean; completedAt?: number }
  compline: { completed: boolean; completedAt?: number }
}
```

### SQLite Schema

```sql
CREATE TABLE reading_progress (
  type TEXT PRIMARY KEY,    -- 'ot', 'nt', 'catechism', 'psalter'
  current_book TEXT NOT NULL,
  current_chapter INTEGER NOT NULL,
  current_verse INTEGER NOT NULL DEFAULT 1,
  completed_books TEXT NOT NULL DEFAULT '[]',  -- JSON array
  start_date TEXT NOT NULL
);

CREATE TABLE office_preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL       -- JSON value
);

CREATE TABLE daily_office (
  date TEXT NOT NULL,
  hour TEXT NOT NULL,       -- 'morning', 'evening', 'compline'
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at INTEGER,
  PRIMARY KEY (date, hour)
);

CREATE TABLE cached_translations (
  translation TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  content TEXT NOT NULL,     -- JSON array of verses
  cached_at INTEGER NOT NULL,
  PRIMARY KEY (translation, book, chapter)
);

CREATE INDEX idx_daily_office_date ON daily_office(date);
```
