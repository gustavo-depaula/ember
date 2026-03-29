# Bible Reader

## Overview

A standalone Bible reader for browsing and reading Scripture outside the Divine Office. Single-screen experience with drawer-based navigation: tap the book name to open a book list from the left, tap the chapter number to open a chapter list from the right. Supports the bundled Douay-Rheims and online translations via Bolls.life API. Designed for contemplative, devotional reading with the app's manuscript aesthetic.

Independent from the Divine Office lectio continua — the reader is free-form browsing. An optional "mark as read" button lets users sync a chapter to their Office progress if desired.

---

## Navigation

The Bible reader is a **single screen** (`/bible/`) with two overlay drawers. The reader content stays visible (dimmed) behind the drawers.

### Header Bar

- **Left:** Book name with chevron-down (e.g. "Genesis ∨") — tappable, opens book drawer
- **Right:** Chapter number (e.g. "1") — tappable, opens chapter drawer

### Book Drawer (slides from left)

- Covers ~60% of the screen width, reader content dimmed behind
- Header row: translation badge — rounded square with language code (e.g. `[EN] DRB`), tapping opens translation selector modal
- Scrollable list of all books (73 for Catholic translations, 66 for Protestant)
- Current book is highlighted (bold / accent color)
- Books listed in canonical order — no category grouping needed since the list is scannable
- Tapping a book selects it, closes the drawer, and loads chapter 1 of that book

### Translation Selector (modal overlay)

- Full-screen modal that slides up over the reader (`presentationStyle: pageSheet`)
- **Header:** "Translations" title with close (X) button
- **Suggested Bibles section:** Curated list of ~8 Catholic-friendly translations with descriptions, language badges, and checkmark for selected
- **All Translations section:** Full Bolls.life catalog grouped by language, fetched from API (cached indefinitely via TanStack Query)
- Each row shows: language badge (2-letter code in rounded square), translation code (bold), full name, optional description
- Selecting a translation updates the global preference, closes the modal, and reloads content
- Also accessible from the Settings page

### Chapter Drawer (slides from right)

- Narrow column (~20% of screen width), reader content dimmed behind
- Vertical list of chapter numbers for the current book
- Current chapter is highlighted (accent color)
- Tapping a chapter selects it and closes the drawer
- Numbers large enough for easy tapping (~44pt tap targets)

### Chapter Reader (main content)

- `ScreenLayout` with generous padding
- "Book Name Chapter#" centered heading with ornamental rule below
- Verses rendered as paragraphs with superscript verse numbers in muted color
- `OrnamentalRule` at bottom
- Previous/Next chapter navigation at footer — transitions across book boundaries
- "Mark as read" subtle text button (uses existing `useToggleChapterRead` from divine-office hooks)
- Offline fallback banner when showing DRB instead of requested translation

---

## Route Structure

Single route — drawers are local component state, not separate routes:

```
src/app/bible/
  _layout.tsx               — Stack navigator
  index.tsx                 — Bible reader screen (thin, delegates to BibleReader component)
```

URL: `/bible/` — book and chapter tracked in `bibleStore`, not the URL

---

## Feature Structure

```
src/features/bible/
  index.ts                  — barrel exports
  hooks.ts                  — useBooks, useChapter, usePrefetchChapters
  bookCategories.ts         — canonical book order + display names
  components/
    index.ts
    BibleReader.tsx          — main screen: header + reader + drawers
    BookDrawer.tsx           — left sliding drawer with book list
    ChapterDrawer.tsx        — right sliding drawer with chapter numbers
    ChapterContent.tsx       — verse rendering with superscript numbers
    ReaderHeader.tsx         — book name (left) + chapter number (right) bar
    ChapterNav.tsx           — prev/next chapter footer buttons
    TranslationPill.tsx      — translation badge (rounded square with language code) in book drawer
    TranslationModal.tsx     — full-screen translation selector modal (suggested + all translations)
```

---

## State

### `bibleStore` (Zustand + AsyncStorage)

```typescript
type BibleStoreState = {
  bookId: string              // current book slug (default: 'genesis')
  chapter: number             // current chapter (default: 1)
  hydrated: boolean
  setPosition(bookId: string, chapter: number): void
  hydrate(): Promise<void>
}
```

Persists current position to AsyncStorage. Restored on next visit — acts as both "last read" and current position. Separate from Office `reading_progress` table.

Translation preference is shared via `preferencesStore.translation` (already exists).

### Drawer State (local component state)

```typescript
// Inside BibleReader.tsx
const [bookDrawerOpen, setBookDrawerOpen] = useState(false)
const [chapterDrawerOpen, setChapterDrawerOpen] = useState(false)
```

Drawers are local UI state — no persistence needed.

---

## Data Flow

Reuses existing infrastructure — no new tables or migrations:

- **Book list:** `getBooks(translation)` from `src/lib/content.ts`
- **Chapter text:** `getChapter(translation, bookId, chapter)` from `src/lib/content.ts`
- **Online caching:** `cached_translations` SQLite table (already exists)
- **Office progress:** `useAllReadingProgress()` + `useToggleChapterRead()` from divine-office hooks (read-only, optional write)
- **Translation list:** `suggestedTranslations` (curated) + `fetchAllTranslations()` (full API catalog) from `src/lib/bolls.ts`

### TanStack Query keys

```
['bible', 'books', translation]
['bible', 'chapter', translation, bookId, chapter]
```

Adjacent chapters (prev/next) are prefetched when a chapter loads.

---

## Drawer Animation

Use `react-native-reanimated` (already in the project) for smooth drawer slides:

- **Book drawer:** translates from `x: -screenWidth * 0.6` to `x: 0`, duration ~250ms
- **Chapter drawer:** translates from `x: screenWidth` to `x: screenWidth * 0.8`, duration ~250ms
- **Backdrop:** animated opacity 0 → 0.5 (dark overlay on the reader content)
- Tap backdrop to dismiss
- Optional: swipe-to-dismiss gesture

---

## Home Screen Integration

Add a third `NavigationMedallion` for the Bible — full-width row below the existing 2-column Office + Plan row:

```tsx
<NavigationMedallion
  icon="book"
  title="Sacred Scripture"
  subtitle="Read the Bible"
  onPress={() => router.push('/bible')}
/>
```

Reuses the existing `book` icon from `WatercolorIcon`. A dedicated scripture icon can be added later.

---

## Ribbon Bookmark

Add a fourth ribbon to `RibbonBookmarks`:

```typescript
{ path: '/bible', label: 'Bible', color: '#1B3A5C' }  // deep manuscript blue
```

---

## Future Enhancements (not in MVP)

- **Bookmarks** — save favorite verses/chapters to revisit
- **Highlights & notes** — highlight verses with colors, add personal notes
- **Full-text search** — FTS5 index over bundled DRB
- **Swipe gestures** — horizontal swipe for prev/next chapter
- **Verse sharing** — copy/share individual verses
- **Cross-references** — link related passages
- ~~**Font size control**~~ — implemented as shared reading config (see `reading-config.md`)
