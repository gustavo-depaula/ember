---
paths:
  - "content/missal/**"
  - "packages/missal/**"
  - "apps/app/src/sources/missal/**"
---

# Ordinary Form missal

- `content/missal/**` is the source of truth and is edited in place; its shapes are `packages/missal/src/types.ts`. Nothing regenerates it.
- Ids are public: holy cards and the calendar refer to them. Renaming one means updating `content/practices/saint-of-the-day/data/holy-cards/`.
- `calendar.json` repeats each formulary's title, precedence, colour and lectionary so a day resolves without loading a formulary. Change one, change the other.
- A passage missing in a language is shown in Latin; one that exists in neither is not shown. The gaps are listed by the snapshot of `packages/missal/src/__tests__/sweep.test.ts`, which changes when one is filled.
- `packages/missal/src/__tests__/reference-calendar.json` is the calendar the corpus was first checked against, 2020-2040. The tests name every place the resolver differs from it on purpose; a new difference is a bug or a new named exception.
- Regional propers exist in one language only, filed under the text key `*`.
