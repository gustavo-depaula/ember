/** expo-audio backend wired into the creators store at boot. */

import { createAudioPlayer, setAudioModeAsync } from 'expo-audio'

import { recordProgress } from '@/db/repositories/mediaProgress'
import type { AudioBackend } from '@/stores/creatorsStore'
import { useCreatorsStore } from '@/stores/creatorsStore'

type SoundHandle = ReturnType<typeof createAudioPlayer>

let player: SoundHandle | undefined
let currentItemId: string | undefined
let pollTimer: ReturnType<typeof setInterval> | undefined
let progressTimer: ReturnType<typeof setInterval> | undefined

const POLL_MS = 1000
const PROGRESS_PERSIST_MS = 5_000

async function ensureAudioMode(): Promise<void> {
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    // `doNotMix` is required for `setActiveForLockScreen` to associate this
    // player with MPNowPlayingInfoCenter — see expo-audio AudioModule.types.d.ts.
    interruptionMode: 'doNotMix',
  })
}

function startPolling(itemId: string): void {
  stopPolling()
  pollTimer = setInterval(() => {
    if (!player) return
    const store = useCreatorsStore.getState()
    store.onTick(player.currentTime ?? 0)
    // Mirror native playback state so lock-screen / AirPods / end-of-track
    // events update the in-app UI without a manual togglePlay call.
    const playing = player.playing
    if (typeof playing === 'boolean') store.setIsPlaying(playing)
  }, POLL_MS)
  progressTimer = setInterval(() => {
    if (!player) return
    void recordProgress(itemId, player.currentTime ?? 0, player.duration ?? undefined).catch(
      () => {},
    )
  }, PROGRESS_PERSIST_MS)
}

function stopPolling(): void {
  if (pollTimer) clearInterval(pollTimer)
  if (progressTimer) clearInterval(progressTimer)
  pollTimer = undefined
  progressTimer = undefined
}

function tearDownPlayer(): void {
  if (!player) return
  player.clearLockScreenControls()
  player.remove()
  player = undefined
}

export const audioBackend: AudioBackend = {
  async load(uri, itemId, metadata) {
    await ensureAudioMode()
    tearDownPlayer()
    player = createAudioPlayer({ uri })
    currentItemId = itemId
    if (metadata) {
      player.setActiveForLockScreen(
        true,
        {
          title: metadata.title,
          artist: metadata.artist,
          albumTitle: metadata.albumTitle,
          artworkUrl: metadata.artworkUrl,
        },
        { showSeekForward: true, showSeekBackward: true },
      )
    }
  },
  async play() {
    if (!player) return
    player.play()
    if (currentItemId) startPolling(currentItemId)
  },
  async pause() {
    if (!player) return
    player.pause()
    stopPolling()
  },
  async seek(s) {
    if (!player) return
    await player.seekTo(s)
  },
  async setRate(rate) {
    if (!player) return
    player.setPlaybackRate(rate)
  },
  async unload() {
    stopPolling()
    tearDownPlayer()
    currentItemId = undefined
  },
}

export function installAudioBackend(): void {
  useCreatorsStore.getState().setBackend(audioBackend)
}
