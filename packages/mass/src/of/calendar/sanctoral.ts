import { computeAnchors } from '@ember/liturgical'
import type { SanctoralEntry } from '@ember/missal-schema'
import { addDays, getDate, getMonth, isSameDay } from 'date-fns'

export type Scope = string

/** Does a sanctoral entry fall on `date`, for the given scope? */
function entryMatches(entry: SanctoralEntry, date: Date, scope: Scope): boolean {
  if (entry.scope !== 'universal' && entry.scope !== scope) return false
  const rule = entry.dateRule
  if (rule.type === 'fixed') {
    return getMonth(date) + 1 === rule.month && getDate(date) === rule.day
  }
  // easter-relative: resolve against both this and last liturgical year (an
  // offset can land a celebration in the neighbouring civil year).
  const year = date.getFullYear()
  for (const y of [year, year - 1]) {
    const easter = computeAnchors(y).easter
    if (isSameDay(addDays(easter, rule.offsetDays), date)) return true
  }
  return false
}

/** All sanctoral entries applicable on `date` for `scope`. */
export function sanctoralFor(
  entries: SanctoralEntry[],
  date: Date,
  scope: Scope,
): SanctoralEntry[] {
  return entries.filter((e) => entryMatches(e, date, scope))
}
