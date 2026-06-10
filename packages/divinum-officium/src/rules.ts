// Structured access to [Rank] and [Rule] sections. The [Rank] line format is
// 'Title;;RankName;;rank-number[;;ex Common/Ref]'; version-specific variants
// are handled upstream by section conditions and conditional lines, so by the
// time text reaches here it is already version-resolved. [Rule] is a keyword
// grab-bag consulted by the hour/mass handlers; expose it as regex queries
// (mirroring how the Perl tests $rule =~ /…/i everywhere).

import type { Sections } from './references/resolve'

export type ParsedRank = {
  title: string
  rankName: string
  // Numeric occurrence value (1.0–7.x); 0 when absent/unparsable.
  rank: number
  // 'ex Sancti/06-30'-style common source, when present.
  source?: string
}

export function parseRank(sections: Sections): ParsedRank | undefined {
  const text = sections.Rank
  if (!text) return undefined
  const firstLine = text.split('\n')[0] ?? ''
  const parts = firstLine.split(';;')
  if (parts.length === 0 || !parts[0]) return undefined
  const rank = Number.parseFloat(parts[2] ?? '')
  const source = parts[3]?.trim()
  return {
    title: parts[0].trim(),
    rankName: (parts[1] ?? '').trim(),
    rank: Number.isFinite(rank) ? rank : 0,
    ...(source ? { source } : {}),
  }
}

export function ruleMatches(sections: Sections, pattern: RegExp): boolean {
  return pattern.test(sections.Rule ?? '')
}
