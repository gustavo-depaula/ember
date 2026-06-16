import { Platform } from 'react-native'
import type { LinkPrimitive, Primitive } from '@/content/primitives'
import type { SourceFetchContext } from '../types'
import { fetchPage } from './fetchPage'
import { parseMeditation } from './parse'
import { type Lang, meditationUrl, narrowLang } from './url'

function attribution(lang: Lang, url: string): LinkPrimitive {
  const text =
    lang === 'pt-BR'
      ? 'Meditação do Opus Dei — leia a íntegra'
      : 'Meditation by Opus Dei — read the full text'
  return { type: 'link', text: { primary: text }, href: url }
}

function unavailable(lang: Lang, url: string): LinkPrimitive {
  const text =
    lang === 'pt-BR'
      ? 'Leia a meditação de hoje em opusdei.org'
      : "Read today's meditation on opusdei.org"
  return { type: 'link', text: { primary: text }, href: url }
}

// Today's meditation title + lead, for compact surfaces (the Explore featured
// card). Native only — returns undefined on web or any fetch/parse failure so
// the caller can fall back to a static label.
export async function fetchMeditationSummary(
  appLang: string,
  date: Date,
): Promise<{ title?: string; lead?: string } | undefined> {
  if (Platform.OS === 'web') return undefined
  const lang = narrowLang(appLang)
  try {
    const { title, lead } = parseMeditation(await fetchPage(meditationUrl(lang, date)), lang)
    return title || lead ? { title, lead } : undefined
  } catch {
    return undefined
  }
}

// Opus Dei's daily meditation, scraped from opusdei.org (native), degrading to a
// link-out on web or failure. `dateScoped` keys the cache per day.
export const opusDeiMeditationSource = {
  id: 'producer/opus-dei-meditation',
  // v2: attribution/link-out now emit a `link` primitive — drop v1's cached
  // payloads (which carried the raw URL as text).
  version: '2',
  prefsDeps: ['lang' as const],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive | Primitive[]> {
    const lang = narrowLang(ctx.prefs.lang)
    const url = meditationUrl(lang, ctx.date)
    if (Platform.OS === 'web') return unavailable(lang, url)
    try {
      const { title, lead, sections } = parseMeditation(await fetchPage(url), lang)
      const out: Primitive[] = []
      if (title) out.push({ type: 'heading', text: { primary: title }, size: 'h2' })
      if (lead) out.push({ type: 'text', text: { primary: lead }, style: 'italic' })
      for (const section of sections) {
        if (section.heading) {
          out.push({ type: 'heading', text: { primary: section.heading }, size: 'h2' })
        }
        if (section.blocks.length) out.push({ type: 'prose', blocks: section.blocks })
      }
      out.push(attribution(lang, url))
      return out
    } catch {
      return unavailable(lang, url)
    }
  },
}
