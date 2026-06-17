import { type LiturgicalDayMap, resolveLiturgicalDay } from '@ember/liturgical'
import { useQuery } from '@tanstack/react-query'
import { Platform } from 'react-native'

import type { TocNode } from '@/content/manifestTypes'
import type { Primitive } from '@/content/primitives'
import { getBookEntry, loadPracticeData } from '@/content/resolver'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { useToday } from '@/hooks/useToday'
import i18n, { localizeContent } from '@/lib/i18n'
import { hourSections, ibLangFor } from '@/sources/ibreviary/config'
import { extractSecondReading } from '@/sources/ibreviary/office-of-readings-reading'
import { parseHourPage } from '@/sources/ibreviary/parse'
import { fetchSectionHtml } from '@/sources/ibreviary/session'
import { fetchMeditationSummary } from '@/sources/opus-dei/meditation'
import { dateSlug } from '@/sources/opus-dei/url'

// Daily-meditation cards whose text is a book chapter indexed by liturgical day:
// practice id → the book the practice's own liturgical-map points at.
const meditationBooks: Record<string, string> = {
  'practice/meditacoes-ligorio': 'liguori-meditacoes',
  'practice/intimita-divina': 'gabriel-stmm-intimita-divina',
}

/** Depth-first search for the TOC node with this chapter id. */
export function findTocNode(nodes: TocNode[] | undefined, id: string): TocNode | undefined {
  for (const node of nodes ?? []) {
    if (node.id === id) return node
    const found = findTocNode(node.children, id)
    if (found) return found
  }
  return undefined
}

/** First text line a primitive carries (rubric/text/heading/prose all expose
 *  `{ text: { primary } }`). */
function primitiveFirstLine(p: Primitive | undefined): string | undefined {
  const primary = (p as { text?: { primary?: unknown } } | undefined)?.text?.primary
  if (typeof primary !== 'string') return undefined
  return primary.split('\n')[0].trim() || undefined
}

// Today's title for a book-backed meditation: resolve the practice's own
// liturgical-map to today's chapter, then read that chapter's TOC title. The
// TOC carries a clean per-chapter title in every published language (Liguori's
// chapter bodies open on a scripture epigraph, not a heading, so parsing the
// markdown would miss them). `localizeContent` picks the app language and falls
// back to the book's own (Liguori is pt-BR-only). Pure resident-manifest reads,
// so it works on web too.
async function bookMeditationTitle(
  practiceId: string,
  bookId: string,
  date: Date,
): Promise<string | undefined> {
  const map = (await loadPracticeData(practiceId))?.['liturgical-map'] as
    | LiturgicalDayMap
    | undefined
  if (!map) return undefined
  const [entry] = resolveLiturgicalDay(date, map)
  if (!entry) return undefined
  const node = findTocNode(getBookEntry(bookId)?.toc, entry.id)
  return node ? localizeContent(node.title) || undefined : undefined
}

// Today's Office of Readings second-reading source line ("From a treatise of
// St Cyprian…"). Native only — iBreviary sends no CORS headers, so the web
// card keeps its fixed tagline.
async function patristicSourceLine(appLang: string, date: Date): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined
  const ibLang = ibLangFor(appLang)
  const html = await fetchSectionHtml(ibLang, date, hourSections['office-of-readings'])
  const reading = extractSecondReading(parseHourPage(html, 'office-of-readings', ibLang), appLang)
  return primitiveFirstLine(reading[0])
}

/** Today's title/theme for a Daily Meditations card, or undefined to fall back
 *  to the card's fixed tagline. Throws on fetch/parse failure so React Query
 *  records it (and the card still falls back) rather than swallowing silently. */
export async function resolveMeditationSubtitle(
  id: string,
  appLang: string,
  date: Date,
): Promise<string | undefined> {
  if (id === 'practice/opus-dei-meditation') {
    const summary = await fetchMeditationSummary(appLang, date)
    return summary?.title ?? summary?.lead
  }
  if (id === 'practice/patristic-reading') return patristicSourceLine(appLang, date)
  const bookId = meditationBooks[id]
  return bookId ? bookMeditationTitle(id, bookId, date) : undefined
}

/** Lazily resolve a Daily Meditations card's subtitle to today's title/theme.
 *  Returns undefined until loaded (or on web/error) so callers show the fixed
 *  tagline meanwhile. Cached per day + language. Keyed on `useCatalogVersion`
 *  so it re-runs once the (deferred-warmed) book manifest becomes resident —
 *  otherwise the first run loses the race to warming and the card is stuck on
 *  its fixed tagline. Resolves to `null` (never `undefined`) so React Query
 *  doesn't reject the "no subtitle" result. */
export function useMeditationSubtitle(id: string): string | undefined {
  const today = useToday()
  const lang = i18n.language
  const catalogVersion = useCatalogVersion()
  const { data } = useQuery({
    queryKey: ['meditation-subtitle', id, lang, dateSlug(today), catalogVersion],
    queryFn: async () => (await resolveMeditationSubtitle(id, lang, today)) ?? null,
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 12 * 60 * 60 * 1000,
    retry: 1,
  })
  return data ?? undefined
}
