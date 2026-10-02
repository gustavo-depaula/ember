import type { ReactNode } from 'react'
import { XStack, YStack } from 'tamagui'

import { Typography } from '@/components'

// A devocionário title page: a printer's rule broken by a red ✠, the name, the
// form, a caption (the day's date on the prayer, the program day on the plan),
// and a lower rule that runs into the page's actions. Ink and rubric red only.
export function PracticeHeader({
  name,
  caption,
  variant,
  actions,
}: {
  name: string
  caption?: string
  variant?: ReactNode
  actions?: ReactNode
}) {
  return (
    <YStack alignItems="center" paddingTop="$md">
      <XStack
        alignItems="center"
        gap="$md"
        alignSelf="stretch"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <YStack flex={1} height={0.5} backgroundColor="$borderColor" />
        <Typography fontSize="$2" color="$colorBurgundy">
          ✠
        </Typography>
        <YStack flex={1} height={0.5} backgroundColor="$borderColor" />
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
        <YStack
          flex={1}
          height={0.5}
          backgroundColor="$borderColor"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        {actions}
      </XStack>
    </YStack>
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
