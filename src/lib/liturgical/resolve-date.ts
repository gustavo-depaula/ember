import { addDays } from 'date-fns'

import type {
  AnchorRelativeDate,
  DayOfWeek,
  LiturgicalAnchor,
  LiturgicalDate,
  NthWeekdayOfMonth,
  RelativeToFixedDate,
} from './calendar-types'
import {
  computeEaster,
  getAshWednesday,
  getBaptismOfTheLord,
  getFirstSundayOfAdvent,
  getSeptuagesimaSunday,
} from './season'

// ── Weekday mapping ──

const weekdayIndex: Record<DayOfWeek, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

// ── Anchor computation ──

export function computeAnchors(year: number): Record<LiturgicalAnchor, Date> {
  const easter = computeEaster(year)
  const ashWednesday = getAshWednesday(year)
  const advent1 = getFirstSundayOfAdvent(year)

  return {
    easter,
    pentecost: addDays(easter, 49),
    ascension: addDays(easter, 39),
    trinity_sunday: addDays(easter, 56),
    corpus_christi: addDays(easter, 60),
    sacred_heart: addDays(easter, 68),

    advent_1: advent1,
    advent_2: addDays(advent1, 7),
    advent_3: addDays(advent1, 14),
    advent_4: addDays(advent1, 21),

    lent_1: addDays(ashWednesday, 4),
    lent_2: addDays(ashWednesday, 11),
    lent_3: addDays(ashWednesday, 18),
    lent_4: addDays(ashWednesday, 25),
    lent_5: addDays(ashWednesday, 32),

    palm_sunday: addDays(easter, -7),
    holy_thursday: addDays(easter, -3),
    good_friday: addDays(easter, -2),
    holy_saturday: addDays(easter, -1),

    ash_wednesday: ashWednesday,
    septuagesima: getSeptuagesimaSunday(year),
    sexagesima: addDays(easter, -56),
    quinquagesima: addDays(easter, -49),

    christ_the_king: addDays(advent1, -7),
    christmas: new Date(year, 11, 25),
    epiphany: new Date(year, 0, 6),
    baptism_of_the_lord: getBaptismOfTheLord(year),
  }
}

// ── Date resolution ──

export function resolveDate(
  litDate: LiturgicalDate,
  year: number,
  anchors?: Record<LiturgicalAnchor, Date>,
): Date | undefined {
  switch (litDate.type) {
    case 'fixed':
      return new Date(year, litDate.month - 1, litDate.day)

    case 'easter_relative':
      return addDays((anchors ?? computeAnchors(year)).easter, litDate.offset)

    case 'anchor_relative':
      return resolveAnchorRelative(litDate, anchors ?? computeAnchors(year))

    case 'nth_weekday_of_month':
      return resolveNthWeekday(litDate, year)

    case 'relative_to_fixed':
      return resolveRelativeToFixed(litDate, year)
  }
}

// ── Anchor-relative resolution ──

function resolveAnchorRelative(
  d: AnchorRelativeDate,
  anchors: Record<LiturgicalAnchor, Date>,
): Date | undefined {
  const base = anchors[d.anchor]
  if (!base) return undefined

  let result = new Date(base)

  if (d.nthWeek !== undefined && d.nthWeek > 1) {
    result = addDays(result, (d.nthWeek - 1) * 7)
  }

  // Find the specified weekday: same day if match, otherwise next occurrence
  if (d.weekday) {
    const target = weekdayIndex[d.weekday]
    const current = result.getDay()
    let diff = target - current
    if (diff < 0) diff += 7
    result = addDays(result, diff)
  }

  // Apply additional day offset
  if (d.daysAfter) {
    result = addDays(result, d.daysAfter)
  }

  return result
}

// ── Nth weekday of month ──

function resolveNthWeekday(d: NthWeekdayOfMonth, year: number): Date {
  const target = weekdayIndex[d.weekday]

  if (d.nth > 0) {
    // Count forward from start of month
    const first = new Date(year, d.month - 1, 1)
    const firstDay = first.getDay()
    let diff = target - firstDay
    if (diff < 0) diff += 7
    const firstOccurrence = 1 + diff
    return new Date(year, d.month - 1, firstOccurrence + (d.nth - 1) * 7)
  }

  // Count backward from end of month (nth is negative)
  const lastDay = new Date(year, d.month, 0) // last day of month
  const lastDow = lastDay.getDay()
  let diff = lastDow - target
  if (diff < 0) diff += 7
  const lastOccurrenceDate = lastDay.getDate() - diff
  const fromEnd = Math.abs(d.nth) - 1
  return new Date(year, d.month - 1, lastOccurrenceDate - fromEnd * 7)
}

// ── Relative to fixed date ──

function resolveRelativeToFixed(d: RelativeToFixedDate, year: number): Date {
  const ref = new Date(year, d.referenceMonth - 1, d.referenceDay)
  const target = weekdayIndex[d.weekday]
  const refDay = ref.getDay()

  switch (d.direction) {
    case 'after': {
      let diff = target - refDay
      if (diff <= 0) diff += 7
      return addDays(ref, diff)
    }
    case 'on_or_after': {
      let diff = target - refDay
      if (diff < 0) diff += 7
      return addDays(ref, diff)
    }
    case 'before': {
      let diff = refDay - target
      if (diff <= 0) diff += 7
      return addDays(ref, -diff)
    }
    case 'on_or_before': {
      let diff = refDay - target
      if (diff < 0) diff += 7
      return addDays(ref, -diff)
    }
    case 'nearest': {
      const afterDiff = (((target - refDay) % 7) + 7) % 7 || 7
      const beforeDiff = (((refDay - target) % 7) + 7) % 7 || 7
      if (refDay === target) return ref
      return afterDiff <= beforeDiff ? addDays(ref, afterDiff) : addDays(ref, -beforeDiff)
    }
  }
}
