/**
 * Biblical (`hbo`) or modern Hebrew (`he`): one script, set right to left,
 * never hyphenated, in a face that draws its points and accents.
 */
export function isHebrew(language: string | undefined) {
  const lang = (language ?? '').toLowerCase()
  return lang.startsWith('hbo') || lang === 'he' || lang.startsWith('he-')
}

/** How much of the Masoretic pointing a Hebrew page shows. */
export type HebrewMarks = 'letters' | 'vowels' | 'chant'

// Chant is the text as the codex has it. Vowels drops the cantillation
// (U+0591–U+05AF) and the meteg/silluq stroke (U+05BD), which is an accent
// mark too. Letters keeps the consonants: no vowels, dagesh, rafe, shin and sin
// dots, qamats qatan, nor the dots over or under a letter. Maqaf, paseq and sof
// pasuq are punctuation and stay at every level.
const hidden: Record<Exclude<HebrewMarks, 'chant'>, RegExp> = {
  vowels: /[֑-ֽ֯]/g,
  letters: /[֑-ׇֽֿׁׂׅׄ]/g,
}

/** `text` with only the marks `marks` shows. */
export function showHebrewMarks(text: string, marks: HebrewMarks): string {
  return marks === 'chant' ? text : text.replace(hidden[marks], '')
}
