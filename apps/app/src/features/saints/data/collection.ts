import type { SaintEntry } from './catalog'

/**
 * Whether the soul has "collected" this saint. Until a collect/unlock mechanic
 * exists, a saint counts as collected once a hand-illustrated holy card exists
 * for it. This is the single seam to rewire — nothing else in the gallery asks
 * the question.
 */
export function isCollected(saint: SaintEntry): boolean {
  return !!saint.cardImage
}
