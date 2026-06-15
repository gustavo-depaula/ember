import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { ObligationBadges } from '@/components'
import { ProseBlock } from '@/components/prayer'
import type { DayCalendar, ResolvedCelebration } from '@/lib/liturgical'
import { useObligations } from '@/lib/liturgical'
import { useCelebrationDisplay } from '../useCelebrationDisplay'
import { RankBadge } from './RankBadge'

function CelebrationDetail({
  celebration,
  isPrincipal,
}: {
  celebration: ResolvedCelebration
  isPrincipal: boolean
}) {
  const { t } = useTranslation()
  // Name + "about this celebration" prose both from the Mass formulary — the same
  // canonical MR source the Mass renders (descriptions are mostly pt-BR).
  const { name, description } = useCelebrationDisplay(celebration)

  return (
    <YStack
      gap={4}
      padding="$sm"
      borderRadius={8}
      backgroundColor={isPrincipal ? '$backgroundHover' : undefined}
    >
      <Text fontFamily="$heading" fontSize="$3" color="$color">
        {name}
      </Text>
      <RankBadge rank={celebration.rank} />
      {description ? <ProseBlock text={{ primary: description }} /> : null}
      {celebration.entry.holyDayOfObligation && (
        <Text fontFamily="$body" fontSize="$1" color="$accent">
          {t('calendar.holyDay')}
        </Text>
      )}
    </YStack>
  )
}

export function DayDetail({ day }: { day: DayCalendar | undefined }) {
  const { t } = useTranslation()
  const obligations = useObligations(day?.date ?? new Date())

  if (!day) {
    return (
      <YStack padding="$md" alignItems="center">
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
          {t('calendar.noSelection')}
        </Text>
      </YStack>
    )
  }

  if (!day.celebrations.length) {
    return (
      <YStack padding="$md" alignItems="center">
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
          {t('calendar.noCelebrations')}
        </Text>
      </YStack>
    )
  }

  return (
    <YStack gap="$sm" padding="$md">
      {day.celebrations.map((c) => (
        <CelebrationDetail key={c.entry.id} celebration={c} isPrincipal={c === day.principal} />
      ))}

      {obligations && (
        <ObligationBadges fast={obligations.fast} abstinence={obligations.abstinence} />
      )}
    </YStack>
  )
}
