export const yieldToUI = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

/**
 * Runs `fn` over `items` with at most `concurrency` in flight, refilling a slot
 * as soon as one settles. Lockstep batches waited on each batch's slowest
 * request and a timer yield between batches; at boot those timers starve
 * behind native promise resolutions. `fn` should handle its own errors.
 */
export async function pooledLoad<T>(
  items: readonly T[],
  fn: (item: T) => Promise<void>,
  concurrency: number,
): Promise<void> {
  let next = 0
  async function worker(): Promise<void> {
    while (next < items.length) await fn(items[next++])
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
}
