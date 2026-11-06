// Plays a chant's melody, one chant at a time: the one asked for stops the one
// before. The melody is rendered to a WAV (`melodyWav`) the first time it is
// played and kept in the cache, then played as a file.

import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio'
import { Directory, File, Paths } from 'expo-file-system'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { melodyOf } from './layoutScore'
import { melodyWav } from './melody'

type ChantPlayerState = {
  /** The chant sounding now, by its catalog id. */
  playing?: string
}

export const useChantPlayerStore = create<ChantPlayerState>()(immer(() => ({})))

let player: AudioPlayer | undefined
let finished: { remove(): void } | undefined

/** The melody of a score as a file: rendered once, then read from the cache. */
function melodyFile(id: string, score: string): File {
  const folder = new Directory(Paths.cache, 'chant-melody')
  folder.create({ intermediates: true, idempotent: true })
  // Keyed by the score too, so a corrected transcription is heard as corrected.
  let hash = 0
  for (let i = 0; i < score.length; i++) hash = (hash * 31 + score.charCodeAt(i)) | 0
  const file = new File(folder, `${id.replace(/\W/g, '-')}-${(hash >>> 0).toString(36)}.wav`)
  if (!file.exists) file.write(melodyWav(melodyOf(score)))
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
  })
}

/** Plays a chant from its first note, stopping whatever chant was sounding. Throws if it cannot. */
export async function playChant(id: string, score: string): Promise<void> {
  stopChant()
  // Heard through the silent switch, as a pitch pipe would be; it stops when the app leaves.
  await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false })
  const sound = createAudioPlayer({ uri: melodyFile(id, score).uri })
  player = sound
  finished = sound.addListener('playbackStatusUpdate', (status) => {
    if (status.didJustFinish && player === sound) stopChant()
  })
  useChantPlayerStore.setState((s) => {
    s.playing = id
  })
  sound.play()
}
