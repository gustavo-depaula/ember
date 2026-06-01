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
