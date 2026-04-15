import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedCheckbox, PracticeIcon } from '@/components'
import { tierConfig } from '@/config/constants'
import type { Tier } from '@/db/schema'
import { lightTap } from '@/lib/haptics'

export type ChecklistItem = {
  id: string // slot composite key: "rosary::1" or "divine-office::2"
  practice_id: string
  name: string
  icon: string
  subtitle?: string
  tier: Tier
}

export function PracticeChecklist({
  items,
  completedIds,
  onToggle,
  onRowPress,
  readOnly,
}: {
  items: ChecklistItem[]
  completedIds: Set<string>
  onToggle: (item: ChecklistItem, completed: boolean) => void
  onRowPress?: (practiceId: string) => void
  readOnly?: boolean
}) {
  const { t } = useTranslation()

  return (
    <YStack gap="$sm">
      {items.map((item) => {
        const done = completedIds.has(item.id)
        return (
          <Pressable
            key={item.id}
            onPress={onRowPress ? () => onRowPress(item.practice_id) : undefined}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.viewPractice', { name: item.name })}
          >
            <XStack
              backgroundColor="$backgroundSurface"
              borderRadius="$lg"
              padding="$md"
              alignItems="center"
              gap="$md"
              borderLeftWidth={3}
              borderLeftColor={tierConfig[item.tier].color}
            >
              <PracticeIcon name={item.icon} size={20} />
              <YStack flex={1} gap={1}>
                <Text fontFamily="$body" fontSize="$3" color="$color">
                  {item.name}
                </Text>
                {item.subtitle && (
                  <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                    {item.subtitle}
                  </Text>
                )}
              </YStack>
              {item.tier === 'essential' && (
                <Text fontFamily="$body" fontSize={28} color="#EF4444">
                  !!
                </Text>
              )}
              {item.tier === 'ideal' && (
                <Text fontFamily="$body" fontSize={28} color="$colorMutedBlue">
                  !
                </Text>
              )}
              {readOnly ? (
                <Text fontSize="$2" fontFamily="$body" color={done ? '$accent' : '$colorSecondary'}>
                  {done ? '✓' : '–'}
                </Text>
              ) : (
                <AnimatedCheckbox
                  checked={done}
                  onToggle={() => {
                    lightTap()
                    onToggle(item, !done)
                  }}
                  accessibilityLabel={
                    done
                      ? t('a11y.untogglePractice', { name: item.name })
                      : t('a11y.togglePractice', { name: item.name })
                  }
                />
              )}
            </XStack>
          </Pressable>
        )
      })}
    </YStack>
  )
}
