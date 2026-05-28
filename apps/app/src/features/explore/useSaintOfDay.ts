import { format } from 'date-fns'
import type { ImageSource } from 'expo-image'
import { useMemo } from 'react'

import { useYearCalendar } from '@/features/calendar'
import { saints } from '@/features/saints/data/saints'
import { useToday } from '@/hooks/useToday'
import { getCelebrationsForDate, type ResolvedCelebration } from '@/lib/liturgical'
import { saintArtMap } from './saintArtMap'

export type SaintOfDay = {
  celebration: ResolvedCelebration
  /** The art id when the day's saint has a holy card, else undefined. */
  artId?: string
  /** The holy-card image when art exists. */
  image?: ImageSource
}

/**
 * The day's principal celebration plus its holy-card art (when one is mapped in
 * {@link saintArtMap}). Returns undefined while the calendar warms or when the
 * day has no principal celebration. Mirrors {@link CelebrationOfDay}'s memo-by-
 * date-string so the live `useToday()` clock doesn't thrash the result.
 */
export function useSaintOfDay(): SaintOfDay | undefined {
  const today = useToday()
  const dateKey = format(today, 'yyyy-MM-dd')
  const { data: calendar } = useYearCalendar(today.getFullYear())

  // biome-ignore lint/correctness/useExhaustiveDependencies: memoize by calendar day string
  return useMemo(() => {
    if (!calendar) return undefined
    const principal = getCelebrationsForDate(calendar, today)?.principal
    if (!principal) return undefined
    const artId = saintArtMap[principal.entry.id]
    const image = artId ? saints.find((s) => s.id === artId)?.image : undefined
    return { celebration: principal, artId, image }
  }, [calendar, dateKey])
}
