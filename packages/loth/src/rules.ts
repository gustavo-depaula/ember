// Whose each part of an hour is, as the General Instruction on the Liturgy
// of the Hours lays it down. The corpus's layers are drawn from the hours of
// 2020-2040, and a saint met a dozen times there will seem to have a psalm or
// a hymn of his own on the weekday he happened to fall; where the Instruction
// gives a part to the weekday, the saint is not asked at all.

import type { OfficeKey } from './index-types'
import type { Hour } from './office'

const littleHours = new Set<Hour>(['terce', 'sext', 'none'])

// The psalms with all that goes with them.
const isPsalmody = (slot: string) => /^(psalmody|ant-\d|psalm-\d|collect-\d)/.test(slot)

// The memorials the book gives antiphons of their own at Lauds and Vespers:
// Saint Agnes, the Passion of John the Baptist, Our Lady of Sorrows, the
// Guardian Angels, Our Lady of the Rosary and Saint Martin.
const memorialsWithTheirOwnPsalmody = new Set(
  ['01-21', '08-29', '09-15', '10-02', '10-07', '11-11'].map((date) => `sanctorale.${date}`),
)

// The two memorials the book gives little hours as it does a feast, with a
// reading and a prayer of their own: Saint Barnabas and the Guardian Angels.
const memorialsWithTheirOwnLittleHours = new Set(['sanctorale.06-11', 'sanctorale.10-02'])

// The feasts with an antiphon of their own at each little hour.
const feastsWithTheirOwnLittleAntiphon = new Set(
  ['01-25', '08-06', '09-08', '09-14', '09-29', '12-12'].map((date) => `sanctorale.${date}`),
)

/**
 * Whether the weekday gives this part whatever saint is kept.
 *
 * A memorial (235-236): the psalms and their antiphons, unless the saint has
 * his own; at the Office of Readings the verse and the first reading with its
 * responsory; and the whole of the little hours and of Night Prayer.
 *
 * A feast of a saint on a weekday (231-233): the psalms of the little hours,
 * and the whole of Night Prayer.
 */
export function isTheWeekdays(hour: Hour, slot: string, key: OfficeKey): boolean {
  // What opens the hour names the saint, and the days of the temporal cycle
  // have no weekday beneath them.
  if (
    !key.C.startsWith('sanctorale.') ||
    slot === '@head' ||
    slot.startsWith('head') ||
    slot === 'whole'
  )
    return false
  // The verse that opens an hour is the Ordinary's, with the season's
  // "Aleluia".
  if (slot === 'intro') return true
  const little = littleHours.has(hour)
  if (key.r === 'memorial') {
    // The leave the last week of the year gives to say the Dies irae.
    if (slot === 'opening') return true
    if (hour === 'compline') return true
    if (little) return isPsalmody(slot) || !memorialsWithTheirOwnLittleHours.has(key.C)
    if (hour === 'readings')
      return isPsalmody(slot) || slot === 'verse' || slot === 'reading-1' || slot === 'responsory-1'
    if (hour === 'lauds' || hour === 'vespers')
      return isPsalmody(slot) && !memorialsWithTheirOwnPsalmody.has(key.C)
    return false
  }
  if (key.r === 'feast' && key.D === 'weekday') {
    if (hour === 'compline') return true
    if (little) return isPsalmody(slot) && !(isAntiphon(slot) && hasOneAntiphon(hour, key))
  }
  return false
}

const isAntiphon = (slot: string) => /^ant-\d/.test(slot)

/**
 * A feast with an antiphon of its own at a little hour says the weekday's
 * psalms under that one antiphon: it opens the first and closes the last,
 * and the weekday's own antiphons are not said.
 */
export function hasOneAntiphon(hour: Hour, key: OfficeKey): boolean {
  return (
    littleHours.has(hour) &&
    key.r === 'feast' &&
    key.D === 'weekday' &&
    feastsWithTheirOwnLittleAntiphon.has(key.C)
  )
}

const weekdaysKey = (key: OfficeKey): OfficeKey => ({ ...key, r: '', K: '', C: '' })

/** The key a part is looked up by: the weekday's own where the part is its. */
export function keyOfPart(hour: Hour, slot: string, key: OfficeKey): OfficeKey {
  return isTheWeekdays(hour, slot, key) ? weekdaysKey(key) : key
}

/**
 * A day's part, found through `find` (a slot's layers asked with a key). The
 * one antiphon of a feast's little hour is filed as its first, opening and
 * closing, and closes wherever the weekday's last psalm ends.
 */
export function partOf(
  hour: Hour,
  slot: string,
  key: OfficeKey,
  find: (slot: string, key: OfficeKey) => string | undefined,
): string | undefined {
  if (!isAntiphon(slot) || !hasOneAntiphon(hour, key)) return find(slot, keyOfPart(hour, slot, key))
  if (slot === 'ant-1') return find(slot, key)
  const last = [3, 2, 1].find((n) => find(`psalm-${n}`, weekdaysKey(key)))
  return slot === `ant-${last}-end` ? find('ant-1-end', key) : undefined
}
