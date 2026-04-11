import type { ResolvedProse } from '@ember/content-engine'
import {
  getLiturgicalDayName,
  type LiturgicalMeditationMap,
  resolveLiturgicalMeditation,
} from '@ember/liturgical'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getBookEntry, getLibraryIdForPractice, loadBookChapterText } from '@/content/registry'
import type { TocNode } from '@/content/sources/filesystem'
import type { CycleData } from '@/content/types'
import i18n from '@/lib/i18n'

function findTocTitle(toc: TocNode[], id: string, lang: string): string | undefined {
  for (const node of toc) {
    if (node.id === id)
      return (node.title as Record<string, string>)[lang] ?? Object.values(node.title)[0]
    if (node.children) {
      const found = findTocTitle(node.children, id, lang)
      if (found) return found
    }
  }
}

export function useLiturgicalMeditation(
  practiceId: string,
  date: Date,
  cycleData?: Record<string, CycleData>,
) {
  const map = cycleData?.['liturgical-map'] as unknown as LiturgicalMeditationMap | undefined
  const libraryId = getLibraryIdForPractice(practiceId)

  const resolved = useMemo(() => {
    if (!map) return undefined
    return resolveLiturgicalMeditation(date, map)
  }, [date, map])

  const primaryChapterId = resolved?.feast?.chapterId ?? resolved?.temporal?.chapterId
  const temporalChapterId = resolved?.feast ? resolved?.temporal?.chapterId : undefined

  const { data: resolvedProse, isLoading } = useQuery({
    queryKey: ['liturgical-meditation', practiceId, primaryChapterId, temporalChapterId],
    queryFn: async () => {
      if (!libraryId || !primaryChapterId) return undefined
      const bookId = practiceId
      const lang = 'pt-BR'

      const [primaryText, temporalText] = await Promise.all([
        loadBookChapterText(libraryId, bookId, primaryChapterId, lang),
        temporalChapterId
          ? loadBookChapterText(libraryId, bookId, temporalChapterId, lang)
          : Promise.resolve(undefined),
      ])

      const prose: ResolvedProse = {}
      if (primaryText) prose['meditation-primary'] = { 'pt-BR': primaryText }
      if (temporalText) prose['meditation-temporal'] = { 'pt-BR': temporalText }
      return Object.keys(prose).length > 0 ? prose : undefined
    },
    enabled: !!primaryChapterId && !!libraryId,
  })

  const templateVars = useMemo(() => {
    if (!map) return undefined
    const label = getLiturgicalDayName(date, 'ef', { t: (k, o) => i18n.t(k, o) as string })
    const vars: Record<string, string> = { liturgicalLabel: label }

    let meditationTitle: string | undefined
    if (primaryChapterId && libraryId) {
      const bookEntry = getBookEntry(practiceId, libraryId)
      if (bookEntry?.toc) {
        meditationTitle = findTocTitle(bookEntry.toc, primaryChapterId, 'pt-BR')
      }
    }
    vars.meditationTitle = meditationTitle ?? label

    return vars
  }, [date, map, primaryChapterId, libraryId, practiceId])

  return { templateVars, resolvedProse, isLoading }
}
