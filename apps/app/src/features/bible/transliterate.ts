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
  // A rough breathing opens a word: it stands on the first vowel, or on the
  // second of an opening diphthong (υἱός, αἷμα), and is said first either way.
  const [first, second] = units
  const isVowel = (unit: (typeof units)[number] | undefined) =>
    unit !== undefined && vowels.includes(unit.letter)
  const h =
    (first?.rough && first.letter !== 'ρ') || (isVowel(first) && isVowel(second) && second.rough)
  const body = units
    .map((unit, i) => {
      const previous = units[i - 1]
      const next = units[i + 1]
      const latin = letters[unit.letter]
      if (latin === undefined) return unit.letter
      if (unit.letter === 'γ' && next && velars.includes(next.letter)) return 'n'
      // υ closing a diphthong, or opening υι, unless a diaeresis parts the two.
      const inDiphthong =
        (previous && 'αεηο'.includes(previous.letter) && !unit.diaeresis) ||
        (next?.letter === 'ι' && !next.diaeresis)
      if (unit.letter === 'υ' && inDiphthong) return 'u'
      if (unit.letter === 'ρ' && unit.rough) return 'rh'
      return latin
    })
    .join('')
  const out = h ? `h${body}` : body
  return first?.upper ? out.charAt(0).toUpperCase() + out.slice(1) : out
}
