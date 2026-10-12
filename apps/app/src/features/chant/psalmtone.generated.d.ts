// What scripts/vendor-psalmtone.mjs keeps of jgabc's psalmtone.js.

export type ToneFormulas = {
  clef: string
  /** The first half of a verse: intonation, reciting note, the cadence at the asterisk. */
  mediant: string
  /** The second half, by the name of the ending; a tone with one ending has `termination` instead. */
  terminations?: Record<string, string>
  termination?: string
}

declare const psalmtone: {
  /** The psalm tones by name: `1.` to `8.`, `4 alt`, `6 alt`, `per.` and the tones of the Introit. */
  tones: Record<string, ToneFormulas>
  /** One half of a verse set to a formula, as GABC without clef or bar. */
  applyPsalmTone: (options: {
    text: string
    gabc: string
    useOpenNotes: boolean
    prefix?: boolean
    suffix?: boolean
    favor?: 'intonation' | 'termination' | ''
  }) => string
}

export default psalmtone
