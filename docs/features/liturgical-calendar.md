# Liturgical Calendar & Mass

How Ember decides *which celebration is today* and *which Mass is said*, for both
the Ordinary Form (OF) and the Extraordinary Form (EF).

## Both forms resolve from their Mass authority

Each form now has a **single** calendar authority driving both the Mass *and*
the display surfaces (home celebration card, month grid, day detail). They can no
longer disagree — the OF bug where the Sacred Heart showed in the Mass but not on
the card (curated `entries.json` resolved it to Easter+61 instead of the canonical
Easter+68) is gone, and the EF display now shows exactly what the EF Mass/Office
celebrates (transfers, octaves, vigils, commemorations included), since both run
the same Divinum Officium engine.

| | OF (Mass **and** display) | EF (Mass **and** display) |
|---|---|---|
| Entry point | `resolveOfDay` (`@ember/mass`) — per day; `buildOfYearCalendar` (`@ember/mass`) loops it across a year for the display | `resolveDay` (`@ember/divinum-officium`) — per day; `buildDoYear` loops it across a year; `buildDoYearCalendar` (app) maps it to the display shape |
| Data | `content/of/calendar/{temporal,sanctoral}.json` (canonical MR statics) + computed temporal cycle | the Divinum Officium corpus (`content/do/…`), via the corpus `DoLoader` |
| Names | sanctoral titles from the statics; temporal names from the **Mass formulary** title (`useCelebrationDisplay`, with `getLiturgicalDayName` fallback) — `temporal-notability.ts` only decides *which* temporal days show | sanctoral titles are the **DO Latin** names (the Kalendarium has no vernacular — fitting for the EF); temporal names fall back to `getLiturgicalDayName` |
| HDO | `of/calendar/hdo.ts` (the single OF Holy-Day-of-Obligation source) | `ef` HDO table in `kalendar/year.ts` (the universal 1962 Holy Days) |
| Descriptions | the Mass **formulary** `description` ("Sobre esta celebração"), loaded on demand by the card/detail; absent → no description shown | none — DO carries no descriptive prose, so EF cards show title + rank only |

`buildOfYearCalendar` and `buildDoYearCalendar` both emit the same
`Map<string, DayCalendar>` shape (each celebration a `ResolvedCelebration` with a
synthesized partial `LiturgicalEntry` whose `id` is a kind-prefixed ref —
`mass/of/…` / `tempore.*` for OF, `ef/sancti/…` / `ef/tempora/…` for EF), so
every existing consumer (`getCelebrationsForDate`, `DayDetail`, the home card,
obligations) works unchanged. Only **named** celebrations are surfaced — for the
EF: every sanctoral winner, plus a commemorated saint when an ordinary feria/Sunday
wins (so the calendar still reads as a saints' calendar), plus privileged temporal
days (DO rank ≥ 6: Sundays of Advent/Lent/Passiontide/Eastertide and the great
feasts of the Lord). Ordinary green Sundays (rank 5) and ferias are dropped, just
as the OF display drops Sundays in Ordinary Time.

> The generated `content/liturgical/of-calendar.json` + `scripts/build-of-calendar.mjs`
> (a `LiturgicalEntry[]` rebuild of the curated file) are **retired** — the display
> reads the canonical statics directly via `resolveOfDay` now. With the EF display
> off it too, the curated `content/liturgical/entries.json` + `buildYearCalendar`
> (`@ember/liturgical`) are no longer used by the calendar (the export remains for
> now; the file can be retired in a later cleanup).

### EF full-canonical naming — the trade-off

The EF display is **full-canonical** (like the OF): names come straight from the
DO engine, with no curated layer. The consequence is that EF celebration names are
**Latin** (the DO Kalendarium has no vernacular titles) and cards carry **no
description**. This was a deliberate choice for symmetry and zero curation; if the
Latin-only titles ever read too rough, a hybrid (curated `entries.json` names
layered over the DO precedence) remains possible without rearchitecting.

## OF day resolution — one precedence authority

`resolveOfDay(date, entries)` (`packages/liturgical/src/of-day.ts`) merges the
**temporal cycle** (computed via `getOfLiturgicalPosition` + `ofTemporeIds`) with
the **sanctoral entries** (the generated OF calendar) and ranks everything on a
single scale: the **GIRM Table of Liturgical Days** (1 = highest):

```
1  Triduum
2  Christmas/Epiphany/Ascension/Pentecost; Sundays of Advent/Lent/Easter; Ash Wed; Holy Week; Easter Octave
3  Solemnities (Lord, BVM, saints) — incl. Trinity, Corpus Christi, Sacred Heart, Christ the King, Jan 1
5  Feasts of the Lord (Presentation, Transfiguration, Holy Cross, Lateran, Baptism)
6  Sundays of Christmas season & Ordinary Time
7  Feasts of saints
9  Privileged ferias (late Advent, Christmas Octave, Lent)
10 Obligatory memorials
12 Optional memorials
13 Ordinary ferias
```

The principal is the lowest number; everything else is suppressed or optional.
This single function replaced two broken/competing precedence paths: the
calendar's old Sunday-only `applySundaySuppression` (for the Mass) and the
string-heuristic `applyPrecedence` in `@ember/mass-of` (the source of the
"bifurcation" bug, now deleted).

Key correctness notes:
- **Movable solemnities** are recognised by their `tempore.solemnity.*` id — the
  robust signal (`of-position` flags only some of them). This is why Trinity
  beats a coinciding feast and why Christ the King ranks as a solemnity.
- **Feasts of the Lord** (`feastOfTheLordIds`) outrank an Ordinary-Time Sunday; a
  saint's feast does not. ember-extra doesn't distinguish them, so the four are
  named explicitly.
- `resolveOfDay` skips any `tempore.*` calendar entry so a computed temporal day
  is never double-counted.

`of-day-year.test.ts` walks 26 representative days across the whole 2026 year and
asserts the principal's kind + position.

## Generation pipeline

`scripts/build-of-calendar.mjs` reads the canonical ember-extra calendar
(`content/of-data/calendar/{sanctorale,tempore/solemnity}`) and emits
`content/liturgical/of-calendar.json` as `LiturgicalEntry[]`, keeping ember-extra
ids so a resolved celebration *is* its Mass-proper id (`sanctorale.05-31` →
`mass/of/sanctorale/05-31`). Movable celebrations carry no date upstream; a
code→rule table in the generator supplies them (Trinity = Easter+56, Mary Mother
of the Church `movable.05-35` = Easter+50, Immaculate Heart `movable.05-32` =
Easter+69). Wired into `pnpm build:corpus` / `build:hearth` and the deploy
workflow so it can't drift from the upstream.

## OF Mass flow

`@ember/mass`'s `createMassOfSource` asks `resolveOfDay` which celebration
wins, then builds *only* that Mass (self-contained, no cross-Mass alternates — so
no mixed readings). A "fixed" day (precedence ≤ 7: solemnity/feast/Sunday)
celebrates the principal alone (expanded to multi-Mass formularies on Christmas,
Holy Thursday, and Pentecost — see below); a memorial/ferial day offers the
celebrant's legitimate choices (saint vs weekday) as separate top-level options.
The app's `MassOfDataSource` provides `fetchOfCalendar()` →
`liturgical/of-calendar.json`.

**Outranked feasts as alternates.** On a fixed day, a coinciding Feast or
Solemnity that precedence *suppressed* is still offered as an additional Mass to
*view* — the principal is the default chip, the suppressed celebration a second
chip — mirroring how multiple saints on a memorial day each get a chip. This is a
devotional affordance (read the Mass that "would have been"), not a rubrical
claim: the principal remains the only Mass said. Lesser suppressed days
(memorials, ferias, an outranked Sunday/weekday) stay hidden. Example: on Trinity
Sunday 2026-05-31 the picker shows **Holy Trinity** (default) + **The Visitation**
(`celebrationFormularyIds` in `packages/mass/src/source.ts`).

**Multi-Mass days.** `ofTemporeIds` yields several formularies for a few days, all
surfaced as chips: Christmas (vigil/night/dawn/day), Holy Thursday (chrism +
Lord's Supper), and **Pentecost** (the day Mass + the extended **Vigil Mass**,
which ember-extra files as the `tempore.easter.week-8.sunday.a` variant). The
Pentecost Vigil shares the day Mass's localized title upstream (only `fr`/`de`
differ), so `titleOverrides` in `source.ts` gives its chip a distinct label.

**Vigils on the eve.** A vigil Mass that may be said the evening *before* its feast
also surfaces on that preceding day, as a second chip after the day's ferial Mass:
**Dec 24** carries its Advent/ferial Mass + the Nativity Vigil, and the **Saturday
before Pentecost** (Easter+48) carries its ferial Mass + the Pentecost Vigil. The
ferial is the default; the vigil is the alternate. (`ofTemporeIds` appends the
vigil id on the eve; `celebrationFormularyIds`'s memorial/ferial branch offers
*every* formulary of the temporal day, not just the first.)

**Mass view switcher.** The normal OF Mass body wraps a `View` select — **Full
Mass** (the whole Order of Mass) or **Readings Only** (just the Lectionary slots,
cycle-bound) — mirroring the EF view switch. Special rites (Easter Vigil, Good
Friday, …) render their own body with no switcher. Built in `buildMassFlow`; the
non-default branch resolves at engine time (it's a labeled select) so the
Readings tab is populated before it's opened.

## EF path

The EF display calendar now resolves from the **same Divinum Officium engine the
EF Mass/Office uses**: `buildDoYear` (`@ember/divinum-officium`) loops `resolveDay`
across the year in *calendar mode* (`sections: false` — precedence only, skipping
the officestring text assembly) with a single shared `directorium`, and the app's
`buildDoYearCalendar` maps the rows onto `DayCalendar`. The DO numeric rank is
normalized to the display `RankEF` (Rubrics-1960 scale: I/II-class 6–7 / 5,
III-class the doubles 3–4, IV-class the lesser feasts, simplices/commemorations
below). `buildDoYear` keeps tests in-package via the filesystem `DoLoader`
(`year.test.ts`), with no curated-data dependency.

The EF Mass (`@ember/mass-propers` lineage) maps date → Divinum Officium file-id →
parsed propers. Its **tempora-vs-sancti choice is data-driven from Divinum Officium's
own occurrence values** (mirroring how the OF Mass now derives precedence from
canonical data). `scripts/build-ef-ranks.mjs` extracts every Mass day's `[Rank]`
number — the 1962/`rubrica 1960` value (Feria 1, Duplex 3, Sunday 6.9, Duplex I
classis 6.5) — into `content/propers/ef-ranks.json`, and `chooseProperSourceByRank`
picks the higher-ranked celebration's Mass. This replaces the old reliance on the
hand-authored `entries.json` *category*; the precedence is now DO's data, not an
invented rubric. (`loadRanks` is optional on `PropersDataSource`, so callers
without the index fall back to the category heuristic.) Rendered via `ProperSlot`
+ the static `ef-*.json` flow fragments.

## Holy days of obligation

`obligations.ts` reads `principal.entry.holyDayOfObligation` from the display
calendar. For the **OF** these flags are set by `buildOfYearCalendar` from
`of/calendar/hdo.ts` — the single canonical OF HDO source (the eleven universal
Holy Days; jurisdiction-specific transfers are a later refinement). For the
**EF** `buildDoYear` sets them from the universal 1962 Holy Days (the sanctoral
set keyed by month-day plus the two movable temporal HDO — Ascension, Corpus
Christi — matched by Latin name); jurisdiction transfers are likewise a later
refinement.

## Staged / not yet done

Done since the original design (see `docs/journal.md`, 2026-05-31):

- ✅ **OF precedence from canonical data** — `resolveOfDay` over the generated
  `of-calendar.json`; bifurcation bug fixed; full-year GIRM tests.
- ✅ **EF precedence from canonical data** — `chooseProperSourceByRank` over the
  generated `ef-ranks.json` (Divinum Officium occurrence values).
- ✅ **EF display calendar from the DO engine** — `buildDoYear` /
  `buildDoYearCalendar` resolve the month grid + card from `resolveDay` (the same
  authority as the EF Mass), retiring the curated `entries.json` for EF display.

### The code-built `producer/mass` (built, form-aware)

A prior pass argued the producer was *won't-do* (the split-brain was already
fixed; the fragments are good declarative content). The user reversed that: the
Mass **assembly** is now built in code so `flow.json` is a thin form `select` of
`{ include: producer/mass, params: { form } }`.

- **`buildMassFlow(day)`** (`@ember/mass`) — OF: celebration picker, rite
  dispatch, seasonal blessing.
- **`buildEFFlow()`** (`@ember/mass`) — EF: the view switch (Full Mass / Propers
  Only / Readings Only) + the Order-of-Mass sequence.
- **`producer/mass`** (`apps/app/src/sources/mass-flow.ts`) dispatches on the
  include `params.form`; OF loads the day via the `mass-of` DataSource and binds
  it in `flowData`, EF is slot-centric (no day object). Both fetch the
  Order-of-Mass content fragments from `liturgical/mass-fragments.json`, resolve
  the computed flow through the engine, and return primitives.

The liturgical **text** stays declarative — the builders `call` the `of-*` /
`ef-*` content fragments and emit `proper` slots; only the *assembly/branching*
moved to code. The four EF assembly fragments (`ef-form-body`,
`ef-extraordinary-*-view`) are retired; EF propers still resolve per-slot via
`ProperSlot` (moving that into the producer is a follow-up). See the dev-journal
entry "Liturgical calendar + Mass: one source-driven authority".

## Package layering — calendar, engine, and one Mass package

The "one package for calendar + Mass" idea would create a circular dependency, so
`@ember/liturgical` stays separate. What *was* consolidated (at the user's
direction): the two Mass packages `mass-of` + `mass-propers` merged into one
**`@ember/mass`**. The layering is a clean DAG:

```
@ember/liturgical      (calendar primitives; depends on nothing internal)
        ▲        ▲
        │        │
@ember/content-engine  │   (flow engine; depends on liturgical)
        ▲        │
        │        │
@ember/mass            │   (OF + EF Mass; depends on BOTH)
```

`content-engine` imports `@ember/liturgical`; `mass` imports *both*
`@ember/content-engine` and `@ember/liturgical`. Folding `mass` into `liturgical`
would make `liturgical → content-engine → liturgical` — which is why `liturgical`
can't absorb the Mass code. Merging the two *Mass* packages had no such cycle, so
they're now one.
