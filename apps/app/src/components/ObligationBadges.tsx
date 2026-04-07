import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import type { AbstinenceLevel } from '@/lib/liturgical'

export function ObligationBadges({
  fast,
  abstinence,
}: {
  fast: boolean
  abstinence: AbstinenceLevel
}) {
  const { t } = useTranslation()
  const badges: { label: string; note: string }[] = []

  if (fast) {
    badges.push({ label: t('obligations.fast'), note: t('obligations.fastNote') })
  }

  if (abstinence === 'full') {
    badges.push({ label: t('obligations.abstinence'), note: t('obligations.abstinenceNote') })
  } else if (abstinence === 'partial') {
    badges.push({
      label: t('obligations.partialAbstinence'),
      note: t('obligations.partialAbstinenceNote'),
    })
  } else if (abstinence === 'penance-required') {
    badges.push({ label: t('obligations.penance'), note: t('obligations.penanceNote') })
  }

  if (badges.length === 0) return null

  return (
    <YStack gap="$xs" paddingTop="$xs">
      {badges.map((b) => (
        <XStack key={b.label} gap="$sm" alignItems="center">
          <Text fontFamily="$body" fontSize="$1" color="$accent" letterSpacing={0.5}>
            {b.label}
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {b.note}
          </Text>
        </XStack>
      ))}
    </YStack>
  )
}
