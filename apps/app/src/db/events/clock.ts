// A hybrid logical clock: the id it gives an event is unique across devices
// and sorts after every id this runtime has written or read, so one log can be
// folded in the same order wherever its events came from. Wall time leads, a
// counter separates events of one millisecond, and the writer's tag separates
// writers that tick at once — two devices, or two tabs sharing a database.

const writer = newWriterTag()
const counterLimit = 36 ** 4

let wall = 0
let counter = 0

function format(wallMs: number, count: number, tag: string): string {
  return `${String(wallMs).padStart(13, '0')}-${count.toString(36).padStart(4, '0')}-${tag}`
}

export function nextId(now = Date.now()): string {
  if (now > wall) {
    wall = now
    counter = 0
  } else {
    counter += 1
    if (counter === counterLimit) {
      wall += 1
      counter = 0
    }
  }
  return format(wall, counter, writer)
}

/** Keeps the clock ahead of an id written elsewhere: an earlier launch, another device. */
export function observe(id: string | undefined): void {
  if (!id) return
  const [wallPart, counterPart] = id.split('-')
  const seenWall = Number(wallPart)
  const seenCounter = Number.parseInt(counterPart, 36)
  if (seenWall > wall || (seenWall === wall && seenCounter > counter)) {
    wall = seenWall
    counter = seenCounter
  }
}

/**
 * Ids for a log written before events had them, in the order it was written:
 * each takes the time it was stored at, or the id before it when the device's
 * clock had gone backwards.
 */
export function idsInOrder(timestamps: number[], tag: string): string[] {
  let at = 0
  let count = 0
  return timestamps.map((timestamp) => {
    if (timestamp > at) {
      at = timestamp
      count = 0
    } else {
      count += 1
    }
    return format(at, count, tag)
  })
}

/** A tag no other writer is likely to draw; function-hoisted for the constant above. */
export function newWriterTag(): string {
  return Math.random().toString(36).slice(2, 10).padEnd(8, '0')
}
