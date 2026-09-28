import { computeEaster } from '@ember/liturgical'
import type { SanctoralEntry } from '@ember/missal-schema'
import { addDays } from 'date-fns'

export type Scope = string

const dayKey = (month: number, day: number) => month * 100 + day

/**
 * Every entry's dates in `year`, keyed by month·100+day, in entry order. An
 * easter-relative entry is resolved against both this and last liturgical year
 * (an offset can land a celebration in the neighbouring civil year).
 */
function buildYearIndex(entries: SanctoralEntry[], year: number): Map<number, SanctoralEntry[]> {
  const index = new Map<number, SanctoralEntry[]>()
  const add = (key: number, e: SanctoralEntry) => {
    const list = index.get(key)
    if (!list) index.set(key, [e])
    else if (!list.includes(e)) list.push(e)
  }
  for (const e of entries) {
    const rule = e.dateRule
    if (rule.type === 'fixed') {
      add(dayKey(rule.month, rule.day), e)
      continue
    }
    for (const y of [year, year - 1]) {
      const d = addDays(computeEaster(y), rule.offsetDays)
      if (d.getFullYear() === year) add(dayKey(d.getMonth() + 1, d.getDate()), e)
    }
  }
  return index
}

// A year calendar asks for all 365 days against the same entries; scanning
// every entry per day dominated the build on Hermes.
const yearIndexes = new WeakMap<SanctoralEntry[], Map<number, Map<number, SanctoralEntry[]>>>()

function yearIndex(entries: SanctoralEntry[], year: number): Map<number, SanctoralEntry[]> {
  let byYear = yearIndexes.get(entries)
  if (!byYear) {
    byYear = new Map()
    yearIndexes.set(entries, byYear)
  }
  let index = byYear.get(year)
  if (!index) {
    index = buildYearIndex(entries, year)
    byYear.set(year, index)
  }
  return index
}

/** All sanctoral entries applicable on `date` for `scope`. */
export function sanctoralFor(
  entries: SanctoralEntry[],
  date: Date,
  scope: Scope,
): SanctoralEntry[] {
  const onDay = yearIndex(entries, date.getFullYear()).get(
    dayKey(date.getMonth() + 1, date.getDate()),
  )
  if (!onDay) return []
  // Entry order is preserved within a day, so filtering matches the old full scan.
  return onDay.filter((e) => e.scope === 'universal' || e.scope === scope)
}
