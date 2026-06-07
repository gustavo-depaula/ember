import type { ImageSource } from 'expo-image'

import { hearthUrl } from '@/lib/hearth'

type Evangelist = 'matthew' | 'mark' | 'luke' | 'john'

// First word of the compact gospel citation ("Matthew 9:9-13" / "Mateus 9,9-13"
// / "João 3,16-18"). Vatican News and the offline mass-of corpus both emit full
// localized book names — no abbreviations — so two patterns per evangelist are
// enough for EN + pt-BR.
const patterns: Array<[Evangelist, RegExp]> = [
  ['matthew', /^(matthew|mateus)\b/i],
  ['mark', /^(mark|marcos)\b/i],
  ['luke', /^(luke|lucas)\b/i],
  ['john', /^(john|jo[aã]o)\b/i],
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
