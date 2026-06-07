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

### Two iOS-specific reader fixes worth remembering

Both already shipped, but they're load-bearing and easy to undo by accident:

1. `apps/app/src/features/books/reader/foliate/FoliateReader.tsx` — the
   `const doc = e.detail.doc` declaration in the foliate `load` event
   handler MUST be at the top of the handler. Selection-wiring and
   tap-wiring blocks below both reference `doc`. Putting it elsewhere
   triggers a temporal-dead-zone ReferenceError that silently aborts the
   handler, killing tap zones.
2. `apps/app/src/app/(tabs)/(today,explore,library,you,search)/browse/book/_layout.tsx`
   — the modal screen options `animation: 'default'` + `freezeOnBlur:
   false` + `gestureDirection: 'vertical'` are all required. Removing any
   reintroduces the touch-hijack-after-close bug or breaks swipe-down
   dismiss.

### TOC rows use `router.push`, not `Link.AppleZoom`

`TocNodeRow` + `CompactSectionRow` in the frontispiece used to wrap each
row in `ZoomLink`. AppleZoom from inside a scrollable list left a snapshot
view that blocked taps on the frontispiece after the modal dismissed.
Reverted to `router.push`; the prominent BookHero CTA keeps its zoom morph
(it works fine because it's outside the ScrollView). If we ever discover
a way to use AppleZoom safely from inside a list, revert that change.

### Highlight-paint coord math is iframe↔host translated

The SVG overlayer is created in the iframe doc but appended to the host
view container (cross-doc adoption). `range.getClientRects()` returns
iframe-viewport coords; the SVG is host-viewport. The `_offsets()` helper
in `FoliateReader.tsx` computes `dx = iframeRect.left - svgRect.x` (and
same for y) once per redraw and applies it to each rect. If anyone
"simplifies" this back to `r.x - svgRect.x`, paint will land off-screen.
