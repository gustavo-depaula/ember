# Novena to St. Therese (9 Days)

## Goal

Add a traditional **Novena to St. Therese of Lisieux** as a standalone program practice in `novenas`, with full EN/PT-BR parity and explicit provenance/licensing notes.

## Devotional Background & Ember Fit

- St. Therese (the “Little Flower”) is a Doctor of the Church whose “Little Way” is widely prayed by beginners and lifelong Catholics alike.
- A 9-day novena to her intercession fits Ember’s pillars:
  - **Fidelity:** simple daily rhythm that encourages consistency.
  - **Devotion:** saint-centered prayer rooted in communion of saints.
  - **Wisdom:** short reflections on spiritual childhood, trust, and hidden charity.

## Program Behavior in Ember

- Type: program practice
- `program.totalDays`: `9`
- `program.progressPolicy`: `continue`
- `program.completionBehavior`: `offer-restart`
- Default slot: daily, extra tier, disabled by default

Behavior expectations:
- Missing calendar days does not reset progress (`continue`).
- Day 9 completion prompts a restart option (`offer-restart`).
- Existing program detail/day navigation UX is reused; no new runtime behavior.

## Packaging Decision

- Keep novenas consolidated in **`novenas`**.
- Add one practice: **`st-therese-novena`**.
- Reuse shared prayer refs from `base` where applicable.

## Content Model (Existing Content-Engine DSL)

- `manifest.json`
  - Program config (`totalDays: 9`, `continue`, `offer-restart`)
  - Localized metadata (`name`, `description`, `history`, `howToPray`)
  - `data.therese-novena-days -> data/days.json`
- `data/days.json`
  - `indexBy: "program-day"`
  - 9 entries with localized day metadata (ex: `dayTitle`, `intention`, `meditationTheme`)
- `flow.json`
  - `cycle` on `therese-novena-days` for day-specific intention/meditation content
  - `prayer` blocks for fixed prayers/invocations
  - `meditation`/`prose` block for Little Way reflections
  - optional `select` only if a true source-based branch is needed

No new engine primitive is expected. If faithful content cannot be represented with `cycle` + `prayer` + `meditation/prose` (+ optional `select`), pause and propose a DSL extension first.

## Day Sequence Requirements (Content Planning Only)

Define 9 localized day themes/intention lines (EN/PT-BR parity), e.g.:

1. Spiritual childhood and confidence in God
2. Humility and littleness
3. Hidden charity in ordinary duties
4. Love for Jesus in prayer and sacrifice
5. Trust through dryness and suffering
6. Merciful love and conversion of sinners
7. Zeal for priests, missionaries, and souls
8. Joyful fidelity in daily life
9. Hopeful perseverance under St. Therese’s intercession

This spec sets structure/progression only; full authored prayer text is a follow-up content task.

## Localization Expectations (en-US + pt-BR)

- Every user-facing string ships in both locales.
- Preserve theological equivalence across locales; avoid mixing incompatible prayer variants without a source decision.
- Naming consistency:
  - en-US: “St. Therese of Lisieux”, “Novena to St. Therese”
  - pt-BR: “Santa Teresinha de Lisieux”, “Novena a Santa Teresinha”
- Pre-merge parity check: same day count, block structure, and intention sequencing in both locales.

## Source, Provenance, Attribution & Licensing

- Novena wording varies across publishers and apostolates; source choice must be explicit before final text import.
- Distinguish public-domain sources from modern copyrighted translations/adaptations (especially for EN/PT-BR editions tied to *Story of a Soul* translations).
- If licensing is unclear, author original devotional wording faithful to approved Catholic doctrine and traditional novena structure.
- Add source references/URLs in the implementation PR and include required attribution metadata.

## Scope Boundaries

### In Scope (this spec)

- Program behavior definition
- DSL structure plan (day data + prayer/intention/meditation blocks)
- Localization parity requirements
- Provenance/licensing guardrails

### Out of Scope (follow-up content task)

- Final prayer text authoring and editorial review
- Runtime/UI/engine changes
- New DSL primitives without a proven blocker

Only introduce runtime changes if a verified DSL gap blocks faithful implementation.
