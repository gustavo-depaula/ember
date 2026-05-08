import type { LiturgicalSeason } from '@ember/liturgical'

import type { CollectionId } from './sectionLayout'

export type Spotlight = {
  collectionId: CollectionId
  taglineKey: string
}

/**
 * Pick the hero collection for the day. Liturgical season takes precedence; if
 * none of the seasons fire, fall back to month-based spotlights (May/Oct → Marian,
 * June → Sacred Heart, November → For the Dead). Last fallback: the daily rule.
 */
export function pickSpotlight(season: LiturgicalSeason, date: Date): Spotlight {
  if (season === 'advent') {
    return { collectionId: 'collection/marian', taglineKey: 'pray.spotlight.advent' }
  }
  if (season === 'christmas' || season === 'epiphany') {
    return { collectionId: 'collection/marian', taglineKey: 'pray.spotlight.christmas' }
  }
  if (season === 'lent' || season === 'septuagesima') {
    return {
      collectionId: 'collection/way-of-the-cross',
      taglineKey: 'pray.spotlight.lent',
    }
  }
  if (season === 'easter') {
    return { collectionId: 'collection/divine-mercy', taglineKey: 'pray.spotlight.easter' }
  }

  const month = date.getMonth()
  if (month === 4 || month === 9) {
    return { collectionId: 'collection/marian', taglineKey: 'pray.spotlight.marianMonth' }
  }
  if (month === 5) {
    return { collectionId: 'collection/sacred-heart', taglineKey: 'pray.spotlight.june' }
  }
  if (month === 10) {
    return { collectionId: 'collection/for-the-dead', taglineKey: 'pray.spotlight.november' }
  }

  return { collectionId: 'collection/base', taglineKey: 'pray.spotlight.ordinary' }
}
