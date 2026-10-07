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
- A passage missing in a language is shown in Latin; one that exists in neither is not shown. The gaps are listed by the snapshot of `packages/missal/src/__tests__/sweep.test.ts`, which changes when one is filled.
- `packages/missal/src/__tests__/reference-calendar.json` is the calendar the corpus was first checked against, 2020-2040. The tests name every place the resolver differs from it on purpose; a new difference is a bug or a new named exception.
- The Ordinary Form's year is reckoned once, in `packages/liturgical/src/of-temporal.ts` (`temporalDay`). `resolveOfDay`, the season, the day name, the anchor dates and the fasting rules all read it. Anything that places a day passes the region's `Transfers` (`useOfTransfers` in a component, `transfersForContentLang` elsewhere, `ofTransfers` on the flow context), so Epiphany, the Baptism of the Lord, the Ascension and Corpus Christi fall where the Mass has them. A call without them gets the General Calendar's dates.
- Regional propers exist in one language only, filed under the text key `*`.
