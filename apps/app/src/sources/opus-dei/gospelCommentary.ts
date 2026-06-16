import { Platform } from 'react-native'
import type { Primitive, TextPrimitive } from '@/content/primitives'
import type { SourceFetchContext } from '../types'
import { fetchPage } from './fetchPage'
import { parseGospelCommentary } from './parse'
import { gospelUrl, type Lang, narrowLang } from './url'

// Credit the source and point to the full page (the in-app renderer has no
// external links, so the URL rides as text).
function attribution(lang: Lang, url: string): TextPrimitive {
  const text =
    lang === 'pt-BR'
      ? `Comentário do Opus Dei. Leia a íntegra em ${url}`
      : `Commentary by Opus Dei. Read the full reflection at ${url}`
  return { type: 'text', text: { primary: text }, style: 'italic' }
}

// Web (CORS-blocked) or any fetch/parse failure: a graceful link-out.
function unavailable(lang: Lang, url: string): TextPrimitive {
  const text =
    lang === 'pt-BR'
      ? `O comentário de hoje sobre o Evangelho está disponível em ${url}`
      : `Today's reflection on the Gospel is available at ${url}`
  return { type: 'text', text: { primary: text }, style: 'italic' }
}

// Opus Dei's commentary on today's Gospel, scraped from opusdei.org (native),
// degrading to a link-out on web or failure. `dateScoped` keys the cache per day.
export const opusDeiGospelCommentarySource = {
  id: 'producer/opus-dei-gospel-commentary',
  version: '1',
  prefsDeps: ['lang' as const],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive[] | TextPrimitive> {
    const lang = narrowLang(ctx.prefs.lang)
    const url = gospelUrl(lang, ctx.date)
    if (Platform.OS === 'web') return unavailable(lang, url)
    try {
      const blocks = parseGospelCommentary(await fetchPage(url), lang)
      return [{ type: 'prose', blocks }, attribution(lang, url)]
    } catch {
      return unavailable(lang, url)
    }
  },
}
