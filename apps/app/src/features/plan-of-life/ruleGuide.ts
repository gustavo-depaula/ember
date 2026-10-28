import type { SlotState } from '@/db/events'
import { parseSchedule } from './schedule'

/**
 * The page that guides someone in building a rule of life, top to bottom: the
 * sacraments first, then what opens and closes the day, then prayer through
 * the day, then what draws closer to Christ, and last what some are called to.
 * Each tier's title and line, and each practice's when and why, are in the
 * `ruleGuide` i18n namespace under the keys below.
 */
export type GuideTier = {
  key: 'sacraments' | 'daily' | 'throughDay' | 'closer' | 'calling'
  numeral: string
  /** The painting behind the chapter title, by `artFor` id. */
  art: string
  entries: GuideEntry[]
}

/**
 * `massDays`: the Mass is one practice kept at several times, so its rows each
 * stand for the days they keep (Sunday, or the weekdays), not the practice.
 */
export type GuideEntry = { key: string; practiceId: string; massDays?: number[] }

const weekdays = [1, 2, 3, 4, 5, 6]

export const ruleGuide: GuideTier[] = [
  {
    key: 'sacraments',
    numeral: 'I',
    art: 'rule/sacraments',
    entries: [
      { key: 'mass', practiceId: 'practice/mass', massDays: [0] },
      { key: 'confession', practiceId: 'practice/confession' },
    ],
  },
  {
    key: 'daily',
    numeral: 'II',
    art: 'rule/daily',
    entries: [
      { key: 'morningOffering', practiceId: 'practice/morning-offering' },
      { key: 'examination', practiceId: 'practice/examination-of-conscience' },
    ],
  },
  {
    key: 'throughDay',
    numeral: 'III',
    art: 'collection/marian',
    entries: [
      { key: 'angelus', practiceId: 'practice/angelus' },
      { key: 'rosary', practiceId: 'practice/rosary' },
      { key: 'gospel', practiceId: 'practice/gospel-of-the-day' },
    ],
  },
  {
    key: 'closer',
    numeral: 'IV',
    art: 'collection/mental-prayer',
    entries: [
      { key: 'visit', practiceId: 'practice/visit-blessed-sacrament' },
      { key: 'mentalPrayer', practiceId: 'practice/mental-prayer' },
      { key: 'weekdayMass', practiceId: 'practice/mass', massDays: weekdays },
    ],
  },
  {
    key: 'calling',
    numeral: 'V',
    art: 'collection/sacred-heart',
    entries: [
      { key: 'divineMercy', practiceId: 'practice/chaplet-of-divine-mercy' },
      { key: 'office', practiceId: 'practice/liturgy-of-the-hours' },
      { key: 'stations', practiceId: 'practice/stations-cross' },
      { key: 'sevenSorrows', practiceId: 'practice/seven-sorrows' },
      { key: 'jesusPrayer', practiceId: 'practice/jesus-prayer' },
    ],
  },
]

/** A time kept on at least one of `days` (0 = Sunday). */
export function keepsDays(slot: SlotState, days: number[]): boolean {
  if (slot.enabled !== 1) return false
  const schedule = parseSchedule(slot.schedule)
  if (schedule.type === 'daily') return true
  return schedule.type === 'days-of-week' && schedule.days.some((d) => days.includes(d))
}
