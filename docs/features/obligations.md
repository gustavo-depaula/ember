# Liturgical Obligations

Tracks three types of Catholic obligation — holy days, fasting, and abstinence — with jurisdiction-aware rules for OF/EF. Also adds `holy-days-of-obligation` as a schedule type so practices (especially Mass) can be scheduled on holy days.

---

## Catholic Rules (Canonical Sources)

### Universal Law (Canon 1250-1253, 1983 CIC)

- **Canon 1250**: All Fridays and Lent are penitential.
- **Canon 1251**: Abstinence from meat on all Fridays (unless a solemnity). Fast + abstinence on Ash Wednesday and Good Friday.
- **Canon 1252**: Abstinence from age 14. Fasting ages 18-59.
- **Canon 1253**: Bishops' conferences may substitute other forms of penance.

### OF — United States (USCCB)

- Fridays in Lent: meat abstinence required.
- Fridays outside Lent: some form of penance required, but need not be meat abstinence (1966 Pastoral Statement).
- Fast: Ash Wednesday + Good Friday.

### OF — Brazil (CNBB)

- All Fridays: abstinence from meat (substitution with charity/other food allowed, but not abolished).
- Fast: Ash Wednesday + Good Friday.

### EF (1962 Rubrics)

- **Complete abstinence**: All Fridays, Ash Wednesday, Vigils of Immaculate Conception and Christmas.
- **Partial abstinence** (meat at principal meal only): Ember Wednesdays and Saturdays, Vigil of Pentecost.
- **Fast**: Lenten weekdays, Ember Days (all three), Vigils of Pentecost/Immaculate Conception/Christmas.
- **Ember Days**: Wed/Fri/Sat after (1) 1st Sunday of Lent, (2) Pentecost, (3) Sept 14, (4) Dec 13.
- Vigils on Sunday: obligation dropped entirely.

---

## Data Model

### AbstinenceLevel

```typescript
type AbstinenceLevel = 'full' | 'partial' | 'penance-required' | 'none'
```

- `full` — no meat
- `partial` — meat only at principal meal (EF Ember Wed/Sat)
- `penance-required` — penance obligatory, form flexible (US Fridays outside Lent)
- `none` — no obligation

### DayObligations

```typescript
type DayObligations = {
  holyDay: boolean
  fast: boolean
  abstinence: AbstinenceLevel
  details: LocalizedText[]
}
```

### Jurisdiction Rules

```typescript
const jurisdictionRules = {
  US: { fridayOutsideLent: 'penance-required' },
  BR: { fridayOutsideLent: 'full' },
  // default (universal): 'full'
}
```

---

## Schedule Type: `holy-days-of-obligation`

Added to the `ScheduleRule` discriminated union. Evaluated in `isApplicableOn` by checking if the day's principal celebration has `holyDayOfObligation: true`.

Requires `DayCalendar` context — threaded via a `ScheduleContext` parameter.

Mass defaults include a holy-day slot so Mass appears automatically on obligation days.

---

## UI Display

- **Home screen** (`CelebrationOfDay`): obligation badges below celebrations — "Day of Fast", "Day of Abstinence", "Day of Penance".
- **Calendar** (`DayDetail`): same obligation info.
- Holy day badge already exists.

---

## Not in scope

- Age-based filtering (14/18-59)
- Obligation reminders/notifications
- Calendar grid dot indicators
- Minor EF vigils beyond Pentecost/Immaculate Conception/Christmas
