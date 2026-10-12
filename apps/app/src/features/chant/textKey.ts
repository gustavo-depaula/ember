// A liturgical text reduced to the key its chant is filed under.
//
// This is the app's half of scripts/chant_link.py, which builds the corpus's
// `chant-index` from the same reduction: the two must agree letter for letter,
// and `__tests__/textKey.test.ts` holds this one to the vectors that one writes.
// Read its header for why a text is linked by its words at all.

export type MassGenre = 'in' | 'gr' | 'al' | 'tr' | 'of' | 'co' | 'se'

export type MassPiece = { genre: MassGenre; text: string }

/**
 * Latin reduced to what two editions of a text agree on: letters only, no
 * accents, `j` and `y` as `i`, the diphthongs as `e`, and the spellings that
 * differ between books made one.
 */
export function fold(text: string): string {
  return text
    .toLowerCase()
    .replace(/[æǽ]/g, 'ae')
    .replace(/œ/g, 'oe')
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/j/g, 'i')
    .replace(/y/g, 'i')
    .replace(/ae/g, 'e')
    .replace(/oe/g, 'e')
    .replace(/[^a-z]/g, '')
    .replace(/xs/g, 'x')
    .replace(/ch/g, 'c')
    .replace(/th/g, 't')
    .replace(/ph/g, 'f')
}

/** A section's sung text: references, rubrics and inclusions dropped. */
function words(lines: string[]): string {
  return lines
    .filter((line) => line && !'!&$@#'.includes(line[0]) && !line.startsWith('_'))
    .map((line) =>
      line
        .replace(/\([^)]*\)/g, '')
        .replace(/^[vVR]\.\s*/, '')
        .trim(),
    )
    .filter(Boolean)
    .join(' ')
}

const doubleAlleluia = 'All?el[úu][ij]a,\\s*All?el[úu][ij]a\\.?'

const sung = (lines: string[]) => lines.filter((line) => line && !'!&$@#_'.includes(line[0]))

const opensOnAlleluia = (textLines: string[]) =>
  textLines.length > 0 && new RegExp(`^${doubleAlleluia}$`, 'i').test(textLines[0].trim())

/** The verses under a double Alleluia, each an alleluia of its own. */
const alleluias = (textLines: string[]): MassPiece[] =>
  textLines
    .slice(1)
    .map((line) => words([line]))
    .filter(Boolean)
    .map((text) => ({ genre: 'al', text }))

/**
 * A Graduale as its chants. It is a gradual with an alleluia; or two alleluias
 * in Paschal time; and after a `_` comes what the season adds — a tract in
 * Lent, a sequence on its feasts, a second alleluia now and then.
 */
function betweenTheReadings(all: string[]): MassPiece[] {
  const cut = all.findIndex((line) => line.startsWith('_') || line.startsWith('!Tractus'))
  const lines = cut < 0 ? all : all.slice(0, cut)
  const after = cut < 0 ? [] : all.slice(cut)
  const out: MassPiece[] = []
  if (opensOnAlleluia(sung(lines))) {
    out.push(...alleluias(sung(lines)))
  } else {
    const whole = words(lines)
    const split = new RegExp(doubleAlleluia, 'i').exec(whole)
    const gradual = (split ? whole.slice(0, split.index) : whole).trim()
    const alleluia = split ? whole.slice(split.index + split[0].length).trim() : ''
    if (gradual) out.push({ genre: 'gr', text: gradual })
    if (alleluia) out.push({ genre: 'al', text: alleluia })
  }
  if (opensOnAlleluia(sung(after))) out.push(...alleluias(sung(after)))
  // Filed as a tract; a sequence is found through the index's kin.
  else if (words(after)) out.push({ genre: 'tr', text: words(after) })
  return out
}

const antiphonGenre: Record<string, MassGenre> = {
  Introitus: 'in',
  Offertorium: 'of',
  Communio: 'co',
}

/**
 * The chants a section of the Missal holds, in the order they are sung. `head`
 * is the section's Latin name; `lines` its lines as Divinum Officium writes
 * them, references and all.
 */
export function massPieces(head: string, lines: string[]): MassPiece[] {
  const name = head.split(/[ (]/)[0]
  if (lines[0]?.startsWith('@')) return []
  const genre = antiphonGenre[name]
  if (genre) {
    // The antiphon alone: an Introit goes on to its psalm verse, which the books abbreviate.
    const first: string[] = []
    for (const line of lines) {
      if (line.startsWith('!') && first.length) break
      first.push(line)
    }
    const text = words(first)
    return text ? [{ genre, text }] : []
  }
  if (name === 'Sequentia') return [{ genre: 'se', text: words(lines) }]
  if (name.startsWith('Graduale')) return betweenTheReadings(lines)
  if (name === 'Tractus') {
    const tracts = betweenTheReadings(lines).map(({ text }): MassPiece => ({ genre: 'tr', text }))
    return tracts.length ? tracts : [{ genre: 'tr', text: words(lines) }]
  }
  return []
}

/** A piece of the Missal, folded as the index files it. */
export function pieceKey({ genre, text }: MassPiece): string {
  const key = fold(text)
  return genre === 'al' ? key.replace(/(alleluia)+$/, '') : key
}
