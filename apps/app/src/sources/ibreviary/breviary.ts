import { Platform } from 'react-native'
import type { Primitive, TextPrimitive } from '@/content/primitives'
import type { SourceFetchContext } from '../types'
import { hourSections, ibLangFor, narrowHour } from './config'
import { parseHourPage } from './parse'
import { fetchSectionHtml } from './session'

// iBreviary asks integrators to credit the app when reusing its texts
// (ibreviary.org/en/tools/ibreviary-on-your-website.html) — the credit lives
// in the practice's manifest description rather than inside every hour.

// ibreviary.com sends no CORS headers, so the browser can't fetch it. There
// is no offline office to substitute (unlike the Gospel producer), so web
// gets a plain notice. Native failures throw instead: preprocessFlow shows
// its retryable placeholder and nothing junk is ever cached.
function webPlaceholder(lang: string): TextPrimitive {
  const message =
    lang === 'pt-BR'
      ? 'A Liturgia das Horas não está disponível na web. Abra o Ember no seu telefone para rezar a hora de hoje.'
      : 'The Liturgy of the Hours is not available on the web. Open Ember on your phone to pray today’s hour.'
  return { type: 'text', text: { primary: message }, style: 'italic' }
}

// Today's office from iBreviary. The session queue serializes the POST-date +
// GET-page pairs (shared PHPSESSID); `dateScoped` keys the cache per day, and
// params.hour separates the seven canonical hours (terce/sext/none share one
// ora_media download and are split in parse).
export const breviarySource = {
  id: 'producer/breviary-of-the-day',
  // v1.1: attribution line no longer emitted — bump drops cached payloads
  // that still carry it.
  version: '1.1',
  prefsDeps: ['lang' as const],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive[] | TextPrimitive> {
    const hour = narrowHour(ctx.params.hour)
    if (Platform.OS === 'web') return webPlaceholder(ctx.prefs.lang)

    const ibLang = ibLangFor(ctx.prefs.lang)
    const html = await fetchSectionHtml(ibLang, ctx.date, hourSections[hour])
    return parseHourPage(html, hour, ibLang)
  },
}
