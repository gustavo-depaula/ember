import type { LocalizedText } from '@/content/types'

import type { ResolvedPortion } from './types'

// Default line splitting matches the existing corpus convention: split on `\n`,
// drop whitespace-only entries. For prayers where this is wrong, authors set
// `memorize.portions` explicitly — there is no separate "line override".
export function splitBodyLines(body: string): string[] {
  return body.split('\n').filter((l) => l.trim().length > 0)
}

export type PortionRange = { lines: [number, number]; label?: LocalizedText }

// Validate and resolve author-marked portions (1-indexed inclusive ranges).
// When portions is undefined or empty, the entire body is one portion.
export function resolvePortions(
  bodyLines: string[],
  portions: PortionRange[] | undefined,
): ResolvedPortion[] {
  if (!portions || portions.length === 0) {
    return [
      {
        lines: bodyLines,
        label: undefined,
        startLine: 1,
        endLine: bodyLines.length,
      },
    ]
  }

  let expectedStart = 1
  const resolved: ResolvedPortion[] = []
  for (const portion of portions) {
    const [start, end] = portion.lines
    if (start !== expectedStart) {
      throw new Error(
        `portions must cover the body without gaps or overlaps (expected start ${expectedStart}, got ${start})`,
      )
    }
    if (end < start) {
      throw new Error(`portions: invalid range [${start}, ${end}] (end before start)`)
    }
    if (end > bodyLines.length) {
      throw new Error(`portions: range [${start}, ${end}] exceeds body length ${bodyLines.length}`)
    }
    resolved.push({
      lines: bodyLines.slice(start - 1, end),
      label: portion.label,
      startLine: start,
      endLine: end,
    })
    expectedStart = end + 1
  }
  if (expectedStart - 1 !== bodyLines.length) {
    throw new Error(
      `portions must cover the full body (covered ${expectedStart - 1} of ${bodyLines.length} lines)`,
    )
  }
  return resolved
}
