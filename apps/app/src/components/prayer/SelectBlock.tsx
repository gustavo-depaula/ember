// biome-ignore-all lint/suspicious/noArrayIndexKey: static option sections never reorder
import { type ReactNode, useEffect, useState } from 'react'
import { Text, XStack, YStack } from 'tamagui'
import { preprocessFlow } from '@/content/preprocessFlow'
import { usePreprocessContext } from '@/content/preprocessRuntime'
import type { ContainerOption, Primitive } from '@/content/primitives'
import { AnimatedPressable } from '../AnimatedPressable'
import { SelectBranch, selectBranchKey } from './SelectBranch'

export function SelectBlock({
  label,
  overrideKey,
  selectedId,
  options,
  practiceId,
  onSelect,
  renderSection,
}: {
  label: string
  overrideKey: string
  // The engine's auto/default pick — the branch preprocessed eagerly and the
  // initial active tab.
  selectedId: string
  options: ContainerOption[]
  practiceId: string
  onSelect: (optionId: string) => void
  renderSection: (section: Primitive, index: number) => ReactNode
}) {
  const ctx = usePreprocessContext()
  const [activeId, setActiveId] = useState(selectedId)
  const active = options.find((option) => option.id === activeId) ?? options[0]

  // Warm every non-default branch in the background right after mount so a tab
  // tap resolves from cache instantly. The default branch is already in hand.
  useEffect(() => {
    for (const option of options) {
      if (option.id === selectedId) continue
      if (!option.rawSections?.length) continue
      ctx.queryClient.prefetchQuery({
        queryKey: selectBranchKey(practiceId, overrideKey, option.id, ctx),
        queryFn: () => preprocessFlow(option.rawSections ?? [], ctx),
        staleTime: Number.POSITIVE_INFINITY,
      })
    }
  }, [ctx, options, practiceId, overrideKey, selectedId])

  const handleSelect = (optionId: string) => {
    setActiveId(optionId)
    // Inform the override store so completion advances the chosen branch's
    // reading cursor (the main flow query is intentionally not re-run).
    onSelect(optionId)
  }

  return (
    <YStack gap="$sm">
      <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={0.5}>
        {label}
      </Text>

      <XStack gap="$xs" flexWrap="wrap">
        {options.map((option) => {
          const isSelected = option.id === active?.id
          return (
            <AnimatedPressable
              key={option.id}
              onPress={() => handleSelect(option.id)}
              accessibilityRole="tab"
              accessibilityLabel={option.label.primary}
              accessibilityState={{ selected: isSelected }}
              testID={`select-option-${option.id}`}
            >
              <YStack
                paddingHorizontal="$sm"
                paddingVertical="$xs"
                borderRadius="$sm"
                borderWidth={1}
                borderColor={isSelected ? '$accent' : '$borderColor'}
                backgroundColor={isSelected ? '$accent' : 'transparent'}
              >
                <Text
                  fontFamily="$heading"
                  fontSize="$1"
                  color={isSelected ? '$background' : '$colorSecondary'}
                >
                  {option.label.primary}
                </Text>
              </YStack>
            </AnimatedPressable>
          )
        })}
      </XStack>

      {active && (
        <SelectBranch
          practiceId={practiceId}
          overrideKey={overrideKey}
          option={active}
          isDefault={active.id === selectedId}
          renderSection={renderSection}
        />
      )}
    </YStack>
  )
}
