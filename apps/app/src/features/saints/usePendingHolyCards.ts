import {
  type Catalog,
  type Copy,
  type Grant,
  historyStart,
  pendingCards,
  redeem,
} from '@ember/holy-cards'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useEventStore } from '@/db/events'
import { getPreference, recordHolyCardCopy, setPreference } from '@/db/repositories'
import { useCompletionRange } from '@/features/plan-of-life/completion'
import { getToday, useToday } from '@/hooks/useToday'
import { loadOfCalendar, scopeForContentLang } from '@/lib/mass-of/loaders'
import { usePreferencesStore } from '@/stores/preferencesStore'

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

function catalogOf(
  cards: HolyCard[],
  starters: string[],
  novenas: Record<string, string[]>,
): Catalog {
  const drawn = new Set(cards.map((c) => c.id))
  return {
    // A feast's card, by its Mass or its date. Season, Mass-part and object cards
    // name a formulary only for the collect they show; their own doors give them.
    saints: cards
      .filter((c) => c.feast || c.kind === 'moveable')
      .map((c) => ({ id: c.id, celebration: c.proper, day: c.feast })),
    // Liturgical, season, Ember Days, book and lineage cards aren't drawn yet;
    // their doors give nothing until they are.
    liturgical: [],
    seasons: {},
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
  const scope = scopeForContentLang(usePreferencesStore((s) => s.contentLanguage))
  const holyCards = useHolyCardCatalog()
  const { data: statics } = useQuery({
    queryKey: ['of-calendar'],
    queryFn: async () => (await loadOfCalendar()) ?? null,
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
    () => holyCards && catalogOf(holyCards.cards, holyCards.starters, novenas.cards),
    [holyCards, novenas],
  )

  return useMemo(() => {
    if (!statics || !catalog || !since) return undefined
    return pendingCards({
      acts,
      occurrences: [],
      calendar: { statics, scope },
      catalog,
      firstOpened: since,
      copies: [...copies.values()],
      today,
    })
  }, [statics, catalog, since, acts, copies, scope, today])
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
