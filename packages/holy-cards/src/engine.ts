import { rules } from './rules'
import type { CardId, Copy, EngineInput, Grant, IsoDate } from './types'

/** Every card the user's acts have ever won, redeemed or not, oldest first. */
export function grants(input: EngineInput): Grant[] {
  return rules
    .flatMap((rule) => rule(input))
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
}

/**
 * The envelopes waiting on `today`: won, not yet redeemed, and still inside
 * their window. A lapsed card simply drops out; its door gives it again the
 * next time the act comes round. Soonest deadline first.
 */
export function pendingCards(input: EngineInput & { copies: Copy[]; today: IsoDate }): Grant[] {
  const redeemed = new Set(input.copies.map((c) => c.grant))
  // Each starter card is a different saint: the second leaves out the first.
  const starters = new Set(
    input.copies.filter((c) => c.grant.startsWith('starter:')).map((c) => c.card),
  )
  return grants(input)
    .filter((g) => !redeemed.has(g.id) && (!g.deadline || g.deadline >= input.today))
    .map((g) =>
      g.door === 'starter' ? { ...g, choice: g.choice.filter((c) => !starters.has(c)) } : g,
    )
    .sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'))
}

/**
 * The card a liturgical envelope holds: drawn from the ones not yet held,
 * every candidate equally likely, seeded by the grant so it never changes
 * while the envelope waits. Once all are held, any of them (a copy).
 */
export function drawCard(grant: Grant, copies: Copy[]): CardId {
  const held = new Set(copies.map((c) => c.card))
  const unheld = grant.choice.filter((c) => !held.has(c))
  const pool = unheld.length > 0 ? unheld : grant.choice
  return pool[hash(grant.id) % pool.length]
}

/**
 * The copy to store when the user redeems `grant` on `today`. `card` is their
 * pick when the envelope offers a choice; a liturgical envelope ignores it and
 * draws.
 */
export function redeem(grant: Grant, today: IsoDate, copies: Copy[], card?: CardId): Copy {
  const chosen = grant.door === 'liturgical' ? drawCard(grant, copies) : (card ?? grant.choice[0])
  if (!grant.choice.includes(chosen)) {
    throw new Error(`${chosen} is not a card offered by ${grant.id}`)
  }
  if (grant.choice.length > 1 && grant.door !== 'liturgical' && !card) {
    throw new Error(`${grant.id} offers a choice; pick a card`)
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
