import { format } from 'date-fns'
import type { DayCalendar } from './calendar-types'

export function getCelebrationsForDate(
  calendar: Map<string, DayCalendar>,
  date: Date,
): DayCalendar | undefined {
  return calendar.get(format(date, 'yyyy-MM-dd'))
}
