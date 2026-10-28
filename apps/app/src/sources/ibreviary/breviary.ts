import type { Primitive } from '@/content/primitives'
import type { SourceFetchContext } from '../types'
import { hourSections, ibLangFor, narrowHour } from './config'
import { parseHourPage } from './parse'
import { fetchSectionHtml } from './session'

// iBreviary asks integrators to credit the app when reusing its texts
// (ibreviary.org/en/tools/ibreviary-on-your-website.html) — the credit lives
// in the practice's manifest description rather than inside every hour.

// Failures throw: preprocessFlow shows its retryable placeholder and nothing
// junk is ever cached.
// Today's office from iBreviary. The session queue serializes the POST-date +
// GET-page pairs (shared PHPSESSID); `dateScoped` keys the cache per day, and
// params.hour separates the seven canonical hours (terce/sext/none share one
// ora_media download and are split in parse).
export const breviarySource = {
  id: 'producer/breviary-of-the-day',
  version: '1.1',
  prefsDeps: ['lang' as const],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive[]> {
    const hour = narrowHour(ctx.params.hour)

    const ibLang = ibLangFor(ctx.prefs.lang)
    const html = await fetchSectionHtml(ibLang, ctx.date, hourSections[hour])
    return parseHourPage(html, hour, ibLang)
  },
}
