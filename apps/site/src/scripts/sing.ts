// Sounds a chant's melody, so a reader who does not read square notes can
// hear how it goes. A plain tone, one note after another at the pulse of
// sung prayer: a guide to the tune, not a performance of it.
type Tone = { pitch?: number; beats: number }

const pulse = 0.36 // seconds
// The staff's `do` is written as C; pitches count semitones from the C an octave below it.
const midiOfZero = 48

for (const button of document.querySelectorAll<HTMLButtonElement>('button[data-melody]')) {
  const melody = JSON.parse(button.dataset.melody ?? '[]') as Tone[]
  const labels = { play: button.dataset.play ?? '', stop: button.dataset.stop ?? '' }
  let context: AudioContext | undefined
  let ending: number | undefined

  const stop = () => {
    context?.close()
    context = undefined
    clearTimeout(ending)
    button.textContent = labels.play
    button.setAttribute('aria-pressed', 'false')
  }

  button.addEventListener('click', () => {
    if (context) return stop()
    context = new AudioContext()
    const out = context.createGain()
    out.gain.value = 0.22
    out.connect(context.destination)

    // Chant has no fixed pitch: set it where a congregation sings, the top of the tune near D.
    const pitches = melody.flatMap((tone) => (tone.pitch === undefined ? [] : [tone.pitch]))
    const shift = Math.min(0, 74 - (Math.max(...pitches) + midiOfZero))
    let at = context.currentTime + 0.1
    for (const tone of melody) {
      const length = tone.beats * pulse
      if (tone.pitch !== undefined) {
        const voice = context.createOscillator()
        const body = context.createGain()
        voice.type = 'triangle'
        voice.frequency.value = 440 * 2 ** ((tone.pitch + midiOfZero + shift - 69) / 12)
        // Each note leans into the next, as a voice does on one breath.
        body.gain.setValueAtTime(0, at)
        body.gain.linearRampToValueAtTime(1, at + 0.04)
        body.gain.setValueAtTime(1, at + length - 0.05)
        body.gain.linearRampToValueAtTime(0, at + length + 0.03)
        voice.connect(body).connect(out)
        voice.start(at)
        voice.stop(at + length + 0.05)
      }
      at += length
    }
    button.textContent = labels.stop
    button.setAttribute('aria-pressed', 'true')
    ending = window.setTimeout(stop, (at - context.currentTime) * 1000 + 200)
  })
}
