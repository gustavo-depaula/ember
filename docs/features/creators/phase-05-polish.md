# Phase 5 — Polish

> Last v1 phase. Closes the gap from "works" to "feels like a finished product." After Phase 5, **v1 ships.**

**Goal.** Harden the player, complete pt-BR parity, fill skeleton/empty states, pass an accessibility review, and add background download for pinned media.

**Success criteria.**
1. iOS and Android lock-screen show artwork + scrubbable progress + ▶◀▶▶ controls.
2. Sleep timer ends-of-episode option works precisely (no audio bleed).
3. Every loading state has a skeleton; every empty state has copy + a CTA where appropriate.
4. ≥40% of seed creators are lusophone; pt-BR translations cover every UI string.
5. VoiceOver / TalkBack reads creator profile, player controls, and search results in the user's language.
6. Pinning an episode while the app is backgrounded continues the download.

**Dependencies.** Phases 1-4.

---

## 1. Major design decisions

### 1.1 Lock-screen artwork via a small Expo config plugin (or `expo-music-info`)

**Decision.** `expo-av` exposes `Audio.setNowPlayingInfoAsync({ title, artist, artwork, durationS })` on web and iOS via an Expo config-plugin ([deferred from Phase 2](phase-02-browse-ui.md#1-major-design-decisions)). On Android, the equivalent is a `MediaSession`/`MediaStyle` notification — wired through the same expo-av path.

**Why.** Accept the "small native bridge" cost now (rather than swap to `react-native-track-player`) because the rest of the player has been stable across two phases.

**Fallback if the bridge slips.** Keep v1's basic ▶⏸ controls (already working from Phase 2), defer scrubbing + artwork to v1.1. Communicate openly in release notes — not silently regress.

### 1.2 Sleep-timer "end of episode" option uses `expo-av`'s `playbackStatus.didJustFinish`

**Decision.** When sleep timer = `endOfEpisode`, set a one-shot `onPlaybackStatusUpdate` listener that calls `audioPlayer.stop()` on `didJustFinish`. Other timer values (15 / 30 / 60 min) use `setTimeout`.

**Why.** Avoids manual position-polling for the end-of-episode case (would be off by up to 1 s). Status updates from `expo-av` are reliable for transport events.

### 1.3 Skeletons mirror the final layout 1:1

**Decision.** Each screen with async data has a `<Skeleton>` variant whose box layout matches the final content (avatar circle + 2 lines of text → grey circle + 2 grey rectangles). No spinners.

**Why.** Layout-matching skeletons reduce perceived loading time and avoid layout-shift on render. Spinners imply nothing about the page that's loading.

### 1.4 pt-BR parity is a hard launch gate

**Decision.** v1 does not ship until ≥40% of seed creators are lusophone AND every `creators.*` / `search.*` string has a pt-BR translation reviewed by the maintainer.

**Why.** The PPR-search wow is the killer demo *for pt-BR users*. Shipping with sparse pt-BR content kneecaps the demo. This is a launch gate, not a "nice to have."

### 1.5 Background download via `expo-background-fetch` (best-effort)

**Decision.** Pinning a media URL while backgrounded enqueues the job in `expo-background-fetch` with a minimum interval and a per-job timeout. iOS will surface this through a background URL session; Android via WorkManager — both managed by Expo.

**Why.** Best-effort is honest. Foreground-pin with progress chip remains the primary path. Background fetch fills the obvious "I tapped pin and walked away" case without us re-implementing platform-specific download managers.

### 1.6 Accessibility minimums

**Decision.** Pre-launch checklist:
- All interactive elements have `accessibilityLabel` (creator avatar in directory: `"Padre Paulo Ricardo, sacerdote, lusophone Q&A creator"`).
- Color contrast ≥ 4.5:1 against backgrounds.
- Touch targets ≥ 44×44pt.
- VoiceOver announces transport state changes (Now Playing → "Playing, Posso comungar em pecado mortal").
- Search input has `accessibilityHint` describing the action.

**Why.** A prayer app must be accessible — many users are elderly. Skipping this in v1 sets a precedent we'd regret.

---

## 2. Tasks

### 2.1 Player polish

1. Add lock-screen artwork + scrubbing to `audioPlayer.ts` via `setNowPlayingInfoAsync`. Verify on iOS device + Android device.
2. Implement sleep timer per §1.2. UI in `AudioPlayerScreen.tsx`: action sheet with options.
3. Add a tiny `ProgressChip` to the player when playback is buffering — no full-screen spinner.
4. Persist the user's last-used speed in `preferences['creators.playerSpeed']`; restore on next play.
5. On `didJustFinish` for the last episode in a queue (queue is single-item in v1), surface a 3-second "Up next: <newest unpinned> from <creator>?" toast with a tap-to-play.

### 2.2 Skeletons & empty states

6. `creators/index.tsx`: skeleton grid (8 ghost cards) when `useQuery` is loading.
7. `creators/[id]`: skeleton banner + skeleton tab list when manifest is loading.
8. Listen / Watch / Read tabs: 4 ghost rows.
9. Search overlay: while typing, ghost rows (8) for results.
10. Latest row on Home: ghost cards (4) before first refresh completes.
11. Empty states:
    - Listen tab with no fetched items yet: copy "We're loading {{creator}}'s latest episodes…" + a manual refresh button.
    - Search no-hits: copy "No results yet — Ember's catalog is curated. Have a creator in mind? Suggest one." + Suggest CTA.
    - Latest row when followed but no items yet: skipped (the row hides entirely; no awkward "your followed creators have nothing" stub).

### 2.3 i18n parity pass

12. Audit `apps/app/src/lib/i18n/locales/en-US.ts` for any `creators.*` / `search.*` / `guided.*` keys missing from `pt-BR.ts`. Fill all gaps.
13. Pass copy through the maintainer for tone — religious terminology in pt-BR is sensitive (don't say "pai" when "padre" is right).
14. Pluralization: use ICU MessageFormat where counts vary ("1 episode" / "5 episódios").
15. Date / duration formatting: `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` honor the active locale.

### 2.4 pt-BR seed content

16. Maintainer commits ≥4-5 lusophone seed creators to `content/creators/`.
17. Confirm ≥40% of seed list ratio achieved.

### 2.5 Accessibility

18. Add `accessibilityLabel` + `accessibilityHint` to:
    - Creator avatars (directory + Browse row).
    - Tab buttons on profile.
    - Player transport buttons.
    - Pin / Mark-played / Suggest-edit menu items.
    - Search input + result rows.
19. Run iOS VoiceOver + Android TalkBack walkthroughs of: open directory → open profile → start audio → open search → tap result. Fix any unspoken or wrong-language announcements.
20. Color-contrast audit using a tool (e.g., axe DevTools on web). Bump tokens as needed via `packages/ui` or design tokens.

### 2.6 Background download

21. Add `expo-background-fetch` config to `app.config.ts`.
22. `feedItemPin.ts`: when pin is initiated and app is backgrounded, register a background-fetch task that resumes the download. Foreground = direct download (existing path).
23. iOS: declare the `background-modes: fetch + processing` capability in app.json.
24. Android: ensure WorkManager sufficient for ~50 MB downloads under metered constraints.
25. Add a Settings → Storage toggle: `Allow background download` (default ON).

### 2.7 Tests

26. Snapshot tests for skeleton variants of every async screen.
27. Component test verifying VoiceOver labels are present on all interactive elements (use `@testing-library/react-native`'s `getByA11yLabel`).
28. Manual matrix:
    - iOS 17+ device: lock-screen artwork, sleep-timer, background download.
    - Android 13+ device: same.
    - Web (Chrome + Safari): MediaSession metadata.

---

## 3. Files touched / created

Mostly modifications:

| Path | Change |
|---|---|
| `apps/app/src/features/creators/audio/audioPlayer.ts` | Lock-screen artwork, sleep timer end-of-episode |
| `apps/app/src/features/creators/audio/AudioPlayerScreen.tsx` | Sleep-timer sheet, persisted speed |
| `apps/app/src/features/creators/components/Skeleton*.tsx` | Per-screen skeletons |
| `apps/app/src/features/creators/feeds/fetcher.ts` | Background-fetch hook |
| `apps/app/src/features/creators/pinning/feedItemPin.ts` | Background download enqueue |
| `apps/app/src/lib/i18n/locales/pt-BR.ts` | Parity pass |
| `apps/app/app.config.ts` | Background-fetch capability |
| `content/creators/<lusophone seeds>/` | Seed content |

Created:

| Path | Purpose |
|---|---|
| `apps/app/src/features/creators/components/SkeletonCreatorCard.tsx` | Directory ghost |
| `apps/app/src/features/creators/components/SkeletonFeedRow.tsx` | Tab ghost |
| `apps/app/src/features/search/SkeletonResultRow.tsx` | Search ghost |
| `apps/app/src/features/creators/audio/UpNextToast.tsx` | End-of-episode chaining toast |

---

## 4. Open questions

1. **Background download budget.** iOS background tasks are short and OS-budgeted. Set a per-pin timeout (60 s) and resume on next foreground if exceeded. Acceptable.
2. **MediaSession on web (Firefox specifically).** Firefox's MediaSession support is incomplete. Accept degraded behavior on Firefox; Chrome/Safari/Edge are first-class.
3. **VoiceOver pronunciation of pt-BR creator names.** Some screen readers mispronounce; we won't ship per-creator pronunciation hints in v1.

---

## 5. Verification

| Check | How |
|---|---|
| Lock-screen art + scrub | iOS + Android device — start audio, lock screen, confirm artwork + scrubber + play/pause. |
| Sleep-timer end-of-episode | Start a 5-min episode 4:30 in, set "end of episode" — audio stops at 5:00 ± 0.3 s. |
| Skeletons | Throttle network in dev tools to Slow 3G — every screen shows skeletons during load. |
| pt-BR parity | Toggle locale to pt-BR — every visible string is translated. Run a full walk: directory → profile → play → search. |
| Lusophone ratio | `wc -l content/creators/*/manifest.json | grep -i 'pt-BR' | wc -l` — confirm ≥40% of seed creators. |
| VoiceOver | iOS device with VoiceOver: walk profile → player. All interactive elements speak in user's language. |
| Background download | Start a 50 MB pin, background the app, wait 60 s, foreground — pin completes. |
| Bundle size | `pnpm build:web` — confirm bundle didn't bloat past +200 KB vs. Phase 4. |

---

## 6. v1 launch checklist

After Phase 5, confirm before tagging v1:

- [ ] All Phase 1-5 success criteria pass on iOS + Android + web.
- [ ] Seed creators committed and approved by editorial.
- [ ] pt-BR parity ≥40% lusophone seed.
- [ ] No outstanding crash reports from internal device QA.
- [ ] Privacy review: no analytics, no tracking, no query egress.
- [ ] App Store / Play Store metadata updated (screenshots show the search wow + a creator profile).

After v1 ships, watch metrics for ~2-4 weeks before starting Phase 6 (Series, v1.1).
