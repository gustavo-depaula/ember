import type { Tier } from '@/db/schema'

// The timing rules behind "Pray now", kept pure so they can be checked against
// every plan at every hour. Times are minutes into the logical day, which runs
// 04:00–04:00 like useToday: 01:00 is 25:00, the tail of the evening.
//
// Each timed practice holds its timeframe: it opens `lead` minutes early and
// stays on time until the next practice of the day comes due — but never past
// its part of the day (morning ends at 12:00, daytime at 17:00, evening when
// the day does). An essential holds at least two hours past its time, even
// through the practices that come due after it. An office not pinned to an
// hour is always on time. The earliest on-time practice wins — the plan's own
// order — with tier only breaking ties; practices that open early overlap the
// one before, and the earlier still goes first. A practice whose timeframe has passed is not
// offered again: the card is about now, and Today's plan list keeps what was
// missed. With nothing on time, the next to open is "coming up".

const lead = 30
const essentialHold = 2 * 60
const dayStart = 4 * 60
const dayEnd = dayStart + 24 * 60
const tierRank: Record<Tier, number> = { essential: 0, ideal: 1, extra: 2 }

export type Timed = {
  due: number
  tier: Tier
  office?: boolean
}

/** Minutes into the logical day: 00:00–03:59 count as 24:00–27:59. */
export function dayMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  const minutes = h * 60 + (m || 0)
  return minutes < dayStart ? minutes + 24 * 60 : minutes
}

export function clockOf(minutes: number): string {
  const m = minutes % (24 * 60)
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** The end of the part of the day a time falls in, as Today's blocks divide it. */
function blockEnd(due: number): number {
  if (due < 12 * 60) return 12 * 60
  if (due < 17 * 60) return 17 * 60
  return dayEnd
}

const byDueThenTier = (a: Timed, b: Timed) => a.due - b.due || tierRank[a.tier] - tierRank[b.tier]

/**
 * Picks from what's left of a day. `dues` are the times of every timed
 * practice in the plan, prayed or not, so a timeframe ends where the plan says
 * — not where the next unprayed practice happens to be.
 */
export function pickByWindow<T extends Timed>(
  items: T[],
  now: number,
  dues: number[],
): { next?: T; comingUp: boolean } {
  const ends = (s: T) => {
    const end = Math.min(blockEnd(s.due), ...dues.filter((d) => d > s.due))
    return s.tier === 'essential' ? Math.max(end, s.due + essentialHold) : end
  }
  const onTime = items
    .filter((s) => s.office || (now >= s.due - lead && now < ends(s)))
    .sort(byDueThenTier)
  if (onTime.length > 0) return { next: onTime[0], comingUp: false }
  const upcoming = items.filter((s) => !s.office && now < s.due - lead).sort(byDueThenTier)
  return { next: upcoming[0], comingUp: true }
}
