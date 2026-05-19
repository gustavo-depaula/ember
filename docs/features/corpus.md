# Content & Collections (Hearth v2)

Ember's content distribution model — how content is authored, built, and served.

For the architectural overview (boot sequence, blob store, resolver, pinning) see `docs/ARCHITECTURE.md`. This doc focuses on the **author workflow**: how to add a prayer / practice / book / collection so it ships to users.

---

## The corpus

Every piece of content is a **first-class corpus item** with a stable, kind-prefixed id:

| Kind | Example id | Where it lives |
|---|---|---|
| `prayer` | `prayer/our-father` | `content/prayers/our-father.json` |
| `practice` | `practice/rosary` | `content/practices/rosary/` |
| `chapter` | `chapter/lectio-divina` | `content/chapters/lectio-divina/` |
| `book` | `book/trent-catechism` | `content/books/trent-catechism/` |
| `mass` | `mass/of/tempore/holy-week/easter-vigil` | `content/masses/of/tempore/holy-week/easter-vigil.json` |
| `of-ordinary` / `of-preface` / `of-eucharistic-prayer` | `of/ordinary/roman-canon` | `content/of-library/ordinary/roman-canon.json` |
| `of-data` | `of-data/calendar/sanctorale/_index` | `content/of-data/calendar/sanctorale/_index.json` |
| `collection` | `collection/carmelite` | `content/collections/carmelite.json` |
| `checkup` | `checkup/archetypes` | `content/checkup/archetypes.json` |
| `creator` *(v1)* | `creator/padre-paulo-ricardo` | `content/creators/padre-paulo-ricardo/manifest.json` |
| `playlist` *(v1.1)* | `playlist/lent-with-bishop-barron` | `content/playlists/lent-with-bishop-barron/manifest.json` |

Content is sha256-hashed at build time and served as immutable blobs from `https://ember.dpgu.me/hearth/v2/blobs/{ab}/{cd}/{full-sha256}`. Catalog (`catalog.json`) is the master index — every item with its current manifest hash.

---

## Author workflow

### Adding a prayer

1. Drop a JSON file at `content/prayers/<id>.json`:
   ```json
   {
     "title": { "en-US": "Our Father", "pt-BR": "Pai Nosso", "la": "Pater Noster" },
     "body": [ /* FlowSection[] */ ]
   }
   ```
2. Reference from any practice's flow.json by ref: `{ "type": "prayer", "ref": "our-father" }`.
3. Done. The prayer becomes `prayer/<id>` in the corpus on next deploy. It's available globally — any practice in any collection can reference it. No vendoring step.

### Adding a practice

1. Create a directory at `content/practices/<id>/`:
   ```
   manifest.json                # PracticeManifest — name, icon, schedule defaults, etc.
   flow.json                    # FlowDefinition (the prayer DSL)
   fragments/                   # Optional: reusable flow snippets
   data/                        # Optional: cycle data (mysteries, days, etc.)
   tracks/                      # Optional: lectio tracks
   programs/days/day-NN.json    # Optional: per-day flows for programs
   images/                      # Optional: webp images
   ```
2. The build pipeline hashes each file individually. A typo fix in one fragment downloads only that fragment's blob on next launch.
3. To make the practice browseable inside a curated collection, add its ref to `content/collections/<name>.json`. To make it default-installed in the user's plan-of-life, set `defaults.slots[]` in the practice manifest — the seed pass picks it up.

### Adding a book

1. Create `content/books/<id>/`:
   ```
   book.json                    # name, author, languages, TOC (nested)
   en-US/<chapter-id>.md        # Chapter files (id matches a TOC leaf)
   pt-BR/<chapter-id>.md
   images/<file>.webp           # Referenced from chapters as `../images/<file>.webp`
   ```
2. Each `(chapter-id, language)` pair is hashed as a separate blob. A user reading only one language fetches only their language; a single-chapter typo fix is one ~25KB blob.
3. The reader (`features/books/bookReader.ts`) inlines images by hash → base64 data URI when rendering, so `../images/foo.webp` references just work in the WebView.

### Adding an OF Mass proper

1. Drop a JSON file at `content/masses/of/<group>/<...>.json` containing the multilingual proper (7 languages inline: la / es / en / pt-BR / it / fr / de).
2. The build splitter walks the JSON, emits one *shape* blob (language-independent metadata: rite, season, prefaceRefs, etc.) plus one blob per language with that language's expanded text. Localized leaves like `{ en: "...", pt-BR: "..." }` are detected automatically by key.
3. A pt-BR-only user fetches `shape` + `pt-BR` blob = ~9KB instead of the original ~73KB.

### Adding a creator (v1)

A `creator` is editorial metadata about a Catholic priest / teacher / producer. It points at the creator's external feeds (podcast RSS, YouTube channel, blog) — episode/video/article lists are NOT in the corpus, only the creator's identity and channel pointers.

1. Create `content/creators/<id>/`:
   ```
   manifest.json    # CreatorManifest — name, byline, bio, languages, channels[], links
   avatar.webp      # 512×512 square
   banner.webp      # optional 16:9 hero
   ```
2. The build hashes avatar/banner via the existing image pipeline. The manifest itself becomes a single hashed blob.
3. Each `channels[]` entry is one of: `podcast` (with `feedUrl`), `youtube` (with `channelId`), or `rss` (with `feedUrl`). Mark Q&A-format podcasts with `format: 'qa'` to enable the search ranking boost.
4. Articles default to summary-only display; opt a known-good blog into in-app full-text rendering with `channels[].fullText: true`.
5. The new editor-curated creator becomes `creator/<id>` in the corpus. For permission-sensitive metadata (avatar usage, donate links) follow the editorial process — see `docs/features/creators/README.md` §2.

### Adding a playlist (and guided prayer) (v1.1)

A `playlist` is an editor-curated ordered set of media items. With `practiceBinding`, it becomes a *guided prayer* — audio that plays alongside an existing practice flow.

1. Create `content/playlists/<id>/`:
   ```
   manifest.json    # PlaylistManifest — title, items[], optional practiceBinding
   cover.webp       # 1:1 square cover art
   audio.mp3        # optional self-hosted audio (one or more), referenced from items[] as kind: 'audio-blob'
   ```
2. `items[]` is a discriminated union: `feed-item` (refs an existing podcast/RSS episode), `youtube` (a video by id), `audio-blob` (self-hosted), `article`, or `corpus` (a ref into any other catalog item). A topical playlist might mix all five; a guided Rosary uses one `audio-blob` item plus a `practiceBinding`.
3. `practiceBinding` (optional) makes this a guided prayer: it maps the parent practice's flow sections to playlist items (and optional `tStart/tEnd` time ranges within them). The build script validates that every `segments[*].sectionPath` resolves against the referenced practice's flow.
4. **No AI voice cloning** — guided playlists must use real recorded audio, with explicit creator permission (recorded in `manifest.json` → `rights`). Editorial process treats this with the same care as book translation rights.
5. See `docs/features/creators/phase-06-series.md` (editorial bundles) and `docs/features/creators/phase-07-pray-with.md` (guided prayers) for the full author workflow and the `sectionPath` semantics.

### Adding a collection

A collection is a tiny JSON manifest listing references to other corpus items:

```json
{
  "id": "collection/carmelite",
  "name": { "en-US": "Carmelite tradition", "pt-BR": "Tradição carmelita" },
  "description": { ... },
  "tags": ["spirituality"],
  "items": [
    { "ref": "book/gabriel-stmm-intimita-divina" },
    { "ref": "practice/carmelite-night-prayer" },
    { "ref": "prayer/teresa-of-avila-bookmark" }
  ]
}
```

Save at `content/collections/<id>.json`. The collection appears as a filter chip on the practices list, and as a card on the collection detail screen. Pinning the collection prefetches every referenced item for offline use.

The `defaults.autoSeed: true` flag (if present) makes the collection's practices auto-seed into a new user's plan-of-life on first launch.

---

## Build & deploy

```bash
pnpm build:corpus     # runs scripts/build-corpus.py → _site/hearth/v2/
pnpm hearth           # build + serve at http://localhost:4100 for local dev
```

The build is idempotent: re-running with no source changes writes 0 new blobs. Catalog hashes are deterministic across machines (canonical JSON: sort_keys, no whitespace, ensure_ascii=False, UTF-8) — verified between macOS and GH Actions Linux.

Production deploy is `.github/workflows/deploy.yml` on push to `main` with changes under `content/` or `apps/hearth/`. GitHub Pages serves the resulting `_site/hearth/v2/` directory. Old blobs are never deleted (cheap immutable storage; allows rollback).

---

## How updates reach the client

1. App launches → fetches `catalog.json` (network-first; ~500KB; cached in SQLite `cache` table).
2. Diffs new manifest hashes against locally-cached versions.
3. For each changed manifest, fetches its content blob and updates the in-memory `contentIndex`.
4. Next render reads the new value through the resident-manifests map.

A typo fix in one prayer = ~5KB on the wire. Pinned content is opportunistically refreshed in the background.

---

## Anti-patterns to avoid

- **Don't write a manifest with `flow: "flow.json"` (path-based).** References are by hash, not filename. The build pipeline computes hashes from the source files automatically.
- **Don't put binary assets in JSON.** Write `.webp` (or convert via `scripts/convert-webp.sh`) and reference from markdown / flow with the `../images/<file>.webp` convention. The build hashes binaries directly.
- **Don't manually pre-flatten cross-collection prayer refs.** Cross-source prayer refs resolve through the global catalog at runtime. Just `{ "ref": "our-father" }` and the resolver finds it anywhere in the corpus.
- **Don't add new SQLite tables for content state.** Pinned-items list lives in `preferences['pinned-items']` (JSON array). Catalog + manifests live in the existing `cache` kv table. Blob bytes live on FS / IDB by hash.
