// DoLoader — dependency-injected access to the imported corpus. Paths are
// DO-relative without extension: 'horas/Latin/Sancti/01-25',
// 'missa/Latin/Ordo/Ordo', 'horas/Ordinarium/Laudes', 'Tabulae/Kalendaria/1960'.
// Implementations: filesystem-on-content/do (scripts, tests) and corpus-backed
// (the app). `exists` is first-class because DO's precedence and fallback
// logic checks file existence (variant files, Latin dir fallbacks).

import type { DoPath, ParsedDoFile } from './types'

export type DoLoader = {
  load(path: DoPath): Promise<ParsedDoFile | undefined>
  exists(path: DoPath): Promise<boolean>
}

export function memoizedLoader(base: DoLoader): DoLoader {
  const cache = new Map<string, Promise<ParsedDoFile | undefined>>()
  return {
    load(path) {
      let hit = cache.get(path)
      if (!hit) {
        hit = base.load(path)
        cache.set(path, hit)
      }
      return hit
    },
    async exists(path) {
      return (await this.load(path)) !== undefined
    },
  }
}
