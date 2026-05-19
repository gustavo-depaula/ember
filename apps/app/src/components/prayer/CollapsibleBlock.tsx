import { ChevronDown, ChevronRight } from 'lucide-react-native'
import { useState } from 'react'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import type { BilingualText } from '@/content/types'
import type { ResolvedSection } from '@/content/resolvedTypes'
import { AnimatedPressable } from '../AnimatedPressable'

/**
 * Collapsed-by-default group that reveals its body on tap. Used for
 * silent priest prayers (Preparação das Oferendas) and lengthy
 * explanatory rubrics — the title gives orientation, the body stays
 * out of the audible flow until the user wants the detail.
 */
export function CollapsibleBlock({
  title,
  defaultOpen,
  sections,
  renderSection,
}: {
  title: BilingualText
  defaultOpen: boolean
  sections: ResolvedSection[]
  renderSection: (section: ResolvedSection, index: number) => React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const theme = useTheme()
  const iconColor = theme.colorSecondary?.val ?? '#666'

  return (
    <YStack gap="$xs">
      <AnimatedPressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={title.primary}
        accessibilityState={{ expanded: open }}
      >
        <XStack alignItems="center" gap="$xs">
          {open ? (
            <ChevronDown size={14} color={iconColor} />
          ) : (
            <ChevronRight size={14} color={iconColor} />
          )}
          <Text
            fontFamily="$heading"
            fontSize="$1"
            color="$colorSecondary"
            letterSpacing={1}
            textTransform="uppercase"
          >
            {title.primary}
          </Text>
        </XStack>
      </AnimatedPressable>
      {open && (
        <YStack gap="$sm" paddingLeft="$md">
          {sections.map((s, i) => renderSection(s, i))}
        </YStack>
      )}
    </YStack>
  )
}
