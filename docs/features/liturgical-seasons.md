# Liturgical Seasons

## Overview

The app calculates liturgical seasons for both the Ordinary Form (OF/Novus Ordo) and Extraordinary Form (EF/1962) calendars. A global user preference selects which calendar to use. No saints' days — just the temporal cycle.

## Season Type

A single union covers both forms. OF and EF each use a subset:

```typescript
type LiturgicalSeason =
  | 'advent'           // both
  | 'christmas'        // both (different end dates)
  | 'epiphany'         // EF only
  | 'septuagesima'     // EF only
  | 'lent'             // both
  | 'easter'           // both
  | 'ordinary'         // OF only
  | 'post-pentecost'   // EF only

type LiturgicalCalendarForm = 'of' | 'ef'
```

## Season Boundaries

### OF (Ordinary Form)

| Season | Start | End |
|--------|-------|-----|
| Advent | 1st Sunday of Advent | Dec 24 |
| Christmas | Dec 25 | Baptism of the Lord (Sunday after Jan 6) |
| Ordinary I | Day after Baptism of the Lord | Day before Ash Wednesday |
| Lent | Ash Wednesday (Easter - 46) | Holy Saturday |
| Easter | Easter Sunday | Pentecost (Easter + 49) |
| Ordinary II | Day after Pentecost | Saturday before 1st Sunday of Advent |

### EF (Extraordinary Form / 1962)

| Season | Start | End |
|--------|-------|-----|
| Advent | 1st Sunday of Advent | Dec 24 |
| Christmas | Dec 25 | Jan 13 (Octave of Epiphany) |
| Epiphany | Jan 14 | Saturday before Septuagesima Sunday |
| Septuagesima | Septuagesima Sunday (Easter - 63) | Shrove Tuesday |
| Lent | Ash Wednesday (Easter - 46) | Holy Saturday |
| Easter | Easter Sunday | Saturday after Pentecost (Easter + 55) |
| Post-Pentecost | Trinity Sunday (Easter + 56) | Saturday before 1st Sunday of Advent |

## Liturgical Color Mapping

| Season | Color |
|--------|-------|
| Advent | violet |
| Christmas | white |
| Epiphany | green |
| Septuagesima | violet |
| Lent | violet |
| Easter | white |
| Ordinary | green |
| Post-Pentecost | green |

## Marian Antiphon Schedule

The antiphon rotation follows its own traditional date ranges, shared across both forms. It is **not** derived from the liturgical season — the boundaries differ:

| Antiphon | Start | End |
|----------|-------|-----|
| Alma Redemptoris Mater | 1st Sunday of Advent | February 1 |
| Ave Regina Caelorum | February 2 | Wednesday of Holy Week |
| Regina Caeli | Easter Sunday | Saturday after Pentecost |
| Salve Regina | Trinity Sunday | Saturday before 1st Sunday of Advent |

## Architecture

### Core module: `src/lib/liturgical/season.ts`

- `computeEaster(year)` — Meeus/Jones/Butcher algorithm
- `getFirstSundayOfAdvent(year)` — first Sunday on or after Nov 27
- `getAshWednesday(year)` — Easter - 46
- `getBaptismOfTheLord(year)` — Sunday after Jan 6
- `getSeptuagesimaSunday(year)` — Easter - 63
- `getLiturgicalSeason(date, form?)` — returns the season for a given date and form (defaults to OF)
- `getLiturgicalColor(season)` — maps season to liturgical color

Two internal pure functions (`getOfSeason`, `getEfSeason`) handle each calendar's boundaries.

### Antiphon module: `src/lib/liturgical/antiphons.ts`

`getMarianAntiphon(date)` uses its own date-range logic (not `getLiturgicalSeason`).

### User preference: `src/stores/preferencesStore.ts`

`liturgicalCalendar: 'of' | 'ef'` — global setting, persisted in AsyncStorage under `liturgical-calendar`. Default: `'of'`.

### Consumers

- **LiturgicalHeader** (`src/features/home/components/LiturgicalHeader.tsx`) — displays season name and accent color on the home screen
- **Content engine** (`src/content/engine.ts`) — the `liturgical-season` variant selector resolves using `getLiturgicalSeason()` with the user's form preference
- **Tamagui themes** (`src/config/tamagui.config.ts`) — sub-themes for each season (light/dark)
- **Settings** (`src/app/settings/index.tsx`) — pill selector for OF/EF calendar

## Seasonal Theme Auto-Switching

The app automatically applies the liturgical season's sub-theme via `<Theme name={season}>` in `_layout.tsx`. This shifts the `$accent` color (and other overridden tokens) app-wide based on the current date.

### Hook: `src/hooks/useLiturgicalTheme.ts`

`useLiturgicalThemeName()` returns the Tamagui sub-theme name for the current date:
- Detects Gaudete Sunday (3rd Sunday of Advent) and Laetare Sunday (4th Sunday of Lent) → returns `'rose'`
- Otherwise delegates to `getLiturgicalSeason()`

### Rose Vestment Days

Rose sub-themes (`light_rose`, `dark_rose`) are registered in the Tamagui config with accent `#C27083` (light) / `#D98A9A` (dark).

### Seasonal Visual Elements

- **SeasonalIcon** (`src/components/ornaments/SeasonalIcon.tsx`) — SVG motifs per season: wreath (Advent), star (Christmas), cross+thorns (Lent), lily (Easter), simple cross (Ordinary)
- **Liturgical color bar** — thin bar in vestment color shown in the LiturgicalHeader
- **Seasonal divider symbols** — `✦` for festive seasons, `✞` for penitential/ordinary
- **Practice card accent bars** — left border colored with `$accent`
- **Fidelity Wall color shift** — Lent/Easter override wall color tokens (violet/gold scales)
- **SeasonalContext** (`src/features/home/components/SeasonalContext.tsx`) — seasonal description text + feast countdown (shows within 14 days of major feasts)

### Expanded Sub-Themes

Liturgical sub-themes now override `accentSubtle` and (for Lent/Easter) wall color tokens in addition to `accent`.

## Not Yet Implemented

- Saints' days / sanctoral cycle
- Holy Week / Easter Triduum as distinct sub-periods
- Ember Days, Rogation Days
- Seasonal hymn selection (hymns module returns static content)
