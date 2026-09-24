# Justification & Micro-Typography

How Ember sets justified text. Companion to `docs/design/design-system.md` § Typography, which covers the type system; this covers **line breaking**.

Both reading surfaces use [Justif](https://github.com/lyallcooper/justif) (MIT) — the [Knuth–Plass line-breaking algorithm](https://en.wikipedia.org/wiki/Knuth%E2%80%93Plass_line-breaking_algorithm), the one TeX has used since 1981. Browsers and native text engines break lines *greedily*: fill a line, move on. Knuth–Plass optimizes the paragraph as a whole, so a slightly worse break early buys three better lines after it. That is the difference between rivers of whitespace and a page that reads like a printed book.

Ember has two independent text renderers and they integrate with Justif very differently. Both of them justify everything they set.

| Surface | Engine | Integration |
|---|---|---|
| Book reader | WebKit/Blink DOM in a WebView (iframe on web) | Justif's own DOM renderer |
| Everything else — prayer, practice, prose, Bible, Catechism, missal | Native `Text` (UIKit / Android `Layout`) | `justif/core` + a custom renderer |

---

## The reading experience

`features/books/reader/foliate/justif.raw.js` — Justif 0.7.1 vendored as a single classic-script IIFE. Module scripts fail in the WebView's `about:blank` context with a CORS-masked "Script error", the same constraint that shaped `paginator.raw.js`. It exposes `window.__justif` with the en-US, pt and liturgical-Latin hyphenators.

`bundle.mjs` splices it into `bootstrapScript.ts` at a placeholder, and `blobUrl()` injects it **per chapter** — every chapter is its own blob document, so a single host-level injection would not reach them.

Config: stock defaults plus `hangingPunctuation: 'first-line-and-line-ends'`. Tuning was measured and isn't worth it (below).

![The book reader rendering justified, hyphenated text](../assets/justification-reader-shipped.webp)

### Two things the wiring has to get right

**Timing.** At parse time foliate has not sized the iframe, so the body is zero-width and Justif declines every paragraph with `"zero content width"`. Neither `rescan()` nor `refresh()` rescues that — `rescan()` only re-lays out paragraphs whose *styling* changed, and a container-width change is not a style change, so it silently reports zero skips and does nothing. The `justify()` call itself therefore waits for a real measure: driven from the paginator's `load` handler (`settleJustif`), backed by a ResizeObserver inside the chapter document. Height changes afterwards re-render, since foliate has already measured the section.

**Footnotes.** The anchor-click handler posts a footnote's `innerHTML` to `FootnoteSheet`, so `[data-footnotes]` is excluded from the scan — otherwise the sheet receives justified span soup with inline `word-spacing`.

Tap handling needed no change: `wireTapZones` already delegates on `doc`, which is what Justif requires of interactive inline content.

### Why highlights survive

`highlightAnchor.ts` anchors highlights and bookmarks as **plain-text character offsets over the live text-node tree**, and Justif re-renders paragraphs as per-line `<span class="justif-seg">` clones — which sounds fatal. It isn't: Justif paints inserted hyphens *outside* the text tree (a segment showing `blind-` has `textContent === "blind"`), and inter-line spaces stay real spaces.

Verified by booting the real reader headlessly: 81/81 paragraphs managed, zero skips, and the anchor character stream byte-identical at 25,347 chars. **No migration needed**, but it is an invariant worth re-checking on any Justif upgrade.

`walkText` in the bootstrap skips `SCRIPT`/`STYLE`, since the injected bundle now lives in the chapter body and would otherwise count toward those offsets.

---

## The prayer experience

React Native exposes no `wordSpacing` (confirmed in Fabric's `TextAttributes.h`), so Justif's DOM renderer can't be used. `justif/core` is DOM-free and takes an injectable `Measure`, which leaves one real gap: RN has no text-measurement API either.

**`scripts/build-font-metrics.mjs`** closes it. The reading fonts ship as TTFs, so everything a shaper needs to set a line comes out of the file at build time into `lib/typography/fontMetrics.generated.ts` — 255 KB (70 KB gzipped) for all seven fonts. Re-run it when `readingFonts.ts` changes.

- **Advances** (`hmtx` via `cmap`) for whole Unicode blocks — Latin-1, Latin Extended A/B/Additional, Greek and Greek Extended, General Punctuation, currency, letterlike, arrows, f-ligatures — intersected with each face's own cmap, minus the default-ignorable formatting characters (whose `hmtx` entry is a real advance while every shaper draws them at zero). Blocks rather than a hand-picked list, because a list is exactly the thing that falls behind the corpus: `º`, `ª`, `§`, `ǽ` and `‒` appear thousands of times under `content/` and every one of them was outside the original list, so every line they landed on was placed against the wrong width.
- **Pair kerning** (GPOS `kern`, PairPos formats 1 and 2, behind Extension lookups where needed), resolved for every ordered pair of the *reading alphabet* — the letters, digits, punctuation, macron vowels and ligatures of en/pt/la/it — with all lookups applied in order and the first covering subtable winning within a lookup, as HarfBuzz does. The resolved table is then re-derived into classes (left = distinct rows, right = distinct columns) and each row is emitted as a dense string, two base-90 digits per cell, which Hermes stores as Latin-1: two bytes a cell against four or five for a JSON number. Merriweather kerns glyph by glyph (format 1 only) and does not class-compress — 203 × 200, 81 KB of the file — and carrying it exactly was the right call over a lossy merge, since its rows genuinely differ by more than 1 % of an em.
- **f-ligatures** (GSUB `liga`, LigatureSubst) resolved to a glyph and filed under the presentation codepoint, for faces that reach `ﬁ` only through GSUB and never map U+FB01. `fontMetrics.ts` then substitutes only the ligatures a face actually carries: EB Garamond ligates all five, Merriweather only `fi`/`fl`, Cormorant none.

Validated against a real shaper: per glyph, 0 advances disagree above 0.5 % of an em across all seven faces (bar Catalan `Ŀ`/`ŀ` in Libre Baskerville); per word, every kerned word in a 19-word probe matched Chromium to 0.0; per line, the worst disagreement over 12 chapters × 7 faces × 5 sizes × 4 measures is **0.42 px**, flat across sizes — sub-pixel snapping, not shaping. What remains unmodelled is `calt` (Cormorant swaps a narrow `f` before `l`), and it errs in the safe direction: the shaper draws narrower than the model, so the line sits a hair short rather than re-breaking.

**`lib/typography/justifyText.ts`** wires those metrics into `buildItems` → `breakParagraph` → `layoutLines` and returns a per-line recipe. It returns `undefined` rather than guessing whenever anything is unusable — an unmeasured container, a font without a table, a paragraph the breaker declined.

**`components/ReadingParagraph/JustifiedLines.tsx`** renders that recipe with the one lever RN does expose: `letterSpacing` adds space *after* each character, so a nested `<Text>` holding a single space renders at `spaceAdvance + letterSpacing`. Everything stays inside one parent `<Text>`, keeping it a single selectable, copyable run. Whenever the line model is unavailable it falls back to ordinary wrapped text, which `ReadingParagraph` derives from the same segments in the same faces — so the fallback can't drift from what the breaker would have measured.

**Inline emphasis is justified, not excluded.** `buildItems` takes an array of runs precisely so a paragraph can mix faces, so `*Mater Dei*` is measured in the real italic face and broken along with everything else. Each style contributes its own metrics and its own word-space width, and the output is *pieces* rather than words — `*Mater Dei*,` puts the comma back in regular, so one word can span two pieces.

This is why the generator emits per-face tables and why it only lists faces the app actually **loads**: metrics have to describe what gets rendered. EB Garamond loads real `400Regular`, `400Regular_Italic`, `700Bold` and `700Bold_Italic`, so all four styles are exact. The other six families load Regular only, and the platform synthesizes emphasis — where synthetic *italic* is an oblique shear that preserves advances (so regular metrics stay exact), but synthetic *bold* is an emboldening smear whose advance growth is platform-specific and can't be predicted, so bold on those families declines rather than guessing.

`PrayerLines` leaves only two things on the existing renderer: Divinum Officium lines (verse numbers, pointing marks, small caps that `DoInlineLine` owns) and response prefixes. Both are decided per block, so a prayer never mixes the two renderers mid-way.

**Every reading surface goes through the same pass.** The native side started as "prayer lines only" and grew a habit of excluding anything harder: prose, Bible verses, missal lines with ℣/℟ marks, producer paragraphs with tappable cross-references. None of those exclusions were real. Justif's own `RunMetrics` is documented as *"one styling context inside a paragraph (the paragraph itself, an `<em>`, **a size change**…)"* — the library was always able to price a run that differs from its neighbours in more than face. The limit was our wrapper closing over a single `fontSizePx` and a single `TextStyleName`.

`StyledSegment` now describes a full inline run:

| Field | Changes an advance? | For |
|---|---|---|
| `style` | yes | the face — regular / bold / italic / boldItalic |
| `fontSizePx` | yes | a superscript verse number, a ℣/℟ mark at 1.15× |
| `letterSpacing` | yes | a tracked citation; RN adds it after every character |
| `render` | **no** | colour, opacity, leading — drawn, never measured |
| `onPress` | no | a cross-reference that stays tappable after a break |
| `atomic` | — | rigid spaces, no hyphenation, no break inside |

Three rules fall out of that table and all three are load-bearing:

1. **`render` must never carry `fontFamily`, `fontSize` or `letterSpacing`.** Those have dedicated fields because the breaker has to see them. A metric-bearing property smuggled through `render` places lines against widths the screen then contradicts.
2. **`render` colours must be RESOLVED values, not Tamagui tokens.** It is applied as a raw RN `style`, where `$colorSecondary` does not resolve and renders as no colour at all. Read it off `useTheme()` first, under a memo.
3. **Runs are grouped by appearance identity, and `render`/`onPress` compare by reference.** Building them fresh each render costs an extra run, never a wrong break — but two cross-references must never share one, or the breaker fuses them into a single tap target.

`ReadingParagraph` is the one place that decides justified-vs-ragged, names the block's face, draws the ragged fallback from the caller's segments, hyphenates in the language of its column (`ReadingLanguage`, set per side by `BilingualBlock`), and guards iOS's last line on every path. Callers hand it segments and nothing else. Every reading surface goes through it: `ProseBlock`, `PrayerLines`, `ChapterContent` (Bible), `ProducerHtmlBlock` (Catechism, articles), `VersesBlock`, `ChoiceRichTextBlock`, and the reading-settings preview — which matters, because a preview set by the platform would advertise rivers the reader will never see.

**What still declines, and why it is a real limit rather than a shrug:**

| Case | Why |
|---|---|
| A drop cap, a producer question | Set in the heading face (Cinzel), which has no generated advance table |
| Bold on six of the seven families | Synthetic bold is an emboldening smear with platform-specific advances |
| A paragraph with a hard `break` | A newline is a paragraph boundary the breaker has no model for |
| Divinum Officium lines, response prefixes | `DoInlineLine` owns verse numbers, pointing marks and small caps |

Each falls back to ordinary wrapped text with its content intact, soft-hyphenated by `lib/hyphenate` in the paragraph's language, and `android_hyphenationFrequency: 'full'` in `useReadingStyle()` adds the platform hyphenator where the platform has one. iOS has none, which is the whole reason the app breaks its own lines.

**`ProseBlock` goes through the same pass**, and it is the surface that needed it most. A `prose` primitive is where the corpus's long-form text lands — a book chapter read inside a practice (`practice/intimita-divina` is one continuous meditation), the catechism, a chapter opened from Browse. Prayer lines are short and pre-broken; a Divine Intimacy paragraph is 2,000 characters of unbroken Portuguese, which is precisely the case greedy justification handles worst: it opens rivers of whitespace down the whole page. Paragraphs, list items and blockquote paragraphs each hand their breaks to `ReadingParagraph` and set themselves `left`, which is what tells the platform to leave the lines exactly where the breaker put them. A list marker is prepended as a real segment rather than drawn separately, so the first line is measured with the bullet in it.

Bilingual side-by-side is where it pays most; that ~170 px column is the narrowest measure in the app.

![The bilingual prayer column, before and after](../assets/justification-native-shipped.webp)

### Seven traps, all found by measuring

| Trap | Consequence | Handling |
|---|---|---|
| **f-ligatures** | a font draws `ffl` as one narrower glyph, so `afflict` measures 2.53 px wide — enough to overflow a line and cascade a re-wrap | substitute the presentation forms **the face carries** before summing advances; Merriweather has only `fi`/`fl`, so its `affligit` is `af` + `ﬂ` + `igit` |
| **letterfit tracking** | tracking is a fraction of the line's *set width*, not a per-character amount; modelling it as `trackRatio × 0.03 × fontSize` over-counted by ~26 px/line | `tracking: false` — word spaces are the only flex, and RN hits those to the pixel. Costs one line in nineteen |
| **soft hyphens** | `lib/hyphenate.ts` already inserts them into prayer text; measured as real characters they inflate every hyphenated word | zero-width by codepoint — and kerning spans them, as it does for the shaper |
| **a codepoint outside the table** | the face's fallback advance stands in for the real glyph, so the line is placed against a width the screen contradicts | the generator emits whole Unicode blocks intersected with the face's own cmap, and the fallback is the face's **widest** advance, so an unknown glyph can only leave a line short |
| **kerning** | a shaper applies GPOS pairs by default; `AVATAR` in EB Garamond is 45 % of an em narrower than its advances sum, and across a line the miss reached 0.19 em | the generator resolves every pair of the reading alphabet at build time (above); a tracked run is measured unkerned, because iOS replaces the pair table with the fixed kern the moment `letterSpacing` is set |
| **kerning across a break point** | justif prices a hyphenation from cumulative prefixes, so the fragment after a break carries the kern it forms with the glyph before it (`tal` after `to‑`, `Vos` after `consagro-`) — and once the line breaks there the screen never draws that pair | `creditBreakEdges`: the pair goes onto the box as justif's own line-start credit `lp`, and the pair a materialised hyphen forms with the letter before it onto the penalty's `rp`. With kerning modelled this was the *entire* remaining residual — every worst line began at a hyphen |
| **landing on the container's width** | the platform measures at the width Yoga offers and draws in a frame rounded to the pixel grid; a line that fits at measure and not at draw is re-broken at draw only, the newline meant to end it lands on an empty line box, and the last line falls outside the height the view was given — never laid out, its slot blank | `breakWidth` in `lib/typography/measureFit.ts`: one device pixel (the platform's share) plus one CSS pixel (what the shaper snaps), uniformly on every line |

The general rule behind the second one: **any flex the breaker is allowed must actually be rendered, or lines silently re-wrap.** Behind the rest: **the breaker's arithmetic has to be wrong in the safe direction — short of the measure, never past it.**

### Three layers, and what each is for

1. **The model is exact.** Advances, ligatures, kerning and break-edge kerning: what the tables sum is what a shaper draws, to under half a pixel on a full line. This is where the work belongs, because it is the only layer that costs nothing at render time and makes every line meet the margin flush.
2. **The headroom covers what the platform never reports.** The measure-versus-draw window at the pixel grid is at most one device pixel, and the platform gives no signal when a line falls into it; so one device pixel is reserved, plus one CSS pixel for sub-pixel snapping. On a 393-pt phone that is 1.33 px, and lines still clear the edge by 0.97 px at the tightest.
3. **The `onTextLayout` loop catches what the platform does report.** RN hands `JustifiedLines` the lines it actually laid the paragraph out on, at measure time. More lines than the model means a line the breaker placed did not fit the platform's own shaping — a `calt` alternate, a face drawn by something other than the file that was measured; `fitToPlatform` narrows the measure by a pixel and the breaker tries again, from zero whenever the measure, size, face or language changes. A paragraph still disagreeing after a tenth of an em of narrowing is one the model cannot describe, and it goes to the ragged fallback rather than to the screen — a lesser failure than a missing line. In the shaper measurements this layer never fires; it is there for the platforms that were not measured.

Measured over 12 chapters × 7 faces × 5 sizes × 4 measures, rendering each modelled line with the real face:

| | Lines | Landing at or past the container | Tightest clearance |
|---|---|---|---|
| Unkerned tables, 1 px headroom (before) | 389,467 | **2,535** — one line in 154 | −3.70 px |
| Unkerned tables, 0.25 em headroom (interim) | 400,011 | 0 | 1.09 px, at a 5.5 px inset |
| Exact model, 1 device px + 1 CSS px (now) | 388,635 | 0 | 0.97 px, at a 1.33 px inset |

### Not verified — gates this surface

Whether **UIKit widens a lone space under `letterSpacing`** the way CSS does. RN maps it to `NSKernAttributeName` on iOS and `TextPaint.setLetterSpacing` on Android, both of which add after each character, so it should hold — but it needs a simulator check. If it fails, `JustifiedLines` falls back to plain wrapped text, so the failure mode is "no justification", not broken text.

Also to confirm on device: selection and copy across the nested runs, and whether `allowFontScaling={false}` is right under Dynamic Type (the alternative is recomputing on scale change — the pipeline is pure JS and fast).

---

## Hyphenation

Justif bundles 24 languages. **Latin is not one of them**, which matters here. `lib/typography/hyphenLaLiturgic.generated.ts` carries `hyph-la-x-liturgic` (1,955 patterns, MIT, Claudio Beccari and the Monastery of Solesmes — the authority for liturgical Latin), fed through Justif's generic Liang hyphenator: `be-ne-di-cen-dum`, `co-gi-ta-ti-o-ni-bus`, `mi-se-ri-cor-dia`.

Hyphenation is **not optional** at these measures. A bilingual side-by-side column is ~170 px (a 390 px phone, `PracticeFlowView`'s 16 px padding, `BilingualBlock`'s 8 px gap and 1 px divider, halved) — about 17 characters. Without break opportunities the breaker has to open word spaces enormously to fit anything: measured at 132 lines and a 63 px worst-case gap without a hyphenator, against 128 lines and 49 px with one.

The app also has an older hyphenation layer, `lib/hyphenate.ts` (`hyphen` package, classical Latin patterns), which inserts soft hyphens for the plain renderer. Two sources of Latin hyphenation is one too many — worth collapsing onto the liturgical patterns.

---

## Settled by measurement

- **Don't tune.** A config pushed hard for narrow measures (`hyphenPenalty: 20`, tighter glue, 4.5% tracking, `lastLineMinWidth: 0`, `tolerance: 400`) landed at 127 lines against 128 for stock defaults, worst gap 44 px against 49 px. Indistinguishable. Ship the defaults.
- **Expansion is inert.** All seven reading fonts are static instances with no `wdth` axis. Revisit only if we ship variable font files.
- **Cost, reader:** ~390 ms for 4,565 words on desktop Chromium, ~110 ms to re-lay-out. Per section load, not per page turn.

---

## What's left

1. **The iOS `letterSpacing` device check** above. Everything else in the prayer pipeline is verified; this decides whether it renders.
2. **Bible as continuous prose** rather than one `<Text>` per verse. Each verse is now justified *with* its marker — the marker is an `atomic` run at 0.55×, so it costs the line what it draws — but a verse is still its own paragraph, so the last line of every verse is a ragged short line. Running verses together into real paragraphs is the remaining half, and it is a content-model question (where paragraphs begin, how selection and highlight anchors survive) rather than a typographic one. Its own spec.
3. ~~**`android_hyphenationFrequency`** for text still on the plain renderer.~~ Set to `'full'` in `useReadingStyle()`. It defaults to `'none'`, which left plain-renderer text justified *without* hyphenation — the worst combination. Only the fallback cases in the table above still take that path.
4. **Protrusion and hanging punctuation on native.** `justif/core` reports `leftHang`/`rightHang`; rendering them means negative margins per line. Pure refinement.
5. **Collapse the two Latin hyphenators.**

---

## Known bug: `lang="la"` rewrites Latin orthography

EB Garamond carries a `locl` substitution for the Latin language system that swaps in classical epigraphic forms — `meum → mevm`, `quoque → qvoqve`, `tuum → tvvm` — at **identical advance widths**, so no width check catches it. Live wherever Latin is language-tagged, including the book reader, which sets `<html lang="${cfg.lang}">` in `blobUrl()`. The corpus says *meum*; the reader shows *mevm*.

Fix is to suppress the substitution (`font-variant-alternates` / `font-feature-settings`) or not tag Latin runs with `lang` — but the drop-in script's hyphenator selection keys off `lang`, so the second route means passing the hyphenator explicitly. Not fixed yet.
