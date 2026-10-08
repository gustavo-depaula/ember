# Justification & Micro-Typography

How Ember breaks lines. Every reading surface is justified with [Justif](https://github.com/lyallcooper/justif) (MIT), a Knuth–Plass breaker: it optimizes the whole paragraph, where native engines break greedily and open rivers of whitespace.

| Surface | Engine | Integration |
|---|---|---|
| Book reader | DOM in a WebView (iframe on web) | Justif's own DOM renderer |
| Everything else (prayer, practice, prose, Bible, Catechism, missal) | Native `Text` | `justif/core` + a custom renderer |

## Book reader

`apps/app/src/features/books/reader/foliate/justif.raw.js` is Justif vendored as a classic-script IIFE exposing `window.__justif`: module scripts fail in the WebView's `about:blank` context with a CORS-masked "Script error" (the same constraint as `paginator.raw.js`). `bundle.mjs` splices it into `bootstrapScript.ts`, and `blobUrl()` injects it **per chapter**, because every chapter is its own blob document. Config is stock defaults plus `hangingPunctuation: 'first-line-and-line-ends'`.

- **Wait for a real width.** At parse time foliate hasn't sized the iframe, so Justif declines every paragraph with `"zero content width"`. `rescan()` and `refresh()` don't rescue it: a width change is not a style change, and `rescan()` silently does nothing. `justify()` is driven from the paginator's `load` handler (`settleJustif`), backed by a ResizeObserver in the chapter document.
- **Exclude footnotes.** `[data-footnotes]` is skipped, because the anchor handler posts a footnote's `innerHTML` to `FootnoteSheet`, which would otherwise receive justified span soup.
- **Highlights survive, and must keep surviving.** `highlightAnchor.ts` anchors highlights as plain-text character offsets over the live text nodes. Justif re-renders paragraphs as per-line span clones, but paints inserted hyphens outside the text tree and keeps real inter-line spaces, so the character stream was byte-identical (25,347 chars, 81/81 paragraphs). Re-check this on any Justif upgrade. `walkText` skips `SCRIPT`/`STYLE` because the injected bundle lives in the chapter body.

## Native surfaces

React Native has neither `wordSpacing` nor a text-measurement API, so the app measures text itself.

- **`scripts/build-font-metrics.mjs`** extracts everything a shaper needs from the reading-font TTFs into `apps/app/src/lib/typography/fontMetrics.generated.ts`. Re-run it when `apps/app/src/config/readingFonts.ts` changes. It emits advances for **whole Unicode blocks** (intersected with each face's cmap), because a hand-picked list falls behind the corpus: `º`, `ª`, `§`, `ǽ`, `‒` occur thousands of times and were all missing from the original list. It resolves GPOS pair kerning for every pair of the reading alphabet (as HarfBuzz does) and GSUB f-ligatures. Metrics cover only faces the app actually **loads**.
- **`apps/app/src/lib/typography/justifyText.ts`** runs the Justif breaker over those metrics and returns a per-line recipe, or `undefined` whenever anything is unusable (unmeasured container, face without a table, declined paragraph). It never guesses.
- **`apps/app/src/components/ReadingParagraph/JustifiedLines.tsx`** renders the recipe with RN's one lever: `letterSpacing` adds space after each character, so a nested `<Text>` holding one space renders at `spaceAdvance + letterSpacing`. Everything stays in one parent `<Text>`, so it selects and copies as one run. When no recipe is available it falls back to wrapped text built from the same segments and faces.
- **`ReadingParagraph`** is the one place that decides justified vs ragged, hyphenates in its column's language (`ReadingLanguage`, set per side by `BilingualBlock`) and guards iOS's last line. Every reading surface goes through it, including the reading-settings preview; a preview set by the platform would advertise rivers the reader never sees.

Accuracy: per glyph, no advance differs from a real shaper by more than 0.5 % of an em (bar Catalan `Ŀ`/`ŀ` in Libre Baskerville); per line, the worst disagreement over 12 chapters × 7 faces × 5 sizes × 4 measures is **0.42 px**. Unmodelled `calt` (Cormorant's narrow `f` before `l`) errs safe: the line draws short.

### Inline runs

Emphasis, size changes and taps are justified, not excluded. A `StyledSegment` is one inline run:

| Field | Changes an advance? | For |
|---|---|---|
| `style` | yes | regular / bold / italic / boldItalic |
| `fontSizePx` | yes | a superscript verse number, a ℣/℟ mark |
| `letterSpacing` | yes | a tracked citation |
| `render` | **no** | colour, opacity, leading |
| `onPress` | no | a tappable cross-reference |
| `atomic` | n/a | rigid spaces, no hyphenation, no break inside |

1. **`render` never carries `fontFamily`, `fontSize` or `letterSpacing`.** The breaker can't see it, so lines get placed against widths the screen contradicts.
2. **`render` colours are resolved values, not Tamagui tokens.** It is a raw RN `style`, where `$colorSecondary` renders as no colour. Read from `useTheme()` under a memo.
3. **Runs group by appearance identity, and `render`/`onPress` compare by reference.** Fresh objects cost an extra run, never a wrong break; but two cross-references must never share one run, or they fuse into one tap target.

EB Garamond loads real regular, italic, bold and bold-italic, so all four are exact. The other families load Regular only: synthetic italic is a shear that preserves advances (exact), synthetic bold changes advances unpredictably per platform (declines).

### What declines to the ragged fallback

| Case | Why |
|---|---|
| Drop cap, producer question | Set in the heading face (Cinzel), which has no metrics table |
| Bold outside EB Garamond | Synthetic bold advances are unpredictable |
| A paragraph with a hard `break` | The breaker has no model for a newline |
| Divinum Officium lines, response prefixes | `DoInlineLine` owns verse numbers, pointing marks, small caps; decided per block, so a prayer never mixes renderers |

The fallback is soft-hyphenated by `apps/app/src/lib/hyphenate.ts`, and `android_hyphenationFrequency: 'full'` in `useReadingStyle()` adds Android's hyphenator (the default `'none'` leaves justified text unhyphenated, the worst combination). iOS has no hyphenator, which is why the app breaks its own lines.

### Traps, all found by measuring

| Trap | Consequence | Handling |
|---|---|---|
| f-ligatures | `ffl` draws as one narrower glyph; `afflict` measured 2.53 px wide, enough to cascade a re-wrap | substitute only the ligatures **the face carries** (EB Garamond all five, Merriweather `fi`/`fl`, Cormorant none) |
| letterfit tracking | tracking is a fraction of the line's set width; modelling it per character over-counted ~26 px/line | `tracking: false`: word spaces are the only flex. Costs one line in nineteen |
| soft hyphens | measured as characters, they inflate every hyphenated word | zero-width by codepoint; kerning spans them |
| codepoint outside the table | the fallback advance stands in for the real glyph | whole Unicode blocks; fallback is the face's **widest** advance, so an unknown glyph only leaves a line short |
| kerning | `AVATAR` in EB Garamond is 45 % of an em narrower than its advances; a line missed by up to 0.19 em | resolve every pair at build time; a tracked run is measured unkerned, because iOS drops the pair table once `letterSpacing` is set |
| kerning across a break | the fragment after a hyphenation carries a kern with a glyph the screen never draws beside it | `creditBreakEdges` moves the pair onto Justif's line-start credit `lp` and the hyphen's pair onto the penalty's `rp` |
| the container's edge | a line that fits at measure but not at draw (pixel-grid rounding) is re-broken at draw; the last line falls outside the view's height and goes blank | `breakWidth` in `apps/app/src/lib/typography/measureFit.ts` reserves one device pixel plus one CSS pixel on every line |
| the size drawn (Android) | Android sets type in whole device pixels, rounded up (22 at density 2.625 is 57.75 px, drawn at 58), so every glyph is wider than at the size asked for and a full line's last word wraps | `drawnFontSize` in `measureFit.ts`: the breaker prices every advance at the drawn size |
| ink at a line's edge (Android 15) | the platform measures a line to the edge of its last glyph's outline; the hook of EB Garamond's `f` reaches a tenth of an em past its advance, so every line ending in "of" wrapped | the tables carry each glyph's overhang (`overhang` in `fontMetrics.generated.ts`, from `glyf` bounds), and `reserveEdgeInk` takes it from the line as a negative protrusion credit, only where `measuresInk()` |

The rules behind them: **any flex the breaker is allowed must actually be rendered, or lines silently re-wrap**, and **the breaker's arithmetic must err short of the measure, never past it.**

### Three layers of fit

1. **The model is exact** (advances, ligatures, kerning, break-edge kerning), to under half a pixel per line. This is where the work belongs: it costs nothing at render time.
2. **Headroom** covers what the platform never reports: one device pixel plus one CSS pixel (1.33 px on a 393-pt phone; lines still clear the edge by 0.97 px at the tightest).
3. **The `onTextLayout` loop** catches what it does report. If RN lays a paragraph out on more lines than the model, `fitToPlatform` narrows the measure a pixel and re-breaks; after a tenth of an em it gives up to the ragged fallback, since a ragged paragraph beats a missing line. It never fired in the shaper measurements.

Over 12 chapters × 7 faces × 5 sizes × 4 measures (388,635 lines), zero lines land at or past the container. With unkerned tables and 1 px headroom, one line in 154 did.

## Hyphenation

Hyphenation is **not optional** here. A bilingual side-by-side column is ~170 px, about 17 characters; without a hyphenator the worst word gap measured 63 px against 49 px with one.

Justif has no Latin. `apps/app/src/lib/typography/hyphenLaLiturgic.generated.ts` carries `hyph-la-x-liturgic` (MIT; Claudio Beccari and the Monastery of Solesmes, the authority for liturgical Latin), fed through Justif's Liang hyphenator. The ragged-fallback hyphenator `apps/app/src/lib/hyphenate.ts` still uses the `hyphen` package's classical Latin patterns, so the two paths can hyphenate Latin differently.

## Settled by measurement

- **Don't tune.** A config pushed hard for narrow measures landed at 127 lines against 128 for stock defaults, worst gap 44 px against 49 px. Ship the defaults.
- **Expansion is inert.** The reading fonts are static instances with no `wdth` axis.
- **Reader cost:** ~390 ms for 4,565 words on desktop Chromium, ~110 ms to re-lay-out, per section load rather than per page turn.

## Known bug: `lang="la"` rewrites Latin orthography

EB Garamond's `locl` substitution for Latin swaps in epigraphic forms (`meum → mevm`, `quoque → qvoqve`) at identical advance widths, so no width check catches it. It is live wherever Latin is language-tagged, including the book reader, which sets `<html lang>` in `blobUrl()`. Fix by suppressing the feature (`font-feature-settings`) or by not tagging Latin with `lang`; the second route needs the hyphenator passed explicitly, since the reader's Justif setup picks it from `lang`.

## Checked on Android

On an API 35 emulator at density 2.625, John 3 in the Bible reader, with the platform's own line report (`onTextLayout`) compared to the model for every paragraph: EB Garamond at three sizes, Cormorant Garamond, Lora, Crimson Pro and Merriweather. Every paragraph came out on the model's lines and inside its container, bar one in Merriweather that the `onTextLayout` loop re-fitted. Before the two Android rows above, about one verse in three wrapped its last word.

## Unverified

Whether UIKit widens a lone space under `letterSpacing` the way CSS does (RN maps it to `NSKernAttributeName`), selection and copy across the nested runs, and `allowFontScaling` under Dynamic Type. If the first fails, `JustifiedLines` falls back to wrapped text: no justification, not broken text.
