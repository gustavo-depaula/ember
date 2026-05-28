import type { LiturgicalSeason } from '@ember/liturgical'

import { pickSpotlight } from '@/features/collections/seasonalSpotlight'

export type Featured = {
  /** The season's hero collection (`collection/…`) for the "For this Season" block. */
  seasonCollectionId: string
  seasonTaglineKey: string
  /** Curated collection rows, rendered as cover-card carousels. */
  devotionRow: string[]
  traditionRow: string[]
}

// Explore owns its own curation now (the old hardcoded `sectionLayout` rows are
// retired here). Ids are filtered against the live catalog at render, so a
// missing collection simply drops out of the row.
const devotionRow = [
  'collection/sacred-heart',
  'collection/divine-mercy',
  'collection/marian',
  'collection/eucharistic',
  'collection/holy-spirit',
  'collection/way-of-the-cross',
  'collection/for-the-dead',
]

const traditionRow = [
  'collection/carmelite',
  'collection/alphonsus-liguori',
  'collection/montfort-spirituality',
  'collection/spiritual-classics',
  'collection/mental-prayer',
  'collection/novenas',
  'collection/litanies',
]

// The traditional weekly devotional cycle (dies domini). Only the days with a
// matching collection are surfaced; the rest lean on the seasonal pick.
export type WeekdayDevotion = { collectionId: string; themeKey: string }

const weekdayDevotions: Record<number, WeekdayDevotion> = {
  1: { collectionId: 'collection/for-the-dead', themeKey: 'mon' }, // Holy Souls
  4: { collectionId: 'collection/eucharistic', themeKey: 'thu' }, // Blessed Sacrament
  5: { collectionId: 'collection/sacred-heart', themeKey: 'fri' }, // Sacred Heart / Passion
  6: { collectionId: 'collection/marian', themeKey: 'sat' }, // Our Lady
}

/** The day's traditional devotion, when one is mapped to an available collection. */
export function weekdayDevotion(date: Date): WeekdayDevotion | undefined {
  return weekdayDevotions[date.getDay()]
}

/** The editorial picks for the day — seasonal hero + the curated collection rows. */
export function pickFeatured(season: LiturgicalSeason, date: Date): Featured {
  const spotlight = pickSpotlight(season, date)
  return {
    seasonCollectionId: spotlight.collectionId,
    seasonTaglineKey: spotlight.taglineKey,
    devotionRow,
    traditionRow,
  }
}
