# Phase 2 — Browse UI

> The first user-visible phase. Phase 1 plumbing is now wrapped in routes, components, and three media players.

**Goal.** Add a creators directory and per-creator profile, a native audio player with background playback, a YouTube iframe video player, and an article reader path. After Phase 2 a user can find a creator, play an episode, watch a video, and read an article — all without follows, search, or offline polish (those land in Phases 3-5).

**Success criteria.**
1. `Browse → Creators` row links to `creators/index`.
2. `creators/[id]` profile shows all available channels with newest items per tab.
3. Audio plays on iOS, Android, and web. iOS lock-screen controls and Now-Playing artwork work. Background audio survives screen-off.
4. YouTube videos play inside the app via the iframe player on all three platforms.
5. Articles open in either summary mode (default) or full-text mode (allowlisted feeds), with markable-as-read state.
6. The persistent Now-Playing mini-bar appears once playback starts.

**Dependencies.** Phase 1 — without `loadCreator`, `feedItems`, or `mediaProgress` repositories, none of this works.

---

## 1. Major design decisions

### 1.1 Audio: `expo-av` over `react-native-track-player`

**Decision.** Use `expo-av`'s `Audio.Sound` API for v1.

**Why.**
- Already in the Expo SDK 55+ baseline; no native module integration step.
- Background playback (`Audio.setAudioModeAsync({ staysActiveInBackground: true })`) and lock-screen controls work out of the box on iOS via the `Now Playing Info Center`. Android: we set the foreground service via Expo's bundled config plugin.
- Web Audio API support via the same module; no platform fork.
- `react-native-track-player` would add ~2 MB to the bundle, an iOS background-mode plist edit, and a separate JS thread management story for ~zero v1 benefit (no queue, no gapless playback, no audio focus needs we can't get from `expo-av`).

**Re-evaluate when.** If we hit (a) the need for true gapless transitions inside a playlist, (b) carplay/Android Auto integration, or (c) a measurable battery regression. None of those are v1 problems.

### 1.2 Video: YouTube iframe player only

**Decision.** Use the official YouTube IFrame API in `react-native-webview` on native and `<iframe>` on web. No `youtube-dl`, no audio-only extraction, no proxying.

**Why.** YouTube ToS forbids extracting audio or rehosting video. The iframe player is the only path that's clearly compliant and that doesn't require an API key. The IFrame API exposes JS-postMessage-based control (play/pause/seek) sufficient for our needs. Apple's app review flags YouTube audio extraction patterns; ship the boring compliant thing.

### 1.3 Article reader: summary by default, full-text by allowlist

**Decision.** All RSS-text channels render in summary mode unless the creator manifest sets `channels[].fullText: true`. Full-text mode pipes feed HTML into a `ReaderWebView`; summary mode shows summary + an "Open original" button that loads the source URL in a WebView (or external browser on web).

**Why.** Many Catholic blogs ship truncated RSS (summary-only), use Cloudflare paywalls for the full article, or have inconsistent CSS that breaks Ember's reader stylesheet. Trying to render every feed as full-text in v1 chases a long tail of breakage. Allowlisting per creator gives editorial control: a known-good feed (consent confirmed, CSS verified) opts in; everything else stays safe.

### 1.4 Routing topology

**Decision.** New routes under `apps/app/src/app/creators/`:

```
creators/
  index.tsx                              # directory grid
  [creatorId].tsx                        # profile (tabs)
  [creatorId]/episode/[itemId].tsx       # detail (audio focus)
  [creatorId]/video/[videoId].tsx        # detail (video focus)
  [creatorId]/article/[itemId].tsx       # detail (article focus)
```

Three sibling detail routes (instead of one polymorphic route) so each can own its layout, header behavior, and back-stack semantics without runtime branching.

**Why three routes, not one.** The audio detail screen is the player; the video detail screen is the iframe player; the article detail screen is the reader. Trying to host all three under a polymorphic `[itemId]` would force route-level conditionals that complicate deep links, sharing, and back-stack expectations.

### 1.5 Now-Playing mini-bar lives at the layout level

**Decision.** Render `<NowPlayingBar />` inside `apps/app/src/app/_layout.tsx`, above the navigation surface. Its visibility is driven by `creatorsStore.nowPlaying != null`.

**Why.** The mini-bar must follow the user across every screen — Home, Browse, Settings, deep inside a practice flow. Layout-level mounting is the only way to keep it persistent without prop-drilling state through every route. The component itself remains thin (state read + tap routing).

### 1.6 Player state lives in Zustand, not the route

**Decision.** A single `creatorsStore` (Zustand + immer) holds `nowPlaying`, transport state, and per-item progress (transient). Route components subscribe to the slice they need.

**Why.** Audio outlives a route — the user can navigate away from the detail screen and continue listening. Storing player state in route props or contexts would tear down on unmount. Zustand persists across navigation by default.

### 1.7 Player uses pinned local file URI when available, streams otherwise

**Decision.** On player start, the audio module asks `feedItems.getPinnedMediaUri(itemId)`. If present, load `file://...` URI; otherwise stream from `media_url`.

**Why.** Existing pinning manager already protects pinned blob hashes from LRU eviction. Wiring playback to look at the local blob first means pinned items work cold without any new offline machinery. A single boolean check at start; no protocol-level shims.

### 1.8 ReaderWebView reuse — no fork

**Decision.** Reuse the existing `apps/app/src/features/books/ReaderWebView.tsx` `ReaderWebViewHandle` contract for the article reader and add a parallel `YouTubeIFrameView` that conforms to the same handle interface.

**Why.** ReaderWebView already handles pagination messages, page tracking, and theming. Article reader needs none of that — but if we adopt the same handle, future improvements (font preferences, link handling) accrue once and work everywhere. The YouTube iframe is a different beast (no pagination), but exposing it through the same handle keeps the surface uniform: `loadSequence(html, page=0)` for articles maps cleanly to `loadSequence(embedHtml, 0)` for the YT iframe.

---

## 2. Tasks

### 2.1 Browse integration

1. Add `creatorsIds: string[]` (or equivalent) to `apps/app/src/app/browse/sectionLayout.ts`. Populate from `getCreators().map(c => c.id)`.
2. Render a horizontal `Creators` row in `browse/index.tsx`, slotted between Formation and Themes. Reuse the existing `CardRow` component pattern. Card: avatar (circular), name (1-line), byline (1-line, dim).
3. Tap → `router.push('/creators')`.

### 2.2 Directory route

4. Create `apps/app/src/app/creators/index.tsx`:
   - `useQuery(['creators'], getCreators)` for the list.
   - Filter chips above the grid: language (en-US / pt-BR / both), charism (multi-select), format (Q&A / lecture / homily / mixed). Filter chips read from `CatalogEntry` hints (`creatorLanguages`, `creatorRole`, plus a derived "has Q&A channel" boolean).
   - Grid: 2 columns on mobile, 3-4 on web/tablet. Card = avatar + name + byline.
   - Header action: `Suggest a creator →` opens `mailto:` (or `Linking.openURL` for the GitHub issue template URL stored in `apps/app/src/config/links.ts`).

### 2.3 Profile route

5. Create `apps/app/src/app/creators/[creatorId].tsx`:
   - `useLocalSearchParams<{ creatorId: string }>()` → strip optional `creator/` prefix tolerantly.
   - `useQuery(['creator', id], () => loadCreator(id))` for manifest.
   - On first mount, `useMutation` triggers `refreshCreator(id)` (Phase 1 fetcher). Discard the result; the cache update flows through React Query observer.
   - `useQuery(['feed-items', id], () => feedItems.getFeedItemsByCreator(id))` populates the tabs.
6. Header: banner image (16:9, 50% gradient overlay), avatar overlapping bottom-left, `Follow ✓` button (Phase 3 wires the action; in this phase the button is rendered but a no-op). Bio paragraph below.
7. Tabs: dynamic — render only the tabs whose channels the creator actually has (`channels[].kind`). Order: Listen, Watch, Read.
   - Listen tab: `FeedItemList` rendering ▶ + ⋯ menu (Pin / Mark played) per row. Pin / mark-played buttons render but are wired in Phase 3.
   - Watch tab: 2-col video grid, thumbnail + title.
   - Read tab: list, title + 1-line summary excerpt + relative date.
8. Footer: external links (`creatorManifest.links.website`, `links.donate`). "Suggest an edit" link → GitHub issue.

### 2.4 Audio player

9. Create `apps/app/src/features/creators/audio/audioPlayer.ts`:
   - Wraps `expo-av`'s `Audio.Sound` API.
   - On `play(itemId)`: resolve via `feedItems.getPinnedMediaUri(itemId)` → fall back to `feed_items.media_url`. Load → set position → play.
   - Calls `Audio.setAudioModeAsync({ staysActiveInBackground: true, playsInSilentModeIOS: true, shouldDuckAndroid: true })` once on first play.
   - Periodic `media_progress` upsert (every 5 s of playback) via `mediaProgress.recordProgress`.
   - Web fallback: same module API; iOS-specific options become no-ops.
10. Now-Playing metadata for iOS lock screen: `Audio.setIsEnabledAsync(true)` + we set `nowPlayingInfo` on each `play()` via the platform module — this requires a small native bridge. **For v1, accept iOS-only basic Now-Playing controls (play/pause); skip artwork & scrubbing on the lock screen if it requires native code beyond expo-av's surface. Push artwork+scrubbing into Phase 5.**

11. Create `apps/app/src/features/creators/audio/AudioPlayerScreen.tsx`:
    - Hero artwork (creator avatar OR episode `image_url`).
    - Scrubbable `<Slider>` driven by player position polling at 1 Hz.
    - Transport: ◀◀15 / ▶⏸ / ▶▶15 / speed (toggle 0.8 / 1.0 / 1.25 / 1.5 / 2.0) / sleep timer (off / 15 / 30 / 60 / end-of-episode) / pin (Phase 3 wires) / share / open-original.
    - Source: `creatorsStore.nowPlaying`.
12. Create `apps/app/src/features/creators/audio/NowPlayingBar.tsx`:
    - Mounted in `apps/app/src/app/_layout.tsx`.
    - Subscribes to `nowPlaying`. Hidden when null. ~56 px tall.
    - Tap → `router.push('/creators/[id]/episode/[itemId]')`.
    - Renders: thumbnail · title · ▶/⏸ · ✕ (close button stops playback and clears `nowPlaying`).

### 2.5 YouTube video player

13. Create `apps/app/src/features/creators/video/YouTubePlayer.tsx`:
    - Native: `react-native-webview` rendering an HTML page with the IFrame Player API:
      ```html
      <div id="player"></div>
      <script src="https://www.youtube.com/iframe_api"></script>
      <script>
        var player;
        function onYouTubeIframeAPIReady() {
          player = new YT.Player('player', {
            videoId: '<%= videoId %>',
            playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
            events: { onStateChange: onStateChange, onError: onError }
          });
        }
        function onStateChange(e) { window.ReactNativeWebView.postMessage(JSON.stringify({type:'state', state:e.data})); }
        function onError(e)       { window.ReactNativeWebView.postMessage(JSON.stringify({type:'error', error:e.data})); }
      </script>
      ```
    - Web: a plain `<iframe src="https://www.youtube.com/embed/<videoId>?...">`.
    - Aspect-ratio container (16:9) with a small chrome footer (creator avatar + open-on-YouTube link).
14. Create `apps/app/src/app/creators/[creatorId]/video/[videoId].tsx` rendering `<YouTubePlayer />`.

### 2.6 Article reader

15. Create `apps/app/src/features/creators/articles/ArticleReader.tsx`:
    - Branch on `creatorChannel.fullText`:
      - **Full-text path**: read `feed_items.summary` (which actually contains the full content for full-text feeds), wrap in a minimal HTML document with the Ember reader stylesheet, hand to `ReaderWebView` via `ReaderWebViewHandle`.
      - **Summary path**: render summary in native Tamagui text + an `Open original` button (`Linking.openURL(web_url)` on web; `<WebView source={{ uri: web_url }}>` on native).
    - Both paths: a `Mark as read` action calls `mediaProgress.markCompleted(itemId)`.
16. Create `apps/app/src/app/creators/[creatorId]/article/[itemId].tsx` hosting `<ArticleReader />`.

### 2.7 Now-Playing store

17. Create `apps/app/src/stores/creatorsStore.ts` (Zustand + immer):

    ```ts
    type CreatorsState = {
      nowPlaying?: { itemId: string; creatorId: string; title: string; imageUri?: string; durationS?: number }
      isPlaying: boolean
      positionS: number
      speed: number
      sleepTimerEndAt?: number
      // Phase 3 adds: follows, latestFeed, voiceByPractice
      play: (item: FeedItemRow) => Promise<void>
      pause: () => Promise<void>
      togglePlay: () => Promise<void>
      seek: (s: number) => Promise<void>
      setSpeed: (s: number) => Promise<void>
      stop: () => Promise<void>
    }
    ```

    Actions delegate to `audioPlayer.ts`; the store mirrors transport state only.

### 2.8 i18n

18. Fill `apps/app/src/lib/i18n/locales/en-US.ts` `creators.*` namespace: tab labels, empty-state copy, sleep-timer options, Suggest-a-creator copy.
19. Mirror in `pt-BR.ts`. Use the `localizeContent()` helper for all `LocalizedText` shaped manifest fields (creator bio, byline, channel title) at render time.

### 2.9 Tests

20. Snapshot test for `creators/index.tsx` rendering with two seed creators.
21. Component test for `NowPlayingBar` toggles via store actions.
22. Manual-only tests for audio playback, YouTube iframe, and lock-screen controls — call these out in the verification checklist; automated coverage is impractical without device.

---

## 3. Files touched / created

### Created

| Path | Purpose |
|---|---|
| `apps/app/src/app/creators/index.tsx` | Directory route |
| `apps/app/src/app/creators/[creatorId].tsx` | Profile route |
| `apps/app/src/app/creators/[creatorId]/episode/[itemId].tsx` | Audio detail |
| `apps/app/src/app/creators/[creatorId]/video/[videoId].tsx` | Video detail |
| `apps/app/src/app/creators/[creatorId]/article/[itemId].tsx` | Article detail |
| `apps/app/src/features/creators/audio/audioPlayer.ts` | `expo-av` wrapper |
| `apps/app/src/features/creators/audio/AudioPlayerScreen.tsx` | Full-screen player |
| `apps/app/src/features/creators/audio/NowPlayingBar.tsx` | Layout-level mini-bar |
| `apps/app/src/features/creators/video/YouTubePlayer.tsx` | Iframe-based player |
| `apps/app/src/features/creators/articles/ArticleReader.tsx` | Summary + full-text branches |
| `apps/app/src/features/creators/components/CreatorCard.tsx` | Used by directory grid + Browse row |
| `apps/app/src/features/creators/components/FeedItemList.tsx` | Listen/Watch/Read row |
| `apps/app/src/stores/creatorsStore.ts` | Zustand + immer |
| `apps/app/src/config/links.ts` | Suggest-a-creator GH URL constant |

### Modified

| Path | Change |
|---|---|
| `apps/app/src/app/_layout.tsx` | Mount `<NowPlayingBar />` above the nav surface |
| `apps/app/src/app/browse/index.tsx` | Render Creators row from `sectionLayout.creatorsIds` |
| `apps/app/src/app/browse/sectionLayout.ts` | Add `creatorsIds` |
| `apps/app/src/lib/i18n/locales/en-US.ts` | Fill `creators.*` namespace |
| `apps/app/src/lib/i18n/locales/pt-BR.ts` | Mirror |

---

## 4. Open questions

1. **Lock-screen artwork and scrubbing on iOS.** `expo-av` exposes only basic now-playing info. Full artwork + remote scrubbing requires a small Expo config plugin or `expo-music-info` patch. **Push to Phase 5** unless we can confirm an out-of-the-box path.
2. **YouTube iframe and Apple's PiP.** PiP works automatically on iOS Safari but is gated by user gesture in WKWebView. Acceptable for v1; revisit if maintainer asks.
3. **Article-reader CSS override per creator.** A clean blog might want a creator-specific stylesheet. Defer; use the Ember reader stylesheet uniformly in v1.
4. **Should the directory's "Suggest a creator" use mailto or GitHub issue URL?** Defaulting to GitHub issue with mailto fallback (some users have no `mailto` handler on iOS). Decide on launch.

---

## 5. Verification

| Check | How |
|---|---|
| Directory renders | Open `/creators` with two seed creators committed; confirm grid + filters. |
| Profile renders | Tap a creator; confirm tabs match channel kinds; first feed refresh populates tabs within 2 s on Wi-Fi. |
| Audio plays in foreground | Tap ▶ on an episode; sound starts within 500 ms (cached) or 2 s (streaming). |
| Audio plays in background | Lock the device mid-playback; audio continues. iOS lock-screen control panel shows ▶⏸. |
| Audio plays from pinned blob | Set `feed_items.pinned = 1`, force airplane mode, tap ▶ — plays from local file. |
| Video plays | Tap a video tile on profile; YT iframe loads on web + iOS + Android. Confirm CSS box reaches edges (no inner-content scroll). |
| Article opens | Summary mode: shows summary + "Open original" button. Full-text mode (allowlisted): renders inside ReaderWebView. |
| Mini-bar persistence | Start audio, navigate to Home, then to a Practice — mini-bar stays visible. |
| Mini-bar dismiss | Tap ✕ — playback stops, mini-bar disappears. |
| Progress persistence | Play 30 s of an episode, kill the app, reopen — `mediaProgress.position_s` reflects the last playback position. |
| Speed change | 1.0× → 1.5× — pitch is preserved (default expo-av behavior). |
| i18n | Toggle to pt-BR — tab labels, empty states, sleep-timer options translate; creator bios fall back to en-US if pt-BR absent. |

---

## 6. Phase 2 → Phase 3 handoff

After Phase 2:
- Players, profile, directory, mini-bar are all rendered. Follows are visual no-ops (button does nothing).
- `creatorsStore` exists with transport state.
- `mediaProgress` is being written by the audio player on every 5 s.

Phase 3 wires the Follow button, the home Latest row, the per-creator auto-pin, and the network-aware UX.
