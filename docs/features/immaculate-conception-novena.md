# Immaculate Conception Novena (9 Days)

## Goal

Add a seasonal **Immaculate Conception Novena** as a standalone program practice in `novenas`, with EN/PT-BR parity and explicit provenance/licensing guardrails.

## Devotional Background & Liturgical Context

- This novena traditionally prepares for the **Solemnity of the Immaculate Conception (Dec 8)**, commonly prayed **Nov 29–Dec 7**.
- Its theological center is Mary’s preservation from original sin by a singular grace of Christ, making it a strong Advent devotion of hope and purity.
- Ember should preserve this seasonal context in `history`/`howToPray`, while still allowing users to start at any time.

## Program Behavior in Ember

- Type: program practice
- `program.totalDays`: `9`
- `program.progressPolicy`: `continue`
- `program.completionBehavior`: `offer-restart`
- Default slot: daily, extra tier, disabled by default

Behavior expectations:
- Missing calendar days does not reset day progression (`continue`).
- Completing Day 9 offers restart from Day 1 (`offer-restart`).
- Reuse existing program UX (day navigation/progress); no runtime or UI changes.

## Packaging Decision

- Keep novenas consolidated in **`novenas`**.
- Add one practice: **`immaculate-conception-novena`**.
- Reuse shared prayer refs from `base` when possible.

## Content Model (Existing Content-Engine DSL)

- `manifest.json`
  - Program config (`totalDays: 9`, `continue`, `offer-restart`)
  - Localized metadata (`name`, `description`, `history`, `howToPray`)
  - `data.immaculate-conception-novena-days -> data/days.json`
- `data/days.json`
  - `indexBy: "program-day"`
  - 9 entries with localized day data (`dayTitle`, `intention`, `meditationTheme`, optional `closingPetition`)
- `flow.json` (suggested shape)
  - Opening fixed prayer/invocation
  - `cycle` on `immaculate-conception-novena-days` for day-specific text
  - Day-specific `prose`/`meditation` sections for intention/reflection
  - Closing prayer and Marian invocation
  - optional `select` only if a source-backed variant is truly required

No new engine primitive is expected. If faithful content cannot be represented with `cycle` + `prayer` + `meditation/prose` (+ optional `select`), pause and propose a DSL extension first.

## Day Sequence Requirements (Content Planning Only)

Define 9 localized day themes/intention lines (EN/PT-BR parity), e.g.:

1. Praise of the Trinity for Mary’s election
2. Mary conceived without sin
3. Fullness of grace and obedience
4. Purity of heart and conversion
5. Hope amid Advent waiting
6. Intercession for families and children
7. Intercession for the Church and vocations
8. Perseverance in grace and final fidelity
9. Solemn consecratory petition through the Immaculate Heart

This spec defines structure and progression only; final authored prayer text is a follow-up content task.

## Localization Expectations (en-US + pt-BR)

- Every user-facing string ships in both locales (no fallback-only copy).
- Preserve theological equivalence across locales; avoid mixing incompatible prayer variants without explicit source decisions.
- Naming consistency:
  - en-US: “Immaculate Conception”, “Immaculate Conception Novena”
  - pt-BR: “Imaculada Conceição”, “Novena da Imaculada Conceição”
- Pre-merge parity check: same 9-day count, section structure, and intention order in both locales.

## Source, Provenance, Attribution & Licensing

- Immaculate Conception novena wording varies by publisher and apostolate; source choice must be explicit before importing final text.
- Prefer public-domain or clearly reusable Catholic devotional sources for fixed prayers.
- Modern translations/booklets may be copyrighted; if licensing is unclear, author original devotional wording faithful to Catholic doctrine and traditional novena structure.
- Include source URLs/references and required attribution metadata in the implementation PR.

## Scope Boundaries

### In Scope (this spec)

- Program behavior definition
- DSL content shape (`data/days.json` + `cycle`-driven day text)
- Localization parity requirements
- Provenance/licensing guardrails

### Out of Scope (follow-up content task)

- Final prayer text authoring and editorial/theological review
- Runtime/UI/content-engine behavior changes
- New DSL primitives without a verified blocker

Only introduce runtime code if a proven DSL gap blocks faithful content implementation.
