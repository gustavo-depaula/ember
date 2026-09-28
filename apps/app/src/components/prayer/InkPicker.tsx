import { XStack, YStack } from 'tamagui'
import type { PickerStyle } from '@/content/types'
import { AnimatedPressable } from '../AnimatedPressable'
import { Typography } from '../typography'

type InkOption = {
  id: string
  label: string
  excerpt?: string
  testID?: string
}

// Past this many characters a label can't share a line with its siblings
// (Segunda-feira da XXVI Semana do Tempo Comum), so the picker stacks. A length
// rule rather than a measured one: predictable, and it never reflows on mount.
const inlineLabelMax = 24

/**
 * The one option picker for the prayer page, set like a printed missal: plain
 * type, the chosen option reversed out of an ink stamp. Short options sit
 * inline; `cards` pickers, or any with a long label, stack as an index whose
 * rows carry an optional italic excerpt. Ink only — no gold on the reading page.
 */
export function InkPicker({
  options,
  selectedId,
  onSelect,
  pickerStyle = 'chips',
}: {
  options: InkOption[]
  selectedId: string | undefined
  onSelect: (id: string) => void
  pickerStyle?: PickerStyle
}) {
  const stacked =
    pickerStyle === 'cards' || options.some((option) => option.label.length > inlineLabelMax)

  const stamps = options.map((option) => {
    const selected = option.id === selectedId
    return (
      <AnimatedPressable
        key={option.id}
        onPress={() => onSelect(option.id)}
        accessibilityRole="tab"
        accessibilityLabel={option.label}
        accessibilityState={{ selected }}
        aria-selected={selected}
        hitSlop={stacked ? undefined : { top: 8, bottom: 8, left: 4, right: 4 }}
        testID={option.testID}
      >
        <YStack
          paddingHorizontal="$sm"
          paddingVertical={stacked ? 7 : 3}
          borderRadius={1}
          backgroundColor={selected ? '$color' : 'transparent'}
        >
          <Typography
            fontSize={17}
            lineHeight={22}
            color={selected ? '$background' : '$colorSecondary'}
          >
            {option.label}
          </Typography>
          {option.excerpt && (
            <Typography
              variant="caption"
              color={selected ? '$background' : '$colorSecondary'}
              opacity={selected ? 0.75 : 0.85}
              numberOfLines={2}
            >
              {option.excerpt}
            </Typography>
          )}
        </YStack>
      </AnimatedPressable>
    )
  })

  // The stamps' own padding would indent the type off the label's edge; pull
  // them back out so the words align and only the ink block overhangs.
  if (stacked) return <YStack marginHorizontal={-8}>{stamps}</YStack>
  return (
    <XStack flexWrap="wrap" gap={6} marginHorizontal={-8}>
      {stamps}
    </XStack>
  )
}
