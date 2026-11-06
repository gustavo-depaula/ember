import { hyphenateEl } from 'justif/hyphenate/el'

/**
 * Hyphenation for polytonic Greek, from the monotonic patterns justif ships.
 *
 * The patterns know the bare letters and the tonos, not breathings, the
 * circumflex or the iota subscript, so `ἀρχῇ` would match nothing. Each NFC
 * letter of the word is reduced to its bare letter, one for one, the bare
 * word is broken, and the word itself is cut at the same places.
 */
export function hyphenateGreek(word: string): string[] {
  const known = broken.get(word)
  if (known) return known
  const pieces = breakWord(word)
  broken.set(word, pieces)
  return pieces
}

// Every justify of a Greek verse breaks each of its words again; the words of
// the New Testament and the Septuagint are a bounded vocabulary, so each is
// broken once.
const broken = new Map<string, string[]>()

function breakWord(word: string): string[] {
  const letters = [...word]
  const reduced = letters.map((letter) =>
    letter.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase(),
  )
  // A code point that is not one letter (a stray combining mark, which would
  // be cut off its letter) shifts every cut after it: such a word is left whole.
  if (reduced.some((letter) => [...letter].length !== 1)) return [word]
  const bare = reduced.join('')
  const pieces: string[] = []
  let at = 0
  for (const part of hyphenateEl(bare)) {
    const length = [...part].length
    pieces.push(letters.slice(at, at + length).join(''))
    at += length
  }
  return pieces
}
