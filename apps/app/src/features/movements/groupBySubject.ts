import type { Movement } from '@/db/events'

export function groupBySubject(items: Movement[]): Array<[string | undefined, Movement[]]> {
  const hasAny = items.some((m) => m.subject)
  if (!hasAny) return [[undefined, items]]
  const groups = new Map<string | undefined, Movement[]>()
  for (const m of items) {
    const arr = groups.get(m.subject) ?? []
    arr.push(m)
    groups.set(m.subject, arr)
  }
  return [...groups.entries()].sort((a, b) => {
    if (a[0] === undefined) return 1
    if (b[0] === undefined) return -1
    return a[0].localeCompare(b[0])
  })
}
