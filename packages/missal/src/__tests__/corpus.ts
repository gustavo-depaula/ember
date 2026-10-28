import { existsSync, readFileSync } from 'node:fs'
import type { MissalSource } from '../mass'
import type { Doc, Formulary, Lectionary, MissalCalendar } from '../types'

// The built corpus source, read straight from `content/missal/`.
const root = new URL('../../../../content/missal/', import.meta.url)
const cache = new Map<string, unknown>()

function read<T>(path: string): T | undefined {
  if (cache.has(path)) return cache.get(path) as T
  const url = new URL(path, root)
  const value = existsSync(url) ? (JSON.parse(readFileSync(url, 'utf8')) as T) : undefined
  cache.set(path, value)
  return value
}

export const calendar = read<MissalCalendar>('calendar.json') as MissalCalendar

export const corpus: MissalSource = {
  formulary: async (id) => read<Formulary>(`formularies/${id}.json`),
  lectionary: async (id) => read<Lectionary>(`lectionary/${id}.json`),
  prefaces: async () => read<Record<string, Doc>>('prefaces.json') ?? {},
}

export function on(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}
