import { ScrollView } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import type { AlternativeGroup } from '@/content/registry'
import { lightTap } from '@/lib/haptics'

export function VariantSelector({
  group,
  activeVariant,
  onSelect,
}: {
  group: AlternativeGroup
  activeVariant: string
  onSelect: (qualifiedId: string) => void
}) {
  return (
    <YStack gap="$sm">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$sm" paddingVertical={2}>
          {group.members.map((member) => {
            const isActive = member.manifest.id === activeVariant
            return (
              <AnimatedPressable
                key={member.manifest.id}
                onPress={() => {
                  lightTap()
                  onSelect(member.manifest.id)
                }}
                disabled={isActive}
                accessibilityRole="radio"
                accessibilityLabel={member.label}
                accessibilityState={{ selected: isActive }}
              >
                <YStack
                  paddingHorizontal="$md"
                  paddingVertical="$sm"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor={isActive ? '$accent' : '$borderColor'}
                  backgroundColor={isActive ? '$accentSubtle' : '$backgroundSurface'}
                  gap={2}
                  minWidth={120}
                >
                  <Text
                    fontFamily="$heading"
                    fontSize="$2"
                    color={isActive ? '$accent' : '$color'}
                    numberOfLines={1}
                  >
                    {member.label}
                  </Text>
                  <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" numberOfLines={2}>
                    {member.description}
                  </Text>
                </YStack>
              </AnimatedPressable>
            )
          })}
        </XStack>
      </ScrollView>
    </YStack>
  )
}
