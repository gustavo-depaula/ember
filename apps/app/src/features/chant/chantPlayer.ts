// Plays a chant's melody, one chant at a time: the one asked for stops the one
// before. The melody is rendered to a WAV (`melodyWav`) the first time it is
// played and kept in the cache, then played as a file.

import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio'
import { Directory, File, Paths } from 'expo-file-system'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { melodyOf, type Tone } from './layoutScore'
import { melodyWav, toneAt, toneStarts } from './melody'

type ChantPlayerState = {
  /** The chant sounding now: its catalog id, or `chantKey` of its score. */
  playing?: string
  /** The note of it sounding now, by its place in the melody (`melodyOf`); none in a breath. */
  sounding?: number
}

export const useChantPlayerStore = create<ChantPlayerState>()(immer(() => ({})))

/** The note of a chant sounding now, if it is the one playing: `key` as `PlayToggle` knows it. */
export function useSounding(key: string): number | undefined {
  return useChantPlayerStore((s) => (s.playing === key ? s.sounding : undefined))
}

let player: AudioPlayer | undefined
let finished: { remove(): void } | undefined

function scoreHash(score: string): string {
  let hash = 0
  for (let i = 0; i < score.length; i++) hash = (hash * 31 + score.charCodeAt(i)) | 0
  return (hash >>> 0).toString(36)
}

/** What a chant with no catalog id — one set in a prayer or an hour — is known by: its score. */
export function chantKey(score: string): string {
  return `score-${scoreHash(score)}`
}

// How often the player reports where it is: a note lasts a third of a second at the least.
const updateInterval = 80

/** The melody of a score as a file: rendered once, then read from the cache. */
function melodyFile(key: string, score: string, tones: Tone[]): File {
  const folder = new Directory(Paths.cache, 'chant-melody')
  folder.create({ intermediates: true, idempotent: true })
  // Keyed by the score too, so a corrected transcription is heard as corrected.
  const file = new File(folder, `${key.replace(/\W/g, '-')}-${scoreHash(score)}.wav`)
  if (!file.exists) file.write(melodyWav(tones))
  return file
}

export function stopChant(): void {
  finished?.remove()
  finished = undefined
  // Released alone, an Android player sounds on to the end: silence it first.
  player?.pause()
  player?.remove()
  player = undefined
  useChantPlayerStore.setState((s) => {
    s.playing = undefined
    s.sounding = undefined
  })
}

/** Plays a chant from its first note, stopping whatever chant was sounding. Throws if it cannot. */
export async function playChant(key: string, score: string): Promise<void> {
  stopChant()
  // Heard through the silent switch, as a pitch pipe would be; it stops when the app leaves.
  await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false })
  const tones = melodyOf(score)
  const starts = toneStarts(tones)
  const sound = createAudioPlayer({ uri: melodyFile(key, score, tones).uri }, { updateInterval })
  player = sound
  finished = sound.addListener('playbackStatusUpdate', (status) => {
    if (player !== sound) return
    if (status.didJustFinish) return stopChant()
    const sounding = toneAt(tones, starts, status.currentTime)
    if (sounding !== useChantPlayerStore.getState().sounding)
      useChantPlayerStore.setState((s) => {
        s.sounding = sounding
      })
  })
  useChantPlayerStore.setState((s) => {
    s.playing = key
  })
  sound.play()
}
