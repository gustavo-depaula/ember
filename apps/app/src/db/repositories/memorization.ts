import type { ContentLanguage } from '@ember/content-engine'

import { composeCardKey, composePrayerLangKey } from '@/features/memorize/cardKey'
import type { MemorizationCardState, ReviewOutcome } from '@/features/memorize/types'

import { emit, emitBatch, useEventStore } from '../events'

// --- Types ---

export type CardSpec = {
  portionIndex: number
  totalLines: number
}

// --- Reads ---

export function getCard(
  prayerId: string,
  language: ContentLanguage,
  portionIndex: number,
): MemorizationCardState | undefined {
  return useEventStore
    .getState()
    .memorizationCards.get(composeCardKey(prayerId, language, portionIndex))
}

export function getCardsForPrayer(
  prayerId: string,
  language?: ContentLanguage,
): MemorizationCardState[] {
  return getAllCards().filter(
    (card) => card.prayerId === prayerId && (!language || card.language === language),
  )
}

export function getAllCards(): MemorizationCardState[] {
  return [...useEventStore.getState().memorizationCards.values()]
}

export function isOptedIn(prayerId: string, language: ContentLanguage): boolean {
  const set = useEventStore
    .getState()
    .cardsByPrayerLanguage.get(composePrayerLangKey(prayerId, language))
  return Boolean(set && set.size > 0)
}

// --- Mutations ---

// Caller resolves portion specs from the prayer manifest (body lines + memorize.portions)
// and passes them in. The repository is intentionally unaware of content resolution.
export async function optInMemorization(
  prayerId: string,
  language: ContentLanguage,
  specs: CardSpec[],
): Promise<void> {
  if (specs.length === 0) return
  const createdAt = Date.now()
  await emitBatch(
    specs.map((spec) => ({
      type: 'MemorizationOptedIn' as const,
      prayerId,
      language,
      portionIndex: spec.portionIndex,
      totalLines: spec.totalLines,
      createdAt,
    })),
  )
}

export async function optOutMemorization(
  prayerId: string,
  language: ContentLanguage,
): Promise<void> {
  await emit({ type: 'MemorizationOptedOut', prayerId, language })
}

export async function recordReview(args: {
  prayerId: string
  language: ContentLanguage
  portionIndex: number
  outcome: ReviewOutcome
  today: string
}): Promise<void> {
  await emit({
    type: 'MemorizationReviewed',
    prayerId: args.prayerId,
    language: args.language,
    portionIndex: args.portionIndex,
    reviewedAt: Date.now(),
    outcome: args.outcome,
    today: args.today,
  })
}
