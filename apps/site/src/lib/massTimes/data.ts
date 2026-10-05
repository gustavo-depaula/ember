// Churches at build time, for pages a search engine can read. Off unless
// EMBER_SITE_CHURCHES is set: the catalogue is large (six figures worldwide),
// and walking it needs the API's `/churches/index` route.
//   EMBER_SITE_CHURCHES=BR,US   churches with service times in those countries
//   EMBER_SITE_CHURCHES=all     every church with service times
import type { ChurchDetail } from './view'

export const massTimesApi = (
  import.meta.env.PUBLIC_MASS_TIMES_URL ?? 'https://ember-mass-times.dpgu.workers.dev'
).replace(/\/$/, '')

export type IndexedChurch = {
  id: string
  name: string
  longName: string | null
  city: string | null
  region: string | null
  countryCode: string | null
}

const wanted = (process.env.EMBER_SITE_CHURCHES ?? '').trim()

async function walkIndex(): Promise<IndexedChurch[]> {
  if (!wanted) return []
  const countries =
    wanted === 'all' ? undefined : new Set(wanted.split(',').map((c) => c.trim().toUpperCase()))
  const out: IndexedChurch[] = []
  let after: string | undefined
  do {
    const res = await fetch(
      `${massTimesApi}/churches/index?scheduled=1&limit=1000${after ? `&after=${encodeURIComponent(after)}` : ''}`,
    )
    if (!res.ok) throw new Error(`Mass times index: HTTP ${res.status} from ${massTimesApi}`)
    const page = (await res.json()) as { churches: IndexedChurch[]; next?: string }
    out.push(
      ...page.churches.filter(
        (c) => !countries || countries.has((c.countryCode ?? '').toUpperCase()),
      ),
    )
    after = page.next
  } while (after)
  return out
}

let index: Promise<IndexedChurch[]> | undefined

export function indexedChurches(): Promise<IndexedChurch[]> {
  index ??= walkIndex()
  return index
}

export async function fetchChurch(id: string): Promise<ChurchDetail> {
  const res = await fetch(`${massTimesApi}/churches/${encodeURIComponent(id)}`)
  if (!res.ok) throw new Error(`Church ${id}: HTTP ${res.status}`)
  return res.json() as Promise<ChurchDetail>
}

export function slug(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export type Place = { country: string; region: string; slug: string; churches: IndexedChurch[] }

/** Churches by country and region: the pages a "Mass times in São Paulo" search lands on. */
export async function places(): Promise<Place[]> {
  const byPlace = new Map<string, Place>()
  for (const church of await indexedChurches()) {
    if (!church.countryCode || !church.region) continue
    const country = church.countryCode.toLowerCase()
    const key = `${country}/${slug(church.region)}`
    const place = byPlace.get(key) ?? {
      country,
      region: church.region,
      slug: slug(church.region),
      churches: [],
    }
    place.churches.push(church)
    byPlace.set(key, place)
  }
  return [...byPlace.values()].sort((a, b) => a.region.localeCompare(b.region))
}
