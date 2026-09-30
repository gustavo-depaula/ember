import type { Copy } from '@ember/holy-cards'

import { useEventStore } from '@/db/events'

// Grouped once per store map, not per component: the gallery, its viewer and
// the Library all read it together. The store's map is replaced on each redeem.
const grouped = new WeakMap<Map<string, Copy>, Map<string, Copy[]>>()
const noCopies: Copy[] = []

function byCard(copies: Map<string, Copy>): Map<string, Copy[]> {
  const cached = grouped.get(copies)
  if (cached) return cached
  // Latest redeemed first; the map holds them in redeeming order, so reversing
  // before the (stable) sort also puts the later of a day's copies first.
  const latestFirst = [...copies.values()].reverse().sort((a, b) => b.date.localeCompare(a.date))
  const held = new Map<string, Copy[]>()
  for (const copy of latestFirst) {
    const list = held.get(copy.card)
    if (list) list.push(copy)
    else held.set(copy.card, [copy])
  }
  grouped.set(copies, held)
  return held
}

/**
 * The holy cards the soul holds: each card's redeemed copies, the latest
 * first, keyed in the order their latest copy was redeemed. A card is
 * collected once a copy is held.
 */
export function useHeldCards(): Map<string, Copy[]> {
  return byCard(useEventStore((s) => s.holyCards))
}

/** One card's copies, the latest first; empty while none is held. */
export function useCopies(card: string): Copy[] {
  return useHeldCards().get(card) ?? noCopies
}
