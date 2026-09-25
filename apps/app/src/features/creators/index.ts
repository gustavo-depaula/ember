/**
 * Creators — Catholic podcasts, YouTube channels and blogs ("Voices").
 *
 * A self-contained module: screens, feed fetching, audio transport, feed-item
 * pinning and its own repositories (the tables live in the shared migrations).
 * Import it only through this barrel. It is currently unplugged; to plug it
 * back in, wire these seams:
 *
 * - Boot — `app/_layout.tsx`: `startCreators()` in `initCorpus`, before
 *   `rehydratePinned()` (pinning learns the `creator` kind there).
 * - Routes — `app/(tabs)/(today,you,search)/creators/`, one
 *   `export { X as default } from '@/features/creators'` file per screen:
 *   `_layout` → CreatorsLayout, `index` → CreatorsScreen,
 *   `[creatorId]` → CreatorScreen, `[creatorId]/episode/[itemId]` →
 *   EpisodeScreen, `[creatorId]/video/[itemId]` → VideoScreen,
 *   `[creatorId]/article/[itemId]` → ArticleScreen.
 * - Tab bar — `app/(tabs)/_layout.tsx`: render `useNowPlayingAccessory()`
 *   inside `<NativeTabs.BottomAccessory>` when defined.
 * - Explore — `<VoicesCarousel />` after The Library row.
 * - Library — `<FollowedVoicesShelves />` after the saved shelves (and count
 *   `useFollows()` toward `hasPersonal`); `ContinueRow` appends
 *   `useInProgressMedia()` as `<FeedItemCoverCard />`s.
 * - Search — `useCreatorsShortcut()` among the study tiles.
 * - Settings — `<CreatorsStorageSection />` after `<StorageSection />`.
 */

export { useNowPlayingAccessory } from './audio/NowPlayingAccessory'
export {
  FeedItemCoverCard,
  FollowedVoicesShelves,
  VoicesCarousel,
} from './components/VoicesShelves'
export { useFollows, useInProgressMedia } from './hooks'
export { ArticleScreen } from './screens/ArticleScreen'
export { CreatorScreen } from './screens/CreatorScreen'
export { CreatorsLayout } from './screens/CreatorsLayout'
export { CreatorsScreen } from './screens/CreatorsScreen'
export { EpisodeScreen } from './screens/EpisodeScreen'
export { VideoScreen } from './screens/VideoScreen'
export { CreatorsStorageSection } from './settings/CreatorsStorageSection'
export { useCreatorsShortcut } from './shortcut'
export { startCreators } from './start'
