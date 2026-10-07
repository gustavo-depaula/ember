// Which office an hour of a date is: the day's own, or already tomorrow's.
//
// Evening Prayer and Night Prayer on the eve of a Sunday or a solemnity belong
// to the day that follows (General Instruction of the Liturgy of the Hours,
// 204-214). The breviary's own tables decide the cases where two days meet.

import { addDays } from '@ember/liturgical'
import { type Celebration, ids, type LothCalendar, type LothDay, lothDay } from './day'

export const hours = [
  'invitatory',
  'readings',
  'lauds',
  'terce',
  'sext',
  'none',
  'vespers',
  'compline',
] as const
export type Hour = (typeof hours)[number]

export interface Office {
  hour: Hour
  // The civil date the hour is prayed on.
  date: Date
  // The day whose office this is.
  day: LothDay
  // The celebration kept in this hour; a Sunday's first Vespers have none.
  celebration?: Celebration
  // First Vespers (or the Night Prayer after them) of tomorrow's celebration.
  firstVespers: boolean
  // Saturday evening: first Vespers of the Sunday, from the psalter.
  sundayEve: boolean
  // 'MM-DD' from 17 December to the end of Christmas time, where the days go
  // by date.
  dateKey?: string
  // Night Prayer on the eve of Advent already has the Advent antiphon.
  adventEve?: boolean
}

const withoutFirstVespers = new Set<string>([
  ids.ashWednesday,
  ids.lordsSupper,
  ids.goodFriday,
  ids.holySaturday,
  ids.allSouls,
])
const withoutFirstCompline = new Set<string>([
  ...withoutFirstVespers,
  ids.easterSunday,
  ids.secondSundayOfEaster,
])
// Celebrations whose first Vespers displace a Sunday's second Vespers.
const overSundayEvening = new Set<string>([ids.christmas, ids.johnTheBaptist, ids.aparecida])
const overSundayNight = new Set<string>([
  ...overSundayEvening,
  ids.transfiguration,
  ids.presentation,
])
// Feasts of the Lord that have first Vespers when they fall on a Sunday.
const feastsWithFirstVespers = new Set<string>([
  ids.exaltation,
  ids.transfiguration,
  ids.presentation,
])
// What a Saturday keeps its own Vespers for.
const keepsSaturdayEvening = new Set<string>([
  ids.allSaints,
  ids.johnTheBaptist,
  ids.aparecida,
  ids.transfiguration,
  ids.exaltation,
  ids.lateran,
  ids.presentation,
  ids.christmas,
])

const mmdd = (date: Date) =>
  `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
// Advent goes by the week until 17 December and by the date from then on.
const byDate = (day: LothDay) =>
  day.season === 'christmas' ||
  (day.season === 'advent' && day.date.getMonth() === 11 && day.date.getDate() >= 17)

export function officeOf(date: Date, hour: Hour, calendar: LothCalendar): Office {
  const today = lothDay(date, calendar)
  const tomorrowDate = addDays(date, 1)
  const tomorrow = lothDay(tomorrowDate, calendar)
  const here = today.celebration?.id
  const next = tomorrow.celebration?.id
  const saturday = today.weekday === 6
  const sunday = today.weekday === 0
  const solemnityTomorrow = tomorrow.celebration?.rank === 'solemnity'

  const own: Office = {
    hour,
    date,
    day: today,
    ...(today.celebration ? { celebration: today.celebration } : {}),
    firstVespers: false,
    sundayEve: false,
    ...(byDate(today) ? { dateKey: mmdd(date) } : {}),
    ...(hour === 'compline' && tomorrow.season === 'advent' && today.season !== 'advent'
      ? { adventEve: true }
      : {}),
  }
  const ofTomorrow: Office = {
    hour,
    date,
    day: tomorrow,
    ...(tomorrow.celebration ? { celebration: tomorrow.celebration } : {}),
    firstVespers: true,
    sundayEve: false,
    ...(byDate(tomorrow) ? { dateKey: mmdd(tomorrowDate) } : {}),
  }

  if (hour === 'vespers') {
    if (
      solemnityTomorrow &&
      next &&
      !withoutFirstVespers.has(next) &&
      here !== ids.sacredHeart &&
      (!sunday || today.celebration?.rank === 'feast')
    )
      return ofTomorrow
    if (
      saturday &&
      next &&
      (feastsWithFirstVespers.has(next) || (next === ids.holyFamily && here !== ids.christmas))
    )
      return ofTomorrow
    if (saturday && tomorrow.season === 'advent' && today.season === 'ordinary-time')
      return ofTomorrow
    if (sunday && next && overSundayEvening.has(next)) return ofTomorrow
    const dec23 = date.getMonth() === 11 && date.getDate() === 23
    if (saturday && !dec23 && !(here && keepsSaturdayEvening.has(here))) {
      // The Sunday's first Vespers are in the psalter under the Saturday.
      const { celebration: _, ...rest } = own
      return {
        ...rest,
        sundayEve: true,
        ...(byDate(tomorrow) ? { dateKey: mmdd(tomorrowDate) } : {}),
      }
    }
    // A Saturday evening is the Sunday's, and no memorial's.
    if (saturday && own.celebration?.rank === 'memorial') {
      const { celebration: _, ...rest } = own
      return rest
    }
    return own
  }

  if (hour === 'compline') {
    if (
      solemnityTomorrow &&
      next &&
      !withoutFirstCompline.has(next) &&
      (!sunday || overSundayNight.has(next))
    )
      return ofTomorrow
    // Night Prayer follows the evening's Vespers: where a solemnity's
    // Saturday evening is the Sunday's first Vespers, its night is the
    // Sunday's too. (A memorial's or a feast's night is the weekday's as it
    // is, `rules.ts`; Holy Saturday's is its own.)
    if (
      saturday &&
      here?.startsWith('sanctorale.') &&
      today.celebration?.rank === 'solemnity' &&
      !keepsSaturdayEvening.has(here)
    ) {
      const { celebration: _, ...rest } = own
      return rest
    }
    // The night of 16 December, when the 17th is a Sunday, is already that
    // Sunday's.
    if (saturday && !byDate(today) && byDate(tomorrow))
      return { ...own, dateKey: mmdd(tomorrowDate) }
  }
  return own
}
