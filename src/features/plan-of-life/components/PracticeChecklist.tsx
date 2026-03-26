import { Check } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { getPracticeIcon } from '@/db/seed'

export function PracticeChecklist({
  practices,
  completedIds,
  onToggle,
  onRowPress,
}: {
  practices: Array<{ id: string; name: string; icon: string }>
  completedIds: Set<string>
  onToggle: (practiceId: string, completed: boolean) => void
  onRowPress?: (practiceId: string) => void
}) {
  const theme = useTheme()

  return (
    <YStack gap="$sm">
      {practices.map((practice) => {
        const done = completedIds.has(practice.id)
        return (
          <Pressable
            key={practice.id}
            onPress={onRowPress ? () => onRowPress(practice.id) : undefined}
          >
            <XStack
              backgroundColor="$backgroundSurface"
              borderRadius="$lg"
              padding="$md"
              alignItems="center"
              gap="$md"
            >
              <Text fontSize={20}>{getPracticeIcon(practice.icon)}</Text>
              <Text flex={1} fontFamily="$body" fontSize="$3" color="$color">
                {practice.name}
              </Text>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation()
                  onToggle(practice.id, !done)
                }}
                hitSlop={8}
              >
                <YStack
                  width={28}
                  height={28}
                  borderRadius={14}
                  borderWidth={2}
                  borderColor={done ? '$accent' : '$borderColor'}
                  backgroundColor={done ? '$accent' : 'transparent'}
                  alignItems="center"
                  justifyContent="center"
                >
                  {done && <Check size={16} color={theme.background.val} />}
                </YStack>
              </Pressable>
            </XStack>
          </Pressable>
        )
      })}
    </YStack>
  )
}
