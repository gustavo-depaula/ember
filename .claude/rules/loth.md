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
- Where that app is itself at fault the corpus has the book's text, and each such place is written down: a misspelling in `scripts/loth/corrections.ts` (applied to the archive before anything reads it), a text the archive lacks in the importer's `cutOf` (bundled as `parts/supplied-*`, which the reference test takes out again), an hour the reference has wrong in `amended` beside the tests. Correct the archive only where the book's own rule or the archive's other hours show the slip; a difference from liturgiadashoras.online alone is not enough, since it follows a later printing.
- The engine shares no code with that app and must not come to: its behaviour is known from the reference, not from its source.
- The year (season, week, the movable solemnities) comes from `temporalDay` with Brazil's transfers, as the Mass's does. The saints come from `content/loth/calendar.json`, the breviary's own calendar, which differs from the missal's Brazilian one in the ways listed in `research/liturgia-das-horas/README.md`. A celebration in both has the same id in both.
- The corpus is in one language. The source answers for `pt-BR` and hands every other language to iBreviary; the region setting does not enter into it, because the edition is Brazil's whatever the reader's.
- A slot's layers are tried from the last to the first, and a layer filed under a celebration, a Common or a rank is skipped on a day without one. A new coordinate is a new letter in `Field`, in `officeKey` and in the lists of `scripts/loth/layers.ts`, and means importing again.
- The lists in `scripts/loth/layers.ts` say which coordinates a slot may depend on. Add one only for a dependence the breviary has, and measure it with `import.ts --holdout 2035 --misses`: a list that lets the data choose freely fits 2020-2040 and misleads every year after.
- The cut in `scripts/loth/slots.ts` reads the words, not the markup. A new slot name changes `content/loth/index`, so the renderer must be checked against it (`apps/app/src/sources/loth/render.ts` reads every slot beginning `head` as the hour's opening).
- The renderer (`apps/app/src/sources/loth/render.ts`) reads what a line is from the label that opens it, as the book does, and never changes a word. Its result is cached on the device under the source's `version`: bump it with any change to what an hour renders as.
- `beyond.test.ts` holds every hour of 2020-2050 to being whole (no part that is a label and nothing more, none of the parts an hour of its kind always has missing). A new fault it finds is the archive's or the cutter's; look at the archive's HTML before touching the engine.
- A day goes by its date (`dateKey`, the `k` coordinate) only from 17 December to the end of Christmas time. Before the 17th Advent goes by the week, and a Sunday's text keyed by date is a rule the data made up.
