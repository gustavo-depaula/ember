// Assembles the SyncDocuments the reader can browse. MVP: today's liturgical
// prayers (Office, Mass, Gospel), each a single-chapter EPUB built lazily from
// the live practice pipeline. Library books and chosen practices come later.

import type { QueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { getManifest } from '@/content/resolver'
import { localizeContent } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'
import type { SyncDocument } from '../types'
import { practiceToPrimitives } from './pipeline'
import { buildEpubInput } from './renderDocument'

type DailyPractice = { practiceId: string; fallbackTitle: string }

const dailyPractices: DailyPractice[] = [
  { practiceId: 'liturgy-of-the-hours', fallbackTitle: 'Liturgy of the Hours' },
  { practiceId: 'mass', fallbackTitle: 'Holy Mass' },
  { practiceId: 'gospel-of-the-day', fallbackTitle: 'Gospel of the Day' },
]

function practiceTitle(practiceId: string, fallback: string): string {
  const manifest = getManifest(practiceId)
  const name = manifest?.name ? localizeContent(manifest.name) : undefined
  return name || fallback
}

export function collectDailyDocuments(opts: {
  queryClient: QueryClient
  date: Date
}): SyncDocument[] {
  const { queryClient, date } = opts
  const language = usePreferencesStore.getState().contentLanguage
  const dayKey = format(date, 'yyyy-MM-dd')
  const updated = date.toISOString()

  return dailyPractices
    .filter((d) => getManifest(d.practiceId) !== undefined)
    .map(({ practiceId, fallbackTitle }) => {
      const title = practiceTitle(practiceId, fallbackTitle)
      const id = `${practiceId}-${dayKey}`
      return {
        id,
        title: `${title} — ${format(date, 'EEEE, d MMMM')}`,
        summary: `${title} for ${dayKey}`,
        category: 'daily',
        updated,
        build: async () => {
          const primitives = await practiceToPrimitives({ practiceId, date, queryClient })
          return buildEpubInput({
            id,
            title,
            language,
            chapters: [{ id: practiceId, title, primitives }],
          })
        },
      }
    })
}
