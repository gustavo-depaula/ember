import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import { PrayerText } from '@/components/PrayerText'

import { partitionLinesForCued } from '../cardLogic'
import type { MemorizeCardProps } from '../types'
import { CardButton } from './CardButton'
import { CardShell } from './CardShell'

export function CuedCard({ title, portionLabel, lines, mastery, onOutcome }: MemorizeCardProps) {
  const { t } = useTranslation()
  const [revealed, setRevealed] = useState(false)
  const { visible, targetLine } = useMemo(
    () => partitionLinesForCued(lines, mastery),
    [lines, mastery],
  )

  return (
    <CardShell title={title} portionLabel={portionLabel}>
      <YStack gap="$xs">
        {visible.map((line, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: portion lines never reorder
          <PrayerText key={index}>{line}</PrayerText>
        ))}
        {targetLine && revealed ? <PrayerText fontWeight="500">{targetLine}</PrayerText> : null}
      </YStack>

      {targetLine && !revealed ? (
        <YStack gap="$sm" alignItems="center">
          <Text fontFamily="$body" fontSize="$2" color="$colorSubtle" textAlign="center">
            {t('memorize.cuedHint')}
          </Text>
          <CardButton
            variant="primary"
            label={t('memorize.revealLine')}
            accessibilityLabel={t('memorize.revealLine')}
            accessibilityState={{ expanded: revealed }}
            onPress={() => setRevealed(true)}
          />
        </YStack>
      ) : (
        <XStack gap="$md" justifyContent="center">
          <CardButton
            variant="secondary"
            label={t('memorize.missedIt')}
            accessibilityLabel={t('memorize.missedIt')}
            onPress={() => onOutcome({ mode: 'cued', kind: 'cued', result: 'missed-it' })}
          />
          <CardButton
            variant="primary"
            label={t('memorize.gotIt')}
            accessibilityLabel={t('memorize.gotIt')}
            onPress={() => onOutcome({ mode: 'cued', kind: 'cued', result: 'got-it' })}
          />
        </XStack>
      )}
    </CardShell>
  )
}
