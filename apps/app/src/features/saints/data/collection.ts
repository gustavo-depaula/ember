import type { Copy } from '@ember/holy-cards'
import { useMemo } from 'react'

import { useEventStore } from '@/db/events'

/**
 * The holy cards the soul holds: each card's redeemed copies, the latest
 * first. A card is collected once a copy is held. Copies project in the order
 * they were redeemed, so reversing them puts the latest on top.
 */
export function useHeldCards(): Map<string, Copy[]> {
  const copies = useEventStore((s) => s.holyCards)
  return useMemo(() => {
    const held = new Map<string, Copy[]>()
    for (const copy of [...copies.values()].reverse()) {
      held.set(copy.card, [...(held.get(copy.card) ?? []), copy])
    }
    return held
  }, [copies])
}
