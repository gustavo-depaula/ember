/**
 * Creator transport state. Audio outlives a route — the user can navigate
 * away from the detail screen and continue listening — so this lives at
 * module scope, not in a route component.
 */

import { usePathname } from 'expo-router'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type NowPlayingItem = {
  itemId: string
  creatorId: string
  title: string
  /** Localized creator display name. Surfaced on the lock screen as the artist. */
  creatorName?: string
  imageUri?: string
  durationS?: number
  /** Resolved playback URI: `file://…` for pinned media, otherwise the stream URL. */
  mediaUrl: string
  /** HTML description from the feed; rendered in the player screen if present. */
  summary?: string
  /** Link to the original page (web URL) — surfaced as "Open original" affordance. */
  webUrl?: string
  publishedAt?: number
}

/** Metadata used to populate iOS lock-screen / Control Center / CarPlay. */
export type AudioBackendMetadata = {
  title: string
  artist?: string
  albumTitle?: string
  artworkUrl?: string
}

export type AudioBackend = {
  /** `itemId` lets the backend track which item it's playing without
   * reading from the store mid-flight (the store updates after load).
   * `metadata` is passed at load time so the lock-screen controls appear
   * immediately, before the user taps play. */
  load: (uri: string, itemId: string, metadata?: AudioBackendMetadata) => Promise<void>
  play: () => Promise<void>
  pause: () => Promise<void>
  seek: (s: number) => Promise<void>
  setRate: (rate: number) => Promise<void>
  unload: () => Promise<void>
}

const noopBackend: AudioBackend = {
  async load() {},
  async play() {},
  async pause() {},
  async seek() {},
  async setRate() {},
  async unload() {},
}

// Backend lives outside immer state — immer freezes everything it touches and
// real expo-audio backends own internal mutable handles that must stay live.
let backend: AudioBackend = noopBackend

type CreatorsState = {
  nowPlaying?: NowPlayingItem
  isPlaying: boolean
  /** True while the player is loading / buffering the audio. Drives the
   * spinner state on the play/pause controls so the user has feedback
   * during the gap between tap and audible playback. */
  isBuffering: boolean
  positionS: number
  speed: number
  setBackend: (backend: AudioBackend) => void
  play: (item: NowPlayingItem) => Promise<void>
  togglePlay: () => Promise<void>
  seek: (s: number) => Promise<void>
  setSpeed: (rate: number) => Promise<void>
  stop: () => Promise<void>
  onTick: (positionS: number) => void
  /** Sync the play/pause flag from the backend — used when the user toggles
   * playback from the lock screen, Control Center, or AirPods, so the UI
   * reflects native state without going through `togglePlay`. */
  setIsPlaying: (isPlaying: boolean) => void
  setIsBuffering: (isBuffering: boolean) => void
  reset: () => void
}

export const NOW_PLAYING_BAR_HEIGHT = 56
// The pill floats with a 12pt margin above the safe area; we add a small
// extra cushion so the last item in a scroll list doesn't visually touch it.
const NOW_PLAYING_BAR_GAP = 16

/**
 * Vertical space ScrollViews must reserve so the mini-bar doesn't occlude
 * their last items. Zero when nothing is playing, or when on the now-playing
 * item's own page — the tabs layout hides the accessory there (the full
 * player IS the surface), so reserving space leaves a dead black band.
 */
export function useNowPlayingClearance(): number {
  const pathname = usePathname()
  const nowPlaying = useCreatorsStore((s) => s.nowPlaying)
  if (!nowPlaying) return 0
  if (pathname?.endsWith(`/episode/${nowPlaying.itemId}`)) return 0
  return NOW_PLAYING_BAR_HEIGHT + NOW_PLAYING_BAR_GAP
}

export const useCreatorsStore = create<CreatorsState>()(
  immer((set, get) => ({
    nowPlaying: undefined,
    isPlaying: false,
    isBuffering: false,
    positionS: 0,
    speed: 1,

    setBackend(next) {
      backend = next
    },

    async play(item) {
      const prev = get().nowPlaying
      if (prev?.itemId === item.itemId) {
        set((s) => {
          s.isPlaying = true
        })
        await backend.play()
        return
      }
      // Optimistic: render the player UI immediately so the user never sees
      // "nothing playing" → play → pause flicker while load + play resolve.
      // `isBuffering = true` keeps the spinner showing until the player's
      // status listener reports the buffer is ready and playback has begun.
      set((s) => {
        s.nowPlaying = item
        s.isPlaying = true
        s.isBuffering = true
        s.positionS = 0
      })
      try {
        if (prev) await backend.unload()
        await backend.load(item.mediaUrl, item.itemId, {
          title: item.title,
          artist: item.creatorName,
          albumTitle: item.creatorName,
          artworkUrl: item.imageUri,
        })
        await backend.play()
      } catch (err) {
        await backend.unload().catch(() => undefined)
        set((s) => {
          s.nowPlaying = undefined
          s.isPlaying = false
          s.isBuffering = false
          s.positionS = 0
        })
        throw err
      }
    },

    async togglePlay() {
      const { nowPlaying, isPlaying } = get()
      if (!nowPlaying) return
      if (isPlaying) {
        await backend.pause()
        set((s) => {
          s.isPlaying = false
        })
      } else {
        await backend.play()
        set((s) => {
          s.isPlaying = true
        })
      }
    },

    async seek(s) {
      await backend.seek(s)
      set((draft) => {
        draft.positionS = s
      })
    },

    async setSpeed(rate) {
      await backend.setRate(rate)
      set((s) => {
        s.speed = rate
      })
    },

    async stop() {
      if (get().nowPlaying) await backend.unload()
      set((s) => {
        s.nowPlaying = undefined
        s.isPlaying = false
        s.isBuffering = false
        s.positionS = 0
      })
    },

    onTick(positionS) {
      // Round sub-second jitter so subscribers (slider, progress chip) don't
      // re-render on every poll when audio is paused or barely advancing.
      if (Math.abs(get().positionS - positionS) < 0.5) return
      set((s) => {
        s.positionS = positionS
      })
    },

    setIsPlaying(isPlaying) {
      if (get().isPlaying === isPlaying) return
      set((s) => {
        s.isPlaying = isPlaying
      })
    },

    setIsBuffering(isBuffering) {
      if (get().isBuffering === isBuffering) return
      set((s) => {
        s.isBuffering = isBuffering
      })
    },

    reset() {
      backend = noopBackend
      set((s) => {
        s.nowPlaying = undefined
        s.isPlaying = false
        s.isBuffering = false
        s.positionS = 0
        s.speed = 1
      })
    },
  })),
)
