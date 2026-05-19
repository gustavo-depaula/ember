// ContentSource — the v2 contract. One output shape (Primitive | Primitive[]),
// declarative cache deps (prefsDeps), source composition via injected accessor.
// No `kind` discriminator: a source's typed output is the contract.

import type { Primitive } from '@/content/primitives'

export type ProducerPrefs = {
  lang: string         // content language: 'en-US' | 'pt-BR'
  translation: string  // bible translation: 'DRB' | 'RSV2CE' | 'CNBB' | ...
}

export type SourceAccessor = {
  fetch<T extends Primitive | Primitive[]>(
    source: ContentSource<T>,
    params?: Record<string, unknown>,
  ): Promise<T>
}

export type SourceFetchContext = {
  params: Record<string, unknown>
  prefs: ProducerPrefs
  date: Date
  programDay?: number
  sources: SourceAccessor
}

export type ContentSource<T extends Primitive | Primitive[] = Primitive | Primitive[]> = {
  id: string
  version: string
  // Declarative — runtime composes the cache key from prefs[prefsDeps[i]].
  prefsDeps: (keyof ProducerPrefs)[]
  fetch: (ctx: SourceFetchContext) => Promise<T>
}
