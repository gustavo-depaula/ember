// Where the corpus does not follow the archive, because the book's own rules
// (the General Instruction, the Universal Norms on the Liturgical Year) show
// the archive at fault. The importer learns nothing from the archive's hour
// there, and the reference holds no hash for it: each is held by a test of the
// rule instead (`packages/loth/src/__tests__/norms.test.ts`).

import { addDays, daysBetween, easterSunday } from '../../packages/liturgical/src'
import { ids } from '../../packages/loth/src/day'
import type { Hour, Office } from '../../packages/loth/src/office'

const sameDay = (a: Date, b: Date) => daysBetween(a, b) === 0
const evening = (hour: Hour) => hour === 'vespers' || hour === 'compline'

/**
 * Saint Joseph. The archive keeps him the Saturday before when 19 March is a
 * Sunday of Lent, and not at all when it falls in Holy Week; the norm is the
 * Monday after, and the Saturday before Palm Sunday.
 */
function saintJoseph(date: Date, hour: Hour): boolean {
  const year = date.getFullYear()
  const joseph = new Date(year, 2, 19, 12)
  const palmSunday = addDays(easterSunday(year), -7)
  if (daysBetween(palmSunday, joseph) > 0) {
    const kept = addDays(palmSunday, -1)
    return sameDay(date, kept) || (sameDay(date, addDays(kept, -1)) && evening(hour))
  }
  if (joseph.getDay() !== 0 || sameDay(joseph, palmSunday)) return false
  return (
    sameDay(date, addDays(joseph, -1)) ||
    sameDay(date, addDays(joseph, 1)) ||
    (sameDay(date, addDays(joseph, -2)) && evening(hour))
  )
}

/**
 * All Saints on a Saturday. The archive gives its evening to a Sunday that is
 * not kept (the next day is All Souls) and its little hours the Sunday's
 * psalm; a solemnity has its own second Vespers, and off a Sunday the
 * complementary psalms (General Instruction, 229).
 */
export const allSaintsOnSaturday = (date: Date) =>
  date.getMonth() === 10 && date.getDate() === 1 && date.getDay() === 6

export function departs(date: Date, hour: Hour): boolean {
  if (saintJoseph(date, hour)) return true
  return allSaintsOnSaturday(date) && ['terce', 'sext', 'none', 'vespers'].includes(hour)
}

// "Aleluia" closes the verse that opens an hour, but not in Lent (General
// Instruction, 79). The archive's hours of the saints have it now and then the
// other way about: Saint Patrick's with it, the Assumption's without.
const inLent = (office: Office) =>
  office.day.season === 'lent' ||
  office.day.season === 'holy-week' ||
  // Vespers of Holy Saturday.
  (office.firstVespers && office.celebration?.id === ids.easterSunday)

// Some hours note it "(T.P. Aleluia)", as if it were Easter's alone.
const words = (text: string) => text.replace(/\./g, '\\.').split(' ').join('\\s+')
const verse = new RegExp(
  `(${words('Socorrei-me sem demora.')}[\\s\\S]{0,240}?${words('Como era no princípio, agora e sempre. Amém.')})` +
    '((?:\\s|&nbsp;)*Aleluia\\.?)?' +
    '(\\s*<span class="rubrica">\\s*\\(T\\.P\\.</span>\\s*Aleluia<span class="rubrica">\\)</span>\\.?)?',
)

export const withTheOpeningOfItsSeason = (html: string, office: Office): string =>
  html.replace(verse, (all: string, opening: string, aleluia?: string, inEaster?: string) =>
    inLent(office) ? opening : aleluia && !inEaster ? all : `${opening} Aleluia.`,
  )
