# Catholic Creators (Podcasts, Video, RSS, Playlists, Guided Prayers)

PRD for the Creators feature: a curated directory of Catholic priests and content producers, an in-app audio/video/article reader, a global doctrinal search engine, and (in v1.1) editor-curated **Series** playlists and **Pray with [Creator]** guided prayers.

For the corpus model see `docs/ARCHITECTURE.md` and `docs/features/corpus.md`. For practice flow concepts see `docs/features/features-overview.md`. For code style see `docs/CONVENTIONS.md`.

> **This README is the PRD** — the *what* and *why*. Each phase has its own technical design doc with the *how*: major decisions, alternatives ruled out, file-level tasks, and verification.

## Phase index

### v1 — creators + audio/video/article + global search

| Phase | Doc | Goal |
|---|---|---|
| 1 | [phase-01-plumbing.md](phase-01-plumbing.md) | New corpus kind `creator`, build-script walker, resolver/pinning extensions, SQLite tables, feed fetcher with three parsers + chapter-marker parsing, 2-3 seed creators. **No UI.** |
| 2 | [phase-02-browse-ui.md](phase-02-browse-ui.md) | `creators/index` directory, `creators/[id]` profile, in-app audio player (background playback, mini-bar, full-screen), YouTube iframe player, article reader (summary-default + per-source allowlist). |
| 3 | [phase-03-home-follows-offline.md](phase-03-home-follows-offline.md) | Follow / unfollow, Home `Latest` row, per-item pinning + per-creator `auto_pin_count`, storage management UI, network-aware UX. |
| 4 | [phase-04-search-v1.md](phase-04-search-v1.md) | On-device FlexSearch over feed-items + corpus titles + chapter markers. Q&A boost, localized empty-state suggestions, recent searches. |
| 5 | [phase-05-polish.md](phase-05-polish.md) | Speed / sleep timer / lock-screen metadata, skeleton + empty states, pt-BR parity, accessibility, background download. |

### v1.1 — series + pray with + search enrichment

| Phase | Doc | Goal |
|---|---|---|
| 6 | [phase-06-series.md](phase-06-series.md) | New corpus kind `playlist` (without `practiceBinding`), Browse `Series` row, profile `Series` tab, transitive pinning, search indexing of playlist titles + items. |
| 7 | [phase-07-pray-with.md](phase-07-pray-with.md) | `practiceBinding` on playlists, `sectionPath` semantics spike, `GuidedAudioController`, voice selector on Rosary start, pinned cold-play. |
| 8 | [phase-08-search-v11.md](phase-08-search-v11.md) | Curated canonical-question redirects, multilingual synonyms, full book-body + per-CCC-paragraph indexing. |

### v2 — expansion (research-only stubs)

| Phase | Doc | Goal |
|---|---|---|
| 9 | [phase-09-pray-with-expansion.md](phase-09-pray-with-expansion.md) | Stations / Chaplet / Angelus guided prayers; multi-day-program audio companions; per-section audio mode by default. |
| 10 | [phase-10-search-v2-transcripts.md](phase-10-search-v2-transcripts.md) | Whisper-transcribed segment search — only if v1.1 search demonstrably falls short for ≥3 months. |

---

## Context

**What's being added.** Ember today helps users build a rule of life and read the Catholic tradition in long-form (books, collections, prayers, propers). It does not yet meet users where many of them already form their souls daily: through Catholic priests and content producers on podcasts, YouTube, and blogs — and it does not yet let them *pray with* those priests.

**Why now.** Three pillars shape Ember: Fidelity, Devotion, Wisdom. A Catholic creators feature is squarely in **Wisdom**. Podcasts and homily channels are the modern oral tradition; not surfacing them leaves a gap users will fill with secular apps that bury Catholic voices in noisy general-purpose feeds.

**Three flagship moves elevate this from a feature to a category-defining product:**

1. **Global Search — a catechetical answer engine, no ML required.** Many of the best Catholic creators publish in explicit Q&A format (PPR's *Resposta Católica*, *Pints With Aquinas* listener Q&As, *Catholic Answers Live*). Indexing nothing more than their episode titles and show notes — combined with editorial curation guaranteeing every result is faithful — produces a doctrinal search engine Google cannot match. The wow comes from *who* is in the index, not from clever ML.
2. **Playlists & Guided Prayers — pray and listen *with* a creator.** Editor-curated playlists are the primitive: ordered sets of media (podcast episodes, YouTube videos, articles, self-hosted audio, corpus refs). A *Lenten retreat with Fr. Mike*, an *Advent series with Bishop Barron*, *Best of Resposta Católica on Confession* — all the same data model. The flagship special case is **guided prayers**: a playlist whose items carry per-section timestamps mapped to a practice flow, so the user can pray the Rosary along with Padre Paulo Ricardo's voice. One concept, many surfaces — and the bridge between Wisdom and Fidelity.
3. **Aggressive offline support.** Pinning a creator means episodes, articles, search index, avatar, and any guided-prayer audio are all available at 7 a.m. Mass with no signal. Fidelity tools cannot fail when connectivity does.

**Outcome.** Ember becomes the default home for the daily formation diet of a serious Catholic. Following a creator means their answers to your questions and their voice during your Rosary are one tap away — even on a plane.

---

## 1. Scope

### In scope (v1)
- **Editor-curated creator directory** shipped through the Hearth corpus.
- **Three channel kinds** per creator: podcast (RSS audio), video (YouTube channel), text feed (RSS/Atom blog).
- **Browse → Creators**: directory + per-creator profile pages.
- **Native in-app audio player** with background playback, lock-screen controls, queue, resume, speed.
- **In-app video playback** via embedded YouTube iframe player (web + WebView on native).
- **Article reader** for RSS text — full text when feed permits, otherwise summary + WebView fallback.
- **Follow** creators (local-only, no account).
- **Pin episodes/articles** for offline listening/reading using the existing pinning system.
- **Persistent "Now Playing" mini-bar** app-wide once audio is playing.
- **Home-screen latest-content row**: a small horizontal feed of the most recent items across followed creators.
- **Global Search v1**: title + description + show-notes search across episodes/videos/articles, plus corpus titles/headings (books, prayers, saints, catechism). Free per-question chapter-marker deep-linking when the feed exposes chapters. Always-available `🔍 Ask…` pill.
- **Aggressive offline support** (see §8) — every surface degrades gracefully; pinned content works cold-start with airplane mode on.
- **"Suggest a creator"** form (mailto / GitHub issue link) — no user-pasted RSS in v1.
- **i18n**: en-US + pt-BR for all UI strings; creator metadata localized via the existing `LocalizedText` shape.

### In scope (v1.1, follows ~2-4 weeks after v1)
- **Series** (editorial playlists) — first-class corpus kind. Seed: a Lenten series, an Advent series, a topical "Best of *Resposta Católica*" bundle.
- **Pray with [Creator]** (guided prayers) — playlists with `practiceBinding`. Rosary led by ≥1 seed creator, single-file + chapter-map mode. Voice selector on practice start. Pinnable for offline.
- Search v1.1 enrichment: curated canonical-question redirects + question synonyms + full book bodies + every CCC paragraph in the index.

### Out of scope (v1 and v1.1)
- User-pasted arbitrary RSS / YouTube URLs.
- Push notifications for new episodes.
- Comments, ratings, social sharing.
- Cross-device sync of progress / follows.
- Native YouTube playback bypassing the iframe API (against YT ToS).
- Algorithmic recommendations.
- Whisper-transcribed transcript search (Phase C below — only if v1 search demonstrably falls short).
- Semantic / vector search.

---

## 2. Curation & Editorial Policy

**Editor-curated only at launch.** Creators are added via the corpus — same workflow as adding a book or a collection (`content/creators/<slug>/manifest.json`, built by `scripts/build-corpus.py`, deployed to Hearth).

**Suggestion path.** A "Suggest a creator" link in Browse → Creators opens a GitHub issue template (or mailto fallback). The issue captures: name, role, language(s), podcast/YT/RSS URLs, why they belong. Editorial review applies the standard orthodoxy lens: the creator must be in good standing with the Church and faithful to the Magisterium. No heterodox or sedevacantist voices.

**Initial seed list (~12-20 creators)** chosen for breadth across:
- Languages (en-US + pt-BR — at least 4-5 lusophone voices).
- Charisms (diocesan, Dominican, Franciscan, Jesuit, Carmelite, Opus Dei, monastic).
- Formats (homily-only, formation lectures, **Q&A**, daily reflection, exegesis, catechesis).
- Length (5-min daily ↔ 60-min lecture).

**Q&A creators are a priority for v1** because their content powers the search wow (PPR *Resposta Católica*, *Catholic Answers Live*, *Pints With Aquinas* listener Q&As, etc.).

**Guided-prayer creators are a separate editorial track**: each guided variant requires explicit permission to redistribute audio (or sourcing from the creator's existing public, permissively-licensed recordings).

The seed list itself is decided by the maintainer; not part of this PRD beyond the criteria above.

---

## 3. Content Model

The corpus is content-addressed and immutable; podcast feeds and YouTube channels are external and dynamic. We resolve this by storing **creator metadata, guided-prayer audio, and (later) search assets** in the corpus, and fetching **episode/video/article lists** live (with aggressive client caching).

### 3.1 New catalog kind: `creator`

Added to `CatalogItemKind` in `apps/app/src/content/manifestTypes.ts`:

```ts
type CreatorManifest = {
  id: string                               // 'creator/fr-mike-schmitz'
  name: LocalizedText
  byline?: LocalizedText                   // 'Diocese of Duluth · Bible in a Year'
  bio: LocalizedText                       // 1-3 paragraph bio
  avatarHash?: BlobRef                     // square avatar, 512x512 webp
  bannerHash?: BlobRef                     // optional 16:9 hero
  languages: ('en-US' | 'pt-BR' | 'la')[]
  charism?: string                         // 'diocesan' | 'dominican' | …
  role?: string                            // 'priest' | 'religious' | 'lay-theologian'
  channels: CreatorChannel[]
  links?: { website?: string; donate?: string }
  tags?: string[]
}

type CreatorChannel = {
  kind: 'podcast' | 'youtube' | 'rss'
  feedUrl?: string                         // podcast / rss
  channelId?: string                       // youtube
  title?: LocalizedText
  format?: 'qa' | 'homily' | 'lecture' | 'reflection' | 'news' | 'mixed'
  readMode?: 'full' | 'summary'            // rss only
}
```

`CatalogEntry` hints (already supported) populate `name`, optional `author`, `tags`, plus a new optional `creatorRole` so the directory grid renders without fetching every manifest. Avatar/banner blobs flow through the existing image pipeline in `scripts/build-corpus.py` (same as book images).

### 3.2 Live items: not in the corpus

Episodes, videos, and articles are **never** stored in the corpus. They live in:
- **External feeds** (podcast RSS, YouTube channel feed, blog RSS).
- **Client-side cache** in SQLite.
- **For pinned items**: file blob (mp3 / cached HTML / cached image) lives in `documentDirectory/blobs/`, keyed by `sha256(media_url)`. The existing `store.evictTo(budgetBytes, protectedHashes)` LRU is reused; pinned-episode hashes join the protected set.

### 3.3 New catalog kind: `playlist` (v1.1)

A playlist is an **editor-curated ordered set of media items**. It is the unified primitive for:
- A topical bundle ("Best of *Resposta Católica* on Confession").
- A seasonal series ("Lent with Bishop Barron — 40 daily reflections").
- A multi-day program ("St. Joseph 30-day consecration audio companion").
- A guided prayer ("Rosary with Padre Paulo Ricardo") — the same shape, plus practice-binding metadata.

```ts
type PlaylistManifest = {
  id: string                              // 'playlist/lent-with-bishop-barron'
  title: LocalizedText
  description?: LocalizedText
  coverHash?: BlobRef
  curator: { kind: 'editorial' } | { kind: 'creator'; creatorId: string }
  featuredCreatorIds?: string[]           // creators whose content appears
  language: 'en-US' | 'pt-BR' | 'la' | 'mixed'
  tags?: string[]                         // 'lent' | 'advent' | 'confession' | …
  items: PlaylistItem[]
  practiceBinding?: PracticeBinding       // present iff this is a guided prayer
  rights?: 'creator-granted' | 'public-domain' | 'cc-by'  // when items include redistributed audio
}

type PlaylistItem =
  | { kind: 'feed-item'; itemId: string; creatorId: string }   // ref to a podcast/RSS episode
  | { kind: 'youtube';   videoId: string; creatorId?: string }
  | { kind: 'audio-blob'; hash: string; size: number; durationS: number; title?: LocalizedText } // self-hosted audio (e.g., a guided Rosary track)
  | { kind: 'article';   webUrl: string; rssItemId?: string }
  | { kind: 'corpus';    ref: string }                        // 'prayer/our-father', 'book/.../chapter/...', etc.

type PracticeBinding = {
  practiceId: string                      // 'practice/rosary'
  // Map flow sections to playlist items — and optionally to a [tStart,tEnd] inside that item.
  segments: {
    sectionPath: string                   // path inside the practice flow tree
    itemIndex: number                     // index into items[]
    tStart?: number                       // seconds; omit for full-item playback
    tEnd?: number
  }[]
}
```

**Why this is one kind, not two:**
- A *Lent series* uses `items` only, no `practiceBinding`. It's just an ordered listening experience.
- A *guided Rosary* uses one `audio-blob` item plus a `practiceBinding` that maps each flow section to `{tStart, tEnd}` in that audio.
- A *guided Stations* could use 14 `audio-blob` items + a `practiceBinding` with `itemIndex: 0..13` (no `tStart`).
- Same browse UI, same pinning, same search indexing — and where appropriate, the same playlist surfaces inside a practice as a "voice / guided" option.

**Where the metadata gets reused:**
- Search indexes playlists by title, description, item titles → "Lent" returns "Lent with Bishop Barron."
- Home highlights seasonal playlists ("Advent companion") at the right liturgical moment.
- A creator profile's "Pray with" tab is just `playlists where curator.creatorId == creator OR creator is featured AND practiceBinding != null`.
- A creator profile's "Series" tab is just `playlists featuring this creator`.
- Plan of Life can later allow enrolling in a playlist as a 40-day rule.

Playlists are first-class catalog items: kind `playlist`, hashed manifest in Hearth, pinnable, language-localized. Cover art and any self-hosted `audio-blob` items flow through the existing image / track-blob pipeline in `scripts/build-corpus.py`.

### 3.4 New SQLite tables

No formal migrations (per project policy). Idempotent `CREATE TABLE IF NOT EXISTS` on boot through `apps/app/src/db/client.ts`'s schema-bootstrap path.

```sql
CREATE TABLE IF NOT EXISTS creator_follows (
  creator_id  TEXT PRIMARY KEY,
  followed_at INTEGER NOT NULL,
  auto_pin_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS feed_items (
  item_id      TEXT PRIMARY KEY,           -- sha256(channel + guid)
  creator_id   TEXT NOT NULL,
  channel_kind TEXT NOT NULL,
  guid         TEXT NOT NULL,
  title        TEXT NOT NULL,
  summary      TEXT,
  published_at INTEGER NOT NULL,
  duration_s   INTEGER,
  media_url    TEXT,
  web_url      TEXT,
  image_url    TEXT,
  chapters_json TEXT,                       -- parsed chapter markers
  raw_json     TEXT NOT NULL,
  fetched_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS feed_items_by_creator ON feed_items(creator_id, published_at DESC);
CREATE INDEX IF NOT EXISTS feed_items_recent     ON feed_items(published_at DESC);

CREATE TABLE IF NOT EXISTS media_progress (
  item_id      TEXT PRIMARY KEY,
  position_s   REAL NOT NULL,
  duration_s   REAL,
  completed_at INTEGER,
  updated_at   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS search_history (
  query        TEXT NOT NULL,
  searched_at  INTEGER NOT NULL,
  PRIMARY KEY (query, searched_at)
);

-- Per-practice voice selection: which guided variant is preferred for this practice (v1.1)
CREATE TABLE IF NOT EXISTS practice_voice (
  practice_id  TEXT PRIMARY KEY,
  guided_id    TEXT,                       -- null = silent
  updated_at   INTEGER NOT NULL
);
```

`item_id` and chapter-keyed deep-link IDs are **deterministic** so pinned local blobs survive reinstalls when device backups restore the documents directory.

---

## 4. UX

### 4.1 Information architecture

- **Browse** (`apps/app/src/app/browse/index.tsx`) gains:
  - A `Creators` row near the top of the Wisdom section — horizontal scroll of creator avatars with name + byline.
  - A `Latest from your creators` row appears **only if** the user follows ≥1 creator.
- **New routes** under `apps/app/src/app/creators/`:
  - `creators/index.tsx` — directory (grid + filter chips: language / charism / format).
  - `creators/[creatorId].tsx` — profile page.
  - `creators/[creatorId]/episode/[itemId].tsx` — episode/video/article detail.
- **Search overlay**: full-screen modal `search` opened from the `🔍 Ask…` pill on home.
- **Home** gets a **compact** `Latest` mini-row (3-5 items) above the fold's lower edge, hidden if the user follows nobody.
- **Persistent Now-Playing mini-bar**: rendered in `_layout.tsx` above the navigation surface. Visible on every screen once audio is playing or paused.

### 4.2 Creator profile page

```
[banner image, 16:9, soft fade]
[avatar] Padre Paulo Ricardo                          [Follow ✓]
         Sacerdote · Resposta Católica · pt-BR
         [bio paragraph]

[Tabs: Listen · Watch · Read · Series · Pray with]   ← only render tabs that exist; Series + Pray with are v1.1

  Listen tab:    list of episodes, newest first, ▶ + ⋯ menu (Pin / Mark played)
                 header action: "Pin latest 3 →" (sets auto_pin_count = 3)
  Watch tab:     grid of YouTube videos → in-app iframe player
  Read tab:      list of articles → article reader
  Series tab:    (v1.1) editorial playlists featuring this creator — "Lent with Bishop Barron" etc.
  Pray with tab: (v1.1) guided-prayer playlists led by this creator — "Rezar o Rosário com Padre Paulo Ricardo".
                 ▶ button starts the practice with this voice selected.

[Footer: external links — website, donate (discreet)]
[Subtle "Suggest an edit" link → GitHub issue]
```

Reuses existing components: `AnimatedPressable`, `PageHeader`, `ScreenLayout`; `CollectionCard` patterns; `ReaderWebView` for articles + YouTube embed.

### 4.3 Audio player (full screen)

- Artwork hero, scrubbable progress, ±15s skip, speed (0.8 / 1.0 / 1.25 / 1.5 / 2.0), sleep timer, pin toggle, share-link, "open original."
- Mini-bar shows: thumbnail · title · ▶/⏸ · ✕.
- Background playback: `expo-av` `Audio.setAudioModeAsync({ staysActiveInBackground: true })`; Media Session API on web.

### 4.4 Video player

- YouTube **iframe player** in a `react-native-webview` on native; native `<iframe>` on web. Compliant with YT ToS — we don't proxy video.
- Aspect-ratio container; PiP exit when scrolling.

### 4.5 Article reader

- **Default v1 path: summary-only.** Many Catholic blogs ship truncated RSS, and full-text rendering across paywalls / Cloudflare / inconsistent feed hygiene is a long tail we shouldn't fight on day one.
- Per-source allowlist (in `creator/manifest.json` → `channels[].fullText: true`) opts a known-good feed into in-app `ReaderWebView` rendering with the Ember reader stylesheet.
- All other feeds: summary + `Read on the web` → opens the original URL in WebView (or external browser on web).
- Markable as read (`media_progress.completed_at`) regardless of mode.

### 4.6 Latest mini-feed (Home)

Cross-creator merge sorted by `published_at DESC`:
- Up to 8 cards in a horizontal scroller.
- Each card: 1:1 thumbnail · creator avatar overlay · title (2 lines) · 🎧/▶/📄 chip · duration if media.
- Empty state when no follows: a CTA card linking to `/creators`.

### 4.7 Voice selector on practice start (v1.1)

When a practice has Pray-with playlists available in the user's language, the practice start screen surfaces a small voice control:

```
Rosary
Today: Sorrowful Mysteries

[ Voice: Silent ▾ ]      ← tap → sheet listing: Silent, Padre Paulo Ricardo, …
                         ← persisted in practice_voice
[Begin]
```

Selecting a voice persists for that practice. The next time the user starts the Rosary, the same voice is preselected.

### 4.8 i18n strings

All new copy lives in `apps/app/src/lib/i18n/locales/{en-US,pt-BR}.json` under `creators.*`, `search.*`, and `guided.*` namespaces. Creator-supplied bio / byline / channel titles use `LocalizedText` and resolve via `localizeContent()`.

---

## 5. Global Search — the killer feature

### 5.1 The insight

The Catholic creator ecosystem has already done the hard editorial work. The best priests and producers publish in **explicit Q&A or topical-question format** — every episode title is a real question a Catholic asked, with a faithful, magisterial answer:

- **Padre Paulo Ricardo — *Resposta Católica*** (pt-BR): hundreds of episodes, each titled with a specific question. *"Posso comungar em pecado mortal?"*, *"O que é a graça santificante?"*, *"Como confessar pecados esquecidos?"* — that is already a searchable doctrinal manual.
- **Pints With Aquinas listener Q&As**, **Catholic Answers Live**: same shape in English. Each episode title or chapter is a question.
- **Fr. Chad Ripperger** lectures, **Fr. Gregory Pine** explainers, daily-reflection podcasts: questions and topics in titles.
- **Catechism / Compendium chapter headings** are themselves Q-A pairs.

**This means a serious catechetical search engine emerges from indexing nothing more than titles, descriptions, and show-notes — combined with editorial curation guaranteeing every result is faithful.** No transcription. No ML. Just curation × the right indexable surface.

### 5.2 The vision

One search box on the home screen. Type a question. Get hits across:
- **Q&A episodes** where the title literally is the question.
- **Topical homilies, lectures, articles** where the title or description names the topic.
- **Catechism paragraphs / Compendium Q-A pairs / book chapters** in the corpus.
- **Saints, prayers, practices** the user can act on.

Type *"posso comungar em pecado mortal"* → first result is the PPR *Resposta Católica* episode of that exact name, ready to play. Type *"how do I prepare for Confession"* → results include a Pints With Aquinas episode, a *Catholic Answers Live* segment, the relevant CCC paragraphs, and the in-app Confession examen practice. **That is the wow** — and it ships in v1.

### 5.3 Architecture (v1 — title + description + show-notes)

No new corpus kind for indexes is needed yet. Search runs on data already on-device:

- `feed_items.title`, `feed_items.summary`, `feed_items.chapters_json`.
- `feed_items.creator_id` for filtering and credibility ranking.
- Corpus content from warmed manifests at boot: book titles + chapter titles + TOC entries, prayer titles + sources, saint names, collection names, CCC paragraph headings, Mass propers names.

**On-device index build at boot**:
- A single **FlexSearch** in-memory index keyed by `(kind, id, segmentId?)` over the union above.
- Per language: en-US and pt-BR each get their own index. Latin titles fold into both.
- Rebuild incrementally on every successful feed refresh — only the touched creator's items re-index.
- Cost target: < 50 ms cold-start over ~10k titles. Memory < 5 MB.
- The indexer takes a kind-pluggable registry so v1.1 can add `playlist` without rewriting it.

**Free per-question deep-linking from show notes**: many Q&A podcasts include chapter markers — either as the `<podcast:chapters>` namespace or as plain-text timestamp lists in `<description>` (`"00:00 Intro / 02:30 Pergunta 1: ... / 15:42 Pergunta 2: ..."`). The feed fetcher parses both and stores them in `feed_items.chapters_json`. Search returns hits at the **chapter level** (per-question), not just the episode level — with a timestamp, no transcription required. PPR-style Q&A shows become *per-question* searchable for free.

**Ranking**: BM25 (FlexSearch's built-in) + a per-kind prior (Q&A-tagged creator content boosts on question-shaped queries; corpus content boosts on definitional queries) + recency for media items.

**Privacy**: queries run entirely on-device. Nothing leaves the phone. No analytics on what users search.

### 5.4 Q&A-format tagging

The `format` field on `CreatorChannel` (see §3.1) is editorial metadata, not ML. Channels marked `format: 'qa'` boost on question-shaped queries (queries that start with "como", "o que", "posso", "what", "how", "can I", "should I", "why"). The directory can also filter by format, so users can browse "all Q&A creators."

### 5.5 Search UI

- **Home**: a discrete `🔍 Ask…` pill at the top, opening a full-screen search overlay. Reachable from any screen via a small icon in the navigation header.
- **Result tabs**: `All · Q&A · Listen · Watch · Read · Books · Catechism · Saints · Prayers`.
- **Result row anatomy**:
  - Source icon + creator avatar (creator content) or content icon (corpus content).
  - Title (the question, for Q&A channels).
  - Subtitle: creator name / source.
  - Timestamp chip when a chapter marker matched: `02:30 →` for the second question of an episode.
- **Empty state** suggests example questions drawn from the actual highest-quality Q&A episodes of seed creators. Localized: pt-BR pulls from PPR; en-US from *Catholic Answers Live* / *Pints With Aquinas*. **The empty state itself becomes a starter catechetical FAQ** — tap a suggestion to play the answer.
- **Recent searches** persist in `search_history`; clearable from Settings.

### 5.6 Phased rollout

- **Phase A — v1 (the wow ships here, no ML)**:
  - On-device FlexSearch over feed_items + corpus titles/descriptions/show-notes.
  - Chapter-marker parsing for free per-question deep-linking.
  - `format: 'qa'` ranking boost.
  - Localized question-suggestion empty state.
- **Phase B — v1.1 (editorial enrichment)**:
  - Curated **canonical-question redirects**: a small `content/answers/*.json` file maps frequent user questions to a top hand-picked episode/chapter/CCC paragraph. Hand-edited by maintainer; tiny effort, huge perceived quality.
  - Multilingual question synonyms (e.g., "comunhão" ↔ "Eucaristia").
  - Index full book bodies + every CCC paragraph (already on-device).
- **Phase C — v2 (transcripts, only if needed)**:
  - Optional Whisper transcription pipeline for top creators that *don't* publish Q&A-format titles.
  - FlexSearch index extended with transcript segments + word-level timestamps.
  - Scoped narrowly so we don't pay transcription cost for content that's already title-searchable.
- **Phase D — v3 (semantic, only if measurably needed)**:
  - Small on-device embedding model for queries whose lexical match is weak.
  - Hybrid (BM25 + vector) retrieval. Privacy-preserving — local only.

**The point: don't build Whisper until v1 search has run for a few months and we know which queries actually fail.** Editorial curation may already cover 80% of what users ask.

### 5.7 Why this fits Ember's DNA

- **Editor-curated → trustworthy**: only orthodox creators are indexed. Every result is a faithful answer. Google, Apple Podcasts, YouTube cannot say this.
- **Cheap to ship**: title indexing is trivial. The wow comes from *who* is in the index.
- **Offline-first**: the index is built on-device from already-cached data. Search works fully offline against any creator whose feed has been fetched once.
- **Multilingual**: pt-BR and en-US from day one — and PPR alone is a flagship reason this matters.
- **Privacy-respecting**: queries never leave the device.

---

## 6. Series & Pray with — playlists & guided prayers (v1.1)

> Internally one `playlist` corpus kind. User-facing: editorial bundles surface as **Series**; practice-binding ones surface as **Pray with [Creator]**.

### 6.1 Playlists — the primitive

A playlist is an editor-curated ordered set of media items (see §3.3). It is the unified shape powering several distinct user experiences:

- **Topical bundles** — *"Best of Resposta Católica on Confession"*, *"Bishop Barron on the Mass"*, *"How to read Scripture: 8 talks by Fr. Gregory Pine"*.
- **Seasonal series** — *"Lent with Fr. Mike: 40 daily reflections"*, *"Advent companion 2026"*, *"Octave of Easter homilies"*.
- **Multi-day programs** — audio companions to existing devotional programs (St. Joseph 30-day consecration, 54-day Rosary novena, Total Consecration to Mary).
- **Guided prayers** (the flagship special case) — *"Pray the Rosary with Padre Paulo Ricardo"*, *"Stations of the Cross with Bishop Barron"*.

Same data model. Same browse UI. Same pinning. Same search indexing. The only difference between a "Lent series" and a "guided Rosary" is whether `practiceBinding` is set.

### 6.2 Where playlists surface

| Surface | What appears | User label |
|---|---|---|
| Browse → new row | Featured editorial playlists, season-aware (Advent playlists in Advent, Lent in Lent). | **Series** |
| Creator profile → tab | Playlists featuring this creator (no `practiceBinding`). | **Series** |
| Creator profile → tab | Playlists by/featuring this creator that have `practiceBinding`. | **Pray with** |
| Practice start screen → voice selector | Playlists with `practiceBinding.practiceId == this practice`, in the user's language. | (inline: "Pray with [Creator]") |
| Home → seasonal hero | One liturgically-aligned playlist surfaced when relevant. | **Series** |
| Search | Playlist titles + descriptions + item titles indexed alongside everything else. | (per-row label) |

### 6.3 Guided Prayers — the killer special case

A user opens the Rosary practice and sees: *"Rezar com Padre Paulo Ricardo"* / *"Pray with Bishop Robert Barron"*. They tap, the flow plays, and each Hail Mary, mystery announcement, and Glory Be is voiced by that creator. **The user prays *along with* the priest, not at the priest.** It's the difference between watching someone pray and praying yourself.

**Why this matters.** Prayer is a school. The voice you pray with shapes your interior life. A novice praying alongside a recollected, faithful priest learns the Rosary's pace, gravity, and meditative rhythm in a way silent text or generic TTS cannot teach. It is **not just listening** — it is praying. That alignment with Ember's mission is rare, and it is the most distinctive thing a Catholic prayer app can offer. It is the bridge between **Wisdom** (creator content) and **Fidelity** (rule of life) — turning creators from voices you consume into companions in your spiritual life.

**v1.1 coverage:**
- **Rosary** (Joyful / Sorrowful / Glorious / Luminous, mystery selected by day, as today).
- **Stations of the Cross**, **Divine Mercy Chaplet**, **Angelus** added in v2.

The Liturgy of the Hours is v2-or-later.

### 6.4 Architectural fit — playlist + `practiceBinding`, no new flow extension

A guided prayer is a playlist with one or more `audio-blob` items and a `practiceBinding` mapping the parent practice's flow sections to playlist items (and optional intra-item time ranges). Two common shapes:

1. **One continuous track** (cheapest for creators) — a single `audio-blob` item; `practiceBinding.segments[i].tStart/tEnd` defines section offsets within it. Player seeks to boundaries as the flow advances.
2. **Per-section blobs** (cleanest re-recording) — N `audio-blob` items, one per flow section; `practiceBinding.segments[i].itemIndex` points to the right one; no `tStart` needed.

Both are the same `PlaylistManifest`. The `GuidedAudioController` (in `apps/app/src/features/practice/guided/`) reads `practiceBinding`, listens to flow advance events, and tells the audio player to seek/play. **No change to the flow DSL itself** — the binding lives outside the flow, in the playlist. This keeps practice flows unaware of audio and avoids polluting `packages/content-engine/`.

> ⚠️ **Open implementation question — `sectionPath` semantics.** `FlowSection` in `packages/content-engine/src/types.ts` is a structurally-nested discriminated union with no stable id on container nodes, and the flow renders dynamically (day-of-week selects, mystery cycles, fragment expansion, repeats). A naive index-path is fragile across these. **Before v1.1 implementation begins**, do a small spike: walk `RenderedSection`s for `practice/rosary` on each weekday and design `sectionPath` so it stably resolves under each mystery cycle. Two candidates: (a) add an optional stable `id` field to relevant FlowSection container types and address by id (a real but tiny DSL change), or (b) define `sectionPath` as a structural address that's invariant under the dynamic operators we use today (cycle index by mystery name, not by render order). Whichever we pick, the spike's output is a one-page note in `docs/features/guided-prayers.md` referenced by the build-script validator.

Because the parent practice is unchanged, all of its existing capabilities — scheduling, completion tracking, plan-of-life integration, pause/resume, streaks, devotional metrics — apply for free.

### 6.5 Content authoring

```
content/playlists/
  lent-with-bishop-barron/
    manifest.json                          # editorial bundle, no practiceBinding
    cover.webp
  rosario-com-padre-paulo-ricardo/
    manifest.json                          # has practiceBinding -> practice/rosary
    cover.webp
    audio.mp3                              # continuous track, hashed as a blob
```

`scripts/build-corpus.py` gains a `build_playlists()` walker. Existing image and track blob pipelines are reused. The build script validates that any `practiceBinding.segments[i].sectionPath` actually resolves in the referenced practice's flow.

### 6.6 UX during prayer

- **Voice selector** on the practice start screen (see §4.7), populated from playlists where `practiceBinding.practiceId == this practice` and `language` matches.
- **Auto-advance**: as each section completes (the creator finishes the prayer in the audio), the flow advances. The user stays in control — tap to advance early, hold to pause, swipe to repeat.
- **Minimal in-prayer chrome**: a subtle `🔊 Padre Paulo Ricardo` chip; tap reveals a small control sheet (pause, ±5s, speed, exit voice → silent).
- **Mid-prayer pause**: existing practice resume mechanism applies; on resume, audio re-cues to the current section's start.
- **Speed**: 0.8× / 1.0× / 1.25× — user-controllable to match their own praying pace.
- **Resume across sessions**: if the user paused at the 3rd Sorrowful Mystery yesterday, they resume there with audio re-cued.

### 6.7 Offline

- Pinning a playlist pulls cover art, any self-hosted `audio-blob` items, and (transitively) the underlying media for `feed-item` items if the user opts into "pin all items." A new `COLLECTORS['playlist']` entry handles the transitive walk.
- Pinning a guided-prayer playlist therefore pins the audio that drives the guided practice — the whole guided Rosary plays cold, no network.
- Pinning the parent practice (Rosary) optionally pins all its guided playlists — toggle in Settings.
- Storage: a 25-min guided Rosary at 64 kbps mono ≈ 12 MB. Well within the 1 GB cap.

### 6.8 Editorial / rights flow

- Every playlist that redistributes audio (i.e., contains `audio-blob` items) requires explicit creator permission or permissively-licensed source material. Rights status is recorded in `PlaylistManifest.rights`.
- Editorial process treats this with the same care as book translation rights.
- **No AI voice cloning of creators**, ever.
- Playlists made entirely of `feed-item` / `youtube` / `corpus` references don't redistribute anything new — they're curated lists pointing at existing public sources, no rights issue beyond the existing podcast/YT terms.

### 6.9 Risks & mitigations

| Risk | Mitigation |
|---|---|
| Rights / consent | Editorial process — opt-in only; no AI cloning; rights status in manifest. |
| Creator audio re-record | Content-addressed corpus; each version is a new hash; old hash still works for users who pinned it. |
| Pace mismatch (creator prays faster than user) | User-controllable speed; auto-advance can be toggled off (manual progression with audio as accompaniment). |
| Section-boundary timing errors | Build script validates `practiceBinding.segments[*].sectionPath` against the practice flow; small pad margin on `tStart/tEnd`. |
| Storage bloat | ~12 MB per Rosary; 1 GB cap; per-creator local size visible in Settings. |
| Stale `feed-item` refs (creator deletes an episode) | Resolver tolerates missing items; surfaces a soft "no longer available" state on that playlist row. |

---

## 7. Feed Fetching & Caching

### 7.1 Refresh strategy
- **On app foreground**, debounced to once per 30 minutes per creator: fetch the latest N=20 items per channel for every followed + featured creator.
- **On profile open** for an unfollowed creator: fetch on demand; cache 6 hours.
- **Manual pull-to-refresh** on profile and on home `Latest` row.
- All fetches go through a single `feedFetcher` module with global rate-limiting (max 4 concurrent).

### 7.2 Parsers
- **Podcast RSS / Atom**: `apps/app/src/features/creators/feeds/podcast.ts` using `fast-xml-parser`. Parse `<title>`, `<itunes:image>`, `<enclosure url>`, `<itunes:duration>`, `<pubDate>`, `<guid>`, `<description>`, `<podcast:chapters>` (when present), and a regex pass over `<description>` for plain-text timestamp lists.
- **YouTube channel**: public `feeds/videos.xml?channel_id=…` Atom feed — **no API key, no quota**. Parse `<entry>` with `media:thumbnail`, `yt:videoId`, `published`, `title`, `media:description`. Plain-text timestamp regex pass on description (YouTube chapters).
- **Blog RSS / Atom**: same XML parser, dispatches on root element.

### 7.3 Storage & TTL
- Successful fetches upsert into `feed_items`. Keep at most the most recent 200 per creator (older rows pruned at refresh time).
- Failed fetches keep stale rows visible with a soft "stale since …" chip.
- `raw_json` allows schema evolution without re-parsing.

### 7.4 Pinning (creator + item)

A pinned episode triggers:
1. Download `media_url` to `documentDirectory/blobs/<aa>/<bb>/<sha256(media_url)>`.
2. Mark its hash protected via the existing pinning manager. New `COLLECTORS['creator']` (avatar + banner blobs), `COLLECTORS['feed-item']` (media + image), and `COLLECTORS['guided-flow']` (track + per-section audio).
3. On player start, the player resolves `media_url` → local file URI if pinned, otherwise streams.

YouTube videos are **not pinnable** (against YT ToS). Articles **are** pinnable. Guided-prayer audio **is** pinnable.

---

## 8. Offline & Local-First (deep dive)

**Principle.** Every content type a user might want at Mass, on a flight, on retreat, or in the woods must work offline. Ember is a *fidelity* tool — spotty connectivity at 7 a.m. Mass cannot be a reason a user skips morning prayer or their daily Fr. Mike Schmitz episode. **If it shipped to your device, it works without a network. Full stop.**

### 8.1 What's already offline today
Catalog, prayers, practices, books, collections, Mass propers — all blob-cached and pinnable via the existing system. No regression.

### 8.2 New offline surfaces

| Surface | Offline behavior |
|---|---|
| Creator metadata (name, bio, avatar, banner) | Pulled in as part of catalog warm-up; pinning a creator guarantees avatar/banner are local. Directory renders fully offline. |
| Episode lists (titles, dates, durations, art) | Cached in `feed_items` SQLite indefinitely. Last-known list shows offline; soft "stale since Tue 9pm" indicator if older than 24h. |
| **Audio episodes** | User pins → mp3 downloads to local blob. Pinned episodes play offline with full mini-bar / lock-screen controls. |
| Articles (RSS text) | Pinned articles cache HTML + inline images locally. |
| YouTube videos | **Not pinnable** (against ToS). Profile labels videos as "online only." |
| **Playlists** (incl. guided prayers, v1.1) | Pinning a playlist pulls cover art + any `audio-blob` items. With "include items" on, it transitively pulls feed-item media too. The whole guided Rosary plays cold; the whole Lenten series plays cold. |
| **Search** | The on-device FlexSearch index is built from already-cached data — search works fully offline against any creator whose feed has been fetched once. |
| Search history & follows | Local SQLite; always available. |

### 8.3 Pinning ergonomics

- Per-item pin (existing pattern, surfaced on every episode/article row).
- **Per-creator auto-pin policy**: a one-tap "Pin latest 3" on the creator profile sets `creator_follows.auto_pin_count = 3`. New episodes auto-pin; oldest beyond N auto-unpins. No background magic — runs on each successful feed refresh.
- **Wi-Fi-only download** toggle in Settings (default ON) protects cellular bills.
- **Background download** (iOS background URL session, Android WorkManager) — deferred to v1.1 if not trivial; v1 downloads on foreground with a visible progress chip.

### 8.4 Storage management UI

Extends Settings → Storage:
- Per-creator local size, oldest pinned episode date, count.
- One-tap "free up X MB" that unpins least-recently-played episodes.
- Soft cap stays at 200 MB by default but **bumps to 1 GB** if any podcast/video creator is followed (more realistic for media). User can override.

### 8.5 Conflict-free behavior

- LRU eviction never touches user-pinned blobs (existing protected-set guarantee).
- Pinned episodes survive app reinstalls only when device-level backup includes the documents directory.
- `media_progress` is small text — safe to back up unconditionally.

### 8.6 First-run on flight mode

- Catalog cache + warmed manifests serve everything except live feeds.
- Followed creators show last-cached episode lists.
- Pinned episodes / articles play and read without any network.
- Pinned guided prayers run end-to-end with full audio.
- Search across pinned creators returns hits, including chapter-marker deep-links.
- Unpinned creators show last-cached lists with a stale chip.

### 8.7 Network-aware UX

- Subtle "offline" chip in the navigation header when no connectivity.
- Tapping a non-pinned remote item shows a clear "needs internet" state instead of a silent loading spinner.
- Refresh actions disable rather than fail noisily.
- Once playback begins on a streamed episode, the player progressively caches what it has streamed so the user can scrub backward without re-fetching.

---

## 9. Technical Architecture (summary)

| Concern | Approach |
|---|---|
| Catalog extension | New `creator` (v1) and `playlist` (v1.1) kinds in `CatalogItemKind` (`apps/app/src/content/manifestTypes.ts`). |
| Build pipeline | `build_creators()` (v1) and `build_playlists()` (v1.1) walkers in `scripts/build-corpus.py`. Cover art and `audio-blob` items flow through the existing image/track-blob paths. The playlist builder validates `practiceBinding.segments[*].sectionPath` against the referenced practice's flow. |
| Resolver | `resolveCreator(id)`, `loadCreator(id)`, `resolvePlaylist(id)`, `loadPlaylist(id)` in `apps/app/src/content/resolver.ts`. Creators and playlists warm in `warmDeferredManifests()`. |
| Pinning | Extend `COLLECTORS` table in `apps/app/src/features/pinning/pinningManager.ts` with `creator`, `feed-item`, and (v1.1) `playlist` (transitively pulls cover, audio-blob items, and optionally feed-item media). |
| Feed fetching | `apps/app/src/features/creators/feeds/` (`podcast.ts`, `youtube.ts`, `rss.ts`, `chapters.ts`, `fetcher.ts`). Foreground-triggered, SQLite-cached. |
| Audio playback | `expo-av` for v1 (lighter, already pluggable). Re-evaluate `react-native-track-player` only if needed. |
| Video playback | YouTube iframe inside `react-native-webview` on native; `<iframe>` on web. Reuses `ReaderWebView` patterns. |
| Article reader | Reuses `ReaderWebView` (`apps/app/src/features/books/ReaderWebView.tsx`) with a creator-article CSS variant. |
| Search runtime | `apps/app/src/features/search/` — `engine.ts` (FlexSearch builder + query), `hits.ts` (hydration + ranking), `useSearch.ts` hook. Index is in-memory, rebuilt on feed refresh. Kind-pluggable registry so v1.1 can add `playlist` without rewriting. |
| Guided prayer engine (v1.1) | `GuidedAudioController` in `apps/app/src/features/practice/guided/` reads a playlist's `practiceBinding`, listens to flow advance events, and tells `expo-av` to seek/play. **No change to the flow DSL** — binding lives in the playlist, keeping `packages/content-engine/` audio-agnostic. |
| State | Zustand store `apps/app/src/stores/creatorsStore.ts` (immer): `follows`, `feedItemsByCreator`, `latest`, `nowPlaying`, `progressById`, `voiceByPractice`. SQLite reads cached via TanStack Query. |
| DB | New repos `apps/app/src/db/repositories/creators.ts`, `media.ts`, `practiceVoice.ts`. Idempotent `CREATE TABLE IF NOT EXISTS` on boot. |
| i18n | Extend `apps/app/src/lib/i18n/locales/*` with `creators.*`, `search.*`, `guided.*` keys. |

### Critical files to read before implementing
- `apps/app/src/content/manifestTypes.ts` — kind union (`CatalogItemKind`); add `'creator'` and (v1.1) `'playlist'` here.
- `apps/app/src/content/contentIndex.ts` — catalog index; new kinds register here, not just in the type union.
- `apps/app/src/content/resolver.ts` and `store.ts` — resolution / blob cache.
- `apps/app/src/features/pinning/pinningManager.ts` — `COLLECTORS` table.
- `apps/app/src/features/books/ReaderWebView.tsx` — WebView abstraction reused for video + articles.
- `apps/app/src/app/browse/index.tsx` — where the new `Creators`, `Latest`, and search-pill rows attach.
- `apps/app/src/db/client.ts` — `CREATE TABLE IF NOT EXISTS` bootstrap on boot.
- `apps/app/src/db/repositories/` — pattern to follow (existing: `practices.ts`, `cursors.ts`, `oblatio.ts`); new repos slot in here.
- `packages/content-engine/src/types.ts` — `FlowSection` shape; relevant for the v1.1 `sectionPath` spike (no DSL change in v1).
- `apps/app/src/features/practices/components/PracticeFlow.tsx` — `useAdvanceCursor` is where `GuidedAudioController` will hook flow-advance events in v1.1.
- `scripts/build-corpus.py` — `build_collections()` is the pattern; insert `build_creators()` next to it (and `build_playlists()` in v1.1).
- `apps/app/src/features/search/` — search engine module; design v1's indexer to take a kind-pluggable registry so v1.1 can add `playlist` without rewriting it.
- `docs/features/corpus.md` and `docs/features/features-overview.md` — the docs we mirror and extend.

---

## 10. Privacy, Licensing, Compliance

- **No tracking**. Follow state, progress, voice selection, and search queries are **local-only**. No analytics on listening, praying, or searching.
- **Network calls** are limited to: Hearth corpus, podcast RSS hosts, YouTube Atom feed, blog RSS hosts, and (when streaming) creators' media CDNs. No proxying or rehosting.
- **YouTube ToS**: respected via the iframe player exclusively; no audio-only extraction; no offline download of YT video.
- **Podcast RSS** is publicly available by convention. Display attribution + link to the original host.
- **Articles**: full text only when the feed includes it; summary-only feeds open the full article in WebView.
- **Guided prayers**: explicit creator permission or permissively-licensed source material only. **No AI voice cloning.**
- **Trademark / image rights**: avatars and banners sourced from the creator's public materials; explicit permission preferred. Editorial process treats this like book cover art.

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| RSS feed format drift breaks parsing | Tolerant parser; persist `raw_json` so we can re-parse without refetch; per-creator fallback to "open in browser." |
| YouTube removes the public Atom feed | Documented fallback to YouTube Data API v3 (deferred — would need an API key + quota plan). |
| App Store rejection over YT background audio | We don't attempt YT audio-only — we stream YT only via the official iframe player. |
| Heterodox suggestion floods | Editorial review gate; no user-pasted RSS in v1. |
| Feed-fetch network costs on cellular | Foreground-only refresh, debounced 30 min, capped concurrency; cellular "data saver" toggle. |
| Storage growth from pinned episodes / guided audio | LRU soft cap (200 MB → 1 GB when media is followed); pinned media joins protected set; per-creator size visible in Settings. |
| Search v1 quality on non-Q&A creators | Phase B canonical-question redirects; creator descriptions and corpus headings still hit; Phase C transcripts only if measurably needed. |
| Article full-text fragility (paywalls / Cloudflare / inconsistent feeds) | Default to summary + "Read on the web"; per-creator `fullText` allowlist opts known-good feeds into in-app rendering. |
| Guided-prayer audio rights | Editorial process; creator permission required; no AI cloning. |
| Guided-prayer pace mismatch | Per-section auto-advance + user-controllable speed + manual progression mode. |
| Guided-prayer section-boundary timing errors | Sanity-check `{tStart, tEnd}` ranges in the build script; add small pad margin; player seeks defensively. |
| `sectionPath` instability under dynamic flow operators (cycles / day-of-week) | Pre-v1.1 spike defines stable addressing (creator-supplied id, or invariant structural address); build-script validator confirms across every weekday's mystery cycle. |
| Player implementation complexity | Ship `expo-av` v1; only adopt `react-native-track-player` if we hit a concrete limitation. |

---

## 12. Phased Rollout

### v1 launch

**Phase 1 — Plumbing (no UI surface yet).**
- New `creator` corpus kind, `build_creators()` in build-corpus.
- Resolver + pinning extensions.
- SQLite tables.
- Feed fetcher with podcast + YouTube + RSS parsers; chapter-marker parsing.
- 2-3 seed creators committed to `content/creators/`.

**Phase 2 — Browse UI.**
- `creators/index` directory and `creators/[id]` profile.
- Listen / Watch / Read tabs with live feeds.
- Audio player (full screen + mini-bar).
- YouTube iframe player.
- Article reader path.

**Phase 3 — Home, follows & offline.**
- Follow / unfollow + persistence.
- Home `Latest` row.
- Browse `Latest from your creators` row.
- Per-item pinning + per-creator `auto_pin_count`.
- Storage management UI.
- Network-aware state across the app.

**Phase 4 — Global Search v1 (the wow).**
- Search overlay + result row + tabs.
- On-device FlexSearch over feed_items + corpus titles/descriptions/show-notes.
- Chapter-marker deep-linking.
- `format: 'qa'` ranking boost.
- Localized question-suggestion empty state.
- `search_history` + recent searches.

**Phase 5 — Polish.**
- Speed / sleep timer / lock-screen metadata.
- Skeleton + empty states.
- pt-BR seed creators reach parity (≥40% of seed list lusophone).
- Accessibility pass.
- Background download (iOS / Android).

**v1 ships here.** Each phase above is independent; nothing in Phase 1 is user-visible.

### v1.1 (2-4 weeks after v1)

**Phase 6 — Series (editorial playlists).**
- `playlist` corpus kind + `build_playlists()` walker (no `practiceBinding` validation needed yet).
- Browse `Series` row with seasonal awareness.
- Creator profile `Series` tab.
- 2-3 seed editorial playlists (Lenten series, topical bundle, Advent companion).
- Pinning of playlists (transitive: cover + audio-blob items + optional feed-item media).
- Search indexes playlist titles + descriptions + item titles.

**Phase 7 — Pray with (guided prayers).**
- Pre-implementation spike: define `sectionPath` semantics against dynamic flow tree (see §6.4).
- Extend `playlist` validation to enforce `practiceBinding.segments[*].sectionPath` against the parent practice flow.
- `GuidedAudioController` in `apps/app/src/features/practice/guided/` listens to flow advance, drives `expo-av` seek/play.
- Voice selector on Rosary start, populated from playlists with `practiceBinding.practiceId == 'practice/rosary'` in the user's language.
- Creator profile `Pray with` tab.
- 1-2 seed guided-prayer playlists for the Rosary, single-track + chapter-map mode, with explicit creator permission.
- Pinned guided Rosary plays cold (no network).

**Phase 8 — Search v1.1 enrichment.**
- Curated canonical-question redirects (`content/answers/*.json`).
- Multilingual question synonyms.
- Index full book bodies + every CCC paragraph.

### v2

**Phase 9 — Pray with expansion** — Stations / Chaplet / Angelus guided playlists; seasonal home hero; multi-day-program audio companions; per-section audio mode by default.

**Phase 10 — Search v2 (transcripts), only if measurably needed.**

---

## 13. Verification

- **Build**: `pnpm build:corpus` produces creator manifests, blobs, and catalog entries; `curl https://ember.dpgu.me/hearth/v2/catalog.json | jq '."creator/padre-paulo-ricardo"'` returns the expected entry.
- **Resolver**: app boot warms creator manifests without blocking first paint (timing logged).
- **Feeds**: with airplane mode off, opening a profile populates Listen/Watch/Read tabs from live feeds; with airplane mode on after one successful fetch, cached items render.
- **Chapter parsing**: a fixture PPR feed with timestamp lists in `<description>` produces `feed_items.chapters_json` with the right `{tStart, title}` entries.
- **Audio**: plays in background with lock-screen art + controls on iOS/Android; `media_progress` persists across app reload; pinned episode plays with **no network**.
- **Video**: YouTube iframe loads on web and inside WebView on native.
- **Pinning**: pinning a creator avatar makes the directory render offline; pinning an episode plays it offline; unpinning evicts the blob; auto-pin policy adds and trims correctly across feed refreshes.
- **Offline cold start**: kill the app, enable airplane mode, relaunch. Followed creators render. Pinned episodes play. Pinned articles read. Pinned guided Rosary completes end-to-end. Search across pinned creators returns hits, including chapter-marker deep-links.
- **Home**: with ≥1 follow, the Latest row appears and surfaces the most recent item per channel kind.
- **Search v1**: with the v1 indexer warmed against ≥10k items per language (full seed corpus + cached feed items), typing *"posso comungar em pecado mortal"* returns the matching PPR *Resposta Católica* episode within 100 ms on a cold cache; tapping the chapter chip jumps the player to the right offset.
- **Playlists** (v1.1): a seed editorial playlist appears in the Browse `Series` row; tapping opens its detail page; pinning the playlist (with "include items" on) makes every item playable offline.
- **Guided Prayers** (v1.1): a `practiceBinding`-bearing playlist appears in the Rosary's voice selector; starting plays the first prayer's audio; advancing to the next decade re-cues audio at the next section boundary; pause/resume re-cues to the current section; offline (pinned) guided Rosary completes without network.
- **Dynamic-flow `sectionPath`** (v1.1): start the guided Rosary on each weekday Mon-Sun; verify section boundaries align under each mystery cycle (Joyful / Sorrowful / Glorious / Luminous) with no off-by-one drift. Run with auto-advance on and again with manual progression.
- **Build validation** (v1.1): an intentionally broken `practiceBinding.segments[i].sectionPath` causes `pnpm build:corpus` to fail with a clear error pointing at the playlist source file; same check passes for every weekday's mystery cycle.
- **i18n**: switching to pt-BR translates all creator + search + guided UI; creator metadata that lacks pt-BR falls back to en-US.
- **Tests**:
  - Unit tests for the three feed parsers + chapter parser using fixture XML files (`apps/app/src/features/creators/feeds/__fixtures__/`).
  - Unit tests for FlexSearch index build + ranking.
  - Unit tests for `GuidedAudioController` section-boundary seeking (v1.1).
  - End-to-end test for offline pinned playback (record-and-replay against a stub network).

---

## 14. Open Questions (non-blocking)

1. Initial seed list of creators — drafted separately by maintainer.
2. Final brand for the section: **Creators** vs. **Voices** vs. **Companions**. PRD assumes "Creators."
3. Should followed-creator avatars get any subtle home-screen presence beyond the Latest row (e.g., an avatar strip)? Defaulting to **no** in v1.
4. Donation links in profile footer — discreet text link or omit entirely? Defaulting to **discreet text link**.
5. Per-question deep-links from chapter markers: should we render hits at the **chapter level** (one row per question in an episode) or **episode level** with a "jump to question" button? Defaulting to **chapter level** for Q&A-tagged channels and **episode level** otherwise.
6. Guided Prayers — silent flow remains the default in v1.1; voice selector reveals creators (opt-in).
7. Should users be able to create their own private playlists in v2 (mark-and-collect their favorite episodes)? Defaulting to **no**; revisit once we see usage.
8. Transcripts (Search Phase C) — defer until v1.1 search has run for ≥3 months and we have a query log of failures.
