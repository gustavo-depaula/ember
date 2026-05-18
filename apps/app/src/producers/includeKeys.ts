import type { RenderedSection } from '@/content/types'

export type IncludeRequest = {
  ref: string
  params?: Record<string, unknown>
  // Stable key that identifies a (ref, params) pair — used for cache keying
  // and lookup. Two includes with the same ref but different params resolve
  // to distinct cache entries.
  key: string
}

export function includeKeyFor(ref: string, params?: Record<string, unknown>): string {
  if (!params) return ref
  const keys = Object.keys(params).sort()
  if (keys.length === 0) return ref
  // Sort keys so that semantically equivalent params (different insertion
  // order) yield the same cache key.
  return `${ref}::${JSON.stringify(params, keys)}`
}

// `walk` is injected so this module stays independent of PracticeFlow's
// section-tree traversal.
export function collectIncludes(
  sections: RenderedSection[],
  walk: (sections: RenderedSection[]) => Iterable<RenderedSection>,
): IncludeRequest[] {
  const seen = new Map<string, IncludeRequest>()
  for (const s of walk(sections)) {
    if (s.type !== 'include') continue
    const key = includeKeyFor(s.ref, s.params)
    if (!seen.has(key)) seen.set(key, { ref: s.ref, params: s.params, key })
  }
  return Array.from(seen.values())
}
