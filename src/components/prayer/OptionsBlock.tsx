// biome-ignore-all lint/suspicious/noArrayIndexKey: static option sections never reorder
import { useState } from 'react'
import { Text, XStack, YStack } from 'tamagui'
import type { RenderedSection } from '@/content/types'
import { AnimatedPressable } from '../AnimatedPressable'

export function OptionsBlock({
  label,
  options,
  renderSection,
}: {
  label: string
  options: { id: string; label: string; sections: RenderedSection[] }[]
  renderSection: (section: RenderedSection, index: number) => React.ReactNode
}) {
  const [selected, setSelected] = useState(0)
  const current = options[selected]

  return (
    <YStack gap="$sm">
      <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={0.5}>
        {label}
      </Text>

      <XStack gap="$xs" flexWrap="wrap">
        {options.map((opt, i) => (
          <AnimatedPressable key={opt.id} onPress={() => setSelected(i)}>
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

      {current && <YStack gap="$sm">{current.sections.map((s, i) => renderSection(s, i))}</YStack>}
    </YStack>
  )
}
