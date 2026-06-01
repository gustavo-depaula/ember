import { useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { saintOfDay } from './data/saintOfDayNames'

/**
 * Today's primary saint as titled in Pictorial Lives of the Saints, looked up
 * by month-day (MM-DD). Powers the "Saint of the Day" cards, which open the
 * `saint-of-the-day` practice (the full life + reflection from the book).
 * Returns undefined only if today's date somehow has no mapped entry.
 */
export function useSaintOfDayReading(): { name: string; reflection?: string } | undefined {
  const today = useToday()
  const key = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const entry = saintOfDay[key]
  if (!entry) return undefined
  return {
    name: localizeContent(entry.name),
    reflection: entry.reflection ? localizeContent(entry.reflection) : undefined,
  }
}
