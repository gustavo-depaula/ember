# Divine Mercy Novena (9 Days)

## Goal

Add a traditional **Divine Mercy Novena** as a standalone program practice in `novenas`, with full EN/PT-BR parity and clear provenance/attribution notes.

## Devotional Background & Timeline

- The Divine Mercy Novena is rooted in the devotion associated with **St. Faustina Kowalska**.
- The common public tradition is:
  - **Start:** Good Friday (Day 1)
  - **End:** Holy Saturday (Day 9)
  - **Liturgical culmination:** Divine Mercy Sunday
- Ember should preserve this tradition in descriptive text (`history`/`howToPray`) while still allowing users to begin at any time of year.

## Program Behavior in Ember

- Type: program practice
- `program.totalDays`: `9`
- `program.progressPolicy`: `continue`
- `program.completionBehavior`: `offer-restart`
- Default slot: daily, extra tier, disabled by default

Behavior expectations:
- If a user misses a calendar day, program day still advances (`continue`).
- After Day 9 completion, show restart option (`offer-restart`), not auto-disable.
- Existing program detail/day navigation UX is reused; no new screen behavior is required.

## Packaging Decision

- Keep novenas consolidated in **`novenas`**.
- Add one practice: **`divine-mercy-novena`**.
- Reuse shared prayer refs from `base` where available.

## Content Model (Existing Content-Engine DSL)

Use the same content-only pattern as current novenas:

- `manifest.json`
  - program config (`totalDays: 9`, `continue`, `offer-restart`)
  - localized metadata (`name`, `description`, `history`, `howToPray`)
  - `data.novena-days -> data/days.json`
- `data/days.json`
  - `indexBy: "program-day"`
  - 9 entries (one per novena day), each with localized day metadata (ex: `dayTitle`, `intention`, `petitionText`)
- `flow.json`
  - `cycle` on `novena-days` for day-specific sections
  - `repeat` for chaplet structure (5 decades, 10 invocations each)
  - `prayer` sections via refs for fixed prayers
  - optional `select` only if we need a true branching choice (no custom runtime branching)

No new engine primitive is expected. If the draft content cannot be expressed with `cycle` + `repeat` + `prayer` (+ optional `select`), pause and propose a DSL extension first.

## Day Sequence Requirements (Content Planning Only)

The 9-day content set should follow the traditional intention order, localized in EN/PT-BR:

1. All mankind, especially sinners
2. Priests and religious
3. Devout and faithful souls
4. Those who do not believe in Christ / do not know Him
5. Separated brethren
6. Meek and humble souls, and little children
7. Souls who especially venerate and glorify Divine Mercy
8. Souls in purgatory
9. Lukewarm souls

This spec defines ordering and structure only; full prayer text authoring is out of scope here.

## Localization Expectations (en-US + pt-BR)

- Every user-facing string must be provided in both locales (no locale fallback in shipped content).
- Preserve theological equivalence across locales; do not mix prayer variants without an explicit source decision.
- Keep naming consistent:
  - en-US: “Divine Mercy”, “Divine Mercy Sunday”, “Chaplet”
  - pt-BR: “Divina Misericórdia”, “Domingo da Divina Misericórdia”, “Terço da Misericórdia”
- Parity check before merge: identical section structure and day count in both locales.

## Source & Attribution Notes

Because wording variants exist, source selection must be explicit before final text import.

- **Primary devotional source:** text tradition associated with St. Faustina’s *Diary* and the commonly promulgated Divine Mercy Novena intentions.
- **Attribution requirement:** add Divine Mercy source credit to app/library attribution metadata when content is implemented.
- **License/provenance check:** verify permissibility of the exact EN and PT-BR wording used (public domain, licensed, or original editorial wording). If a translation is not clearly reusable, write original devotional wording faithful to the traditional intention.
- **Implementation note:** include source URLs/references in the content PR description when the actual text is added.

## Scope Boundaries

### In Scope (this spec)

- Program behavior definition
- DSL/content-shape plan
- Localization and attribution requirements

### Out of Scope (follow-up content task)

- Writing the full day-by-day prayer texts
- Creating or modifying runtime/UI code
- New program engine behavior

Only introduce runtime code if a proven DSL gap blocks faithful implementation.
