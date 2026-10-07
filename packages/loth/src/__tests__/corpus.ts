import { existsSync, readFileSync } from 'node:fs'
import type { LothCalendar } from '../day'
import type { HourPart, LothSource } from '../hour'
import type { Office } from '../office'
import type { Block } from '../text'

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

// Where the reference is known to be at fault, and the corpus has the book's
// text. The Magnificat's antiphon of 17-23 December goes by the date, and on
// two evenings the reference has the next day's; and its second Vespers of
// Christ the King stop after the responsory.
export const amended = (office: Office) => {
  const { date, hour } = office
  if (hour !== 'vespers') return false
  if (office.celebration?.id === 'tempore.solemnity.christ-the-king') return !office.firstVespers
  return (
    date.getMonth() === 11 &&
    ((date.getDate() === 17 && date.getDay() === 0) ||
      (date.getDate() === 22 && date.getDay() === 6))
  )
}

// Where the app set a text into the hour only as it was shown (the Sunday's
// antiphon of the Gospel canticle outside Ordinary Time), the reference has
// its label and nothing after; the corpus supplies the text, and here it is
// taken out again so the rest of the hour is still held to the reference.
export const asInTheReference = (part: HourPart): Block[] =>
  part.supplied
    ? [{ k: 'p', lines: [part.blocks[0].lines[0].filter((seg) => typeof seg !== 'string')] }]
    : part.blocks
