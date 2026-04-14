# Christmas Novena (9 Days)

## Goal

Add a seasonal **Christmas Novena** as a standalone program practice in `ember-novenas`, with full EN/PT-BR parity and explicit source/licensing notes.

## Devotional Background & Liturgical Context

- In many Catholic traditions, a Christmas novena is prayed as an immediate preparation for the Nativity, commonly **Dec 16–24** (9 days).
- Regional variants exist (for example, Roman Advent forms and Latin American *Novena de Navidad/Aguinaldos* forms), so source selection must be explicit.
- Ember should preserve this Advent-to-Nativity framing in `history`/`howToPray`, while allowing users to begin at any time of year.

## Program Behavior in Ember

- Type: program practice
- `program.totalDays`: `9`
- `program.progressPolicy`: `continue`
- `program.completionBehavior`: `offer-restart`
- Default slot: daily, extra tier, disabled by default

Behavior expectations:
- Missing calendar days does not reset progress (`continue`).
- Completing Day 9 offers restart (`offer-restart`).
- Existing program day-navigation UX is reused; no runtime/UI behavior changes.

## Packaging Decision

- Keep novenas consolidated in **`ember-novenas`**.
- Add one practice: **`christmas-novena`**.
- Reuse shared prayer refs from `ember-default` where applicable.

## Content Model (Existing Content-Engine DSL)

- `manifest.json`
  - Program config (`totalDays: 9`, `continue`, `offer-restart`)
  - Localized metadata (`name`, `description`, `history`, `howToPray`)
  - `data.christmas-novena-days -> data/days.json`
- `data/days.json`
  - `indexBy: "program-day"`
  - 9 entries with localized day metadata (`dayTitle`, `theme`, `intention`, optional `scriptureFocus`)
- `flow.json` (suggested shape)
  - Opening prayer/invocation
  - `cycle` on `christmas-novena-days` for day-specific text blocks
  - Day-specific `prose`/`meditation` sections for Advent-Nativity progression
  - Closing petition and optional seasonal hymn stanza reference (only if licensed/permitted)
  - optional `select` only for explicit source-backed variants

No new engine primitive is expected. If faithful content cannot be represented with `cycle` + `prayer` + `meditation/prose` (+ optional `select`), pause and propose a DSL extension first.

## Day Sequence Requirements (Content Planning Only)

Define 9 localized day themes/intention lines (EN/PT-BR parity), e.g.:

1. Promise of the Messiah and Advent longing
2. Mary’s fiat and humble readiness
3. St. Joseph’s obedient faith
4. The poor and little ones awaiting the Savior
5. Repentance and interior preparation
6. Charity toward family, neighbor, and the needy
7. O Antiphon-style expectation of Emmanuel
8. Peace, reconciliation, and domestic holiness
9. Vigil of the Nativity: adoration of the Incarnate Word

This spec defines structure/progression only; final authored prayer text is a follow-up content task.

## Localization Expectations (en-US + pt-BR)

- Every user-facing string must ship in both locales (no fallback-only copy).
- Preserve theological and devotional equivalence across locales; do not mix incompatible regional variants unless explicitly sourced.
- Naming consistency:
  - en-US: “Christmas Novena”, “Nativity of the Lord”
  - pt-BR: “Novena de Natal”, “Natividade do Senhor”
- Pre-merge parity check: same 9-day count, section structure, and thematic progression in both locales.

## Source, Provenance, Attribution & Licensing

- Christmas novena texts vary significantly by region and publisher; source decision must be explicit before text import.
- Prefer public-domain or clearly reusable devotional sources for fixed prayers.
- Many modern editions/translations and hymn renderings are copyrighted; if reuse rights are unclear, author original devotional wording faithful to Catholic doctrine and approved tradition.
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
