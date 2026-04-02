import { Check } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedCheckbox, PracticeIcon } from '@/components'
import type { ChecklistItem } from '@/features/plan-of-life/components/PracticeChecklist'
import type { BlockState } from '@/features/plan-of-life/timeBlocks'
import { lightTap } from '@/lib/haptics'

export function TimeBlockSection({
  label,
  items,
  completedIds,
  state,
  completed,
  total,
  onToggle,
  onToggleCollapse,
  onPressItem,
}: {
  label: string
  items: ChecklistItem[]
  completedIds: Set<string>
  state: BlockState
  completed: number
  total: number
  onToggle: (item: ChecklistItem, completed: boolean) => void
  onToggleCollapse: () => void
  onPressItem?: (practiceId: string, slotId: string) => void
}) {
  const theme = useTheme()
  const allDone = completed === total

  if (state === 'collapsed') {
    return (
      <Pressable onPress={onToggleCollapse}>
        <XStack paddingVertical="$sm" paddingHorizontal="$xs" alignItems="center" gap="$sm">
          <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary">
            {label}
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {completed}/{total}
          </Text>
          {allDone && <Check size={14} color={theme.accent.val} />}
        </XStack>
      </Pressable>
    )
  }

  if (state === 'preview') {
    return (
      <Pressable onPress={onToggleCollapse}>
        <YStack paddingVertical="$sm" paddingHorizontal="$xs" gap="$xs">
          <XStack alignItems="center" gap="$sm">
            <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary">
              {label}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              {completed}/{total}
            </Text>
          </XStack>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" opacity={0.6}>
            {items.map((i) => i.name).join(' · ')}
          </Text>
        </YStack>
      </Pressable>
    )
  }

  return (
    <YStack gap="$sm">
      <Pressable onPress={onToggleCollapse}>
        <YStack gap="$xs" paddingHorizontal="$xs">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontFamily="$heading" fontSize="$3" color="$color" letterSpacing={1}>
              {label}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              {completed}/{total}
            </Text>
          </XStack>
        </YStack>
      </Pressable>
      {items.map((item) => {
        const done = completedIds.has(item.id)
        return (
          <Pressable key={item.id} onPress={() => onPressItem?.(item.practice_id, item.slot_id)}>
            <XStack
              backgroundColor="$backgroundSurface"
              borderRadius="$lg"
              padding="$md"
              alignItems="center"
              gap="$md"
              opacity={done ? 0.6 : 1}
              borderLeftWidth={3}
              borderLeftColor="$accent"
            >
              <PracticeIcon name={item.icon} size={20} />
              <Text flex={1} fontFamily="$body" fontSize="$3" color="$color">
                {item.name}
              </Text>
              <AnimatedCheckbox
                checked={done}
                onToggle={() => {
                  lightTap()
                  onToggle(item, !done)
                }}
              />
            </XStack>
          </Pressable>
        )
      })}
    </YStack>
  )
}
