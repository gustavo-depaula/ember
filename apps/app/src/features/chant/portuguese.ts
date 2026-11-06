// Portuguese split into syllables and stressed, for a psalm sung in Portuguese
// on a Gregorian tone. jgabc points a verse by its syllables and accents, but
// reads them by Latin's rules; it takes syllables already split, so the
// Brazilian breviary's psalms are split here by Portuguese spelling, which
// says where each syllable breaks and which one is stressed.

const accented = /[áéíóúâêô]/
const nasal = /[ãõ]/
const vowel = /[aeiouáéíóúâêôãõàü]/
// The consonant pairs that open a syllable together: `pa-dre`, `glo-ri-a`.
const onset = /^(?:[bcdfgkptv][lr]|ch|lh|nh)$/
// Words said with the word after them, never stressed on their own.
const clitics = new Set(
  'a o as os e de da do das dos em no na nos nas um uns que se me te lhe lhes vos por com sem ao aos à às mas nem ou'.split(
    ' ',
  ),
)

const isVowel = (c: string) => vowel.test(c)

/**
 * The vowels of a word grouped into syllable nuclei. A falling diphthong (`ai`,
 * `eu`, `ão`) is one nucleus; two full vowels (`di-a`, `po-e-ta`) are two, as
 * is a vowel and an `i` or `u` that is stressed (`sa-ú-de`) or closes the
 * syllable (`ra-iz`, `ca-ir`, `ra-i-nha`).
 */
function nuclei(word: string): [number, number][] {
  const lower = word.toLowerCase()
  const out: [number, number][] = []
  for (let i = 0; i < lower.length; i++) {
    const c = lower[i]
    if (!isVowel(c)) continue
    // The `u` of `qu` and `gu` belongs to the consonant before it.
    if ((c === 'u' || c === 'ü') && /[qg]/.test(lower[i - 1] ?? '') && isVowel(lower[i + 1] ?? ''))
      continue
    const prev = out.at(-1)
    if (prev && prev[1] === i - 1 && joins(lower, prev[0], i)) prev[1] = i
    else out.push([i, i])
  }
  return out
}

/** Whether the vowel at `at` makes one nucleus with the one before it, which opens at `from`. */
function joins(lower: string, from: number, at: number): boolean {
  const first = lower.slice(from, at)
  const c = lower[at]
  const next = lower.slice(at + 1)
  // A nasal vowel and its glide: `mão`, `mães`, `põe`.
  if (nasal.test(first.at(-1) ?? '') && /[oei]/.test(c)) return true
  if (first.length > 1) return false
  if (c !== 'i' && c !== 'u') return false
  // An `i` or `u` that closes the syllable on a consonant of its own is a vowel of its own.
  if (/^(?:nh|[rlzmn](?![aeiouáéíóúâêôãõ])|[rlz]$)/.test(next) && next.length > 0) return false
  return /[aeoáéóâêô]/.test(first) || (first === 'u' && c === 'i') || (first === 'i' && c === 'u')
}

/** A word cut into its syllables: `ten-de`, `pi-e-da-de`, `a-ben-ço-a-i`. */
export function syllablesOf(word: string): string[] {
  // `ao`, `aos`: a contraction said as one syllable with the word after it.
  if (clitics.has(word.toLowerCase())) return [word]
  const groups = nuclei(word)
  if (groups.length <= 1) return [word]
  const cuts: number[] = []
  for (let n = 1; n < groups.length; n++) {
    const end = groups[n - 1][1] + 1
    const start = groups[n][0]
    const between = word.slice(end, start).toLowerCase()
    // The `qu`/`gu` before a vowel stays with it.
    const glide = /[qg]u$/.test(between) ? 2 : 0
    const consonants = between.slice(0, between.length - glide)
    // `qu`/`gu` opens the next syllable, and any consonant before it closes this one (`por-que`).
    let cut = start - glide
    if (!glide) {
      if (consonants.length >= 2 && onset.test(consonants.slice(-2))) cut -= 2
      else if (consonants.length >= 1) cut -= 1
    }
    cuts.push(cut)
  }
  const out: string[] = []
  let at = 0
  for (const cut of cuts) {
    out.push(word.slice(at, cut))
    at = cut
  }
  out.push(word.slice(at))
  return out
}

/** Which of a word's syllables is stressed, or -1 for a word said with the next one. */
export function stressOf(word: string, syllables: string[]): number {
  const lower = word.toLowerCase()
  if (syllables.length === 1) return clitics.has(lower) ? -1 : 0
  const marked = syllables.findIndex((s) => accented.test(s.toLowerCase()))
  if (marked >= 0) return marked
  const tilde = syllables.findIndex((s) => nasal.test(s.toLowerCase()))
  if (tilde >= 0) return tilde
  // Unmarked: the next-to-last on words in `a`, `e`, `o`, `am`, `em`, `ens`; the last on the rest.
  return /(?:[aeo]s?|am|em|ens)$/.test(lower) ? syllables.length - 2 : syllables.length - 1
}

/** A syllable as jgabc's `applyPsalmTone` reads one (the fields it takes from its own `syllable`). */
export type ToneSyllable = {
  syl: string
  sylnospace: string
  prespace: string
  punctuation: string
  prepunctuation: string
  accent: boolean
  flex: boolean
  space: string
  word?: ToneSyllable[]
}

/** A half-verse of Portuguese as the syllables jgabc points. */
export function toneSyllables(text: string): ToneSyllable[] {
  const out: ToneSyllable[] = []
  for (const token of text.trim().split(/\s+/)) {
    const [, before, body, after] = /^([^\p{L}]*)([\p{L}'’-]*?)([^\p{L}]*)$/u.exec(token) ?? []
    if (!body) {
      // Punctuation standing alone joins the syllable before it.
      const last = out.at(-1)
      if (last) {
        last.punctuation += token.replace(/[*†]/g, '')
        if (token.includes('†')) last.flex = true
      }
      continue
    }
    // `dá-lo`, `livrá-lo`: each half of a hyphened word is a word of its own.
    const words = body.split('-').filter(Boolean)
    words.forEach((w, wi) => {
      const syllables = syllablesOf(w)
      const stress = stressOf(w, syllables)
      const last = wi === words.length - 1
      const word: ToneSyllable[] = syllables.map((s, i) => {
        // A space before a word's first syllable, not before the second half of `dá-lo`.
        const prespace = i === 0 && wi === 0 && out.length ? ' ' : ''
        const text = i === 0 && wi === 0 ? before + s : s
        const closing = i === syllables.length - 1
        return {
          syl: prespace + text,
          sylnospace: text,
          prespace,
          // The hyphen stays where it was printed, after the first half.
          punctuation: closing ? (last ? after.replace(/[*†]/g, '').trim() : '-') : '',
          prepunctuation: '',
          accent: i === stress,
          flex: closing && last && after.includes('†'),
          space: closing && last ? ' ' : '',
        }
      })
      for (const s of word) s.word = word
      out.push(...word)
    })
  }
  return out
}
