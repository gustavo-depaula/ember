# Justification prototypes

Working code behind `docs/design/typography-justification.md` § Part 6 — the
proof that Justif can drive a **React Native** renderer on iOS/Android.

- `ttf.mjs` — advance widths straight from a TTF (`head`/`hhea`/`hmtx`/`cmap`,
  formats 4 and 12). No font library. This is what replaces the text
  measurement API React Native doesn't have.
- `native-pipeline.mjs` — wires those metrics into `justif/core` as its
  injectable `Measure`, runs `buildItems` → `breakParagraph` → `layoutLines`,
  and emits per-line `{ words, spaceWidthPx, letterSpacingPx, hyphenated }` —
  exactly the values an RN `<Text>` tree needs.

Not wired into the app; kept as the reference implementation so the real
version doesn't have to rediscover the ligature and tracking traps recorded
in the journal.

Run against the bundled EB Garamond:

```sh
node native-pipeline.mjs   # expects site/prayers.json + site/la-liturgic.json
```
