import {
  type Catalog,
  type Copy,
  type Grant,
  historyStart,
  pendingCards,
  redeem,
  type Season,
} from '@ember/holy-cards'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useEventStore } from '@/db/events'
import { getPreference, recordHolyCardCopy, setPreference } from '@/db/repositories'
import { useCompletionRange } from '@/features/plan-of-life/completion'
import { getToday, useToday } from '@/hooks/useToday'
import { loadMissalCalendar } from '@/lib/missal/loaders'

import { liturgicalActs, novenaActs } from './acts'
import { type HolyCard, useHolyCardCatalog } from './useHolyCards'

const sinceKey = 'holy-cards.since'

/** The day holy cards began for this user: the starter cards date from it. */
async function holyCardsSince(): Promise<string> {
  const stored = await getPreference(sinceKey)
  if (stored) return stored
  const today = format(getToday(), 'yyyy-MM-dd')
  await setPreference(sinceKey, today)
  return today
}

// Each season's two cards: Mass on all its Sundays, and on two thirds of its weekdays.
const seasonCards: Record<Season, { sunday: string; weekday: string }> = {
  advent: { sunday: 'advent_sunday', weekday: 'advent_weekday' },
  christmas: { sunday: 'christmas_sunday', weekday: 'christmas_weekday' },
  lent: { sunday: 'lent_sunday', weekday: 'lent_weekday' },
  easter: { sunday: 'easter_sunday', weekday: 'easter_weekday' },
  ordinary1: { sunday: 'ordinary_time_1_sunday', weekday: 'ordinary_time_1_weekday' },
  ordinary2: { sunday: 'ordinary_time_2_sunday', weekday: 'ordinary_time_2_weekday' },
}

/**
 * The engine's catalog: every drawn card under the door that gives it.
 * `novenas` maps a novena to the cards it is prayed to.
 */
export function holyCardCatalog(
  cards: HolyCard[],
  starters: string[],
  novenas: Record<string, string[]>,
): Catalog {
  const drawn = new Set(cards.map((c) => c.id))
  const ifDrawn = (id: string) => (drawn.has(id) ? id : undefined)
  return {
    // A feast's card, by its Mass or its date. Season, Mass-part and object cards
    // name a formulary only for the collect they show; their own doors give them.
    saints: cards
      .filter((c) => c.feast || c.kind === 'moveable')
      .map((c) => ({ id: c.id, celebration: c.proper, day: c.feast })),
    liturgical: cards.filter((c) => c.kind === 'mass' || c.kind === 'object').map((c) => c.id),
    seasons: Object.fromEntries(
      Object.entries(seasonCards).map(([season, { sunday, weekday }]) => [
        season,
        { sunday: ifDrawn(sunday), weekday: ifDrawn(weekday) },
      ]),
    ),
    triduum: ifDrawn('triduum'),
    gaudete: ifDrawn('gaudete'),
    laetare: ifDrawn('laetare'),
    // Nothing in the app yet records keeping the Ember Days, finishing a book or
    // a practice's lineage, so those doors stay shut.
    emberDays: {},
    // Only the cards drawn so far; a novena naming none of them gives nothing.
    novenas: Object.fromEntries(
      Object.entries(novenas).map(([novena, cards]) => [novena, cards.filter((c) => drawn.has(c))]),
    ),
    books: {},
    lineages: {},
    starters: starters.filter((id) => drawn.has(id)),
  }
}

/**
 * The holy cards waiting to be redeemed today — sealed envelopes, soonest
 * deadline first. Undefined while the calendar and the cards load.
 */
export function usePendingHolyCards(): Grant[] | undefined {
  const day = useToday()
  const today = format(day, 'yyyy-MM-dd')
  const holyCards = useHolyCardCatalog()
  const { data: statics } = useQuery({
    queryKey: ['of-calendar'],
    queryFn: async () => (await loadMissalCalendar()) ?? null,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const { data: since } = useQuery({
    queryKey: ['holy-cards-since'],
    queryFn: holyCardsSince,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const start = useMemo(() => historyStart(today), [today])
  const completions = useCompletionRange(start, today)
  const copies = useEventStore((s) => s.holyCards)
  const plan = useEventStore(
    useShallow((s) => ({
      slots: s.slots,
      cursors: s.cursors,
      completions: s.completions,
      completionsByPractice: s.completionsByPractice,
    })),
  )

  // Memoized apart so a completion or a redeem re-runs only the step it changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `today` keys the day; `day` is read from the closure
  const novenas = useMemo(() => novenaActs(plan, day), [plan, today])
  const acts = useMemo(
    () => [...liturgicalActs(completions), ...novenas.acts],
    [completions, novenas],
  )
  const catalog = useMemo(
    () => holyCards && holyCardCatalog(holyCards.cards, holyCards.starters, novenas.cards),
    [holyCards, novenas],
  )

  return useMemo(() => {
    if (!statics || !catalog || !since) return undefined
    return pendingCards({
      acts,
      occurrences: [],
      calendar: { statics },
      catalog,
      firstOpened: since,
      copies: [...copies.values()],
      today,
    })
  }, [statics, catalog, since, acts, copies, today])
}

/** Redeem an envelope: store its copy for good. `card` is the pick when it offers a choice. */
export function useRedeemHolyCard() {
  return useMutation({
    mutationFn: async ({ grant, card }: { grant: Grant; card?: string }): Promise<Copy> => {
      const today = format(getToday(), 'yyyy-MM-dd')
      const copies = [...useEventStore.getState().holyCards.values()]
      const copy = redeem(grant, today, copies, card)
      await recordHolyCardCopy(copy)
      return copy
    },
  })
}
