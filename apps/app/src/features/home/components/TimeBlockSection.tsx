import { AlertTriangle, Check, ChevronRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'

import { AnimatedCheckbox, PracticeIcon } from '@/components'
import { tierConfig } from '@/config/constants'
import type { ChecklistItem } from '@/features/plan-of-life/components/PracticeChecklist'
import type { BlockState } from '@/features/plan-of-life/timeBlocks'
import { lightTap } from '@/lib/haptics'

const tierDotCount: Record<ChecklistItem['tier'], number> = {
  essential: 2,
  ideal: 1,
  extra: 0,
}

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
  onPressItem?: (practiceId: string) => void
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
          <Text
            fontFamily="$heading"
            fontSize="$2"
            color="$colorSecondary"
            letterSpacing={3}
            textTransform="uppercase"
          >
            {label}
          </Text>
          <Text fontFamily="$script" fontSize="$1" color="$colorSecondary">
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
            <Text
              fontFamily="$heading"
              fontSize="$2"
              color="$colorSecondary"
              letterSpacing={3}
              textTransform="uppercase"
            >
              {label}
            </Text>
            <Text fontFamily="$script" fontSize="$1" color="$colorSecondary">
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
        <YStack
          paddingHorizontal="$xs"
          paddingBottom="$xs"
          borderBottomWidth={0.5}
          borderBottomColor="$accentSubtle"
        >
          <XStack justifyContent="space-between" alignItems="baseline">
            <Text
              fontFamily="$heading"
              fontSize="$2"
              color="$colorSecondary"
              letterSpacing={3}
              textTransform="uppercase"
            >
              {label}
            </Text>
            <Text fontFamily="$script" fontSize="$1" color="$colorSecondary">
              {completed}/{total}
            </Text>
          </XStack>
        </YStack>
      </Pressable>
      {items.map((item) => {
        const done = completedIds.has(item.id)
        const needsRestart = restartNeededIds?.has(item.practice_id) ?? false
        const dots = tierDotCount[item.tier]
        return (
          <Pressable
            key={item.id}
            onPress={() => onPressItem?.(item.practice_id)}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.viewPractice', { name: item.name })}
            testID={`slot-row-${item.practice_id}`}
          >
            <XStack paddingVertical="$md" paddingHorizontal="$xs" alignItems="center" gap="$md">
              {needsRestart ? (
                <AlertTriangle size={22} color={theme.accent?.val} />
              ) : (
                <View width={24} height={24} alignItems="center" justifyContent="center">
                  <AnimatedCheckbox
                    checked={done}
                    size={24}
                    subtle
                    onToggle={() => {
                      lightTap()
                      onToggle(item, !done)
                    }}
                    accessibilityLabel={
                      done
                        ? t('a11y.untogglePractice', { name: item.name })
                        : t('a11y.togglePractice', { name: item.name })
                    }
                    testID={`slot-toggle-${item.practice_id}`}
                  />
                </View>
              )}
              <PracticeIcon name={item.icon} size={20} />
              <YStack flex={1}>
                <Text fontFamily="$body" fontSize="$4" color={done ? '$colorSecondary' : '$color'}>
                  {item.name}
                </Text>
                {needsRestart && (
                  <XStack alignItems="center" gap={4}>
                    <AlertTriangle size={12} color={theme.accent?.val} />
                    <Text
                      fontFamily="$heading"
                      fontSize="$1"
                      color="$accent"
                      letterSpacing={1.5}
                      textTransform="uppercase"
                    >
                      {t('program.restartNeeded')}
                    </Text>
                  </XStack>
                )}
              </YStack>
              {dots > 0 && !done && (
                <XStack alignItems="center" gap={4}>
                  {dots === 2 && (
                    <View
                      width={6}
                      height={6}
                      borderRadius={3}
                      backgroundColor={tierConfig[item.tier].color}
                    />
                  )}
                  <View
                    width={6}
                    height={6}
                    borderRadius={3}
                    backgroundColor={tierConfig[item.tier].color}
                  />
                </XStack>
              )}
              <ChevronRight size={16} color={theme.accentSubtle?.val} />
            </XStack>
          </Pressable>
        )
      })}
    </YStack>
  )
}
