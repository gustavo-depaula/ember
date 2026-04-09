# Prayer Books

Ember's content distribution system. A prayer book is a self-contained package of prayers and practices, distributed as a `.pray` file (zip archive). The app ships with no bundled practices — content downloads from hearth on first launch.

> See `docs/features/features-overview.md` for practice content architecture. See `docs/content/salty-book-format.md` for the broader Salty book format (will be updated to align with this spec).

---

## Motivation

Practices are currently bundled in the app binary via `require.context()`. This limits what's possible:

- **App size grows** with every practice added — all 41 practices ship to everyone
- **No modularity** — users can't pick which collections they want
- **No sharing** — no way for communities to create and distribute their own prayer collections
- **No updates without app releases** — fixing a typo in a prayer requires a new app build

Prayer books solve this by packaging content into downloadable, shareable `.pray` files.

---

## The `.pray` Format

A `.pray` file is a **zip archive** with the `.pray` extension:

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

The `practices` and `prayers` arrays define **presentation order** — the order items appear when browsing this book.

### Practice manifests (unchanged)

Practices inside a book use the exact same `PracticeManifest` format. The book owns a practice by directory containment. The app tracks the practice-to-book mapping at load time.

Practice IDs are **globally unique**. First-party IDs are bare (`morning-offering`). Third-party convention: `{bookId}::{practiceId}`.

Seeding config (tier, schedule, time) stays in each practice's `manifest.defaults`.

### Prayer assets (unchanged format)

Same format as current `assets/prayers/*.json`:

```json
{
  "title": { "en-US": "Our Father", "pt-BR": "Pai Nosso", "la": "Pater Noster" },
  "body": { "en-US": "Our Father, who art in heaven...", "pt-BR": "Pai nosso que estais nos céus...", "la": "Pater noster, qui es in caelis..." }
}
```

### Images

Practice directories can include an `images/` folder (e.g. station illustrations, mystery art). Flows reference them via relative paths. Book-level assets (cover, icon) live in `assets/`.

---

## Prayer Asset Resolution

When the content engine encounters `{ "type": "prayer", "ref": "our-father" }`:

1. **Book-local** — current book's `prayers/`
2. **Dependencies** — each dependency book's `prayers/`, in order
3. **Global pool** — common prayers available to all books

The global pool is itself a prayer book (e.g. `common-prayers`) that all books implicitly depend on, containing universal Catholic prayers (Sign of the Cross, Our Father, Hail Mary, Glory Be, etc.).

---

## Distribution via Hearth

Prayer books are served from hearth alongside existing content (Bible, propers, catechism).

### Source (committed)

Book source directories live in `content/books/`:

```
content/books/
  ember-default/
    book.json
    prayers/...
    practices/...
  ember-extra/
    book.json
    practices/...
```

### Build (deploy workflow)

`.pray` files are **not committed** — built during the GitHub Actions deploy:

1. Zip each `content/books/{id}/` into `{id}-{version}.pray` (version read from `book.json`)
2. Generate `registry.json` from all `book.json` files
3. Output to `_site/hearth/v1/books/`

### URLs

```
https://ember.dpgu.me/hearth/v1/books/registry.json
https://ember.dpgu.me/hearth/v1/books/ember-default-1.0.0.pray
https://ember.dpgu.me/hearth/v1/books/ember-extra-1.0.0.pray
```

### Registry (`registry.json`)

Lightweight metadata for catalog browsing:

```json
{
  "version": 1,
  "books": [
    {
      "id": "ember-default",
      "version": "1.0.0",
      "name": { "en-US": "Catholic Daily Prayers", "pt-BR": "Orações Católicas Diárias" },
      "description": { "en-US": "The essential Catholic prayer companion" },
      "languages": ["en-US", "pt-BR"],
      "tags": ["default"],
      "practiceCount": 23,
      "size": 150000,
      "file": "ember-default-1.0.0.pray"
    }
  ]
}
```

---

## Content Resolution

### ContentRegistry

Replaces direct imports from `@/content/practices`. Same API, resolves across installed books:

```typescript
import { getManifest, loadFlowForSlot } from '@/content/registry'
```

The registry aggregates all installed books into a unified view. `getAllManifests()` returns practices from all books. `getManifest(id)` finds the practice in whichever book contains it.

### EngineContext

`createEngineContext()` accepts a `bookId` for scoped prayer resolution:

```typescript
function createEngineContext(bookId?: string): EngineContext {
  const prayers = {
    ...getGlobalPrayers(),
    ...getDependencyPrayers(bookId),
    ...getBookPrayers(bookId),
  }
  return { ...currentFields, prayers }
}
```

---

## App Lifecycle

### First launch

1. Show loading screen ("Setting up your prayer life...")
2. Fetch `registry.json`
3. Download and install `ember-default`
4. Seed practices into plan of life
5. Navigate to home

Requires connectivity on first launch.

### Install

1. Download `.pray` from hearth (or receive via local import)
2. Extract zip to `documentDirectory/books/{bookId}/`
3. Validate (book.json present, declared practices exist)
4. Insert `installed_books` row
5. Register as content source
6. If `autoSeed` → seed practices into plan

### Update

1. Registry shows newer version available
2. Download new `.pray`, replace atomically
3. Update `installed_books` version
4. User data unaffected (keyed by practice_id)

### Uninstall

1. Delete book files from local storage
2. Delete `installed_books` row
3. User data is **orphaned but NOT deleted** — reinstalling reattaches it
4. Plan of life shows orphaned practices with a "book removed" indicator

---

## Database

New migration `0003_books.sql`:

```sql
CREATE TABLE IF NOT EXISTS installed_books (
  book_id      TEXT PRIMARY KEY NOT NULL,
  version      TEXT NOT NULL,
  installed_at INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  manifest     TEXT NOT NULL
);
```

---

## UI

### Entry point

Accessible from the Plan of Life screen (button/link navigates to `/prayer-books`).

### Prayer Books screen (`/prayer-books`)

- **Installed** section — cards for each installed book (icon, name, practice count, version, status badge)
- **Available** section — books from registry not yet installed, with download size + download button
- **Import .pray file** — dashed border card, opens file picker
- Download progress shown inline on cards

### Book detail screen (`/prayer-books/[bookId]`)

- Book description
- Ordered practice list (taps into existing `/practices/[manifestId]`)
- "In plan" badges on practices
- Download button (if not installed) or Remove button (if installed)

---

## Local `.pray` Import

Two import methods:

### File picker

From the Prayer Books screen, tap "Import .pray file" → system file picker filtered to `.pray` → validate → install.

### OS file association

Register Ember as handler for `.pray` files (iOS UTI, Android intent filter). Tapping a `.pray` received via email, AirDrop, messaging, etc. opens Ember and triggers the import flow.

### Import flow

1. Copy `.pray` to temp directory
2. Extract and validate:
   - `book.json` present and valid
   - All declared practices have directories
3. If book ID conflicts with installed book → prompt to update
4. Show book detail as preview with "Install" button
5. On install → move to `books/`, insert DB row, register

---

## Open Questions

- **Offline first launch**: If no connectivity on first launch, show "No connection — try again" or bundle a minimal fallback?
- **Background updates**: Auto-check for book updates on launch, or only when user visits Prayer Books screen?
- **Book removal protection**: Should the default book be unremovable?
- **Cross-book practice references**: Can a flow in one book reference a practice from another?
