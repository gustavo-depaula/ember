# Book reader — known issues + follow-ups

State of the `book-reader-v2` branch at merge time. Items below are deferred
deliberately, not forgotten.

## Known limitations (won't fix without explicit decision)

### iOS text-selection menu still shows Apple Intelligence / Share / Translate

The reader suppresses standard system items (Cut, Copy, Paste, Look Up,
Select, Select All, Bold/Italic/Underline, Replace) via `suppressMenuItems`
on the WebView. Three items remain visible *for users with those features
enabled*: **Apple Intelligence (Writing Tools)**, **Share**, **Translate**.

Why they remain:
- **Apple Intelligence** lives outside the responder chain; the only way to
  suppress it is `WKWebViewConfiguration.writingToolsBehavior = .none`,
  which requires native code. `react-native-webview` hasn't exposed this as
  a prop ([issue #3580](https://github.com/react-native-webview/react-native-webview/issues/3580),
  stale).
- **Share / Translate** are added by WebKit *below* the responder chain. Per
  [WebKit bug 244149](https://bugs.webkit.org/show_bug.cgi?id=244149), even
  fully overriding `buildMenuWithBuilder:` and not calling `super` doesn't
  remove them.

Fix path: a small `patch-package` (or expo config plugin) on
`RNCWebViewImpl.m` exposing `writingToolsBehavior` as a prop would kill the
Apple Intelligence item cleanly. Share / Translate are not reliably
removable even with that patch.

### `react-native-webview`'s `menuItems` API only affects the long-press menu

We can't add our own items into the selection edit menu without patching
the library — its `menuItems` plumbing attaches to `RNCWebViewImpl`'s own
`UIEditMenuInteraction` (presented on long-press), not WebKit's
selection-triggered one. Embedding our highlight actions natively (Apple
Notes / Mail style) requires the same patch path as above.

## Pending features

### EPUB file opening (task #65)

User-supplied `.epub` files: doc-picker → in-app reader. foliate-js can
parse EPUB natively; the work is plumbing the file in via expo-file-system,
generating a manifest stub, registering an ad-hoc book in the catalog so
the Library / frontispiece can surface it, and wiring the reader to load
EPUB sections instead of preloaded HTML chapters.

### Text-to-speech (task #36 / P1.9)

Deferred during the night. `expo-speech` is not in the dep tree and the
WebView `speechSynthesis` fallback hits the iOS autoplay-gesture
restriction. Plan sketch in `night-work-plan.md` under "Feature 9".

### Highlights — phase 5 (deferred polish)

- **Note-anchor drift**: highlights store plain-text offsets. If the
  chapter HTML is later edited (typo fix in content), the offset can drift.
  Bookmarks have the same fragility. Consider a `text-context` fallback
  (prefix/suffix lookup) when offset resolution returns garbled text.
- **Cross-chapter highlights**: selection spanning the iframe boundary is
  silently dropped in the bootstrap (`startContainer.ownerDocument !==
  endContainer.ownerDocument`). Not a common need.
- **Highlight density on the scrubber**: when a chapter has many
  highlights they overlap on the scrubber dots. Could aggregate visually
  (small histogram bars) instead of stacking single dots.
- **Export highlights**: share-as-markdown / clipboard dump of all
  highlights for a book.

## Tech debt notes

### Resolved (kept here as anchors for future archaeology)

1. **TDZ-sensitive `const doc` in the foliate `load` handler.** Refactored
   into named subfunctions (`wireSelectionListener`, `wireTapZones`,
   `fadeInChapter`) that take `doc` as an explicit parameter. The TDZ
   class of bug is now structurally impossible.
2. **Modal route options bundled.** The four flags that together make
   AppleZoom + swipe-down-dismiss + clean teardown work are now a single
   `READER_MODAL_OPTIONS` const in `browse/book/_layout.tsx` with the
   full rationale in one place.
3. **Coord-translation helper named for what it does.** `_offsets()`
   renamed to `_iframeToSvgDelta()` with a tight docstring describing
   why the cross-document translation is necessary.
4. **Bootstrap extracted from inline template literal.** The 500-line
   WebView bootstrap used to live inside a JS template literal in
   `FoliateReader.tsx`. Any backtick in any comment inside it closed
   the literal early, and `biome --write` corrupted the half-broken
   file. Now in its own `foliate/bootstrap.raw.js` file, bundled via
   `bundle.mjs` into `bootstrapScript.ts` (same pattern as the
   vendored paginator). The host HTML splices in both scripts plus a
   trailing init call: `window.__foliateInit(cfg, chapters, idx, frac)`.
   Backticks in comments are now harmless; biome can autofix the file
   without risk.
5. **Highlight WebView payload built in one place.** The optimistic
   single-paint (`addHighlight`) and the bulk-replay useEffect
   (`setHighlights`) used to inline the same `paintColorFor + shape`
   mapping. Centralised into `toBootstrapPayload`; both paths route
   through it so the WebView always sees the same shape and the color
   palette can't drift between code paths.
6. **Highlight remove path centralised.** `removeHighlightById` is the
   single bridge+store+state delete; the toolbar `handleRemoveHighlight`
   and the sheet's inline `onRemove` both go through it.
7. **Generated foliate scripts excluded in `biome.json`, not via
   comments.** `// biome-ignore-all format:` is a no-op (the formatter
   has no suppression mechanism); the embedded blobs are excluded at
   config level, with a pointer note in `bundle.mjs`. Stops biome from
   reporting a "format would print" error on every check.

### Still tech debt (intentional, but should be cleaned later)

#### TOC rows use `router.push`, not `Link.AppleZoom`

`TocNodeRow` + `CompactSectionRow` in the frontispiece used to wrap each
row in `ZoomLink`. AppleZoom from inside a scrollable list left a snapshot
view that blocked taps on the frontispiece after the modal dismissed.
Reverted to `router.push`; the prominent BookHero CTA keeps its zoom morph
(it works fine because it's outside the ScrollView). If we ever discover
a way to use AppleZoom safely from inside a list, revert that change.
