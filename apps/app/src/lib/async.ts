export const yieldToUI = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

export async function batchedLoad<T>(items: T[], fn: (item: T) => Promise<void>, batchSize = 3) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await Promise.all(batch.map(fn))
    await yieldToUI()
  }
}
