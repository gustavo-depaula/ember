# Liturgical Calendar & Mass

How Ember decides *which celebration is today* and *which Mass is said*, for both
the Ordinary Form (OF) and the Extraordinary Form (EF).

## Two calendars, by purpose

There are deliberately **two** calendar reads. They answer different questions and
must not be conflated.

| | Display calendar | Propers calendar (OF Mass) |
|---|---|---|
| Question | "What feast is today, for the home card / month grid?" | "Exactly which Mass formulary is said today?" |
| Entry point | `buildYearCalendar` (`@ember/liturgical`) | `resolveOfDay` (`@ember/liturgical`) |
| Data | `content/liturgical/entries.json` (curated) | `content/liturgical/of-calendar.json` (generated) + computed temporal |
| Carries | temporal feasts (Christmas, Easter…), **holy-day-of-obligation** flags, curated names | the sanctoral calendar with canonical ember-extra ids |

The display calendar needs the **temporal feasts** and **HDO** flags that the
upstream propers data doesn't carry, so it stays hand-curated. The propers
calendar needs the exact Mass-proper id, so it's generated from the same source
as the propers (ember-extra) and the temporal cycle is *computed*, not stored.

> A propers-aligned calendar can't drive the home (it has no Christmas/Easter and
> no HDO badges); a curated display calendar can't drive the Mass (its ids aren't
> proper ids). Keep them separate.

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

`@ember/mass-of`'s `createMassOfSource` asks `resolveOfDay` which celebration
wins, then builds *only* that Mass (self-contained, no cross-Mass alternates — so
no mixed readings). A "fixed" day (precedence ≤ 7: solemnity/feast/Sunday)
celebrates the principal alone (expanded to multi-Mass formularies on Christmas
and Holy Thursday); a memorial/ferial day offers the celebrant's legitimate
choices (saint vs weekday) as separate top-level options. The app's
`MassOfDataSource` provides `fetchOfCalendar()` → `liturgical/of-calendar.json`.

## EF path

The EF side is already singly-authored (it never had the OF duplication): the EF
display calendar is `buildYearCalendar(form: 'ef')` over `entries.json`'s EF half,
and the EF Mass (`@ember/mass-propers`) maps date → Divinum Officium file-id
(`do-file-id.ts`) → parsed propers in `content/propers/`.

The EF Mass's **tempora-vs-sancti choice is data-driven from Divinum Officium's
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
calendar. These flags live only in `entries.json` (ember-extra doesn't carry
them), which is one reason the display calendar stays curated.

## Staged / not yet done

Done since the original design (see `docs/journal.md`, 2026-05-31):

- ✅ **OF precedence from canonical data** — `resolveOfDay` over the generated
  `of-calendar.json`; bifurcation bug fixed; full-year GIRM tests.
- ✅ **EF precedence from canonical data** — `chooseProperSourceByRank` over the
  generated `ef-ranks.json` (Divinum Officium occurrence values).

The one item that genuinely remains needs the running app to verify safely:

- **Code-built `producer/mass`** emitting `FlowBlock[]` for both forms, retiring
  the OF `mass/flow.json` fragments and the EF `ProperSlot` path. This changes
  Mass-rendering UI; the `FlowBlock` output is unit-testable through the engine,
  but the final visual/interaction layer needs an expo launch to confirm — and
  the app-level Mass-render tests are themselves broken by unrelated
  nav-restructure debris. Deferred until verifiable.
## Package layering — why it stays three packages

The original "one package for calendar + Mass" idea is **not** advisable: it would
create a circular dependency. The current layering is a clean DAG and must stay
that way:

```
@ember/liturgical      (calendar primitives; depends on nothing internal)
        ▲        ▲
        │        │
@ember/content-engine  │   (flow engine; depends on liturgical)
        ▲        │
        │        │
@ember/mass-of / @ember/mass-propers   (Mass sources; depend on BOTH)
```

`content-engine` imports `@ember/liturgical`; `mass-of` imports *both*
`@ember/content-engine` and `@ember/liturgical`. Folding `mass-of` into
`liturgical` would make `liturgical → content-engine → liturgical`. So the
three packages are correct. The real architectural win — eliminating the
three-way precedence duplication that caused the bug — is **already done**;
physical consolidation would regress the dependency graph, not improve it.
