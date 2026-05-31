import { useToday } from '@/hooks/useToday'
import { saintOfDayNames } from './data/saintOfDayNames'

/**
 * Today's primary saint as titled in Pictorial Lives of the Saints, looked up
 * by month-day (MM-DD). Powers the "Saint of the Day" cards, which open the
 * `saint-of-the-day` practice (the full life + reflection from the book).
 * Returns undefined only if today's date somehow has no mapped entry.
 */
export function useSaintOfDayReading(): { name: string } | undefined {
  const today = useToday()
  const key = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const name = saintOfDayNames[key]
  return name ? { name } : undefined
}
