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

import { getEntry, getRememberedManifest } from '@/content/contentIndex'
import type { PracticeManifest } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { useEventStore } from '@/db/events'
import { getPreference, recordHolyCardCopy, setPreference } from '@/db/repositories'
import { useCompletionRange } from '@/features/plan-of-life/completion'
import { getToday, useToday } from '@/hooks/useToday'
import { loadOfCalendar, scopeForContentLang } from '@/lib/mass-of/loaders'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { liturgicalActs } from './acts'
import { type HolyCard, useHolyCards } from './useHolyCards'

const sinceKey = 'holy-cards.since'

/** The day holy cards began for this user: the starter cards date from it. */
async function holyCardsSince(): Promise<string> {
  const stored = await getPreference(sinceKey)
  if (stored) return stored
  const today = format(getToday(), 'yyyy-MM-dd')
  await setPreference(sinceKey, today)
  return today
}

function catalogOf(cards: HolyCard[], starters: string[]): Catalog {
  const drawn = new Set(cards.map((c) => c.id))
  return {
    saints: cards.map((c) => ({ id: c.id, celebration: c.proper, day: c.feast })),
    // Liturgical, season, Ember Days, novena, book and lineage cards aren't
    // drawn yet; their doors give nothing until they are.
    liturgical: [],
    seasons: {},
    emberDays: {},
    novenas: {},
    books: {},
    lineages: {},
    starters: starters.filter((id) => drawn.has(id)),
  }
}

function useStarters(): string[] {
  const catalogVersion = useCatalogVersion()
  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion re-reads the manifest as the catalog warms
  return useMemo(() => {
    const entry = getEntry('practice/saint-of-the-day')
    if (!entry) return []
    return getRememberedManifest<PracticeManifest>(entry.hash)?.holyCardStarters ?? []
  }, [catalogVersion])
}

/**
 * The holy cards waiting to be redeemed today — sealed envelopes, soonest
 * deadline first. Undefined while the calendar and the cards load.
 */
export function usePendingHolyCards(): Grant[] | undefined {
  const today = format(useToday(), 'yyyy-MM-dd')
  const scope = scopeForContentLang(usePreferencesStore((s) => s.contentLanguage))
  const cards = useHolyCards()
  const starters = useStarters()
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
  const completions = useCompletionRange(historyStart(today), today)
  const copies = useEventStore((s) => s.holyCards)

  return useMemo(() => {
    if (!statics || !cards || !since) return undefined
    return pendingCards({
      acts: liturgicalActs(completions),
      occurrences: [],
      calendar: { statics, scope },
      catalog: catalogOf(cards, starters),
      firstOpened: since,
      copies: [...copies.values()],
      today,
    })
  }, [statics, cards, since, completions, copies, scope, starters, today])
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
