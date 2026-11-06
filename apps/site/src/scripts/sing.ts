// Sounds a chant's melody, so a reader who does not read square notes can
// hear how it goes. The notes, their pitch and their timing are the app's
// (features/chant/melody.ts), so the website and the app sing alike.

import type { Tone } from '@/features/chant/layoutScore'
import { sungNotes } from '@/features/chant/melody'

for (const button of document.querySelectorAll<HTMLButtonElement>('button[data-melody]')) {
  const melody = JSON.parse(button.dataset.melody ?? '[]') as Tone[]
  const labels = { play: button.dataset.play ?? '', stop: button.dataset.stop ?? '' }
  let context: AudioContext | undefined
  let ending: number | undefined

  const stop = () => {
    context?.close()
    context = undefined
    clearTimeout(ending)
    button.setAttribute('aria-label', labels.play)
    button.setAttribute('aria-pressed', 'false')
  }

  button.addEventListener('click', () => {
    if (context) return stop()
    context = new AudioContext()
    const out = context.createGain()
    out.gain.value = 0.22
    out.connect(context.destination)

    const begin = context.currentTime + 0.1
    const { notes, duration } = sungNotes(melody)
    for (const { frequency, start, length } of notes) {
      const at = begin + start
      const voice = context.createOscillator()
      const body = context.createGain()
      voice.type = 'triangle'
      voice.frequency.value = frequency
      // Each note leans into the next, as a voice does on one breath (`noteEnvelope`).
      body.gain.setValueAtTime(0, at)
      body.gain.linearRampToValueAtTime(1, at + 0.04)
      body.gain.setValueAtTime(1, at + length - 0.05)
      body.gain.linearRampToValueAtTime(0, at + length + 0.03)
      voice.connect(body).connect(out)
      voice.start(at)
      voice.stop(at + length + 0.05)
    }
    button.setAttribute('aria-label', labels.stop)
    button.setAttribute('aria-pressed', 'true')
    ending = window.setTimeout(stop, (duration + 0.3) * 1000)
  })
}
