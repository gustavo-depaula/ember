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

type ChapterSlot = { key: string; chapterId: string; label?: string }

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

  // Build the list of all chapter slots to load
  const slots = useMemo((): ChapterSlot[] => {
    if (!resolved) return []
    const result: ChapterSlot[] = []

    if (resolved.feast) {
      result.push({ key: 'meditation-feast', chapterId: resolved.feast.chapterId })
      if (resolved.feast.secondary)
        result.push({ key: 'meditation-feast-2', chapterId: resolved.feast.secondary })
    }

    if (resolved.temporal) {
      result.push({ key: 'meditation-temporal', chapterId: resolved.temporal.chapterId })
      if (resolved.temporal.secondary)
        result.push({ key: 'meditation-temporal-2', chapterId: resolved.temporal.secondary })
    }

    return result
  }, [resolved])

  const slotKeys = slots.map((s) => s.chapterId).join(',')

  const { data: resolvedProse, isLoading } = useQuery({
    queryKey: ['liturgical-meditation', practiceId, slotKeys],
    queryFn: async () => {
      if (!libraryId || slots.length === 0) return undefined
      const bookId = practiceId
      const lang = 'pt-BR'

      const texts = await Promise.all(
        slots.map((slot) => loadBookChapterText(libraryId, bookId, slot.chapterId, lang)),
      )

      const prose: ResolvedProse = {}
      for (let i = 0; i < slots.length; i++) {
        if (texts[i]) prose[slots[i].key] = { 'pt-BR': texts[i]! }
      }
      return Object.keys(prose).length > 0 ? prose : undefined
    },
    enabled: slots.length > 0 && !!libraryId,
  })

  const templateVars = useMemo(() => {
    if (!map) return undefined
    const label = getLiturgicalDayName(date, 'ef', { t: (k, o) => i18n.t(k, o) as string })
    const vars: Record<string, string> = { liturgicalLabel: label }

    const bookEntry = libraryId ? getBookEntry(practiceId, libraryId) : undefined
    const toc = bookEntry?.toc

    // Build labels for each slot
    function chapterLabel(chapterId: string): string {
      if (toc) {
        const title = findTocTitle(toc, chapterId, 'pt-BR')
        if (title) return title
      }
      return label
    }

    // Primary meditation title (for the heading)
    const primaryChapterId = resolved?.feast?.chapterId ?? resolved?.temporal?.chapterId
    vars.meditationTitle = primaryChapterId ? chapterLabel(primaryChapterId) : label

    // Labels for each option tab
    if (resolved?.feast) {
      vars.feastLabel = chapterLabel(resolved.feast.chapterId)
      if (resolved.feast.secondary) vars.feast2Label = chapterLabel(resolved.feast.secondary)
    }
    if (resolved?.temporal) {
      vars.temporalLabel = chapterLabel(resolved.temporal.chapterId)
      if (resolved.temporal.secondary)
        vars.temporal2Label = chapterLabel(resolved.temporal.secondary)
    }

    return vars
  }, [date, map, resolved, libraryId, practiceId])

  return { templateVars, resolvedProse, isLoading }
}
