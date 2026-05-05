// biome-ignore-all lint/suspicious/noArrayIndexKey: static option sections never reorder
import { useState } from 'react'
import { Text, XStack, YStack } from 'tamagui'
import type { PickerStyle, RenderedSection } from '@/content/types'
import { AnimatedPressable } from '../AnimatedPressable'
import { OptionCard } from './OptionCard'

type Option = {
  id: string
  label: string
  sections: RenderedSection[]
  excerpt?: string
}

export function OptionsBlock({
  label,
  options,
  renderSection,
  pickerStyle = 'chips',
}: {
  label: string
  options: Option[]
  renderSection: (section: RenderedSection, index: number) => React.ReactNode
  pickerStyle?: PickerStyle
}) {
  const [selected, setSelected] = useState(0)
  const current = options[selected]

  return (
    <YStack gap="$sm">
      <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={0.5}>
        {label}
      </Text>

      {pickerStyle === 'cards' ? (
        <YStack gap="$xs">
          {options.map((opt, i) => (
            <OptionCard
              key={opt.id}
              label={opt.label}
              excerpt={opt.excerpt}
              isSelected={i === selected}
              onPress={() => setSelected(i)}
            >
              {i === selected ? opt.sections.map((s, j) => renderSection(s, j)) : null}
            </OptionCard>
          ))}
        </YStack>
      ) : (
        <>
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
          {current && (
            <YStack gap="$sm">{current.sections.map((s, i) => renderSection(s, i))}</YStack>
          )}
        </>
      )}
    </YStack>
  )
}
