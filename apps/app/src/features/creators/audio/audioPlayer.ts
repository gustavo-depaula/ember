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
    interruptionMode: 'duckOthers',
  })
}

function startPolling(itemId: string): void {
  stopPolling()
  pollTimer = setInterval(() => {
    if (!player) return
    useCreatorsStore.getState().onTick(player.currentTime ?? 0)
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

export const audioBackend: AudioBackend = {
  async load(uri, itemId) {
    await ensureAudioMode()
    if (player) {
      player.remove()
      player = undefined
    }
    player = createAudioPlayer({ uri })
    currentItemId = itemId
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
    if (player) {
      player.remove()
      player = undefined
    }
    currentItemId = undefined
  },
}

export function installAudioBackend(): void {
  useCreatorsStore.getState().setBackend(audioBackend)
}
