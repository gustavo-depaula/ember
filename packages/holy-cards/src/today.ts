import { firstOfEach, grants } from './engine'
import type { Copy, Door, EngineInput, Grant, IsoDate } from './types'

/** An act of the day that can win a card: Mass, the Office, or the day prayed. */
export type DayAct = 'mass' | 'office' | 'prayedDay'

/** A card `act` gives today: already won when the act is `done`, else what doing it would give. */
export type Offer = { act: DayAct; done: boolean; grant: Grant }

// The doors each act opens. Mass also closes a season, the Triduum and the rose
// Sundays; a novena or a round is finished by its own days, not by these.
const doors: Record<DayAct, readonly Door[]> = {
  mass: ['mass', 'seasonSunday', 'seasonWeekday', 'triduum', 'gaudete', 'laetare'],
  office: ['office'],
  prayedDay: ['prayedDay'],
}

/**
 * What today's Mass, Office and prayed day give, each asked of the rules as if
 * it were done, so a page never promises what they don't give. An act already
 * done is read as it stands. The Office and a prayed day are ways to one
 * card: once either is kept, the one it won (the opened one, if `copies` holds
 * it) is the day's card and the other offers nothing.
 */
export function offersToday(input: EngineInput, today: IsoDate, copies: Copy[] = []): Offer[] {
  const offers = (Object.keys(doors) as DayAct[]).flatMap((act) => {
    const done = input.acts.some((a) => a.kind === act && a.date === today)
    const acts = done ? input.acts : [...input.acts, { kind: act, date: today }]
    return grants({ ...input, acts }, today)
      .filter((g) => g.date === today && doors[act].includes(g.door))
      .map((grant) => ({ act, done, grant }))
  })
  const opened = new Set(copies.map((c) => c.grant))
  const won = firstOfEach(
    offers
      .filter((o) => o.done)
      .sort((a, b) => Number(opened.has(b.grant.id)) - Number(opened.has(a.grant.id)))
      .map((o) => ({ ...o.grant, offer: o })),
  ).map((g) => g.offer)
  const kept = new Set(won.map((o) => o.grant.oneOf).filter(Boolean))
  return offers.filter((o) =>
    o.done ? won.includes(o) : !o.grant.oneOf || !kept.has(o.grant.oneOf),
  )
}
