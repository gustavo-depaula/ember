import type { LiturgicalSeason } from '@ember/liturgical'

import { getEntry } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { pickSpotlight } from '@/features/collections/seasonalSpotlight'

export type Featured = {
  /** The season's hero collection (`collection/…`) for the "For this Season" block. */
  seasonCollectionId: string
  seasonTaglineKey: string
  /** Daily-meditation practices, rendered as medium text-on-image tiles. */
  meditationRow: MeditationCard[]
}

/** A daily-meditation card: a practice id plus a curated subtitle i18n key
 *  (manifest names alone are thin — e.g. Opus Dei's is the generic "Meditation
 *  of the Day"). */
export type MeditationCard = { id: string; subtitleKey: string }

// The daily-meditation row, shown on Today. Practice ids resolve against the
// live catalog at render, so a missing one drops out.
export const meditationRow: MeditationCard[] = [
  { id: 'practice/intimita-divina', subtitleKey: 'explore.meditation.intimita' },
  { id: 'practice/meditacoes-ligorio', subtitleKey: 'explore.meditation.alphonsus' },
  { id: 'practice/opus-dei-meditation', subtitleKey: 'explore.meditation.opusDei' },
  { id: 'practice/patristic-reading', subtitleKey: 'explore.meditation.patristic' },
]

/** Resolve meditation cards against the live catalog, dropping any practice that
 *  isn't present yet. Returns the entry + its subtitle key alongside the id. */
export function practiceRow(cards: MeditationCard[]): [string, CatalogEntry, string][] {
  return cards
    .map((c) => [c.id, getEntry(c.id), c.subtitleKey] as const)
    .filter((t): t is [string, CatalogEntry, string] => !!t[1] && t[1].kind === 'practice')
}

// The traditional weekly devotional cycle (dies domini) — one curated
// collection per weekday, each with its own short prayer guide + go-deeper.
export type WeekdayDevotion = { collectionId: string; themeKey: string }

const weekdayDevotions: Record<number, WeekdayDevotion> = {
  0: { collectionId: 'collection/dies-sunday', themeKey: 'sun' },
  1: { collectionId: 'collection/dies-monday', themeKey: 'mon' },
  2: { collectionId: 'collection/dies-tuesday', themeKey: 'tue' },
  3: { collectionId: 'collection/dies-wednesday', themeKey: 'wed' },
  4: { collectionId: 'collection/dies-thursday', themeKey: 'thu' },
  5: { collectionId: 'collection/dies-friday', themeKey: 'fri' },
  6: { collectionId: 'collection/dies-saturday', themeKey: 'sat' },
}

/** The day's traditional devotion. Defined for every day of the week. */
export function weekdayDevotion(date: Date): WeekdayDevotion {
  return weekdayDevotions[date.getDay()]
}

/** The editorial picks for the day — the seasonal hero and the meditation row. */
export function pickFeatured(season: LiturgicalSeason, date: Date): Featured {
  const spotlight = pickSpotlight(season, date)
  return {
    seasonCollectionId: spotlight.collectionId,
    seasonTaglineKey: spotlight.taglineKey,
    meditationRow,
  }
}
