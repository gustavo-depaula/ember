import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { getEntry } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { useEventStore } from '@/db/events'
import { coverFor } from '@/features/covers'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
import { artFor } from '@/features/explore/artMap'
import { jewelTones, toneForKey } from '@/features/explore/bgColor'
import { CardRow } from '@/features/explore/CardRow'
import { localizeContent } from '@/lib/i18n'
import { useMostPrayed } from '../useMostPrayed'
import type { TodayPlan } from '../useTodayPlan'
import { PlanOfLifeCard, planCardSize } from './PlanOfLifeCard'
import { openTodayPlan } from './TodayPlanSheet'

/**
 * The row under Today's featured carousel: the day's plan of life, then the
 * Rosary, the Bible and the five practices prayed most in the last 15 days.
 */
export function TodayRow({ plan }: { plan: TodayPlan }) {
  const { t } = useTranslation()
  const router = useRouter()
  // The Rosary the plan prays, when it has settled on a variant.
  const rosaryId = useEventStore((s) => s.practices.get('rosary')?.active_variant ?? 'rosary')
  const rosary = getEntry(`practice/${rosaryId}`)
  const mostPrayed = useMostPrayed({ days: 15, limit: 5, exclude: ['rosary', rosaryId] })

  return (
    <CardRow>
      <PlanOfLifeCard plan={plan} onPress={openTodayPlan} />
      {rosary && <PracticeTile id={rosaryId} entry={rosary} />}
      <ArtCoverCard
        title={t('home.bible')}
        cover={{ kind: 'practice', icon: 'book' }}
        tone={jewelTones.marian}
        size={planCardSize}
        onPress={() => router.push('/bible')}
      />
      {mostPrayed.map(({ id, entry }) => (
        <PracticeTile key={id} id={id} entry={entry} />
      ))}
    </CardRow>
  )
}

/** A practice in the row: its cover, and a tap prays it. */
function PracticeTile({ id, entry }: { id: string; entry: CatalogEntry }) {
  const router = useRouter()
  return (
    <ArtCoverCard
      title={localizeContent(entry.name ?? {})}
      image={artFor(`practice/${id}`)}
      cover={coverFor(entry)}
      tone={toneForKey(`practice/${id}`)}
      size={planCardSize}
      onPress={() => router.push({ pathname: '/pray/[practiceId]', params: { practiceId: id } })}
    />
  )
}
