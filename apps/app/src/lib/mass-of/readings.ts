/**
 * Resolving the readings actually proclaimed on a day.
 *
 * A saint's formulary rarely carries a whole reading set. The Lectionary gives
 * memorials (and a few feasts) only the slots that are genuinely proper — often
 * just a first reading, sometimes only an acclamation — and everything else is
 * taken from the weekday lectionary. So proper slots are laid *over* the
 * temporal day's set, never used in place of it wholesale.
 */

import type { CycleKey, MassFormulary, ReadingSet } from '@ember/missal-schema'
import { cycleKeyFor } from './loaders'

/** The set a formulary offers for the day's Sunday/weekday cycles. */
export function readingSetOf(
  f: MassFormulary | undefined,
  cycle: 'A' | 'B' | 'C',
  weekdayCycle: 'I' | 'II',
): ReadingSet | undefined {
  if (!f?.readings) return undefined
  const ck: CycleKey | undefined = cycleKeyFor(f, cycle, weekdayCycle)
  return ck ? f.readings[ck] : undefined
}

/**
 * The celebration's readings, with any slot it leaves open filled from the
 * day's ferial readings.
 */
export function resolveReadingSet({
  formulary,
  temporal,
  cycle,
  weekdayCycle,
}: {
  formulary: MassFormulary
  /** The day's temporal sibling; omitted when the celebration *is* the ferial. */
  temporal?: MassFormulary
  cycle: 'A' | 'B' | 'C'
  weekdayCycle: 'I' | 'II'
}): ReadingSet | undefined {
  const proper = readingSetOf(formulary, cycle, weekdayCycle)
  const ferial = temporal === formulary ? undefined : readingSetOf(temporal, cycle, weekdayCycle)
  if (!proper) return ferial
  if (!ferial) return proper
  return {
    firstReading: proper.firstReading ?? ferial.firstReading,
    psalm: proper.psalm ?? ferial.psalm,
    secondReading: proper.secondReading ?? ferial.secondReading,
    sequence: proper.sequence ?? ferial.sequence,
    gospelAcclamation: proper.gospelAcclamation ?? ferial.gospelAcclamation,
    gospel: proper.gospel ?? ferial.gospel,
  }
}
