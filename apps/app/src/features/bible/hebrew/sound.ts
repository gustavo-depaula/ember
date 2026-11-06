/**
 * A Hebrew word's sound, from STEPBible's transliteration: `.` between
 * syllables, `/` between pieces, the stressed syllable capitalised
 * (`be./re.Shit`). Read into syllables, lower case, the stressed one marked,
 * for "be·re·**shit**". A name is capitalised too (`'E.lo.Him`), so the stress
 * is the last capital, not the first. God's Name stays as written: YHWH is not
 * pronounced, so it has no syllables.
 */
export type Syllable = { text: string; stressed: boolean }

export function syllables(transliteration: string): Syllable[] {
  const parts = transliteration.split(/[./]+/).filter(Boolean)
  const capital = (part: string) => /^[^A-Za-z]*[A-Z]/.test(part) && !part.includes('YHWH')
  let stress = -1
  parts.forEach((part, i) => {
    if (capital(part)) stress = i
  })
  return parts.map((part, i) =>
    part.includes('YHWH')
      ? { text: part, stressed: false }
      : { text: part.toLowerCase(), stressed: i === stress },
  )
}
