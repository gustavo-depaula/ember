---
paths:
  - "content/missal/**"
  - "packages/missal/**"
  - "packages/liturgical/src/of-temporal.ts"
  - "apps/app/src/sources/missal/**"
---

# Ordinary Form missal

- `content/missal/**` is the source of truth and is edited in place; its shapes are `packages/missal/src/types.ts`. Nothing regenerates it.
- Ids are public: holy cards and the calendar refer to them. Renaming one means updating `content/practices/saint-of-the-day/data/holy-cards/`.
- A celebration's precedence, colour, regions and lectionary entry are in `calendar.json` and nowhere else. Its title is there and in its formulary; change one, change the other.
- A prayer or reading missing in a language is shown in Latin; one that exists in neither is not shown, and neither is a rubric the language lacks. A choice whose every option is empty for the reader is not offered. The gaps are listed by the snapshot of `packages/missal/src/__tests__/sweep.test.ts`, which changes when one is filled.
- `packages/missal/src/__tests__/reference-calendar.json` is the calendar the corpus was first checked against, 2020-2040. The tests name every place the resolver differs from it on purpose; a new difference is a bug or a new named exception.
- The Ordinary Form's year is reckoned once, in `packages/liturgical/src/of-temporal.ts` (`temporalDay`). `resolveOfDay`, the season, the day name, the anchor dates and the fasting rules all read it. Anything that places a day passes the region's `Transfers` (`useOfTransfers` in a component, `transfersForJurisdiction` elsewhere, `ofTransfers` on the flow context), so Epiphany, the Baptism of the Lord, the Ascension and Corpus Christi fall where the Mass has them. A call without them gets the General Calendar's dates.
- The region is the reader's `jurisdiction` preference (the "calendar region" setting), never the content language: `regionsForJurisdiction`. The website has no reader, so each edition has a jurisdiction of its own (`apps/site/src/lib/locale.ts`).
- Regional propers exist in one language only, filed under the text key `*`. A passage of the General Calendar that exists in one language only (Spain's or Germany's own insertions) is filed under that language, so no other reader meets it.
- What is said only on certain days carries `when` (or `unless`) on its item, naming the conditions `assembleMass` reports: the Roman Canon's proper Communicantes, the Easter Hanc igitur, the collects of Christmas weekdays before and after Epiphany.
- Readings of which one is read share an `alt` group; two readings of a part left without one are both shown, one after the other.
- A region's own entry in `calendar.json` replaces the General Calendar's entry of the same id there, and may give it another rank (`precedence`) or keep it on a Sunday (`sunday`): Brazil's Saints Peter and Paul, Assumption, All Saints, Our Lady of Mount Carmel.
- Where the memorial is optional the weekday is offered first, as the daily missals do; a memorial whose lectionary entry has `properReadings` reads its own readings first.
- The Brazilian calendar and the Portuguese texts were checked day by day against the daily liturgy (liturgia diária) for 2025-2027. A text the corpus lacks in Portuguese is taken from there, not written from memory.
