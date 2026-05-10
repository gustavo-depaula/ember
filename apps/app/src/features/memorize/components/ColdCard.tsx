import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import type { MemorizeCardProps } from '../types'
import { CardButton } from './CardButton'
import { CardShell } from './CardShell'
import { TappableLineList } from './TappableLineList'

export function ColdCard({ title, portionLabel, lines, onOutcome }: MemorizeCardProps) {
  const { t } = useTranslation()
  const [revealed, setRevealed] = useState(false)

  return (
    <CardShell title={title} portionLabel={portionLabel}>
      {!revealed ? (
        <YStack gap="$lg" alignItems="center">
          <Text fontFamily="$body" fontSize="$2" color="$colorSubtle" textAlign="center">
            {t('memorize.coldHint')}
          </Text>
          <CardButton
            variant="primary"
            label={t('memorize.reveal')}
            accessibilityLabel={t('memorize.reveal')}
            accessibilityState={{ expanded: revealed }}
            onPress={() => setRevealed(true)}
          />
          <CardButton
            variant="secondary"
            label={t('memorize.couldntStart')}
            accessibilityLabel={t('memorize.couldntStart')}
            onPress={() => onOutcome({ mode: 'cold', kind: 'tap', tappedLine: 0 })}
          />
        </YStack>
      ) : (
        <TappableLineList
          lines={lines}
          tapLastLineLabel={t('memorize.tapLastLine')}
          couldntStartLabel={t('memorize.couldntStart')}
          onTap={(tappedLine) => onOutcome({ mode: 'cold', kind: 'tap', tappedLine })}
        />
      )}
    </CardShell>
  )
}
