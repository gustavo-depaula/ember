import type { RawProperFile } from '@ember/mass'
import { fetchHearth } from '@/lib/hearth'

export async function loadTempora(id: string): Promise<RawProperFile | undefined> {
  try {
    return await fetchHearth<RawProperFile>(`propers/tempora/${id}.json`)
  } catch {
    return undefined
  }
}

export async function loadSancti(id: string): Promise<RawProperFile | undefined> {
  try {
    return await fetchHearth<RawProperFile>(`propers/sancti/${id}.json`)
  } catch {
    return undefined
  }
}

// Divinum Officium occurrence values (id→number) used to decide tempora vs
// sancti by DO's own precedence. Fetched once and memoized for the session.
let ranksCache: Promise<Record<string, number> | undefined> | undefined

export function loadRanks(): Promise<Record<string, number> | undefined> {
  if (!ranksCache) {
    ranksCache = fetchHearth<Record<string, number>>('propers/ef-ranks.json').catch(() => undefined)
  }
  return ranksCache
}
