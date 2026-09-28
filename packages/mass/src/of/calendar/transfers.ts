import { computeEaster } from '@ember/liturgical'
import { addDays, isSameDay, isWithinInterval } from 'date-fns'

/**
 * Impeded-solemnity transfers (GIRM Table of Liturgical Days, final norms).
 * A solemnity falling within Holy Week or the Easter Octave is transferred to
 * the Monday after the Second Sunday of Easter; St Joseph (Mar 19) in Holy Week
 * is anticipated to the Saturday before Palm Sunday. Pure function of the year.
 *
 * Returns the *observed* date for a fixed-date solemnity — its natural date
 * when unimpeded, otherwise the transfer date.
 */
export function transferredDate(month: number, day: number, year: number): Date {
  // A year calendar asks this ~13k times (every fixed solemnity, every day);
  // the answer is a pure function of the date, so compute each once.
  const key = `${year}-${month}-${day}`
  const cached = observedCache.get(key)
  if (cached) return new Date(cached)
  const observed = computeTransferredDate(month, day, year)
  observedCache.set(key, observed.getTime())
  return observed
}

const observedCache = new Map<string, number>()

function computeTransferredDate(month: number, day: number, year: number): Date {
  const easter = computeEaster(year)
  const natural = new Date(year, month - 1, day)
  const palmSunday = addDays(easter, -7)
  const easterOctaveEnd = addDays(easter, 7) // Second Sunday of Easter

  if (!isWithinInterval(natural, { start: palmSunday, end: easterOctaveEnd })) return natural
  if (month === 3 && day === 19) return addDays(palmSunday, -1) // St Joseph anticipated
  return addDays(easter, 8) // Monday after the Octave (e.g. Annunciation)
}

/** Is the fixed solemnity (possibly transferred) observed on `date`? */
export function observesTransferred(month: number, day: number, date: Date): boolean {
  return isSameDay(transferredDate(month, day, date.getFullYear()), date)
}
