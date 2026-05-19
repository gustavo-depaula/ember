import { getDate, getDay } from 'date-fns'
import type { FlowContext } from '../context'

export function getCycleIndex(
  indexBy: string,
  date: Date,
  length: number,
  context: FlowContext,
): number {
  if (indexBy === 'program-day') return (context.programDay ?? 0) % length
  if (indexBy === 'day-of-month') return (getDate(date) - 1) % length
  if (indexBy === 'day-of-week') return getDay(date)
  if (indexBy === 'fixed') return 0
  return 0
}
