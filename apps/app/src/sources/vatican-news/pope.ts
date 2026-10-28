import type { ProsePrimitive } from '@/content/primitives'
import type { SourceFetchContext } from '../types'
import { fetchDay } from './fetchPage'
import { parseSection } from './parse'
import { narrowLang } from './url'

// Imports only the "words of the Popes" reflection from the daily page. On
// failure it throws (uncached, retried) — preprocessFlow's per-include guard
// degrades just this tab to a placeholder rather than breaking the Gospel tab.
// `dateScoped`.
export const wordOfThePopeSource = {
  id: 'producer/word-of-the-pope',
  version: '1',
  prefsDeps: ['lang' as const],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<ProsePrimitive> {
    const lang = narrowLang(ctx.prefs.lang)

    const html = await fetchDay(lang, ctx.date)
    return { type: 'prose', blocks: parseSection(html, lang, 'pope') }
  },
}
