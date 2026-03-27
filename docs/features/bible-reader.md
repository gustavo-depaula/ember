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
- Header row: translation pill (e.g. "DRB") showing current translation
- Scrollable list of all 73 books
- Current book is highlighted (bold / accent color)
- Books listed in canonical order — no category grouping needed since the list is scannable
- Tapping a book selects it, closes the drawer, and loads chapter 1 of that book

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
- `DropCap` on the first verse of each chapter
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
    ChapterContent.tsx       — verse rendering with DropCap + superscript numbers
    ReaderHeader.tsx         — book name (left) + chapter number (right) bar
    ChapterNav.tsx           — prev/next chapter footer buttons
    TranslationPill.tsx      — small translation selector in book drawer
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
- **Translation list:** `availableTranslations` from `src/lib/bolls.ts`

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
- **Font size control** — adjustable text size in the reader
