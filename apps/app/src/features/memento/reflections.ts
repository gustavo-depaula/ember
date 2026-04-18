export type MementoPillar = 'mors' | 'iudicium' | 'caelum' | 'infernum'

export const mementoPillars: readonly MementoPillar[] = ['mors', 'iudicium', 'caelum', 'infernum']

export const reflectionCount = 28

export type Reflection = { pillar: MementoPillar; index: number }

const order: Reflection[] = []
for (let i = 0; i < 7; i++) {
  for (const pillar of mementoPillars) order.push({ pillar, index: order.length })
}

export function reflectionForDay(date: Date): Reflection {
  const day = Math.floor(date.getTime() / 86400000)
  return order[((day % reflectionCount) + reflectionCount) % reflectionCount]
}
