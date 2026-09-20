---
paths:
  - "content/of/**"
  - "tools/missal/**"
  - "packages/mass-of/**"
---

# Ordinary Form propers

- `content/of/**` is output of `tools/missal`, so a data fix needs the matching transform fix too. `missal build` cannot run here (its ember-extra `--baseline` is not in the repo): re-derive calendar statics with `buildCalendarStatics(formularies, new Map())` and splice in only the changed entries.
- When auditing formulary text for scannos, join a line's segments with a space as `joinLine` does (`apps/app/src/sources/of/helpers.ts`), gluing only after a `dropCap`. A bare `''.join` invents "missing space" hits like `comSenhor`.
- The English OF collects and antiphons are ICEL-copyrighted; see `docs/content/content-sources.md` before bundling or redistributing more of them.
