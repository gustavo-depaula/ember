export function randomId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  const head = Date.now().toString(36)
  const tail = Math.random().toString(36).slice(2, 12)
  return `${head}-${tail}`
}
