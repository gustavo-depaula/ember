import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedCheckbox } from '@/components'
import { getPracticeIcon } from '@/db/seed'
import { lightTap } from '@/lib/haptics'

export type ChecklistItem = {
  id: string // slot composite ID: "rosary::default" or "divine-office::morning"
  practice_id: string
  slot_id: string
  name: string
  icon: string
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
  return (
    <YStack gap="$sm">
      {items.map((item) => {
        const done = completedIds.has(item.id)
        return (
          <Pressable
            key={item.id}
            onPress={onRowPress ? () => onRowPress(item.practice_id) : undefined}
          >
            <XStack
              backgroundColor="$backgroundSurface"
              borderRadius="$lg"
              padding="$md"
              alignItems="center"
              gap="$md"
            >
              <Text fontSize={20}>{getPracticeIcon(item.icon)}</Text>
              <Text flex={1} fontFamily="$body" fontSize="$3" color="$color">
                {item.name}
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
                    onToggle(item, !done)
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
