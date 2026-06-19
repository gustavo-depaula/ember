import type { VersesPrimitive } from '@/content/primitives'
import i18n from '@/lib/i18n'
import { fetchParagraphs } from './ccc/extract'
import type { Lang } from './ccc/parse'
import { requirePositiveInt } from './params'
import type { ContentSource } from './types'

const ID = 'producer/ccc-chapter'

function narrowLang(lang: string): Lang {
  return lang === 'pt-BR' ? 'pt-BR' : 'en-US'
}

// Daily-office / Bible-in-a-year CCC reading: a contiguous run of paragraphs,
// scraped from vatican.va (bilingual). Output unchanged from the old ccc.json
// backend, so the practice flows that reference `producer/ccc-chapter` need no
// edits. Cached by the ContentSource framework (id/version/lang/params).
export const cccChapterSource: ContentSource<VersesPrimitive> = {
  id: ID,
  // v3: backend switched from catechism/ccc.json (English-only) to the bilingual
  // vatican.va scraper.
  version: '3',
  prefsDeps: ['lang'],
  fetch: async ({ params, prefs }): Promise<VersesPrimitive> => {
    const start = requirePositiveInt(ID, params, 'start')
    const count = requirePositiveInt(ID, params, 'count')
    const end = start + count - 1
    const paragraphs = await fetchParagraphs(start, count, narrowLang(prefs.lang))
    return {
      type: 'verses',
      header: { primary: i18n.t('office.cccLabel', { start, end }) },
      items: paragraphs.map((p) => ({ num: p.number, text: { primary: p.text } })),
      style: 'numbered',
    }
  },
}
