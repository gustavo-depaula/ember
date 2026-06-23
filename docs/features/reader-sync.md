# Reader Sync — pray on a Xteink e-ink reader

Reader Sync lets you read Ember's prayer content on a **Xteink X4** pocket e-reader
running the open-source **CrossPoint** firmware. The X4 reads EPUB natively and, on
CrossPoint, can browse up to 8 **OPDS** catalogs over Wi-Fi and download books directly.
Ember turns the phone into one of those OPDS servers: it generates today's prayers as
EPUBs and serves them on the local network, so the reader pulls them with no cables and
no cloud.

This is deliberately **personal and local** — today's Office/Mass/Gospel and (later) your
plan of life are computed live from your preferences, so they belong on the phone, not on
the public Hearth corpus.

## How it works

```
Ember app (phone, foreground)            Xteink X4 (CrossPoint)
─────────────────────────────            ──────────────────────
ReaderSyncScreen → useReaderSync
  └ collectDailyDocuments()  ── SyncDocument[] (lazy build())
  └ startReaderSync()        ── local HTTP server on :8943
         │  GET /opds                  ◄── add OPDS server http://<ip>:8943/opds
         │  GET /opds/daily            ◄── browse "Today"
         │  GET /epub/<id>.epub        ◄── download → read
```

1. The user opens **Settings → Reader Sync** and taps **Start syncing**.
2. The app starts a tiny HTTP server (`react-native-tcp-socket`) bound to the LAN and
   shows `http://<phone-ip>:8943/opds`.
3. On the reader: **Settings → OPDS Servers → Add**, paste that URL, then browse **Today**
   and download the prayer you want.
4. The server runs only while Ember is foregrounded (an iOS constraint). The screen keeps
   the device awake and tears the server down on background, re-arming on return.

## Architecture

Everything lives under `apps/app/src/features/reader-sync/`. The bridge reuses the app's
existing render pipeline — no new content model.

| Module | Responsibility |
|---|---|
| `documents/pipeline.ts` | Headless `practiceId + date → Primitive[]`. Lifts `usePracticeContent`'s resolve→preprocess sequence out of React (explicit date, caller-supplied `QueryClient`). |
| `documents/collectDocuments.ts` | Builds the `SyncDocument[]` to expose. MVP: today's Office (`liturgy-of-the-hours`), Mass (`mass`), Gospel (`gospel-of-the-day`). |
| `documents/renderDocument.ts` | `Primitive[]` chapters → `EpubInput`, sharing one image sink across the book. |
| `serialize/primitivesToXhtml.ts` | `Primitive[] → XHTML`, mirroring `PrimitiveBlock`. |
| `serialize/inline.ts` | Reuses the app's `parseInline`/`parseMarkdown` → escaped XHTML. |
| `serialize/imageSink.ts` | Collects `corpus://<hash>.<ext>` refs for embedding; rewrites to `images/<hash>.<ext>`. |
| `serialize/styles.ts` | The single, minimal, e-ink-friendly EPUB stylesheet. |
| `epub/packageEpub.ts` | `EpubInput → Uint8Array` (ZIP via `fflate`). |
| `epub/epubParts.ts` | container.xml / content.opf / nav.xhtml / toc.ncx / chapter shell. |
| `opds/buildFeed.ts` | OPDS 1.2 Atom navigation + acquisition feeds. |
| `opds/routes.ts` | Maps a GET path → feed XML or freshly-built EPUB (in-memory cache by `id:updated`). |
| `server/localServer.ts` | Minimal HTTP/1.1 GET server over `react-native-tcp-socket`. |
| `server/useReaderSync.ts` | Lifecycle: start/stop, keep-awake, foreground/background re-arm. |
| `ui/ReaderSyncScreen.tsx` | The pairing screen. Route: `settings/reader-sync`. |

### Serializer rules (departures from the live renderer)

The reader is paper: no interaction, single column.

- `interaction` primitives (offerings, resolutions, movements) are **dropped**.
- `select` / `options` / `choice-rich-text` collapse to the **selected/default branch**.
- Galleries flatten to a vertical figure stack.
- Only the user's **primary** language is rendered; secondary facing text is dropped.
- Corpus images are embedded as real zip entries (bytes from `getBlob(hash)`), not data-URIs.

### EPUB validity

Each EPUB ships `mimetype` first and uncompressed, and **both** an EPUB3 `nav.xhtml` and an
EPUB2 `toc.ncx`, because e-ink EPUB engines disagree about which they honor. The CSS is
deliberately plain (no color — mono display, no custom fonts).

## Setup & constraints

- **Native rebuild required.** `react-native-tcp-socket` is a native module; rebuild the dev
  client (`pnpm ios`) after pulling. `fflate` is pure JS.
- **iOS local-network permission.** `app.json` → `ios.infoPlist.NSLocalNetworkUsageDescription`.
  Without it the LAN bind silently fails. iOS shows the prompt the first time the server starts.
- **Same Wi-Fi.** Phone and reader must share a LAN (CrossPoint can also host a hotspot the
  phone joins).
- **Foreground only on iOS.** The TCP listener cannot survive backgrounding; keep Ember open
  while the reader downloads.

## Roadmap

- Today's **Plan of Life** as a multi-chapter EPUB (`filterSlotsForDate`).
- **Library** section: pinned books via `BookSession.getChapter`, chosen practices/collections,
  a document checklist UI.
- Bilingual toggle; HTTP Basic auth with an on-screen passphrase; a QR of the URL.
- Faithful Divinum Officium markup (`markup: 'do'`) instead of the plain inline fallback.
- A QR/scan or mDNS discovery so the user doesn't type the IP.
