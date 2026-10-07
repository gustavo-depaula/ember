---
paths:
  - "content/missal/**"
  - "scripts/missal/**"
  - "packages/missal/**"
  - "apps/app/src/sources/missal/**"
---

# Ordinary Form missal

- `content/missal/**` is output of `scripts/missal/build.py`; never edit it by hand. A text or id fix goes in `scripts/missal/patches.py` or `ids.py`, then `pnpm build:missal` (needs the upstream clone under `research/missale-romanum/consult/upstream`, see that README).
- Ids are public: holy cards and the calendar refer to them. Renaming one means updating `content/practices/saint-of-the-day/data/holy-cards/`.
- The importer reads markup, never wording: a part is told by its upstream class, a rubric by its colour. A fact the markup lacks (which text is a sequence, a wrong precedence number) is a named entry in `patches.py`.
- After changing the calendar, regenerate nothing: `packages/missal/src/__tests__/upstream-calendar.json` is upstream's own answer for 2020-2040 and the test explains every place the new calendar differs from it.
- Regional propers exist in one language only, filed under the text key `*`.
