import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { tierConfig } from '@/config/constants'
import type { Tier } from '@/db/schema'
import { lightTap } from '@/lib/haptics'

const tierEntries = Object.entries(tierConfig) as [Tier, { color: string }][]

export function TierSelector({ value, onChange }: { value: Tier; onChange: (tier: Tier) => void }) {
  const { t } = useTranslation()
  return (
    <XStack gap="$sm">
      {tierEntries.map(([tier, config]) => (
        <AnimatedPressable
          key={tier}
          onPress={() => {
            lightTap()
            onChange(tier)
          }}
          style={{ flex: 1 }}
          accessibilityRole="radio"
          accessibilityLabel={t(`tier.${tier}`)}
          accessibilityState={{ selected: value === tier }}
        >
          <YStack
            paddingVertical="$sm"
            paddingHorizontal="$md"
            borderRadius="$md"
            borderWidth={1}
            borderColor={value === tier ? config.color : '$borderColor'}
            backgroundColor={value === tier ? config.color : 'transparent'}
            alignItems="center"
            opacity={value === tier ? 1 : 0.7}
          >
            <Text fontFamily="$body" fontSize="$3" color={value === tier ? 'white' : '$color'}>
              {t(`tier.${tier}`)}
            </Text>
          </YStack>
        </AnimatedPressable>
      ))}
    </XStack>
  )
}
