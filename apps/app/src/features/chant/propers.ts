// The chant of a Mass proper, found by the proper's own words.
//
// A proper reaches the app as text: Divinum Officium assembles the day's Mass
// and hands over its Introit as lines of Latin. Nothing in that says which page
// of the Gradual it is. So the corpus files every proper's score under the
// folded opening of the text it sets (`chant-index/<genre>`, built by
// scripts/build-corpus.py), and the app asks by the same key — which also makes
// the lookup good for any day, any Missal and any screen that shows the text.

import { getEntry } from '@/content/contentIndex'
import { getJson } from '@/content/store'
import type { Chant } from './chants'
import { type ChantGenre, massPieces, officePieces, pieceKey } from './textKey'

/** The scores of one genre, by the text each sets. */
type ChantIndex = {
  keyLength: number
  /** folded opening → [length of the whole folded text, `<bundle>/<chant>`], shortest first. */
  keys: Record<string, [number, string][]>
}

type ChantBundle = {
  id: string
  chants: Record<string, Omit<Chant, 'id'>>
}

export type ProperChant = Chant & { genre: ChantGenre }

// A tract's text is in some seasons a gradual's, and the reverse; and what
// follows a gradual where a tract would is, on its feasts, the sequence.
const kin: Partial<Record<ChantGenre, ChantGenre[]>> = { gr: ['gr', 'tr'], tr: ['tr', 'gr', 'se'] }

// Keyed by the blob, so a corpus update that changes the index is read afresh.
const loaded = new Map<string, Promise<unknown>>()

function loadOnce<T>(id: string): Promise<T> | undefined {
  const entry = getEntry(id)
  if (!entry) return undefined
  let blob = loaded.get(entry.hash)
  if (!blob) {
    blob = getJson<T>(entry.hash)
    loaded.set(entry.hash, blob)
    // A failed read must not be remembered as the answer.
    blob.catch(() => loaded.delete(entry.hash))
  }
  return blob as Promise<T>
}

async function findChant(genre: ChantGenre, key: string): Promise<ProperChant | undefined> {
  const indexes = await Promise.all(
    (kin[genre] ?? [genre]).map((g) => loadOnce<ChantIndex>(`chant-index/${g}`)),
  )
  const filed = indexes.flatMap((index) => index?.keys[key.slice(0, index.keyLength)] ?? [])
  if (!filed.length) return undefined
  // Two chants can open alike — an antiphon with and without its Paschal
  // alleluias. The one whose text runs as long as the text asked for is meant.
  const [, ref] = filed.reduce((best, entry) =>
    Math.abs(entry[0] - key.length) < Math.abs(best[0] - key.length) ? entry : best,
  )
  const [bundleId, chantId] = ref.split('/')
  const bundle = await loadOnce<ChantBundle>(`chant-bundle/${bundleId}`)
  const chant = bundle?.chants[chantId]
  return chant && { ...chant, id: ref, genre }
}

/**
 * The chants of one section of the Mass, in the order they are sung: one for
 * an Introit, two for a Graduale with its Alleluia. `lines` are the section's
 * Latin lines as Divinum Officium writes them, without the head.
 */
export async function findMassChants(head: string, lines: string[]): Promise<ProperChant[]> {
  const found = await Promise.all(
    massPieces(head, lines).map((piece) => findChant(piece.genre, pieceKey(piece))),
  )
  return found.filter((chant) => chant !== undefined)
}

/**
 * The chants of one item of an hour of the Office: the antiphon of a psalm,
 * a hymn, a short responsory. `lines` are the item's Latin lines, head and all.
 */
export async function findOfficeChants(lines: string[]): Promise<ProperChant[]> {
  const found = await Promise.all(
    officePieces(lines).map((piece) => findChant(piece.genre, pieceKey(piece))),
  )
  return found.filter((chant) => chant !== undefined)
}
