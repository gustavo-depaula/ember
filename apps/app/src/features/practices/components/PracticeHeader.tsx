import { ChevronLeft } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { Typography } from '@/components'

// A devocionário title page: a printer's rule broken by a red ✠, the name, the
// form, a caption (the day's date on the prayer, the program day on the plan),
// and a lower rule that runs into the page's actions. Ink and rubric red only.
// The way back opens the upper rule.
export function PracticeHeader({
  name,
  caption,
  variant,
  actions,
  onBack,
}: {
  name: string
  caption?: string
  variant?: ReactNode
  actions?: ReactNode
  onBack?: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  return (
    <YStack alignItems="center" paddingTop="$md">
      <XStack alignItems="center" gap="$md" alignSelf="stretch">
        {/* Two equal halves, so the ✠ stays over the title with or without the
            chevron. */}
        <XStack flex={1} alignItems="center" gap="$md">
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.goBack')}
              // The chevron's ink sits deeper in its box than the other glyphs':
              // pulled out so it hangs on the same margin as the rule below.
              style={{ marginLeft: -5 }}
            >
              <ChevronLeft size={24} strokeWidth={1.5} color={theme.color.val} />
            </Pressable>
          ) : null}
          <Rule />
        </XStack>
        <Typography
          fontSize="$2"
          color="$colorBurgundy"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          ✠
        </Typography>
        <Rule />
      </XStack>
      <Typography
        variant="sacred-title"
        fontSize={46}
        lineHeight={58}
        paddingTop="$xl"
        paddingBottom="$xs"
      >
        {balanceTitle(name)}
      </Typography>
      {variant}
      {caption ? (
        <Typography
          variant="caption"
          fontSize={18}
          lineHeight={24}
          paddingTop="$xs"
          // Full width, not shrink-wrapped: Android measures a centred italic
          // line a hair too narrow and drops its last word.
          alignSelf="stretch"
          textAlign="center"
        >
          {caption}
        </Typography>
      ) : null}
      <XStack alignSelf="stretch" alignItems="center" gap="$md" paddingTop="$lg">
        <Rule />
        {actions}
      </XStack>
    </YStack>
  )
}

function Rule() {
  return (
    <YStack
      flex={1}
      height={0.5}
      backgroundColor="$borderColor"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  )
}

// Set like a title page: a long name breaks into two even lines ("Stations of /
// the Cross") at the space nearest its middle, instead of running rule to rule
// and leaving a lone word below. RN has no `text-wrap: balance`.
function balanceTitle(name: string) {
  if (name.length < 15) return name
  const middle = name.length / 2
  let split = -1
  for (let i = name.indexOf(' '); i !== -1; i = name.indexOf(' ', i + 1)) {
    if (split === -1 || Math.abs(i - middle) < Math.abs(split - middle)) split = i
  }
  if (split === -1) return name
  return `${name.slice(0, split)}\n${name.slice(split + 1)}`
}
