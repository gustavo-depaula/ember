import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { toFirstLetter } from '../notation'
import type { MemorizeCardProps } from '../types'
import { CardButton } from './CardButton'
import { CardShell } from './CardShell'
import { TappableLineList } from './TappableLineList'

export function LettersCard({ title, portionLabel, lines, onOutcome }: MemorizeCardProps) {
  const { t } = useTranslation()
  const [revealed, setRevealed] = useState(false)
  const notation = useMemo(() => toFirstLetter(lines.join('\n')), [lines])

  return (
    <CardShell title={title} portionLabel={portionLabel}>
      {!revealed ? (
        <YStack gap="$lg">
          <YStack gap="$xs">
            <Text fontFamily="$body" fontSize="$2" color="$colorSubtle" textAlign="center">
              {t('memorize.lettersHint')}
            </Text>
            <YStack gap="$xs" paddingTop="$md">
              {notation.split('\n').map((line, index) => (
                <Text
                  // biome-ignore lint/suspicious/noArrayIndexKey: portion lines never reorder
                  key={index}
                  fontFamily="$body"
                  fontSize="$3"
                  color="$color"
                  letterSpacing={2}
                >
                  {line}
                </Text>
              ))}
            </YStack>
          </YStack>
          <YStack gap="$sm" alignItems="center">
            <CardButton
              variant="primary"
              label={t('memorize.revealText')}
              accessibilityLabel={t('memorize.revealText')}
              accessibilityState={{ expanded: revealed }}
              onPress={() => setRevealed(true)}
            />
            <CardButton
              variant="secondary"
              label={t('memorize.couldntStart')}
              accessibilityLabel={t('memorize.couldntStart')}
              onPress={() => onOutcome({ mode: 'letters', kind: 'tap', tappedLine: 0 })}
            />
          </YStack>
        </YStack>
      ) : (
        <TappableLineList
          lines={lines}
          tapLastLineLabel={t('memorize.tapLastLine')}
          couldntStartLabel={t('memorize.couldntStart')}
          onTap={(tappedLine) => onOutcome({ mode: 'letters', kind: 'tap', tappedLine })}
        />
      )}
    </CardShell>
  )
}
