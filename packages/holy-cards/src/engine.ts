import { addDays, ascending, yearOf } from './dates'
import { longestWindow, rules } from './rules'
import { seasonsStartingIn } from './seasons'
import type { CardId, Copy, EngineInput, Grant, IsoDate } from './types'

/**
 * The cards the user's acts have won, redeemed or not, oldest first — every
 * one, or from `since` on (earlier ones may still appear).
 */
export function grants(input: EngineInput, since: IsoDate = ''): Grant[] {
  return rules
    .flatMap((rule) => rule(input, since))
    .sort((a, b) => ascending(a.date, b.date) || ascending(a.id, b.id))
}

/**
 * The earliest Mass or Office that can still matter on `today`: the start of
 * the oldest season whose card could still be waiting. `pendingCards` needs no
 * acts before it (practice occurrences excepted: a lineage counts them all).
 */
export function historyStart(today: IsoDate): IsoDate {
  const since = addDays(today, -longestWindow)
  const year = yearOf(since)
  return [year - 1, year]
    .flatMap(seasonsStartingIn)
    .filter((w) => w.end >= since)
    .reduce((earliest, w) => (w.start < earliest ? w.start : earliest), since)
}

/**
 * The envelopes waiting on `today`: won, not yet redeemed, and still inside
 * their window. A lapsed card simply drops out; its door gives it again the
 * next time the act comes round. Soonest deadline first.
 */
export function pendingCards(input: EngineInput & { copies: Copy[]; today: IsoDate }): Grant[] {
  const redeemed = new Set(input.copies.map((c) => c.grant))
  const won = grants(input, addDays(input.today, -longestWindow))
  // Cards already chosen in each group, so the group's next grant offers another.
  const byId = new Map(won.map((g) => [g.id, g]))
  const chosen = new Map<string, Set<CardId>>()
  for (const c of input.copies) {
    const group = byId.get(c.grant)?.group
    if (group) chosen.set(group, (chosen.get(group) ?? new Set()).add(c.card))
  }
  return won
    .filter((g) => !redeemed.has(g.id) && (!g.deadline || g.deadline >= input.today))
    .map((g) => {
      const taken = g.group && chosen.get(g.group)
      return taken ? { ...g, choice: g.choice.filter((c) => !taken.has(c)) } : g
    })
    .sort((a, b) => ascending(a.deadline ?? '9999', b.deadline ?? '9999'))
}

/**
 * The card a drawn envelope holds: drawn from the ones not yet held, every
 * candidate equally likely, seeded by the grant so it never changes while the
 * envelope waits. Once all are held, any of them (a copy).
 */
export function drawCard(grant: Grant, copies: Copy[]): CardId {
  const held = new Set(copies.map((c) => c.card))
  const unheld = grant.choice.filter((c) => !held.has(c))
  const pool = unheld.length > 0 ? unheld : grant.choice
  return pool[hash(grant.id) % pool.length]
}

/**
 * The copy to store when the user redeems `grant` on `today`. `card` is their
 * pick when the envelope offers a choice; a drawn envelope ignores it.
 */
export function redeem(grant: Grant, today: IsoDate, copies: Copy[], card?: CardId): Copy {
  if (grant.drawn) return { grant: grant.id, card: drawCard(grant, copies), date: today }
  const chosen = card ?? (grant.choice.length === 1 ? grant.choice[0] : undefined)
  if (!chosen) throw new Error(`${grant.id} offers a choice; pick a card`)
  if (!grant.choice.includes(chosen)) {
    throw new Error(`${chosen} is not a card offered by ${grant.id}`)
  }
  return { grant: grant.id, card: chosen, date: today }
}

// FNV-1a: a small, stable string hash (the same on Hermes and Node).
function hash(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}
