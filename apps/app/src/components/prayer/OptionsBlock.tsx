// biome-ignore-all lint/suspicious/noArrayIndexKey: static option sections never reorder
import { useState } from 'react'
import { Text, XStack, YStack } from 'tamagui'
import type { PickerStyle } from '@/content/types'
import { AnimatedPressable } from '../AnimatedPressable'
import { OptionCard } from './OptionCard'
import { SectionHeading } from './SectionHeading'

type Option<T> = {
  id: string
  label: string
  sections: T[]
  excerpt?: string
}

export function OptionsBlock<T>({
  label,
  options,
  renderSection,
  pickerStyle = 'chips',
}: {
  label: string
  options: Option<T>[]
  renderSection: (section: T, index: number) => React.ReactNode
  pickerStyle?: PickerStyle
}) {
  const [selected, setSelected] = useState(0)
  const current = options[selected]

  return (
    <YStack gap="$sm">
      <SectionHeading>{label}</SectionHeading>

      {pickerStyle === 'cards' ? (
        <YStack gap="$xs">
          {options.map((opt, i) => (
            <OptionCard
              key={opt.id}
              label={opt.label}
              excerpt={opt.excerpt}
              isSelected={i === selected}
              onPress={() => setSelected(i)}
            />
          ))}
        </YStack>
      ) : (
        <XStack gap="$xs" flexWrap="wrap">
          {options.map((opt, i) => (
            <AnimatedPressable
              key={opt.id}
              onPress={() => setSelected(i)}
              accessibilityRole="tab"
              accessibilityLabel={opt.label}
              accessibilityState={{ selected: i === selected }}
            >
              <YStack
                paddingHorizontal="$sm"
                paddingVertical="$xs"
                borderRadius="$sm"
                borderWidth={1}
                borderColor={i === selected ? '$accent' : '$borderColor'}
                backgroundColor={i === selected ? '$accent' : 'transparent'}
              >
                <Text
                  fontFamily="$heading"
                  fontSize="$1"
                  color={i === selected ? '$background' : '$colorSecondary'}
                >
                  {opt.label}
                </Text>
              </YStack>
            </AnimatedPressable>
          ))}
        </XStack>
      )}
      {current && <YStack gap="$sm">{current.sections.map((s, i) => renderSection(s, i))}</YStack>}
    </YStack>
  )
}
