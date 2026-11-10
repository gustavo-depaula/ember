import type { ImageSource } from 'expo-image'

import { hearthUrl } from '@/lib/hearth'

type Evangelist = 'matthew' | 'mark' | 'luke' | 'john'

// First word of the compact gospel citation: the evangelist named in full by
// Vatican News ("Matthew 9:9-13" / "Mateus 9,9-13" / "João 3,16-18"), or
// abbreviated as the lectionary does in the offline Gospel the card falls back
// to ("Jo 2, 13-22", "Mc 1,1-8", "Jn 3:16").
const patterns: Array<[Evangelist, RegExp]> = [
  ['matthew', /^(matthew|mateus|mt)\b/i],
  ['mark', /^(mark|marcos|mc|mk)\b/i],
  ['luke', /^(luke|lucas|lc|lk)\b/i],
  ['john', /^(john|jo[aã]o|jo|jn)\b/i],
]

const artVersion = 1

/**
 * Picks a sacred-art painting for the Gospel of the Day card. Three PD
 * paintings exist per evangelist under `content/art/evangelist-<name>-<1..3>`
 * (sourced via `scripts/fetch-explore-art.mjs`, credited in
 * `content/art/CREDITS.md`); the day-index rotates through them so the card
 * stays fresh across the liturgical year. Returns undefined when the citation
 * doesn't name one of the four evangelists, in which case the card falls back
 * to its solid rose-tone block.
 */
export function evangelistArtFor(
  citation: string | undefined,
  dayIndex: number,
): ImageSource | undefined {
  if (!citation) return undefined
  const ev = patterns.find(([, re]) => re.test(citation.trim()))?.[0]
  if (!ev) return undefined
  const variant = (((dayIndex % 3) + 3) % 3) + 1
  return { uri: `${hearthUrl(`art/evangelist-${ev}-${variant}.jpg`)}?v=${artVersion}` }
}
