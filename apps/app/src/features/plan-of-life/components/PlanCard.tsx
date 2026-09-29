import type { ReactNode } from 'react'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { lightTap } from '@/lib/haptics'

// A doorway card — a quiet illuminated surface with the gold mark to the left of
// a tracked-caps title and a muted subtitle, not a bordered box.
export function PlanCard({
  icon,
  label,
  subtitle,
  onPress,
}: {
  icon: ReactNode
  label: string
  subtitle?: string
  onPress: () => void
}) {
  return (
    <YStack flex={1}>
      <AnimatedPressable
        onPress={() => {
          lightTap()
          onPress()
        }}
        style={{ flex: 1 }}
        accessibilityRole="link"
        accessibilityLabel={label}
      >
        <XStack
          flex={1}
          alignItems="center"
          gap="$md"
          paddingVertical="$lg"
          paddingHorizontal="$md"
          minHeight={100}
          borderRadius="$lg"
          backgroundColor="$backgroundSurface"
        >
          {icon}
          <YStack flex={1} gap="$xs">
            <Typography variant="label" numberOfLines={2}>
              {label}
            </Typography>
            {subtitle ? (
              <Typography variant="caption" tone="muted" numberOfLines={2}>
                {subtitle}
              </Typography>
            ) : undefined}
          </YStack>
        </XStack>
      </AnimatedPressable>
    </YStack>
  )
}
