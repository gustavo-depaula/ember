/**
 * Tiny p-limit-style concurrency cap. Avoids adding a dependency for ~30 lines
 * of code; used by the feed fetcher to keep parallel feed requests under
 * control on flaky networks.
 */

export type Limiter = <T>(fn: () => Promise<T>) => Promise<T>

export function createLimiter(concurrency: number): Limiter {
  let active = 0
  const queue: Array<() => void> = []

  function next() {
    if (active >= concurrency) return
    const job = queue.shift()
    if (!job) return
    active++
    job()
  }

  return function run<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        fn()
          .then(resolve, reject)
          .finally(() => {
            active--
            next()
          })
      })
      next()
    })
  }
}
