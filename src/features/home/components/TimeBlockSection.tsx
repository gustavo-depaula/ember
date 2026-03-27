import { Check } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedCheckbox } from '@/components'
import { getPracticeIcon } from '@/db/seed'
import type { BlockState } from '@/features/plan-of-life/timeBlocks'
import { lightTap } from '@/lib/haptics'

type Practice = { id: string; name: string; icon: string }

export function TimeBlockSection({
  label,
  practices,
  completedIds,
  state,
  completed,
  total,
  onToggle,
  onToggleCollapse,
}: {
  label: string
  practices: Practice[]
  completedIds: Set<string>
  state: BlockState
  completed: number
  total: number
  onToggle: (practiceId: string, completed: boolean) => void
  onToggleCollapse: () => void
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
            {practices.map((p) => p.name).join(' · ')}
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
      {practices.map((practice) => {
        const done = completedIds.has(practice.id)
        return (
          <XStack
            key={practice.id}
            backgroundColor="$backgroundSurface"
            borderRadius="$lg"
            padding="$md"
            alignItems="center"
            gap="$md"
            opacity={done ? 0.6 : 1}
          >
            <Text fontSize={20}>{getPracticeIcon(practice.icon)}</Text>
            <Text flex={1} fontFamily="$body" fontSize="$3" color="$color">
              {practice.name}
            </Text>
            <AnimatedCheckbox
              checked={done}
              onToggle={() => {
                lightTap()
                onToggle(practice.id, !done)
              }}
            />
          </XStack>
        )
      })}
    </YStack>
  )
}
