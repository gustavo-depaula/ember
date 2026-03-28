# Ordo Missae — Holy Mass Feature

## Overview

Static reference screen displaying the fixed/ordinary parts of the Catholic Mass. Users can follow along during Mass with beautifully rendered bilingual (Latin + English) prayer texts.

## Forms Supported

- **Ordinary Form (Novus Ordo)** — Roman Missal, Third Edition (2011 ICEL translation)
- **Extraordinary Form (Traditional Latin Mass)** — 1962 Roman Missal

Users toggle between forms via a segmented control. The selected form persists across sessions via `preferencesStore`.

## Content Structure

Mass content lives in `src/assets/mass/` as JSON files:
- `ordinary-form.json` — Novus Ordo ordinary
- `extraordinary-form.json` — TLM ordinary

### Section Types

| Type | Purpose |
|------|---------|
| `heading` | Major liturgical division (e.g., "Liturgy of the Eucharist") |
| `subheading` | Sub-section within a division |
| `rubric` | Liturgical instruction text |
| `prayer` | Bilingual prayer with `speaker` (priest/people/all), `latin`, `english` |
| `proper` | Placeholder slot for variable texts (introit, collect, readings, etc.) |
| `options` | Multiple alternatives (e.g., Eucharistic Prayers I-IV, Penitential Act forms) |
| `divider` | Ornamental rule between major sections |

### Extensibility

- Every prayer and proper has a unique `id` for future reference
- `proper` sections include a `slot` field (e.g., `"introit"`, `"collect"`) for future lectionary integration
- `options` type supports nested sections, allowing complex alternatives (e.g., full Eucharistic Prayers)
- `speaker` field enables future "highlight my responses" mode

## UI

- Single scrollable screen at `/mass`
- Reuses existing components: `ManuscriptFrame`, `PrayerText`, `DropCap`, `RubricLabel`, `OrnamentalRule`, `PageBreakOrnament`
- People's responses styled with bold weight and `R.` indicator
- Proper slots shown as dashed-border placeholders
- Options rendered with horizontal pill selector

## Navigation

Accessible from home screen via `NavigationMedallion` (cross icon, "Holy Mass" / "Santa Missa").

## Future Enhancements

- **Fill proper slots with daily readings** — see `docs/features/daily-readings.md` for full research. EF is fully solvable via Missale Meum API; OF readings available via Evangelizo but OF collects/antiphons have a data gap (ICEL copyright).
- Multiple preface options
- "Highlight my responses" toggle (filter by `speaker: 'people'`)
- Audio/chant mode for Latin texts
- Requiem Mass, Nuptial Mass variants
