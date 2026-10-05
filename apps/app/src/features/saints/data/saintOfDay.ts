import { getEntry, getRememberedManifest } from '@/content/contentIndex'
import type { PracticeManifest } from '@/content/manifestTypes'
import { getJson } from '@/content/store'
import type { LocalizedText } from '@/content/types'

export type SaintOfDayEntry = {
  name: LocalizedText
  /** Primary chapter id (matches the image filename in the book). */
  chapter: string
  reflection?: LocalizedText
}

export type SaintOfDayIndex = Record<string, SaintOfDayEntry>

const INDEX_NAME = 'saint-of-day-index'

/** `MM-DD`: the index's key for a date. */
export function saintOfDayKey(date: Date): string {
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** The per-day index from the saint-of-the-day practice; undefined until its manifest has warmed. */
export async function loadSaintOfDayIndex(): Promise<SaintOfDayIndex | undefined> {
  const entry = getEntry('practice/saint-of-the-day')
  if (!entry) return undefined
  const manifest = getRememberedManifest<PracticeManifest>(entry.hash)
  const ref = manifest?.dataHashes?.find((d) => d.name === INDEX_NAME)
  return ref ? getJson<SaintOfDayIndex>(ref.hash) : undefined
}
