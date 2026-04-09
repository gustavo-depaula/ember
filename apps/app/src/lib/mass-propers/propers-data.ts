import type { RawProperFile } from '@ember/mass-propers'
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
