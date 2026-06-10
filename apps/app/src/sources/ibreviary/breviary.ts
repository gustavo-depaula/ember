import { Platform } from 'react-native'
import type { Primitive, TextPrimitive } from '@/content/primitives'
import type { SourceFetchContext } from '../types'
import { hourSections, ibLangFor, narrowHour } from './config'
import { pairEditions } from './pair'
import { parseHourPage } from './parse'
import { fetchSectionHtml } from './session'

// iBreviary asks integrators to credit the app when reusing its texts
// (ibreviary.org/en/tools/ibreviary-on-your-website.html). Emitted by the
// source so it travels with the content and never shows under failure
// placeholders.
const attributionMessages: Record<string, string> = {
  'pt-BR': 'Textos da Liturgia das Horas fornecidos por iBreviary — ibreviary.org',
  la: 'Textus Liturgiæ Horarum ab iBreviary præbiti — ibreviary.org',
}

function attribution(lang: string): TextPrimitive {
  const message =
    attributionMessages[lang] ??
    'Texts of the Liturgy of the Hours provided by iBreviary — ibreviary.org'
  return { type: 'text', text: { primary: message }, style: 'italic' }
}

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
  // v2: bilingual pairing — secondary-language users get the second edition
  // attached as `secondary` on aligned primitives.
  version: '2',
  prefsDeps: ['lang' as const, 'secondary' as const],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive[] | TextPrimitive> {
    const hour = narrowHour(ctx.params.hour)
    if (Platform.OS === 'web') return webPlaceholder(ctx.prefs.lang)

    const ibLang = ibLangFor(ctx.prefs.lang)
    const html = await fetchSectionHtml(ibLang, ctx.date, hourSections[hour])
    const primitives = parseHourPage(html, hour, ibLang)

    // Pair in the user's secondary language when it maps to a different
    // iBreviary edition (typically Latin). Pairing is an enhancement: if the
    // second edition fails to fetch or parse, warn and serve primary-only
    // rather than failing the hour — the day-scoped cache retries tomorrow.
    const pairLang = ctx.prefs.secondary ? ibLangFor(ctx.prefs.secondary) : undefined
    if (pairLang && pairLang !== ibLang) {
      try {
        const pairHtml = await fetchSectionHtml(pairLang, ctx.date, hourSections[hour])
        pairEditions(primitives, parseHourPage(pairHtml, hour, pairLang), ibLang, pairLang)
      } catch (err) {
        console.warn(`ibreviary: ${pairLang} pairing failed for ${hour}, serving primary only`, err)
      }
    }

    return [...primitives, attribution(ctx.prefs.lang)]
  },
}
