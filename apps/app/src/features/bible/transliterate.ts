// Letter by letter, as the SBL Handbook romanizes Greek: η ē, ω ō, θ th, χ ch,
// υ y except in a diphthong, where it is u.
const letters: Record<string, string> = {
  α: 'a',
  β: 'b',
  γ: 'g',
  δ: 'd',
  ε: 'e',
  ζ: 'z',
  η: 'ē',
  θ: 'th',
  ι: 'i',
  κ: 'k',
  λ: 'l',
  μ: 'm',
  ν: 'n',
  ξ: 'x',
  ο: 'o',
  π: 'p',
  ρ: 'r',
  σ: 's',
  ς: 's',
  τ: 't',
  υ: 'y',
  φ: 'ph',
  χ: 'ch',
  ψ: 'ps',
  ω: 'ō',
}
const vowels = 'αεηιουω'
// γ before a velar is nasal: ἄγγελος angelos, not aggelos.
const velars = 'γκξχ'

/** A Greek word in Latin letters, for the reader who cannot yet sound it out: λόγος logos, ῥῆμα rhēma. */
export function transliterate(word: string): string {
  const chars = [...word.normalize('NFD')]
  // Read the marks off each letter: a rough breathing is an h, a diaeresis
  // keeps a vowel out of a diphthong.
  const units: { letter: string; rough: boolean; diaeresis: boolean; upper: boolean }[] = []
  for (const char of chars) {
    if (/\p{M}/u.test(char)) {
      const unit = units.at(-1)
      if (!unit) continue
      if (char === '̔') unit.rough = true
      if (char === '̈') unit.diaeresis = true
      continue
    }
    const letter = char.toLowerCase()
    units.push({ letter, rough: false, diaeresis: false, upper: letter !== char })
  }
  let out = ''
  units.forEach((unit, i) => {
    const previous = units[i - 1]
    const next = units[i + 1]
    const latin = letters[unit.letter]
    if (latin === undefined) {
      out += unit.letter
      return
    }
    const inDiphthong =
      unit.letter === 'υ' && previous && 'αεηο'.includes(previous.letter) && !unit.diaeresis
    let piece = (() => {
      if (unit.letter === 'γ' && next && velars.includes(next.letter)) return 'n'
      if (inDiphthong || (unit.letter === 'υ' && next?.letter === 'ι' && !next.diaeresis))
        return 'u'
      if (unit.letter === 'ρ' && unit.rough) return 'rh'
      return latin
    })()
    // The breathing of a diphthong stands on its second vowel, but is said first.
    const rough =
      (unit.rough && unit.letter !== 'ρ') ||
      (next?.rough && vowels.includes(unit.letter) && vowels.includes(next.letter) && i === 0)
    const breathed = rough && !(previous && vowels.includes(previous.letter) && i === 1)
    if (breathed) piece = `h${piece}`
    if (unit.upper && i === 0) piece = piece[0].toUpperCase() + piece.slice(1)
    out += piece
  })
  return out
}
