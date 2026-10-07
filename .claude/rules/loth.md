---
paths:
  - "content/loth/**"
  - "packages/loth/**"
  - "scripts/loth/**"
  - "apps/app/src/sources/loth/**"
  - "apps/app/src/lib/loth/**"
---

# Liturgy of the Hours (Brazilian edition)

- `content/loth/index/` and `parts/` are written by `scripts/loth/import.ts` from an archive that is not in the repo; do not edit them by hand. A part is referred to by its place in a bundle, so moving one breaks every index. `calendar.json` is the opposite: edited by hand, read by the importer.
- `packages/loth/src/__tests__/reference.json` is what the breviary app the corpus was drawn from gives for every hour of 2020-2040. A change to the day, the office or the lookup that makes one hour differ is a bug, not a new expectation; nothing but the importer rewrites that file.
- The engine shares no code with that app and must not come to: its behaviour is known from the reference, not from its source.
- The year (season, week, the movable solemnities) comes from `temporalDay` with Brazil's transfers, as the Mass's does. The saints come from `content/loth/calendar.json`, the breviary's own calendar, which differs from the missal's Brazilian one in the ways listed in `research/liturgia-das-horas/README.md`. A celebration in both has the same id in both.
- The corpus is in one language. The source answers for `pt-BR` and hands every other language to iBreviary; the region setting does not enter into it, because the edition is Brazil's whatever the reader's.
- A slot's layers are tried from the last to the first, and a layer filed under a celebration is skipped on a day without one. A new coordinate is a new letter in `Field`, in `officeKey` and in the candidate lists of `scripts/loth/layers.ts`, and means importing again.
- The renderer (`apps/app/src/sources/loth/render.ts`) reads what a line is from the label that opens it, as the book does, and never changes a word. Its result is cached on the device under the source's `version`: bump it with any change to what an hour renders as.
- The Gospel canticle's antiphon is missing from the corpus on the Sundays of Lent and Easter (the app the text came from filled it in at run time); the renderer leaves the empty label out.
