import { Platform } from 'react-native'
import type { ProsePrimitive, TextPrimitive } from '@/content/primitives'
import type { SourceFetchContext } from '../types'
import { fetchDay } from './fetchPage'
import { parseSection } from './parse'
import { type Lang, narrowLang } from './url'

function webFallback(lang: Lang): TextPrimitive {
  const message =
    lang === 'pt-BR'
      ? 'A reflexão diária do Papa está disponível no app Ember para iOS e Android.'
      : "The Pope's daily reflection is available in the Ember app on iOS and Android."
  return { type: 'text', text: { primary: message }, style: 'italic' }
}

// Imports only the "words of the Popes" reflection from the daily page. On
// native failure it throws (uncached, retried) — preprocessFlow's per-include
// guard degrades just this tab to a placeholder rather than breaking the
// Gospel tab. Web (CORS-blocked) gets a text fallback. `dateScoped`.
export const wordOfThePopeSource = {
  id: 'producer/word-of-the-pope',
  version: '1',
  prefsDeps: ['lang' as const],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<ProsePrimitive | TextPrimitive> {
    const lang = narrowLang(ctx.prefs.lang)
    if (Platform.OS === 'web') return webFallback(lang)

    const html = await fetchDay(lang, ctx.date)
    return { type: 'prose', blocks: parseSection(html, lang, 'pope') }
  },
}
