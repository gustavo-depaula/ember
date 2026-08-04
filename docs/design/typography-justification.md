# Justification & Micro-Typography

Research into the justification paper cuts, and what we can actually do about them.

Companion to `docs/design/design-system.md` § Typography (which covers the Ladder of Reverence — the *type* system). This doc covers **line breaking**: how text is fit to the measure, where it currently looks bad, and what our options are.

---

## The verdict, up front

**Ember has two independent text renderers, and they have opposite prospects.**

| Surface | Engine | Prospects |
|---|---|---|
| **Book reader** (`features/books/reader/foliate/`) | Real WebKit/Blink DOM inside a WebView (iframe on web) | Excellent — [Justif](https://github.com/lyallcooper/justif) drops in, verified working |
| **Prayer / practice / Bible** (`PrimitiveBlock`, `PrayerText`, `ChapterContent`) | Native `Text` (UIKit / Android `Layout`) | Closed to Justif. Real wins available, but different ones |

The good news is that the surface where justification matters most — long-form prose in the Catholic library — is *already* a web renderer. Justif needs no WebView bridge, no "web components on mobile" trick, and no architectural change. It is a script tag in a document we already control.

The bad news is that the native surface can't be fixed the same way, and it has a paper cut that isn't about justification quality at all — it's that **we justify text that should never have been justified**.

---

## Part 1 — What Justif is

[Justif](https://github.com/lyallcooper/justif) (MIT, Lyall Cooper, [demo](https://justif.lyall.co), [Show HN](https://news.ycombinator.com/item?id=48946738)) implements the [Knuth–Plass line-breaking algorithm](https://en.wikipedia.org/wiki/Knuth%E2%80%93Plass_line-breaking_algorithm) — the one TeX has used since 1981 — as a progressive enhancement over existing HTML.

Browsers break lines **greedily**: fill a line, move on. Knuth–Plass optimizes the paragraph *as a whole*, so a slightly worse break early can buy three better lines after it. That is the difference between a page with rivers of whitespace and a page that reads like a printed book.

On top of the breaker it adds the micro-typography layer:

- **Hyphenation** from bundled TeX patterns (24 languages, including `en-us` and `pt` — exactly our two)
- **Optical margin alignment** (protrusion) — periods and commas hang slightly past the measure so the edge *looks* straight
- **Hanging punctuation**
- **Tracking** — sub-1% letter-spacing nudges to save a line
- **Font expansion** — `wdth`-axis adjustment on variable fonts

Zero runtime dependencies. Configurable entirely from CSS custom properties (`--justif-*`), which matters because our reader CSS is already generated from `ReaderConfig`.

---

## Part 2 — Measured findings

I ran Justif 0.7.1 against a mock of our actual reader: `buildStyle()`'s CSS copied verbatim, CSS multi-column pagination like foliate's paginator, 81 paragraphs / 4,565 words of real Kempis text from `content/books/kempis-imitation-of-christ/`.

| Question | Result |
|---|---|
| Works inside foliate's CSS-column pagination? | **Yes** — 81/81 paragraphs enhanced, 0 skipped |
| Does it change the plain-text character stream? | **No** — byte-identical across 25,262 chars, *with 630 hyphenated line breaks active* |
| Do `highlightAnchor.ts` offsets survive? | **Yes** — 40/40 anchors round-tripped to the exact original substring |
| Cost, cold | ~390 ms desktop Chromium for 4,565 words (≈85 µs/word) |
| Cost, re-layout (`refresh()`) | ~110 ms |
| Effect on pagination | 27 pages → 25 (fits ~7% more text) |

### Side by side

Four options, rendered at Ember's actual reader defaults — EB Garamond 400, 22 px / 33 px leading (`fontSizeStep 3`, `lineHeightStep 5`), `margin: normal` on a 390 px phone, light palette:

![Four justification options compared at Ember's reader defaults](../assets/justification-options.webp)

| | Lines for the same 8 paragraphs |
|---|---|
| A — native justify, no hyphenation | 77 |
| B — native justify + hyphenation *(today on iOS)* | 76 |
| C — Justif, defaults | **71** |
| D — Justif, protrusion + hanging off | **71** |

**A** is the worst case and it is not hypothetical: headless Chromium ships no hyphenation dictionaries, and if the Android WebView on a given device behaves the same, this is what Android users see. Rivers everywhere.

**B** simulates `hyphens: auto` by pre-inserting soft hyphens with the same TeX patterns — this is the honest baseline, and what iOS WebKit renders for us today. Much better than A, but still visibly loose lines (*"to pattern his whole life on that of"*).

**C** is Justif at defaults. Even color, no rivers, and it fits the same text in 8% fewer lines — which is where the page-count drop comes from.

**D** isolates the micro-typography layer: same Knuth–Plass breaks as C, but with optical margin alignment and hanging punctuation switched off. The difference from C is subtle at a glance and shows up at the margin — C's edge *looks* straighter because periods and commas hang slightly past it. Worth having, not worth agonizing over.

### The finding that matters most

`highlightAnchor.ts` anchors highlights and bookmarks as **plain-text character offsets over the live text-node tree**. Justif re-renders each paragraph's inline content as per-line `<span class="justif-seg">` clones — which sounds like it should destroy those offsets.

It doesn't. Justif paints inserted hyphens *outside the text tree* (the segment whose visible text is `blind-` has `textContent === "blind"`), and the inter-line spaces stay as real space characters. So the character stream the walker sees is unchanged, and every existing highlight and bookmark keeps working with **no migration and no code change**.

This is the single fact that turns Justif from "interesting, but risky against our highlight system" into "safe to adopt."

---

## Part 3 — Integrating with the foliate reader

The reader already inlines `bootstrap.raw.js` into the WebView via `bundle.mjs` → `bootstrapScript.ts`. Justif ships as ESM with no dependencies, so it vendors the same way.

**Payload:** `index.js` (136 KB) + `chunk-2WL5JIIM.js` (66 KB) + `hyphenate/en-us.js` (28 KB) + `hyphenate/pt.js` (3 KB) ≈ **233 KB raw / ~65 KB gzipped**. Skip `auto.js` (we call the API directly) and the other 22 hyphenation languages. The 202 KB `chunk-VIZFTCIC.js` is not reachable from `index.js`.

### Where it hooks in

Each chapter is a separate blob-URL document (`blobUrl()` in `bootstrap.raw.js`), so Justif must run **per section load**, inside that document — not once on the host. The `paginator.addEventListener('load', ...)` handler (~line 601) is the hook.

### Four things to get right

1. **Re-measure after justification.** Justif changes paragraph heights, which changes the page count (27 → 25 in the test). It must complete *before* foliate computes the section's extent, or the progress bar, `ChapterScrubber`, and `useReaderCursor` fractions will all be stale. `justify()` lays out synchronously before returning; only `controller.ready` (font loading) is async.

2. **Exclude footnote destinations.** `bootstrap.raw.js:485` reads `target.innerHTML` and posts it to `FootnoteSheet`. If the footnote `<li>` has been justified, the sheet receives `justif-seg` span soup with inline `word-spacing` styles. Either scope the selector to exclude the footnotes container, or `unjustify()` the target before reading. **This is a real bug, not a theoretical one** — Justif's default scan includes `li`.

3. **Config changes need `rescan()`, not re-justify.** The reader's live-restyle path (`paginator.setStyles(buildStyle(cfg))`, per the journal's #266 note) changes font, size, and leading without reopening the book. Justif has to be told: `rescan()` re-reads author CSS and re-lays out only what actually changed.

4. **Tap handlers are already safe.** Justif drops event listeners attached directly to inline descendants and requires delegation — and `wireTapZones` already delegates on `doc` with `ev.target.closest('a')` (line 464). Nothing to change. Lucky, not planned.

### Performance

~390 ms for 4,565 words on desktop Chromium; assume 1.5–3× on device. Our chapters are typically far smaller than that fixture — a 1,500-word chapter lands around 125 ms desktop, so roughly 200–400 ms on device. That is per *section load*, not per page turn, and it can hide inside the existing chapter-load transition. It should be measured on a real device before shipping; if it bites, `content-visibility: auto` + `contain-intrinsic-size` (documented by Justif) defers off-screen paragraphs.

### Suggested config

Defaults are close to right for a devotional book. Worth tuning:

- `hangingPunctuation: "first-line-and-line-ends"` — our drop caps and centered chapter titles sit next to the text edge; full hanging on all edges may read as misalignment.
- `tracking` — leave on; it is what saves a line without visible damage.
- `expansion` — inert for us. All seven reading fonts (`config/readingFonts.ts`) are static instances (`EBGaramond_400Regular` etc.), not variable fonts with a `wdth` axis. Worth revisiting only if we ever ship variable font files.
- Language: pass `hyphenateEnUS` / `hyphenatePt` off the chapter's language rather than the document `lang`, since the corpus is bilingual per chapter.

---

## Part 4 — The native surface

### Answering the "web components on mobile?" question directly

**No — and it isn't needed.** Justif is not a web component; it's a DOM library, and "web components on mobile" in React Native means one thing: a WebView. Routing prayer and Bible text through a WebView to gain Knuth–Plass would cost us native text selection, the `ImageViewer` integration, Tamagui theming, accessibility, and Reanimated-driven layout — to fix a problem that is smaller on that surface than it is in the reader. It's a bad trade.

The reader is the exception precisely because it is *already* a WebView. That's not a workaround we'd be inventing; it's an asset we already have.

### What React Native actually gives us

Verified against RN 0.85 docs (`react-native-website` source):

| Capability | Status |
|---|---|
| `textAlign: 'justify'` | iOS yes; Android API 26+ only, silently falls back to `left` below |
| `letterSpacing` | Yes — tracking is available |
| **word spacing** | **Not exposed.** This is the blocker |
| `fontVariationSettings` / `wdth` axis | Not exposed |
| `android_hyphenationFrequency` | Yes — `'none'` \| `'normal'` \| `'full'`, **default `'none'`** |
| `textBreakStrategy` (Android) | `'simple'` \| `'highQuality'` \| `'balanced'`, **default `'highQuality'`** |
| iOS hyphenation | Not exposed at all (`NSParagraphStyle.hyphenationFactor` is unreachable from RN) |

Two consequences:

**A full Knuth–Plass native renderer is not worth building.** Justif ships its DOM-free engine as `justif/core` (~66 KB), so we *could* compute optimal breaks in JS. But without `wordSpacing` we could only apply the result by rendering each line as its own `<Text>` with a computed `letterSpacing` — which would break text selection across lines, copy/paste, and accessibility, and would still be justifying by tracking alone (the thing typographers do *last*). Not recommended.

**But there is a free Android win.** `android_hyphenationFrequency` defaults to `'none'`, which means our justified Android text is justified *without hyphenation* — the worst possible combination, and the direct cause of gappy lines. Setting it to `'normal'` on the reading-text components is a one-line change in `useReadingStyle()`. Android also already runs `highQuality` break strategy (a whole-paragraph optimizing breaker), so with hyphenation enabled Android text gets close to good. iOS has no equivalent lever, so iOS remains greedy and un-hyphenated.

### The bigger native paper cut: we justify things that shouldn't be justified

`preferencesStore.ts:121` defaults `textAlign: 'justify'`, and `useReadingStyle()` applies it to *every* reading surface. Two of those surfaces are structurally wrong for it:

- **`PrayerLines`** (`components/PrayerText.tsx`) splits on `\n` and renders **each line as its own `<Text>`**. Prayer text is verse — deliberately line-broken. When a verse line is short enough to fit, justify is a no-op (a single line is a last line). But when it wraps to two, the *first* line gets stretched across the full measure and the second sits ragged. That produces a stretched-then-stubby pair in the middle of a prayer, which is exactly the kind of thing that reads as broken.

- **`ChapterContent.tsx:51`** renders **each Bible verse as its own `<Text>`**, justified. So every verse's final line is ragged and every preceding line is stretched, with no line breaking across verse boundaries at all. In continuous prose books (Romans, Hebrews) this is the main source of the ragged/gappy feel.

Neither is fixed by a better algorithm. Verse-shaped content should be ragged-right — that is the correct typographic answer, and it is the same answer a printed missal gives. This is the highest-value native change available, and it's cheap.

![Bible and prayer rendering: today versus ragged versus continuous prose](../assets/justification-native-surface.webp)

Same fonts and reader settings as above. Romans 8 (Douay-Rheims, from `content/bible/drb/`) and the hymn from `practice/little-office-holy-tear-of-our-lord-jesus-christ`:

- **Bible — today.** All 14 verses wrap, so all 14 show the defect: stretched lines above, a stubby ragged remnant below (*"the flesh."*, *"peace."*, *"in the flesh,"*). Verse 1's first line is stretched hard across the measure.
- **Bible — ragged verses.** Same 51 lines, no stretching. Strictly better, and it is a one-value change.
- **Bible — continuous prose.** Verses flow into one justified paragraph with superscript numbers. This is what a printed Bible does, and it reads best of the three: justification finally has a full paragraph to work with, and there is one ragged last line per chapter instead of one per verse. Bigger change — it touches `ChapterContent`'s structure and anything that anchors to a per-verse node — but it is the right end state, and it is also the version that would benefit from Justif on the web build.
- **Prayer — today vs ragged.** 5 of 13 lines wrap; every one of them stretches (*"O fair eyes that caused this innocent"*, *"come and subdue the insolence of those"*). Ragged is simply correct for verse.

Note that even the continuous-prose column is still *greedily* justified — that's native RN, and no lever changes it. It is better because the paragraph is longer, not because the algorithm improved.

---

## Part 5 — Recommended order of work

1. **Ragged-right for verse-shaped content.** Stop applying `justify` in `PrayerLines` and per-verse `ChapterContent`. Highest ratio of paper-cut-removed to lines-changed, and it needs no dependency.
2. **`android_hyphenationFrequency: 'normal'`** in `useReadingStyle()`. One line; fixes the worst Android case.
2b. **Bible as continuous prose** rather than one `<Text>` per verse. Bigger than 1 and 2, worth its own spec — it's the difference between "a verse list" and "a Bible".
3. **Vendor Justif into the foliate reader.** Guard the footnote `innerHTML` path first, wire `rescan()` to the config path, measure on device.
4. *(Later)* Consider Justif on the web build's native surfaces via the existing `Platform.OS === 'web'` branch in `useReadingStyle()` — react-native-web renders real DOM, so it's reachable. Low priority: web is not where the reading happens.

Items 1 and 2 are independent of Justif entirely and should not wait on it.

---

## Notes

- Justif's README carries an AI-usage disclosure. It is a young project (0.7.1) by a single author. Vendoring the `dist/` we test against — rather than tracking a CDN — keeps us insulated from churn, and it's how `foliate-js` is already handled in `reader/foliate/`.
- The DOM-free `justif/core` export is worth remembering if we ever build a server-side or canvas renderer (e.g. a PDF or print export of a book).
