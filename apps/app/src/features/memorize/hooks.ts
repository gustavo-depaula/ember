import { useCallback, useMemo, useState } from 'react'

import { resolvePrayer } from '@/content/resolver'
import { getAllCards, recordReview } from '@/db/repositories/memorization'

import { extractPortionContent } from './content'
import { pickMode } from './modes'
import { buildSession } from './queue'
import type { MemorizationCardState, Mode, ReviewOutcome } from './types'

// Snapshot the queue once at session start. Mid-session opt-ins (rare) wait
// until the next session — this keeps the cap honored and the day predictable.
export function useMemorizeSession({
  today,
  cap,
  newRatio,
}: {
  today: string
  cap?: number
  newRatio?: number
}) {
  const [queue] = useState<MemorizationCardState[]>(() =>
    buildSession({ allCards: getAllCards(), today, cap, newRatio }),
  )
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentCard = queue[currentIndex]
  const currentMode: Mode | undefined = currentCard ? pickMode(currentCard) : undefined
  const isComplete = currentIndex >= queue.length

  const record = useCallback(
    async (outcome: ReviewOutcome) => {
      if (!currentCard) return
      await recordReview({
        prayerId: currentCard.prayerId,
        language: currentCard.language,
        portionIndex: currentCard.portionIndex,
        outcome,
        today,
      })
      setCurrentIndex((i) => i + 1)
    },
    [currentCard, today],
  )

  return {
    currentIndex,
    currentCard,
    currentMode,
    isComplete,
    totalCount: queue.length,
    record,
  }
}

// Resolves the prayer manifest for the current card and extracts the title +
// portion lines + portion label. resolvePrayer is sync (manifests are warmed
// at boot), so this is a thin useMemo.
export function useCardContent(card: MemorizationCardState | undefined) {
  return useMemo(() => {
    if (!card) return undefined
    const prayer = resolvePrayer(card.prayerId)
    if (!prayer) return undefined
    return extractPortionContent(prayer, card.language, card.portionIndex)
  }, [card])
}
