// Loaders for the Liturgy of the Hours in the corpus.

import type { Block, Hour, HourIndex, LothCalendar, LothSource, PartBundle } from '@ember/loth'
import { getEntry } from '@/content/contentIndex'
import { getJson } from '@/content/store'

async function loadById<T>(id: string): Promise<T | undefined> {
  const entry = getEntry(id)
  if (!entry) return undefined
  return getJson<T>(entry.hash)
}

export const corpusLoth: LothSource = {
  calendar: async () => {
    const calendar = await loadById<LothCalendar>('loth-calendar')
    if (!calendar) throw new Error('Liturgy of the Hours: the calendar is missing from the corpus')
    return calendar
  },
  index: (hour: Hour) => loadById<HourIndex>(`loth-index/${hour}`),
  parts: (bundle: string) => loadById<PartBundle>(`loth-parts/${bundle}`),
  extras: async () => (await loadById<Record<string, Block[]>>('loth-extras')) ?? {},
}
