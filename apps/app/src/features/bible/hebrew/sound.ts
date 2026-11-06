/**
 * A Hebrew word's sound, from STEPBible's transliteration: `.` between
 * syllables, `/` between pieces, the stressed syllable capitalised
 * (`be./re.Shit`, `ha.laKh`). Read into syllables, lower case, the stressed one
 * marked, for "be·re·**shit**". A name is capitalised too (`'E.lo.Him`), so the
 * stress is the last capital, not the first. God's Name stays as written:
 * YHWH is not pronounced, so it has no syllables.
 *
 * STEPBible puts the stress where the accent sign is. Some accents are written
 * at the word's edge whatever its stress (Deḥî and Yethîbh before the first
 * letter, Pašṭā and Zarqā after the last): on a word that bears no other
 * accent the stress is not known from the sign, and none is marked.
 */
export type Syllable = { text: string; stressed: boolean }

// Prepositive and postpositive accents (Gesenius §15): Segôltā, Pašṭā,
// Yethîbh, Teliša gedôlā and qeṭannā, Deḥî, Zarqā.
const edgeAccents = /[֚֭֮֒֙֠֩]/
const accents = /[֑-֯]/g

export function syllables(transliteration: string, hebrew?: string): Syllable[] {
  const parts = transliteration.split(/[./]+/).filter(Boolean)
  const marks = hebrew?.match(accents) ?? []
  const stressUnknown = marks.length > 0 && marks.every((mark) => edgeAccents.test(mark))
  const capital = (part: string) => /[A-Z]/.test(part) && !part.includes('YHWH')
  let stress = -1
  if (!stressUnknown) {
    parts.forEach((part, i) => {
      if (capital(part)) stress = i
    })
  }
  return parts.map((part, i) =>
    part.includes('YHWH')
      ? { text: part, stressed: false }
      : { text: part.toLowerCase(), stressed: i === stress },
  )
}
