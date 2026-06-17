import type { SaintEntry } from './catalog'

/**
 * Whether the soul has "collected" this saint. The collect/unlock mechanic is a
 * deferred decision (its own brainstorm); for now a saint counts as collected
 * once a hand-illustrated holy card exists for it. This is the single seam to
 * rewire when the mechanic lands — nothing else in the gallery asks the question.
 */
export function isCollected(saint: SaintEntry): boolean {
  return !!saint.cardImage
}
