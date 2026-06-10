import type { OfLiturgicalPosition } from '@ember/liturgical'
import type { Rank } from '@ember/missal-schema'
import { getDate, getMonth } from 'date-fns'

/**
 * GIRM "Table of Liturgical Days" as code (it's law, not data). Lower number =
 * higher precedence. Both temporal and sanctoral celebrations map onto this one
 * scale. Ported from the validated `@ember/liturgical` resolver.
 */
export const girm = {
  triduum: 1,
  privileged: 2, // Christmas/Epiphany/Ascension/Pentecost; Sundays of Advent/Lent/Easter; Ash Wed; Holy Week; Easter Octave
  solemnity: 3,
  feastOfTheLord: 5,
  sundayOrdinary: 6, // Sundays of the Christmas season & Ordinary Time
  feast: 7,
  privilegedFeria: 9, // Advent Dec 17-24, Christmas Octave, Lent ferias
  memorial: 10,
  optionalMemorial: 12,
  feria: 13,
} as const

/**
 * Feasts of the Lord in the General Calendar that outrank a Sunday of Ordinary
 * Time (GIRM Table II.5 vs II.6). The upstream doesn't tag them.
 */
const feastOfTheLordIds = new Set([
  'sanctorale.02-02', // Presentation of the Lord
  'sanctorale.08-06', // Transfiguration of the Lord
  'sanctorale.09-14', // Exaltation of the Holy Cross
  'sanctorale.11-09', // Dedication of the Lateran Basilica
])

export function sanctoralPrecedence(rank: Rank, id: string): number {
  switch (rank) {
    case 'solemnity':
      return girm.solemnity
    case 'feast':
      return feastOfTheLordIds.has(id) ? girm.feastOfTheLord : girm.feast
    case 'memorial':
      return girm.memorial
    case 'optional-memorial':
      return girm.optionalMemorial
    default:
      return girm.feria
  }
}

/** Privileged ferias on which optional memorials are reduced to commemorations. */
export function isPrivilegedFeria(position: OfLiturgicalPosition, date: Date): boolean {
  const { season, dayOfWeek, week } = position
  const month = getMonth(date) + 1
  const day = getDate(date)
  if (dayOfWeek === 0) return false
  if (season === 'advent' && month === 12 && day >= 17) return true
  if (season === 'lent' && week !== undefined && week >= 1) return true
  if (season === 'christmas' && ((month === 12 && day >= 25) || (month === 1 && day === 1)))
    return true
  return false
}

/** GIRM precedence of the temporal day from the computed liturgical position. */
export function temporalPrecedence(
  date: Date,
  position: OfLiturgicalPosition,
  temporalId: string,
): number {
  const { season, specialDay, dayOfWeek, week } = position
  const month = getMonth(date) + 1
  const day = getDate(date)

  if (temporalId.startsWith('tempore.solemnity.')) return girm.solemnity
  if (specialDay === 'mary-mother-of-god') return girm.solemnity
  if (specialDay === 'baptism-of-the-lord') return girm.feastOfTheLord
  if (
    specialDay === 'good-friday' ||
    specialDay === 'holy-saturday' ||
    specialDay === 'holy-thursday'
  )
    return girm.triduum
  if (
    specialDay === 'christmas' ||
    specialDay === 'epiphany' ||
    specialDay === 'ascension' ||
    specialDay === 'pentecost' ||
    specialDay === 'easter-sunday' ||
    specialDay === 'ash-wednesday' ||
    specialDay === 'palm-sunday'
  ) {
    return girm.privileged
  }

  const isSunday = dayOfWeek === 0
  if (season === 'advent' || season === 'lent' || season === 'holy-week') {
    if (isSunday) return girm.privileged
    if (season === 'advent' && month === 12 && day >= 17) return girm.privilegedFeria
    if (season === 'lent') return girm.privilegedFeria
    if (season === 'holy-week') return girm.privileged
    return girm.feria
  }
  if (season === 'easter') {
    if (isSunday) return girm.privileged
    if (week === 1) return girm.privileged
    return girm.feria
  }
  if (season === 'christmas') {
    if (isSunday) return girm.sundayOrdinary
    if ((month === 12 && day >= 25) || (month === 1 && day === 1)) return girm.privilegedFeria
    return girm.feria
  }
  if (isSunday) return girm.sundayOrdinary
  return girm.feria
}
