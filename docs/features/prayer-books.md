# Prayer Books

Ember's content distribution system. A prayer book is a self-contained package of prayers and practices, distributed as a `.pray` file (zip archive). The app ships with no bundled practices — content downloads from the `hearth/` CDN on first launch.

> See `docs/features/features-overview.md` for practice content architecture. See `docs/content/salty-book-format.md` for the broader Salty book format (will be updated to align with this spec).

---

## Motivation

Practices are currently bundled in the app binary via `require.context()`. This has served us well, but limits what's possible:

- **App size grows** with every practice added — all 41 practices ship to everyone
- **No modularity** — users can't pick which collections they want
- **No sharing** — no way for communities to create and distribute their own prayer collections
- **No updates without app releases** — fixing a typo in a prayer requires a new app build

Prayer books solve this by packaging content into downloadable, shareable `.pray` files.

---

## The `.pray` Format

A `.pray` file is a **zip archive** with the `.pray` extension. It contains everything needed to install a collection of prayers and practices:

```
my-book.pray (zip)
├── book.json                   # Book manifest
├── assets/                     # Book-level assets
│   ├── cover.jpg               #   Cover image for catalog
│   └── icon.png                #   Book icon
├── prayers/                    # Prayer asset JSONs (book-scoped)
│   ├── our-father.json
│   └── custom-prayer.json
└── practices/                  # Practice directories (unchanged format)
    ├── morning-offering/
    │   ├── manifest.json       #   Standard PracticeManifest
    │   └── flow.json
    └── stations-cross/
        ├── manifest.json
        ├── flow.json
        └── images/             #   Practice-colocated images
            ├── station-01.jpg
            └── station-02.jpg
```

**Why `.pray`?**
- Custom extension lets the OS associate it with Ember
- Tapping a `.pray` file opens Ember and triggers install
- Shareable via email, AirDrop, messaging, cloud storage
- It's just a zip — anyone can inspect or create one with standard tools

---

## Book Manifest (`book.json`)

```typescript
type PrayerBook = {
  // Required
  id: string                    // Unique book ID, kebab-case (e.g. "daily-prayers")
  version: string               // Semver (e.g. "1.0.0")
  name: LocalizedText           // Display name
  languages: string[]           // Supported languages (e.g. ["en-US", "pt-BR"])
  practices: string[]           // Ordered practice IDs (matches directory names in practices/)
  prayers: string[]             // Ordered prayer asset IDs (matches filenames in prayers/, without .json)

  // Optional
  description?: LocalizedText   // Short description for catalog
  author?: LocalizedText        // Author or community name
  icon?: string                 // Path to icon in assets/ (e.g. "assets/icon.png")
  image?: string                // Path to cover image in assets/ (e.g. "assets/cover.jpg")
  tags?: string[]               // Searchable tags (e.g. ["marian", "devotion"])
  dependencies?: string[]       // Book IDs this book depends on (for prayer asset resolution)

  defaults?: {
    autoSeed: boolean           // If true, seed practices into plan of life on install
  }
}
```

The `practices` and `prayers` arrays define the **presentation order** — the order practices appear in the catalog when browsing this book, and the order prayer assets are listed.

### Practice manifests (unchanged)

Practices inside a book use the exact same `PracticeManifest` format as today. No changes to the type. The book owns a practice by directory containment — `practices/morning-offering/manifest.json` belongs to the enclosing book. The app tracks this mapping at load time.

Practice IDs are **globally unique**. For first-party books, IDs are bare (`morning-offering`). For third-party/user books, convention is `{bookId}::{practiceId}` to avoid collisions.

Plan-of-life seeding (which practices auto-add, their tier, schedule, time) stays in each practice's `manifest.defaults` field — unchanged from today.

### Prayer assets (unchanged format)

Each prayer asset JSON file has the same format as current `assets/prayers/*.json`:

```json
{
  "title": { "en-US": "Our Father", "pt-BR": "Pai Nosso", "la": "Pater Noster" },
  "body": { "en-US": "Our Father, who art in heaven...", "pt-BR": "Pai nosso que estais nos céus...", "la": "Pater noster, qui es in caelis..." }
}
```

### Images

Practice directories can include an `images/` folder for practice-specific images (e.g., station illustrations, mystery art). Flows reference them via relative paths. Book-level assets (cover, icon) live in the top-level `assets/` folder.

---

## Prayer Asset Resolution

When the content engine encounters a prayer ref (e.g. `{ "type": "prayer", "ref": "our-father" }`), it resolves through a tiered lookup:

1. **Book-local** — check the current book's `prayers/our-father.json`
2. **Dependencies** — check each dependency book's `prayers/` in order
3. **Global pool** — common prayers available to all books

The global pool is itself a prayer book (`common-prayers`) that all books implicitly depend on. It contains the universal Catholic prayers (Sign of the Cross, Our Father, Hail Mary, Glory Be, etc.) that most books need but shouldn't duplicate.

---

## Distribution

### CDN structure (`hearth/books/`)

```
hearth/
  books/
    registry.json                       # Index of available books
    daily-prayers-1.0.0.pray            # .pray archives
    divine-office-1.0.0.pray
    catholic-devotions-1.0.0.pray
    novenas-1.0.0.pray
    catholic-formation-1.0.0.pray
    opus-dei-1.0.0.pray
```

### Registry (`registry.json`)

Lightweight catalog metadata for browsing — no need to download full `.pray` files to see what's available:

```json
{
  "version": 1,
  "books": [
    {
      "id": "daily-prayers",
      "version": "1.0.0",
      "name": { "en-US": "Catholic Daily Prayers", "pt-BR": "Orações Católicas Diárias" },
      "description": { "en-US": "The essential Catholic prayer companion", "pt-BR": "O companheiro essencial de oração católica" },
      "languages": ["en-US", "pt-BR"],
      "tags": ["default", "daily", "essential"],
      "icon": "prayer",
      "practiceCount": 23,
      "size": 150000,
      "downloadUrl": "daily-prayers-1.0.0.pray"
    }
  ]
}
```

### Download flow

1. App launch → check `installed_books` table in SQLite
2. If empty (first launch) → show loading screen, fetch `registry.json`, auto-download `daily-prayers`
3. Download `.pray` file from CDN
4. Extract zip to `FileSystem.documentDirectory/books/{bookId}/`
5. Validate book structure (valid `book.json`, all declared practices present)
6. Insert row in `installed_books` table
7. Register content source in `ContentRegistry`
8. If `book.defaults.autoSeed` → seed practices into user's plan of life

### On-device storage

```
[documentDirectory]/
  books/
    daily-prayers/
      book.json
      assets/
      prayers/
      practices/
    divine-office/
      book.json
      practices/
```

---

## Content Resolution

### ContentRegistry

Replaces direct imports from `@/content/practices`. Same API surface, but resolves across all installed books:

```typescript
// Current:
import { getManifest, loadFlowForSlot } from '@/content/practices'

// New:
import { getManifest, loadFlowForSlot } from '@/content/registry'
```

The registry aggregates all installed books' practices into a unified view. Functions like `getAllManifests()`, `searchManifests()`, `getManifestCategories()` work across all books. Functions like `getManifest(id)` find the practice in whichever book contains it.

### EngineContext

`createEngineContext()` accepts a `bookId` to enable scoped prayer resolution:

```typescript
function createEngineContext(bookId?: string): EngineContext {
  const prayers = {
    ...getGlobalPrayers(),
    ...getDependencyPrayers(bookId),
    ...getBookPrayers(bookId),       // Book-local overrides
  }
  return { ...currentFields, prayers }
}
```

---

## App Lifecycle

### First launch

1. Show a loading/welcome screen ("Setting up your prayer life...")
2. Fetch `registry.json` from CDN
3. Download and install `daily-prayers` book
4. Seed default practices into plan of life
5. Navigate to home screen

Requires network connectivity on first launch.

### Install

1. Download `.pray` from CDN (or receive via file sharing)
2. Extract to local storage
3. Validate structure
4. Insert `installed_books` row
5. Register content source
6. Optionally seed practices into plan

### Update

1. Registry shows newer version available
2. Download new `.pray` to temp directory
3. Replace old version atomically
4. Update `installed_books` version
5. User data (completions, cursors, slots) is unaffected — keyed by `practice_id`, which doesn't change between versions

### Uninstall

1. Unregister content source
2. Delete book files from local storage
3. Delete `installed_books` row
4. User data is **orphaned but NOT deleted** — if the book is reinstalled, data reattaches
5. Plan of life shows orphaned practices with a "book removed" indicator
6. Optional: "purge orphaned data" action in settings

---

## Database

New table (migration `0003_books.sql`):

```sql
CREATE TABLE IF NOT EXISTS installed_books (
  book_id      TEXT PRIMARY KEY NOT NULL,
  version      TEXT NOT NULL,
  installed_at INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  manifest     TEXT NOT NULL    -- full book.json stored as JSON string
);
```

---

## `.pray` File Sharing (Future)

1. User creates a prayer book (via practice builder or manual assembly)
2. Export as `.pray` file
3. Share via system share sheet (email, AirDrop, Messages, cloud storage)
4. Recipient taps `.pray` file → OS opens Ember (registered file association)
5. Ember validates and installs the book
6. Book appears in the user's catalog

### Validation on import

- Must contain `book.json` with valid `PrayerBook` schema
- All practices listed in `book.json.practices` must have directories in `practices/`
- All prayer refs in flows must resolve (within book or declared dependencies)
- Reject if book ID conflicts with already-installed book (prompt to update instead)
