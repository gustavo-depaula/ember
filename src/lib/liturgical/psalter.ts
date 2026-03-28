import { getDate, getDay } from 'date-fns'
import psalterData from '@/assets/psalter/30-day.json'
import type { PsalmNumbering } from '@/lib/bolls'

export type PsalmRef =
  | { psalm: number; verseRange?: undefined }
  | { psalm: number; verseRange: [number, number] }

export function parsePsalmRef(raw: number | string): PsalmRef {
  if (typeof raw === 'number') return { psalm: raw }

  // Format: "119:33-72"
  const [psalmStr, rangeStr] = raw.split(':')
  const psalm = Number.parseInt(psalmStr, 10)
  const [start, end] = rangeStr.split('-').map((s) => Number.parseInt(s, 10))
  return { psalm, verseRange: [start, end] }
}

export function getPsalmsForDay(
  date: Date,
  numbering: PsalmNumbering,
): { morning: PsalmRef[]; evening: PsalmRef[] } {
  const dayOfMonth = Math.min(getDate(date), 30)
  const { cycle } = psalterData[numbering]
  const entry = cycle[dayOfMonth - 1]
  return {
    morning: entry.morning.map(parsePsalmRef),
    evening: entry.evening.map(parsePsalmRef),
  }
}

const dayNames = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

export function getComplinePsalms(date: Date, numbering: PsalmNumbering): PsalmRef[] {
  const dayName = dayNames[getDay(date)]
  const psalms = psalterData[numbering].compline[dayName]
  return psalms.map((p) => ({ psalm: p }))
}

export function formatPsalmRef(ref: PsalmRef): string {
  if (ref.verseRange) {
    return `Psalm ${ref.psalm}:${ref.verseRange[0]}-${ref.verseRange[1]}`
  }
  return `Psalm ${ref.psalm}`
}

export function formatPsalmRefs(refs: PsalmRef[]): string {
  return refs.map(formatPsalmRef).join(', ')
}
