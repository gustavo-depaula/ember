import { fetchHearth } from '@/lib/hearth'

/**
 * The accents as Gesenius' Hebrew Grammar §15 lists them (`accents.json`,
 * written by scripts/hebrew-bible/accents.py): the prose system of 21 books,
 * and the poetic one of Psalms, Proverbs and Job's dialogue.
 */
export type Accent = {
  /** Gesenius' number in his list, e.g. `2`, `4 b`. */
  n: string
  name: string
  hebrew: string
  /** The marks that make it, as `U+05XX`. */
  marks: string[]
  section: string
  /** A condition in words; `U+05C0` means a paseq follows the word. */
  with?: string
  position?: 'prepositive' | 'postpositive'
  pause?: 'great'
}

export type AccentTable = {
  source: string
  systems: { poetic: string[]; job: [from: string, to: string] }
  prose: { disjunctive: Accent[]; conjunctive: Accent[] }
  poetic: { disjunctive: Accent[]; conjunctive: Accent[] }
}

export function getAccentTable(corpus: string): Promise<AccentTable> {
  return fetchHearth<AccentTable>(`bible/${corpus}/accents.json`)
}

/** Psalms, Proverbs and Job 3:2–42:6 use the poetic accents; the rest the prose. */
export function accentSystem(
  table: AccentTable,
  bookId: string,
  chapter: number,
  verse: number,
): 'prose' | 'poetic' {
  if (bookId !== 'job') return table.systems.poetic.includes(bookId) ? 'poetic' : 'prose'
  const at = (cv: string) => cv.split(':').map(Number) as [number, number]
  const [[c1, v1], [c2, v2]] = table.systems.job.map(at)
  const after = chapter > c1 || (chapter === c1 && verse >= v1)
  const before = chapter < c2 || (chapter === c2 && verse <= v2)
  return after && before ? 'poetic' : 'prose'
}

export type WordAccent = {
  accent: Accent
  kind: 'disjunctive' | 'conjunctive'
  /** The word ends a half or the whole verse: its vowels may lengthen in pause (§29 i). */
  inPause: boolean
}

const paseq = '׀'
const has = (slot: string | undefined, mark: string) =>
  slot?.includes(String.fromCodePoint(Number.parseInt(mark.slice(2), 16))) === true

/**
 * The accent a word carries, read from its marks and its neighbours'. A word
 * can bear more than one mark; the strongest disjunctive is its accent, else
 * its conjunctive. Undefined for a word with none (one joined by maqaf takes
 * the accent of the word after it).
 *
 * The conditions are §15's: Sillûq is the stroke under the verse's last word
 * (elsewhere it is the meteg, a secondary stress); Legarmēh and the great
 * Šalšèleth are followed by a paseq; in the poetic books ʿÔlè weyôrēd is ʿÔlè
 * over the word with Mêrekhā under it or under the next word, Rebhîaʿ mugrāš
 * is Rebhîaʿ with Gèreš on the same word, and Rebhîaʿ qāṭôn stands right
 * before ʿÔlè weyôrēd.
 */
export function accentOf(
  table: AccentTable,
  system: 'prose' | 'poetic',
  slots: readonly string[],
  index: number,
): WordAccent | undefined {
  const word = slots[index]
  if (!word) return undefined
  // The next slot that is a word, and whether a paseq stands between.
  let next = index + 1
  let paseqAfter = false
  while (next < slots.length && slots[next].trim() === paseq) {
    paseqAfter = true
    next++
  }
  if (word.endsWith(paseq)) paseqAfter = true
  const following = slots[next]
  const last = word.includes('׃') || index === slots.length - 1
  const accents = table[system]

  // Meʾayyelā: the Ṭiphḥā sign on a word that bears the verse's great pause
  // itself, or is joined by maqaf to one that does (§15 f). There it marks a
  // secondary stress, and the word does not divide.
  const pausal = (slot: string | undefined, at: number) =>
    has(slot, 'U+0591') ||
    (has(slot, 'U+05BD') && (slot?.includes('\u05c3') || at === slots.length - 1))
  const meayyela =
    system === 'prose' &&
    has(word, 'U+0596') &&
    (pausal(word, index) || (word.endsWith('\u05be') && pausal(following, next)))
  const oleh = (slot: string | undefined) => has(slot, 'U+05AB')
  const yored = (slot: string | undefined) => has(slot, 'U+05A5')
  const fits = (accent: Accent) => {
    const condition = accent.with
    // ʿÔlè weyôrēd: ʿÔlè over this word or the one before, Mêrekhā under this
    // one or the next. The pause falls where the Mêrekhā is.
    if (condition?.startsWith('ʿÔlè over the word')) {
      return (
        (oleh(word) && (yored(word) || yored(following))) ||
        (yored(word) && !oleh(word) && oleh(slots[index - 1]) && !yored(slots[index - 1]))
      )
    }
    if (!accent.marks.every((mark) => has(word, mark))) return false
    // The same sign as Meʾayyelā: Ṭiphḥā only where that reading does not hold.
    if (accent.marks[0] === 'U+0596' && system === 'prose' && !condition) return !meayyela
    if (!condition) return true
    if (condition === 'U+05C0') return paseqAfter
    if (condition.startsWith('no paseq')) return !paseqAfter
    if (condition.startsWith('the last word')) return last
    if (condition.startsWith('immediately before ʿÔlè')) return oleh(following)
    if (condition.startsWith('Gèreš on the same word')) return true
    // In the poetic books this mark is always Ṭarḥā; Deḥî is another sign.
    if (condition.startsWith('under the tone-syllable')) return true
    // Ṣinnôrîth has a code point of its own (U+0598); it only ever leans on
    // the Mêrekhā or Mahpākh after it, which outrank it on the same word.
    if (condition.startsWith('over an open syllable')) return true
    if (condition.startsWith('a word that also bears Sillûq')) return meayyela
    return false
  }

  // The more marks an accent needs, the more particular it is: Rebhîaʿ mugrāš
  // before plain Rebhîaʿ. Then Gesenius' order, strongest first.
  const byStrength = (list: Accent[]) =>
    [...list].sort(
      (a, b) => b.marks.length - a.marks.length || Number.parseFloat(a.n) - Number.parseFloat(b.n),
    )
  for (const accent of byStrength(accents.disjunctive)) {
    if (!fits(accent)) continue
    // The ʿÔlè half of a two-word ʿÔlè weyôrēd is not where the verse pauses.
    const split = accent.marks[0] === 'U+05AB' && !yored(word)
    return { accent, kind: 'disjunctive', inPause: accent.pause === 'great' && !split }
  }
  for (const accent of byStrength(accents.conjunctive)) {
    if (fits(accent)) return { accent, kind: 'conjunctive', inPause: false }
  }
  return undefined
}
