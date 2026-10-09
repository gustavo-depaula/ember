import { parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { formatLocalized } from '@/lib/i18n/dateLocale'

import type { DayState } from '../program'

// The parts a program's page is set from, shared by the page of a program
// begun and of one that stands.

export function roman(n: number): string {
  const numerals = [
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ] as const
  let out = ''
  let rest = n
  for (const [value, glyph] of numerals) {
    while (rest >= value) {
      out += glyph
      rest -= value
    }
  }
  return out
}

// The day's date where the Rezar bar will be: what the day waits for, not a
// control.
export function DatePill({ label }: { label: string }) {
  return (
    <YStack alignSelf="stretch" paddingHorizontal={30} paddingTop={24}>
      <YStack
        height={50}
        borderRadius={25}
        borderWidth={1}
        borderColor="$accentSubtle"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="label" letterSpacing={1.5} color="$accent">
          {label}
        </Typography>
      </YStack>
    </YStack>
  )
}

export function Fleuron() {
  return (
    <XStack
      alignItems="center"
      gap="$md"
      paddingTop="$xl"
      paddingBottom="$md"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <YStack flex={1} height={0.5} backgroundColor="$accentSubtle" />
      <Typography color="$accent" fontSize="$3">
        ❦
      </Typography>
      <YStack flex={1} height={0.5} backgroundColor="$accentSubtle" />
    </XStack>
  )
}

// A line of the contents: numeral, the day's name, a dotted leader, and the
// date it falls on — or the star once it's prayed.
export function DayLine({
  numeral,
  name,
  state,
  date,
  trailing,
  a11yState,
  onPress,
}: {
  numeral: string
  name: string
  state: DayState
  date?: string
  /** Stands in for the date: a round's several days on one line. */
  trailing?: string
  a11yState: string
  onPress?: () => void
}) {
  const { t } = useTranslation()
  const faded = state.isCompleted || state.isMissed
  const missedLabel = t('program.missed').toLowerCase()
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${numeral}, ${name}, ${a11yState}`}
      accessibilityState={{ disabled: !onPress }}
      aria-disabled={!onPress}
    >
      <XStack alignItems="baseline" gap="$sm" minHeight={36} paddingVertical={4}>
        <Typography
          variant="sacred-title"
          textAlign="left"
          fontSize="$2"
          minWidth={40}
          tone="muted"
        >
          {numeral}
        </Typography>
        <Typography
          fontSize="$3"
          numberOfLines={1}
          flexShrink={1}
          tone={faded ? 'muted' : 'default'}
        >
          {name}
        </Typography>
        <YStack flex={1} overflow="hidden" minWidth={12}>
          <Typography
            fontSize="$1"
            tone="muted"
            numberOfLines={1}
            ellipsizeMode="clip"
            opacity={0.6}
          >
            {' ·'.repeat(80)}
          </Typography>
        </YStack>
        {state.isCompleted ? (
          <Typography color="$accent" fontSize="$2">
            ✦
          </Typography>
        ) : state.isMissed ? (
          <Typography fontSize="$1" tone="muted" fontStyle="italic">
            {missedLabel}
          </Typography>
        ) : (
          <Typography fontSize="$1" tone="muted">
            {trailing ?? (date ? formatLocalized(parseISO(date), 'd MMM').replace('.', '') : '')}
          </Typography>
        )}
      </XStack>
    </AnimatedPressable>
  )
}
