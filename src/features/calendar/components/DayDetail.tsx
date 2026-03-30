import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { localizeContent } from '@/lib/i18n'
import type { DayCalendar } from '@/lib/liturgical'
import { RankBadge } from './RankBadge'

export function DayDetail({ day }: { day: DayCalendar | undefined }) {
  const { t } = useTranslation()

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
      {day.celebrations.map((c) => {
        const isPrincipal = c === day.principal
        return (
          <YStack
            key={c.entry.id}
            gap={4}
            padding="$sm"
            borderRadius={8}
            backgroundColor={isPrincipal ? '$backgroundHover' : undefined}
          >
            <Text fontFamily="$heading" fontSize="$3" color="$color">
              {localizeContent(c.entry.name)}
            </Text>
            <RankBadge rank={c.rank} />
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
              {localizeContent(c.entry.description)}
            </Text>
            {c.entry.holyDayOfObligation && (
              <Text fontFamily="$body" fontSize="$1" color="$accent">
                {t('calendar.holyDay')}
              </Text>
            )}
          </YStack>
        )
      })}
    </YStack>
  )
}
