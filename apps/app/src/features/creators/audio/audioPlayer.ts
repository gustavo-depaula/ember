/** expo-audio backend wired into the creators store at boot. */

import { type AudioStatus, createAudioPlayer, setAudioModeAsync } from 'expo-audio'

import { recordProgress } from '@/db/repositories/mediaProgress'
import type { AudioBackend } from '@/stores/creatorsStore'
import { useCreatorsStore } from '@/stores/creatorsStore'

type SoundHandle = ReturnType<typeof createAudioPlayer>
type Subscription = { remove(): void }

let player: SoundHandle | undefined
let currentItemId: string | undefined
let statusSubscription: Subscription | undefined
let progressTimer: ReturnType<typeof setInterval> | undefined
// Tracks whether the active player has reported `playing = true` at least
// once. Used to ignore the idle pre-play status (`playing=false, buffering=false`)
// that can fire between createAudioPlayer and player.play(), which would
// otherwise revert the optimistic isPlaying=true the store sets on tap.
let hasStartedPlaying = false

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

function handleStatus(status: AudioStatus): void {
  const store = useCreatorsStore.getState()
  store.onTick(status.currentTime ?? 0)
  if (status.playing) {
    hasStartedPlaying = true
    store.setIsBuffering(false)
    store.setIsPlaying(true)
    return
  }
  if (status.isBuffering) {
    store.setIsBuffering(true)
    return
  }
  // playing=false, isBuffering=false. Only mirror to the store once we've
  // actually seen playback start; otherwise this can fire for the brief idle
  // window right after createAudioPlayer and revert the optimistic state.
  if (hasStartedPlaying) {
    store.setIsBuffering(false)
    store.setIsPlaying(false)
  }
}

function attachStatusListener(): void {
  detachStatusListener()
  if (!player) return
  statusSubscription = player.addListener('playbackStatusUpdate', handleStatus)
}

function detachStatusListener(): void {
  statusSubscription?.remove()
  statusSubscription = undefined
}

function startProgressTimer(itemId: string): void {
  stopProgressTimer()
  progressTimer = setInterval(() => {
    if (!player) return
    void recordProgress(itemId, player.currentTime ?? 0, player.duration ?? undefined).catch(
      () => {},
    )
  }, PROGRESS_PERSIST_MS)
}

function stopProgressTimer(): void {
  if (progressTimer) clearInterval(progressTimer)
  progressTimer = undefined
}

function tearDownPlayer(): void {
  if (!player) return
  detachStatusListener()
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
    hasStartedPlaying = false
    attachStatusListener()
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
    if (currentItemId) startProgressTimer(currentItemId)
  },
  async pause() {
    if (!player) return
    player.pause()
    stopProgressTimer()
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
    stopProgressTimer()
    tearDownPlayer()
    currentItemId = undefined
  },
}

export function installAudioBackend(): void {
  useCreatorsStore.getState().setBackend(audioBackend)
}
