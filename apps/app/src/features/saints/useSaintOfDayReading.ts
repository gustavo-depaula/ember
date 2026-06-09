import { useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { todayKey, useSaintOfDayIndex } from './useSaintOfDayIndex'

/**
 * Today's primary saint as titled in Pictorial Lives of the Saints, looked up
 * by month-day (MM-DD). Powers the "Saint of the Day" cards, which open the
 * `saint-of-the-day` practice (the full life + reflection from the book).
 * Returns undefined while the index loads from Hearth or if today's date has
 * no mapped entry.
 */
export function useSaintOfDayReading(): { name: string; reflection?: string } | undefined {
  const today = useToday()
  const index = useSaintOfDayIndex()
  const entry = index?.[todayKey(today)]
  if (!entry) return undefined
  return {
    name: localizeContent(entry.name),
    reflection: entry.reflection ? localizeContent(entry.reflection) : undefined,
  }
}
