import { RRule, RRuleSet } from 'rrule'
import type { Service } from './schema'

// Pure, on-device-capable expander. One `service` row = one (time, pattern) slot; a church's
// schedule is the union of its rows (expand each, concatenate). Times are WALL-CLOCK and zoneless:
// the rrule answers "which calendar days", and `service.startTime` ('HH:MM') carries the time of
// day verbatim. To keep day matching unambiguous we anchor everything at UTC midnight and read
// occurrences with UTC getters — there is NO timezone math here (the core "near me" path shares the
// church's zone, so DST self-resolves). EXDATE/RDATE are the only reason an RRuleSet is needed.

export type Occurrence = {
  date: Date // occurrence day at 00:00:00 UTC; combine with `startTime` for the wall-clock instant
  startTime: string // 'HH:MM' wall-clock, displayed as-is
}

export type ExpandOptions = {
  from?: Date // lower bound (inclusive at day granularity); defaults to now
  count?: number // max occurrences to return; defaults to 10. Always bounded — never expand infinitely
}

type RRuleSource = Pick<Service, 'rrule' | 'startTime' | 'exdate' | 'rdate'>

export function expandService(service: RRuleSource, options: ExpandOptions = {}): Occurrence[] {
  const { from = new Date(), count = 10 } = options
  if (count <= 0) return []

  const set = buildRuleSet(service, from)
  const out: Occurrence[] = []
  let cursor = set.after(floorUtcDay(from), true)
  while (cursor && out.length < count) {
    out.push({ date: cursor, startTime: service.startTime })
    cursor = set.after(cursor, false)
  }
  return out
}

function buildRuleSet(service: RRuleSource, from: Date): RRuleSet {
  const options = RRule.parseString(service.rrule)
  // Anchor at UTC midnight so occurrences land at 00:00:00Z and EXDATE/RDATE match exactly.
  options.dtstart = floorUtcDay(options.dtstart ?? from)

  const set = new RRuleSet()
  set.rrule(new RRule(options))
  for (const d of parseDateList(service.exdate)) set.exdate(d)
  for (const d of parseDateList(service.rdate)) set.rdate(d)
  return set
}

// exdate/rdate are stored as a comma-separated list of 'YYYY-MM-DD' (or full ISO) dates.
function parseDateList(value: string | null): Date[] {
  if (!value) return []
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => floorUtcDay(new Date(s)))
}

function floorUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}
