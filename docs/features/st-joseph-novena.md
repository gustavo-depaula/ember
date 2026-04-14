# Novena to St. Joseph (9 Days)

## Goal

Add a traditional **Novena to St. Joseph** as a standalone program practice in `ember-novenas`, with full EN/PT-BR parity and explicit provenance/licensing notes.

## Devotional Background & Ember Fit

- St. Joseph is a major Catholic devotion: patron of the Universal Church, families, fathers, workers, and a holy death.
- A 9-day St. Joseph novena maps naturally to Ember’s pillars:
  - **Fidelity:** a concrete daily commitment with clear day progression.
  - **Devotion:** deeper relationship with a central saint of salvation history.
  - **Wisdom:** short formation-oriented meditations on Joseph’s virtues and vocation.

## Program Behavior in Ember

- Type: program practice
- `program.totalDays`: `9`
- `program.progressPolicy`: `continue`
- `program.completionBehavior`: `offer-restart`
- Default slot: daily, extra tier, disabled by default

Behavior expectations:
- Missed calendar days do not reset progress (`continue`).
- Day 9 completion offers restart from Day 1 (`offer-restart`).
- Reuse existing program day navigation UX; no runtime/UI behavior changes.

## Packaging Decision

- Keep novenas consolidated in **`ember-novenas`**.
- Add one practice: **`st-joseph-novena`**.
- Reuse shared prayer refs from `ember-default` when available.

## Content Model (Existing Content-Engine DSL)

- `manifest.json`
  - Program config (`totalDays: 9`, `continue`, `offer-restart`)
  - Localized metadata (`name`, `description`, `history`, `howToPray`)
  - `data.joseph-novena-days -> data/days.json`
- `data/days.json`
  - `indexBy: "program-day"`
  - 9 entries with localized day metadata (ex: `dayTitle`, `intention`, `meditationTheme`)
- `flow.json`
  - `cycle` on `joseph-novena-days` for day-specific intention/meditation content
  - `prayer` blocks for fixed invocations and closing prayers
  - `meditation`/`prose` block for day reflection
  - optional `select` only if a real source-based variant is required

No new engine primitive is expected. If faithful content cannot be represented with `cycle` + `prayer` + `meditation/prose` (+ optional `select`), pause and propose a DSL extension first.

## Day Sequence Requirements (Content Planning Only)

Define 9 localized day themes/intention lines (EN/PT-BR parity), e.g.:

1. Trustful obedience to God
2. Purity of heart and custody of chastity
3. Family life and domestic holiness
4. Work, provision, and justice
5. Fathers, spouses, and vocations
6. Patience in trials and hidden life
7. Service to the Church
8. Grace of a happy death and prayer for the dying
9. Final perseverance and union with Jesus and Mary

This spec fixes structure and progression only; full authored prayer text is a follow-up content task.

## Localization Expectations (en-US + pt-BR)

- Every user-facing string ships in both locales (no fallback-only copy).
- Preserve theological equivalence between locales; avoid mixing prayer variants without an explicit source decision.
- Naming consistency:
  - en-US: “St. Joseph”, “Novena to St. Joseph”
  - pt-BR: “São José”, “Novena a São José”
- Pre-merge parity check: same day count, section structure, and intention flow across locales.

## Source, Provenance, Attribution & Licensing

- St. Joseph novena wording exists in multiple devotional variants; source selection must be explicit before importing final text.
- Prefer public-domain or clearly reusable Catholic devotional sources for fixed texts.
- If EN or PT-BR wording is not clearly reusable, author original devotional wording faithful to the traditional structure and theology.
- Add source references/URLs in the content implementation PR and include attribution metadata where required by source terms.

## Scope Boundaries

### In Scope (this spec)

- Program behavior definition
- DSL structure plan (day data + prayer/intention/meditation blocks)
- Localization parity requirements
- Provenance/licensing guardrails

### Out of Scope (follow-up content task)

- Final prayer text authoring and editorial review
- Runtime/UI/app engine changes
- New DSL primitives without a proven blocker

Only introduce runtime changes if a verified DSL gap blocks faithful implementation.
