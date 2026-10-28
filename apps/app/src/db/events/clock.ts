import { randomId } from '@/lib/id'

// A hybrid logical clock: the id it gives an event is unique across devices
// and sorts after every id this runtime has written or read, so one log can be
// folded in the same order wherever its events came from. Wall time leads, a
// counter separates events of one millisecond, and the writer's tag separates
// writers that tick at once — two devices, or two tabs sharing a database.

type Tick = { wall: number; counter: number }

const counterLimit = 36 ** 4

/** A tag no other writer is likely to draw. */
export function newWriterTag(): string {
  return randomId().replaceAll('-', '').slice(-8)
}

const writer = newWriterTag()
let last: Tick = { wall: 0, counter: 0 }

// The moment after `from`: `now` if the wall clock has moved on, else the next
// count — into the next millisecond once a millisecond's counts are spent.
function tick(from: Tick, now: number): Tick {
  if (now > from.wall) return { wall: now, counter: 0 }
  if (from.counter + 1 === counterLimit) return { wall: from.wall + 1, counter: 0 }
  return { wall: from.wall, counter: from.counter + 1 }
}

function format({ wall, counter }: Tick, tag: string): string {
  return `${String(wall).padStart(13, '0')}-${counter.toString(36).padStart(4, '0')}-${tag}`
}

export function nextId(now = Date.now()): string {
  last = tick(last, now)
  return format(last, writer)
}

/** Keeps the clock ahead of an id written elsewhere: an earlier launch, another device. */
export function observe(id: string | undefined): void {
  if (!id) return
  const [wallPart, counterPart] = id.split('-')
  const seen = { wall: Number(wallPart), counter: Number.parseInt(counterPart, 36) }
  if (seen.wall > last.wall || (seen.wall === last.wall && seen.counter > last.counter)) last = seen
}

/**
 * Ids for a log written before events had them, in the order it was written:
 * each takes the time it was stored at, or the moment after the one before it
 * when the device's clock had gone backwards.
 */
export function idsInOrder(timestamps: number[], tag: string): string[] {
  let at: Tick = { wall: 0, counter: 0 }
  return timestamps.map((timestamp) => {
    at = tick(at, timestamp)
    return format(at, tag)
  })
}
