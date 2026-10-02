import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { bareId, getEntry } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { useEventStore } from '@/db/events'
import { coverFor } from '@/features/covers'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
import { artFor } from '@/features/explore/artMap'
import { jewelTones, toneForKey } from '@/features/explore/bgColor'
import { CardRow } from '@/features/explore/CardRow'
import { localizeContent } from '@/lib/i18n'
import { useObligations } from '@/lib/liturgical'
import { useMostPrayed } from '../useMostPrayed'
import type { TodayPlan } from '../useTodayPlan'
import { PlanOfLifeCard, planCardSize } from './PlanOfLifeCard'
import { openTodayPlan } from './TodayPlanSheet'

/**
 * The row under Today's featured carousel: the day's plan of life, then the
 * Rosary, the Bible and Mass — Mass ahead of the other two on a Sunday or a
 * holy day of obligation — and the five practices prayed most in the last 15
 * days that today's plan doesn't already hold.
 */
export function TodayRow({ plan }: { plan: TodayPlan }) {
  const { t } = useTranslation()
  const router = useRouter()
  const practices = useEventStore((s) => s.practices)
  // The Rosary and the Mass the plan prays, when it has settled on a variant.
  // The plan keys a practice by its bare or its canonical id.
  const variantOf = (id: string) =>
    bareId((practices.get(id) ?? practices.get(`practice/${id}`))?.active_variant ?? id)
  const rosaryId = variantOf('rosary')
  const massId = variantOf('mass')
  const rosary = getEntry(`practice/${rosaryId}`)
  const mass = getEntry(`practice/${massId}`)
  const holyDay = useObligations(plan.now)?.holyDay === true
  const massFirst = holyDay || plan.now.getDay() === 0
  // The plan card already opens what is due today, so the ranking is for the rest.
  const dueToday = plan.todaySlots.flatMap((s) => [
    bareId(s.practice_id),
    bareId(practices.get(s.practice_id)?.active_variant ?? s.practice_id),
  ])
  const mostPrayed = useMostPrayed({
    days: 15,
    limit: 5,
    exclude: ['rosary', rosaryId, 'mass', massId, ...dueToday],
  })
  const massTile = mass && <PracticeTile id={massId} entry={mass} />

  return (
    <CardRow>
      <PlanOfLifeCard plan={plan} onPress={openTodayPlan} />
      {massFirst && massTile}
      {rosary && <PracticeTile id={rosaryId} entry={rosary} />}
      <ArtCoverCard
        title={t('home.bible')}
        cover={{ kind: 'practice', icon: 'book' }}
        tone={jewelTones.marian}
        size={planCardSize}
        onPress={() => router.push('/bible')}
      />
      {!massFirst && massTile}
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
