# Catechism Reader

## Overview

A standalone reader for browsing the Catechism of the Catholic Church (CCC) outside the Divine Office. Same three-panel sliding drawer UX as the Bible reader, adapted for the CCC's richer hierarchy. The left drawer shows a collapsible table of contents (Parts > Chapters/Articles), the right drawer lists sections within the current chapter, and the center panel displays one section's paragraphs at a time. Fully offline — reads from the bundled `ccc.json`.

Independent from the Divine Office lectio continua — the reader is free-form browsing. The daily Compline reading advances separately through its own progress tracker.

---

## CCC Structure

The bundled `ccc.json` contains 2,865 numbered paragraphs. Each paragraph has:

```json
{
  "number": 1,
  "text": "God, infinitely perfect and blessed in himself...",
  "section": "I. The life of man - to know and love God",
  "breadcrumb": ["PROLOGUE", "I. The life of man - to know and love God"]
}
```

The CCC hierarchy has 5 levels:

| Level | Role | Count | Example |
|-------|------|-------|---------|
| Part | Top-level division | 5 | PROLOGUE, PART ONE...FOUR |
| Section | Major subdivision | 14 | "SECTION ONE 'I BELIEVE'" |
| Chapter | Thematic grouping | ~25 | "CHAPTER ONE MAN'S CAPACITY FOR GOD" |
| Article | Teaching unit | ~84 | "Article 1 THE REVELATION OF GOD" |
| Sub-section | Leaf heading | ~309 | "I. The Desire for God", "IN BRIEF" |

### "Segment" — the reading unit

A **segment** is a contiguous group of paragraphs sharing the same `section` field value. There are ~368 segments (some section names like "IN BRIEF" repeat at different positions in the CCC but form distinct segments because other sections appear between them).

| Stat | Value |
|------|-------|
| Total segments | ~368 |
| Median paragraphs per segment | 5 |
| Mean paragraphs per segment | 7.8 |
| Max paragraphs in a segment | ~75 |

Segments are the natural reading unit — short enough to read in one sitting, long enough to convey a complete thought.

---

## Navigation

The Catechism reader is a **single screen** (`/catechism/`) with two overlay drawers, mirroring the Bible reader's three-panel sliding strip.

### Header Bar

- **Left:** Current section name (abbreviated if long) with chevron-down — tappable, opens TOC drawer
- **Right:** Paragraph range (e.g. "27–30") — tappable, opens section drawer

### TOC Drawer (slides from left)

- Covers ~70% of screen width, reader content dimmed behind
- Shows the 5 Parts as section headers (always visible, styled as category labels)
- Under each Part, shows the Chapters/Articles as tappable items:
  - Parts One through Four: show Chapters and top-level Articles (~4–8 items per Part)
  - Prologue: shows its 6 direct sub-sections (no Chapter level)
- Tapping a Part expands/collapses its children
- The current segment's parent Chapter is highlighted (bold / accent color)
- Auto-expands the Part containing the current segment on open
- Tapping a Chapter selects it (navigates to its first segment) and closes the drawer

### Section Drawer (slides from right)

- Covers ~55% of screen width — wider than the Bible's chapter drawer because it shows section names alongside paragraph numbers
- Lists all segments within the current Chapter
- Each row: starting paragraph number (bold, left) + abbreviated section name (secondary, right)
- Current segment is highlighted (accent color)
- Tapping a segment selects it and closes the drawer
- Example for "Chapter One: Man's Capacity for God":

```
 27   The Desire for God
 31   Ways of Coming to Know God
 36   The Knowledge of God...
 39   How Can We Speak about God?
 44   IN BRIEF
```

### Segment Reader (main content)

- `ScreenLayout` with generous padding
- Breadcrumb trail at top in muted color (e.g. "Part One > Section One > Chapter One")
- Section name as centered heading with `OrnamentalRule` below
- Paragraphs with bold CCC numbers in superscript muted color, same style as verse numbers in Bible reader
- `OrnamentalRule` at bottom
- Previous/Next segment navigation at footer

---

## Route Structure

Single route — drawers are local component state, not separate routes:

```
src/app/catechism/
  _layout.tsx               — Stack navigator (headerShown: false)
  index.tsx                 — Catechism screen (thin, delegates to CatechismReader component)
```

URL: `/catechism/` — segment position tracked in `catechismStore`, not the URL.

---

## Feature Structure

```
src/features/catechism/
  index.ts                  — barrel exports
  segments.ts               — buildSegments() from ccc.json, segment types
  hooks.ts                  — useSegments, useSegment, usePrefetchAdjacentSegments
  components/
    index.ts
    CatechismReader.tsx     — main screen: header + reader + drawers (adapted from BibleReader)
    TocTree.tsx             — collapsible TOC tree for left drawer
    SegmentList.tsx         — section list for right drawer
    SegmentContent.tsx      — paragraph rendering with breadcrumb + section title
    CatechismHeader.tsx     — section name (left) + paragraph range (right) bar
    SegmentNav.tsx          — prev/next segment footer buttons
```

---

## State

### `catechismStore` (Zustand + AsyncStorage)

```typescript
type CatechismState = {
  paragraph: number             // starting paragraph of current segment (default: 1)
  hydrated: boolean
  setParagraph(paragraph: number): void
  hydrate(): Promise<void>
}
```

Persists the starting paragraph number of the current segment to AsyncStorage. Restored on next visit. On hydration, the segment containing that paragraph number is resolved from the precomputed segment index.

### Drawer State (local component state)

```typescript
// Inside CatechismReader.tsx — same pattern as BibleReader
const [panelOpen, setPanelOpen] = useState(false)
```

Drawers are local UI state — no persistence needed.

---

## Data Flow

### Segment Index

A new module `src/features/catechism/segments.ts` builds the segment index at first access:

```typescript
type CccSegment = {
  index: number               // 0-based position in segments array
  section: string             // leaf section name (e.g. "I. The Desire for God")
  breadcrumb: string[]        // full breadcrumb path
  startParagraph: number      // first CCC paragraph number
  endParagraph: number        // last CCC paragraph number
  paragraphCount: number
}
```

Built from `ccc.json` by grouping contiguous paragraphs with the same `section` value. Computed once, cached in memory. Pure and deterministic.

### Shared CCC loader

Extract `loadCcc()` from `src/features/divine-office/engine.ts` into `src/lib/catechism.ts` so both the divine-office and catechism features import from the same shared module:

```typescript
// src/lib/catechism.ts
export type CccParagraph = { number: number; text: string; section: string; breadcrumb: string[] }
export function loadCcc(): CccParagraph[]
export function getCccParagraphs(start: number, count: number): CccParagraph[]
```

### TanStack Query keys

```
['catechism', 'segments']                    — full segment index
['catechism', 'segment', startParagraph]     — paragraphs for one segment
```

All data is bundled JSON loaded via `require()`, so queries resolve instantly. Wrapping in `useQuery` with `staleTime: Infinity` provides the same loading-state pattern as the Bible reader.

Adjacent segments (prev/next) are prefetched when a segment loads.

---

## Drawer Animation

Same mechanism as Bible reader — `react-native-reanimated` with `GestureDetector`:

- **TOC drawer:** translates from left, spring config `{ damping: 24, stiffness: 200, mass: 0.8 }`
- **Section drawer:** translates from right, same spring config
- **Backdrop:** animated opacity dimming on the reader content
- Tap backdrop or swipe to dismiss
- Opening requires commitment (40% threshold or 800 velocity); closing is easy (20px drag or 300 velocity)

The TOC drawer width is ~70% of screen (same as Bible book drawer). The section drawer is ~55% (wider than Bible's 22% to accommodate section names).

---

## Home Screen Integration

Place the Catechism and Bible medallions side by side in a 2-column row:

```tsx
<XStack gap="$md">
  <YStack flex={1}>
    <NavigationMedallion
      icon="cross"
      title="Sacred Scripture"
      subtitle="Read the Bible"
      onPress={() => router.push('/bible')}
    />
  </YStack>
  <YStack flex={1}>
    <NavigationMedallion
      icon="book"
      title="Catechism"
      subtitle="Read the CCC"
      onPress={() => router.push('/catechism')}
    />
  </YStack>
</XStack>
```

---

## Ribbon Bookmark

Add a fifth ribbon to `RibbonBookmarks`:

```typescript
{ path: '/catechism', label: 'Catechism', color: '#7B2D3B' }  // burgundy
```

---

## Root Layout

Hydrate `catechismStore` alongside `bibleStore` in `src/app/_layout.tsx`:

```typescript
useCatechismStore().hydrate()
```

---

## Edge Cases

- **Prologue** has no Chapters — the TOC tree shows its 6 direct sub-sections as the expandable items under the Prologue header.
- **Single-paragraph segments** (e.g. structural markers like "CHAPTER TWO GOD COMES TO MEET MAN") render with full header/footer chrome. These serve as orientation markers.
- **"IN BRIEF" sections** appear ~59 times with the same name. They are disambiguated by their position in the segment array and their starting paragraph number, which is always unique.
- **Long segments** (up to ~75 paragraphs) render in full within a `ScrollView`. Comparable to long Bible chapters.

---

## Future Enhancements (not in MVP)

- **Full-text search** — FTS5 index over CCC paragraphs
- **Cross-references** — link CCC paragraphs to cited Scripture passages
- **Bookmarks** — save favorite paragraphs to revisit
- ~~**Font size control**~~ — implemented as shared reading config (see `reading-config.md`)
- **Sync with Office** — option to jump to the current Compline reading position
- **Paragraph sharing** — copy/share individual CCC paragraphs
