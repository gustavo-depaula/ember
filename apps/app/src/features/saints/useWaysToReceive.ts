import { historyStart, type Way, waysToReceive } from '@ember/holy-cards'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useMemo } from 'react'

import { bareId } from '@/content/contentIndex'
import { getManifest } from '@/content/resolver'
import { useCompletionRange } from '@/features/plan-of-life/completion'
import { useToday } from '@/hooks/useToday'
import { loadMissalCalendar } from '@/lib/missal/loaders'
import { useOfRegions, useOfTransfers } from '@/lib/missal/useOfTransfers'

import { liturgicalActs } from './acts'
import type { SaintEntry } from './data/catalog'
import { useHolyCardCatalog } from './useHolyCards'
import { holyCardCatalog } from './usePendingHolyCards'

/**
 * The ways `saint`'s card can still be won, as of today: its feast's Mass or
 * Office, the novenas prayed to it, its season's Masses. Undefined while the
 * calendar loads. The novenas are read from the card's own prayers, which list
 * every practice naming the card as its own.
 */
/** A way to receive a card; a round's names the program whose round it is. */
export type ReceiveWay = Way & { practice?: string }

export function useWaysToReceive(saint: SaintEntry): ReceiveWay[] | undefined {
  const day = useToday()
  const today = format(day, 'yyyy-MM-dd')
  const holyCards = useHolyCardCatalog()
  const regions = useOfRegions()
  const transfers = useOfTransfers()
  const { data: statics } = useQuery({
    queryKey: ['missal-calendar'],
    queryFn: async () => (await loadMissalCalendar()) ?? null,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const start = useMemo(() => historyStart(today, transfers), [today, transfers])
  const completions = useCompletionRange(start, today)
  const acts = useMemo(() => liturgicalActs(completions), [completions])

  return useMemo(() => {
    if (!statics || !holyCards) return undefined
    const novenas: Record<string, string[]> = {}
    const rounds: Record<string, string> = {}
    const roundPractice: Record<string, string> = {}
    for (const ref of saint.pray.flatMap((s) => s.refs)) {
      const id = bareId(ref)
      const manifest = getManifest(id)
      const cards = [manifest?.holyCard ?? []].flat()
      if (manifest?.program && cards.includes(saint.id)) novenas[id] = cards
      // A program dated by a rule names the card each of its rounds gives.
      for (const [round, card] of Object.entries(manifest?.program?.holyCard ?? {})) {
        if (card !== saint.id) continue
        rounds[round] = card
        roundPractice[round] = id
      }
    }
    const catalog = holyCardCatalog(holyCards.cards, holyCards.starters, novenas, rounds)
    return waysToReceive(saint.id, {
      catalog,
      calendar: { statics, regions, transfers },
      acts,
      today,
    }).map((way) =>
      way.door === 'emberDays' ? { ...way, practice: roundPractice[way.ember] } : way,
    )
  }, [statics, regions, transfers, holyCards, saint, acts, today])
}
