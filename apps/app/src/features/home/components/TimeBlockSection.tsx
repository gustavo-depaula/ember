import { AlertTriangle, Check } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
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
  restartNeededIds,
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
  restartNeededIds?: Set<string>
  state: BlockState
  completed: number
  total: number
  onToggle: (item: ChecklistItem, completed: boolean) => void
  onToggleCollapse: () => void
  onPressItem?: (practiceId: string, slotId: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const allDone = completed === total
  const completionLabel = t('a11y.completedOf', { completed, total })

  if (state === 'collapsed') {
    return (
      <Pressable
        onPress={onToggleCollapse}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${completionLabel}`}
        accessibilityHint={t('a11y.expandBlock', { name: label })}
        accessibilityState={{ expanded: false }}
      >
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
      <Pressable
        onPress={onToggleCollapse}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${completionLabel}`}
        accessibilityHint={t('a11y.expandBlock', { name: label })}
        accessibilityState={{ expanded: false }}
      >
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
      <Pressable
        onPress={onToggleCollapse}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${completionLabel}`}
        accessibilityHint={t('a11y.collapseBlock', { name: label })}
        accessibilityState={{ expanded: true }}
      >
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
        const needsRestart = restartNeededIds?.has(item.practice_id) ?? false
        return (
          <Pressable
            key={item.id}
            onPress={() => onPressItem?.(item.practice_id, item.slot_id)}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.viewPractice', { name: item.name })}
          >
            <XStack
              backgroundColor="$backgroundSurface"
              borderRadius="$lg"
              padding="$md"
              alignItems="center"
              gap="$md"
              opacity={done ? 0.6 : 1}
              borderLeftWidth={3}
              borderLeftColor={needsRestart ? '$colorSecondary' : '$accent'}
            >
              <PracticeIcon name={item.icon} size={20} />
              <YStack flex={1}>
                <Text fontFamily="$body" fontSize="$3" color="$color">
                  {item.name}
                </Text>
                {needsRestart && (
                  <XStack alignItems="center" gap={4}>
                    <AlertTriangle size={12} color={theme.accent?.val} />
                    <Text fontFamily="$body" fontSize="$1" color="$accent">
                      {t('program.restartNeeded')}
                    </Text>
                  </XStack>
                )}
              </YStack>
              {needsRestart ? (
                <AlertTriangle size={18} color={theme.accent?.val} />
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
