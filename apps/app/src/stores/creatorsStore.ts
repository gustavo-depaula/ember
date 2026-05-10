/**
 * Creator transport state. Audio outlives a route — the user can navigate
 * away from the detail screen and continue listening — so this lives at
 * module scope, not in a route component.
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type NowPlayingItem = {
  itemId: string
  creatorId: string
  title: string
  imageUri?: string
  durationS?: number
  /** Resolved playback URI: `file://…` for pinned media, otherwise the stream URL. */
  mediaUrl: string
}

export type AudioBackend = {
  load: (uri: string) => Promise<void>
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
  positionS: number
  speed: number
  setBackend: (backend: AudioBackend) => void
  play: (item: NowPlayingItem) => Promise<void>
  togglePlay: () => Promise<void>
  seek: (s: number) => Promise<void>
  setSpeed: (rate: number) => Promise<void>
  stop: () => Promise<void>
  onTick: (positionS: number) => void
  reset: () => void
}

export const useCreatorsStore = create<CreatorsState>()(
  immer((set, get) => ({
    nowPlaying: undefined,
    isPlaying: false,
    positionS: 0,
    speed: 1,

    setBackend(next) {
      backend = next
    },

    async play(item) {
      const prev = get().nowPlaying
      if (prev?.itemId === item.itemId) {
        await backend.play()
        set((s) => {
          s.isPlaying = true
        })
        return
      }
      if (prev) await backend.unload()
      await backend.load(item.mediaUrl)
      await backend.play()
      set((s) => {
        s.nowPlaying = item
        s.isPlaying = true
        s.positionS = 0
      })
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

    reset() {
      backend = noopBackend
      set((s) => {
        s.nowPlaying = undefined
        s.isPlaying = false
        s.positionS = 0
        s.speed = 1
      })
    },
  })),
)
