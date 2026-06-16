import { Platform } from 'react-native'
import type { LinkPrimitive, Primitive } from '@/content/primitives'
import type { SourceFetchContext } from '../types'
import { fetchPage } from './fetchPage'
import { parseGospelCommentary } from './parse'
import { gospelUrl, type Lang, narrowLang } from './url'

// Credit the source with a tappable link to the full page.
function attribution(lang: Lang, url: string): LinkPrimitive {
  const text =
    lang === 'pt-BR'
      ? 'Comentário do Opus Dei — leia a íntegra'
      : 'Commentary by Opus Dei — read the full reflection'
  return { type: 'link', text: { primary: text }, href: url }
}

// Web (CORS-blocked) or any fetch/parse failure: a graceful link-out.
function unavailable(lang: Lang, url: string): LinkPrimitive {
  const text =
    lang === 'pt-BR'
      ? 'Leia o comentário de hoje em opusdei.org'
      : "Read today's reflection on opusdei.org"
  return { type: 'link', text: { primary: text }, href: url }
}

// Opus Dei's commentary on today's Gospel, scraped from opusdei.org (native),
// degrading to a link-out on web or failure. `dateScoped` keys the cache per day.
export const opusDeiGospelCommentarySource = {
  id: 'producer/opus-dei-gospel-commentary',
  version: '1',
  prefsDeps: ['lang' as const],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive | Primitive[]> {
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
