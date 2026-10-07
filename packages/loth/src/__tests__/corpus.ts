import { existsSync, readFileSync } from 'node:fs'
import type { LothCalendar } from '../day'
import type { LothSource } from '../hour'

// The corpus source, read straight from `content/loth/`.
const root = new URL('../../../../content/loth/', import.meta.url)
const cache = new Map<string, unknown>()

function read<T>(path: string): T | undefined {
  if (cache.has(path)) return cache.get(path) as T
  const url = new URL(path, root)
  const value = existsSync(url) ? (JSON.parse(readFileSync(url, 'utf8')) as T) : undefined
  cache.set(path, value)
  return value
}

export const calendar = read<LothCalendar>('calendar.json') as LothCalendar

export const corpus: LothSource = {
  calendar: async () => calendar,
  index: async (hour) => read(`index/${hour}.json`),
  parts: async (bundle) => read(`parts/${bundle}.json`),
  extras: async () => read('extras.json') ?? {},
}

export function on(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}
