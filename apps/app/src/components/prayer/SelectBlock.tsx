// biome-ignore-all lint/suspicious/noArrayIndexKey: static option sections never reorder
import { Text, XStack, YStack } from 'tamagui'
import type { ResolvedSection } from '@/content/resolvedTypes'
import { AnimatedPressable } from '../AnimatedPressable'

export function SelectBlock({
  label,
  selectedId,
  options,
  onSelect,
  renderSection,
}: {
  label: string
  selectedId: string
  options: { id: string; label: string; sections: ResolvedSection[] }[]
  onSelect: (optionId: string) => void
  renderSection: (section: ResolvedSection, index: number) => React.ReactNode
}) {
  const current = options.find((option) => option.id === selectedId) ?? options[0]

  return (
    <YStack gap="$sm">
      <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={0.5}>
        {label}
      </Text>

      <XStack gap="$xs" flexWrap="wrap">
        {options.map((option) => {
          const isSelected = option.id === current?.id
          return (
            <AnimatedPressable
              key={option.id}
              onPress={() => onSelect(option.id)}
              accessibilityRole="tab"
              accessibilityLabel={option.label}
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
                  {option.label}
                </Text>
              </YStack>
            </AnimatedPressable>
          )
        })}
      </XStack>

      {current && <YStack gap="$sm">{current.sections.map((s, i) => renderSection(s, i))}</YStack>}
    </YStack>
  )
}
