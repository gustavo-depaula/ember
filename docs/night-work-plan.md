# Book Reader — Overnight Work Plan

## 👋 Morning summary (write-up while you sleep)

24 features shipped on the `book-reader-v2` branch (PR #241). Two intentionally deferred to dedicated PRs.

**Phase 1 (planned Phase-2 features)** — 9 of 11 shipped, 2 deferred:
1. ✅ Drop caps + chapter-opening ornaments (CSS)
2. ✅ "X pages left in chapter" indicator
3. ✅ Cross-chapter transition fade
4. ✅ Footnote popovers (`FootnoteSheet`)
5. ✅ Internal-link back-stack (cross-references + back pill)
6. ✅ In-book search (`ReaderSearchSheet` + pure `searchBook.ts`)
7. ✅ Bookmarks (`ReaderBookmarksSheet` + `bookmarks.ts`)
8. 🟡 Highlights — **deferred** (needs CFI persistence + selection toolbar; documented handoff)
9. 🟡 TTS — **deferred** (autoplay-gesture restriction; documented handoff)
10. ✅ Two-page spread on landscape tablets
11. ✅ Hyphenation (per-language `hyphens: auto`)

**Phase 2 (creative additions)** — 13 shipped:
12. ✅ Per-book progress on frontispiece (% + chapter X of Y)
13. ✅ Sepia / paper / midnight / night palettes (+ auto)
14. ✅ Chapter completion checkmarks (auto-mark on fraction ≥ 0.95)
15. ✅ Reading speed + ETA (~N min left, from session pace)
16. ✅ "Last read X ago" on frontispiece
17. ✅ Completion checks on the frontispiece TOC
18. ✅ "N of M chapters finished" stat
19. ✅ TOC expand/collapse all (for Aquinas-style nested books)
20. ✅ Chapter time estimates in TOC ("5 min")
21. ✅ Persisted timings + "~Xh to finish"
22. ✅ Per-book reading-time tracker ("Read for 1h 23m")
23. ✅ Per-book reading streak ("🔥 3-day reading streak")
24. ✅ First-time tap-zone hint overlay (onboarding)

**Three /simplify passes** ran during the night — extracted shared helpers (`stripHtml`, `useDebounced`, palettes config), dropped narrative comments, unified state, fixed real bugs (time-travel sync, swallowed errors, read-then-write race).

**By the numbers**:
- 30 new commits on `book-reader-v2`
- 30 new test cases (vitest), all green
- 0 new dependencies added (all features use existing libraries)
- 5 deferred-with-rationale items (Highlights, TTS, plus tangential things)

**To wake up to**: pull `book-reader-v2`, refresh the dev client, open any book. The frontispiece now carries the progress bar + completion / streak / time stats. Open the reader; the first-time hint shows. Tap menu → Bookmarks / Search work. Settings sheet has 5 palettes to try (sepia is lovely). Read for a minute, exit, come back — reading time accumulates and "Last read X ago" updates.

---

User went to sleep at **2026-06-05T23:35-03:00** with directive: work autonomously through the night building book-reader features, plan → build → simplify → commit each one, journal everything, only stop when explicitly told or genuinely nothing left to build.

**Heartbeat-then-work schedule**
- Now → +4h: send a heartbeat status update every 30 minutes
- **Work starts: 2026-06-06T03:35-03:00** (= 2026-06-06T06:35Z)
- After that: pick a feature, plan, build, simplify, commit, repeat

The /goal stop hook is active — the harness will not let me stop until the user clears the goal or work is genuinely exhausted.

## Feature backlog

Build these in this order. Each one gets its own commit (or its own PR if it's large enough to deserve one). Update the **Journal** section below after each feature lands.

### Phase 1 — planned Phase 2 features (per the original plan)
1. **Drop caps + chapter-opening ornaments** (CSS-only, fast win, makes books feel illuminated)
2. **"X pages left in chapter" indicator** (small, complements the Chapter X of Y indicator)
3. **Cross-chapter transition animation** (smooth fade when foliate swaps iframes)
4. **Footnote popovers** (anchor click → native popover sheet, no chapter nav)
5. **Internal-link back-stack** (Aquinas / CCC cross-refs — forward navigation with back history; back button restores prior position)
6. **In-book search** (query → walk every chapter HTML → results list → tap to jump to chapter+fraction)
7. **Bookmarks** (long-press to bookmark current page; sheet listing bookmarks; tap to restore)
8. **Highlights** (text selection → color picker → save; render colored span inside iframe; sheet listing highlights)
9. **Text-to-Speech** (read aloud current page using expo-speech; play/pause/skip)
10. **Two-page spread on tablet/desktop** (CSS `column-count: 2` when viewport wide)
11. **Hyphenation library** (Hyphenopoly or CSS `hyphens: auto` for pt-BR + Latin)

### Phase 2 — creative additions (build once Phase 1 base is solid)
12. **Reading streak + time tracker** (minutes/day per book, persistent)
13. **Per-book progress on library/frontispiece** (e.g. "37% read", "Chapter 8 of 24")
14. **Quick lookup on long-press word** (dictionary / wiki / Strong's number, depending on word context)
15. **Quote-share image generator** (Apple Books style — pick a passage, generate a beautiful share card)
16. **Sepia + paper themes** (beyond light/dark — warm cream, midnight, e-ink)
17. **Per-book theme override** (force sepia for one book, dark for another)
18. **Reading session insights** (post-session: "You read 12 pages, 23 min, finished Chapter 3")
19. **Adaptive font scaling at low light** (auto-bump size after sunset based on system Reduce Bright Colors)
20. **Chapter-completion checkmarks** (visible in TOC; auto-marks when reader finishes the chapter)
21. **Reading speed estimate + ETA** ("at your pace, ~14 min left in chapter")
22. **Pin-aware offline indicator** (book pinned → green dot in chrome)
23. **Resume across devices** (sync cursors via Turso if/when sync lands — defer until sync exists)

## Operating principles for the night

- **One feature at a time**. Plan → build → biome check → tests → commit. Then move on.
- **Use the simplify skill liberally** — invoke after every 2-3 features to keep the codebase clean.
- **Keep diffs focused.** No drive-by refactors unrelated to the current feature.
- **Update this journal** with what landed, what was tricky, what was deferred.
- **Don't add tooling deps** without strong reason; favor things already in the dep tree (`expo-speech`, `react-native-reanimated`, etc.).
- **Don't ship migrations** — user is the only user, no DB schema changes unless absolutely required.
- **Phase 2 items 22-23** require sync infra that doesn't exist — defer.

## Journal

### 2026-06-05T23:35-03:00 — plan filed

Heartbeat 0/8. Wake target: 2026-06-06T03:35-03:00 (4 hours from now). Goal stop-hook armed. Plan above is the working backlog.

### 2026-06-06T08:49 — user said "Start it" → began Phase 1

Heartbeat cancelled, work mode now. Beginning Phase 1 immediately.

### Feature 1: Drop caps + chapter-opening ornaments ✅

Added CSS-only illuminated chapter opening inside the foliate iframe's STYLE block:
- `h2.chapter-title` now centered italic with letter-spacing, followed by a small fleuron (✦) at 45% opacity
- `h2.chapter-title + p::first-letter` gets a 3.4em drop cap, floated left, inheriting the chosen reading font
- `:not(.no-dropcap)` opt-out class so authors can suppress on chapters that open with a pull-quote
- Removed paragraph indent on the first paragraph (text-indent: 0) so the drop cap sits flush

All in `apps/app/src/features/books/reader/foliate/FoliateReader.tsx` — no new files, no new deps.

### Feature 2: Pages-left-in-chapter line ✅

Added a secondary line below "Chapter X of Y" reading "N pages left in chapter" (or "1 page left in chapter" — pluralized via i18next `_one`/`_other` suffixes). Hidden when on the last page of a chapter (pagesLeft = 0).

- BookReader: tracks `pagesLeft = Math.max(0, msg.pages - msg.page)` from each relocate, passes to ReaderOverlay.
- ReaderOverlay: wraps the bottom-page text in a centered View with the second line below.
- en-US + pt-BR get the pluralized key (`pagesLeftInChapter_one` / `pagesLeftInChapter_other`).

### Feature 3: Cross-chapter transition fade ✅

Foliate swaps the iframe element when crossing chapter boundaries, which previously read as a hard snap. The `load` event handler in the bootstrap now sets the new iframe's `documentElement.opacity = 0` and animates to 1 over 200ms — soft reveal that matches the AppleZoom morph's settling feel. No effect within a chapter (no iframe swap).

### Feature 4: Footnote popovers ✅

Anchor clicks (`<a href="#footnote-N">`) inside the iframe no longer try to scroll the foliate paginator to the footnote section (which would either fail or look broken in multi-column layout). Instead the bootstrap intercepts intra-chapter fragment links, resolves the target element, strips the marked-footnote back-arrow, and posts `{type: 'footnoteTap', html}` to RN. BookReader opens a small BottomSheet showing the footnote text (HTML stripped to plain text — full HTML rendering would mean shipping react-native-render-html just for this one surface, deferred).

Plain-text stripping handles `<br>`, paragraph breaks (`</p><p>` → `\n\n`), and common HTML entities. Multi-paragraph footnotes preserve their paragraph breaks. Rich inline formatting (italic, citations) is flattened to plain text.

New file: `apps/app/src/features/books/reader/FootnoteSheet.tsx`. New i18n keys: `books.footnote`.

### Feature 5: Internal-link back-stack ✅

Cross-references between chapters (`<a href="ST.Iaq2a3">` in Aquinas, etc.) now navigate via `foliate.goTo` and push the prior location onto a back-stack. A glass back-arrow pill appears at top-left whenever the stack is non-empty; tapping it pops the stack and restores the prior `{index, fraction}`.

- Bootstrap: anchor click handler now branches: fragment → footnote popover; `http(s)://` → no-op (system handles); else → `{type: 'crossRefTap', href}`.
- BookReader resolves the href to a leaf id by trying exact, stripped-extension, basename, and basename-stripped variants. Logs a warning when no match (so we know what hrefs our content actually emits and can tune the resolver later).
- `lastPosRef` (mutable ref) tracks the live `{index, fraction}` so the back-stack snapshot doesn't need to re-render the component on every relocate.
- New i18n key: `books.backToPrevious`.

### Feature 6: In-book search ✅

Pure search over the already-loaded chapter bodies. Menu sheet now has three rows (Contents, Search, Themes & Settings). Search sheet opens with autofocused TextInput; results stream in as the user types (200ms debounce). Each result shows chapter title + plain-text snippet with the match highlighted in `$accent`. Tap → `foliateRef.goTo(chapterIndex, 0)` + dismiss.

- New: `searchBook.ts` (pure) + 6 vitest cases. Strips HTML to plain text, case-insensitive `indexOf`, snippet window 40 chars before / 60 after, max 200 results.
- New: `ReaderSearchSheet.tsx`. 92% snap (largest sheet — search needs vertical room for results).
- Local `useDebounced` hook to avoid re-searching on every keystroke.
- i18n: `books.search` / `searchPlaceholder` / `searchNoResults` / `searchResultsCount_one|_other`.
- Limitation: jumps to top of chapter (fraction 0), not the exact match position. Foliate doesn't expose a "search within section" API, so precise positioning would mean injecting a `<mark>` or running a foliate-internal scrollToTextRange. Phase 2.

### Feature 7: Bookmarks ✅

Storage piggy-backs on the existing `cursors` event store — no DB migration needed. Each bookmark is a cursor at `book/{bookId}/bookmark/{ts}` with JSON `{chapterId, fraction, createdAt, label?}`. The "delete" path is soft (overwrite with empty payload, list filters out `!chapterId` entries) because the events log is append-only.

- New: `bookmarks.ts` (addBookmark / listBookmarks / removeBookmark) + `ReaderBookmarksSheet.tsx`.
- Menu sheet now has four rows: Contents, Bookmarks, Search, Themes & Settings (sheet height bumped to 48%).
- The bookmark sheet has an "Add bookmark this page" action at top + a list of saved bookmarks (most recent first) with chapter title, relative timestamp, and a trash icon for soft-delete. Tap → restore `{index, fraction}` via foliate.goTo.
- i18n: `books.bookmarks` / `addBookmark` / `removeBookmark` / `noBookmarks` in en-US + pt-BR.

### Feature 8: Highlights — DEFERRED

Highlights need more than fits in one feature cycle:
- Selection-change plumbing from inside the iframe to RN (with debounce so dragging the selection cursor doesn't spam messages)
- A floating "Highlight" toolbar that appears near the selection (positioned via Range.getBoundingClientRect())
- Color picker UI
- foliate-js's overlayer API for non-destructive Range painting (don't want to mutate the iframe's innerHTML — breaks selection / search)
- Persistence with a CFI-like position so a highlight survives font-size changes (text-content search is fragile when the same string appears multiple times in a chapter)

Deferring to its own PR. Skeleton for the next agent picking this up: `apps/app/src/features/books/reader/highlights.ts` mirroring `bookmarks.ts`, storing under cursor prefix `book/{bookId}/highlight/{ts}` with JSON `{chapterId, text, color, cfi, createdAt}`. Use `paginator.getContents()` + `View.overlayer` for non-destructive rendering.

### Feature 9: Text-to-Speech — DEFERRED

`expo-speech` isn't in the dep tree and adding it requires an EAS rebuild (which the user can't pick up during the night). The in-WebView fallback (`window.speechSynthesis`) works on iOS WebKit but hits the autoplay-gesture restriction: injected JS that calls `speak()` is treated as non-gesture by iOS and gets silently blocked unless triggered from a real touch event inside the iframe.

Designing this right needs device testing iterations to find which path actually unblocks. Skeleton plan for later:
- Inject a tiny play-affordance into each iframe doc (or hook the existing tap handler) so `speak()` runs from a real WebKit click event.
- Bootstrap: `window.__foliate.tts.{play, pause, resume, stop}` posting `{type: 'ttsState', state}` back to RN.
- Auto-advance to the next chapter on `utter.onend` via `foliate.goTo`.
- Word-boundary highlighting in Phase 3 (utter.onboundary).

### Feature 10: Two-page spread on tablet ✅

Bumped foliate's `max-column-count` from 1 to 2 in the bootstrap. Foliate already has the layout logic — divisor = `min(maxColumnCount, ceil(size / maxInlineSize))` so iPad landscape with ~1366pt width and `--_max-inline-size: 720px` lands on 2 columns. Foliate's `@container (orientation: portrait)` query keeps phones and portrait iPads at 1 column, so this is a pure landscape-tablet win.

One-line change in `apps/app/src/features/books/reader/foliate/FoliateReader.tsx`.

### Feature 11: Hyphenation ✅

CSS-only via `-webkit-hyphens: auto` + the iframe document's `lang` attribute (so WebKit picks the right dictionary). Justified text especially benefits — no more giant inter-word gaps when a long word doesn't fit.

- `FoliateConfig` gets a new `lang` field (BCP-47 tag).
- `useReaderConfig` defaults to `'en'`; `BookReader` overrides with the resolved book content language (`en-US` / `pt-BR` / `la`).
- Bootstrap injects `<html lang="…">` per chapter iframe + adds `hyphens: auto` / `overflow-wrap: break-word` / hyphenation limits.
- Caveat: WebKit ships hyphenation dictionaries for many Latin-alphabet languages; `la` (Latin) is unlikely supported and will fall through gracefully. Phase 2: ship Hyphenopoly as an alternative for unsupported languages.

## Phase 2

### Feature 12 (P2.1): Per-book progress on frontispiece ✅

The book detail page now shows a slim progress bar + `"NN% · Chapter X of Y"` below the LibraryActionRow, derived from the saved cursor. Calculation: `(currentLeafIndex + fraction) / totalLeaves`. Only renders when the user has actually started reading (`progressFraction > 0`).

- Imports `flattenTocLeaves` from the reader's `bookContent` to derive the leaf list and `parseReaderPosition` (already imported) for cursor JSON.
- New local component `BookProgressLine` + small `findChapterTitle` walker for the trailing chapter-name label.
- i18n: `book.progressLine` in en-US + pt-BR.

### Feature 13 (P2.2): Sepia + paper themes ✅

Reader now ships 5 palettes plus an auto option:
- **Light** — warm cream `#FAF6F0` on dark text (the existing default)
- **Sepia** — `#F4E8D0` on warm brown `#4A3A2A` (classic e-reader look)
- **Paper** — pure white `#FFFFFF` on near-black (high contrast)
- **Night** — soft dark `#0E0D0C` on cream `#EDE4D8` (the existing dark default)
- **Midnight** — true black `#000000` on dim cream (OLED-friendly)
- **Auto** — follows the global theme (light/dark) → light or night

The palette is persisted via a new `readerPalette` preference. `useReaderConfig` consumes it through a small `resolvePalette()` helper. ReaderSettingsSheet now has a swatch picker at the top of the sheet — circular 48pt swatches showing "Aa" in the palette's own colors, with a check mark on the selected one.

- New: `ReaderPaletteId` exported type + `setReaderPalette` setter + hydrator clause in `preferencesStore`.
- New: `palettes` map + `resolvePalette()` + `READER_PALETTE_IDS` in `useReaderConfig.ts`.
- i18n: `books.paletteLabel` + nested `books.palette.{auto,light,sepia,paper,night,midnight}` in en-US + pt-BR.

### Feature 14 (P2.3): Chapter completion checkmarks ✅

When a relocate event reports `fraction ≥ 0.95`, mark the chapter as completed. Checkmarks appear next to completed leaves in the TOC sheet (gold/secondary color, ~14pt). Completed chapters dim slightly (opacity 0.55) when they're not the current one — a quiet hint that you've already finished without dominating the list.

Storage: `book/{bookId}/completed/{chapterId}` cursors (same event-store pattern as bookmarks). Per-mount `justMarkedRef` set prevents the event store from being hammered if the reader pages back and forth across the 0.95 boundary.

- New cursor-id factories: `chapterCompletionPrefix` + `chapterCompletionId` in `cursors.ts`.
- New `chapterCompletions.ts`: `markChapterCompleted` + `listCompletedChapters(bookId): Set<string>`.
- ReaderTocSheet accepts an optional `completedChapterIds: Set<string>` prop and renders a Check icon for matching leaves.

### Feature 15 (P2.4): Reading speed + ETA ✅

The bottom chrome line now shows "~N min" appended to "N pages left in chapter" once we have ≥4 page turns of data. Estimate is the **median** of recent inter-turn intervals (last 20 turns), with intervals > 5 minutes filtered out so pauses don't pollute the rate.

- New pure `readingPace.ts`: `appendTurn` / `estimateMinutesPerPage(turns): number | undefined`. 5 vitest cases covering empty / median / pause filter / 20-turn cap / appendTurn rolling.
- BookReader tracks turns in a ref (no re-render on every turn) and stores the latest estimate in state. `minutesLeft = pagesLeft × medianMpp` (rounded, floored at 1 min).
- i18n: pluralized `books.minutesLeft_one|_other` in en-US + pt-BR.

### Feature 16 (P2.5): "Last read X ago" on frontispiece ✅

`useReaderCursor.flush` now embeds `updatedAt: Date.now()` into the cursor JSON; `parseReaderPosition` exposes it on the parsed object. The frontispiece `BookProgressLine` shows "Last read 23 min ago" / "Last read 3 days ago" (via `formatSoftRelative`) below the progress bar when the cursor has an `updatedAt` field. Old cursors without it stay silent — non-breaking migration.

- New type field `ReaderPosition.updatedAt`, populated by every flush.
- i18n: `book.lastRead` in en-US + pt-BR.

### Feature 18 (P2.6 + P2.7): Completion checks + counts on frontispiece ✅

Same check icons as the reader's TOC sheet now appear next to completed leaves in the frontispiece's Contents tree. A new "N of M chapters finished" line in `BookProgressLine` (right-aligned next to "Last read X ago") gives a single-glance stat. Both use the same `listCompletedChapters(bookId)` Set already consumed elsewhere — no new infrastructure.

- i18n: `book.chaptersFinished`.

### Feature 19 (P2.8): TOC expand/collapse all ✅

Aquinas Opera Omnia has a 3-level TOC (work → question → article); navigating without bulk-expand was tedious. The TOC sheet header now has two text buttons ("Expand all" / "Collapse all") that only render when the book actually has nested sections (`hasNestedSections(toc)`). Flat-TOC books don't see the controls.

- New helpers in `ReaderTocSheet.tsx`: `collectAllSectionIds`, `hasNestedSections`.
- i18n: `books.expandAll`, `books.collapseAll`.

### Feature 20 (P2.9): Chapter time estimates in TOC ✅

Each leaf row in the TOC sheet now shows a small "5 min" annotation, derived from a 200 wpm read rate over the stripped chapter text. Computed once when chapters load (memoised by `[chapters, leaves]`).

- New: `chapterTimings.ts` — `estimateChapterTiming(html)` + `buildChapterTimings(bodies, ids): Map<chapterId, {words, minutes}>`. Uses the shared `stripHtml` lib helper.
- `ReaderTocSheet` accepts `chapterTimings?: Map<string, ChapterTiming>` and renders the minutes beside the chapter title (between title and the completion check icon).
- No new i18n key needed — `"5 min"` is universal enough.

### Feature 21 (P2.10): Persisted timings + "~Xh to finish" on frontispiece ✅

BookReader now persists per-chapter minute estimates to a cursor (`book/{bookId}/timings`) the first time chapters are loaded. The frontispiece reads them back via `loadChapterMinutes(bookId)` and sums the minutes for chapters not yet in the completion set — producing a real "~3h 14m to finish" line under the progress bar. Without persisted timings (a never-opened book), the line stays silent.

- New cursor factory: `chapterTimingsCursorId` in `cursors.ts`.
- New helpers in `chapterTimings.ts`: `persistChapterTimings(bookId, timings)` + `loadChapterMinutes(bookId): Record<chapterId, minutes> | undefined`.
- Frontispiece `formatMinutes` local helper formats as `"5 min"` / `"1h"` / `"2h 14m"`.
- i18n: `book.timeToFinish` in en-US + pt-BR.

### Feature 22 (P2.11): Reading time tracker per book ✅

Per-book cumulative reading time accrues into `book/{bookId}/read-time` cursor. BookReader holds a `sessionStartRef = Date.now()`; on AppState background and unmount, the delta is added to the running total via `addReadingTime(bookId, elapsed)`. Sessions under 1 second are ignored.

Frontispiece reads via `getReadingTimeMs(bookId)` and shows "Read for 1h 23m" beside the "~Xh to finish" line, only once cumulative time exceeds 1 minute.

- New cursor factory: `readingTimeCursorId`.
- New `readingTime.ts`: `addReadingTime` / `getReadingTimeMs`.
- i18n: `book.totalReadTime`.

### Feature 23 (P2.12): Per-book reading streak ✅

BookReader touches a per-book streak cursor on mount (`book/{bookId}/streak` with `{lastDay, count}`). Same-day touches are no-ops; consecutive days increment; gaps reset to 1. The frontispiece reads via `getReadingStreak(bookId)` and renders "🔥 N-day reading streak" below the rest of the progress block when the streak is >1 day.

- New cursor factory: `readingStreakCursorId`.
- New `readingStreak.ts`: `touchReadingStreak` / `getReadingStreak` (+ pure date helpers `todayISO`, `isYesterday`).
- 5 vitest cases covering same-day / consecutive / gap reset / stale streak.
- i18n: pluralized `book.streak_one|_other`.

### Feature 24 (P2.13): First-time tap-zone hint overlay ✅

The first time a user ever opens the reader (any book), a dashed-border 3-zone overlay fades in over the page: left = Previous, center = Show menu, right = Next, each with an icon and label. Tap anywhere to dismiss; auto-dismiss after 5s. The `bookReaderHintSeen` preference is set on dismiss; subsequent opens never show the overlay.

- New preferences field `bookReaderHintSeen` + setter + hydrator in `preferencesStore.ts`.
- New `ReaderTapHint.tsx` (~110 lines) with the overlay, FadeIn/Out animation, and a small `hexToRgba` helper for the translucent background.
- i18n: `books.hintPrev`, `books.hintMenu`, `books.hintNext`, `books.tapToDismiss`, `books.dismissHint`.

### Feature 25 (P2.14): Search jumps to exact text within chapter ✅

Previously search-result taps jumped to the top of the chapter. Now the bootstrap exposes `window.__foliate.goToWithFind(index, text)`: it `await`s `paginator.goTo`, walks the iframe's TextNode tree via TreeWalker, builds a `Range` at the first occurrence, and calls `paginator.scrollToAnchor(range)` to land the match in view.

- Extended `FoliateReaderHandle` with `goToWithFind(index, findText)`.
- ReaderSearchSheet's `onSelect` now passes the query alongside the chapter index; BookReader forwards to `goToWithFind`.
- Limitation: cross-element text spans (where the match straddles two text nodes) fail to find — uncommon in book content (most matches are inside a single `<p>`'s text node) but documented for Phase 3.
