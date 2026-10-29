// Churches at build time, for pages a search engine can read. Off unless
// EMBER_SITE_CHURCHES is set: the catalogue is large (six figures worldwide),
// and walking it needs the API's `/churches/index` route.
//   EMBER_SITE_CHURCHES=BR,US   churches with service times in those countries
//   EMBER_SITE_CHURCHES=all     every church with service times
import type { Locale } from '~/lib/locale'
import { type Located, locateAll, slug } from './places'
import type { ChurchDetail } from './view'

export { slug }

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

// The directory a page of whole churches at a time (`full=1`): a few dozen requests for what was
// one per church. A backend from before `full` answers with the bare index; its churches are then
// fetched one by one, so a site build never depends on which of the two deployed first.
async function walkIndex(): Promise<ChurchDetail[]> {
  if (!wanted) return []
  const countries =
    wanted === 'all' ? undefined : new Set(wanted.split(',').map((c) => c.trim().toUpperCase()))
  const out: ChurchDetail[] = []
  let after: string | undefined
  do {
    const res = await fetch(
      `${massTimesApi}/churches/index?scheduled=1&full=1&limit=500${after ? `&after=${encodeURIComponent(after)}` : ''}`,
    )
    if (!res.ok) throw new Error(`Mass times index: HTTP ${res.status} from ${massTimesApi}`)
    const page = (await res.json()) as { churches: (IndexedChurch | ChurchDetail)[]; next?: string }
    const kept = page.churches.filter(
      (c) => !countries || countries.has((c.countryCode ?? '').toUpperCase()),
    )
    out.push(
      ...(kept.every((c) => 'services' in c)
        ? (kept as ChurchDetail[])
        : await fetchAll(kept.map((c) => c.id))),
    )
    after = page.next
  } while (after)
  return out
}

export async function fetchChurch(id: string): Promise<ChurchDetail> {
  const res = await fetch(`${massTimesApi}/churches/${encodeURIComponent(id)}`)
  if (!res.ok) throw new Error(`Church ${id}: HTTP ${res.status}`)
  return res.json() as Promise<ChurchDetail>
}

async function fetchAll(ids: string[], concurrency = 16): Promise<ChurchDetail[]> {
  const out: ChurchDetail[] = new Array(ids.length)
  let next = 0
  const worker = async () => {
    while (next < ids.length) {
      const i = next++
      for (let attempt = 1; ; attempt++) {
        try {
          out[i] = await fetchChurch(ids[i])
          break
        } catch (error) {
          if (attempt === 3) throw error
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
        }
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
  return out
}

// A church is published in the language of its country: a Brazilian parish is searched for in
// Portuguese, and a page in both languages would only compete with itself.
const portuguese = new Set(['BR', 'PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL'])

export function churchLocale(countryCode: string | null): Locale {
  return portuguese.has((countryCode ?? '').toUpperCase()) ? 'pt-BR' : 'en-US'
}

export type DirectoryChurch = ChurchDetail & {
  /** Lower-case ISO country code, as it appears in a place's path. */
  country: string
  locale: Locale
  located: Located
}

export type City = { name: string; slug: string; churches: DirectoryChurch[] }
export type Region = { name: string; slug: string; churches: DirectoryChurch[]; cities: City[] }
export type Country = {
  code: string
  locale: Locale
  churches: DirectoryChurch[]
  regions: Region[]
}

/** A city has a page of its own once it has this many churches; a smaller one is listed in its state. */
export const cityPageMin = 2

function group<T>(items: T[], keyOf: (item: T) => string | undefined): Map<string, T[]> {
  const out = new Map<string, T[]>()
  for (const item of items) {
    const key = keyOf(item)
    if (key === undefined) continue
    out.set(key, [...(out.get(key) ?? []), item])
  }
  return out
}

// The spelling most of a city's churches use ("São Paulo" over "Sao Paulo").
function commonest(names: string[]): string {
  const counts = group(names, (name) => name)
  return [...counts.entries()].sort((a, b) => b[1].length - a[1].length)[0][0]
}

async function build(): Promise<Country[]> {
  const details = await walkIndex()
  const placed = locateAll(details)
  const churches: DirectoryChurch[] = details
    .filter((church) => church.countryCode)
    .map((church) => ({
      ...church,
      country: (church.countryCode as string).toLowerCase(),
      locale: churchLocale(church.countryCode),
      located: placed.get(church) ?? {},
    }))
  const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)
  return [...group(churches, (c) => c.country).entries()]
    .map(([code, inCountry]) => ({
      code,
      locale: inCountry[0].locale,
      churches: inCountry,
      regions: [...group(inCountry, (c) => c.located.region?.slug).values()]
        .map((inRegion) => ({
          name: inRegion[0].located.region?.name as string,
          slug: inRegion[0].located.region?.slug as string,
          churches: inRegion,
          cities: [...group(inRegion, (c) => c.located.city && slug(c.located.city)).entries()]
            .filter(([key]) => key)
            .map(([key, inCity]) => ({
              name: commonest(inCity.map((c) => c.located.city as string)),
              slug: key,
              churches: inCity,
            }))
            .sort(byName),
        }))
        .sort(byName),
    }))
    .sort((a, b) => b.churches.length - a.churches.length)
}

let directoryPromise: Promise<Country[]> | undefined

/** The published churches by country, state and city. */
export function directory(): Promise<Country[]> {
  directoryPromise ??= build()
  return directoryPromise
}

export async function churchById(id: string): Promise<DirectoryChurch | undefined> {
  for (const country of await directory()) {
    const church = country.churches.find((c) => c.id === id)
    if (church) return church
  }
  return undefined
}

/** Where a church sits: its country, state and city, each as far as it is known. */
export async function placeOf(church: DirectoryChurch) {
  const country = (await directory()).find((c) => c.code === church.country) as Country
  const region = country.regions.find((r) => r.slug === church.located.region?.slug)
  const city = region?.cities.find((c) => c.slug === slug(church.located.city ?? ''))
  return { country, region, city: city && city.churches.length >= cityPageMin ? city : undefined }
}

/** The churches nearest this one, within its state: the next places a reader near it might go. */
export function nearestChurches(church: DirectoryChurch, among: DirectoryChurch[], count = 6) {
  const km = (a: DirectoryChurch, b: DirectoryChurch) => {
    const rad = Math.PI / 180
    const x = (b.lng - a.lng) * rad * Math.cos(((a.lat + b.lat) / 2) * rad)
    const y = (b.lat - a.lat) * rad
    return Math.sqrt(x * x + y * y) * 6371
  }
  return among
    .filter((other) => other.id !== church.id)
    .map((other) => ({ church: other, km: km(church, other) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, count)
}

export function countryName(code: string, locale: Locale): string {
  return new Intl.DisplayNames([locale], { type: 'region' }).of(code.toUpperCase()) ?? code
}
