# Library

Ember's content distribution system. A library is a self-contained package of prayers and practices, distributed as a `.pray` file (zip archive). The app ships with no bundled practices — content downloads from hearth on first launch.

> See `docs/features/features-overview.md` for practice content architecture. See `docs/content/salty-book-format.md` for the broader Salty book format (will be updated to align with this spec).

---

## Motivation

Practices were originally bundled in the app binary. This limited what was possible:

- **App size grew** with every practice added — all practices shipped to everyone
- **No modularity** — users couldn't pick which collections they wanted
- **No sharing** — no way for communities to create and distribute their own prayer collections
- **No updates without app releases** — fixing a typo in a prayer required a new app build

Libraries solved this by packaging content into downloadable, shareable `.pray` files. This system is now implemented and is the primary content distribution mechanism. See `docs/ARCHITECTURE.md` for the current architecture.

---

## The `.pray` Format

A `.pray` file is a **zip archive** with the `.pray` extension:

```
my-library.pray (zip)
├── library.json                # Library manifest
├── assets/                     # Library-level assets
│   ├── cover.jpg               #   Cover image for catalog
│   └── icon.png                #   Library icon
├── prayers/                    # Prayer asset JSONs (library-scoped)
│   ├── our-father.json
│   └── custom-prayer.json
├── chapters/                   # Read-only chapter content
│   ├── history-of-devotion/
│   │   ├── chapter.json        #   ChapterManifest
│   │   ├── content.json        #   FlowDefinition (same format as practice flows)
│   │   ├── sections/           #   Prose markdown files (per-language)
│   │   │   ├── origins.en-US.md
│   │   │   └── origins.pt-BR.md
│   │   └── images/             #   Chapter-colocated images
│   │       └── painting.jpg
│   └── saints/
│       ├── chapter.json
│       ├── content.json
│       └── sections/
│           ├── bio.en-US.md
│           └── bio.pt-BR.md
├── books/                      # Long-form prose books
│   └── book-title/
│       ├── book.json           #   Book metadata (name, author, toc, languages)
│       ├── en-US/
│       │   ├── chapter-01.html
│       │   ├── images/
│       │   └── style.css
│       ├── pt-BR/
│       │   └── *.html
│       └── fr-FR/
│           └── *.md            #   Shipped raw, converted at runtime
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

Books allow a `.pray` package to bundle full prose works alongside prayers and practices — e.g., a Montfort Spirituality package with *True Devotion to Mary* (book) plus the 33-day Consecration practice and prayers. Raw HTML or markdown chapters live in the repo at `content/libraries/{libraryId}/books/{bookId}/{lang}/` and are shipped directly in the `.pray` archive. Markdown files (`.md`) are converted at runtime using `marked` + `marked-footnote` — no pandoc dependency at build time.

**Why `.pray`?**
- Custom extension lets the OS associate it with Ember
- Tapping a `.pray` file opens Ember and triggers install
- Shareable via email, AirDrop, messaging, cloud storage
- It's just a zip — anyone can inspect or create one with standard tools

---

## Library Manifest (`library.json`)

```typescript
type Library = {
  // Required
  id: string                    // Unique library ID, kebab-case (e.g. "daily-prayers")
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
  chapters?: string[]           // Ordered chapter IDs (matches directory names in chapters/)
  books?: string[]              // Ordered book IDs (matches directory names in books/)
  contents?: { type: 'chapter' | 'practice' | 'book'; id: string }[]  // Unified table of contents

  defaults?: {
    autoSeed: boolean           // If true, seed practices into plan of life on install
  }
}
```

The `practices` and `prayers` arrays define **presentation order** — the order items appear when browsing this library.

When `contents` is present, the library detail screen renders a unified table of contents interleaving chapters and practices in the specified order. When absent, the screen falls back to separate practices/prayers sections.

### Practice manifests (unchanged)

Practices inside a library use the exact same `PracticeManifest` format. The library owns a practice by directory containment. The app tracks the practice-to-library mapping at load time.

Practice IDs are **globally unique**. First-party IDs are bare (`morning-offering`). Third-party convention: `{libraryId}::{practiceId}`.

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

Practice directories can include an `images/` folder (e.g. station illustrations, mystery art). Flows reference them via relative paths. Library-level assets (cover, icon) live in `assets/`.

### Chapters

Chapters are **read-only content entries** — history, theology, saint biographies, art galleries — that enrich a library beyond its interactive practices. They reuse the existing `FlowDefinition` format but have no completion tracking, scheduling, or plan-of-life integration.

#### Chapter manifest (`chapter.json`)

```typescript
type ChapterManifest = {
  id: string                    // Unique within the library (e.g. "history-of-devotion")
  title: LocalizedText          // Display title
  subtitle?: LocalizedText      // Optional subtitle
  image?: string                // Cover image path (relative to chapter dir)
  estimatedMinutes?: number     // Reading time estimate
  tags?: string[]               // Searchable tags
}
```

#### Chapter content (`content.json`)

Same `{ sections: FlowSection[] }` format as practice flows. Chapters can use all standard section types plus three chapter-specific types:

| Type | Purpose |
|------|---------|
| `prose` | External markdown file reference (`{ type: 'prose', file: 'sections/intro' }`). Engine resolves `{file}.{lang}.md` from the chapter's directory. |
| `gallery` | Horizontal image carousel with title, attribution, and caption per item. |
| `holy-card` | Interactive devotional card with 3D flip animation, holographic overlay, and ornamental framing — same architecture as saint cards. Front shows a devotional image; back shows a prayer with ornamental cross and gold dividers. |

Standard types (heading, subheading, divider, rubric, prayer, image, etc.) also work in chapters.

#### Prose files

Prose content lives in `sections/` as per-language markdown files:

```
chapters/history-of-devotion/sections/
  origins.en-US.md
  origins.pt-BR.md
  spread.en-US.md
  spread.pt-BR.md
```

The `prose` section type references files without extension or language suffix: `{ "type": "prose", "file": "sections/origins" }`. The engine resolves the correct language at render time.

Prose files support a minimal markdown subset: paragraphs, headings (`#`/`##`/`###`), `**bold**`, `*italic*`, and `> blockquotes`. No external markdown library — content is curated.

#### Image path resolution

Image `src` values in gallery/holy-card/image sections are relative to the chapter directory. During loading, paths are rewritten to absolute file URIs so the renderer gets resolved paths.

#### Chapter reader

Route: `/library/chapters/[chapterId]?libraryId=x`

The chapter reader resolves content through `resolveFlow()` with a simplified context (no completion tracking) and renders sections in a `ScrollView` with `ManuscriptFrame` + `SectionBlock`. No completion button — chapters are purely for reading.

---

## Prayer Asset Resolution

Each `.pray` package is **self-contained**. Cross-library prayer refs use qualified IDs in source flow.json — e.g., `"ref": "ember-default:sign-of-cross"`. At build time, `scripts/vendor-prayers.py` resolves these: copies the prayer file into the package and strips the library prefix so the built package has bare refs.

At runtime, when the content engine encounters `{ "type": "prayer", "ref": "our-father" }`:

1. **Library-local** — current library's `prayers/` (includes vendored prayers)
2. **Global pool** — fallback across all installed libraries

---

## Distribution via Hearth

Libraries are served from hearth alongside existing content (Bible, propers, catechism).

### Source (committed)

Library source directories live in `content/libraries/`:

```
content/libraries/
  ember-default/
    library.json
    prayers/...
    practices/...
  ember-extra/
    library.json
    practices/...
```

### Build (deploy workflow)

`.pray` files are **not committed** — built during the GitHub Actions deploy:

1. Zip each `content/libraries/{id}/` into `{id}-{version}.pray` (version read from `library.json`)
2. Generate `registry.json` from all `library.json` files
3. Output to `_site/hearth/v1/libraries/`

### URLs

```
https://ember.dpgu.me/hearth/v1/libraries/registry.json
https://ember.dpgu.me/hearth/v1/libraries/ember-default-1.0.0.pray
https://ember.dpgu.me/hearth/v1/libraries/ember-extra-1.0.0.pray
```

### Registry (`registry.json`)

Lightweight metadata for catalog browsing:

```json
{
  "version": 1,
  "libraries": [
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

Replaces direct imports from `@/content/practices`. Same API, resolves across installed libraries:

```typescript
import { getManifest, loadFlowForSlot } from '@/content/registry'
```

The registry aggregates all installed libraries into a unified view. `getAllManifests()` returns practices from all libraries. `getManifest(id)` finds the practice in whichever library contains it.

### EngineContext

`createEngineContext()` accepts a `libraryId` for scoped prayer resolution. Since packages are self-contained, library-local prayers include vendored ones. The global pool is a fallback across all installed libraries.

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
2. Extract zip to `documentDirectory/books/{libraryId}/`
3. Validate (library.json present, declared practices exist)
4. Insert `installed_books` row
5. Register as content source
6. If `autoSeed` → seed practices into plan

### Update

1. Registry shows newer version available
2. Download new `.pray`, replace atomically
3. Update `installed_books` version
4. User data unaffected (keyed by practice_id)

### Uninstall

1. Delete library files from local storage
2. Delete `installed_books` row
3. User data is **orphaned but NOT deleted** — reinstalling reattaches it
4. Plan of life shows orphaned practices with a "library removed" indicator

---

## Database

The `installed_books` table is part of the unified schema in `apps/app/src/db/migrations/0001_initial.sql`:

```sql
CREATE TABLE IF NOT EXISTS installed_books (
  book_id      TEXT PRIMARY KEY NOT NULL,
  version      TEXT NOT NULL,
  installed_at INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  manifest     TEXT NOT NULL,
  content_hash TEXT
);
```

---

## UI

### Entry point

Accessible from the Plan of Life screen (button/link navigates to `/library`).

### Library screen (`/library`)

- **Installed** section — cards for each installed library (icon, name, practice count, version, status badge)
- **Available** section — libraries from registry not yet installed, with download size + download button
- **Import .pray file** — dashed border card, opens file picker
- Download progress shown inline on cards

### Library detail screen (`/library/[libraryId]`)

- Library description
- If `contents` array present: unified "Contents" section interleaving chapters (BookOpen icon) and practices in defined order. Chapters navigate to `/library/chapters/[chapterId]`, practices to `/practices/[manifestId]`.
- If `contents` absent: ordered practice list + prayers section (legacy layout)
- "In plan" badges on practices
- Download button (if not installed) or Remove button (if installed)

---

## Local `.pray` Import

Two import methods:

### File picker

From the Library screen, tap "Import .pray file" → system file picker filtered to `.pray` → validate → install.

### OS file association

Register Ember as handler for `.pray` files (iOS UTI, Android intent filter). Tapping a `.pray` received via email, AirDrop, messaging, etc. opens Ember and triggers the import flow.

### Import flow

1. Copy `.pray` to temp directory
2. Extract and validate:
   - `library.json` present and valid
   - All declared practices have directories
3. If library ID conflicts with installed library → prompt to update
4. Show library detail as preview with "Install" button
5. On install → move to `books/`, insert DB row, register

---

## Open Questions

- **Offline first launch**: Currently requires connectivity on first launch. Should we bundle a minimal fallback library?
- **Background updates**: Auto-check for library updates on launch, or only when user visits Library screen?
- **Library removal protection**: Should ember-default be unremovable?
