import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedCheckbox } from '@/components'
import { getPracticeIcon } from '@/db/seed'
import { lightTap } from '@/lib/haptics'

export function PracticeChecklist({
  practices,
  completedIds,
  onToggle,
  onRowPress,
  readOnly,
}: {
  practices: Array<{ practice_id: string; name: string; icon: string }>
  completedIds: Set<string>
  onToggle: (practiceId: string, completed: boolean) => void
  onRowPress?: (practiceId: string) => void
  readOnly?: boolean
}) {
  return (
    <YStack gap="$sm">
      {practices.map((practice) => {
        const done = completedIds.has(practice.practice_id)
        return (
          <Pressable
            key={practice.practice_id}
            onPress={onRowPress ? () => onRowPress(practice.practice_id) : undefined}
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
              {readOnly ? (
                <Text fontSize={14} fontFamily="$body" color={done ? '$accent' : '$colorSecondary'}>
                  {done ? '✓' : '–'}
                </Text>
              ) : (
                <AnimatedCheckbox
                  checked={done}
                  onToggle={() => {
                    lightTap()
                    onToggle(practice.practice_id, !done)
                  }}
                />
              )}
            </XStack>
          </Pressable>
        )
      })}
    </YStack>
  )
}
