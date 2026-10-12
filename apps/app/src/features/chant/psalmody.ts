// A psalm set to its tone, verse by verse.
//
// In the Office a psalm is sung to the tone of its antiphon. The antiphon's
// mode names the tone; which of the tone's endings, the antiphon's own score
// says, in the notes over its closing `E u o u a e` — the vowels of "sæculórum.
// Amen", written there for exactly this. Which syllable of a verse takes which
// note of a cadence is jgabc's work (`psalmtone.generated.js`); what is here
// reads the tone off an antiphon and a psalm out of an hour.

import psalmtone, { type ToneFormulas } from './psalmtone.generated'

export type PsalmTone = {
  /** As chant books name it: `3 b`, `8 G`, `2`. */
  name: string
  clef: string
  mediant: string
  termination: string
}

/** The notes of a score's note groups, letters only: what two transcribers of one ending agree on. */
const noteGroups = (gabc: string) =>
  [...gabc.matchAll(/\(([^)]*)\)/g)]
    .map((m) => m[1].toLowerCase().replace(/[^a-m]/g, ''))
    .filter(Boolean)

const point = (text: string, formula: string, half: 'first' | 'opening' | 'second') =>
  psalmtone.applyPsalmTone({
    text,
    gabc: formula,
    useOpenNotes: false,
    prefix: half !== 'second',
    suffix: half === 'second',
    favor: half === 'opening' ? 'intonation' : half === 'second' ? 'termination' : '',
  })

// `<eu>E(j) u(j) o(j) u(h) a(j) e.</eu>(g.)`, with or without the tags around it.
const euouae =
  /E\([^)]*\)\s*u\([^)]*\)\s*o\([^)]*\)\s*u\([^)]*\)\s*a\([^)]*\)\s*e\.?(?:<\/eu>)?\([^)]*\)/i

const endingsOf = (tone: ToneFormulas): Record<string, string> =>
  tone.terminations ?? { '': tone.termination ?? '' }

/**
 * The tone an antiphon gives its psalm, read from the antiphon's mode and the
 * `euouae` at the end of its score. None for an antiphon transcribed without
 * one (the Benedictus' and the Magnificat's mostly are), or whose ending the
 * tone tables do not list.
 */
export function toneOf(mode: string | undefined, antiphonScore: string): PsalmTone | undefined {
  const sung = euouae.exec(antiphonScore)?.[0]
  if (!mode || !sung) return undefined
  const wanted = noteGroups(sung).join(' ')
  // The fourth and sixth tones have a second form each, transposed, with endings of its own.
  for (const tone of [psalmtone.tones[`${mode}.`], psalmtone.tones[`${mode} alt`]]) {
    if (!tone) continue
    for (const [ending, termination] of Object.entries(endingsOf(tone))) {
      // The six syllables of "sæculórum. Amen" take the ending's last six groups.
      const pointed = noteGroups(point('sæculórum. Amen.', termination, 'second'))
      if (pointed.slice(-6).join(' ') === wanted) {
        return {
          name: ending ? `${mode} ${ending}` : mode,
          clef: tone.clef,
          mediant: tone.mediant,
          termination,
        }
      }
    }
  }
  return undefined
}

/** A tone's first half without its intonation, which only a psalm's first verse sings. */
function reciting(mediant: string): string {
  const notes = mediant.split(' ')
  return notes.slice(notes.findIndex((note) => note.endsWith('r'))).join(' ')
}

/**
 * Verses as a GABC score in `tone`. A verse is its two halves around the
 * asterisk; one without an asterisk is sung through on the ending.
 */
export function pointPsalm(tone: PsalmTone, verses: string[]): string {
  const lines = verses.map((verse, i) => {
    const [first, ...rest] = verse.split('*').map((half) => half.trim())
    const second = rest.join(' ')
    if (!second) return `${point(first, tone.termination, 'second')} (::)`
    const mediant = i === 0 ? tone.mediant : reciting(tone.mediant)
    return `${point(first, mediant, i === 0 ? 'opening' : 'first')} *(:) ${point(second, tone.termination, 'second')} (::)`
  })
  return `(${tone.clef}) ${lines.join('\n')}\n`
}

export type Psalm = {
  /** As the hour heads it: `Psalmus 110`. */
  name: string
  verses: string[]
}

/**
 * The psalm in an item of an hour, as Divinum Officium assembles it: the
 * verses under a `!Psalmus` rubric, with the Gloria Patri that closes them,
 * each stripped to the words that are sung.
 */
export function psalmOf(lines: string[]): Psalm | undefined {
  const head = lines.findIndex((line) => /^!(Psalmus|Canticum)\b/.test(line))
  if (head < 0) return undefined
  const verses: string[] = []
  for (const line of lines.slice(head + 1)) {
    if (line.startsWith('Ant.')) break
    // `/:110:9:/` numbers a verse and `/:(fit reverentia):/` is a rubric inside one.
    const sung = line
      .replace(/\/:.*?:\//g, '')
      .replace(/^[VRvr]\.\s*/, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (sung.includes('*')) verses.push(sung)
  }
  if (!verses.length) return undefined
  return {
    name: lines[head]
      .slice(1)
      .replace(/\s*\[.*\]\s*$/, '')
      .trim(),
    verses,
  }
}
