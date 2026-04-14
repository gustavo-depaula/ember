# 54-Day Rosary Novena

## Goal

Add a traditional **54-Day Rosary Novena** as a standalone program practice, packaged in its own novena library.

## Devotional Rules

1. Total duration: **54 consecutive days** (6 novenas of 9 days).
2. Days **1-27**: prayed in **petition** for a specific intention.
3. Days **28-54**: prayed in **thanksgiving**, whether or not the petition seems granted.
4. Traditional mystery cadence: **Joyful -> Sorrowful -> Glorious**, repeating every 3 days.
5. The cadence is **not** tied to weekday Rosary assignments.

## Packaging Decision

- Create one new library: **`ember-novenas`**
- Include only one practice initially: **`rosary-54-day-novena`**
- Depend on `ember-default` for shared prayer refs (`sign-of-cross`, `our-father`, `hail-mary`, etc.)

## Practice Shape

- Type: program practice
- `program.totalDays`: `54`
- `program.progressPolicy`: `continue`
- `program.completionBehavior`: `offer-restart`
- Default slot: daily, extra tier, disabled by default

## Content Model

- `data/days.json` with `indexBy: "program-day"` and 54 entries:
  - `dayTitle`
  - `phase` (`petition` | `thanksgiving`)
  - `mysteryId` (`joyful` | `sorrowful` | `glorious`)
  - `mysteryLabel`
- `flow.json` uses:
  - `cycle` (program-day) for day-specific metadata
  - `select` for phase-specific and mystery-specific text blocks
  - `repeat` for 5 decades and 10 Hail Marys

## Text Provenance

- Prefer public-domain devotional texts for fixed prayers.
- For meditations and instructional lines, prefer original wording when provenance is uncertain.
- Keep EN and PT-BR parity for all user-facing content.

## Out of Scope

- Luminous Mysteries variant for this novena
- UI-level changes in pray/program screens
- Cross-linking from existing Rosary detail screen
