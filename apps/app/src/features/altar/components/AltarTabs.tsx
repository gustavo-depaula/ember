import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { lightTap } from '@/lib/haptics'

/**
 * The Altar's tab switch — a typographic strip, not a filled segmented control:
 * tracked-caps labels with the active one in gold over a thin gold underline,
 * the rest muted. Tapping switches the body below.
 */
export function AltarTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: ReadonlyArray<{ key: T; label: string }>
  active: T
  onChange: (key: T) => void
}) {
  return (
    <XStack gap="$xl" justifyContent="center">
      {tabs.map((tab) => {
        const selected = tab.key === active
        return (
          <AnimatedPressable
            key={tab.key}
            onPress={() => {
              if (selected) return
              lightTap()
              onChange(tab.key)
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
          >
            <YStack alignItems="center" gap="$xs">
              <Typography
                variant="label"
                textTransform="uppercase"
                letterSpacing={1.5}
                color={selected ? '$accent' : undefined}
                tone={selected ? undefined : 'muted'}
              >
                {tab.label}
              </Typography>
              <YStack
                height={2}
                width="100%"
                borderRadius={1}
                backgroundColor={selected ? '$accent' : 'transparent'}
              />
            </YStack>
          </AnimatedPressable>
        )
      })}
    </XStack>
  )
}
