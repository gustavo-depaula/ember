import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import type { Cadence } from '@/db/events'
import { lightTap } from '@/lib/haptics'

const cadences: Cadence[] = ['perpetual', 'goal', 'bounded']

export function CadenceToggle({
  value,
  onChange,
}: {
  value: Cadence
  onChange: (cadence: Cadence) => void
}) {
  const { t } = useTranslation()

  return (
    <YStack gap="$xs">
      <Text fontFamily="$heading" fontSize="$1" color="$colorSecondary" letterSpacing={1}>
        {t('movements.cadence.label').toUpperCase()}
      </Text>
      <XStack gap="$xs" borderRadius="$md" padding={2} backgroundColor="$backgroundSurface">
        {cadences.map((c) => {
          const selected = c === value
          return (
            <AnimatedPressable
              key={c}
              onPress={() => {
                if (!selected) {
                  lightTap()
                  onChange(c)
                }
              }}
              style={{ flex: 1 }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={t(`movements.cadence.${c}`)}
            >
              <YStack
                alignItems="center"
                paddingVertical="$sm"
                borderRadius="$sm"
                backgroundColor={selected ? '$accent' : 'transparent'}
              >
                <Text
                  fontFamily="$heading"
                  fontSize="$2"
                  color={selected ? 'white' : '$color'}
                  letterSpacing={0.5}
                >
                  {t(`movements.cadence.${c}`)}
                </Text>
              </YStack>
            </AnimatedPressable>
          )
        })}
      </XStack>
      <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
        {t(`movements.cadence.hint.${value}`)}
      </Text>
    </YStack>
  )
}
