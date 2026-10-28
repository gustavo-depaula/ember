// Which part of a text a chant sets. A liturgical book files more under one
// heading than is sung to one melody: Compline's "Chapter, responsory, verse"
// holds a chapter that is read, a short responsory that is sung and a versicle
// after it; the antiphon of Our Lady is followed by its versicle and prayer.
// Only what the score's own words cover turns to the score.

import type { ChantPrimitive, Primitive } from '@/content/primitives'
import { fold } from './textKey'

// Enough of a line's opening to know it again in a score, and the shortest
// line worth asking about: "Amen" and "Deo gratias" are in half the repertory.
const openingLength = 24
const shortestLine = 12

/** The words under a score's notes, folded as texts are for matching. */
function lyricsOf(score: string): string {
  return fold(
    score
      .replace(/<(v|sp|alt)>.*?<\/\1>/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\([^)]*\)/g, ''),
  )
}

/** The Latin lines of a primitive that carries text; none for a heading, a rubric, a rule. */
function latinLines(primitive: Primitive): string[] | undefined {
  if (primitive.type === 'text') {
    return (primitive.text.secondary ?? primitive.text.primary).split('\n')
  }
  if (primitive.type === 'verses') {
    return primitive.items.map((item) => item.text.secondary ?? item.text.primary)
  }
  return undefined
}

/**
 * Whether the score sings this primitive: it opens with words of the score,
 * and most of it is in the score. Both, because an antiphon is often a verse
 * of its own psalm — the psalm then shares a line with the antiphon's score
 * without being set by it. Undefined for what has no words to ask about.
 */
function sungBy(primitive: Primitive, lyrics: string): boolean | undefined {
  const lines = latinLines(primitive)?.filter((line) => fold(line).length >= shortestLine)
  if (!lines?.length) return undefined
  const found = lines.map((line) => inLyrics(line, lyrics))
  return found[0] && found.filter(Boolean).length * 2 >= found.length
}

/**
 * Whether a line is in the score: by its opening, or, where the books differ
 * by a word (the breviary's "Jucundáre, fília Sion, et exsúlta" is sung
 * without the "et"), by a shorter opening and nearly all of its words.
 */
function inLyrics(line: string, lyrics: string): boolean {
  const folded = fold(line)
  if (lyrics.includes(folded.slice(0, openingLength))) return true
  if (!lyrics.includes(folded.slice(0, shortestLine))) return false
  const words = line.split(/\s+/).map(fold).filter(Boolean)
  return words.filter((word) => lyrics.includes(word)).length * 5 >= words.length * 4
}

/**
 * A text split at what its chants set: `text` turns to the score, `before` and
 * `after` are read as they stand. The sung part is the first run of primitives
 * the score covers; headings and rubrics inside the run go with it, and so do
 * those that open the text when nothing spoken stands between — a proper's
 * title and citation. A text none of which is found in the score (a hymn
 * transcribed with its first stanza only) is taken whole.
 */
export function sungSpan(
  text: Primitive[],
  chants: ChantPrimitive[],
): { before: Primitive[]; text: Primitive[]; after: Primitive[] } {
  const lyrics = chants.map((chant) => lyricsOf(chant.score)).join('')
  const sung = text.map((primitive) => sungBy(primitive, lyrics))
  const first = sung.indexOf(true)
  if (first < 0) return { before: [], text, after: [] }
  let last = first
  for (let i = first + 1; i < text.length && sung[i] !== false; i++) {
    if (sung[i]) last = i
  }
  const start = sung.slice(0, first).every((covered) => covered === undefined) ? 0 : first
  return {
    before: text.slice(0, start),
    text: text.slice(start, last + 1),
    after: text.slice(last + 1),
  }
}
